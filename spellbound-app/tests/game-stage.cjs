/* THE GAME STAGE AND THE HUB SCREEN (games spec §5.0 T14/T15, §4.0, §8 T11; 4 Oct 2026)

   SGUI.stage and SB_HUB (saga2.js) at 1280×800 and 390×844, light and dusk:
     - the stage fills the space between the shell bar and the tab bar (or the window
       bottom), edge to edge, and the painted plate for the look is the one drawn;
     - T15: HUD stats equal width and mirrored, the title on the centre line, equal play
       gutters, no scroll, nothing under the tab bar, phone controls in the bottom 38%;
     - T14: no flat-colour region over 6% of the stage, pure white and pure black ≤ 2%;
     - T11: on a touch phone the on-screen keys are ≥ 40px, in the controls row, above the
       tab bar; a desktop draws no keys and types on the real keyboard;
     - the play object is the biggest thing: ≥ 50% of the play area on a desktop, ≥ 40% on
       a phone, and the desktop play region is a centred 4:3;
     - the hub: one tile per mode in the order given, a level chip and a best on each, the
       "new" dot on an unplayed mode, the last-played mark, and a tile tap reaches
       SB_HUB_OPEN[hub](mode) through app.hubMode and remembers it as last played;
     - reduced motion: nothing on the stage animates.
   The geometry and pixel checks live in tests/lib/stage-check.cjs for every game to reuse.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/game-stage.cjs                    */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, lazy, until } = require('./lib/wait.cjs');
const SC = require('./lib/stage-check.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = mode => ({ theme: 'spellbound', mode, pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey' }] });
const MODES = [
  { id: 'warmup', title: 'Warm-Up', promise: 'Hear a word, spell it, see why.', best: 'Best 9/10' },
  { id: 'sprint', title: 'Sprint', promise: 'As many as you can in a minute.', isNew: true },
  { id: 'spot', title: 'Spot the Error', promise: 'Find the one spelled wrong.', best: 'Best 7/10' },
  { id: 'squares', title: 'Squares', promise: 'Claim the board one word at a time.' },
  { id: 'doctor', title: 'Word Doctor', promise: 'Mend the words that slipped.' },
  { id: 'challenge', title: 'Level Challenge', promise: 'Score 80% to move up a level.' }];

