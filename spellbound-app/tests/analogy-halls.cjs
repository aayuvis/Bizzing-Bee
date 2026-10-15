/* THE REASONING ROUNDS — four Mock Analogy Bee halls on the Analogy Atlas, and Theo's notebook
   (circuit/BEE-CIRCUIT.md §11, build step 9; analogy.js "THE REASONING ROUNDS")

   1  DOORS. Each region board carries a hall pin (Twin Ponds, Orchard Hill, Workshop Valley, Bridge Peaks): a tap
      (phone) or a click (desktop) opens that region's hall, and so does the keyboard — the pin takes focus and Enter
      opens it; the HUD's way back lands on the same board. The hall bar under the board and #/analogies/<region>/hall
      are the same door. A region that is not open has no pin, and a stale tap at its
      hall opens nothing.
   2  THE CAST. Every hall seats seven of Mock Bee's spellers by MOCKBEE.rivals' names and faces: Theo in every hall,
      first, the headliner; Rafi from Workshop Valley on and not before. No seat wears the child's own face — a child
      who wears Theo's face (scopey) meets Theo in his stand-in (robo); one who wears Rafi's meets Rafi in his.
   3  PAY, exactly as the Mock Analogy Bee pays. A perfect speller's hall pays ONE `contest` coin event (the podium) and
      nothing else, and the finish card's coins are the ledger's change (tests/lib/coins.cjs). A seeded random tapper
      (fixed dates, a fixed seed, as tests/games-bots.mjs plays T1) over 208 halls, 52 a region: every hall it finishes
      off the podium pays it NOTHING, a podium pays at most its one contest coin and nothing else is ever paid, and its
      podium rate is held under 8% — a hall that paid for finishing reads 100%.
      WHAT IS NOT ASSERTED, AND WHY: "a random bot earns 0 contest coins" in every hall. Under the bee's own podium rule
      (kept, as the brief asks) it is false about 2.4% of the time — a guesser out in the same round as several rivals is
      tied with them, not behind — so any fixed sample of N halls passes or fails by its seeds, and choosing the seeds
      that pass would prove nothing. Measured 15 Oct 2026 on 1,000 halls: random 2.4% podium; a 70% speller 29.8%. With a
      merit floor of 3 right answers after the warm-up the guesser falls to 0.6% and the 70% speller to 26.1% — the
      owner's call, written up in circuit/BUILD-reasoning.md. (Word Lore's 6-of-10 floor pays a guesser ~2% of rounds.)
   4  OVERLAY. The same scripted child (two stops' checks failing then passing, a region's stops, its level check, the
      next region, the level check again the next day for mastery) is played with the halls on and with them switched
      off (window.SB_ANL_HALLS=false): the analogy record, the wallet, every region board's stops, tabs and stop card,
      and `here()` are byte-identical. Then two halls played and lost move no stop, check, unlock or mastery mark, not
      where the child stands, and not the tab's own seed counter (rec().n: a hall counts its seeds on its own record).
   5  THEO'S NOTEBOOK. No page before a hall is played (no button, the address lands on the map). After a hall round the
      finish screen's main button (Enter) opens "Theo's notebook — <region>" at #/analogies/<region>/notebook, and the
      board keeps a "Theo's notebook" button. EVERY text on a page is the fixed frame (the title, the four Learn labels)
      or the region's own lessons quoted VERBATIM from analogy-data.js (each sentence of the idea, how to spot it and the
      trap; the title; the stem words) — or the lesson's own bridge template filled with its own stem pair; and every
      one of the region's lessons is there, whole, in stop order. Tapping "Hear it" speaks exactly those sentences on
      the device voice — no Audio element, no mp3 fetched. → / ← turn the kept pages; the address reopens a kept page.
   6  NO ANSWER IN PLAIN SIGHT. On every hall turn the answer word is on the screen once (as its option) and is not in
      the announced prompt.
   7  THE GATE. With the release line false and no tester mode, a stale tap at a hall or a notebook lands on Home and
      opens nothing; tester mode opens it (the same anlOpen() as the tab).
   8  PER CHILD, AND ?demo. A hall kept by one child is not the other's; ?demo plays a hall in its sandbox and the
      device's real household is byte-identical afterwards.
   Proved by breaking (15 Oct 2026; each break a scratch root of symlinks with ONE file — analogy.js — replaced, the tree
   untouched, the test run with SB_ROOT on it and watched to fail; the counts are the FAIL lines):
     · hallSeats leaving Rafi out everywhere (need [THEO], bar [RAFI]) → 2 fail (Workshop Valley, Bridge Peaks);
     · hallSeats seating Rafi everywhere (need [THEO, RAFI], no bar) → 2 fail (Twin Ponds, Orchard Hill);
     · hallSeats seating the speller's own id instead of Mock Bee's face (r.id for r.face) → 10 fail (a child wearing
       Theo's face, all four halls, twice each; one wearing Rafi's, in the two halls he sits in);
     · beeFinish paying `contest` at ANY finish of a hall (podium || b.hall) → 1 fails (9 halls off the podium paid);
     · stopOpen asking for the hall before the level check (&& hallGet(r.id).done, halls on) → 3 fail (day one, day two,
       "a hall played moves nothing");
     · hallStart also counting on the tab's own seed counter (rec().n++) → 1 fails ("…nor the tab's own seed counter");
     · the notebook adding a line of its own ("Theo says / Ask what links them.") → 12 fail (verbatim, completeness, and
       what "Hear it" speaks no longer the page's sentences);
     · the notebook quoting lessons.json's draft trap for "same" instead of the reviewed analogy-data.js text → 6 fail
       (Twin Ponds, Orchard Hill, Bridge Peaks: verbatim and completeness);
     · the notebook dropping the trap → 4 fail (completeness, all four pages);
     · noteSay speaking the lesson as ONE utterance → 4 fail (every lesson's "Hear it");
     · the hall's title naming the turn's answer → 5 fail (every hall's turns, and the guesser's);
     · openHall without its gate, and hallsOn() not asking it → 1 fails (§7).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogy-halls.cjs                                         */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const REGIONS = ['ponds', 'orchard', 'workshop', 'peaks'];
