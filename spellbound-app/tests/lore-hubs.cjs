/* WORD LORE AND HIVE MIND — Bee Trivia split in two (games spec §4.3, §4.4, §8; 4 Oct 2026)

   Owner decision 3: a word-trivia hub and a general-knowledge hub, with distinct names and art.
   This walks both hubs in a real page and holds:
     • names come from SB_HUB_NAMES (never typed), and neither hub prints "0 questions" on a fresh boot;
     • T9  every hub and every mode has a route, and Back from a mode returns to its hub; #/hive/<tab>
           is still My Hive and Bee Trivia's old #/trivia lands in Word Lore;
     • T1  a random bot earns 0 coins in every mode of both hubs (Hive Mind paying, as SB_HIVE_PAY says);
     • T2  a random bot answers at chance (≈25% of perfect on four options — never above), climbs a
           sliver of the ladder, and spells nothing in Origins; T6 the result card's coins = the ledger;
     • T3  a wrong pick holds — the right answer stays on screen past the auto-advance window until
           Continue (Enter); the clock is held while it is up and a wrong pick costs exactly 2 s;
     • keys 1–4 pick and Enter continues; no run counts ("in a row") anywhere;
     • T13 SB_LEVEL.after(key, pct) once per round with key 'lore/<mode>' / 'hive/<mode>', two-option
           items left out of the pct; and with the real SB_LEVEL: 40% drops one level, floor Easy;
           50% holds; a hand-set level sticks;
     • Meanings' distractors share the target's part of speech (always) and its subject (mostly);
     • Origins' language options are weighted so any guessing rule wins one in four (≤25%, not 40%);
     • Idioms & Similes loads its phrases at the door (fresh boot, SB_FIG absent) and never says
       "train a list first";
     • T14/T15 with the shared stage check (tests/lib/stage-check.cjs): both hubs at 1280×800 and 390×844,
       light and dusk, and four rounds in play — painted, not flat, symmetric, no scroll, nothing under
       the tab bar (guarded: skipped, saying why, on a branch without the engine kit).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/lore-hubs.cjs                              */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { booted, until, still, frames } = require('./lib/wait.cjs');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(process.env.SRC || path.join(__dirname, '..'));
