/* coins.cjs — T6 for every game: THE FINISH CARD'S COINS ARE THE LEDGER'S CHANGE (games spec §1.3, §8).

   A finish card that says "+12" while the wallet moved by 9 (the daily cap, a capped event, a coin
   the copy forgot) teaches a child that the number on the screen is a story. Every game's test can
   take a reading before its round and compare the card with the family ledger after it:

     const coins = require('./lib/coins.cjs');
     const mark = await coins.mark(pg);                 // before the round
     …play the round…
     const r = await coins.since(pg, mark);             // { earned, events:[why…], balance, page }
     const shown = await coins.cardCoins(pg, '.my-finish-card');   // the number the card prints
     coins.check(ok, 'Spelling Gym · Sprint', shown, r);           // one assertion, named

   `earned` is the sum of this app's positive ledger entries since the mark (BZ_WALLET.ledger, the
   one record), `balance` the wallet's change, `page` what app3's earnedSoFar() saw — all three must
   agree with the card. cardCoins reads "+N", "N coins" or "N Bizzing coins" from the card's text
   (pass your own parser as the third argument for anything else); a card that names no coins
   reads as 0, which is right for a round that earned none.                                       */
'use strict';
async function mark(pg) {
  return pg.evaluate(() => { const c = active(); const who = (typeof walletWho === 'function') ? walletWho(c) : c.name;
    return { who, n: BZ_WALLET.ledger(who).length, bal: BZ_WALLET.balance(who), page: (typeof earnedSoFar === 'function') ? earnedSoFar() : 0 }; });
}
async function since(pg, m) {
  return pg.evaluate((m) => { const L = BZ_WALLET.ledger(m.who).slice(m.n).filter(x => x.n > 0 && x.why !== 'migrated');
    return { earned: L.reduce((a, x) => a + x.n, 0), events: L.map(x => x.why), balance: BZ_WALLET.balance(m.who) - m.bal,
      page: ((typeof earnedSoFar === 'function') ? earnedSoFar() : 0) - m.page }; }, m);
}
async function cardCoins(pg, sel, parse) {
  const t = await pg.evaluate((sel) => { const el = typeof sel === 'string' ? document.querySelector(sel) : null; return el ? el.innerText : null; }, sel);
  if (t == null) return null;
  if (parse) return parse(t);
  const m = t.match(/\+\s?(\d+)\s*(?:Bizzing\s+)?(?:coins?\b|🪙)?/i) || t.match(/(\d+)\s+(?:Bizzing\s+)?coins?\b/i);
  return m ? +m[1] : 0;
}
function check(ok, name, shown, r) {
  return ok(shown === r.earned && r.earned === r.balance && r.earned === r.page,
    `${name}: the finish card's coins are the ledger's change — card ${shown}, ledger ${r.earned} (${r.events.join(', ') || 'no events'}), wallet ${r.balance}, page ${r.page}`);
}
module.exports = { mark, since, cardCoins, check };
