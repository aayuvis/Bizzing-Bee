/* Word Lore and Hive Mind drivers for the bot harness (tests/games-bots.mjs) — one file per mode
   (lore-<mode>.mjs, hive-<mode>.mjs) calls hubDriver. No default export here, so the harness skips it.
   The oracle is the round's own state (state.qz: the question's answer index, the word Origins asks
   for) — never the screen. A held miss or a pending right answer is continued after each answer, so
   the next read is the next question. Timed rounds are ended by the driver (SB_QHUB.finish) when the
   harness's time is up, so the finish card is always there to be read (T6). */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { until } = require('../lib/wait.cjs');
export function hubDriver(hub, mode) {
  const typed = mode === 'origins';
  /* four options: a guess wins one in four (chance, for T2) — except Origins (typed) and the Ladder, scored by its climb */
  /* the clock (road to 4.5, P1.20): played to the end of ITS sixty seconds, a bot spending PACE game seconds on each
     question (taken off the game's clock before it answers), the random bot over EIGHT minutes — one minute is about
     seven guesses, so its share of a perfect minute swings ±6 points; eight average it to about ±2 — so T2b measures
     what the clock counts (first-try rights) against what the perfect bot gets in the same minute. The fixed rounds
     play FOUR random rounds (13 Oct 2026): one round of ten put T2's two-standard-error ceiling at 52%, so a seeded
     page whose draws P3 shifted landed lore/idioms on a 6-of-10 tail (a 2% event) and failed every run; forty answers
     put the ceiling near 39% and say something. T1 still reads the product's rule ("6 of 10 pays") per round, summed —
     the random bot earned 0 coins in all forty answers of every fixed mode. Never a moved ceiling, a bigger sample.
     The CLOCKS play SIXTEEN (13 Oct 2026): a minute's sample depends on the machine's pace, so a loaded full run drew
     Lore's clock to 25/62 (40%) while the same build alone gave 14/49 every time — every question has four options and
     the answer slots are spread (probed: 17/11/9/11 of 48), so it was a tail, not a leak. Sixteen rounds (~100 asked)
     hold the ceiling near 34%: Hive 27/104, Lore 16/92, 0 coins in ~200 answers each. */
  const clock = mode === 'clock', PACE = 3;
  return { key: hub + '/' + mode, kind: typed ? 'type' : 'choice', chance: typed || mode === 'ladder' ? undefined : 0.25, level: 'easy',
    clock, pace: clock ? PACE : undefined, randomRounds: clock ? 16 : 4,
    secs: clock ? 120 : mode === 'ladder' ? 30 : 45, maxSteps: clock ? 160 : 60,
    async start(pg, { level }) {
      /* everything a round's draw waits on, in BEFORE it is opened — so the opener and Start draw synchronously, right
         after the harness's __botReseed, with no frame between (games-bots.mjs, "THE PAGE IS RESEEDED") */
      await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['quizhubs', 'arcade', 'sents', 'fig', 'lore'], r)));
      await pg.evaluate(() => Promise.all([1, 2, 3, 4, 5].map((lv) => new Promise((r) => ttNeed(lv, r)))));
      await pg.evaluate(([h, m, l]) => { state.screen = 'app'; try { SB_LEVEL.set(h + '/' + m, l || 'easy'); } catch (e) {}
        try { window.__botReseed && __botReseed(); } catch (e) {} (h === 'lore' ? app.openLore : app.openHive)(m); }, [hub, mode, level]);
      await until(pg, (m) => !!(window.SB_QHUB && state.qz && state.qz.mode === m && state.qz.phase !== 'loading'), mode, 45000);
      /* the clock's starting seconds, kept on the clock the round makes (the kit's own SGUI.clock, wrapped once) */
      await pg.evaluate(() => { if (window.SGUI && SGUI.clock && !SGUI.clock.__bot) { const k = SGUI.clock;
          SGUI.clock = Object.assign(function (secs, o) { const c = k(secs, o); c.secs0 = +secs; return c; }, { __bot: 1 }); }
        if (state.qz.phase === 'intro') { try { window.__botReseed && __botReseed(); } catch (e) {} app.qzBegin(); } });
      await until(pg, () => /^(play|done|empty)$/.test(state.qz.phase), null, 20000);
      if (clock) await pg.evaluate(() => { const g = state.qz; if (g && g.phase === 'play' && g.clock) { g.clock.hold(true); g.bud = g.clock.secs0 || g.clock.left(); } }); },
    async read(pg) {
      return pg.evaluate((typed) => { const g = state.qz; if (!g || g.phase !== 'play' || g.botDone) return { done: true };   // botDone: the bot's minute is spent (answer)
        if (g.mode === 'squares' && g.sel == null) { const i = g.cells.findIndex((c) => !c.st); if (i < 0) return { done: true }; app.qzCell(i); }
        const q = SB_QHUB._cur(); if (!q) return { done: true };
        if (typed) { if (q.stage === 'pick') app.qzPick(0);   /* the language is not what pays; the spelling is */
          const q2 = SB_QHUB._cur(); return q2 && q2.stage === 'type' ? { target: q2.word.w } : { done: false }; }
        return { options: q.opts.slice(), answer: q.ans }; }, typed); },
    async answer(pg, v) {
      await pg.evaluate(([v, typed, pace]) => { const g = state.qz; if (!g || g.phase !== 'play') return;
        /* A CLOCK IS PLAYED ON THE BOT'S TIME, NEVER THE MACHINE'S (15 Oct 2026, full run 17). The clock is held between
           answers, and each answer sets it to exactly what the bot has spent: PACE seconds a question and the game's own
           2 s a miss (read back after the pick). It used to take PACE off a clock that ALSO ran in real time between
           answers — the 350 ms the harness waits, every evaluate, a loaded machine's slow frames — so how many questions
           fit in the minute depended on the machine, and so did the sample T2 judges. The last question is the one that
           leaves under 0.05 s (or a miss that empties the clock): it is asked and answered, and the round ends there
           (botDone) — whether the clock's own tick or result() gets to finish it first, the sample is the same. */
        const C = g.clock, left = () => C ? C.left() : g.left / 1000; let end = false;
        if (pace) { try { if (g.bud == null) g.bud = left(); const s = g.bud - pace; end = s <= 0.05;
          if (C) { C.hold(false); C.add(Math.max(0.05, s) - C.left()); } else g.left = Math.max(50, s * 1000); } catch (e) {} }
        if (typed) { app.qzType(String(v)); app.qzSubmit(); } else { const q = SB_QHUB._cur(); let i = +v; if (g.hidden && g.hidden.indexOf(i) >= 0) i = q.ans; app.qzPick(i); }
        if (state.qz === g && g.phase === 'play' && (g.held || g.go || (SB_QHUB._cur() || {}).stage === 'done')) app.qzGo();
        if (pace && state.qz === g && g.phase === 'play') { g.bud = left(); if (end || g.bud < 0.1) g.botDone = 1; else if (C) C.hold(true); } }, [v, typed, clock ? PACE : 0]); },
    async result(pg) {
      await pg.evaluate(() => { const g = state.qz; if (g && g.phase === 'play') SB_QHUB.finish(g); });
      await until(pg, () => state.qz && state.qz.phase === 'done' && !!document.querySelector('.qz-done'), null, 10000);
      /* the Ladder's score is its climb: rungs of twelve (a random first rung is 1 of 12, not 1 of 2) */
      return pg.evaluate(() => { const g = state.qz; return g.mode === 'ladder' ? { right: g.rung, asked: 12, card: '.qz-done' } : { right: g.right, asked: g.asked, card: '.qz-done' }; }); },
    async stop(pg) { await pg.evaluate(() => { try { app.qzBack(); } catch (e) {} }); } };
}
