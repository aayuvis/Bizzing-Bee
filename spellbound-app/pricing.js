/* pricing.js — Bizzing Bee subscription tiers + entitlements (authoritative config).
   Client-side gating for now; in Phase 2 the active tier becomes the value a
   Stripe/Razorpay webhook writes onto the account. Read entitlements ONLY through
   window.SB_ENT so the source of truth can move server-side without touching callers.

   Tiers (repriced 2026-08-09):
     Free              $0             500 words · no lists · basic games only
     Beginner Bee      $9.99 / $99    10k words · Concepts + Revise + Lists · Train tools LOCKED ·
                                        4 worlds · 5 avatar packs · Saga LOCKED
     Regional Speller  $19.99 / $199  40k words · ALL worlds/avatars/games · ALL Supercharge ·
                                        Saga UNLOCKED
     + Advanced Pack   +$299/yr add-on   130k library + Advanced Mode coaching (BUILT 2026-07-29).
                                        Sits ON TOP of any tier, including Regional Speller —
                                        no tier grants it, and it cannot be bought with coins.

   THIS FILE IS THE ONLY PLACE A PRICE IS DECIDED. Every screen reads priceMo/priceYr
   off these objects. Four files carry a hardcoded fallback for the add-on price, used
   only when advanced.js has not loaded (app3.js x2, trail.js x2); they track the number
   here and must be moved with it. The prices also appear as PROSE in the FAQ answer and
   in index.html's JSON-LD offers, which no code can derive — grep for the old numbers
   before calling a reprice done.

   The yearly toggle on the landing page says "save 2 months", and that claim has to
   stay true: 9.99x12 = 119.88 against 99, and 19.99x12 = 239.88 against 199, so both
   save just over two months. Change one side of a pair and check the other.

   Assumptions flagged for confirmation: Beginner keeps 'basic' games (spec unspecified);
   Free = 2 worlds / 0 avatar packs (carried from the old free plan).

   WORLDS ARE THE FAMILY ENGINE'S NOW (FIX-BEE v2): worlds 1–2 are free and a paid plan — the
   family plan — opens every world with its avatars (BZ_AVATARS.worldOpen, plan 'family'); a free
   child can open one at a time for 240 earned coins. `worlds`/`avatarPacks` below are the old
   plan shape and nothing on a screen reads them for a count. A blurb names its own word count as
   {words} — app3's tierBlurb() fills it from `ent.words` — so a price page can never disagree
   with the plan it describes (road to 4.5, P0.21). */
(function () {
  var TIERS = {
    free: {
      id: 'free', name: 'Free', order: 0, priceMo: 0, priceYr: 0, badge: '🐝',
      blurb: 'A real taste — {words} words and the basic games.',
      ent: { words: 500, lists: false, concepts: false, journeys: false, revise: false,
             trainTools: false, games: 'basic', worlds: 2, avatarPacks: 0, saga: false,
             books: false, startCoins: 0 }
    },
    beginner: {
      id: 'beginner', name: 'Beginner Bee', order: 1, priceMo: 9.99, priceYr: 99, badge: '🐝✨',
      blurb: '{words} words, Concepts, Lists and every world to explore.',
      ent: { words: 10000, lists: true, concepts: true, journeys: false, revise: true,
             trainTools: false, games: 'basic', worlds: 4, avatarPacks: 5, saga: false,
             books: false, startCoins: 0 }
    },
    regional: {
      id: 'regional', name: 'Regional Speller', order: 2, priceMo: 19.99, priceYr: 199, badge: '👑',
      blurb: 'Everything unlocked — all {words} words, every world, avatar and game, Supercharge and the book series.',
      ent: { words: 40000, lists: true, concepts: true, journeys: true, revise: true,
             trainTools: true, games: 'all', worlds: 'all', avatarPacks: 'all', saga: true,
             books: true, startCoins: 0 }
    }
  };
  var ADDONS = {
    advanced: { id: 'advanced', name: 'Advanced Pack + Coaching', priceYr: 299, built: true,
                blurb: 'The full library of {library} words, six narrated advanced-concept lessons, mock spelling bees, champion techniques and advanced games.' }
  };
  var ORDER = ['free', 'beginner', 'regional'];

  window.SB_TIERS = TIERS;
  window.SB_ADDONS = ADDONS;
  window.SB_TIER_ORDER = ORDER;

  // ---- Entitlement gateway. Callers use SB_ENT.*(); never read c.tier directly. ----
  function activeChild() { try { return (typeof active === 'function') ? active() : null; } catch (e) { return null; } }
  function devOn() { try { return !!(typeof state !== 'undefined' && state.devUnlock); } catch (e) { return false; } }

  var SB_ENT = {
    // current tier id for the active child (dev unlock == top tier)
    tierId: function () {
      if (devOn()) return 'regional';
      var c = activeChild(); var t = c && c.tier;
      return (t && TIERS[t]) ? t : 'free';
    },
    tier: function () { return TIERS[this.tierId()] || TIERS.free; },
    isPaid: function () { return this.tierId() !== 'free'; },
    // does the account own the advanced add-on?
    hasAddon: function (k) { if (devOn()) return true; var c = activeChild(); return !!(c && c.addons && c.addons[k]); },
    // generic named feature check: lists|concepts|journeys|revise|trainTools|saga
    has: function (feature) { return !!this.tier().ent[feature]; },
    // numeric / value entitlements
    wordCap: function () { return this.tier().ent.words; },
    worldLimit: function () { return this.tier().ent.worlds; },          // number | 'all'
    avatarPackLimit: function () { return this.tier().ent.avatarPacks; }, // number | 'all'
    games: function () { return this.tier().ent.games; },                // 'basic' | 'all'
    allGames: function () { return this.tier().ent.games === 'all'; },
    startCoins: function () { return this.tier().ent.startCoins; },
    // cap a word array to the tier's allowance (stable slice from the front of the library)
    capWords: function (arr) { var n = this.wordCap(); return (n && arr && arr.length > n) ? arr.slice(0, n) : arr; },
    // set the plan on a child (local for now; Stripe writes this in Phase 2).
    /* A plan grants CONTENT, never coins (FAMILY-STANDARD §1: "no path from real money to
       coins"). It used to top the purse up to 400 / 1,500 the first time a child reached a
       paid tier — a grown-up's payment turning into a child's spending money. startCoins
       stays in the shape at 0 so old readers get a number. */
    setTier: function (c, tierId) {
      if (!c || !TIERS[tierId]) return false;
      var prev = c.tier || 'free'; c.tier = tierId;
      return prev !== tierId;
    }
  };
  window.SB_ENT = SB_ENT;
})();
