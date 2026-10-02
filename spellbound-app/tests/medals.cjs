/* MEDALS FROM EVIDENCE, EACH CELEBRATED ONCE (FIX-BEE I4, FAMILY-STANDARD §8).

   The badge shelf had six medals for days in a row (3 → 100). They are retired, and the
   shelf gained medals for things a child DID with words: Atlas stops finished, traps beaten
   (a word once missed, later spelled right), concepts mastered, words spelled right. This
   test proves, in the running app:
     • each new medal is earned from its evidence and from nothing else;
     • it is celebrated exactly once — a second check, a reload, the same evidence again:
       no second party;
     • days in a row earn nothing: a hundred consecutive days with no evidence add no medal;
     • a medal earned stays earned when the live evidence falls (mastery is re-checked now),
       and a streak medal already earned is KEPT, never re-locked, never shown to anyone else.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/medals.cjs                         */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');
const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

const kid = (over) => Object.assign({ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0,
  xp: 0, level: 1, lists: { default: { xp: 0 }, journey: { xp: 0 } }, missed: [] }, over);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const boot = async (child) => {
    const ctx = await b.newContext({ viewport: { width: 1100, height: 950 } });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_md_seeded')) {
      localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_md_seeded', '1'); } } catch (e) {} },
      { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234', children: [child] });
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(3200);
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('home'); });
    return { pg, ctx, errs };
  };
  const errs = [];

  /* ---- a fresh child: the first check seeds silently, then evidence earns, once ---- */
  const A = await boot(kid({}));
  const step = (fn) => A.pg.evaluate(fn);
  await step(() => { state.celebrate = null; checkNewBadges(); state.celebrate = null; });     // first run: silent seeding
  const before = await step(() => badgeDefs().filter(b => b.done).map(b => b.id));
  ok(!before.some(id => /^(stop|trap)\d/.test(id)), 'a fresh child holds no Atlas or Traps medal');

  // days in a row with no evidence
  const days = await step(() => { const c = active(); c.daysPlayed = []; for (let i = 100; i >= 1; i--) { const d = new Date(); d.setDate(d.getDate() - i);
      c.daysPlayed.push(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')); }
    c.lastActiveDay = c.daysPlayed[c.daysPlayed.length - 1]; c.streak = 99; markActiveToday();
    state.celebrate = null; checkNewBadges(); const cel = state.celebrate; state.celebrate = null;
    return { done: badgeDefs().filter(b => b.done).map(b => b.id), cel: cel && cel.badge && cel.badge.id }; });
  ok(JSON.stringify(days.done) === JSON.stringify(before) && !days.cel, 'a hundred days in a row with no evidence earn nothing (no new medal, no party)');

  // a trap beaten: missed, then spelled right
  const trap = await step(() => { const w = (WORDS || []).find(x => x && x.w) || { w: 'necessary' };
    addMiss(w); state.celebrate = null; checkNewBadges(); const c0 = state.celebrate; clearMiss(w.w);
    state.celebrate = null; checkNewBadges(); const c1 = state.celebrate; state.celebrate = null;
    checkNewBadges(); const c2 = state.celebrate; state.celebrate = null;
    return { missOnly: c0 && c0.badge && c0.badge.id, first: c1 && c1.badge && c1.badge.id, again: c2 && c2.badge && c2.badge.id }; });
  ok(trap.missOnly !== 'trap1', 'missing a word earns nothing');
  ok(trap.first === 'trap1', 'spelling a once-missed word right earns "Trap Spotted" — celebrated (' + trap.first + ')');
  ok(!trap.again, 'checked again, it is not celebrated a second time');

  // an Atlas stop finished (the record the map itself writes)
  const stop = await step(() => { const c = active(); c.trail = c.trail || { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} };
    c.trail.done = c.trail.done || {}; c.trail.done.u1 = { 1: 90 };
    state.celebrate = null; checkNewBadges(); const c1 = state.celebrate; state.celebrate = null;
    checkNewBadges(); const c2 = state.celebrate; state.celebrate = null;
    return { first: c1 && c1.badge && c1.badge.id, again: !!c2, stops: SB_TRAIL_STOPS(c) }; });
  ok(stop.stops === 1 && stop.first === 'stop1', 'finishing an Atlas stop earns "First Stop", once (' + stop.first + ')');
  ok(!stop.again, 'and only once');

  // words spelled right (the karma* ids, kept as storage keys)
  const right = await step(() => { const c = active(); c.lists.default.xp = 100;
    state.celebrate = null; checkNewBadges(); const c1 = state.celebrate; state.celebrate = null;
    /* 100 words right also reaches Level 3 (First Hatch) — two medals in one check; the overlay
       leads with one and counts the rest, and both are recorded once */
    return { fired: !!(c1 && c1.badge), seen: !!(c.badgesSeen || {}).karma100, done: badgeDefs().find(b => b.id === 'karma100').done }; });
  ok(right.done && right.seen && right.fired, '100 words spelled right earns "Hundred Club", celebrated and recorded');

  // reload: nothing celebrates again
  await A.pg.reload(); await A.pg.waitForTimeout(3000);
  const re = await A.pg.evaluate(() => { state.celebrate = null; checkNewBadges(); const c = state.celebrate; state.celebrate = null; return c && c.badge && c.badge.id; });
  ok(!re, 'after a reload, no medal is celebrated a second time');

  // earned stays earned when the evidence falls
  const fall = await A.pg.evaluate(() => { const c = active(); c.trail.done = {}; c.trapsBeaten = {};
    const B = badgeDefs(); return ['stop1', 'trap1'].map(id => (B.find(b => b.id === id) || {}).done); });
  ok(fall.every(Boolean), 'a medal once earned stays earned when the live evidence falls (stop1, trap1)');

  // the shelf: no streak group for a child who never had one
  await A.pg.evaluate(() => { state.collTab = 'badges'; app.openCollection(); }); await A.pg.waitForTimeout(600);
  const shelf = await A.pg.evaluate(() => document.body.innerText);
  ok(/Medals/.test(shelf) && /First Stop/.test(shelf) && /Trap Spotted/.test(shelf), 'the medal shelf shows the evidence medals with what earned them');
  ok(!/Kept from before|3-Day Buzz|Century Flame/.test(shelf), 'a child who never earned a streak medal is never shown one');
  errs.push(...A.errs); await A.ctx.close();

  /* ---- a child who earned streak medals before keeps them, as earned ---- */
  const K = await boot(kid({ streak: 0, streakBest: 14, streakRewards: { 3: 1, 7: 1, 14: 1 }, badgesSeen: { streak3: 1, streak7: 1, streak14: 1 } }));
  await K.pg.evaluate(() => { state.collTab = 'badges'; app.openCollection(); }); await K.pg.waitForTimeout(600);
  const kept = await K.pg.evaluate(() => { const B = badgeDefs(); const t = document.body.innerText;
    return { shown: B.filter(b => b.retired).map(b => b.id + ':' + b.done), text: /Kept from before/.test(t) && /Fortnight Flyer/.test(t), locked: B.some(b => b.retired && !b.done) }; });
  ok(kept.text && JSON.stringify(kept.shown) === JSON.stringify(['streak3:true', 'streak7:true', 'streak14:true']),
    'earned streak medals stay on the shelf as "Kept from before" — ' + kept.shown.join(' '));
  ok(!kept.locked, 'and the unearned ones (30, 60, 100 days) are not shown at all — nothing to chase, nothing re-locked');
  errs.push(...K.errs); await K.ctx.close();

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
