/* The Bee Halls for the bot harness (tests/games-bots.mjs — T1 the random bot earns 0, T2 under 25% of perfect, T6 the
   finish card is the ledger's change). Batch 3, 15 Oct 2026 — BUILD-halls.md "Left": "no games-bots driver for the halls
   (Mock Bee's driver covers the engine; the halls' pay is held by circuit-halls PAY)". A hall is Mock Bee in a VENUE
   (mockbee.js `app.mbOpen({venue, family, seed, replay})`): its own field, its headliners, its scripted outcomes, and
   Mock Bee's pay to the coin — an answer coin a word right, the contest event on the podium at 70% merit, nothing for
   finishing — so the harness's three checks are asked of the halls in a real page, as they are of the plain bee.
   One file per hall played (hall-<act>.mjs calls hallDriver): the first, the middle and the last of the season.
   Like Mock Bee's driver, a hall is played at the pace Watch the rest uses for the rivals (g.speed — the pauses, never
   the rules) and moved on the way a child would (Continue after a miss, Finish now when out). The ORACLE is the bee's own
   word for the child's turn (state.mb.word), never the screen. The hall's seed is FIXED per hall (a hall opened without
   one seeds itself from the time — a different bee every run), and the page's generator is restarted in the same step as
   Start, so a hall is the same hall on every run (games-bots.mjs, "THE PAGE IS RESEEDED").                         */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { until } = require('../lib/wait.cjs');
export function hallDriver(act) {
  let h = 2166136261; for (const ch of 'hall/' + act) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const SEED = h >>> 0;
  return { key: 'hall/' + act, kind: 'type', level: 'medium', secs: 180, maxSteps: 60,
    async start(pg, { level }) {
      await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['mockbee', 'arcade'], r)));
      await pg.evaluate(([act, seed, level]) => { state.screen = 'app'; try { SB_LEVEL.set('mockbee', level); } catch (e) {} app.mbOpen({ venue: act, family: [], seed }); }, [act, SEED, level]);
      await until(pg, (act) => state.nav === 'mockbee' && state.mb && state.mb.mode === 'venue' && state.mb.view === 'lobby' && state.mb.circ && state.mb.circ.act === act, act, 15000);
      await pg.evaluate(() => { try { window.__botReseed && __botReseed(); } catch (e) {} app.mbStart(); state.mb.speed = 8; });
      await until(pg, () => state.mb && state.mb.mode === 'venue' && state.mb.view === 'stage', null, 15000);
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
      await until(pg, () => !state.mb || state.mb.view === 'result', null, 90000);
      return pg.evaluate(() => { const g = state.mb; if (!g || !g.mine) return null;
        return { right: g.mine.filter(m => m.ok).length, asked: g.mine.length, card: '.mb-pay' }; });
    },
    async stop(pg) { await pg.evaluate(() => { try { app.mbQuit(); } catch (e) {} }); } };
}
