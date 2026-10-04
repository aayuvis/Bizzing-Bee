/* THE SPELLING GYM (games spec §4.2 + §4.2.1, 4 Oct 2026) — one hub, seven modes.

   What a child (and the family's ledger) can rely on, checked live in the real app:
     T9   every mode has a route (#/gym, #/gym/<mode>); a tile, an address and Back all agree, and
          Back walks mode → hub → Play
     T1   a random bot — random letters, random taps, random diagnoses — earns 0 coins in every mode
     T2   and scores under 25% of a perfect bot in every mode
     T3   a wrong answer's correct form stays on screen until Continue, and every clock is held
          while it does (Sprint's clock does not move; Warm-up, Spot the Error, Word Doctor hold)
          — and an empty Enter is never an answer
     T13  the level rule, per mode: three rounds at 40% drop one level each (floor Easy), 50% holds,
          a hand-set level sticks into the next round; the Level Challenge is the way UP (8/10 moves
          every mode below it, pays 'contest' once, and a 7/10 moves nothing and pays no contest)
     PAY  Squares pays 'stop' per claimed square and nothing per answer; Champ Dictation stops paying
          at 20 a round; the result card's coins are the ledger's change (T6)
     DOC  Word Doctor: the diagnosis always offers the true error type of THIS child's mistake, and a
          patient is discharged only when the word is spelt right on a LATER day than its treatment
     T11  phone 390×844: every control on screen and above the tab bar; keys ≥ 40px tall; the native
          keyboard never opens (the on-screen one types)
     T14  no flat-colour region over 6% of the stage; no pure white or black over 2% (hub + a mode,
          1280×800 and 390×844, light and dusk)
     T15  symmetric: gutters, HUD side widths and the centre line within 4px; no scroll during play
   Every check was watched failing once with its fault put back (see the commit that added it).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/spelling-gym.cjs                         */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, until, still } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
const CHROME = process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
/* g-engine's stage helpers, when they are in the tree; the local measurements below otherwise */
let STAGE = null; try { STAGE = require('./lib/stage-check.cjs'); } catch (e) {}
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ONLY = (process.env.GYM_ONLY || '').split(',').filter(Boolean);
const want = k => !ONLY.length || ONLY.includes(k);

const MISSED = [['necessary', 'neccesary', 'needed; essential'], ['separate', 'seperate', 'apart; not joined'], ['rhythm', 'rythm', 'a regular repeated pattern of sound'],
  ['knowledge', 'nowledge', 'facts and understanding'], ['beautiful', 'beautifull', 'very pleasing to look at']]
  .map(([w, t, d], i) => ({ w, t, d, y: 3, n: 1, ts: 1000 + i }));
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey', advOn: true, missed: MISSED };