const URL = 'file://' + APP + '/index.html';
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Lorna', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0, xp: 0, lists: { default: { xp: 3 } },
    activeList: 'default', missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_lore')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_lore', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); ok(await booted(pg), 'the app boots');
  await pg.evaluate(() => { state.screen = 'app'; try { window.speechSynthesis.speak = () => {}; window.speechSynthesis.cancel = () => {}; } catch (e) {}
    window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, set onerror(v) {}, get onerror() { return null; }, addEventListener() {} }; };
    window._flashes = []; const f = window.flash; window.flash = function (m) { window._flashes.push(String(m)); return f.apply(this, arguments); }; });

  /* ---- Idioms & Similes loads its phrases at the door: a fresh boot has no SB_FIG ---- */
  const fig0 = await pg.evaluate(() => !window.SB_FIG || !(window.SB_FIG.idioms || []).length);
  await pg.evaluate(() => app.openLore('idioms'));
  ok(await until(pg, () => state.qz && state.qz.mode === 'idioms' && state.qz.phase === 'play', null, 40000), 'Idioms & Similes opens on a fresh boot');
  const fig = await pg.evaluate(() => ({ n: state.qz.qs.length, kinds: [...new Set(state.qz.qs.map(q => q.th))], fl: window._flashes.filter(m => /train a list/i.test(m)), cnt: countTxt('idioms') }));
  ok(fig0 && fig.n === 10 && fig.kinds.length === 2 && !fig.fl.length, `…with SB_FIG not yet loaded at boot (${fig0}), it waits for it and serves ten (${fig.n}: ${fig.kinds.join(' + ')}) — never "train a list first"`);
  await pg.evaluate(() => app.openLore()); await until(pg, () => document.querySelector('[data-arg="lore/idioms"]'));
  const idTile = await pg.evaluate(() => document.querySelector('[data-arg="lore/idioms"]').innerText);
  ok(fig.cnt && idTile.indexOf(fig.cnt.replace(/^over /, '')) >= 0, `the Idioms tile prints the real phrase count from SB_COUNT ("${fig.cnt}")`);

  /* ---- names come from SB_HUB_NAMES; no "0 questions" on a fresh hub ---- */
  const names = await pg.evaluate(async () => { const keep = window.SB_HUB_NAMES; window.SB_HUB_NAMES = Object.assign({}, keep || {}, { lore: 'Root and Branch', hive: 'Know-It-Hive' });
    const W = ms => new Promise(r => setTimeout(r, ms)); const U = async (f) => { for (let i = 0; i < 300; i++) { if (f()) return true; await W(30); } return false; };
    app.openLore(); await U(() => state.nav === 'lore' && document.querySelector('[data-act="hubMode"]')); const lore = document.querySelector('#root').innerText;
    app.openHive(); await U(() => state.nav === 'hive' && document.querySelector('[data-act="hubMode"]')); const hive = document.querySelector('#root').innerText;
    const tiles = document.querySelectorAll('[data-act="hubMode"]').length;
    window.SB_HUB_NAMES = keep; return { lore: /Root and Branch/.test(lore) && !/Word Lore/.test(lore), hive: /Know-It-Hive/.test(hive) && !/Hive Mind/.test(hive), zero: /\b0 questions\b/.test(lore + hive), tiles }; });
  ok(names.lore && names.hive, 'both hubs take their names from SB_HUB_NAMES — rename them and the screens follow (no typed name)');
  ok(!names.zero && names.tiles === 3, `no hub says "0 questions" on a fresh boot; Hive Mind has its three modes (${names.tiles})`);

  /* ---- T9: every mode has a route; Back from a mode returns to its hub ---- */
  const MODES = { lore: ['meanings', 'roots', 'origins', 'idioms', 'ladder', 'squares', 'clock'], hive: ['classic', 'squares', 'clock'] };
  const rbad = [];
  for (const h of ['lore', 'hive']) {
    await pg.evaluate(h => { location.hash = '#/' + h; }, h);
    if (!await until(pg, h => state.nav === h && state.qz && !state.qz.mode && document.querySelector('[data-act="hubMode"]'), h, 20000)) rbad.push('#/' + h);
    for (const m of MODES[h]) {
      await pg.evaluate(([h, m]) => { location.hash = '#/' + h + '/' + m; }, [h, m]);
      const on = await until(pg, ([h, m]) => state.nav === h && state.qz && state.qz.mode === m && state.qz.phase !== 'loading' && location.hash === '#/' + h + '/' + m, [h, m], 30000);
      await pg.goBack();
      const back = await until(pg, h => location.hash === '#/' + h && state.nav === h && state.qz && !state.qz.mode, h, 15000);
      if (!on || !back) rbad.push(`#/${h}/${m} (opened ${on}, Back to the hub ${back} — at ${await pg.evaluate(() => location.hash)})`);
    }
  }
  ok(!rbad.length, 'T9: #/lore, #/hive and all ten modes open by address, and Back from each mode lands on its hub' + (rbad.length ? ' — ' + rbad.join(' | ') : ''));
  await pg.evaluate(() => { location.hash = '#/hive/avatars'; });
  ok(await until(pg, () => state.nav === 'collection' && state.collTab === 'avatars', null, 15000), '#/hive/avatars is still My Hive (My Feed links there)');
  await pg.evaluate(() => { location.hash = '#/trivia'; });
  ok(await until(pg, () => state.nav === 'lore' && state.qz && state.qz.mode === 'roots', null, 30000), "Bee Trivia's old #/trivia lands in Word Lore's Roots (its word stories)");
  await pg.evaluate(() => app.openBizz());
  ok(await until(pg, () => state.nav === 'lore' && state.qz && state.qz.mode === 'ladder' && !document.querySelector('.bz-play'), null, 30000), "Bizzillionaire's door opens Word Lore's Ladder — no overlay, no money");

  /* ---- the bots (T1, T2, T6, keys, no run counts) ----
     The page's own Math.random is seeded for this part, so the bots meet the same questions in the same
     order every run: a bot that is random and a test that is reproducible. Chance still has its due —
     a 10-question round pays only from 6 right, which a guesser reaches 2% of the time — so T1 is also
     checked on the RULE itself, for every possible score, below. */
  await pg.evaluate(() => { window.__realRandom = Math.random; let s = 4102026; Math.random = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; });
  const bots = await pg.evaluate(async (MODES) => {
    const W = ms => new Promise(r => setTimeout(r, ms));
    const U = async (f, ms) => { for (const t0 = Date.now(); Date.now() - t0 < (ms || 30000);) { try { if (f()) return true; } catch (e) {} await W(30); } return false; };
    let seed = 20261004; const rnd = () => { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; return seed / 4294967296; };
    /* the family cap is 100 a day: shift today's ledger back so a perfect bot is never capped mid-test */
    const capReset = () => { try { const o = JSON.parse(SB_STORE.getKey('bizzing.wallet') || 'null'); if (!o) return;
      Object.values(o.kids).forEach(k => k.ledger.forEach(x => { if (x.a === 'bee') x.t -= 3 * 864e5; })); SB_STORE.setKey('bizzing.wallet', JSON.stringify(o)); } catch (e) {} };
    const runCount = [];
    async function round(h, m, bot) {
      capReset();
      (h === 'lore' ? app.openLore : app.openHive)(m);
      if (!await U(() => state.qz && state.qz.mode === m && state.qz.phase !== 'loading')) return { err: 'never loaded' };
      if (state.qz.phase === 'intro') app.qzBegin();
      const g = state.qz; if (g.phase !== 'play') return { err: 'phase ' + g.phase };
      const e0 = earnedSoFar(); let guard = 0, keyUsed = false;
      while (g.phase === 'play' && guard++ < 600) {
        if (state.qz !== g) return { err: 'round replaced' };
        if (/\d+ right in a row|streak/i.test(document.querySelector('#root').innerText) || window._flashes.some(f => /in a row/i.test(f))) runCount.push(h + '/' + m);
        if (m === 'squares' && g.sel == null) { app.qzCell(g.cells.findIndex(c => !c.st)); continue; }
        if (m === 'clock' && g.asked + g.two >= 24) { SB_QHUB.finish(g); break; }
        const q = SB_QHUB._cur();
        if (q.kind === 'origin') {
          if (q.stage === 'pick') app.qzPick(bot === 'perfect' ? q.ans : Math.floor(rnd() * 4));
          else if (q.stage === 'type') { app.qzType(bot === 'perfect' ? q.word.w : 'qz' + Math.floor(rnd() * 1e6).toString(36)); app.qzSubmit(); }
          else app.qzGo();
          continue; }
        if (g.held || g.go) { app.qzGo(); continue; }
        let i = bot === 'perfect' ? q.ans : Math.floor(rnd() * q.opts.length);
        if (g.hidden && g.hidden.indexOf(i) >= 0) i = q.ans;
        /* the keyboard is the same door as a tap: every third pick goes through the 1–4 keys */
        if (guard % 3 === 0 && i < 4) { window.dispatchEvent(new KeyboardEvent('keydown', { key: String(i + 1) })); keyUsed = keyUsed || g.picked === i; if (g.picked == null) app.qzPick(i); }
        else app.qzPick(i);
      }
      await U(() => g.phase === 'done', 5000);
      const card = (document.querySelector('.qz-pay') || {}).innerText || '';
      const shown = +((card.match(/(\d+)/) || [])[1] || 0);
      return { asked: g.asked, right: g.right, rung: g.rung, two: g.two, paid: earnedSoFar() - e0, shown, coins: g.coins, phase: g.phase, keyUsed, n: g.n };
    }
    const out = { random: {}, perfect: {}, runCount };
    for (const h of ['lore', 'hive']) for (const m of MODES[h]) {
      const k = h + '/' + m; out.random[k] = []; out.perfect[k] = await round(h, m, 'perfect');
      for (let r = 0; r < (m === 'ladder' ? 16 : m === 'origins' || m === 'clock' ? 3 : 7); r++) out.random[k].push(await round(h, m, 'random'));
    }
    return out; }, MODES);
  await pg.evaluate(() => { Math.random = window.__realRandom; });   // the shuffles after this are the page's own
  const keys = Object.keys(bots.perfect);
  const rule = await pg.evaluate(() => { const own = SB_QHUB._owed; const bad = [];
    for (let r = 0; r <= 10; r++) { const o = own({ hub: 'lore', mode: 'roots', right: r, asked: 10, paid: 0 }); if ((r < 6 && o !== 0) || (r >= 6 && o !== r)) bad.push('10q ' + r + '→' + o); }
    for (const phase of ['play', 'done']) for (let a = 1; a <= 40; a++) for (let r = 0; r <= a; r++) { const o = own({ hub: 'hive', mode: 'clock', right: r, asked: a, paid: 0, phase });
      const want = (r / a >= 0.6 && (phase === 'done' ? r >= 6 : a >= 15)) ? r : 0; if (o !== want) bad.push('clock ' + phase + ' ' + r + '/' + a + '→' + o); }
    for (let k = 0; k <= 12; k++) { const o = own({ hub: 'lore', mode: 'ladder', rung: k, paid: 0 }); if (o !== (k >= 4 ? k : 0)) bad.push('ladder ' + k + '→' + o); }
    window.SB_HIVE_PAY = false; const off = own({ hub: 'hive', mode: 'classic', right: 10, asked: 10, paid: 0 }); delete window.SB_HIVE_PAY;
    return { bad, off }; });
  ok(!rule.bad.length && rule.off === 0, 'T1 on the rule: nothing is owed below chance — under 6 of 10, on the clock under 60%, and before 15 answers while it runs (6 right once time is up), under 4 rungs — and SB_HIVE_PAY=false pays Hive Mind nothing' + (rule.bad.length ? ' — ' + rule.bad.slice(0, 5).join(', ') : ''));
  /* T1. The pay rule owes nothing below chance (checked for every score above). A guesser can still be
     lucky — 6 of 10 at four options happens about 2% of the time, so its expected wage is ~0.12 coins a
     round, 1.2% of a perfect round's 10. Held here as a rate, over enough rounds that one lucky round
     cannot fail it and a rule that paid below chance (≈25% of perfect) cannot pass it. */
  const errsB = keys.filter(k => bots.random[k].some(r => r.err)).map(k => k + ' ' + JSON.stringify(bots.random[k].map(r => r.err || r.paid)));
  const rRounds = keys.reduce((n, k) => n + bots.random[k].length, 0), rCoins = keys.reduce((n, k) => n + bots.random[k].reduce((a, r) => a + (r.paid || 0), 0), 0);
  const pPer = keys.reduce((n, k) => n + (bots.perfect[k].paid || 0), 0) / keys.length, rPer = rCoins / rRounds;
  const lucky = keys.flatMap(k => bots.random[k].filter(r => r.paid > 0).map(r => k + ':' + r.paid));
  ok(!errsB.length && rPer <= 0.05 * pPer && keys.every(k => bots.random[k].every(r => k === 'lore/origins' ? r.paid === 0 : true)),
    `T1: a random bot is paid at chance's rate and no more — ${rCoins} coins in ${rRounds} rounds, ${(rPer / pPer * 100).toFixed(1)}% of a perfect bot's wage a round (lucky rounds: ${lucky.join(', ') || 'none'}); Origins, which pays for typing, never` + (errsB.length ? ' — ' + errsB.join(' | ') : ''));
  const pays = keys.filter(k => bots.perfect[k].err || !(bots.perfect[k].paid > 0)).map(k => k + ' ' + JSON.stringify(bots.perfect[k]));
  ok(!pays.length, 'and a perfect bot is paid in every mode (Hive Mind too, SB_HIVE_PAY defaulting on)' + (pays.length ? ' — ' + pays.join(' | ') : ''));
  const t6 = keys.flatMap(k => [bots.perfect[k]].concat(bots.random[k]).filter(r => !r.err && (r.coins !== r.paid || r.shown !== r.paid)).map(r => k + ' card ' + r.shown + ' / ledger ' + r.paid));
  ok(!t6.length, 'T6: every result card prints exactly what the ledger received' + (t6.length ? ' — ' + t6.slice(0, 4).join(' | ') : ''));
  const MC = keys.filter(k => !/ladder|origins/.test(k));
  const sum = (bot, f) => MC.reduce((n, k) => n + [].concat(bots[bot][k]).reduce((a, r) => a + (r.err ? 0 : f(r)), 0), 0);
  const rAcc = sum('random', r => r.right) / Math.max(1, sum('random', r => r.asked)), pAcc = sum('perfect', r => r.right) / Math.max(1, sum('perfect', r => r.asked));
  ok(pAcc === 1 && rAcc <= 0.30, `T2: on the four-option modes a random bot is at chance — ${(rAcc * 100).toFixed(1)}% of perfect's ${(pAcc * 100).toFixed(0)}% over ${sum('random', r => r.asked)} answers (four options: 25% is chance, never above it)`);
  const lad = bots.random['lore/ladder'].reduce((a, r) => a + (r.rung || 0), 0) / bots.random['lore/ladder'].length;
  ok(bots.perfect['lore/ladder'].rung === 12 && lad / 12 < 0.25, `T2: the perfect bot climbs all 12 rungs; a random one ${lad.toFixed(2)} on average (${(lad / 12 * 100).toFixed(1)}% of perfect)`);
  const ori = bots.random['lore/origins'].reduce((a, r) => a + (r.right || 0), 0);
  ok(bots.perfect['lore/origins'].right === bots.perfect['lore/origins'].n && ori === 0, `T2: Origins pays for the SPELLING — perfect spells all ${bots.perfect['lore/origins'].n}, random none (${ori})`);
  ok(keys.some(k => bots.perfect[k].keyUsed || [].concat(bots.random[k]).some(r => r.keyUsed)), 'the keys 1–4 pick an answer, the same door as a tap');
  ok(!bots.runCount.length && !/in a row/.test(fs.readFileSync(path.join(APP, 'lore.js'), 'utf8')), 'no run counts — "in a row" appears on no hub screen and nowhere in lore.js');

  /* ---- T3: a miss holds the answer until Continue; the clock holds with it ---- */
  await pg.evaluate(() => app.openHive('classic')); await until(pg, () => state.qz && state.qz.phase === 'intro', null, 30000);
  await pg.keyboard.press('Enter');   // Enter starts the round, as it continues everything else
  await until(pg, () => state.qz.phase === 'play', null, 15000);
  const miss0 = await pg.evaluate(() => { const g = state.qz, q = SB_QHUB._cur(); const w = (q.ans + 1) % q.opts.length; app.qzPick(w); return { i: g.i, ans: q.opts[q.ans] }; });
  const moved = await until(pg, i => state.qz.i !== i, miss0.i, 3200);   // longer than a right answer's 2.1 s advance
  const held = await pg.evaluate(a => ({ text: document.querySelector('#root').innerText.indexOf(a) >= 0, card: !!document.querySelector('.qz-miss, .sg-misscard'), go: !!document.querySelector('[data-act="qzGo"], .sg-miss-go') }), miss0.ans);
  ok(!moved && held.text && held.card, `T3: a wrong pick HOLDS — 3 s later the right answer ("${miss0.ans.slice(0, 40)}") and its card are still up, the question has not moved`);
  await pg.keyboard.press('Enter');
  ok(await until(pg, i => state.qz.i === i + 1 && !document.querySelector('.qz-miss, .sg-misscard'), miss0.i, 5000), '…and Enter continues to the next question, and the card goes');
  await pg.evaluate(() => app.openLore('clock')); await until(pg, () => state.qz && state.qz.mode === 'clock' && state.qz.phase === 'play', null, 30000);
  const ck = await pg.evaluate(async () => { const W = ms => new Promise(r => setTimeout(r, ms)); const g = state.qz; await W(400);
    const q = SB_QHUB._cur(); const before = g.left; app.qzPick((q.ans + 1) % q.opts.length); const after = g.left;
    const a = g.left; await W(1500); const b = g.left; const txt = (document.getElementById('qz-time') || {}).textContent;
    app.qzGo(); await W(700); return { cost: before - after, heldDrift: a - b, resumed: b - g.left, txt, held: g.held }; });
  ok(Math.abs(ck.cost - 2000) < 60, `a wrong pick on the clock costs 2 s (${Math.round(ck.cost)} ms)`);
  ok(ck.heldDrift === 0 && ck.resumed > 300 && !ck.held, `the clock HOLDS while the miss is up (drift ${ck.heldDrift} ms over 1.5 s) and runs again after Continue (${Math.round(ck.resumed)} ms)`);
  await pg.evaluate(() => app.openLore('ladder')); await until(pg, () => state.qz && state.qz.mode === 'ladder' && state.qz.phase === 'play', null, 30000);
  const ld = await pg.evaluate(() => { const g = state.qz; const q = SB_QHUB._cur(); app.qzPick(q.ans); return g.rung; });
  await until(pg, () => state.qz.picked == null && state.qz.rung === 1, null, 5000);
  const ld2 = await pg.evaluate(() => { const g = state.qz; const q = SB_QHUB._cur(); app.qzLife('fifty'); const hid = g.hidden.slice(); app.qzPick((q.ans + 1) % 4 === hid[0] || (q.ans + 1) % 4 === hid[1] ? [0, 1, 2, 3].find(i => i !== q.ans && hid.indexOf(i) < 0) : (q.ans + 1) % 4);
    return { hid, held: g.held, ans: q.opts[q.ans], phase: g.phase, exit: !!document.querySelector('[data-act="qzStop"]') }; });
  const ladHeld = await until(pg, () => state.qz.phase === 'done', null, 2500);
  ok(ld === 1 && ld2.hid.length === 2 && ld2.held && !ladHeld && await pg.evaluate(a => document.querySelector('#root').innerText.indexOf(a) >= 0, ld2.ans), 'the Ladder: a right answer climbs a rung; 50:50 hides two wrong answers; a miss holds with the answer');
  await pg.keyboard.press('Enter');
  const ladDone = await until(pg, () => state.qz.phase === 'done', null, 5000);
  const ladTxt = await pg.evaluate(() => document.querySelector('#root').innerText);
  ok(ladDone && /Rung 1 of 12/.test(ladTxt) && !/walk away|\$|money/i.test(ladTxt), '…then the climb ends on Continue, with rungs and no cash ("You walk away with" is gone)');

  /* ---- T13: the level rule, once a round, two-option items left out ---- */
  const lvl = await pg.evaluate(async () => {
    const W = ms => new Promise(r => setTimeout(r, ms)); const U = async f => { for (let i = 0; i < 600; i++) { if (f()) return true; await W(30); } return false; };
    const real = window.SB_LEVEL && typeof SB_LEVEL.after === 'function'; const calls = [];
    const keep = window.SB_LEVEL;
    if (!real) window.SB_LEVEL = { get: () => 'auto', set() {}, chip: () => '', after: (k, p) => { calls.push([k, p]); return { level: 'auto', dropped: false, offerUp: false }; } };
    else { const a = SB_LEVEL.after.bind(SB_LEVEL); SB_LEVEL.after = (k, p) => { calls.push([k, p]); return a(k, p); }; }
    /* a crafted Roots round: two true/false items, eight four-option items, four of those right */
    async function crafted(rightOf8, hub, mode) { (hub === 'lore' ? app.openLore : app.openHive)(mode); await U(() => state.qz && state.qz.mode === mode && state.qz.phase !== 'loading');
      if (state.qz.phase === 'intro') app.qzBegin(); const g = state.qz;
      const mc = (i) => ({ kind: 'mc', prompt: 'Q' + i, opts: ['a', 'b', 'c', 'd'], ans: 0, fact: '' }), tf = (i) => ({ kind: 'mc', prompt: 'T' + i, opts: ['True', 'False'], ans: 0, two: true, fact: '' });
      g.qs = [tf(0), tf(1)].concat([0, 1, 2, 3, 4, 5, 6, 7].map(mc)); g.n = 10; g.i = 0; g.asked = g.right = g.two = 0;
      for (let i = 0; i < 10; i++) { const q = g.qs[g.i]; const right = q.two ? false : (i - 2) < rightOf8; app.qzPick(right ? 0 : 1); app.qzGo(); }
      await U(() => g.phase === 'done'); return g; }
    const n0 = calls.length; await crafted(4, 'lore', 'roots'); const c1 = calls.slice(n0);
    const out = { real, once: c1.length === 1, key: c1[0] && c1[0][0], pct: c1[0] && c1[0][1] };
    if (real) {
      SB_LEVEL.set('lore/roots', 'hard'); const seq = [];
      for (let r = 0; r < 3; r++) { await crafted(3, 'lore', 'roots'); seq.push(SB_LEVEL.get('lore/roots')); }   // 3 of 8 = 37.5%
      out.drops = seq; SB_LEVEL.set('lore/roots', 'medium'); await crafted(4, 'lore', 'roots'); out.holds = SB_LEVEL.get('lore/roots');
      SB_LEVEL.set('hive/classic', 'champ'); out.sticks = SB_LEVEL.get('hive/classic');
    }
    window.SB_LEVEL = keep; return out; });
  ok(lvl.once && lvl.key === 'lore/roots' && lvl.pct === 50, `T13: a round calls SB_LEVEL.after once, key "lore/roots", pct ${lvl.pct} — 4 right of 8 four-option items; the two true/false items never count (${lvl.real ? 'real SB_LEVEL' : 'SB_LEVEL not merged yet: a spy'})`);
  if (lvl.real) ok(JSON.stringify(lvl.drops) === '["medium","easy","easy"]' && lvl.holds === 'medium' && lvl.sticks === 'champ',
    `T13: three rounds under 50% drop hard → ${lvl.drops.join(' → ')} (floor Easy); 50% holds (${lvl.holds}); a hand-set level sticks (${lvl.sticks})`);
  else console.log('  SKIP T13 drop/hold/stick on the real rule — SB_LEVEL (g-found) is not on this branch yet');

  /* ---- Meanings: same part of speech always, same subject mostly ---- */
  const pos = await pg.evaluate(async () => { await new Promise(r => SB_LAZY.need('words', r));
    const qs = []; for (let k = 0; k < 6 && qs.length < 80; k++) qs.push(...SB_QHUB._meaningRound('lore', 'meanings', 20));
    let peers = 0, samePos = 0, sameTh = 0, bad = [];
    for (const q of qs) { const P = SB_QHUB._posOf(q.word), T = new Set(SB_QHUB._topical(q.word));
      for (const x of q.peers) { peers++; if (SB_QHUB._posOf(x) === P) samePos++; else bad.push(q.word.w + '/' + x.w); if (SB_QHUB._topical(x).some(t => T.has(t))) sameTh++; } }
    return { n: qs.length, peers, samePos, sameTh, bad: bad.slice(0, 5), both: qs.every(q => q.opts.length === 4 && q.opts[q.ans] != null), dirs: [...new Set(qs.map(q => q.dir))] }; });
  ok(pos.n >= 60 && pos.samePos === pos.peers && pos.both, `Meanings: every one of ${pos.peers} distractors in ${pos.n} questions is the target's part of speech` + (pos.bad.length ? ' — ' + pos.bad.join(', ') : ''));
  ok(pos.sameTh / pos.peers >= 0.8 && pos.dirs.length === 2, `…${(pos.sameTh / pos.peers * 100).toFixed(0)}% share its subject theme (the rest its cluster), and both directions are asked (${pos.dirs.join(', ')})`);

  /* ---- no question gives itself away: distinct options, one right, the right one in any slot, and a
     meaning→word prompt that never prints its own word (the question-leaks rules, for the hubs) ---- */
  const lk = await pg.evaluate(() => { const qs = []; for (let k = 0; k < 8; k++) qs.push(...SB_QHUB._meaningRound('lore', 'meanings', 20), ...SB_QHUB._figRound('lore', 'idioms', 10));
    const bad = [], slot = [0, 0, 0, 0];
    for (const q of qs) { const low = q.opts.map(o => String(o).trim().toLowerCase());
      if (new Set(low).size !== low.length) bad.push('dup ' + q.prompt.slice(0, 30));
      if (low.filter(o => o === String(q.opts[q.ans]).trim().toLowerCase()).length !== 1) bad.push('one ' + q.prompt.slice(0, 30));
      if (q.dir === 'm2w' && new RegExp('\\b' + q.word.w + '\\b', 'i').test(q.prompt)) bad.push('leak ' + q.word.w);
      slot[q.ans]++; }
    return { n: qs.length, bad: bad.slice(0, 5), slot: slot.map(x => x / qs.length) }; });
  ok(lk.n >= 200 && !lk.bad.length && Math.max(...lk.slot) < 0.32, `${lk.n} Meanings and Idioms questions: options distinct, exactly one right, the right one in any slot (${lk.slot.map(x => (x * 100).toFixed(0) + '%').join(' ')}), no meaning prints its own word` + (lk.bad.length ? ' — ' + lk.bad.join(', ') : ''));

  /* ---- Origins: whatever a guesser always picks wins one time in four ---- */
  const ch = await pg.evaluate(() => { const pool = SB_QHUB._words('lore', 'origins', 600); const qs = [];
    for (let k = 0; k < 1000; k++) qs.push(...SB_QHUB._originRound(pool, 10));
    const pres = {}, win = {}; qs.forEach(q => q.opts.forEach(L => { pres[L] = (pres[L] || 0) + 1; if (L === q.lang) win[L] = (win[L] || 0) + 1; }));
    const rule = Object.keys(pres).filter(L => pres[L] >= 1000).map(L => [L, (win[L] || 0) / pres[L]]).sort((a, b) => b[1] - a[1]);
    const slot = [0, 1, 2, 3].map(i => qs.filter(q => q.ans === i).length / qs.length);
    return { n: qs.length, langs: Object.keys(pres).length, top: rule.slice(0, 3), slot: Math.max(...slot), shown: qs.every(q => q.opts.indexOf(q.lang) >= 0 && new Set(q.opts).size === 4) }; });
  ok(ch.n >= 3000 && ch.shown && ch.top.length && ch.top[0][1] <= 0.29 && ch.slot <= 0.28,
    `Origins: over ${ch.n} questions in ${ch.langs} languages, "always pick ${ch.top[0] && ch.top[0][0]}" wins ${(ch.top[0][1] * 100).toFixed(1)}% and the likeliest slot ${(ch.slot * 100).toFixed(1)}% — chance is 25%, not 40%`);

  /* ---- T14/T15: the shared stage check (tests/lib/stage-check.cjs) on both hubs, light and dusk, desktop
     and phone, and on four rounds in play. Until the kit is on the branch it is skipped, saying so. ---- */
  const SCp = path.join(__dirname, 'lib', 'stage-check.cjs');
  if (!fs.existsSync(SCp) || !await pg.evaluate(() => !!(window.SGUI && SGUI.stage && window.SB_HUB))) console.log('  SKIP T14/T15 — the engine kit (SGUI.stage, SB_HUB, tests/lib/stage-check.cjs) is not on this branch');
  else { const SC = require(SCp);
    const look = (m) => pg.evaluate(m => { state.mode = m; try { document.documentElement.setAttribute('data-mode', m); } catch (e) {} render(); }, m);
    for (const [w, h] of [[1280, 800], [390, 844]]) {
      await pg.setViewportSize({ width: w, height: h });
      for (const mode of ['light', 'dusk']) { await look(mode);
        for (const hub of ['lore', 'hive']) {
          await pg.evaluate(hb => (hb === 'lore' ? app.openLore : app.openHive)(), hub);
          await until(pg, hb => state.nav === hb && document.querySelector('.sb-stage [data-act="hubMode"]'), hub, 20000); await frames(pg, 3);
          SC.report(ok, `T14/T15 ${hub} hub · ${w} · ${mode}`, await SC.geometry(pg), await SC.pixels(pg), { play: false }); } }
      await look('light');
      for (const [hub, m] of [['lore', 'meanings'], ['lore', 'ladder'], ['hive', 'squares'], ['lore', 'origins']]) {
        await pg.evaluate(([hb, mm]) => (hb === 'lore' ? app.openLore : app.openHive)(mm), [hub, m]);
        await until(pg, mm => state.qz && state.qz.mode === mm && state.qz.phase === 'play' && document.querySelector('.sb-stage .qz-card, .sb-stage .qz-board'), m, 30000); await frames(pg, 3);
        SC.report(ok, `T14/T15 ${hub}/${m} in play · ${w}`, await SC.geometry(pg), await SC.pixels(pg), { play: true }); }
    }
    await pg.setViewportSize({ width: 1280, height: 800 });
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
