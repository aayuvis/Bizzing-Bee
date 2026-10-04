/* HONEYCOMB RUN IS FOUR GATES TO THE HIVE (games spec 4 Oct 2026, §4.6) — every check here was
   watched failing once with its fault put back.

   It used to be won by clearing the dots, without a single word. Now the maze is four zones
   behind four honey gates, a gate opens only when the flower word beside it is spelt, and the
   hive behind the last gate is the only win.

     G  win only through 4 gates: clearing every dot wins nothing; the hive is unreachable with
        three gates open; the fourth opens it and flying in wins
     T3 a wrong word holds with the word shown until Continue (clock and moths stopped), the
        gate stays shut and asks for a NEW word; a card left alone never closes on its own
     T1 a random bot earns 0 coins      T2 and scores < 25% of a perfect bot (one coin a word)
     C  the clock is fixed per level (Easy 3:00 … Champ 2:00); lives 3; "Out of lives"; "+1"
     L  SB_LEVEL.after('honeycombRun', right÷met) once a round; sfx('wrong') on a miss
     T4 at 4× CPU throttle the round clock runs on the shared clock's real time ± 3%
     T11 desktop: the D-pad's bottom row is on screen; phone: the D-pad is centred, and a spell
        card brings up on-screen keys ≥ 40px that spell the word

   Usage: NODE_PATH=/opt/node22/lib/node_modules node tests/arcade-honeycomb.cjs          */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const SRC = path.resolve(__dirname, '..');
const URL = 'file://' + SRC + '/index.html';
const CHROME = process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };

async function open(b, { w = 1280, h = 800, touch = false } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch });
  await ctx.addInitScript(k => { window.SB_DEBUG = true; try { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await pg.goto(URL); await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));
  await pg.evaluate(() => { window._lvCalls = [];
    if (window.SB_LEVEL && typeof SB_LEVEL.after === 'function') { const real = SB_LEVEL.after.bind(SB_LEVEL); SB_LEVEL.after = (k, p) => { _lvCalls.push([k, p]); return real(k, p); }; }
    else window.SB_LEVEL = { after(k, p) { _lvCalls.push([k, p]); return { level: 'easy', dropped: false, offerUp: false }; } };
    window._sfx = []; const rs = window.sfx; window.sfx = k => { _sfx.push(k); try { return rs && rs(k); } catch (e) {} };
    /* helpers the page runs: wait on state, stand on a gate's flower, answer its card */
    window._U = (f, ms) => new Promise(r => { const t0 = performance.now(); (function w() { let v = false; try { v = f(); } catch (e) {} if (v || performance.now() - t0 > (ms || 8000)) r(v); else setTimeout(w, 30); })(); });
    window._gate = async (i, typed) => { const g = _maze.state().gates[i]; _maze.rearm(); _maze.warp(g.fc, g.fr);
      if (!await _U(() => _maze.state().card === 'gate', 4000)) return { card: false };
      const w = _maze.word(); const inp = document.querySelector('#sg-ci'), go = document.querySelector('#sg-cgo'); if (!inp || !go) return { card: false };
      inp.value = typed === undefined ? w : typed; go.click(); await _U(() => !_maze.state().card || document.querySelector('#arc-host .arcx-miss, #arc-host .sb-miss'), 3000);
      return { card: true, w, open: _maze.state().gates[i].open }; };
    window._cont = async () => { await new Promise(r => setTimeout(r, 300)); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await _U(() => !_maze.state().card, 3000); }; });
  return { ctx, pg, errs };
}
const launch = (pg, diff) => pg.evaluate(d => { const c = active(); c.gameDiffBy = Object.assign(c.gameDiffBy || {}, { honeycombRun: d }); if (window.SB_LEVEL && SB_LEVEL.set) SB_LEVEL.set('honeycombRun', d);
  app.arcadePlay('honeycombRun', { fromMenu: true }); }, diff).then(() => until(pg, () => window._maze && _maze.state().started, null, 15000));
const close = pg => pg.evaluate(() => { try { arcadeClose(); } catch (e) {} });
const wallet = pg => pg.evaluate(() => { try { return BZ_WALLET.balance(walletWho(active())); } catch (e) { return -1; } });

