/* Daily Bee's driver for the bot harness (tests/games-bots.mjs): T1 (a random guesser earns 0), T2, T6.
   One round is one day's word. The day is made fresh for each bot (the day's record on the child is
   cleared, exactly as midnight clears it), so the random bot and the perfect bot each get a whole round.
   The ORACLE is the day's word from the child's record — never read off the screen, which never shows it
   before the end (tests/daily-bee.cjs). Typed on the real keyboard; tests/daily-bee.cjs covers the keys. */
export default {
  key: 'dailyBee', kind: 'type', secs: 40, maxSteps: 6,
  async start(pg) {
    await pg.evaluate(() => { const c = active(); if (c.dbee) c.dbee.day = ''; app.openDailyBee(); });
    await pg.waitForFunction(() => !!document.querySelector('#db-host .db-grid') && !!(active().dbee && active().dbee.word), null, { timeout: 60000 });
  },
  async read(pg) { return pg.evaluate(() => { const D = active().dbee || {}; return { target: D.word || '', done: !!D.over }; }); },
  async answer(pg, text) { for (const ch of String(text)) await pg.keyboard.press(ch); await pg.keyboard.press('Enter'); },
  async result(pg) {
    await pg.waitForFunction(() => !!document.querySelector('#db-end'), null, { timeout: 8000 }).catch(() => {});
    return pg.evaluate(() => { const D = active().dbee || {}; return { right: D.won ? 1 : 0, asked: 1, card: '#db-end' }; });
  },
  async stop(pg) { await pg.evaluate(() => app.openGames()); }
};