async function mount(pg, html, plate) {
  await pg.evaluate(async ([html, plate]) => {
    /* the test owns the screen: a lazy group landing later re-renders the app, which would
       wipe a stage injected by hand (a real hub screen is drawn BY render, so it survives) */
    window.__render = window.__render || window.render; window.render = function () {};
    const c = document.querySelector('.sb-content'); c.innerHTML = html; SGUI.stageFit();
    const url = SB_PLATE(plate); await new Promise(r => { const i = new Image(); i.onload = r; i.onerror = r; i.src = url; });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  }, [html, plate]);
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const errs = [];
  for (const vp of [{ n: 'desktop', w: 1280, h: 800 }, { n: 'phone', w: 390, h: 844, m: true }]) for (const mode of ['light', 'dusk']) {
    const T = vp.n + ' · ' + mode;
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, seed(mode));
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(T + ': ' + e.message));
    await pg.goto('file://' + ROOT + '/index.html');
    ok(await booted(pg), `${T}: the app boots`); await lazy(pg, 'arcade');
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('games'); });
    await until(pg, () => state.nav === 'games' && !!document.querySelector('.sb-content'));

    /* ---- the hub ---- */
    const opened = [];
    await pg.exposeFunction('__hubOpened', id => opened.push(id));
    await pg.evaluate(() => { SB_HUB_OPEN.gymtest = id => window.__hubOpened(id); });
    await mount(pg, await pg.evaluate(M => SB_HUB({ key: 'gymtest', title: 'Spelling Gym', plate: 'gym', modes: M, last: 'spot' }), MODES), 'gym');
    const hub = await pg.evaluate(() => {
      const st = document.querySelector('.sg-stage'), r = st.getBoundingClientRect(), hdr = document.querySelector('.sb-header-sticky').getBoundingClientRect();
      const tb = document.querySelector('.sb-tabbar'); const tbTop = tb && getComputedStyle(tb).display !== 'none' ? tb.getBoundingClientRect().top : innerHeight;
      const bg = getComputedStyle(st).backgroundImage;
      return { top: r.top - hdr.bottom, bot: tbTop - r.bottom, left: r.left, right: innerWidth - r.right, bg,
        tiles: [...st.querySelectorAll('.sg-hub-tile')].map(t => ({ id: t.dataset.mode, chip: !!t.querySelector('.sg-hub-meta [data-act="levelChip"], .sg-hub-meta .sg-hub-lvl'),
          best: (t.querySelector('.sg-hub-best') || {}).textContent, isNew: !!t.querySelector('.sg-hub-new'), last: t.classList.contains('last') && !!t.querySelector('.sg-hub-lastmark'),
          nested: !!t.querySelector('button button'), w: Math.round(t.getBoundingClientRect().width), y: Math.round(t.getBoundingClientRect().top) })),
        title: (st.querySelector('.sg-st-title') || {}).textContent, stats: [...st.querySelectorAll('.sg-st-stat')].map(e => e.textContent.replace(/\s+/g, ' ').trim()) };
    });
    ok(Math.abs(hub.top) <= 1 && Math.abs(hub.bot) <= 1 && hub.left === 0 && hub.right === 0,
      `${T}: the stage fills shell bar to tab bar, edge to edge (top ${hub.top.toFixed(1)}, bottom ${hub.bot.toFixed(1)}, sides ${hub.left}/${hub.right})`);
    ok(new RegExp('stage/gym-' + (mode === 'dusk' ? 'night' : 'day') + '\\.webp').test(hub.bg), `${T}: the ${mode === 'dusk' ? 'night' : 'day'} plate is the one drawn`);
    ok(hub.tiles.map(t => t.id).join() === MODES.map(m => m.id).join(), `${T}: one tile per mode, in the hub's own order`);
    ok(hub.tiles.every(t => t.chip && !t.nested), `${T}: every tile carries a level chip, and no button nests in another`);
    ok(hub.tiles[0].best === 'Best 9/10' && hub.tiles[1].isNew && !hub.tiles[0].isNew && hub.tiles[2].last && !hub.tiles[0].last,
      `${T}: bests, the "new" dot and the last-played mark sit on the right tiles`);
    ok(new Set(hub.tiles.map(t => t.w)).size === 1, `${T}: the tiles are one width (${[...new Set(hub.tiles.map(t => t.w))].join(', ')}px)`);
    const rows = [...new Set(hub.tiles.map(t => t.y))].length;
    ok(rows === (vp.m ? 3 : 2), `${T}: ${vp.m ? 'two' : 'three'} across — ${rows} rows of tiles`);
    ok(hub.title === 'Spelling Gym' && /good days? this week/.test(hub.stats[0]) && /coins? today/.test(hub.stats[1]) && !/streak/i.test(hub.stats.join(' ')),
      `${T}: HUD reads good days · the hub's name · coins today, never a streak (${hub.stats.join(' | ')})`);
    SC.report(ok, `${T} hub`, await SC.geometry(pg), await SC.pixels(pg));
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'stage-hub-' + vp.n + '-' + mode + '.png') });
    await pg.evaluate(() => document.querySelector('.sg-hub-tile[data-mode="squares"] .sg-hub-go').click());
    ok(opened.join() === 'squares' && await pg.evaluate(() => active().hubLast && active().hubLast.gymtest === 'squares'),
      `${T}: a tile tap opens SB_HUB_OPEN.gymtest('squares') and remembers it as last played`);

    /* ---- a game on the stage, with the on-screen keyboard ---- */
    await mount(pg, await pg.evaluate(() => SGUI.stage({ plate: 'blaster-color', name: 'demo',
      hud: { left: '<span class="sg-st-n">3</span><span class="sg-st-t">words</span>', center: '<h1 class="sg-st-title">Type Blaster</h1>', right: '<span class="sg-st-n">120</span><span class="sg-st-t">score</span>' },
      play: '<div class="demo-play" style="width:100%;height:100%;border-radius:18px;background:linear-gradient(135deg,rgba(80,40,140,.55),rgba(240,180,41,.55)),repeating-linear-gradient(45deg,rgba(255,255,255,.12) 0 6px,transparent 6px 12px)"></div>' })), 'blaster-color');
    const typed = [];
    await pg.exposeFunction('__typed', k => typed.push(k));
    const kb = await pg.evaluate(() => { const h = SGUI.keys(document.querySelector('.sg-st-ctl'), { onKey: k => window.__typed(k), onBack: () => window.__typed('<'), onEnter: () => window.__typed('!') });
      SGUI.stageFit(); return { touch: h.touch, drawn: !!h.el }; });
    await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
    if (vp.m) ok(kb.touch && kb.drawn, `${T}: a touch phone gets the on-screen keyboard`);
    else ok(!kb.touch && !kb.drawn, `${T}: a desktop draws no keys`);
    const g = await SC.geometry(pg);
    SC.report(ok, `${T} game`, g, await SC.pixels(pg), { play: true });
    const big = await pg.evaluate(() => { const p = document.querySelector('.sg-st-play').getBoundingClientRect(), o = document.querySelector('.demo-play').getBoundingClientRect(), r = document.querySelector('.sg-st-region').getBoundingClientRect();
      return { share: (o.width * o.height) / (p.width * p.height), ratio: r.width / r.height }; });
    ok(big.share >= (vp.m ? 0.40 : 0.50), `${T}: the play object is the biggest thing (${Math.round(big.share * 100)}% of the play area)`);
    if (!vp.m) ok(Math.abs(big.ratio - 4 / 3) < 0.02, `${T}: the desktop play region is 4:3 (${big.ratio.toFixed(3)})`);
    if (vp.m) {
      await pg.evaluate(() => { const k = q => document.querySelector('.sg-key[data-k="' + q + '"]'); for (const q of ['c', 'a', 't', '⌫', '⏎']) { const b = k(q); const r = b.getBoundingClientRect();
        b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, clientX: r.left + 5, clientY: r.top + 5, pointerType: 'touch' })); } });
    } else {
      await pg.mouse.click(5, 5); for (const k of ['c', 'a', 't', 'Backspace', 'Enter']) await pg.keyboard.press(k);
    }
    await until(pg, () => true);
    ok(typed.join('') === 'cat<!', `${T}: ${vp.m ? 'taps on the keys' : 'the real keyboard'} type, delete and submit (${typed.join('')})`);
    await pg.emulateMedia({ reducedMotion: 'reduce' });
    const anim = await pg.evaluate(() => document.querySelector('.sg-stage').getAnimations({ subtree: true }).filter(a => a.playState === 'running').length);
    ok(anim === 0, `${T}: reduced motion — nothing on the stage animates (${anim})`);
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
