/* Bee Grand Prix's driver for the bot harness (tests/games-bots.mjs, T1/T2/T6).
   The built-in arcade driver waited for the race to say a word and never got one inside 14s: a
   word is said only at a box, and a box needs the kart DRIVEN into it. This one drives — the
   racing line (window._race.steerLine) — brings the next box zone up (gateNow) instead of
   waiting a lap for it, answers each box through the spell(word) hook, and after six boxes sends
   the kart to the flag so the finish card (with its coins, data-gp-coins) is on screen.
   The oracle is the game's own state (the word the box asked), never the screen.             */
const BOXES = 6;
export default {
  key: 'beeGrandPrix', kind: 'type', level: 'medium', secs: 60, maxSteps: 12,
  async start(pg, { level }) {
    await pg.evaluate((level) => { window.SB_DEBUG = true; SB_LEVEL.set('beeGrandPrix', level);
      app.arcadePlay('beeGrandPrix', { opts: { scene: 'meadow', drive: 'medium', kart: 'kart' }, fromMenu: true }); }, level);
    await pg.waitForFunction(() => window._race && window._race.state().mode === 'race', null, { timeout: 30000 });
    await pg.evaluate(() => window._race.steerLine(true));
  },
  async read(pg) {
    return pg.evaluate((BOXES) => { const R = window._race; if (!R) return { done: true };
      if (document.querySelector('.arc-play .sg-endcard') || R.state().over) return { done: true };
      const s = R.state();
      if (s.mode === 'spell' && s.word) return { target: s.word };
      if (s.mode === 'race') { if (s.met >= BOXES) R.jump(9e9); else R.gateNow(); }
      return {}; }, BOXES);
  },
  async answer(pg, text) {
    await pg.evaluate((t) => window._race.spell(t), text);
    /* a miss now holds on the word until Continue: press it, as a child does */
    await pg.waitForTimeout(400);
    await pg.evaluate(() => { const g = document.querySelector('.arc-play .sg-miss-go'); if (g) g.click(); });
  },
  async result(pg) {
    await pg.waitForFunction(() => !!document.querySelector('.arc-play .sg-endcard'), null, { timeout: 20000 }).catch(() => null);
    return pg.evaluate(() => { const r = window._race && window._race.result(); return r ? { right: r.right, asked: r.met, card: '.arc-play .sg-endcard [data-gp-coins]' } : null; });
  },
  async stop(pg) { await pg.evaluate(() => { try { arcadeClose(); } catch (e) {} }); },
};