const WALKED = { stops: {}, regs: { ponds: { walk: '2026-10-1' }, orchard: { walk: '2026-10-1' }, workshop: { walk: '2026-10-1' } }, seen: {}, bee: {}, n: 0 };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };
const kid = (o) => Object.assign(JSON.parse(JSON.stringify(KID)), o || {});
const DAY1 = new Date(2026, 9, 9, 10, 0, 0), DAY2 = new Date(2026, 9, 10, 10, 0, 0), DAY3 = new Date(2026, 9, 11, 10, 0, 0);

async function open(b, o) {
  o = o || {};
  const vp = o.vp || { width: 1280, height: 800 }, phone = vp.width < 500;
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
  await ctx.addInitScript(([kids, cfg]) => {
    if (!localStorage.getItem('t_seed')) {
      if (cfg.real) { for (const k in cfg.real) localStorage.setItem(k, cfg.real[k]); }
      else localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: kids }));
      localStorage.setItem('sb_splash', '0'); if (cfg.tester) localStorage.setItem('sb_tester', '1'); localStorage.setItem('t_seed', '1'); }
    if (cfg.halls === false) window.SB_ANL_HALLS = false;
    if (cfg.closed) Object.defineProperty(window, 'SB_ANL_RELEASED', { get: () => false, set: () => {}, configurable: true });
    if (cfg.real) { try { const raw = {}; for (const k in cfg.real) raw[k] = Storage.prototype.getItem.call(window.localStorage, k); window.__raw = raw; } catch (e) {} }
    /* the device voice, heard: every utterance is recorded; an Audio element would be a recording */
    window.__said = []; window.__audio = [];
    try { const ss = window.speechSynthesis; ss.speak = (u) => { window.__said.push(u && u.text); }; ss.cancel = () => {}; } catch (e) {}
    try { const A0 = window.Audio; window.Audio = function (src) { window.__audio.push(String(src || '')); return new A0(src); }; window.Audio.prototype = A0.prototype; } catch (e) {}
  }, [o.kids || [kid(o.kid)], { halls: o.halls, closed: o.closed, tester: o.tester, real: o.real }]);
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/voice\/w\/|net::ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  const mp3 = []; pg.on('request', r => { if (/\.mp3(\?|$)/.test(r.url())) mp3.push(r.url()); });
  if (o.time) await pg.clock.setFixedTime(o.time);
  await pg.goto(URL + (o.q || '') + (o.hash || '')); await W.booted(pg);
  return { ctx, pg, errs, mp3 };
}
const lazy = (pg) => pg.evaluate(() => new Promise(r => SB_LAZY.need(['analogy', 'mockbee', 'saga2'], r)));
const toBoard = (pg, r) => pg.evaluate((r) => app.openAnalogies(r), r).then(() => W.until(pg, (r) => state.nav === 'analogy' && state.anl && state.anl.reg === r && state.anl.v === 'map' && !!document.querySelector('.anl-board .anl-stop'), r, 30000));
const inLobby = (pg, r) => W.until(pg, (r) => state.nav === 'anlbee' && state.anlBee && state.anlBee.hall === r && state.anlBee.phase === 'lobby' && document.querySelectorAll('.sb-stage .anl-lobby .anl-rival').length === 8, r, 30000);
/* in-page players: a seeded random tapper, a perfect speller; every step through the hall's own actions */
async function helpers(pg) {
  await pg.evaluate(() => { let s = 0x2b1f0a; const R = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    window.__T = {
      /* a whole hall; leak: read the screen on every turn before picking */
      hall(r, how, leak) { app.anl('hall:' + r); if (state.anlBee.hall !== r) return null; app.anlBee('start'); const leaks = []; let g = 0;
        while (state.anlBee.phase !== 'done' && g++ < 90) { const b = state.anlBee;
          if (b.phase === 'turn') { const q = b.q;
            if (leak) { const t = document.querySelector('.anl-page').innerText.toLowerCase(), said = (document.querySelector('.anl-q[data-live-prompt]') || {}).getAttribute ? document.querySelector('.anl-q[data-live-prompt]').getAttribute('data-live-prompt').toLowerCase() : '';
              const n = t.split(/[^a-z]+/).filter(x => x === q.d).length; if (n !== 1 || said.split(/[^a-z]+/).includes(q.d)) leaks.push(q.d + ' ×' + n); }
            app.anlBee('pick:' + (how === 'perfect' ? q.ans : Math.floor(R() * q.opts.length))); }
          else app.anlBee('next'); }
        return { place: state.anlBee.place, coins: state.anlBee.coins, phase: state.anlBee.phase, leaks, rounds: state.anlBee.round }; },
      /* one round of the tab: a check or a level check, `rights` right then the rest wrong */
      round(kind, rights) { app.anl(kind); const g0 = state.anl.run; if (!g0 || !g0.q) return null;
        for (let i = 0; i < g0.n; i++) { const q = state.anl.run.q; app.anl('pick:' + (i < rights ? q.ans : (q.ans + 1) % q.opts.length)); app.anl('cont'); }
        return { right: state.anl.run.right, pass: state.anl.run.pass, phase: state.anl.run.phase }; } }; });
}
/* what the tab shows and keeps — everything a hall must never move */
const snapTab = (pg) => pg.evaluate(() => { walletSync(active()); const out = { anl: JSON.parse(JSON.stringify(active().anl || {})), coins: active().coins, here: SB_ANL.here(), boards: {} };
  delete out.anl.halls;
  SB_ANALOGY.regions.forEach((r) => { SB_ANL.openRoute([r.id]);
    out.boards[r.id] = { stops: [...document.querySelectorAll('.anl-board .anl-stop')].map(s => s.className + '|' + s.getAttribute('aria-label') + '|' + s.getAttribute('style')),
      tabs: [...document.querySelectorAll('.anl-rtab')].map(t => t.className + '|' + t.innerText.replace(/\s+/g, ' ')),
      card: ((document.querySelector('.anl-page > .anl-card') || {}).innerText || '').replace(/\s+/g, ' ') }; });
  return out; });
