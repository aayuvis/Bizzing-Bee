/* THE ANALOGIES TAB (owner, 9 Oct 2026: "a separate analogies tab next to the word gym … treat this like word
   atlas … lessons and words based on that lessons … practice sessions leading to mastery of the level" — "mock
   analogy bee … shrinking mock spelling bee banner to half" — "against the clock")

   analogy.js + analogy-data.js (lazy group `analogy`, cut by tools/analogy/build-app.cjs). This holds:
   1. the tab sits right after Word Atlas on the desktop bar and the phone bar (owner, 10 Oct 2026: "Home · Word Atlas ·
      Analogies · Library · Play · My Feed" — the Word Gym is no longer a tab), opens the Analogy Atlas at
      #/analogies, and the first region's road carries its stops and a level check
   2. a stop teaches before it tests: Learn, step by step (the idea → say the link → name one → spot it → the trap →
      build an analogy → try one → ready; the asking steps hold Next) and Meet the words
   3. practice is relation-first: name the link, then answer; keys 1–3 then A–E, and a tap works too
   4. NEVER THE ANSWER IN PLAIN SIGHT: while a question is open, the answer word is not on screen except as
      one of the options; a miss HOLDS with the answer and why the chosen word tempted, until Continue
   5. a check of 7/8 passes the stop and opens the next; the level check opens only when every stop is
      passed; passing it walks the region, and passing again on ANOTHER DAY masters it (one mastery coin)
   6. pay: nothing for a round under 6 right; the clock pays nothing for a guesser
   7. Against the Clock counts down in place and holds while a miss is up
   8. Mock Analogy Bee: its half banner stands beside Mock Spelling Bee in Compete, both one height; its seven seats
      are Mock Bee's own cast — MOCKBEE.rivals(), the same names and the same faces, never the child's own face
      (owner, 10 Oct 2026, P0.9: "Pip, Nova, Rafi… same faces, same names everywhere"); a bee runs to a finish with
      a place, and only a podium pays a contest coin
   9. no console errors anywhere on the way
  10. the Library's Link Finder: a thin full-width banner under the shelf opens #/links — suggestions, a word's links by
      kind, an analogy built from a link that never shows its answer early, walking on by tapping a word
   EVERY PAGE HERE IS OPENED IN TESTER MODE (device key sb_tester): the owner's decision of 10 Oct 2026 — "until all
   three rounds pass: the Analogies tab, the lessons, Mock Analogy Bee … stay behind tester mode" — so this walk is a
   tester's. What a child without it meets (nothing at all) is tests/analogy-gate.cjs.
   Proved by breaking (10 Oct 2026, the cast): the old seven put back (named from the avatar catalogue: "Pixel Pal",
   "Koi", "Bubbly Beaker", the panda sitting as itself) → the cast checks fail.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogies.cjs                              */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };

