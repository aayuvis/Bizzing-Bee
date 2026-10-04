/* TYPE BLASTER'S BOT DRIVER (games spec §8 T1/T2, tests/games-bots.mjs). Type Blaster commits the
   WHOLE word and Enter fires (§4.5) — the built-in driver typed the letters and never pressed Enter,
   so a perfect bot blasted nothing. This one types the word and fires, on the real keyboard. The
   oracle is the targeted glitch's word, the one the game SAYS (`_tb.target()`), never read off the
   screen. A miss card is dismissed with Enter, as a child continues. */
export default {
  key: 'typeBlaster', kind: 'type', level: 'easy', secs: 30, maxSteps: 30,
  async start(pg, { level }) {
    await pg.evaluate((level) => { window.SB_DEBUG = true; SB_LEVEL.set('typeBlaster', level); app.arcadePlay('typeBlaster', { opts: {}, fromMenu: true }); }, level);
    await pg.waitForFunction(() => window._tb && _tb.state().started, null, { timeout: 15000 }).catch(() => {});
  },
  async read(pg) {
    const r = await pg.evaluate(() => {
      const end = !!document.querySelector('.arc-play .sg-endcard') || !document.querySelector('.arc-play #arc-host');
      const miss = !!document.querySelector('.arc-play .sg-misswrap');
      const s = window._tb ? _tb.state() : null;
      return { target: s && !s.holding && !miss ? _tb.target() : '', miss, done: end }; });
    if (r.miss) { await pg.waitForTimeout(300); await pg.keyboard.press('Enter'); }
    return r;
  },
  async answer(pg, text) { for (const ch of text) await pg.keyboard.press(ch); await pg.keyboard.press('Enter'); },
  async result(pg) { return pg.evaluate(() => { const s = window._tb && _tb.state(); return s ? { right: s.blasted, asked: s.met } : null; }); },
  async stop(pg) { await pg.evaluate(() => { try { arcadeClose(); } catch (e) {} }); },
};
