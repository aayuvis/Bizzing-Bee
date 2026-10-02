/* bizzing-wallet.js — Bizzing coins, the one family currency (FAMILY-STANDARD §1).

   CLASSIC-SCRIPT PORT for Bizzing Bee. Ported from the Bizzing_Schedule repo,
   integration/bizzing-wallet.js at commit d42455e (2 Oct 2026). The logic and the
   constants are the drop-in's, line for line; only the module syntax is gone, because
   <script type="module"> does not load over file:// and Bee must run from a folder.
   One fix, marked where it is (the migration line no longer counts toward the daily
   cap). The API is window.BZ_WALLET = { EARN, DAILY_CAP, balance, earn, spend, migrateFrom,
   ledger }. EARN is frozen here so no caller in this app can rewrite an amount — the
   drop-in's own comment says an app cannot override them, and a module export of a
   plain object would have let it.

   Every Bizzing app earns into, and spends from, the same wallet per child. Bizzing
   Finance shows it as the child's income and teaches with it. The Hive pays nothing.

     BZ_WALLET.earn('bee', 'Anaya', 'answer');            // +1, standard amount
     BZ_WALLET.spend('bee', 'Anaya', 40, 'outfit:crown'); // fixed price; false if not enough

   Rules this file enforces (an app cannot override them):
   • Only the standard events pay, at the standard amounts. Nothing pays for time,
     logins, streaks, dice or luck — there is no event for them.
   • 100 coins per app per child per day, at most.
   • No randomness anywhere: spend() takes a fixed price.
   • Never transmitted; no network code exists in this file.

   storage key 'bizzing.wallet' (through Bee's store.js) = { v:1, kids: { "<first name, lower case>":
     { coins, ledger:[{ a, t, n, why }] } } }. Append-only ledger, trimmed to 2,000.
   The family server replaces this key later; the shape stays. */
(function () {
  'use strict';
  const KEY = 'bizzing.wallet';
  const APPS = /^(bee|maths|geography|india|finance)$/;
  const EARN = Object.freeze({ answer: 1, stop: 5, contest: 10, mastery: 20 });
  const DAILY_CAP = 100;
  const MAX = 2000;

  const day = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`; };
  const kidKey = (who) => String(who || '').trim().toLowerCase();

  function load() {
    try { const o = JSON.parse(SB_STORE.getKey(KEY) || 'null'); if (o && o.v === 1 && o.kids) return o; } catch (e) {}
    return { v: 1, kids: {} };
  }
  function save(o) { try { return SB_STORE.setKey(KEY, JSON.stringify(o)); } catch (e) { return false; } }
  function kid(o, who) { const k = kidKey(who); return k ? (o.kids[k] || (o.kids[k] = { coins: 0, ledger: [] })) : null; }

  function balance(who) { const k = load().kids[kidKey(who)]; return k ? k.coins : 0; }

  /* Returns the coins actually paid (0 if the event is unknown or the cap is reached). */
  function earn(app, who, event, now = Date.now()) {
    if (!APPS.test(app) || !(event in EARN)) return 0;
    const o = load(), k = kid(o, who);
    if (!k) return 0;
    /* ONE DEVIATION from d42455e: the 'migrated' line is not earning, so it does not count
       toward the day's cap. In the drop-in it did — a child whose old purse was 100 or more
       could earn nothing at all on the day of the migration. Reported upstream. */
    const today = k.ledger.filter((x) => x.a === app && x.n > 0 && x.why !== 'migrated' && day(x.t) === day(now)).reduce((a, x) => a + x.n, 0);
    const n = Math.min(EARN[event], Math.max(0, DAILY_CAP - today));
    if (!n) return 0;
    k.coins += n;
    k.ledger.push({ a: app, t: now, n, why: event });
    if (k.ledger.length > MAX) k.ledger.splice(0, k.ledger.length - MAX);
    save(o);
    return n;
  }

  /* A fixed-price purchase. Returns true if paid. */
  function spend(app, who, price, why, now = Date.now()) {
    if (!APPS.test(app) || !Number.isInteger(price) || price <= 0) return false;
    const o = load(), k = kid(o, who);
    if (!k || k.coins < price) return false;
    k.coins -= price;
    k.ledger.push({ a: app, t: now, n: -price, why: String(why).slice(0, 60) });
    if (k.ledger.length > MAX) k.ledger.splice(0, k.ledger.length - MAX);
    save(o);
    return true;
  }

  /* One-time 1:1 migration of an app's old currency (Bee coins, India sikke…). */
  function migrateFrom(app, who, amount, now = Date.now()) {
    if (!APPS.test(app) || !Number.isInteger(amount) || amount <= 0) return 0;
    const o = load(), k = kid(o, who);
    if (!k || k.ledger.some((x) => x.a === app && x.why === 'migrated')) return 0;
    k.coins += amount;
    k.ledger.push({ a: app, t: now, n: amount, why: 'migrated' });
    save(o);
    return amount;
  }

  function ledger(who) { const k = load().kids[kidKey(who)]; return k ? k.ledger.slice() : []; }

  window.BZ_WALLET = Object.freeze({ EARN, DAILY_CAP, balance, earn, spend, migrateFrom, ledger });
})();
