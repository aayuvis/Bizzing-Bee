/* BEE GRAND PRIX — PLAYED AS A CHILD PLAYS IT: a miss that holds, a phone held upright, a
   slow phone, an address, a ghost, the Cup and the garage (games spec §2.4, §2.7–§2.10).

     GP8   a miss shows the word — the letters that differ marked — and the race stays stopped
           until Continue (Enter or a tap); then it counts back in
     GP10  upright at 390×844: nothing below the fold, the thumb band mirrored (Steer Left and
           Steer Right equal gutters, Brake and the slot centred, within 4px); at a box the card
           and its keys replace the band, keys ≥ 40px tall, all on screen
     GP7   4× CPU throttle: race time keeps to the wall clock ± 3% (physics on a fixed step)
     GP13  #/play/grandprix opens the Grand Prix; Back returns to Play (from the menu and from
           a race)
     §2.9  drawDist falls 100 → 70 under 50fps (headless draws in software, so it falls here);
           a phone's canvas is capped at DPR 1.5; puffs never exceed 120
     §2.7  a best lap is kept per track + difficulty and races as a see-through ghost next time;
           the Cup is four races in one sitting, each track's words from its family, standings
           at the end; the garage sells paint at a printed price through the family wallet,
           a milestone trail opens with its milestone, and the race wears what you chose

   Proved by breaking (4 Oct 2026), each put back and the file cmp'd: a miss that resumes at once →
   GP8; the brake 14px off centre → GP10; the old frame-clamped loop → GP7; drawDist never
   adapting → §2.9; DPR uncapped on a phone → §2.9; no 'grandprix' slug → GP13; the ghost never
   saved → §2.7; the Cup ignoring its families → §2.7 (this check first read the family from the
   race's own state, which the fault blanked too — it reads the Cup's table now); the garage
   handing paint over without the wallet → §2.7.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/gp-play.cjs                        */
const { chromium } = require('playwright');
const path = require('path');
const { booted, lazy, until, raceTime } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ONLY = process.env.GP_ONLY ? process.env.GP_ONLY.split(',') : null;
const want = k => !ONLY || ONLY.includes(k);
const SEED = (who) => () => { window.SB_DEBUG = true; try { if (!localStorage.getItem('gpp-seeded')) {
  localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', activeIdx: 0,
    children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, unlockedThemes: ['spellbound'], xp: 40, level: 3 }] }));
  localStorage.setItem('gpp-seeded', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} };
