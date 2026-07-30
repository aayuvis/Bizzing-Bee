/* pricing.js — Bizzing Bee subscription tiers + entitlements (authoritative config).
   Client-side gating for now; in Phase 2 the active tier becomes the value a
   Stripe/Razorpay webhook writes onto the account. Read entitlements ONLY through
   window.SB_ENT so the source of truth can move server-side without touching callers.

   Tiers (confirmed 2026-07-26):
     Free              $0            500 words · no lists · basic games only
     Beginner Bee      $4.99 / $49.99  10k words · Concepts + Revise + Lists · Train tools LOCKED ·
                                        4 worlds · 5 avatar packs · Saga LOCKED · 400 start coins
     Regional Speller  $9.99 / $99     40k words · ALL worlds/avatars/games · ALL Supercharge ·
                                        Saga UNLOCKED · 1,500 start coins
     + Advanced Pack   +$49/yr add-on  128k library + Advanced Mode coaching (BUILT 2026-07-29).
                                        Sits ON TOP of any tier, including Regional Speller —
                                        no tier grants it, and it cannot be bought with coins.

   Assumptions flagged for confirmation: Beginner keeps 'basic' games (spec unspecified);
   Free = 2 worlds / 0 avatar packs (carried from the old free plan). */
(function () {
  var TIERS = {
    free: {
      id: 'free', name: 'Free', order: 0, priceMo: 0, priceYr: 0, badge: '🐝',
      blurb: 'A real taste — 500 words and the basic games.',
      ent: { words: 500, lists: false, concepts: false, journeys: false, revise: false,
             trainTools: false, games: 'basic', worlds: 2, avatarPacks: 0, saga: false, startCoins: 0 }
    },
    beginner: {
      id: 'beginner', name: 'Beginner Bee', order: 1, priceMo: 4.99, priceYr: 49.99, badge: '🐝✨',
      blurb: '10,000 words, Concepts, Lists and four worlds to explore.',
      ent: { words: 10000, lists: true, concepts: true, journeys: false, revise: true,
             trainTools: false, games: 'basic', worlds: 4, avatarPacks: 5, saga: false, startCoins: 400 }
    },
    regional: {
      id: 'regional', name: 'Regional Speller', order: 2, priceMo: 9.99, priceYr: 99, badge: '👑',
      blurb: 'Everything unlocked — all 40k words, worlds, avatars, games, Supercharge and the Saga.',
      ent: { words: 40000, lists: true, concepts: true, journeys: true, revise: true,
             trainTools: true, games: 'all', worlds: 'all', avatarPacks: 'all', saga: true, startCoins: 1500 }
    }
  };
  var ADDONS = {
    advanced: { id: 'advanced', name: 'Advanced Pack + Coaching', priceYr: 49, built: true,
                blurb: 'The full 128,000-word library, six narrated advanced-concept lessons, mock spelling bees, champion techniques and advanced games.' }
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
    // set the plan on a child (local for now; Stripe writes this in Phase 2). Grants start coins once.
    setTier: function (c, tierId) {
      if (!c || !TIERS[tierId]) return false;
      var prev = c.tier || 'free'; c.tier = tierId;
      // grant the tier's starting coins the first time the child reaches it (top-up to the floor)
      var floor = TIERS[tierId].ent.startCoins || 0;
      if (tierId !== 'free' && floor && (c.coins || 0) < floor && !(c._coinFloor && c._coinFloor[tierId])) {
        c.coins = floor; c._coinFloor = c._coinFloor || {}; c._coinFloor[tierId] = 1;
      }
      return prev !== tierId;
    }
  };
  window.SB_ENT = SB_ENT;
})();