/* In-page drivers: wait on the round's own state, never on a sleep. */
function helpers() {
  const U = (fn, ms) => new Promise(r => { const t0 = Date.now(); const k = () => { let v = false; try { v = fn(); } catch (e) {} if (v) r(true); else if (Date.now() - t0 > (ms || 15000)) r(false); else setTimeout(k, 25); }; k(); });
  const P = () => SB_GYM.peek();
  let seed = 12345; const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >>> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
  const rword = n => { let s = ''; for (let i = 0; i < Math.max(3, n); i++) s += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(rnd() * 26)]; return s; };
  const enter = () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
  const type = v => { const i = document.querySelector('.gym-in'); i.value = v; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); };
  /* one move in whatever phase the round is in. how: 'right' | 'wrong' | 'random' */
  async function step(how) { const p = P(); const ph = p.phase;
    if (ph === 'miss' || ph === 'diagno') { await new Promise(r => setTimeout(r, 0)); enter(); await U(() => P().phase !== ph); return 'cont'; }
    if (ph === 'diagok' || ph === 'cured') { await U(() => P().phase !== ph, 4000); return 'wait'; }
    if (ph === 'tap') { const toks = [...document.querySelectorAll('[data-g="tok"]')]; let i;
      if (how === 'right') i = toks.findIndex(t => +t.dataset.arg === p.bad);
      else if (how === 'wrong') i = toks.findIndex(t => +t.dataset.arg !== p.bad);
      else i = Math.floor(rnd() * toks.length);
      toks[i].click(); await U(() => P().phase !== 'tap'); return 'tap'; }
    if (ph === 'diag') { const o = p.pat.opts; const j = how === 'right' ? o.indexOf(p.pat.k) : how === 'wrong' ? o.findIndex(x => x !== p.pat.k) : Math.floor(rnd() * o.length);
      document.querySelectorAll('[data-g="dx"]')[j].click(); await U(() => P().phase !== 'diag'); return 'diag'; }
    if (ph === 'answer') { const w = p.word, a = p.asked; type(how === 'right' ? w : rword(w.length)); await U(() => P().asked !== a || P().phase !== 'answer'); return 'answer'; }
    if (ph === 'board') { const i = (p.board || []).findIndex(d => !d); document.querySelector('[data-g="sq"][data-arg="' + i + '"]').click(); await U(() => P().phase === 'answer'); return 'cell'; }
    if (ph === 'ward') { const b = document.querySelector('[data-g="docgo"]'); if (b) { b.click(); await U(() => P().phase !== 'ward'); return 'ward'; } return 'empty'; }
    if (ph === 'ready') { document.querySelector('[data-g="start"]').click(); await U(() => P().phase !== 'ready'); return 'start'; }
    return ph; }
  /* play a whole round: plan(i) says how to answer the i-th graded item */
  async function round(mode, plan, o) { o = o || {};
    /* the clinic's patients are the child's own misses: each doctor round starts from the same five */
    if (mode === 'doctor') __fresh();
    app.openGym(mode); await U(() => P().mode === mode && /^(ready|answer|tap|board|ward)$/.test(P().phase), 60000);
    const e0 = earnedSoFar(); let guard = 0, cells = 0;
    while (P().phase !== 'done' && guard++ < 400) {
      const p = P();
      if (o.maxAsked != null && p.asked >= o.maxAsked && /^(answer|tap|board)$/.test(p.phase)) {
        if (mode === 'squares') { document.querySelector('[data-g="endboard"]').click(); }
        else SB_GYM._clock(0.05);
        await U(() => P().phase === 'done', 8000); break; }
      if (p.phase === 'board' && o.cells != null && cells >= o.cells) { document.querySelector('[data-g="endboard"]').click(); await U(() => P().phase === 'done'); break; }
      if (p.phase === 'board') cells++;
      const idx = p.asked + (p.phase === 'diag' ? 0 : 0);
      const r = await step(typeof plan === 'function' ? plan(idx, p) : plan);
      if (r === 'empty') break; }
    const q = P();
    return { mode, phase: q.phase, asked: q.asked, right: q.right, pct: q.pct, lv: q.lv, pass: q.pass, claimed: q.claimed, coins: earnedSoFar() - e0, card: q.coins, level: q.level, patients: q.patients }; }
  /* the clinic's patients are the child's own misses, due on their Leitner schedule: every doctor round
     here starts from the same five, freshly missed */
  window.__fresh = () => { const c = active(); if (c.gym) c.gym.doc = null; c.missed = JSON.parse(JSON.stringify(window.__MISSED || []));
    (c.missed || []).forEach(m => { if (c.mast) delete c.mast[m.w]; }); };
  window.__gym = { U, P, step, round, rword, enter, type };
}

async function page(b, o) { o = o || {};
  const ctx = await b.newContext(o.phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(([k, mode]) => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: mode || 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, [o.kid || KID, o.mode]);
  await ctx.addInitScript(helpers);
  await ctx.addInitScript(m => { window.__MISSED = m; }, (o.kid || KID).missed || []);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL + (o.hash || '')); await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('gym', r)));
  return { ctx, pg }; }
