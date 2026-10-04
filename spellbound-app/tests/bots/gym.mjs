/* THE SPELLING GYM'S DRIVERS for the bot harness (tests/games-bots.mjs) — T1, T2, T6 in three of its
   typed modes. The oracle is the round's own state (SB_GYM.peek().word), never the screen, which shows
   only the masked meaning. A miss holds on the kit's miss card until Continue; the driver presses it
   (after the card's 250 ms, the way a child would) before it answers again. The full per-mode bots —
   all seven modes, the Squares board, Spot the Error's taps, Word Doctor's diagnosis — live in
   tests/spelling-gym.cjs; these three put the gym under the same harness as every other game. */
const sleep = ms => new Promise(r => setTimeout(r, ms));
function driver(mode, secs) {
  return {
    key: 'gym/' + mode, kind: 'type', level: 'easy', secs, maxSteps: 12,
    async start(pg, { level }) {
      await pg.evaluate(([mode, level]) => new Promise(r => { if (window.SB_LEVEL) SB_LEVEL.set('gym/' + mode, level);
        app.openGym(mode); const t0 = Date.now(); const k = () => { const p = window.SB_GYM && SB_GYM.peek();
          if (p && p.mode === mode && /^(ready|answer)$/.test(p.phase)) r(); else if (Date.now() - t0 > 30000) r(); else setTimeout(k, 50); }; k(); }), [mode, level]);
      const ph = await pg.evaluate(() => SB_GYM.peek().phase);
      if (ph === 'ready') { await pg.click('.gym-root [data-g="start"]'); await pg.waitForFunction(() => SB_GYM.peek().phase === 'answer', null, { timeout: 10000 }).catch(() => {}); }
    },
    async read(pg) {
      for (let i = 0; i < 8; i++) {
        const p = await pg.evaluate(() => SB_GYM.peek());
        if (p.phase === 'miss') { await sleep(300); await pg.keyboard.press('Enter'); await sleep(150); continue; }
        if (p.phase === 'done') return { done: true };
        if (p.phase === 'answer') return { target: p.word };
        await sleep(150);
      }
      return { done: true };
    },
    async answer(pg, text) {
      await pg.evaluate(t => { const i = document.querySelector('.gym-root .gym-in'); if (!i) return; i.value = t;
        i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }, String(text));
    },
    async result(pg) {
      /* a timed round is brought to its end, so the finish card can be read against the ledger (T6) */
      await pg.evaluate(() => { const p = SB_GYM.peek(); if (p.phase !== 'done' && p.left != null) SB_GYM._clock(0.05); });
      await pg.waitForFunction(() => SB_GYM.peek().phase === 'done' || SB_GYM.peek().phase === 'answer', null, { timeout: 8000 }).catch(() => {});
      const p = await pg.evaluate(() => SB_GYM.peek());
      return p.phase === 'done' ? { right: p.right, asked: p.asked, card: '.gym-root .sg-endcard' } : { right: p.right, asked: p.asked };
    },
    async stop(pg) { await pg.evaluate(() => { try { SB_GYM.stop(); app.openGames(); } catch (e) {} }); }
  };
}
/* the harness registers one default export per file: the Warm-up (ten words, untimed) stands for the gym */
export default driver('warmup', 40);