async function open(b, o) {
  o = o || {};
  const vp = o.vp || { width: 1180, height: 900 }, phone = vp.width < 500;
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
  await ctx.addInitScript(([k]) => { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_tester', '1'); localStorage.setItem('t_seed', '1'); } }, [Object.assign({}, KID, o.kid || {})]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  pg.on('console', m => { if (m.type() === 'error' && !/voice\/w\/|net::ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) errs.push(m.text()); });
  if (o.time) await pg.clock.setFixedTime(o.time);
  await pg.goto(URL + (o.hash || '')); await W.booted(pg);
  return { ctx, pg, errs };
}
const atlas = pg => W.until(pg, () => !!document.querySelector('.anl-board .anl-stop'), null, 30000);
const run = (pg) => pg.evaluate(() => state.anl && state.anl.run);
const coins = pg => pg.evaluate(() => { walletSync(active()); return active().coins || 0; });
/* answer the open question right or wrong, by the keyboard: the answer index is read from state, never the screen */
async function answer(pg, right) {
  const g = await run(pg);
  if (g.phase === 'bridge') { const k = right ? g.bq.ans : (g.bq.ans + 1) % g.bq.lines.length; await pg.keyboard.press(String(k + 1));
    if (!right) { await W.until(pg, () => !!document.querySelector('.anl-miss'), null, 4000); await pg.keyboard.press('Enter'); }
    await W.until(pg, () => state.anl.run.phase === 'pick', null, 4000); }
  const q = (await run(pg)).q; const i = right ? q.ans : (q.ans + 1) % q.opts.length;
  await pg.keyboard.press('ABCDE'[i]);
  if (!right) { await W.until(pg, () => !!document.querySelector('.anl-miss'), null, 4000); }
  return { q, i };
}
async function next(pg) { const before = (await run(pg)).i; await pg.keyboard.press('Enter'); await W.until(pg, (b) => !state.anl.run || state.anl.run.i !== b || state.anl.run.phase === 'done', before, 4000); }
async function round(pg, rights) { const n = (await run(pg)).n;
  for (let i = 0; i < n; i++) { const ok = i < rights; await answer(pg, ok); await next(pg); }
  await W.until(pg, () => state.anl.run && state.anl.run.phase === 'done', null, 6000); }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  try {
    /* 1 — the tab, after Word Atlas, on both bars (owner, 10 Oct 2026: "Home · Word Atlas · Analogies · Library · Play ·
       My Feed" — it stood after Word Gym until the Word Gym became Word Atlas's sub-nav) */
    let { ctx, pg, errs: e1 } = await open(b);
    const desk = await pg.evaluate(() => [...document.querySelectorAll('.sb-topnav [data-act="setNav"]')].map(x => x.getAttribute('data-arg')));
    ok(desk.join() === 'home,trail,analogy,explore,games,feed', `the desktop bar has Analogies right after Word Atlas (${desk.join(' · ')})`);
    await pg.click('.sb-topnav [data-arg="analogy"]'); await atlas(pg);
    ok(await pg.evaluate(() => location.hash) === '#/analogies' || /^#\/analogies/.test(await pg.evaluate(() => location.hash)), 'the tab opens the Analogy Atlas at #/analogies');
    const stops = await pg.evaluate(() => [...document.querySelectorAll('.anl-board .anl-stop')].map(s => ({ chk: s.classList.contains('chk'), locked: s.classList.contains('locked'), w: s.getBoundingClientRect().width, h: s.getBoundingClientRect().height })));
    ok(stops.length >= 4 && stops[stops.length - 1].chk, `the first region's road has ${stops.length - 1} stops and a level check at the end`);
    ok(!stops[0].locked && stops.slice(1).every(s => s.locked), 'only the first stop is open on a first visit; the rest wait their turn');
    ok(stops.every(s => s.w >= 44 && s.h >= 44), 'every stop is at least 44px to tap');
    /* the board wears its region's painting (app-art/anl-<region>.jpg), and the picture actually loads */
    await W.until(pg, () => { const i = document.querySelector('.anl-board .anl-paint img'); return !!i && i.complete; }, null, 15000).catch(() => {});
    ok(await pg.evaluate(() => { const i = document.querySelector('.anl-board .anl-paint img'); return !!i && i.naturalWidth > 0 && /anl-ponds\.jpg/.test(i.src) && document.querySelectorAll('.anl-rtab').length === 4; }), 'the board is its painted map (loaded), with four regions to choose');

    /* 2 — Learn and Meet the words */
    /* Learn is STEP BY STEP (owner, 10 Oct 2026: "the UI is primitive and it's not step by step learning"): one idea a
       screen, word tiles joined by a drawn link, and the asking steps wait for an answer before Next opens */
    await pg.click('.anl-btn[data-arg="learn"]'); await W.until(pg, () => !!document.querySelector('.anl-stepper'), null, 4000);
    const stepOf = () => pg.evaluate(() => { const c = document.querySelector('.anl-stepper'); const nx = document.querySelector('[data-arg="ls:next"]');
      return { k: c.getAttribute('data-step'), n: document.querySelectorAll('.anl-dot').length, tiles: document.querySelectorAll('.anl-stepper .anl-tile').length, next: nx ? !nx.disabled : null, txt: c.innerText }; });
    let ls = await stepOf();
    ok(ls.k === 'idea' && ls.n >= 6 && ls.tiles >= 2 && /Step 1 of/.test(ls.txt), `Learn opens on step 1 of ${ls.n}: the idea, drawn as word tiles joined by a link`);
    ok(/#\/analogies\/.+\/learn/.test(await pg.evaluate(() => location.hash)), 'the lesson has its own address');
    const seenSteps = [ls.k]; let gated = true;
    for (let i = 0; i < 10 && ls.next !== null; i++) {
      if (['say', 'name', 'build', 'try'].includes(ls.k) && ls.next) gated = false;            // an asking step must not open Next before it is answered
      if (ls.k === 'say') await pg.click('[data-arg="ls:say"]');
      if (ls.k === 'name') await pg.keyboard.press('1');
      if (ls.k === 'build') { await pg.click('[data-arg="ls:build"]'); await pg.click('[data-arg="ls:build"]'); }
      if (ls.k === 'try') { await pg.click('[data-arg^="ls:try:"]'); }
      await pg.keyboard.press('ArrowRight'); await W.until(pg, (k) => document.querySelector('.anl-stepper').getAttribute('data-step') !== k, ls.k, 3000);
      ls = await stepOf(); seenSteps.push(ls.k); }
    ok(gated, 'the asking steps (say, name, build, try) hold Next until the child has done them');
    ok(['say', 'name', 'spot', 'trap', 'build', 'try', 'ready'].every((k) => seenSteps.includes(k)) && ls.k === 'ready', 'the steps run idea → say → name → spot → trap → build → try → ready, by keyboard (→, 1–3) and tap: ' + seenSteps.join(' → '));
    ok(!!(await pg.$('.anl-stepper [data-arg="practice"]')) && !!(await pg.$('.anl-stepper [data-arg="words"]')), 'the last step hands on to Meet the words and Start practice');
    await pg.keyboard.press('ArrowLeft'); ok((await stepOf()).k === 'try', '← goes back a step');
    await pg.keyboard.press('ArrowRight'); await W.until(pg, () => document.querySelector('.anl-stepper').getAttribute('data-step') === 'ready', null, 3000);
    await pg.click('.anl-btn[data-arg="words"]'); await W.until(pg, () => document.querySelectorAll('.anl-word').length > 5, null, 4000);
    ok(await pg.evaluate(() => [...document.querySelectorAll('.anl-word')].every(r => r.querySelector('.anl-wd').textContent.trim().length > 3)), 'Meet the words lists the stop\'s words, each with its meaning and a speaker button');

    /* 3 + 4 — practice, relation first; a miss holds */
    await pg.click('.anl-btn[data-arg="practice"]'); await W.until(pg, () => !!(state.anl.run && state.anl.run.q), null, 4000);
    let g = await run(pg);
    ok(g.phase === 'bridge' && g.bq.lines.length === 3, 'practice opens on Step 1: three ways the pair could be linked');
    const leak = await pg.evaluate(() => { const g = state.anl.run; const t = document.querySelector('.anl-run .anl-card').innerText.toLowerCase();
      return t.split(/\s+/).filter(x => x.replace(/[^a-z]/g, '') === g.q.d).length; });
    ok(leak === 0, 'during Step 1 the answer word is nowhere on screen');
    await pg.keyboard.press(String(g.bq.ans + 1)); await W.until(pg, () => state.anl.run.phase === 'pick', null, 4000);
    const leak2 = await pg.evaluate(() => { const g = state.anl.run; const t = document.querySelector('.anl-run .anl-card').innerText.toLowerCase();
      return t.split(/[^a-z]+/).filter(x => x === g.q.d).length; });
    ok(leak2 === 1, 'during Step 2 the answer word appears once — as one of the options, never as a clue');
    const q = (await run(pg)).q; const wrongI = (q.ans + 1) % q.opts.length;
    await pg.click(`.anl-opt[data-arg="pick:${wrongI}"]`);
    await W.until(pg, () => !!document.querySelector('.anl-miss'), null, 4000);
    await pg.waitForTimeout(2600);
    const held = await pg.evaluate(() => ({ miss: !!document.querySelector('.anl-miss'), i: state.anl.run.i, txt: document.querySelector('.anl-miss').innerText }));
    ok(held.miss && held.i === 0 && held.txt.toLowerCase().indexOf(q.d) >= 0 && /goes with|another way|different pair|word family|close/i.test(held.txt), 'a miss (by a tap) holds with the answer, its link and why the chosen word tempted');
    await pg.keyboard.press('Enter'); await W.until(pg, () => state.anl.run.i === 1, null, 4000);
    ok(true, 'Enter continues past a miss');
    for (let i = 1; i < 8; i++) { await answer(pg, i < 5); await next(pg); }
    await W.until(pg, () => state.anl.run && state.anl.run.phase === 'done', null, 6000);
    g = await run(pg);
    ok(g.right === 4 && g.paid === 0, `a practice round of ${g.right}/8 pays nothing (pay starts at the sixth right)`);
    e1.length && errs.push(...e1); await ctx.close();

    /* 5 — check passes the stop; level check, walk, mastery on another day */
    const day1 = new Date(2026, 9, 9, 10, 0, 0), day2 = new Date(2026, 9, 10, 10, 0, 0);
    ({ ctx, pg, errs: e1 } = await open(b, { time: day1, hash: '#/analogies' })); await atlas(pg);
    const c0 = await coins(pg);
    const reg = await pg.evaluate(() => SB_ANALOGY.regions[0]);
    for (let k = 0; k < reg.stops.length; k++) {
      await pg.evaluate((id) => app.anl('stop:' + id), reg.stops[k].id);
      await pg.click('.anl-btn[data-arg="check"]'); await W.until(pg, () => !!(state.anl.run && state.anl.run.q), null, 4000);
      await round(pg, k === 0 ? 6 : 8);
      if (k === 0) { ok(!(await pg.evaluate((id) => (active().anl.stops[id] || {}).pass, reg.stops[0].id)), 'a check of 6/8 does not pass the stop');
        await pg.keyboard.press('Enter'); await W.until(pg, () => state.anl.run && state.anl.run.i === 0 && state.anl.run.phase === 'pick', null, 4000); await round(pg, 7); }
      ok(await pg.evaluate((id) => !!(active().anl.stops[id] || {}).pass, reg.stops[k].id), `stop ${k + 1} (${reg.stops[k].lesson}) passes at ${k === 0 ? '7' : '8'}/8`);
      await pg.evaluate(() => app.anl('map'));
    }
    const chkOpen = await pg.evaluate(() => !document.querySelector('.anl-stop.chk').classList.contains('locked'));
    ok(chkOpen, 'with every stop passed, the level check opens');
    await pg.evaluate((id) => app.anl('stop:' + id + '-check'), reg.id);
    await pg.click('.anl-btn[data-arg="level"]'); await W.until(pg, () => !!(state.anl.run && state.anl.run.q), null, 4000);
    ok((await run(pg)).n === 10 && (await run(pg)).q.opts.length >= 4, 'the level check is ten questions with at least four choices');
    await round(pg, 9);
    const walk = await pg.evaluate((id) => active().anl.regs[id], reg.id);
    ok(!!walk.walk && !walk.mast, 'passing the level check walks the region; it is not yet mastered');
    ok(await pg.evaluate(() => { app.anl('map'); const t = document.querySelectorAll('.anl-rtab')[1]; return !!t && !t.classList.contains('locked'); }), 'the next region opens');
    const seen1 = await pg.evaluate(() => Object.keys(active().anl.seen).length);
    const c1 = await coins(pg);
    ok(c1 > c0, `the day's checks paid answer coins and one contest coin (${c1 - c0} coins)`);
    e1.length && errs.push(...e1);
    /* the same child, the next day: the level check again, on items not seen yesterday */
    const saved = await pg.evaluate(() => JSON.stringify(active()));
    await ctx.close();
    ({ ctx, pg, errs: e1 } = await open(b, { time: day2, hash: '#/analogies', kid: JSON.parse(saved) })); await atlas(pg);
    await pg.evaluate((id) => app.anl('stop:' + id + '-check'), reg.id);
    await pg.click('.anl-btn[data-arg="level"]'); await W.until(pg, () => !!(state.anl.run && state.anl.run.q), null, 4000);
    const ids2 = await pg.evaluate(() => state.anl.run.ids);
    const seenY = await pg.evaluate((ids) => ids.filter(id => (active().anl.seen || {})[id]).length, ids2);
    ok(seenY <= Math.max(0, 10 - (reg.check.length - 10)), `the second level check draws unseen items first (${10 - seenY} of 10 new)`);
    const m0 = await coins(pg);
    await round(pg, 8);
    const reg2 = await pg.evaluate((id) => active().anl.regs[id], reg.id);
    ok(!!reg2.mast, 'passing again on another day masters the level');
    const m1 = await coins(pg);
    ok(m1 - m0 >= 20, `mastery paid its coin (${m1 - m0} coins this round)`);
    e1.length && errs.push(...e1); await ctx.close();

    /* 7 — Against the Clock */
    ({ ctx, pg, errs: e1 } = await open(b, { hash: '#/analogies/clock' }));
    await W.until(pg, () => !!document.querySelector('.anl-btn[data-arg="clockgo"]'), null, 30000);
    await pg.keyboard.press('Enter'); await W.until(pg, () => !!document.getElementById('anl-time'), null, 4000);
    const t0 = await pg.evaluate(() => state.anl.run.left);
    const q2 = (await run(pg)).q; await pg.keyboard.press('ABCDE'[(q2.ans + 1) % q2.opts.length]);
    await W.until(pg, () => !!document.querySelector('.anl-miss'), null, 4000);
    const l1 = await pg.evaluate(() => state.anl.run.left); await pg.waitForTimeout(1500); const l2 = await pg.evaluate(() => state.anl.run.left);
    ok(t0 - l1 >= 1900 && Math.abs(l2 - l1) < 50, `a wrong pick costs two seconds and the clock holds while the miss is up (${Math.round(t0 - l1)}ms, then ${Math.round(l1 - l2)}ms)`);
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(1200);
    const l3 = await pg.evaluate(() => state.anl.run.left);
    ok(l2 - l3 > 900, 'after Continue the clock runs again, in place');
    await pg.evaluate(() => { state.anl.run.left = 50; }); await W.until(pg, () => state.anl.run.phase === 'done', null, 4000);
    ok((await run(pg)).paid === 0, 'a run that ends with one wrong answer pays nothing');
    e1.length && errs.push(...e1); await ctx.close();

    /* 8 — Mock Analogy Bee: the half banners, and a bee to its end */
    ({ ctx, pg, errs: e1 } = await open(b, { hash: '#/play' }));
    await W.until(pg, () => !!document.querySelector('[data-card="mockAnalogy"]'), null, 20000);
    const ban = await pg.evaluate(() => { const r = (k) => document.querySelector(`[data-card="${k}"]`).getBoundingClientRect(); const a = r('mockbee'), m = r('mockAnalogy'); return { a: [a.top, a.width, a.height], m: [m.top, m.width, m.height] }; });
    ok(Math.abs(ban.a[0] - ban.m[0]) < 2 && Math.abs(ban.a[1] - ban.m[1]) < 4 && Math.abs(ban.a[2] - ban.m[2]) < 4, `Mock Spelling Bee and Mock Analogy Bee stand side by side as two half banners (${ban.a.map(Math.round)} vs ${ban.m.map(Math.round)})`);
    await pg.click('[data-card="mockAnalogy"] button'); await W.until(pg, () => !!document.querySelector('.anl-field'), null, 20000);
    ok(/#\/anlbee/.test(await pg.evaluate(() => location.hash)), 'the card opens Mock Analogy Bee at #/anlbee');
    /* the seats are Mock Bee's cast: its names, its faces, and never the child's own (the panda, here) */
    await W.until(pg, () => !!window.MOCKBEE && document.querySelectorAll('.anl-field .anl-rival:not(.me)').length === 7, null, 20000);
    const lobby = await pg.evaluate(() => [...document.querySelectorAll('.anl-field .anl-rival:not(.me) span')].map(x => x.textContent.trim()));
    await pg.keyboard.press('Enter'); await W.until(pg, () => state.anlBee && state.anlBee.phase === 'turn', null, 4000);
    const cast = await pg.evaluate(() => { const mine = active().avatar; const R = MOCKBEE.rivals(mine);
      return { mine, field: state.anlBee.field.map(r => ({ name: r.name, face: r.id, rid: r.rid })), cast: R.map(r => ({ name: r.name, face: r.face, id: r.id })) }; });
    const byName = (n) => cast.cast.find(r => r.name === n);
    ok(cast.field.length === 7 && lobby.length === 7 && cast.field.every(r => !!byName(r.name)) && lobby.join() === cast.field.map(r => r.name).join(),
      `seven seats, every one a Mock Bee speller by Mock Bee's name, in the lobby and on the stage (${lobby.join(', ')})`);
    ok(cast.field.every(r => byName(r.name) && byName(r.name).face === r.face && byName(r.name).id === r.rid), 'each wears the face Mock Bee gives that speller (MOCKBEE.rivals)');
    ok(cast.field.every(r => r.face !== cast.mine) && (!cast.field.some(r => r.rid === cast.mine) || cast.field.some(r => r.rid === cast.mine && r.face !== r.rid)),
      `no rival wears the child's own face (${cast.mine}) — the speller who would, wears their stand-in`);
    let guard = 0;
    while (guard++ < 40) { const bb = await pg.evaluate(() => ({ p: state.anlBee.phase, ans: state.anlBee.q && state.anlBee.q.ans, n: state.anlBee.q && state.anlBee.q.opts.length, r: state.anlBee.round }));
      if (bb.p === 'done') break;
      if (bb.p === 'turn') { const right = bb.r < 4; await pg.keyboard.press('ABCDE'[right ? bb.ans : (bb.ans + 1) % bb.n]); await W.until(pg, () => state.anlBee.phase === 'result', null, 4000); }
      await pg.keyboard.press('Enter'); await W.until(pg, (r) => state.anlBee.phase === 'done' || state.anlBee.round !== r, bb.r, 4000); }
    const end = await pg.evaluate(() => ({ p: state.anlBee.phase, place: state.anlBee.place, coins: state.anlBee.coins, txt: document.querySelector('.anl-page').innerText }));
    ok(end.p === 'done' && end.place >= 1 && end.place <= 8, `the bee runs to a finish (place ${end.place})`);
    ok((end.place <= 3) === (end.coins >= 10), `only a podium pays a contest coin (place ${end.place}, ${end.coins} coins)`);
    e1.length && errs.push(...e1); await ctx.close();

    /* 10 — the Library's Link Finder (owner, 10 Oct 2026: "analogy tool in the library … a full page stretch thin banner
       under the book series"): the banner sits under the shelf, spans it, stays thin, and opens #/links; typing suggests,
       a word shows its links by kind, a link builds an analogy that answers by key, and #/links/<word> opens straight in */
    ({ ctx, pg, errs: e1 } = await open(b, { hash: '#/explore' }));
    await W.until(pg, () => !!document.querySelector('.lib-anlband'), null, 10000);
    const band = await pg.evaluate(() => { const bn = document.querySelector('.lib-anlband').getBoundingClientRect(), sh = document.querySelector('.lib-anlband').previousElementSibling.getBoundingClientRect();
      const grid = document.querySelector('.lib-grid').getBoundingClientRect(); return { h: bn.height, w: bn.width, shW: sh.width, under: bn.top >= sh.bottom - 1, aboveTiles: bn.bottom <= grid.top + 1 }; });
    ok(band.under && band.aboveTiles && Math.abs(band.w - band.shW) < 4 && band.h <= 96, `the Link Finder banner sits under the book shelf, as wide as it (${Math.round(band.w)}px) and thin (${Math.round(band.h)}px)`);
    await pg.click('.lib-anlband'); await W.until(pg, () => !!document.querySelector('.anl-tbox input'), null, 15000);
    ok(/^#\/links$/.test(await pg.evaluate(() => location.hash)) && (await pg.evaluate(() => document.querySelectorAll('.anl-lcard').length)) === 9, 'it opens the Link Finder at #/links, with the nine links to browse');
    await pg.click('.anl-tbox input'); await pg.keyboard.type('bi'); await W.until(pg, () => document.querySelectorAll('.anl-sugs.typed .anl-sug').length > 0, null, 4000);
    const sugs = await pg.evaluate(() => [...document.querySelectorAll('.anl-sugs.typed .anl-sug')].map((x) => x.textContent));
    ok(sugs.length && sugs.every((w) => w.startsWith('bi')) && !(await pg.$('.anl-lcard')), 'typing suggests words that start with what was typed, and nothing else: ' + sugs.slice(0, 4).join(', '));
    await pg.keyboard.press('Enter'); await W.until(pg, () => !!document.querySelector('.anl-wordhead'), null, 4000);
    ok(await pg.evaluate(() => document.querySelectorAll('.anl-lgroup').length >= 1 && document.querySelectorAll('.anl-lrow .anl-tile.me').length >= 1), 'Enter opens the first word: its links, grouped by kind, the word marked in every pair');
    await pg.evaluate(() => { location.hash = '#/links/big'; }); await W.until(pg, () => state.anlTool && state.anlTool.w === 'big' && !!document.querySelector('.anl-wordhead'), null, 6000);
    const bigLinks = await pg.evaluate(() => [...document.querySelectorAll('.anl-lg')].map((x) => x.textContent.trim()));
    ok(bigLinks.length >= 2, '#/links/big opens straight on big: ' + bigLinks.join(' · '));
    await pg.click('[data-arg^="ask:"]'); await W.until(pg, () => !!document.querySelector('.anl-askcard'), null, 4000);
    const askLeak = await pg.evaluate(() => { const q = state.anlTool.ask; return document.querySelector('.anl-askcard .anl-q').innerText.toLowerCase().includes(q.x.b.toLowerCase()); });
    ok(!askLeak, 'the analogy it builds does not show its answer before it is picked');
    const ans = await pg.evaluate(() => state.anlTool.ask.ans); await pg.keyboard.press(String(ans + 1));
    ok(await pg.evaluate(() => state.anlTool.ask.picked === state.anlTool.ask.ans && !!document.querySelector('.anl-askcard .anl-yes')), 'a key picks, and the right pick says the link');
    const w2 = await pg.evaluate(() => { const b0 = document.querySelector('.anl-lrow .anl-tile.go'); return b0 && b0.textContent; });
    await pg.click('.anl-lrow .anl-tile.go'); await W.until(pg, (w) => state.anlTool.w === w, w2, 4000);
    ok(await pg.evaluate((w) => location.hash === '#/links/' + encodeURIComponent(w), w2), `tapping the other word walks on to it (${w2})`);
    e1.length && errs.push(...e1); await ctx.close();

    /* 1b — the phone bar carries the tab too, and nothing spills sideways */
    ({ ctx, pg, errs: e1 } = await open(b, { vp: { width: 390, height: 844 }, hash: '#/analogies' })); await atlas(pg);
    const tabs = await pg.evaluate(() => [...document.querySelectorAll('.sb-tabbar button')].map(x => x.getAttribute('data-arg')));
    ok(tabs.join() === 'home,trail,analogy,explore,games,feed', `the phone bar has the tab after Word Atlas, six in all (${tabs.join(' · ')})`);
    ok(await pg.evaluate(() => document.documentElement.scrollWidth <= 391), 'at 390px nothing spills sideways');
    e1.length && errs.push(...e1); await ctx.close();
  } catch (e) { ok(false, 'the walk ran to its end — ' + (e && e.message)); }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