const CHROME = process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p));

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const errs = [];
  const launch = async (pg, o) => { await pg.evaluate(o => app.arcadePlay('beeGrandPrix', { opts: { scene: o.scene || 'meadow', drive: o.drive || 'medium', kart: 'kart' }, fromMenu: true }), o);
    return until(pg, () => window._race && window._race.state().mode === 'race', null, 30000); };

  /* ---------------- GP8: a miss holds ---------------- */
  if (want('GP8')) {
    const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(SEED()); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await lazy(pg, 'arcade');
    await launch(pg, {});
    await pg.evaluate(() => { const R = window._race; R.steerTo(0); R.setV(0.8); R.gateNow(); });
    await until(pg, () => window._race.state().mode === 'spell', null, 10000);
    const word = await pg.evaluate(() => window._race.state().word);
    await pg.evaluate(() => window._race.spell('qqqq'));
    const p0 = await pg.evaluate(() => window._race.state().pos);
    await pg.waitForTimeout(2500);   // a real wait on purpose: the claim IS that nothing moves while the card is up
    const held = await pg.evaluate(w => { const c = document.querySelector('.arc-play #sg-card'); const s = window._race.state();
      return { mode: s.mode, pos: s.pos, shown: !!c && getComputedStyle(c).display !== 'none' && (c.textContent || '').toLowerCase().includes(String(w).toLowerCase()),
        marked: !!(c && c.querySelector('.gp-miss-x, mark, .sg-miss-x, [class*="diff"]')), held: s.held }; }, word);
    ok(held.mode === 'spell' && held.pos === p0 && held.shown && !held.held,
      `GP8: a miss shows "${word}" and the race stays stopped 2.5s later (${held.mode}, moved ${Math.round(held.pos - p0)}), no power-up (${held.held})`);
    ok(held.marked, 'the letters that differ are marked on the miss card');
    await pg.keyboard.press('Enter');
    const back = await until(pg, () => window._race.state().mode === 'race', null, 8000);
    ok(back, 'Enter on the miss card continues, and the race counts back in');
    await pg.close();
  }

  /* ---------------- GP10: upright ---------------- */
  if (want('GP10')) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await ctx.addInitScript(SEED()); const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await lazy(pg, 'arcade');
    await launch(pg, {});
    const band = await pg.evaluate(() => { const R = e => e.getBoundingClientRect();
      const L = R(document.querySelector('.arc-play .sg-sbtn[data-s="-1"]')), Rt = R(document.querySelector('.arc-play .sg-sbtn[data-s="1"]')),
        B = R(document.querySelector('.arc-play #sg-brk')), H = R(document.querySelector('.arc-play #sg-hold')), W = innerWidth;
      const all = [...document.querySelectorAll('.arc-play button')].filter(x => x.offsetParent !== null).map(R);
      return { gl: L.left, gr: W - Rt.right, bc: (B.left + B.right) / 2 - W / 2, hc: (H.left + H.right) / 2 - W / 2, vy: L.top - Rt.top,
        below: all.filter(q => q.bottom > innerHeight + 0.5).length, scroll: (o => o.scrollHeight - o.clientHeight)(document.querySelector('.arc-play')), dpr: window._race.state().dpr }; });
    ok(Math.abs(band.gl - band.gr) <= 4 && Math.abs(band.bc) <= 4 && Math.abs(band.hc) <= 4 && Math.abs(band.vy) <= 4,
      `GP10: the thumb band is mirrored — gutters ${band.gl.toFixed(1)} / ${band.gr.toFixed(1)}px, Brake ${band.bc.toFixed(1)}px and the slot ${band.hc.toFixed(1)}px off centre, the arrows level (${band.vy.toFixed(1)})`);
    ok(!band.below && band.scroll <= 0, `GP10: nothing below the fold (${band.below} controls under it, ${band.scroll}px of scroll in the race overlay)`);
    ok(band.dpr === 1.5, `§2.9: a phone's canvas is capped at DPR 1.5 (device 3 → ${band.dpr})`);
    await pg.evaluate(() => { const R = window._race; R.steerTo(0); R.setV(0.8); R.gateNow(); });
    await until(pg, () => window._race.state().mode === 'spell', null, 10000);
    const box = await pg.evaluate(() => { const c = document.querySelector('.arc-play #sg-card .sg-cardbox'), q = c.getBoundingClientRect();
      const keys = [...c.querySelectorAll('.gp-k, [data-k], .sg-key')].map(k => k.getBoundingClientRect());
      return { b: q.bottom, t: q.top, n: keys.length, low: keys.filter(k => k.height < 40).length, off: keys.filter(k => k.bottom > innerHeight || k.left < 0 || k.right > innerWidth).length,
        native: document.querySelector('#sg-ci').readOnly }; });
    ok(box.n >= 26 && !box.low && !box.off && box.b <= 844 && box.native,
      `GP10: at a box the card and ${box.n} keys fill the band (${Math.round(box.t)}–${Math.round(box.b)}px), every key ≥ 40px tall and on screen, no native keyboard (${box.native})`);
    /* the keys type: tap the word in, letter by letter */
    const word = await pg.evaluate(() => window._race.state().word);
    for (const ch of word.toLowerCase()) await pg.evaluate(ch => { const k = document.querySelector('#sg-card [data-k="' + ch + '"]'); if (k) k.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }, ch);
    await pg.evaluate(() => { const k = document.querySelector('#sg-card [data-k="⏎"],#sg-card [data-k="enter"]'); if (k) k.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
    await until(pg, () => window._race.state().met === 1, null, 5000);
    const after = await pg.evaluate(() => window._race.state());
    ok(after.right === 1 && !!after.held, `the on-screen keys spell "${word}" into the box — ${after.right} right, a ${after.held} in the slot`);
    await ctx.close();
  }

  /* ---------------- GP7: a slow phone keeps time ---------------- */
  if (want('GP7')) {
    const pg = await b.newPage({ viewport: { width: 480, height: 400 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(SEED()); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await lazy(pg, 'arcade');
    await launch(pg, {});
    const measure = () => pg.evaluate(async () => { const R = window._race; R.clearBoxes(); R.rivalPowers(false); R.steerLine(true);
      const r0 = R.state().raceT, t0 = performance.now(); await new Promise(r => setTimeout(r, 6000));
      return { race: R.state().raceT - r0, wall: (performance.now() - t0) / 1000, fps: R.state().fps }; });
    const free = await measure();
    const cdp = await pg.context().newCDPSession(pg); await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const slow = await measure();
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const k0 = free.race / free.wall, k1 = slow.race / slow.wall;
    ok(Math.abs(k1 - 1) <= 0.03 && Math.abs(k0 - 1) <= 0.03,
      `GP7: race time keeps to the wall clock — ${(k0 * 100).toFixed(1)}% at ${free.fps}fps, ${(k1 * 100).toFixed(1)}% under a 4× CPU throttle at ${slow.fps}fps (±3%)`);
    await pg.close();
  }

  /* ---------------- §2.9: draw range and puffs ---------------- */
  if (want('PERF')) {
    const pg = await b.newPage({ viewport: { width: 1280, height: 800 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(SEED()); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await lazy(pg, 'arcade');
    await launch(pg, {});
    const p = await pg.evaluate(async () => { const R = window._race; R.clearBoxes(); R.toStraight(80); R.steerTo(0.97); R.setV(1);
      let maxP = 0; const t0 = performance.now(); while (performance.now() - t0 < 4000) { await new Promise(r => requestAnimationFrame(r)); R.steerTo(0.97); R.setV(1); maxP = Math.max(maxP, R.state().puffs); }
      const s = R.state(); return { dd: s.drawDist, fps: s.fps, maxP }; });
    ok(p.fps < 50 ? p.dd === 70 : p.dd === 100, `§2.9: at ${p.fps}fps the draw range is ${p.dd} bands (100, or 70 under 50fps)`);
    ok(p.maxP > 10 && p.maxP <= 120, `§2.9: puffs stay at or under 120 (most at once: ${p.maxP}, on the verge flat out)`);
    await pg.close();
  }

  /* ---------------- GP13: the address (the engine kit's #/play/<slug> overlay route) ---------------- */
  if (want('GP13')) {
    const pg = await b.newPage({ viewport: { width: 1100, height: 760 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(SEED()); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg);
    await pg.evaluate(() => { location.hash = '#/play'; }); await until(pg, () => state.nav === 'games', null, 10000);
    await pg.evaluate(() => { location.hash = '#/play/grandprix'; });
    const opened = await until(pg, () => !!document.querySelector('.arc-play[data-route="play/grandprix"] #sg-cv') && location.hash === '#/play/grandprix', null, 20000);
    ok(opened, `GP13: #/play/grandprix opens the Grand Prix (${await pg.evaluate(() => !!document.querySelector('.arc-play #sg-cv') + ' at ' + location.hash)})`);
    await pg.goBack();
    const back1 = await until(pg, () => !document.querySelector('.arc-play') && state.nav === 'games' && location.hash === '#/play', null, 10000);
    ok(back1, `GP13: Back returns to Play and the race is gone (${await pg.evaluate(() => state.nav + ' ' + location.hash + ' ' + !!document.querySelector('.arc-play'))})`);
    /* and opened by a tap from the start menu, Back still lands on Play */
    await pg.evaluate(() => arcadeMenu('beeGrandPrix')); await until(pg, () => !!document.querySelector('.arc-menu #arcm-go'), null, 15000);
    await pg.evaluate(() => document.querySelector('#arcm-go').click());
    const racing = await until(pg, () => !!document.querySelector('.arc-play') && location.hash === '#/play/grandprix', null, 15000);
    await pg.goBack();
    const back2 = await until(pg, () => !document.querySelector('.arc-menu,.arc-play') && state.nav === 'games' && location.hash === '#/play', null, 10000);
    ok(racing && back2, `GP13: a race started from the menu has the address too, and Back returns to Play (${await pg.evaluate(() => state.nav + ' ' + location.hash)})`);
    await pg.close();
  }

  /* ---------------- §2.7: the ghost, the Cup, the garage ---------------- */
  if (want('MORE')) {
    const pg = await b.newPage({ viewport: { width: 900, height: 700 } }); pg.on('pageerror', e => errs.push(e.message));
    await pg.addInitScript(SEED()); await pg.goto('file://' + ROOT + '/index.html'); await booted(pg); await lazy(pg, 'arcade');
    /* a best lap is kept, and the next race on that track and difficulty carries it */
    const g = await pg.evaluate(async () => { const mount = (o) => { document.querySelectorAll('.gpm').forEach(n => n.remove());
        const h = document.createElement('div'); h.className = 'gpm'; h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
        window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: o.drive || 'medium', scene: o.scene || 'sunset', autoGo: true, cup: o.cup }, () => {}); return h; };
      mount({}); const R = window._race; R.bot({ drive: 'line', seed: 2, spell: (w, p) => ({ typed: w.w, secs: p.par * 0.8 }) }); const res = R.fast(900);
      const stored = (SB_STORE.getJSON('gpGhost', {}) || {})['sunset|medium'];
      mount({}); const R2 = window._race; R2.clearBoxes(); R2.fast(1.2);
      await new Promise(r => setTimeout(r, 1500)); const s2 = R2.state();
      mount({ scene: 'city' }); const s3 = window._race.state();
      return { best: res && res.best, stored: stored && { t: stored.t, n: stored.s.length }, ghost: s2.ghost, drawn: s2.ghostDrawn, other: s3.ghost }; });
    ok(g.stored && g.stored.t === g.best && g.stored.n > 100 && g.ghost && g.drawn > 0 && !g.other,
      `§2.7: the best lap (${g.best}s) is kept for Sunset Canyon at Medium (${g.stored && g.stored.n} samples) and races as a ghost next time (drawn ${g.drawn} frames); Neon City has none (${g.other})`);
    /* the Cup: four races, each its own family, standings at the end */
    const cup = await pg.evaluate(() => { const h = document.createElement('div'); h.className = 'gpm'; h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
      const st0 = (active().gpStat || {}).cups || 0; const seen = [];
      window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: 'medium', scene: 'cup', autoGo: true }, () => { seen.push('done'); });
      for (let i = 0; i < 4; i++) { const R = window._race; const s = R.state(); const fam = [];
        R.bot({ drive: 'line', seed: i + 1, spell: (w, p) => { fam.push(w.o || ''); return { typed: w.w, secs: p.par * 0.8 }; } }); R.fast(900);
        const cont = h.querySelector('#sg-cont'); seen.push({ scene: s.scene, origin: s.origin, fam: fam.slice(), label: cont && cont.textContent, cupI: s.cup && s.cup.i, rows: h.querySelectorAll('.gp-cup-r').length });
        if (cont) cont.click(); }
      const tab = seen.filter(x => x && x.scene).map(x => x.rows).pop(); return { seen, st0, st1: (active().gpStat || {}).cups || 0, tab, table: window.SB_GP.CUP.map(o => [o.scene, o.origin]) }; });
    /* the family each track SHOULD have comes from the Cup's table, never from the race's own
       state — a race that lost its family would otherwise be judged against nothing */
    const races = cup.seen.filter(x => x && x.scene).map(r => ({ ...r, origin: (cup.table.find(t => t[0] === r.scene) || [])[1] }));
    const famOk = races.every(r => r.fam.filter(o => window_re(r.origin).test(o)).length >= r.fam.length * 0.8);
    function window_re(o) { return { english: /english|germanic|norse/i, greek: /greek/i, latin: /latin/i, french: /french|anglo-norman/i }[o] || /./; }
    ok(races.map(r => r.scene).join() === 'meadow,sunset,city,bazaar' && famOk,
      `§2.7: the Cup is four races in one sitting — ${races.map(r => r.scene + ' (' + r.origin + ': ' + r.fam.filter(o => window_re(r.origin).test(o)).length + '/' + r.fam.length + ')').join(', ')}`);
    ok(/Next race: Sunset Canyon/.test(races[0].label || '') && cup.st1 === cup.st0 + 1 && cup.tab === 5 && cup.seen[cup.seen.length - 1] === 'done',
      `the Cup leads on ("${races[0].label}"), ends on the standings (${cup.tab} rows), counts a finished Cup (${cup.st0} → ${cup.st1})`);
    /* the garage: a printed price, the family wallet, a milestone trail */
    const gar = await pg.evaluate(async () => { const c = active(), W0 = BZ_WALLET.balance('Ahana');
      arcadeMenu('beeGrandPrix'); await new Promise(r => setTimeout(r, 300));
      document.querySelector('#arcm-gar').click(); await new Promise(r => setTimeout(r, 100));
      const g = document.querySelector('.gp-gar'); const buy = g && g.querySelector('[data-gp-buy="paint|honey"]');
      const price = buy && +(buy.textContent.match(/(\d+)\s*coins/) || [])[1];
      const goldLocked = !!(g && [...g.querySelectorAll('.gp-gar-row')].find(r => /Golden comet/.test(r.textContent) && r.querySelector('.gp-gar-ms')));
      buy && buy.click(); await new Promise(r => setTimeout(r, 50));
      const W1 = BZ_WALLET.balance('Ahana'), owned = (c.gpGar.own.paint || []).includes('honey'), using = c.gpGar.paint;
      const gold = c.gpStat.clean >= 25 ? !!document.querySelector('.gp-gar [data-gp-use="trail|gold"]') : null;
      document.querySelector('.gp-gar [data-gp-x]').click(); const gone = !document.querySelector('.gp-gar');
      arcadeClose();
      const h = document.createElement('div'); h.className = 'gpm'; h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
      window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: 'medium', scene: 'meadow', autoGo: true }, () => {});
      return { W0, W1, price, owned, using, goldLocked, gold, clean: c.gpStat.clean, gone, paint: window._race.state().paint }; });
    ok(gar.price === 40 && gar.W0 - gar.W1 === 40 && gar.owned && gar.using === 'honey' && gar.paint === '#F0B429' && gar.gone,
      `§2.7: the garage sells Honey gold paint at its printed ${gar.price} coins through the family wallet (${gar.W0} → ${gar.W1}), and the next race wears it (${gar.paint})`);
    ok(gar.gold === true, `a milestone trail opens with its milestone, not a price (Golden comet: ${gar.clean} Clean box words → ${gar.gold ? 'open' : 'still locked'})`);
    await pg.close();
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
