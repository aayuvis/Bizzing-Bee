/* ONE VISIBLE LEVEL, AND ONLY RIGHT ANSWERS MOVE IT (FIX-BEE C6, FAMILY-STANDARD §6).

   A child could see five ladders: the Bee Band ("Forager · Level 3"), the bee's evolution
   ("Level 6 · Pupa"), Practice's per-list Stage, the Atlas Tier, and Level on the rank card —
   two of them literally called "Level" and disagreeing. Now ONE thing is "your level":
   oneLevel() — words spelled right anywhere, wearing the bee form for that level. The Bee
   Band stays underneath as WORD DIFFICULTY, the dial that picks words, never called a level.

   This proves:
     • home and the header show one level, and it is oneLevel's — no band, stage or tier
       shown as a rank beside it;
     • right answers move it, one step each;
     • time on the app, coins earned and spent, and luck (caches, wisps, a won race, a
       ladder climbed) never move it, and a wrong answer never moves it down.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/one-level.cjs                       */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');

const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0,
    band: 4, bandSeed: 4, xp: 60, level: 4, lists: { default: { xp: 60 }, journey: { xp: 20 } }, missed: [] }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 950 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_ol_seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_ol_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(3200);
  await pg.evaluate(() => { state.screen = 'app'; app.setNav('home'); });
  await pg.waitForTimeout(1200);

  /* ---- one level on home and in the header ---- */
  const home = await pg.evaluate(() => {
    const parts = [...document.querySelectorAll('header, .sb-hdr, main, #app')].filter(e => e.offsetParent || e.tagName === 'HEADER');
    const t = (document.querySelector('#app') || document.body).innerText;
    const L = oneLevel(); const levels = [...t.matchAll(/\bLevel (\d+)\b/g)].map(m => +m[1]);
    return { L: L.level, label: L.label, levels, meters: document.querySelectorAll('.sb-one-level').length,
      /* Stage (a list's place on Practice's path) and Tier (which pass of the Atlas) are
         POSITIONS on two paths, shown on their own cards — never called a level, never a
         rank. What may not appear is a second RANK: the band shown as a level, a bee form
         counted as one, "your spelling level", or a different Level number. */
      ladders: (t.match(/\b(Bee Band|Band \d|word difficulty \d|form \d+ of 10|spelling level|your rank|Rank \d)\b/gi) || []) }; });
  ok(home.meters === 1, 'home carries exactly one level meter (' + home.meters + ')');
  ok(home.levels.length >= 1 && home.levels.every(n => n === home.L), `every "Level N" on home and in the header is the one level (${home.levels.join(',')} — oneLevel says ${home.L})`);
  ok(!home.ladders.length, 'no second rank beside it — no band, bee form or "spelling level" shown as a level' + (home.ladders.length ? ' — ' + home.ladders.join(', ') : ''));

  /* ---- the level page says the band is NOT a level ---- */
  await pg.evaluate(() => app.setNav('beeband')); await pg.waitForTimeout(600);
  const lp = await pg.evaluate(() => document.body.innerText);
  ok(/Your level/.test(lp) && /Difficulty 4 of 9/.test(lp) && /not a level/i.test(lp), 'the level page shows the one level, with word difficulty underneath and named as not a level');

  /* ---- what moves it, and what never does ---- */
  const r = await pg.evaluate(async () => { const c = active(); const xp = () => oneLevel(c).xp; const out = {};
    let x0 = xp();
    // time on the app: the daily-target clock ticking for twenty minutes
    for (let i = 0; i < 240; i++) { try { metricTick(); } catch (e) {} }
    out.time = xp() - x0; x0 = xp();
    // coins: earned and spent
    addCoins('mastery'); addCoins('contest'); addCoins('stop'); spendCoins(5, 'test');
    out.coins = xp() - x0; x0 = xp();
    // luck: a cache, a word-wisp, a seeded poke, a won arcade race, a quiz ladder topped
    try { app.trailTre('meadow:1'); } catch (e) {} state.treG = null;
    try { app.uWisp(); } catch (e) {}
    try { app.mwPoke && app.mwPoke(0); } catch (e) {}
    try { const g = { k: 'beeGrandPrix', n: 'Bee Grand Prix', _e0: earnedSoFar() }; window._arcEl = window._arcEl || null; arcadeResult(g, { win: true, score: 900 }); } catch (e) {}
    try { if (typeof bizzResult === 'function') { window._bizzS = null; } } catch (e) {}
    out.luck = xp() - x0; x0 = xp();
    // a round: three right, two wrong
    app.playGame('buzz'); const g = state.game;
    /* a miss HOLDS until Next since FIX-BEE D3 (batch C) — tap through it as a child would */
    for (let i = 0; i < 5; i++) { const G = state.game; const w = G.list[G.i].w; state.typed = (i % 2 === 1) ? (w + 'q') : w; app.gSubmit();
      await new Promise(r => setTimeout(r, i % 2 === 1 ? 300 : 60)); if (state.game && state.game.fbGo) state.game.fbGo(); await new Promise(r => setTimeout(r, 60)); }
    out.right = state.game.right; out.round = xp() - x0;
    out.label = oneLevel(c).label;
    return out; });
  ok(r.time === 0, 'twenty minutes of the app clock move the level by nothing (' + r.time + ')');
  ok(r.coins === 0, 'earning and spending coins move it by nothing (' + r.coins + ')');
  ok(r.luck === 0, 'a cache, a wisp, a poke and a won race move it by nothing (' + r.luck + ')');
  ok(r.right === 3 && r.round === 3, `three right and two wrong move it exactly three steps (${r.round}) — wrong answers never take one away`);

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