const marksOnly = (s) => JSON.stringify({ stops: s.anl.stops, regs: s.anl.regs, n: s.anl.n, here: s.here, boards: s.boards });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const D = await (async () => { const { ctx, pg } = await open(b, { hash: '#/analogies' }); await lazy(pg);
    const d = await pg.evaluate(() => ({ regions: SB_ANALOGY.regions.map(r => ({ id: r.id, name: r.name, lessons: [...new Set(r.stops.map(s => s.lesson))] })),
      lessons: SB_ANALOGY.lessons.map(l => ({ id: l.id, title: l.title, idea: l.idea, bridge: l.bridge, spot: l.spot, trap: l.trap, stems: l.stems })) }));
    await ctx.close(); return d; })();
  const lessonOf = (id) => D.lessons.find(l => l.id === id);
  const sentences = (t) => String(t || '').split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
  try {
    /* ---------------------------------------------------------------- 1 doors: tap, click, keyboard; a closed region has none */
    for (const vp of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
      const phone = vp.width < 500, T = phone ? 'phone' : 'desktop';
      const { ctx, pg, errs: e1 } = await open(b, { vp, kid: { anl: WALKED }, hash: '#/analogies' }); await lazy(pg);
      for (const r of REGIONS) { const R = D.regions.find(x => x.id === r);
        await toBoard(pg, r);
        const pin = await pg.evaluate((r) => { const p = document.querySelector(`.anl-board .anl-hall[data-arg="hall:${r}"]`), bd = document.querySelector('.anl-board');
          if (!p) return null; const q = p.getBoundingClientRect(), B = bd.getBoundingClientRect();
          return { tag: p.tagName, w: q.width, h: q.height, inside: q.left >= B.left && q.right <= B.right && q.top >= B.top && q.bottom <= B.bottom, n: document.querySelectorAll('.anl-board .anl-hall').length }; }, r);
        ok(!!pin && pin.tag === 'BUTTON' && pin.n === 1 && pin.w >= 44 && pin.h >= 44 && pin.inside, `${T} · ${R.name}: one hall pin on the board, a button ${pin ? Math.round(pin.w) + '×' + Math.round(pin.h) : '—'}px, inside the board`);
        if (phone) await pg.tap('.anl-board .anl-hall'); else await pg.click('.anl-board .anl-hall');
        ok(await inLobby(pg, r), `${T} · ${R.name}: a ${phone ? 'tap' : 'click'} on the pin opens the ${R.name} hall's lobby`);
        const ttl = await pg.evaluate(() => (document.querySelector('.sb-stage .anl-ttl') || {}).textContent || '');
        ok(ttl.includes(R.name + ' Hall'), `${T} · ${R.name}: the stage names the hall ("${ttl.trim()}")`);
        if (phone) await pg.tap('.sb-stage .anl-back'); else await pg.click('.sb-stage .anl-back');
        ok(await W.until(pg, (r) => state.nav === 'analogy' && state.anl.reg === r && !!document.querySelector('.anl-board .anl-hall'), r, 15000), `${T} · ${R.name}: the HUD's way back lands on the ${R.name} board`);
        if (!phone) {
          await pg.focus('.anl-board .anl-hall');
          const focused = await pg.evaluate(() => document.activeElement && document.activeElement.classList.contains('anl-hall'));
          await pg.keyboard.press('Enter');
          ok(focused && await inLobby(pg, r), `${T} · ${R.name}: by keyboard — the pin takes focus and Enter opens the hall`);
          await pg.keyboard.press('Enter'); await W.until(pg, () => state.anlBee.phase === 'turn', null, 5000);
          ok(await pg.evaluate(() => state.anlBee.phase === 'turn' && !!state.anlBee.q), `${T} · ${R.name}: Enter in the lobby takes the stage`);
          await pg.evaluate((r) => app.openAnalogies(r), r); }
      }
      /* the hall bar under the board is the same door, and so is the hall's address */
      await toBoard(pg, 'orchard'); await pg.click('.anl-hallbar .anl-hallgo');
      ok(await inLobby(pg, 'orchard'), `${T}: the hall bar under the board opens the same hall`);
      await pg.evaluate(() => app.setNav('home')); await pg.evaluate(() => { location.hash = '#/analogies/peaks/hall'; });
      ok(await inLobby(pg, 'peaks'), `${T}: #/analogies/peaks/hall opens the Bridge Peaks hall`);
      e1.length && errs.push(...e1.map(x => T + ': ' + x)); await ctx.close();
    }
    { const { ctx, pg, errs: e1 } = await open(b, { hash: '#/analogies' }); await lazy(pg);
      await toBoard(pg, 'ponds');
      const p0 = await pg.evaluate(() => !!document.querySelector('.anl-board .anl-hall[data-arg="hall:ponds"]'));
      await pg.evaluate(() => SB_ANL.openRoute(['orchard'])); await W.until(pg, () => state.anl.reg === 'orchard' && !!document.querySelector('.anl-board'), null, 5000);
      const p1 = await pg.evaluate(() => !!document.querySelector('.anl-board .anl-hall'));
      await pg.evaluate(() => app.anl('hall:orchard'));
      const st = await pg.evaluate(() => ({ nav: state.nav, hall: state.anlBee && state.anlBee.hall }));
      ok(p0 && !p1 && st.nav === 'analogy' && !st.hall, 'a first visit: the open region has its hall; a region not yet open has no pin, and a stale tap at its hall opens nothing');
      e1.length && errs.push(...e1); await ctx.close(); }

    /* ---------------------------------------------------------------- 2 the cast */
    for (const av of ['panda', 'scopey', 'beaker']) {
      const { ctx, pg, errs: e1 } = await open(b, { kid: { anl: WALKED, avatar: av }, hash: '#/analogies' }); await lazy(pg);
      for (const r of REGIONS) { const R = D.regions.find(x => x.id === r), i = REGIONS.indexOf(r);
        await toBoard(pg, r); await pg.click('.anl-board .anl-hall'); await inLobby(pg, r);
        const lob = await pg.evaluate(() => ({ names: [...document.querySelectorAll('.sb-stage .anl-lobby .anl-rival:not(.me) > span')].map(x => x.textContent.trim()),
          head: [...document.querySelectorAll('.sb-stage .anl-lobby .anl-rival.head')].map(x => x.querySelector('span').textContent.trim() + '|' + ((x.querySelector('.anl-headl') || {}).textContent || '')) }));
        await pg.keyboard.press('Enter'); await W.until(pg, () => state.anlBee.phase === 'turn', null, 5000);
        const c = await pg.evaluate(() => { const mine = active().avatar; const R = MOCKBEE.rivals(mine);
          return { mine, field: state.anlBee.field.map(x => ({ name: x.name, face: x.id, rid: x.rid })), cast: R.map(x => ({ name: x.name, face: x.face, id: x.id })) }; });
        const by = (n) => c.cast.find(x => x.name === n);
        const theo = c.cast.find(x => x.id === 'scopey'), rafi = c.cast.find(x => x.id === 'beaker');
        const names = c.field.map(x => x.name);
        if (av === 'panda') {
          ok(c.field.length === 7 && new Set(names).size === 7 && c.field.every(x => by(x.name) && by(x.name).id === x.rid && by(x.name).face === x.face) && lob.names.join() === names.join(),
            `${R.name}: seven seats, every one a Mock Bee speller by Mock Bee's name and face, the same in the lobby and on the stage (${names.join(', ')})`);
          ok(names[0] === theo.name && lob.head.join() === theo.name + '|Headliner', `${R.name}: ${theo.name} is seated first, the headliner`);
          ok(i >= 2 ? names.includes(rafi.name) : !names.includes(rafi.name), `${R.name}: ${rafi.name} ${i >= 2 ? 'is seated (he joins at Workshop Valley)' : 'is not seated yet'}`);
        }
        ok(c.field.every(x => x.face !== c.mine), `${R.name} · a child wearing ${av}: no seat wears the child's own face` + (av === 'scopey' ? ` (Theo wears ${c.field[0].face})` : av === 'beaker' && i >= 2 ? ` (Rafi wears ${(c.field.find(x => x.rid === 'beaker') || {}).face})` : ''));
        if (av === 'scopey') ok(c.field[0].rid === 'scopey' && c.field[0].face === theo.face && theo.face !== 'scopey', `${R.name}: Theo still headlines, in Mock Bee's stand-in face (${theo.face})`);
        await pg.evaluate((r) => app.openAnalogies(r), r); }
      e1.length && errs.push(...e1); await ctx.close();
    }

    /* ---------------------------------------------------------------- 3 pay, and 6 no answer in plain sight */
    { const { ctx, pg, errs: e1 } = await open(b, { kid: { anl: WALKED }, hash: '#/analogies', time: DAY1 }); await lazy(pg); await helpers(pg);
      await toBoard(pg, 'ponds');
      /* a perfect speller: one podium, one contest event, nothing per answer; the card is the ledger. Each paying run has a
         day of its own: the family wallet caps a day at 100 coins (ten podiums), and a capped coin is not a coin withheld */
      let m, got;
      for (const r of REGIONS) { m = await coins.mark(pg);
        const res = await pg.evaluate((r) => __T.hall(r, 'perfect', true), r);
        got = await coins.since(pg, m); const shown = await coins.cardCoins(pg, '.sb-stage .anl-done');
        ok(res.place === 1 && got.events.join() === 'contest', `${r}: a perfect speller wins the hall and is paid one contest coin, nothing per answer (${got.events.join(', ')})`);
        coins.check(ok, `${r} hall`, shown, got);
        ok(!res.leaks.length, `${r}: on every one of ${res.rounds} turns the answer is on screen once, as its option, and not in the prompt` + (res.leaks.length ? ' — ' + res.leaks.join(' ') : '')); }
      /* the seeded random tapper: two halls a region read for leaks on every turn, then fifty a region. A podium may pay
         its one contest coin (the bee's rule, at chance); nothing else is ever paid, and no hall off the podium pays */
      await pg.clock.setFixedTime(DAY2);
      m = await coins.mark(pg); const rnd = [];
      for (const r of REGIONS) for (let k = 0; k < 2; k++) rnd.push(await pg.evaluate((r) => __T.hall(r, 'random', true), r));
      ok(rnd.every(x => x && x.phase === 'done' && !x.leaks.length), 'no answer in plain sight on the random tapper\'s turns' + (rnd.some(x => x && x.leaks.length) ? ': ' + rnd.map(x => x.leaks.join(' ')).join(' ') : ''));
      const offPod = [];
      for (const r of REGIONS) { const ps = await pg.evaluate((r) => { const o = []; for (let k = 0; k < 50; k++) { const b0 = earnedSoFar(); const x = __T.hall(r, 'random', false); o.push([x.place, earnedSoFar() - b0]); } return o; }, r);
        ps.forEach(([pl, c]) => offPod.push({ pl, c })); }
      rnd.forEach(x => offPod.push({ pl: x.place, c: x.coins }));
      got = await coins.since(pg, m);
      const n = offPod.length, pods = offPod.filter(x => x.pl <= 3).length, contest = got.events.filter(x => x === 'contest').length;
      const paidOff = offPod.filter(x => x.pl > 3 && x.c !== 0).length;
      ok(!paidOff && contest <= pods && (!pods || contest >= 1) && got.events.every(x => x === 'contest') && pods / n <= 0.08,
        `a guesser's ${n} halls: ${n - pods} off the podium paid nothing (${paidOff} did); ${pods} on it by chance (${(pods / n * 100).toFixed(1)}%, under 8%), paid ${contest} contest coin(s) and nothing else`);
      const rec = await pg.evaluate(() => ({ halls: active().anl.halls, bee: active().anl.bee }));
      ok(REGIONS.every(r => rec.halls[r] && rec.halls[r].done === 53 && rec.halls[r].best === 1 && rec.halls[r].last >= 1 && rec.halls[r].n === 53) && !rec.bee.played,
        `each hall keeps its own record on the child (c.anl.halls: done, best, last); the Mock Analogy Bee's own record is untouched (${JSON.stringify(rec.halls.ponds)})`);
      e1.length && errs.push(...e1); await ctx.close(); }

    /* ---------------------------------------------------------------- 4 overlay: the halls on and off, the same child */
    const play = async (halls) => { const { ctx, pg, errs: e1 } = await open(b, { halls, hash: '#/analogies', time: DAY1 }); await lazy(pg); await helpers(pg);
      await W.until(pg, () => !!document.querySelector('.anl-board .anl-stop'), null, 30000);
      const pin = await pg.evaluate(() => document.querySelectorAll('.anl-hall,.anl-hallbar').length);
      const log = await pg.evaluate(() => { const L = []; const reg = SB_ANALOGY.regions[0];
        reg.stops.forEach((st, k) => { app.anl('stop:' + st.id); L.push(__T.round('check', k === 0 ? 6 : 8)); if (k === 0) L.push(__T.round('check', 7)); });
        app.anl('stop:' + reg.id + '-check'); L.push(__T.round('level', 9)); app.anl('map');
        const r2 = SB_ANALOGY.regions[1]; SB_ANL.openRoute([r2.id]); app.anl('stop:' + r2.stops[0].id); L.push(__T.round('check', 8)); app.anl('map'); return L; });
      const s1 = await snapTab(pg);
      await pg.clock.setFixedTime(DAY2);
      const log2 = await pg.evaluate(() => { const reg = SB_ANALOGY.regions[0]; SB_ANL.openRoute([reg.id]); app.anl('stop:' + reg.id + '-check'); return __T.round('level', 8); });
      const s2 = await snapTab(pg);
      return { ctx, pg, e1, pin, log, log2, s1, s2 }; };
    { const on = await play(undefined), off = await play(false);
      ok(on.pin === 2 && off.pin === 0, `the halls are drawn when on (${on.pin}) and absent when switched off (${off.pin})`);
      ok(JSON.stringify(on.log.concat([on.log2])) === JSON.stringify(off.log.concat([off.log2])) && on.log2 && on.log2.pass, 'the same scripted child scores the same rounds either way: ' + on.log.map(x => x && x.right).join(' ') + ' · next day ' + (on.log2 || {}).right);
      ok(on.s2.anl.regs.ponds && on.s2.anl.regs.ponds.mast && on.s1.anl.regs.ponds.walk, 'the script walks Twin Ponds on day one and masters it on day two');
      ok(JSON.stringify(on.s1) === JSON.stringify(off.s1), 'day one: the analogy record, the wallet, every board\'s stops, tabs and stop card, and here() are byte-identical with the halls on and off');
      ok(JSON.stringify(on.s2) === JSON.stringify(off.s2), 'day two (mastery): byte-identical again');
      ok(!on.s2.anl.halls && !(await on.pg.evaluate(() => 'halls' in active().anl)), 'a child who never opens a hall carries no hall record at all');
      /* a hall played (and lost) moves no mark the tab keeps */
      const before = marksOnly(await snapTab(on.pg));
      const lost = await on.pg.evaluate(() => { const o = []; for (const r of ['ponds', 'orchard']) o.push(__T.hall(r, 'random', false)); return o; });
      const after = marksOnly(await snapTab(on.pg));
      ok(lost.every(x => x && x.phase === 'done') && before === after, `two halls played (places ${lost.map(x => x && x.place).join(', ')}) move no stop, check, unlock or mastery mark, nor where the child stands, nor the tab's own seed counter`);
      [on, off].forEach(x => x.e1.length && errs.push(...x.e1)); await on.ctx.close(); await off.ctx.close(); }

    /* ---------------------------------------------------------------- 5 Theo's notebook */
    { const { ctx, pg, errs: e1, mp3 } = await open(b, { kid: { anl: WALKED }, hash: '#/analogies', time: DAY1 }); await lazy(pg); await helpers(pg);
      await toBoard(pg, 'ponds');
      ok(!(await pg.$('.anl-nbgo')), 'before a hall is played the board has no notebook');
      await pg.evaluate(() => { location.hash = '#/analogies/ponds/notebook'; });
      ok(await W.until(pg, () => state.nav === 'analogy' && state.anl.v === 'map' && state.anl.reg === 'ponds', null, 8000) && !(await pg.$('.anl-nb')), 'and its address lands on the board: no page is kept yet');
      const pageText = () => pg.evaluate(() => { const nb = document.querySelector('.anl-nb'); if (!nb) return null; const out = []; const tw = document.createTreeWalker(nb, NodeFilter.SHOW_TEXT); let x;
        while ((x = tw.nextNode())) { const t = x.nodeValue.replace(/\s+/g, ' ').trim(); if (t) out.push(t); }
        return { title: ((document.querySelector('.sb-phead h2') || {}).textContent || '').trim(), texts: out, lessons: [...nb.querySelectorAll('.anl-nbl')].map(s => s.getAttribute('data-lesson')),
          dd: [...nb.querySelectorAll('.anl-nbl')].map(s => [...s.querySelectorAll('dd')].map(d => d.textContent.trim())), hash: location.hash }; });
      const FRAME = new Set(['The idea', 'Say the link', 'How to spot it', 'Watch out']);
      const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const fills = (L) => L.stems.map(([a, bb]) => new RegExp('^' + esc(L.bridge).replace(esc('{As}'), esc(a.slice(0, Math.max(2, a.length - 1))) + '[a-z]*').replace(esc('{A}'), '(?:(?:a|an|the) )?' + esc(a)).replace(esc('{B}'), '(?:(?:a|an|the) )?' + esc(bb)) + '$', 'i'));
      async function checkPage(r) { const R = D.regions.find(x => x.id === r), Ls = R.lessons.map(lessonOf); const P = await pageText();
        ok(!!P && P.title === "Theo's notebook — " + R.name && P.hash === '#/analogies/' + r + '/notebook', `${R.name}: the page is "${P && P.title}" at ${P && P.hash}`);
        if (!P) return;
        const DATA = new Set(Ls.flatMap(L => [L.idea, L.spot, L.trap].flatMap(sentences)));
        const words = new Set(Ls.flatMap(L => L.stems.flatMap(s => [s[0], s[1]])));
        const titles = new Set(Ls.map(L => L.title)); const RX = Ls.flatMap(fills);
        const bad = [];
        for (const t of P.texts) { if (FRAME.has(t) || titles.has(t) || words.has(t)) continue;
          for (const s of sentences(t)) if (!DATA.has(s) && !RX.some(rx => rx.test(s))) bad.push(s); }
        ok(!bad.length, `${R.name}: every sentence on the page is the frame or the region's own lessons, verbatim (${P.texts.length} texts)` + (bad.length ? ' — not in the data: ' + bad.slice(0, 3).map(x => '"' + x + '"').join(' ') : ''));
        const whole = P.lessons.join() === R.lessons.join() && Ls.every((L, k) => { const dd = P.dd[k] || []; return dd[0] === L.idea && dd[2] === L.spot && dd[3] === L.trap && fills(L).some(rx => rx.test(dd[1])) && P.texts.includes(L.title); });
        ok(whole, `${R.name}: every lesson of the region, in stop order (${R.lessons.join(', ')}), whole — its title, idea, its bridge said with its own pair, how to spot it, the trap`);
        return P; }
      /* a hall round, then the notebook from its finish screen by Enter */
      await pg.evaluate(() => { app.anl('hall:ponds'); app.anlBee('start'); let g = 0; while (state.anlBee.phase !== 'done' && g++ < 90) { const b = state.anlBee; if (b.phase === 'turn') app.anlBee('pick:' + b.q.ans); else app.anlBee('next'); } render(); });
      const fin = await pg.evaluate(() => { const m = document.querySelector('.sb-stage .sg-st-ctl .anl-btn.main'); return m ? m.innerText.replace(/\s+/g, ' ').trim() + '|' + m.getAttribute('data-arg') : ''; });
      ok(/^Theo's notebook Enter\|note:ponds$/.test(fin), `after the hall round the finish screen's main button is Theo's notebook, with Enter (${fin})`);
      await pg.keyboard.press('Enter');
      ok(await W.until(pg, () => state.nav === 'analogy' && state.anl.v === 'note' && !!document.querySelector('.anl-nb'), null, 8000), 'Enter opens the page');
      const P0 = await checkPage('ponds');
      /* read aloud: exactly the page's sentences for that lesson, on the device voice */
      mp3.length = 0; await pg.evaluate(() => { window.__audio = []; });
      for (const lid of P0 ? P0.lessons : []) { const L = lessonOf(lid), k = P0.lessons.indexOf(lid);
        await pg.evaluate(() => { window.__said = []; });
        await pg.click(`.anl-nbl[data-lesson="${lid}"] .anl-say`);
        const said = await pg.evaluate(() => window.__said.slice());
        const want = [].concat(sentences(L.title), sentences(L.idea), sentences(P0.dd[k][1]), sentences(L.spot), sentences(L.trap));
        ok(JSON.stringify(said) === JSON.stringify(want), `${L.title}: "Hear it" speaks the lesson's ${want.length} sentences, one utterance each, on the device voice` + (JSON.stringify(said) === JSON.stringify(want) ? '' : ' — said ' + JSON.stringify(said).slice(0, 160))); }
      ok(!(await pg.evaluate(() => window.__audio.length)) && !mp3.length, 'no recording is played or fetched for the notebook (no Audio element, no mp3)');
      /* kept: the board has the button; the page reopens from it and from its address */
      await pg.click('.sb-phead [data-act="anl"][data-arg="map"]', { timeout: 5000 });
      ok(await W.until(pg, () => state.anl.v === 'map' && state.anl.reg === 'ponds' && !!document.querySelector('.anl-hallbar .anl-nbgo'), null, 8000), 'back on the Twin Ponds board, the notebook is kept: a "Theo\'s notebook" button');
      await pg.click('.anl-hallbar .anl-nbgo');
      ok(await W.until(pg, () => state.anl.v === 'note' && state.anl.reg === 'ponds', null, 5000), 'the board\'s button opens the page');
      /* the other three halls, a page each */
      for (const r of REGIONS.slice(1)) { await pg.evaluate((r) => { app.anl('hall:' + r); app.anlBee('start'); let g = 0; while (state.anlBee.phase !== 'done' && g++ < 90) { const b = state.anlBee; if (b.phase === 'turn') app.anlBee('pick:' + b.q.ans); else app.anlBee('next'); } app.anl('note:' + r); }, r);
        await W.until(pg, (r) => state.anl.v === 'note' && state.anl.reg === r && !!document.querySelector('.anl-nb'), r, 5000); await checkPage(r); }
      const tabs = await pg.evaluate(() => [...document.querySelectorAll('.anl-nbtabs .anl-rtab')].map(t => t.innerText.trim()));
      ok(tabs.join() === D.regions.map(x => x.name).join(), 'four pages kept, one a hall: ' + tabs.join(' · '));
      await pg.keyboard.press('ArrowLeft'); ok(await W.until(pg, () => state.anl.reg === 'workshop' && state.anl.v === 'note', null, 3000), '← turns back a page');
      await pg.keyboard.press('ArrowRight'); ok(await W.until(pg, () => state.anl.reg === 'peaks' && state.anl.v === 'note', null, 3000), '→ turns forward');
      await pg.evaluate(() => { app.setNav('home'); }); await pg.evaluate(() => { location.hash = '#/analogies/orchard/notebook'; });
      ok(await W.until(pg, () => state.nav === 'analogy' && state.anl.v === 'note' && state.anl.reg === 'orchard' && !!document.querySelector('.anl-nb'), null, 8000), 'a kept page reopens from its address');
      e1.length && errs.push(...e1); await ctx.close(); }

    /* ---------------------------------------------------------------- 7 the gate */
    { const seeded = { anl: Object.assign({}, WALKED, { halls: { ponds: { n: 1, done: 1, best: 2, last: 2 } } }) };
      const { ctx, pg, errs: e1 } = await open(b, { closed: true, kid: seeded });
      await W.until(pg, () => state.screen === 'app', null, 20000);
      await pg.evaluate(() => app.openAnalogies('ponds'));
      const shut = await pg.evaluate(() => ({ open: window.SB_ANL_OPEN(), nav: state.nav }));
      await lazy(pg);
      await pg.evaluate(() => app.anl('hall:ponds')); const a = await pg.evaluate(() => ({ nav: state.nav, hall: state.anlBee && state.anlBee.hall }));
      await pg.evaluate(() => app.anl('note:ponds')); const n2 = await pg.evaluate(() => ({ nav: state.nav, v: state.anl && state.anl.v }));
      ok(!shut.open && shut.nav === 'home' && a.nav === 'home' && !a.hall && n2.nav === 'home', `the release line false, no tester: the tab is shut, and a stale tap at a hall (${a.nav}) or a kept notebook page (${n2.nav}) lands on Home`);
      e1.length && errs.push(...e1); await ctx.close();
      const t = await open(b, { closed: true, tester: true, kid: seeded, hash: '#/analogies/ponds' }); await lazy(t.pg);
      await W.until(t.pg, () => !!document.querySelector('.anl-board .anl-hall'), null, 20000);
      await t.pg.evaluate(() => app.anl('hall:ponds'));
      ok(await inLobby(t.pg, 'ponds'), 'in tester mode (the same anlOpen() as the tab) the hall opens');
      t.errs.length && errs.push(...t.errs); await t.ctx.close(); }

    /* ---------------------------------------------------------------- 8 per child, and ?demo */
    { const { ctx, pg, errs: e1 } = await open(b, { kids: [kid({ anl: WALKED }), kid({ name: 'Ravi', avatar: 'koi', anl: WALKED })], hash: '#/analogies' }); await lazy(pg); await helpers(pg);
      await pg.evaluate(() => __T.hall('ponds', 'perfect', false));
      await pg.evaluate(() => SB_SHELL.switchChild(1)); await W.until(pg, () => active().name === 'Ravi', null, 8000);
      await pg.evaluate(() => app.openAnalogies('ponds')); await W.until(pg, () => state.nav === 'analogy' && !!document.querySelector('.anl-board .anl-hall'), null, 15000);
      const two = await pg.evaluate(() => ({ ravi: (active().anl || {}).halls, nb: !!document.querySelector('.anl-nbgo'), ahana: state.children[0].anl.halls }));
      ok(!two.ravi && !two.nb && two.ahana && two.ahana.ponds.done === 1, "a hall kept by one child is not the other's: Ravi has no hall record and no notebook");
      e1.length && errs.push(...e1); await ctx.close(); }
    { const REAL = { sb_saas_v2: JSON.stringify({ theme: 'aurora', mode: 'dusk', pin: '4321', activeIdx: 0, children: [{ name: 'Zara', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'aurora', coins: 77 }] }) };
      const { ctx, pg, errs: e1 } = await open(b, { real: REAL, q: '?demo' });
      await W.until(pg, () => window.SB_SHELL && SB_SHELL.demo && state.screen === 'app', null, 20000);
      await pg.evaluate(() => app.openAnalogies()); await lazy(pg); await helpers(pg);
      await W.until(pg, () => !!document.querySelector('.anl-board .anl-hall'), null, 20000);
      const d = await pg.evaluate(() => { const o = __T.hall('ponds', 'perfect', false); try { save(); } catch (e) {} return { o, halls: active().anl.halls, name: active().name }; });
      const pg2 = await ctx.newPage(); await pg2.goto('file://' + ROOT + '/privacy.html'); await pg2.waitForTimeout(300);
      const raw = await pg2.evaluate(() => window.__raw);
      ok(d.o && d.o.phase === 'done' && d.halls && d.halls.ponds && raw && raw.sb_saas_v2 === REAL.sb_saas_v2, `?demo: ${d.name} plays a hall and keeps it in the sandbox; the device's real household is byte-identical`);
      e1.length && errs.push(...e1); await ctx.close(); }
  } catch (e) { ok(false, 'the walk ran to its end — ' + (e && e.stack || e)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
