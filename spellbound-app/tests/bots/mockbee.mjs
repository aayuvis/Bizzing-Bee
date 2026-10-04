/* The Mock Bee's driver for the bot harness (tests/games-bots.mjs — T1 random earns 0, T2 random
   under 25% of perfect, T6 the finish card is the ledger's change).
   A bee is minutes of hall at a child's pace, so the bot plays it at the speed Watch the rest uses
   for the rivals (g.speed — the hall's pauses, not the rules: the same rounds, the same rivals from
   the same seeded generator, the same pay). The ORACLE is the bee's own word for the child's turn
   (state.mb.word), never the screen. The bot moves the hall on the way a child would: it lets a
   rival spell without writing along, presses Continue after a miss, and when it is out it takes
   Finish now. One round = one whole bee; the result is the bee's own recap (words right ÷ given)
   and its finish card (.mb-pay).                                                                  */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { until } = require('../lib/wait.cjs');
export default {
  key: 'mockbee', kind: 'type', level: 'medium', secs: 180, maxSteps: 60,
  async start(pg, { level }) {
    await pg.evaluate(level => { try { SB_LEVEL.set('mockbee', level); } catch (e) {} location.hash = '#/mockbee'; }, level);
    await until(pg, () => state.nav === 'mockbee' && state.mb && state.mb.view === 'lobby', null, 15000);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));
    await pg.evaluate(() => { app.mbMode('bee'); app.mbStart(); state.mb.speed = 8; });
  },
  async read(pg) {
    return pg.evaluate(() => {
      const g = state.mb; if (!g || g.view === 'result') return { done: true };
      if (!g.watch) g.speed = 8;
      if (g.phase === 'practice') app.mbPracSkip();
      else if (g.hold) app.mbGoOn();
      else if (g.phase === 'outChoice') app.mbFinishNow();
      else if (g.phase === 'pass') app.mbReady();
      const gg = state.mb;
      if (!gg || gg.view === 'result') return { done: true };
      return gg.phase === 'me' && gg.word ? { target: gg.word.w } : {};
    });
  },
  async answer(pg, text) { await pg.evaluate(t => { if (state.mb && state.mb.phase === 'me') { app.mbType(t); app.mbSpell(); } }, text); },
  async result(pg) {
    await until(pg, () => !state.mb || state.mb.view === 'result', null, 60000);
    return pg.evaluate(() => { const g = state.mb; if (!g || !g.mine) return null;
      return { right: g.mine.filter(m => m.ok).length, asked: g.mine.length, card: '.mb-pay' }; });
  },
  async stop(pg) { await pg.evaluate(() => { try { app.mbQuit(); } catch (e) {} }); },
};
