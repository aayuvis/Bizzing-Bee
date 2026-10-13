/* THE ANALOGY GAMES STAND ON THE ENGINE KIT'S PAINTED STAGE (road to 4.5, P3.1 / P3.2)

   The audit (G2, W9): "the Analogies games (bee, clock, practice) are flat white cards on the honeycomb". Every
   analogy GAME screen is now drawn on SGUI.stage (saga2.js) over a painted plate named through SB_PLATE — the
   Library's 'lore' for the Atlas's rounds and the clock, the observatory's 'hive' for the Mock Analogy Bee — and is
   held here to the kit's own measured rules (tests/lib/stage-check.cjs), at 1280×800 and 390×844, light and dusk:
     T15  the HUD mirrored (equal stats, equal distance from each edge), the title on the centre line, equal play
          gutters, the controls centred, no page scroll, no control under the tab bar, a phone's controls in the
          bottom 38%;
     T14  no flat-colour region over 6% of the stage, pure white and pure black each ≤ 2% (a flat white card fails);
   plus: the stage is THE stage (.sb-stage, the plate the look asks for, through SB_PLATE), the question card is a
   kit panel (.sg-panel, the paper grain), and every screen still carries what the rules need — the live prompt, the
   held miss with its Continue, the answers as buttons with keys.
   Screens: practice step 1 (name the link) · practice step 2 · a held miss · a check · the clock's door · the clock
   running · a round's end · the bee's lobby · a bee round · a bee result · the bee's end.
   Proved by breaking (13 Oct 2026, each fault put in, the test watched to fail, the file compared with its copy after):
     · no stage (stageAnl returning the bare `.anl-page` with the card and the options, as before P3.1): 48 fail —
       "drawn on the engine kit's stage" on all 44 game screens, and the live-prompt check on all four looks;
     · `.anl-kit .anl-card.sg-panel` on a solid `var(--paper)`: 110 fail — "a kit panel with the paper grain" and T14's
       "no flat-colour region over 6%" on every screen (44 each), "pure white ≤ 2%" on the 22 light ones;
     · the phone's equal stat width taken out (`.anl-kit .sg-st-side .sg-st-stat{width:112px}`, the bee's 92px): 16 fail —
       T15 "HUD stats are the same width" on the phone screens whose two stats differ (taking out the `.anl-pad`
       spacer alone fails nothing: the fixed width already keeps the stats equal — it stays for the back button's room).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/analogy-stage.cjs                                     */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const SC = require('./lib/stage-check.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };

async function settle(pg) {
  /* the plate is a CSS background: wait until the image itself has loaded, then two frames */
  await pg.evaluate(async () => { const st = document.querySelector('.sb-stage'); if (!st) return;
    const m = /url\(["']?([^"')]+)["']?\)/.exec(getComputedStyle(st).backgroundImage || ''); if (!m) return;
    await new Promise(r => { const i = new Image(); i.onload = r; i.onerror = r; i.src = m[1]; });
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); });
}
async function check(pg, label, plate, mode) {
  await settle(pg);
  const s = await pg.evaluate(() => { const st = document.querySelector('.sb-stage'); if (!st) return null;
    const card = st.querySelector('.anl-card');
    return { inPage: !!st.closest('.anl-page'), kit: st.classList.contains('anl-kit'), bg: getComputedStyle(st).backgroundImage,
      panel: !!card && card.classList.contains('sg-panel') && /svg/.test(getComputedStyle(card).backgroundImage),
      ctl: st.querySelectorAll('.sg-st-ctl button').length, back: !!st.querySelector('.sg-st-side.l .anl-back') }; });
  ok(!!s && s.inPage && s.kit, `${label}: drawn on the engine kit's stage (SGUI.stage)`);
  if (!s) return;
  ok(new RegExp('stage/' + plate + '-' + (mode === 'dusk' ? 'night' : 'day') + '\\.webp').test(s.bg), `${label}: the ${plate} plate for ${mode}, through SB_PLATE (${(s.bg.match(/stage\/[^)'"]+/) || [''])[0]})`);
  ok(s.panel, `${label}: the card is a kit panel with the paper grain, not a flat card`);
  ok(s.back && s.ctl >= 1, `${label}: the way back sits in the HUD, and the controls row holds the buttons (${s.ctl})`);
  /* geometry is read with the juice stilled: a right answer's pop is a scale for a third of a second */
  const still = await pg.addStyleTag({ content: SC.STILL }); await W.frames(pg, 2);
  const g = await SC.geometry(pg); await still.evaluate(e => e.remove());
  SC.report(ok, label, g, await SC.pixels(pg), { play: true });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{ n: 'phone', w: 390, h: 844 }, { n: 'desktop', w: 1280, h: 800 }]) for (const mode of ['light', 'dusk']) {
    const T = vp.n + ' · ' + mode, phone = vp.w < 500;
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: phone, hasTouch: phone });
    await ctx.addInitScript(([k, m]) => { if (!localStorage.getItem('t_seed')) {
      localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: m, pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_tester', '1'); localStorage.setItem('t_seed', '1'); } }, [KID, mode]);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(T + ': ' + e.message));
    pg.on('console', m => { if (m.type() === 'error' && !/voice\/w\/|net::ERR_FILE_NOT_FOUND|Failed to load resource/.test(m.text())) errs.push(T + ': ' + m.text()); });
    await pg.goto(URL + '#/analogies'); await W.booted(pg);
    await W.until(pg, () => !!document.querySelector('.anl-board .anl-stop'), null, 30000);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('saga2', r)));
    const stage = (fn) => W.until(pg, fn, null, 8000);

    /* the Atlas's rounds: practice (step 1, step 2, a held miss), a check, the end of a round */
    await pg.evaluate(() => app.anl('practice')); await stage(() => !!document.querySelector('.sb-stage .anl-opt.line'));
    await check(pg, `${T} practice · name the link`, 'lore', mode);
    await pg.evaluate(() => { app.anl('bridge:' + state.anl.run.bq.ans); app.anl('cont'); }); await stage(() => state.anl.run.phase === 'pick' && !!document.querySelector('.sb-stage .anl-opt:not(.line)'));
    await check(pg, `${T} practice · the analogy`, 'lore', mode);
    const live = await pg.evaluate(() => { const q = state.anl.run.q, p = document.querySelector('.sb-stage [data-live-prompt]');
      return { said: p && p.getAttribute('data-live-prompt'), d: q.d, keys: [...document.querySelectorAll('.sb-stage .anl-opt .anl-k')].map(k => k.textContent).join('') }; });
    ok(live.said && !new RegExp('\\b' + live.d + '\\b', 'i').test(live.said) && /^ABC/.test(live.keys), `${T}: the prompt is announced without its answer, and the answers carry their keys (${live.keys})`);
    await pg.evaluate(() => app.anl('pick:' + ((state.anl.run.q.ans + 1) % state.anl.run.q.opts.length))); await stage(() => !!document.querySelector('.sb-stage .anl-miss [data-arg="cont"]'));
    await check(pg, `${T} practice · a held miss`, 'lore', mode);
    await pg.evaluate(() => { app.anl('map'); }); await W.until(pg, () => !!document.querySelector('.anl-board') && !document.querySelector('.sb-stage'), null, 8000);
    ok(await W.until(pg, () => !document.documentElement.classList.contains('sb-stage-on'), null, 3000), `${T}: back on the map, the stage and its scroll lock are gone`);
    await pg.evaluate(() => app.anl('check')); await stage(() => !!document.querySelector('.sb-stage .anl-opt'));
    await check(pg, `${T} check`, 'lore', mode);
    await pg.evaluate(() => { const g = state.anl.run; g.i = g.n - 1; app.anl('pick:' + g.q.ans); }); await W.until(pg, () => state.anl.run.phase === 'done', null, 6000);
    await stage(() => !!document.querySelector('.sb-stage .anl-done'));
    await check(pg, `${T} a round's end`, 'lore', mode);

    /* Against the Clock: its door and the clock running */
    await pg.evaluate(() => app.anl('clock')); await stage(() => !!document.querySelector('.sb-stage [data-arg="clockgo"]'));
    await check(pg, `${T} the clock's door`, 'lore', mode);
    await pg.evaluate(() => app.anl('clockgo')); await stage(() => !!document.querySelector('.sb-stage #anl-time') && !!document.querySelector('.sb-stage .anl-opt'));
    await check(pg, `${T} the clock running`, 'lore', mode);
    await pg.evaluate(() => app.anl('leave'));

    /* the Mock Analogy Bee: lobby, a round, a result, the end */
    await pg.evaluate(() => app.openAnlBee()); await W.until(pg, () => !!window.MOCKBEE && document.querySelectorAll('.sb-stage .anl-field .anl-rival').length === 8, null, 30000);
    await check(pg, `${T} the bee's lobby`, 'hive', mode);
    await pg.evaluate(() => app.anlBee('start')); await stage(() => state.anlBee.phase === 'turn' && !!document.querySelector('.sb-stage .anl-opt'));
    await check(pg, `${T} a bee round`, 'hive', mode);
    await pg.evaluate(() => app.anlBee('pick:' + state.anlBee.q.ans)); await stage(() => state.anlBee.phase === 'result' && !!document.querySelector('.sb-stage [data-arg="next"]'));
    await check(pg, `${T} a bee result`, 'hive', mode);
    await pg.evaluate(() => { const bb = state.anlBee; bb.round = 2; bb.phase = 'turn'; bb.picked = null; app.anlBee('pick:' + ((bb.q.ans + 1) % bb.q.opts.length)); app.anlBee('next'); });
    await stage(() => state.anlBee.phase === 'done' && !!document.querySelector('.sb-stage .anl-done'));
    await check(pg, `${T} the bee's end`, 'hive', mode);
    if (process.env.SHOT) await pg.screenshot({ path: path.join(__dirname, 'build', 'anl-stage-' + vp.n + '-' + mode + '.png') });
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
