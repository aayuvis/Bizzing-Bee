/* The Analogies' Against the Clock, for the bot harness (road to 4.5, P1.20 — "Quiz clocks (Lore, Hive, Analogies)
   count first-try rights only; random below 15% of perfect"). The tab is behind the analogy gate, so the driver
   opens it as a tester would (tester mode on the device, state.tester). Sixty seconds, four options; the oracle is
   the round's own question (state.anl.run.q.ans), never the screen. Like the hub clocks it is played to the end of
   ITS clock, each answer costing the bot PACE game seconds (taken off run.left before it picks), and the random bot
   plays eight minutes. A held miss is continued at once, so the next read is the next question. */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { until } = require('../lib/wait.cjs');
const PACE = 3;
export default {
  key: 'anl/clock', kind: 'choice', chance: 0.25, clock: true, pace: PACE, randomRounds: 8, secs: 120, maxSteps: 160,
  async start(pg) {
    await pg.evaluate(() => { state.screen = 'app'; state.tester = true; app.openAnalogies('clock'); });
    await until(pg, () => !!(window.SB_ANL && state.nav === 'analogy' && state.anl && state.anl.v === 'clock'), null, 45000);
    await pg.evaluate(() => app.anl('clockgo'));
    await until(pg, () => !!(state.anl.run && state.anl.run.kind === 'clock' && state.anl.run.q), null, 15000); },
  async read(pg) {
    return pg.evaluate(() => { const g = state.anl && state.anl.run; if (!g || g.kind !== 'clock' || g.phase === 'done' || g.phase === 'left') return { done: true };
      if (!g.q) return { done: false }; return { options: g.q.opts.slice(), answer: g.q.ans }; }); },
  async answer(pg, v) {
    await pg.evaluate(([v, pace]) => { const g = state.anl.run; if (!g || g.phase !== 'pick') return;
      if (g.picked == null) { g.left = Math.max(50, g.left - pace * 1000); app.anl('pick:' + (+v)); }
      if (state.anl.run === g && g.phase !== 'done' && (g.held || g.go || g.picked != null)) app.anl('cont'); }, [v, PACE]); },
  async result(pg) {
    await pg.evaluate(() => { const g = state.anl.run; if (g && g.phase !== 'done') g.left = 0; });   // the clock's own tick finishes it
    await until(pg, () => state.anl.run && state.anl.run.phase === 'done' && !!document.querySelector('.anl-page .anl-card'), null, 10000);
    return pg.evaluate(() => { const g = state.anl.run; return { right: g.right, asked: g.asked, card: '.anl-page .anl-card' }; }); },
  async stop(pg) { await pg.evaluate(() => { try { app.anl('map'); state.tester = false; app.setNav('home'); } catch (e) {} }); } };