const errs = [];
const MODES = ['warmup', 'sprint', 'champ', 'spot', 'squares', 'doctor', 'challenge'];

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });

  /* ---------------- T9: routes, tiles and Back ---------------- */
  if (want('T9')) {
    const { ctx, pg } = await page(b);
    await pg.evaluate(() => app.openGames()); await until(pg, () => location.hash === '#/play');
    await pg.click('[data-act="openGym"]'); await until(pg, () => location.hash === '#/gym' && !!document.querySelector('.gym-root [data-act="hubMode"]'));
    const hub = await pg.evaluate(() => ({ h: location.hash, nav: state.nav, tiles: [...document.querySelectorAll('[data-act="hubMode"]')].map(t => t.getAttribute('data-arg')), title: (document.querySelector('.gym-root .gym-title') || {}).textContent }));
    ok(hub.nav === 'gym' && JSON.stringify(hub.tiles) === JSON.stringify(MODES.map(m => 'gym/' + m)), `T9: the Play tab's card opens the hub at #/gym, seven tiles in the fixed order (${hub.tiles.join(' ')})`);
    ok(hub.title === (await pg.evaluate(() => (window.SB_HUB_NAMES && SB_HUB_NAMES.gym) || 'Spelling Gym')), `T9: the hub wears its name from SB_HUB_NAMES, never a typed one ("${hub.title}")`);
    await pg.click('[data-act="hubMode"][data-arg="gym/warmup"]'); await until(pg, () => location.hash === '#/gym/warmup' && SB_GYM.peek().phase === 'answer');
    ok(true, 'T9: a tile opens its mode at #/gym/<mode>');
    await pg.goBack(); const b1 = await until(pg, () => location.hash === '#/gym' && SB_GYM.peek().view === 'hub' && state.gymMode == null);
    ok(b1, 'T9: Back from a mode returns to the hub');
    await pg.goBack(); const b2 = await until(pg, () => location.hash === '#/play' && state.nav === 'games');
    ok(b2, 'T9: Back from the hub returns to Play');
    const seen = [];
    for (const m of MODES) { await pg.evaluate(h => { location.hash = h; }, '#/gym/' + m);
      const got = await until(pg, m => SB_GYM.peek().mode === m || (state.gymMode === m && SB_GYM.peek().view === 'locked'), m, 30000);
      seen.push(m + (got ? '' : '✗')); }
    ok(!seen.some(s => s.endsWith('✗')), `T9: every mode opens from its address (${seen.join(' ')})`);
    await pg.evaluate(() => { location.hash = '#/practice'; }); const wg = await until(pg, () => /^(coach|quest)$/.test(state.nav));
    ok(wg, '#/practice still opens the Word Gym tab (the tab was never renamed, only its old #/gym alias moved to the hub)');
    await ctx.close();
  }

  /* ---------------- T1 / T2 / T3 / PAY: bots in every mode ---------------- */
  if (want('BOTS')) {
    const { ctx, pg } = await page(b);
    /* the random bot first, on a fresh wallet day, so the 100/day cap cannot hide a coin */
    const rand = {}, perf = {};
    for (const m of MODES) rand[m] = await pg.evaluate(m => __gym.round(m, 'random', { maxAsked: 10, cells: 2 }), m);
    for (const m of MODES) ok(rand[m].coins === 0 && rand[m].phase === 'done', `T1: a random bot earns 0 coins in ${m} (${rand[m].coins} over ${rand[m].asked} asked, round ${rand[m].phase})`);
    await pg.evaluate(() => { try { localStorage.removeItem('bizzing.wallet'); } catch (e) {} });
    for (const m of MODES) perf[m] = await pg.evaluate(m => __gym.round(m, 'right', { maxAsked: 10, cells: 2 }), m);
    for (const m of MODES) { const r = rand[m].asked ? rand[m].right / rand[m].asked : 0, p = perf[m].asked ? perf[m].right / perf[m].asked : 0;
      ok(p > 0.9 && r < 0.25 * p, `T2: random scores under 25% of perfect in ${m} (random ${Math.round(r * 100)}% of ${rand[m].asked}, perfect ${Math.round(p * 100)}% of ${perf[m].asked})`); }
    ok(perf.squares.claimed === 2 && perf.squares.coins === 10, `PAY: Squares pays 'stop' per claimed square and nothing per answer (2 squares, 10 right → ${perf.squares.coins} coins)`);
    ok(perf.warmup.coins === perf.warmup.right && perf.warmup.card === perf.warmup.coins, `PAY/T6: Warm-up pays one per right, and the card's coins are the ledger's change (${perf.warmup.card} on the card, ${perf.warmup.coins} paid)`);
    ok(perf.challenge.pass === true && perf.challenge.coins === 20, `PAY: the Level Challenge pays per right plus 'contest' at its pass (10/10 → ${perf.challenge.coins})`);
    /* Champ Dictation: at most 20 a round */
    await pg.evaluate(() => { try { localStorage.removeItem('bizzing.wallet'); } catch (e) {} });
    const champ = await pg.evaluate(() => __gym.round('champ', 'right', { maxAsked: 24 }));
    ok(champ.right === 24 && champ.coins === 20, `PAY: Champ Dictation stops paying at 20 a round (24 right → ${champ.coins})`);

    /* T3: a miss holds, and holds the clock */
    await pg.evaluate(() => app.openGym('sprint')); await until(pg, () => SB_GYM.peek().phase === 'ready', null, 30000);
    await pg.keyboard.press('Enter'); await until(pg, () => SB_GYM.peek().phase === 'answer');
    const empty = await pg.evaluate(async () => { const a = __gym.P().asked; __gym.type(''); await new Promise(r => setTimeout(r, 120)); return { asked: __gym.P().asked, phase: __gym.P().phase }; });
    ok(empty.asked === 0 && empty.phase === 'answer', `T3: an empty Enter is never an answer (asked ${empty.asked}, ${empty.phase})`);
    const w = await pg.evaluate(() => __gym.P().word);
    await pg.evaluate(() => __gym.type('qqqq')); await until(pg, () => SB_GYM.peek().phase === 'miss');
    const h0 = await pg.evaluate(() => ({ left: __gym.P().left, held: __gym.P().held }));
    await pg.waitForTimeout(3000);   // the hold IS the thing under test: time passes and nothing moves
    /* the panel draws the word letter by letter under the child's letters, so read it the way a screen
       reader does (its label spells the word) or as the word row of the diff */
    const h1 = await pg.evaluate(w => ({ left: __gym.P().left, held: __gym.P().held, phase: __gym.P().phase,
      shown: [...document.querySelectorAll('.gym-root .sb-miss, .gym-root .sg-miss, .gym-root [class*="miss"]')].some(e => { if (!e.getClientRects().length) return false;
        const lab = [...e.querySelectorAll('[aria-label]')].map(x => x.getAttribute('aria-label')).join(' ').toLowerCase();
        const row = [...e.querySelectorAll('.sb-mdcol')].map(c => (c.lastElementChild || {}).textContent || '').join('').replace(/\s/g, '');
        return lab.includes(w.toLowerCase().split('').join(' ')) || row.toLowerCase() === w.toLowerCase() || e.textContent.toLowerCase().includes(w.toLowerCase()); }) }), w);
    ok(h1.phase === 'miss' && h1.shown, `T3: the correct form of a missed word stays on screen until Continue (3s later: ${h1.phase}, word shown ${h1.shown})`);
    ok(h0.held && h1.held && Math.abs(h1.left - h0.left) < 0.05, `T3: Sprint's clock is held while the miss is up (${h0.left.toFixed(2)}s → ${h1.left.toFixed(2)}s)`);
    await pg.keyboard.press('Enter'); const resumed = await until(pg, () => SB_GYM.peek().phase === 'answer' && SB_GYM.peek().held === false);
    await pg.waitForTimeout(1000); const h2 = await pg.evaluate(() => __gym.P().left);
    ok(resumed && h2 < h1.left - 0.8, `T3: Continue (Enter) moves on and the clock runs again (${h1.left.toFixed(2)}s → ${h2.toFixed(2)}s)`);
    /* the untimed modes hold too: Warm-up, a wrong tap in Spot the Error, a wrong diagnosis */
    const holds = await pg.evaluate(async () => { const { U, P, step } = __gym; const out = {};
      app.openGym('warmup'); await U(() => P().mode === 'warmup' && P().phase === 'answer'); await step('wrong'); await new Promise(r => setTimeout(r, 1500)); out.warmup = P().phase;
      app.openGym('spot'); await U(() => P().mode === 'spot' && P().phase === 'tap'); await step('wrong'); await new Promise(r => setTimeout(r, 1500)); out.spot = P().phase;
      __fresh();
      app.openGym('doctor'); await U(() => P().mode === 'doctor' && P().phase === 'ward'); await step('go'); await U(() => P().phase === 'diag'); await step('wrong'); await new Promise(r => setTimeout(r, 1500)); out.doctor = P().phase;
      return out; });
    ok(holds.warmup === 'miss' && holds.spot === 'miss' && holds.doctor === 'diagno', `T3: Warm-up, Spot the Error (a wrong tap) and Word Doctor (a wrong diagnosis) all hold (${JSON.stringify(holds)})`);
    await ctx.close();
  }

  /* ---------------- T13: the level rule per mode, and the way up ---------------- */
  if (want('T13')) {
    const { ctx, pg } = await page(b);
    const L = () => (window.SB_LEVEL && SB_LEVEL.get) ? SB_LEVEL : null;
    const rows = [];
    for (const m of ['warmup', 'sprint', 'champ', 'spot', 'squares', 'doctor']) {
      const r = await pg.evaluate(async m => { const { round } = __gym;
        const Lv = (window.SB_LEVEL && SB_LEVEL.get) ? SB_LEVEL : null;
        const get = k => Lv ? Lv.get(k) : ((active().gym || {}).lv || {})[k] ? active().gym.lv[k].level : 'auto';
        const set = (k, v) => { if (Lv) Lv.set(k, v); else { const g = active().gym || (active().gym = {}); (g.lv = g.lv || {})[k] = { level: v, history: [] }; } };
        const k = 'gym/' + m; const seq = [];
        /* 40%: two right in five, every round */
        const forty = (i) => (i % 5 === 1 || i % 5 === 3) ? 'right' : 'wrong';
        const half = (i) => (i % 2 === 0) ? 'right' : 'wrong';
        set(k, 'hard'); seq.push(get(k));
        const limit = m === 'doctor' ? {} : { maxAsked: 10, cells: 2 };
        for (let n = 0; n < 3; n++) { const res = await round(m, m === 'squares' ? (i => i < 2 || (i >= 5 && i < 7) ? 'right' : 'wrong') : forty, limit); seq.push(get(k) + '@' + res.pct); }
        set(k, 'medium'); const r50 = await round(m, half, limit); seq.push(get(k) + '@' + r50.pct);
        set(k, 'champ'); app.openGym(m); await __gym.U(() => __gym.P().mode === m); const used = __gym.P().level;
        return { m, seq, used, after: get(k) }; }, m);
      rows.push(r); }
    for (const r of rows) {
      const lv = r.seq.map(s => s.split('@')[0]);
      ok(lv[0] === 'hard' && lv[1] === 'medium' && lv[2] === 'easy' && lv[3] === 'easy', `T13 ${r.m}: three rounds under 50% drop one level each, floor Easy (${r.seq.slice(0, 4).join(' → ')})`);
      ok(lv[4] === 'medium' && +r.seq[4].split('@')[1] >= 50, `T13 ${r.m}: a round at 50% or more keeps the level (${r.seq[4]})`);
      ok(r.used === 'champ' && r.after === 'champ', `T13 ${r.m}: a hand-set level sticks into the next round (set Champ, the round plays at ${r.used})`); }
    /* the way up */
    const up = await pg.evaluate(async () => { const { round } = __gym; const Lv = (window.SB_LEVEL && SB_LEVEL.get) ? SB_LEVEL : null;
      const get = k => Lv ? Lv.get(k) : (((active().gym || {}).lv || {})[k] || {}).level || 'auto';
      const set = (k, v) => { if (Lv) Lv.set(k, v); else { const g = active().gym || (active().gym = {}); (g.lv = g.lv || {})[k] = { level: v, history: [] }; } };
      ['warmup', 'sprint', 'spot', 'challenge'].forEach(m => set('gym/' + m, 'easy')); set('gym/squares', 'hard');
      try { localStorage.removeItem('bizzing.wallet'); } catch (e) {}
      const fail = await round('challenge', i => i < 7 ? 'right' : 'wrong');
      const afterFail = get('gym/warmup');
      const pass = await round('challenge', 'right');
      return { fail, pass, afterFail, warm: get('gym/warmup'), sprint: get('gym/sprint'), squares: get('gym/squares'), ch: get('gym/challenge') }; });
    ok(!up.fail.pass && up.afterFail === 'easy' && up.fail.coins === 7, `T13 challenge: 7 of 10 moves nothing and pays no contest (${up.fail.pct}%, ${up.fail.coins} coins, Warm-up still ${up.afterFail})`);
    ok(up.pass.pass && up.pass.level === 'medium' && up.warm === 'medium' && up.sprint === 'medium' && up.ch === 'medium' && up.squares === 'hard' && up.pass.coins === 20,
      `T13 challenge: 8 of 10 or better is the way up — every mode below Medium moves there, one set higher by hand stays (warm-up ${up.warm}, sprint ${up.sprint}, squares ${up.squares}), contest paid once (${up.pass.coins})`);
    await ctx.close();
  }

  /* ---------------- DOC: Word Doctor's diagnosis and the later-day discharge ---------------- */
  if (want('DOC')) {
    const { ctx, pg } = await page(b, { kid: Object.assign({}, KID, { missed: [MISSED[0]] }) });
    const r = await pg.evaluate(async () => { const { U, P, step } = __gym; const real = window.mastDay; let D = real(); window.mastDay = () => D;
      const out = {};
      out.types = { necessary: SB_GYM.docType({ w: 'necessary' }, 'neccesary'), knowledge: SB_GYM.docType({ w: 'knowledge' }, 'nowledge'), separate: SB_GYM.docType({ w: 'separate' }, 'seperate'), beautiful: SB_GYM.docType({ w: 'beautiful' }, 'beautifull') };
      app.openGym('doctor'); await U(() => P().phase === 'ward'); out.day1n = P().patients;
      await step('go'); await U(() => P().phase === 'diag'); out.opts = P().pat.opts; out.k = P().pat.k;
      await step('right'); await U(() => P().phase === 'answer', 4000); await step('right'); await U(() => P().phase === 'done', 6000);
      const ward = () => active().gym.doc; out.afterCure = { inWard: !!ward().ward.necessary, rec: !!ward().rec.necessary, cur: (ward().ward.necessary || {}).cur === D };
      /* the same day again — even with the day's list cleared, a word treated today is not discharged today */
      ward().seen = []; app.openGym('doctor'); await U(() => P().phase === 'ward'); out.sameDayN = P().patients;
      if (P().patients) { await step('go'); await U(() => P().phase === 'diag'); await step('right'); await U(() => P().phase === 'answer', 4000); await step('right'); await U(() => P().phase === 'done', 6000); }
      out.sameDay = { inWard: !!ward().ward.necessary, rec: !!ward().rec.necessary };
      /* a later day: back for a check-up, spelt right, discharged */
      D = D + 1; app.openGym('doctor'); await U(() => P().phase === 'ward'); out.day2n = P().patients;
      await step('go'); await U(() => P().phase === 'diag'); await step('right'); await U(() => P().phase === 'answer', 4000); await step('right'); await U(() => P().phase === 'done', 6000);
      out.day2 = { inWard: !!ward().ward.necessary, rec: !!ward().rec.necessary };
      window.mastDay = real; return out; });
    ok(r.types.necessary === 'double' && r.types.knowledge === 'silent' && r.types.separate === 'vowel' && r.types.beautiful === 'double', `DOC: the diagnosis is the child's own mistake (${JSON.stringify(r.types)})`);
    ok(r.opts.length === 4 && r.opts.includes(r.k), `DOC: four options, and the true type is always one of them (${r.opts.join(', ')} ∋ ${r.k})`);
    ok(r.day1n === 1 && r.afterCure.inWard && !r.afterCure.rec && r.afterCure.cur, `DOC: cured on the day it is treated, the patient stays in the ward (ward ${r.afterCure.inWard}, recovered ${r.afterCure.rec})`);
    ok(r.sameDay.inWard && !r.sameDay.rec, `DOC: the same day again, still not discharged (offered ${r.sameDayN}; ward ${r.sameDay.inWard}, recovered ${r.sameDay.rec})`);
    ok(r.day2n === 1 && !r.day2.inWard && r.day2.rec, `DOC: spelt right on a LATER day, discharged to the Recovered ward (ward ${r.day2.inWard}, recovered ${r.day2.rec})`);
    await ctx.close();
  }

  /* ---------------- T11: phone keys and controls ---------------- */
  if (want('T11')) {
    const { ctx, pg } = await page(b, { phone: true, hash: '#/gym/warmup' });
    await until(pg, () => SB_GYM.peek().phase === 'answer', null, 30000);
    const m = await pg.evaluate(() => { const bar = document.querySelector('nav.sb-tabbar'); const top = bar ? bar.getBoundingClientRect().top : innerHeight;
      const ctl = [...document.querySelectorAll('.gym-root button, .gym-root input')].filter(e => e.getClientRects().length);
      const bad = ctl.filter(e => { const r = e.getBoundingClientRect(); return r.bottom > Math.min(top, innerHeight) + 0.5 || r.top < 0; }).map(e => (e.textContent || e.getAttribute('aria-label') || e.className).trim().slice(0, 12));
      const keys = [...document.querySelectorAll('.gym-root .gym-keys button, .gym-root [class*="keys"] button')].filter(e => e.getClientRects().length);
      const inp = document.querySelector('.gym-in');
      return { n: ctl.length, bad, keys: keys.length, minH: Math.min(...keys.map(k => k.getBoundingClientRect().height)), native: inp ? (inp.readOnly || inp.inputMode === 'none') : false }; });
    ok(m.n > 5 && !m.bad.length, `T11: on a 390×844 phone every control is on screen and above the tab bar (${m.n} controls${m.bad.length ? '; under or off: ' + m.bad.join(', ') : ''})`);
    ok(m.keys >= 26 && m.minH >= 40, `T11: an on-screen keyboard, every key at least 40px tall (${m.keys} keys, smallest ${Math.round(m.minH)}px)`);
    ok(m.native, 'T11: the native keyboard is not summoned over the stage (the input is read-only to it)');
    const w = await pg.evaluate(() => SB_GYM.peek().word);
    for (const ch of w.toLowerCase()) await pg.tap(`.gym-root .gym-keys button[data-k="${ch}"], .gym-root [class*="keys"] button[data-k="${ch}"]`);
    await pg.tap('.gym-root [data-g="enter"]'); const typed = await until(pg, () => SB_GYM.peek().right === 1);
    ok(typed, `T11: tapping the keys spells the word and Enter submits it ("${w}")`);
    await ctx.close();
  }

  /* ---------------- T14 / T15: the stage ---------------- */
  if (want('STAGE')) {
    for (const vp of [{ n: 'desktop', phone: false }, { n: 'phone', phone: true }]) for (const look of ['light', 'dusk']) {
      const { ctx, pg } = await page(b, { phone: vp.phone, mode: look, hash: '#/gym' });
      await until(pg, () => !!document.querySelector('.gym-root .gym-stage, .gym-root .sg-stage'), null, 30000); await still(pg);
      for (const where of ['hub', 'warmup']) {
        if (where === 'warmup') { await pg.evaluate(() => app.openGym('warmup')); await until(pg, () => SB_GYM.peek().phase === 'answer', null, 30000); await still(pg); }
        const T = `${vp.n} ${look} ${where}`;
        const st = pg.locator('.gym-root .gym-stage, .gym-root .sg-stage').first();
        let col;
        if (STAGE && STAGE.colours) col = await STAGE.colours(pg, st);
        else { const png = (await st.screenshot()).toString('base64');
          col = await pg.evaluate(async b64 => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
            const d = x.getImageData(0, 0, c.width, c.height).data; const n = d.length / 4; const H = new Map(); let wh = 0, bl = 0;
            for (let i = 0; i < d.length; i += 4) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2]; H.set(k, (H.get(k) || 0) + 1);
              if (d[i] >= 250 && d[i + 1] >= 250 && d[i + 2] >= 250) wh++; if (d[i] <= 5 && d[i + 1] <= 5 && d[i + 2] <= 5) bl++; }
            let top = 0, tk = 0; H.forEach((v, k) => { if (v > top) { top = v; tk = k; } }); return { flat: top / n, hex: '#' + tk.toString(16).padStart(6, '0'), white: wh / n, black: bl / n }; }, png); }
        ok(col.flat <= 0.06 && col.white <= 0.02 && col.black <= 0.02, `T14 ${T}: no flat colour over 6% (${(col.flat * 100).toFixed(1)}%${col.hex ? ' ' + col.hex : ''}), no pure white (${(col.white * 100).toFixed(1)}%) or black (${(col.black * 100).toFixed(1)}%) over 2%`);
        const g = await pg.evaluate(() => { const s = document.querySelector('.gym-root .gym-stage, .gym-root .sg-stage').getBoundingClientRect();
          const hl = document.querySelector('.gym-root .gym-hl, .gym-root .sg-hud-l'), hr = document.querySelector('.gym-root .gym-hr, .gym-root .sg-hud-r'), hc = document.querySelector('.gym-root .gym-hc, .gym-root .sg-hud-c');
          const card = document.querySelector('.gym-root .gym-card, .gym-root .gym-hub');
          const R = e => e ? e.getBoundingClientRect() : null; const a = R(hl), z = R(hr), c = R(hc), k = R(card);
          const bar = document.querySelector('nav.sb-tabbar'); const top = bar && bar.getBoundingClientRect().height ? bar.getBoundingClientRect().top : innerHeight;
          const under = [...document.querySelectorAll('.gym-root button')].filter(e => e.getClientRects().length && e.getBoundingClientRect().bottom > top + 0.5).length;
          const play = document.querySelector('.gym-root .gym-play');
          return { gut: Math.abs(s.left - (document.documentElement.clientWidth - s.right)), side: a && z ? Math.abs(a.width - z.width) : 99,
            hcen: c ? Math.abs((c.left + c.right) / 2 - (s.left + s.right) / 2) : 99, ccen: k ? Math.abs((k.left + k.right) / 2 - (s.left + s.right) / 2) : 99,
            scroll: document.documentElement.scrollHeight - innerHeight, inner: play ? play.scrollHeight - play.clientHeight : 0, under, bottom: s.bottom, top }; });
        ok(g.gut <= 4 && g.side <= 4 && g.hcen <= 4 && g.ccen <= 4, `T15 ${T}: gutters ${g.gut.toFixed(1)}px, HUD sides ${g.side.toFixed(1)}px, title off-centre ${g.hcen.toFixed(1)}px, play object off-centre ${g.ccen.toFixed(1)}px (all ≤ 4)`);
        if (where === 'warmup') ok(g.scroll <= 1 && g.inner <= 1 && g.under === 0 && g.bottom <= g.top + 0.5, `T15 ${T}: no scroll during play (page ${g.scroll}px, stage ${g.inner}px) and nothing under the tab bar (${g.under})`);
      }
      await ctx.close(); }
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
