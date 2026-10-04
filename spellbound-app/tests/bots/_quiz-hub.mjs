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
  return { key: hub + '/' + mode, kind: typed ? 'type' : 'choice', chance: typed || mode === 'ladder' ? undefined : 0.25, level: 'easy', secs: mode === 'clock' ? 20 : mode === 'ladder' ? 30 : 45, maxSteps: 60,
    async start(pg, { level }) {
      await pg.evaluate(([h, m, l]) => { state.screen = 'app'; try { SB_LEVEL.set(h + '/' + m, l || 'easy'); } catch (e) {} (h === 'lore' ? app.openLore : app.openHive)(m); }, [hub, mode, level]);
      await until(pg, (m) => !!(window.SB_QHUB && state.qz && state.qz.mode === m && state.qz.phase !== 'loading'), mode, 45000);
      await pg.evaluate(() => { if (state.qz.phase === 'intro') app.qzBegin(); });
      await until(pg, () => /^(play|done|empty)$/.test(state.qz.phase), null, 20000); },
    async read(pg) {
      return pg.evaluate((typed) => { const g = state.qz; if (!g || g.phase !== 'play') return { done: true };
        if (g.mode === 'squares' && g.sel == null) { const i = g.cells.findIndex((c) => !c.st); if (i < 0) return { done: true }; app.qzCell(i); }
        const q = SB_QHUB._cur(); if (!q) return { done: true };
        if (typed) { if (q.stage === 'pick') app.qzPick(0);   /* the language is not what pays; the spelling is */
          const q2 = SB_QHUB._cur(); return q2 && q2.stage === 'type' ? { target: q2.word.w } : { done: false }; }
        return { options: q.opts.slice(), answer: q.ans }; }, typed); },
    async answer(pg, v) {
      await pg.evaluate(([v, typed]) => { const g = state.qz; if (!g || g.phase !== 'play') return;
        if (typed) { app.qzType(String(v)); app.qzSubmit(); } else { const q = SB_QHUB._cur(); let i = +v; if (g.hidden && g.hidden.indexOf(i) >= 0) i = q.ans; app.qzPick(i); }
        if (state.qz === g && g.phase === 'play' && (g.held || g.go || (SB_QHUB._cur() || {}).stage === 'done')) app.qzGo(); }, [v, typed]); },
    async result(pg) {
      await pg.evaluate(() => { const g = state.qz; if (g && g.phase === 'play') SB_QHUB.finish(g); });
      await until(pg, () => state.qz && state.qz.phase === 'done' && !!document.querySelector('.qz-done'), null, 10000);
      /* the Ladder's score is its climb: rungs of twelve (a random first rung is 1 of 12, not 1 of 2) */
      return pg.evaluate(() => { const g = state.qz; return g.mode === 'ladder' ? { right: g.rung, asked: 12, card: '.qz-done' } : { right: g.right, asked: g.asked, card: '.qz-done' }; }); },
    async stop(pg) { await pg.evaluate(() => { try { app.qzBack(); } catch (e) {} }); } };
}
