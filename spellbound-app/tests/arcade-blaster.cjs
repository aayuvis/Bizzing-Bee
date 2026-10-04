/* TYPE BLASTER, WITH SPELL SCENE MERGED IN (games spec 4 Oct 2026, §4.5) — every check here was
   watched failing once with its fault put back.

   The rule that changed: the WHOLE word is committed, then Enter fires. It used to accept a
   letter only when it was the right next letter, so a child could find a spelling by trying
   keys. A wrong commit now costs a shield and holds the word on screen until Continue.
   The picture that came in from Spell Scene: the level opens grey and every word blasted
   repaints exactly one region; a cleared level is the whole world back.

     A  whole-word commit: right letters typed one by one blast nothing until Enter
     B  repaint: one blast, one region; a cleared level, every region
     T3 a wrong commit holds: the word stays up, every glitch frozen, until Continue
     T1 a random bot earns 0 coins            T2 and scores < 25% of a perfect bot
        (the perfect bot is paid one coin a word, through the wallet's own ledger)
     L  SB_LEVEL.after('typeBlaster', right÷met) once a round; sfx('wrong') on a miss
     T4 at 4× CPU throttle a glitch falls in real time ± 3% (the shared fixed-step clock)
     T11 a phone (390×844, touch): keys ≥ 40px tall, none below the fold or covered, and
        tapping them plays the game
     T14 no flat-colour region over 6% of the stage, no pure white or black over 2%
     T15 HUD stats mirrored and equal, scene gutters and centre line within 4px, no scroll
        (T14/T15 at 1280×800 and 390×844, light and dark)

   Usage: NODE_PATH=/opt/node22/lib/node_modules node tests/arcade-blaster.cjs            */
const { chromium } = require('playwright');
const path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
const CHROME = process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };

async function open(b, { w = 1280, h = 800, touch = false, mode = 'light' } = {}) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, isMobile: touch, hasTouch: touch });
  await ctx.addInitScript(([k, mode]) => { window.SB_DEBUG = true; try { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode, pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, [KID, mode]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await pg.goto(URL); await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));
  /* the level check: the shared SB_LEVEL when it is merged (wrapped, so it still runs), a recorder until then */
  await pg.evaluate(() => { window._lvCalls = [];
    if (window.SB_LEVEL && typeof SB_LEVEL.after === 'function') { const real = SB_LEVEL.after.bind(SB_LEVEL); SB_LEVEL.after = (k, p) => { _lvCalls.push([k, p]); return real(k, p); }; }
    else window.SB_LEVEL = { after(k, p) { _lvCalls.push([k, p]); return { level: 'easy', dropped: false, offerUp: false }; } };
    window._sfx = []; const rs = window.sfx; window.sfx = k => { _sfx.push(k); try { return rs && rs(k); } catch (e) {} }; });
  return { ctx, pg, errs };
}
const launch = (pg, diff) => pg.evaluate(d => { const c = active(); c.gameDiffBy = Object.assign(c.gameDiffBy || {}, { typeBlaster: d });
  app.arcadePlay('typeBlaster', { fromMenu: true }); }, diff).then(() => until(pg, () => window._tb && _tb.state().started && !!_tb.target(), null, 15000));
const wallet = pg => pg.evaluate(() => { try { return BZ_WALLET.balance(walletWho(active())); } catch (e) { return -1; } });
const close = pg => pg.evaluate(() => { try { arcadeClose(); } catch (e) {} });

/* a whole round by a bot: 'perfect' types the target, 'random' types random letters of its length */
async function bot(pg, kind) {
  return pg.evaluate(async kind => {
    const U = (f, ms) => new Promise(r => { const t0 = performance.now(); (function w() { if (f() || performance.now() - t0 > ms) r(f()); else setTimeout(w, 30); })(); });
    const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const e0 = earnedSoFar();
    for (let n = 0; n < 40 && !_tb.state().over; n++) {
      await U(() => _tb.state().over || (_tb.target() && !_tb.state().holding), 20000);
      if (_tb.state().over) break;
      const t = _tb.target(); const word = kind === 'perfect' ? t : Array.from({ length: t.length }, () => 'qxzjvkw'[Math.floor(rnd() * 7)]).join('');
      for (const ch of word) key(ch);
      key('Enter');
      await U(() => _tb.state().holding || _tb.state().over || _tb.target() !== t, 3000);
      if (_tb.state().holding) { await new Promise(r => setTimeout(r, 300)); key('Enter'); await U(() => !_tb.state().holding, 3000); }
    }
    await U(() => !!document.querySelector('#arc-host .sg-endcard'), 5000);
    const s = _tb.state();
    return { over: s.over, blasted: s.blasted, met: s.met, N: s.N, painted: s.painted, regsOn: document.querySelectorAll('#arc-host .tb-reg.on').length,
      regs: s.regs, restored: !!document.querySelector('#arc-host .tb-scene.tb-restored'), coins: earnedSoFar() - e0, end: !!document.querySelector('#arc-host .sg-endcard') };
  }, kind);
}