(async () => {
  const src = fs.readFileSync(path.join(SRC, 'saga2.js'), 'utf8');
  const eng = src.slice(src.indexOf('function honeycombRun('), src.indexOf('/* ---------- ENGINE B'));
  ok(!/\+20\b/.test(eng) && /\+1\b/.test(eng), 'C · the copy says +1 (a word is one coin), never +20');
  ok(!/setInterval\(/.test(eng), 'no setInterval in the engine — the clock is the shared fixed-step loop, and no card has a fuse');

  const b = await chromium.launch({ executablePath: CHROME });
  const { ctx, pg, errs } = await open(b);

  /* G · the hive is the only way to win, and it takes four gates */
  console.log('\n  G · four gates to the hive');
  await launch(pg, 'easy');
  const w0 = await wallet(pg);
  await pg.evaluate(() => { _maze.noMoths(); _lvCalls.length = 0; });
  const g = await pg.evaluate(async () => { const out = {};
    out.t0 = _maze.state().t; out.lives0 = _maze.state().lives;
    /* every dot gone but the one beside the bee — then she eats the last one */
    { const s0 = _maze.state(), bx = Math.round(s0.px), by = Math.round(s0.py); _maze.clearDots([[bx + 1, by]]); _maze.want([1, 0]);
      await _U(() => _maze.state().dots === 0 || _maze.state().over, 4000); await new Promise(r => setTimeout(r, 300));
      out.ateLast = _maze.state().dots === 0; _maze.want([0, 0]); }
    out.dotsWin = !out.ateLast || _maze.state().over || !!document.querySelector('#arc-host .sg-endcard');
    out.reach0 = _maze.reachHive();
    const e0 = earnedSoFar();
    for (let i = 0; i < 3; i++) { const r = await _gate(i); out['g' + i] = r.open; }
    out.reach3 = _maze.reachHive();
    /* three open: stand at the last gate's flower, decline the card, push into the shut gate */
    const g4 = _maze.state().gates[3]; _maze.warp(g4.fc, g4.fr); await _U(() => _maze.state().card === 'gate', 4000);
    (document.querySelector('#hc-later') || { click() {} }).click(); _maze.want([0, -1]); await new Promise(r => setTimeout(r, 1200));
    out.shutHolds = !_maze.state().over && Math.round(_maze.state().py) === g4.fr;
    const r4 = await _gate(3); out.g3 = r4.open;
    out.reach4 = _maze.reachHive();
    out.coins = earnedSoFar() - e0;
    _maze.want([0, -1]); await _U(() => !!document.querySelector('#arc-host .sg-endcard'), 6000);
    const end = document.querySelector('#arc-host .sg-endcard');
    out.won = !!end && /Home to the hive/.test(end.textContent); out.endTitle = end ? end.querySelector('.sg-end-h').textContent : '';
    out.lv = _lvCalls.slice(); out.met = _maze.state().met; out.right = _maze.state().right;
    return out; });
  const w1 = await wallet(pg);
  ok(g.t0 >= 179 && g.t0 <= 180, `C · Easy's clock starts at 3:00 (${g.t0.toFixed(1)} s)`);
  ok(g.lives0 === 3, 'C · three lives');
  ok(!g.dotsWin, 'eating the last honey dot wins nothing');
  ok(!g.reach0 && g.g0 && g.g1 && g.g2 && !g.reach3, 'each gate opens on its word, and with three open the hive is still unreachable');
  ok(g.shutHolds, 'the fourth gate holds shut: pushing into it goes nowhere and wins nothing');
  ok(g.g3 && g.reach4, 'the fourth word opens the last gate, and only then can the hive be reached');
  ok(g.won, `flying into the hive through all four gates wins ("${g.endTitle}")`);
  ok(g.coins === 4 && w1 - w0 === 4, `one coin a flower word: ${g.coins} for 4 gates (wallet +${w1 - w0})`);
  ok(g.lv.length === 1 && g.lv[0][0] === 'honeycombRun' && g.lv[0][1] === 1, `L · SB_LEVEL.after once with right÷met: ${JSON.stringify(g.lv)} (${g.right}/${g.met})`);
  await close(pg);

  /* T3 · a miss holds; T1/T2 · random against perfect */
  console.log('\n  T3 · a miss holds   T1/T2 · random bot');
  await launch(pg, 'easy');
  const m = await pg.evaluate(async () => { const out = {}; _maze.noMoths(); _lvCalls.length = 0; const s0 = _sfx.length; const e0 = earnedSoFar();
    const g = _maze.state().gates[0]; _maze.warp(g.fc, g.fr); await _U(() => _maze.state().card === 'gate', 4000);
    /* a card left alone stays: the old one had a 12 s fuse */
    const tCard = _maze.state().t; await new Promise(r => setTimeout(r, 2500));
    out.cardStays = _maze.state().card === 'gate' && !!document.querySelector('#hc-cardhost .hc-card') && _maze.state().t === tCard;
    if (!document.querySelector('#sg-ci')) return out;    // the card closed on its own: every check below fails, as it should
    const w = _maze.word(); document.querySelector('#sg-ci').value = 'qzqzx'; document.querySelector('#sg-cgo').click();
    await new Promise(r => setTimeout(r, 200));
    const miss = () => [...document.querySelectorAll('#arc-host .arcx-miss, #arc-host .sb-miss')].find(e => e.getClientRects().length);
    const shows = () => { const c = miss(); if (!c) return false; const txt = (c.textContent || '') + ' ' + [...c.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ');
      return txt.replace(/[^a-z]/gi, '').toLowerCase().includes(w.toLowerCase()); };
    const t1 = _maze.state().t; out.up1 = shows(); await new Promise(r => setTimeout(r, 2500)); out.up2 = shows(); out.clockHeld = _maze.state().t === t1;
    out.wrongSfx = _sfx.slice(s0).includes('wrong');
    await _cont(); out.gone = !miss();
    out.shut = !_maze.state().gates[0].open;
    /* stand off and back on: the gate asks again, with a new word */
    _maze.warp(g.fc + (g.fc > 1 ? -1 : 1), g.fr); await new Promise(r => setTimeout(r, 150));
    _maze.warp(g.fc, g.fr); await _U(() => _maze.state().card === 'gate', 4000); out.newWord = _maze.word() && _maze.word() !== w;
    (document.querySelector('#hc-later') || { click() {} }).click(); await _U(() => !_maze.state().card, 2000);
    /* the random bot: each gate, a random answer, Continue */
    let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 8; k++) { const i = k % 4; const gg = _maze.state().gates[i]; _maze.warp(gg.fc + (gg.fc > 1 ? -1 : 1), gg.fr); await new Promise(r => setTimeout(r, 60));
      const len = 5; const r = await _gate(i, Array.from({ length: len }, () => 'qxzjvkw'[Math.floor(rnd() * 7)]).join(''));
      if (r.card) await _cont(); }
    out.coins = earnedSoFar() - e0; out.right = _maze.state().right; out.met = _maze.state().met; out.anyOpen = _maze.state().gates.some(x => x.open);
    return out; });
  ok(m.cardStays, 'a spell card left alone stays up, with the clock stopped (no fuse)');
  ok(m.up1 && m.up2 && m.clockHeld, 'T3 · a wrong word shows the word at once and holds it 2.5 s later, the clock stopped');
  ok(m.wrongSfx, "the miss plays sfx('wrong')");
  ok(m.gone && m.shut && m.newWord, 'Continue lets go; the gate stays shut and asks a NEW word next time');
  ok(m.coins === 0 && m.right === 0 && !m.anyOpen, `T1 · the random bot earns 0 coins and opens no gate (${m.right}/${m.met} right)`);
  ok((m.met ? m.right / m.met : 0) < 0.25 * 1, 'T2 · random scores under 25% of the perfect bot (which scored 100% above)');
  await close(pg);

  /* C · Champ's clock, and Out of lives */
  console.log('\n  C · clocks and lives');
  await launch(pg, 'champ');
  const c2 = await pg.evaluate(async () => { const t = _maze.state().t;
    /* fly straight into a moth, three times (two seconds of grace after each hit) */
    for (let k = 0; k < 8 && !_maze.state().over && _maze.state().lives > 0; k++) { const L = _maze.state().lives;
      await _U(() => { const mo = _maze.state().moths[0]; if (mo) _maze.warp(mo.px, mo.py); return _maze.state().lives < L || _maze.state().over; }, 3500);
      await new Promise(r => setTimeout(r, 2100)); }
    await _U(() => !!document.querySelector('#arc-host .sg-endcard'), 4000);
    const end = document.querySelector('#arc-host .sg-endcard');
    return { t, lives: _maze.state().lives, title: end ? end.querySelector('.sg-end-h').textContent : '' }; });
  ok(c2.t >= 119 && c2.t <= 120, `C · Champ's clock starts at 2:00 (${c2.t.toFixed(1)} s)`);
  ok(c2.lives === 0 && c2.title === 'Out of lives', `C · three hits and the round ends "Out of lives" ("${c2.title}")`);
  await close(pg);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();

  /* T4 · the round clock at 4× CPU throttle */
  console.log('\n  T4 · 4× CPU throttle');
  { const { ctx: c4, pg: p4 } = await open(b);
    await launch(p4, 'medium'); await p4.evaluate(() => { _maze.noMoths(); _maze.setTime(5); });
    const cdp = await c4.newCDPSession(p4); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const t4 = await p4.evaluate(() => new Promise(res => { let t0 = null, x0 = 0, last = null, clamped = 0, gap = 0;
      (function f(now) { const s = _maze.state();
        if (t0 != null && last != null) { clamped += Math.min(0.25, (now - last) / 1000); gap = Math.max(gap, now - last); }
        last = now;
        if (t0 == null && s.t <= 4.5) { t0 = now; x0 = s.t; }
        if (t0 != null && s.t <= 1.5) { res({ secs: (now - t0) / 1000, clamped, gap, dt: x0 - s.t }); return; }
        requestAnimationFrame(f); })(performance.now()); }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const err = Math.abs(t4.clamped - t4.dt) / t4.dt;
    ok(err <= 0.03, `T4 · the round clock ran ${t4.dt.toFixed(2)} s while the shared clock read ${t4.clamped.toFixed(2)} s (${(err * 100).toFixed(1)}% off, ≤ 3%)`);
    if (t4.gap < 250) { const ew = Math.abs(t4.secs - t4.dt) / t4.dt; ok(ew <= 0.03, `T4 · and on the wall clock: ${t4.secs.toFixed(2)} s (${(ew * 100).toFixed(1)}% off)`); }
    else console.log(`  --     T4 · wall clock not compared: a frame stalled ${Math.round(t4.gap)} ms (machine load), past the clock's 250 ms cap`);
    await c4.close(); }

  /* T11 · the D-pad and the keys */
  console.log('\n  T11 · controls on screen');
  const padCheck = pg2 => pg2.evaluate(() => { const pad = document.querySelector('#sg-dpad'); const r = pad.getBoundingClientRect();
    const btns = [...pad.querySelectorAll('button')]; const vis = b => { const q = b.getBoundingClientRect(); const el = document.elementFromPoint(q.left + q.width / 2, Math.min(innerHeight - 1, q.top + q.height / 2));
      return q.bottom <= innerHeight + 0.5 && el && (el === b || b.contains(el)); };
    return { mid: r.left + r.width / 2, vw: innerWidth, allVis: btns.every(vis), down: vis(pad.querySelector('[data-d="down"]')), minH: Math.min(...btns.map(b => b.getBoundingClientRect().height)) }; });
  { const { ctx: cd, pg: pd } = await open(b, { w: 1280, h: 800 }); await launch(pd, 'medium');
    const d = await padCheck(pd);
    ok(d.down && d.allVis, 'desktop 1280×800: the D-pad is on screen, its bottom row included');
    await cd.close(); }
  { const { ctx: cp, pg: pp, errs: e2 } = await open(b, { w: 390, h: 844, touch: true }); await launch(pp, 'easy');
    const d = await padCheck(pp);
    ok(d.allVis && Math.abs(d.mid - d.vw / 2) <= 4 && d.minH >= 44, `phone 390×844: the D-pad is centred (${Math.round(d.mid)} of ${d.vw}) and every button on screen, ${Math.round(d.minH)}px`);
    const k = await pp.evaluate(async () => { _maze.noMoths(); const g = _maze.state().gates[0]; _maze.warp(g.fc, g.fr); await _U(() => _maze.state().card === 'gate', 4000);
      const keys = [...document.querySelectorAll('#hc-keys button')].filter(x => x.getClientRects().length);
      const bad = keys.filter(x => { const r = x.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.height < 40 || r.bottom > innerHeight || !(el === x || x.contains(el)); });
      const minH = keys.length ? Math.min(...keys.map(x => x.getBoundingClientRect().height)) : 0;
      const w = _maze.word(); const find = ch => keys.find(x => (x.dataset.k || x.textContent || '').trim().toLowerCase() === ch);
      for (const ch of w) { const bt = find(ch); if (bt) bt.click(); }
      const ent = keys.find(x => x.dataset.k === '⏎' || /enter/i.test(x.getAttribute('aria-label') || x.dataset.k || x.textContent || '')); if (ent) ent.click();
      await _U(() => _maze.state().gates[0].open, 2000);
      return { n: keys.length, minH, bad: bad.length, open: _maze.state().gates[0].open,
        padBack: !!document.querySelector('#sg-dpad') && document.querySelector('#sg-dpad').getClientRects().length > 0 }; });
    ok(k.n >= 26 && k.minH >= 40 && !k.bad, `T11 · a spell card on a phone brings up ${k.n} keys, ${Math.round(k.minH)}px tall, none off screen or covered`);
    ok(k.open && k.padBack, 'tapping them spells the gate open, and the D-pad comes back');
    ok(!e2.length, 'no page errors on the phone' + (e2.length ? ': ' + e2[0] : ''));
    await cp.close(); }
  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