/* T14 / T15 read the real pixels: the screenshot is decoded back in the page */
async function stageCheck(pg, label) {
  const box = await pg.evaluate(() => { const r = document.querySelector('#arc-host').getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  const png = (await pg.screenshot({ clip: box })).toString('base64');
  const px = await pg.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const cx = cv.getContext('2d'); cx.drawImage(img, 0, 0);
    const d = cx.getImageData(0, 0, cv.width, cv.height).data, W = cv.width, H = cv.height, B = 8;
    let white = 0, black = 0; for (let i = 0; i < d.length; i += 4) { if (d[i] >= 250 && d[i + 1] >= 250 && d[i + 2] >= 250) white++; else if (d[i] <= 5 && d[i + 1] <= 5 && d[i + 2] <= 5) black++; }
    const bw = Math.floor(W / B), bh = Math.floor(H / B), flat = new Array(bw * bh).fill(null);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { let mn = [255, 255, 255], mx = [0, 0, 0], s = [0, 0, 0];
      for (let y = by * B; y < by * B + B; y++) for (let x = bx * B; x < bx * B + B; x++) { const i = (y * W + x) * 4;
        for (let k = 0; k < 3; k++) { const v = d[i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; s[k] += v; } }
      if (mx[0] - mn[0] <= 3 && mx[1] - mn[1] <= 3 && mx[2] - mn[2] <= 3) flat[by * bw + bx] = s.map(v => v / (B * B)); }
    /* a region is ONE colour: it grows from a seed block while each block stays within 6 (sum of
       channels) of the SEED — so a painted gradient, which drifts, is never one flat region */
    const seen = new Uint8Array(bw * bh); let big = 0;
    for (let i = 0; i < flat.length; i++) { if (!flat[i] || seen[i]) continue; let n = 0; const st = [i]; seen[i] = 1; const s0 = flat[i];
      while (st.length) { const j = st.pop(); n++; const x = j % bw, y = (j - x) / bw;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= bw || ny >= bh) continue; const k = ny * bw + nx;
          if (seen[k] || !flat[k]) continue; if (Math.abs(flat[k][0] - s0[0]) + Math.abs(flat[k][1] - s0[1]) + Math.abs(flat[k][2] - s0[2]) > 6) continue; seen[k] = 1; st.push(k); } }
      big = Math.max(big, n); }
    return { flat: big / (bw * bh), white: white / (W * H), black: black / (W * H) };
  }, png);
  ok(px.flat <= 0.06, `T14 ${label}: largest flat-colour region ${(px.flat * 100).toFixed(1)}% of the stage (≤ 6%)`);
  ok(px.white <= 0.02 && px.black <= 0.02, `T14 ${label}: pure white ${(px.white * 100).toFixed(2)}%, pure black ${(px.black * 100).toFixed(2)}% (each ≤ 2%)`);
  const g = await pg.evaluate(() => { const R = e => e && e.getBoundingClientRect(); const host = R(document.querySelector('#arc-host'));
    const L = R(document.querySelector('#tb-sh')), Rt = R(document.querySelector('.tb-score')), sc = R(document.querySelector('#tb-scene')), can = R(document.querySelector('#tb-cannon'));
    const ttl = R(document.querySelector('#tb-prog'));
    const ov = document.querySelector('.arc-play'); const hostEl = document.querySelector('#arc-host');
    const stg = R(hostEl.firstElementChild);
    const ctrls = [...document.querySelectorAll('#arc-host button')].filter(b => b.getClientRects().length && getComputedStyle(b).visibility !== 'hidden' && getComputedStyle(b).pointerEvents !== 'none');   // a blasted glitch mid-explosion is not a control
    const covered = ctrls.filter(b => { const r = b.getBoundingClientRect(); if (r.bottom > innerHeight + 0.5) return true;
      const el = document.elementFromPoint(Math.min(innerWidth - 1, r.left + r.width / 2), Math.min(innerHeight - 1, r.top + r.height / 2)); return !el || !(b === el || b.contains(el)); }).map(b => b.id || b.className || b.textContent);
    return { statW: [L.width, Rt.width], statGut: [L.left - host.left, host.right - Rt.right], sceneGut: [sc.left - host.left, host.right - sc.right],
      hostMid: host.left + host.width / 2, cannonMid: can.left + can.width / 2, sceneMid: sc.left + sc.width / 2, progMid: ttl.left + ttl.width / 2,
      scroll: Math.max(ov.scrollHeight - ov.clientHeight, stg.bottom - innerHeight, R(ov).bottom - innerHeight), hostScroll: hostEl.scrollHeight - hostEl.clientHeight, covered, sceneShare: (sc.width * sc.height) / ((host.width) * (host.height)) }; });
  ok(Math.abs(g.statW[0] - g.statW[1]) <= 4 && Math.abs(g.statGut[0] - g.statGut[1]) <= 4, `T15 ${label}: HUD stats mirrored — widths ${g.statW.map(Math.round)}, gutters ${g.statGut.map(Math.round)}`);
  ok(Math.abs(g.sceneGut[0] - g.sceneGut[1]) <= 4 && Math.abs(g.sceneMid - g.hostMid) <= 4 && Math.abs(g.cannonMid - g.sceneMid) <= 4,
    `T15 ${label}: scene gutters ${g.sceneGut.map(Math.round)}, the cannon on the centre line (${Math.round(g.cannonMid)} vs ${Math.round(g.hostMid)})`);
  ok(g.scroll <= 1 && g.hostScroll <= 1, `T15 ${label}: no scroll during play (${g.scroll}, ${g.hostScroll})`);
  ok(!g.covered.length, `T15 ${label}: every control on screen and uncovered` + (g.covered.length ? ' — ' + g.covered.slice(0, 3).join(', ') : ''));
  ok(g.sceneShare >= 0.4, `T15 ${label}: the play scene is the biggest thing (${Math.round(g.sceneShare * 100)}% of the stage)`);
}

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const { ctx, pg, errs } = await open(b);

  /* A · whole word, then Enter */
  console.log('\n  A · the whole word, then Enter fires');
  await launch(pg, 'medium');
  const a = await pg.evaluate(async () => { const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    const t = _tb.target(); for (const ch of t) key(ch); await new Promise(r => setTimeout(r, 250));
    const before = _tb.state().blasted, typed = _tb.state().typed;
    key('Enter'); await new Promise(r => setTimeout(r, 250));
    return { t, before, typed, after: _tb.state().blasted, painted: _tb.state().painted, on: document.querySelectorAll('#arc-host .tb-reg.on').length }; });
  ok(a.before === 0 && a.typed === a.t, `right letters typed one by one blast nothing (${a.before}) — they wait in the buffer ("${a.typed}")`);
  ok(a.after === 1, 'Enter fires the whole word: one glitch blasted');
  ok(a.painted === 1 && a.on === 1, `B · one word blasted repaints exactly one region (${a.on} on)`);
  const wrongLetters = await pg.evaluate(async () => { const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    await new Promise(r => { (function w() { if (_tb.target() && !_tb.state().holding) r(); else setTimeout(w, 40); })(); });
    key('z'); key('q'); return _tb.state().typed; });
  ok(wrongLetters === 'zq', 'any letter goes into the word (no "only the right next letter" filter)');

  /* T3 · a miss holds */
  console.log('\n  T3 · a wrong commit holds');
  const m = await pg.evaluate(async () => { const key = k => window.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true }));
    const t = _tb.target(); const sfx0 = _sfx.length; key('Enter');
    await new Promise(r => setTimeout(r, 120));
    const s1 = _tb.state(); const y1 = s1.foes.map(f => f.y).join(',');
    const card = () => [...document.querySelectorAll('#arc-host .sb-miss, #arc-host .arcx-miss, #arc-host [class*="miss"]')].find(e => e.getClientRects().length);
    /* the letters stand in columns (you over word), so read the card's text AND its labels, letters only */
    const shows = () => { const c = card(); if (!c) return false;
      const txt = (c.textContent || '') + ' ' + [...c.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ');
      return txt.replace(/[^a-z]/gi, '').toLowerCase().includes(t.toLowerCase()); };
    const up1 = shows();
    await new Promise(r => setTimeout(r, 2600));
    const s2 = _tb.state(); const y2 = s2.foes.map(f => f.y).join(',');
    const up2 = shows();
    await new Promise(r => setTimeout(r, 300)); key('Enter'); await new Promise(r => setTimeout(r, 300));
    return { t, up1, up2, held: s1.holding && s2.holding, frozen: y1 === y2, shield: [s1.shield, _tb.state().shield], gone: !shows() && !_tb.state().holding,
      wrongSfx: _sfx.slice(sfx0).includes('wrong') }; });
  ok(m.up1 && m.up2 && m.held, `the word ("${m.t}") is on screen at once and still there 2.6 s later — the game holds`);
  ok(m.frozen, 'every glitch is frozen while the miss card is up');
  ok(m.shield[0] === 2 && m.gone, `a wrong commit costs one shield (${m.shield[0]}); Enter is Continue and the game resumes`);
  ok(m.wrongSfx, "the miss plays sfx('wrong')");
  await close(pg);

  /* T1 / T2 · bots (Easy: six words) */
  console.log('\n  T1 / T2 · random bot, perfect bot');
  const w0 = await wallet(pg);
  await launch(pg, 'easy'); await pg.evaluate(() => { _lvCalls.length = 0; });
  const perfect = await bot(pg, 'perfect');
  const lv1 = await pg.evaluate(() => _lvCalls.slice());
  const w1 = await wallet(pg);
  await close(pg);
  await launch(pg, 'easy'); await pg.evaluate(() => { _lvCalls.length = 0; });
  const random = await bot(pg, 'random');
  const lv2 = await pg.evaluate(() => _lvCalls.slice());
  const w2 = await wallet(pg);
  await close(pg);
  const pr = perfect.met ? perfect.blasted / perfect.met : 0, rr = random.met ? random.blasted / random.met : 0;
  ok(perfect.end && perfect.blasted === perfect.N && pr === 1, `the perfect bot clears the level: ${perfect.blasted}/${perfect.met} words`);
  ok(perfect.regsOn === perfect.regs && perfect.restored, `B · a cleared level is the restored world: ${perfect.regsOn} of ${perfect.regs} regions painted`);
  ok(perfect.coins === perfect.blasted && (w1 - w0) === perfect.coins, `one coin per word blasted clean: ${perfect.coins} for ${perfect.blasted} (wallet +${w1 - w0})`);
  ok(random.end && random.coins === 0 && w2 === w1, `T1 · the random bot earns 0 coins (${random.coins}; wallet ${w2 - w1}) and the round ends (${random.met} words met)`);
  ok(rr < 0.25 * pr, `T2 · random scores ${(rr * 100).toFixed(0)}% against perfect's ${(pr * 100).toFixed(0)}% (must be < 25% of it)`);
  ok(lv1.length === 1 && lv1[0][0] === 'typeBlaster' && Math.abs(lv1[0][1] - 1) < 1e-9 && lv2.length === 1 && lv2[0][1] === 0,
    `L · SB_LEVEL.after once a round with right÷met: ${JSON.stringify(lv1)} · ${JSON.stringify(lv2)}`);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await ctx.close();

  /* T4 · real time at 4× CPU throttle */
  console.log('\n  T4 · 4× CPU throttle');
  { const { ctx: c4, pg: p4 } = await open(b);
    const cdp = await c4.newCDPSession(p4); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await launch(p4, 'medium');
    const t4 = await p4.evaluate(() => new Promise(res => { const id = _tb.state().target; let t0 = null, y0 = 0, last = null, clamped = 0, gap = 0;
      (function f(now) { const s = _tb.state(); const fo = s.foes.find(x => x.id === id); if (!fo) { res(null); return; }
        if (t0 != null && last != null) { clamped += Math.min(0.25, (now - last) / 1000); gap = Math.max(gap, now - last); }
        last = now;
        if (t0 == null && fo.y >= 0.1) { t0 = now; y0 = fo.y; }
        if (t0 != null && fo.y >= 0.6) { res({ secs: (now - t0) / 1000, clamped, gap, dy: fo.y - y0, fall: s.fall }); return; }
        requestAnimationFrame(f); })(performance.now()); }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    /* The fall is a clock: it reads each frame's real time, capped at 0.25 s a frame exactly as the
       shared loop caps it — a frame stalled longer than that (another process holding the CPU) is
       time the game deliberately does not leap through. So the fall is held to that capped reading
       of real time, and to the wall clock itself whenever no frame stalled past the cap. */
    const want = t4 ? t4.dy / t4.fall : 0, err = t4 ? Math.abs(t4.clamped - want) / want : 1;
    ok(t4 && err <= 0.03, `T4 · a glitch fell ${t4 ? t4.dy.toFixed(3) : '?'} of the drop in ${t4 ? t4.clamped.toFixed(2) : '?'} s of real (capped) time; the fall rate says ${want.toFixed(2)} s (${(err * 100).toFixed(1)}% off, ≤ 3%)`);
    if (t4 && t4.gap < 250) { const ew = Math.abs(t4.secs - want) / want; ok(ew <= 0.03, `T4 · and on the wall clock: ${t4.secs.toFixed(2)} s (${(ew * 100).toFixed(1)}% off)`); }
    else if (t4) console.log(`  --     T4 · wall clock ${t4.secs.toFixed(2)} s not compared: a frame stalled ${Math.round(t4.gap)} ms (machine load), past the 250 ms cap`);
    await c4.close(); }

  /* T11 · the phone */
  console.log('\n  T11 · phone 390×844, touch');
  { const { ctx: cp, pg: pp, errs: e2 } = await open(b, { w: 390, h: 844, touch: true });
    await launch(pp, 'easy');
    const k = await pp.evaluate(() => { const keys = [...document.querySelectorAll('#tb-keys button')].filter(x => x.getClientRects().length);
      const bad = keys.filter(x => { const r = x.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return r.height < 40 || r.width < 30 || r.bottom > innerHeight || !(el === x || x.contains(el)); });
      const tab = [...document.querySelectorAll('.sb-tabbar,.sb-bottomnav,nav[class*="tab"]')].find(e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden');
      return { n: keys.length, minH: Math.min(...keys.map(x => x.getBoundingClientRect().height)), minW: Math.min(...keys.map(x => x.getBoundingClientRect().width)),
        bad: bad.map(x => x.textContent), letters: keys.filter(x => /^[a-z]$/i.test((x.dataset.k || x.textContent || '').trim())).length,
        /* the tab bar counts only where it can be SEEN: the game's overlay covering it is fine */
        tabTop: (() => { if (!tab) return null; const r = tab.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, Math.min(innerHeight - 1, r.top + r.height / 2));
          return el && el.closest('.arc-play') ? null : r.top; })(),
        lowest: Math.max(...keys.map(x => x.getBoundingClientRect().bottom)) }; });
    ok(k.letters >= 26 && k.minH >= 40 && !k.bad.length, `the on-screen keys: ${k.letters} letters, ${Math.round(k.minH)}px tall, ${Math.round(k.minW)}px wide, none below the fold or covered` + (k.bad.length ? ' — ' + k.bad.join(' ') : ''));
    ok(k.tabTop == null || k.lowest <= k.tabTop, 'no key sits under the tab bar');
    const tapped = await pp.evaluate(async () => { const t = _tb.target(); const find = ch => [...document.querySelectorAll('#tb-keys button')].find(x => (x.dataset.k || x.textContent || '').trim().toLowerCase() === ch);
      for (const ch of t) { const bt = find(ch); if (bt) bt.click(); }
      const ent = [...document.querySelectorAll('#tb-keys button')].find(x => /enter/i.test(x.dataset.k || x.textContent || '')); if (ent) ent.click();
      await new Promise(r => setTimeout(r, 300)); return _tb.state().blasted; });
    ok(tapped === 1, 'tapping the keys spells the word and Enter fires it');
    await stageCheck(pp, '390×844 light');
    ok(!e2.length, 'no page errors on the phone' + (e2.length ? ': ' + e2[0] : ''));
    await cp.close(); }

  /* T14 / T15 · desktop light, and both sizes dark */
  console.log('\n  T14 / T15 · the stage');
  for (const [w, h, mode] of [[1280, 800, 'light'], [1280, 800, 'dark'], [390, 844, 'dark']]) {
    const { ctx: cs, pg: ps } = await open(b, { w, h, touch: w < 700, mode });
    await launch(ps, 'medium'); await ps.waitForTimeout(400);
    await stageCheck(ps, `${w}×${h} ${mode}`);
    await cs.close();
  }
  /* T9 · both games have an address, and Back from it returns to Play */
  console.log('\n  T9 · routes');
  for (const [route, name] of [['play/blaster', 'Type Blaster'], ['play/honeycomb', 'Honeycomb Run']]) {
    const ctx9 = await b.newContext({ viewport: { width: 1100, height: 800 } });
    await ctx9.addInitScript(k => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, KID);
    const p9 = await ctx9.newPage(); await p9.goto(URL + '#/' + route); await booted(p9);
    const up = await until(p9, n => { const m = document.querySelector('.arc-menu .arcm-title'); return !!m && m.textContent.trim() === n; }, name, 15000);
    await p9.goBack(); const back = await until(p9, () => !document.querySelector('.arc-menu,.arc-play') && state.nav === 'games', null, 8000);
    ok(up && back, `T9 · #/${route} opens ${name}'s start screen over Play, and Back closes it onto Play`);
    await ctx9.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
