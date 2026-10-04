/* WORD FORGE — the screen (games spec §5.1: the card hidden while unsigned, WF2 shown, WF3 = T14/T15,
   WF4 on screen; keyboard AND touch; the miss holds).

   1. Unsigned and not in testing mode: #/forge and app.openForge() land on Play, no stage is drawn, and
      the Play tab shows no Word Forge card (g-found's lineup reads SB_FORGE.signedOff; this checks the
      screen, whichever lineup is merged). Signed off or in testing mode: the stage opens, and Back
      returns to Play (T9).
   2. Keyboard: keys 1-9 place the parts, Enter forges; a right forge fuses and says the meanings
      combined ("… + … = word"); a wrong one cracks back with one reason per misplaced part; a second
      wrong forge raises the miss card, which HOLDS until Enter. A word whose joint changes its
      spelling shows the change (WF2).
   3. Touch (390x844, coarse pointer): a tile dragged onto a slot lands in THAT slot; a tapped tile
      goes to the next empty slot; a tapped slot gives its part back.
   4. T14/T15 (spec §5.0) at 1280x800 and 390x844, light and dusk: no single colour over 6% of the
      stage, pure white or black under 2%; HUD stats equal width within 4px; the stage centred within
      4px, its gutters equal within 4px; no page scroll during play; no control under the tab bar.
      When g-engine's shared stage checker exists (tests/lib/stage-check.cjs) it is used instead of
      the local measure below.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/forge-game.cjs                          */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, band: 4, bandSeed: 4,
  lists: { journey: { xp: 30 } }, activeList: 'journey', forge: { lv: 'medium' } };
let STAGECHECK = null; try { STAGECHECK = require('./lib/stage-check.cjs'); } catch (e) {}

async function open(b, o) {
  const ctx = await b.newContext(o.phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(([k, dev, mode]) => { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: mode || 'light', pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); if (dev) localStorage.setItem('sb_devunlock', '1'); localStorage.setItem('t_seed', '1'); } }, [KID, !!o.dev, o.mode]);
  const pg = await ctx.newPage(); const errs = [];
  pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL + (o.hash || '')); await W.booted(pg);
  return { ctx, pg, errs };
}
const stage = pg => W.until(pg, () => !!document.querySelector('#fg-host .sg-stage, #fg-host .fg-stage') && !!window.SB_FORGE_UI && !!SB_FORGE_UI.state(), null, 25000);
const phase = pg => pg.evaluate(() => SB_FORGE_UI.state() && SB_FORGE_UI.state().phase);

/* T14/T15, measured from a screenshot of the stage (transitions off, so no colour is mid-fade) */
async function measure(pg) {
  await W.still(pg);
  const box = await pg.evaluate(() => { const s = document.querySelector('#fg-host .sg-stage, #fg-host .fg-stage'), r = s.getBoundingClientRect();
    return { x: r.left, y: r.top, width: r.width, height: r.height }; });
  const png = await pg.screenshot({ clip: box });
  const px = await pg.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data, n = d.length / 4, count = new Map(); let white = 0, black = 0;
    for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2];
      if (r >= 250 && g >= 250 && b >= 250) white++; if (r <= 5 && g <= 5 && b <= 5) black++;
      const k = (r >> 3) << 10 | (g >> 3) << 5 | (b >> 3); count.set(k, (count.get(k) || 0) + 1); }
    let top = 0; count.forEach(v => { if (v > top) top = v; });
    return { flat: top / n, white: white / n, black: black / n };
  }, png.toString('base64'));
  const geo = await pg.evaluate(() => {
    const q = s => document.querySelector(s), R = e => e && e.getBoundingClientRect();
    const st = R(q('#fg-host .sg-stage, #fg-host .fg-stage')), L = R(q('#fg-host .fg-mean')), Rt = R(q('#fg-host .fg-heat'));
    const ctl = R(q('#fg-host .fg-ctl')), bar = q('nav.sb-tabbar'), barTop = bar && getComputedStyle(bar).display !== 'none' ? R(bar).top : innerHeight;
    return { vw: document.documentElement.clientWidth, st: { l: st.left, r: st.right, w: st.width }, hl: L.width, hr: Rt.width,
      scroll: document.scrollingElement.scrollHeight - innerHeight, ctlBottom: ctl.bottom, barTop };
  });
  return Object.assign(px, geo);
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  /* ---------------------------------------------------------------- 1. the lock */
  console.log('\n1. Unsigned: the card and the door stay shut; testing mode opens it');
  let { ctx, pg, errs } = await open(b, { hash: '#/forge' });
  await W.lazy(pg, 'forge');
  const signed = await pg.evaluate(() => !!(window.SB_FORGE && SB_FORGE.signedOff));
  if (!signed) {
    await W.until(pg, () => state.nav === 'games', null, 8000);
    ok(await pg.evaluate(() => state.nav === 'games' && !document.querySelector('#fg-host')), `#/forge with the table unsigned lands on Play, no stage (${await pg.evaluate(() => state.nav + ' ' + location.hash)})`);
    await pg.evaluate(() => app.openForge()); await W.until(pg, () => state.nav === 'games', null, 4000);
    ok(await pg.evaluate(() => state.nav !== 'forge'), 'app.openForge() refuses too — a tap on any stray card cannot open it');
    const card = await pg.evaluate(() => [...document.querySelectorAll('.sb-content [data-act]')].filter(e => /wordForge|openForge/.test((e.dataset.arg || '') + (e.dataset.act || '')) || /Word Forge/.test(e.textContent)).filter(e => e.offsetParent).length);
    ok(card === 0, `the Play tab shows no Word Forge card while unsigned (${card} visible)`);
  } else console.log('  SKIP the lock: the owner has signed the table off');
  await ctx.close();

  ({ ctx, pg, errs } = await open(b, { dev: true, hash: '#/forge' }));
  ok(await stage(pg), 'in testing mode #/forge opens the forge stage');
  ok(await pg.evaluate(() => location.hash === '#/forge' && state.nav === 'forge'), 'the forge has its own address (T9)');

  /* ---------------------------------------------------------------- 2. keyboard */
  console.log('\n2. Keyboard: 1-9 and Enter; right fuses, wrong cracks back with a reason, the miss holds');
  await pg.evaluate(() => { SB_FORGE_UI.start('medium'); });
  await pg.keyboard.press('Enter');                       // the how-to's Start
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'forge', null, 4000);
  /* the right parts by their key numbers */
  const keysFor = () => pg.evaluate(() => { const G = SB_FORGE_UI.state(), r = SB_FORGE_UI.cur(), used = {};
    return r.parts.map(p => { const i = G.rack.findIndex((t, k) => t.s === p && !used[k]); used[i] = 1; return String(i + 1); }); });
  for (const k of await keysFor()) await pg.keyboard.press(k);
  await pg.keyboard.press('Enter');
  await W.until(pg, () => ['fused', 'done'].includes(SB_FORGE_UI.state().phase), null, 3000);
  const comb = await pg.evaluate(() => { const e = document.querySelector('.fg-combine'); return e ? e.textContent : ''; });
  const w0 = await pg.evaluate(() => SB_FORGE_UI.cur().w);
  ok(/\+/.test(comb) && comb.indexOf('= ' + w0) > 0, `a right forge fuses and combines the meanings ("${comb}")`);
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'done', null, 4000);
  await pg.keyboard.press('Enter');                       // next word
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'forge' && SB_FORGE_UI.state().i === 1, null, 3000);
  /* wrong on purpose: the parts in reverse order (or a decoy first) */
  const wrongKeys = async () => { const k = await keysFor(); const n = await pg.evaluate(() => SB_FORGE_UI.state().rack.length);
    const rev = k.slice().reverse(); if (rev.join() !== k.join()) return rev;
    const dec = []; for (let i = 1; i <= n && dec.length < k.length; i++) if (k.indexOf(String(i)) < 0) dec.push(String(i)); return dec; };
  for (const k of await wrongKeys()) await pg.keyboard.press(k);
  await pg.keyboard.press('Enter');
  await W.until(pg, () => document.querySelectorAll('.fg-why').length > 0, null, 3000);
  const why = await pg.evaluate(() => ({ n: document.querySelectorAll('.fg-msg .fg-why').length, t: [...document.querySelectorAll('.fg-msg .fg-why')].map(e => e.textContent), back: SB_FORGE_UI.state().slots.filter(s => !s).length }));
  ok(why.n > 0 && why.n === why.back, `a wrong forge cracks ${why.back} part(s) back with ${why.n} reason(s): "${(why.t[0] || '').slice(0, 90)}"`);
  await pg.evaluate(() => { const G = SB_FORGE_UI.state(); G.slots.forEach((s, k) => { if (s && !s.fixed) SB_FORGE_UI.unplace(k); }); });
  for (const k of await wrongKeys()) await pg.keyboard.press(k);
  await pg.keyboard.press('Enter');
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'miss', null, 3000);
  const missUp = await pg.evaluate(() => !!document.querySelector('.sb-miss, .fg-miss, .sg-miss'));
  await pg.waitForTimeout(2500);                          // a miss must HOLD: nothing may move on by itself
  ok(missUp && await phase(pg) === 'miss', 'the second wrong forge raises the miss card, and it holds');
  await pg.keyboard.press('Enter');
  await W.until(pg, () => SB_FORGE_UI.state().phase !== 'miss', null, 3000);
  ok(await pg.evaluate(() => SB_FORGE_UI.state().log.length === 2 && SB_FORGE_UI.state().log[1].ok === false), 'Enter continues, and the word is logged as missed');
  /* WF2 on screen: a word whose joint drops an e */
  const chg = await pg.evaluate(() => { const r = SB_FORGE.rows.find(x => x.changes && x.changes.length); if (!r) return null;
    SB_FORGE_UI.useWords([r]); const G = SB_FORGE_UI.state(); r.parts.forEach((p, k) => { const t = G.rack.find(t => !t.used && t.s === p); SB_FORGE_UI.place(t.id, k); }); SB_FORGE_UI.forge(); return r.w; });
  if (chg) { await W.until(pg, () => !!document.querySelector('.fg-change'), null, 3000);
    const note = await pg.evaluate(() => (document.querySelector('.fg-change') || {}).textContent || '');
    ok(/drops its e|y to i/.test(note), `WF2 on screen: forging "${chg}" shows the change ("${note}")`); }
  ok(!errs.length, `no page errors (${errs.slice(0, 2).join(' | ') || 'none'})`);
  /* Back returns to Play: come in through the Play tab's door, then Back */
  await pg.evaluate(() => app.openGames()); await W.until(pg, () => location.hash === '#/play', null, 4000);
  await pg.evaluate(() => app.openForge()); await W.until(pg, () => state.nav === 'forge' && location.hash === '#/forge', null, 6000);
  await pg.goBack(); await W.until(pg, () => state.nav !== 'forge', null, 5000);
  ok(await pg.evaluate(() => state.nav === 'games'), `Back from the forge returns to Play (${await pg.evaluate(() => state.nav)})`);
  await ctx.close();

  /* ---------------------------------------------------------------- 3. touch */
  console.log('\n3. Touch: drag to a slot, tap to place, tap a slot to give it back');
  ({ ctx, pg, errs } = await open(b, { dev: true, phone: true, hash: '#/forge' }));
  await stage(pg);
  await pg.evaluate(() => { SB_FORGE_UI.start('medium'); SB_FORGE_UI.begin(); });
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'forge', null, 3000);
  const tgt = await pg.evaluate(() => { const G = SB_FORGE_UI.state(), r = SB_FORGE_UI.cur(), last = r.parts.length - 1;
    const t = G.rack.find(t => t.s === r.parts[last]); const te = document.querySelector('.fg-tile[data-id="' + t.id + '"]').getBoundingClientRect();
    const se = document.querySelector('.fg-slot[data-slot="' + last + '"]').getBoundingClientRect();
    return { tx: te.left + te.width / 2, ty: te.top + te.height / 2, sx: se.left + se.width / 2, sy: se.top + se.height / 2, last, s: t.s }; });
  await pg.mouse.move(tgt.tx, tgt.ty); await pg.mouse.down(); await pg.mouse.move(tgt.tx, tgt.ty - 30, { steps: 3 }); await pg.mouse.move(tgt.sx, tgt.sy, { steps: 8 }); await pg.mouse.up();
  ok(await pg.evaluate(l => { const s = SB_FORGE_UI.state().slots[l]; return !!s && s.s === SB_FORGE_UI.cur().parts[l]; }, tgt.last), `dragging "${tgt.s}" onto the last slot puts it in THAT slot`);
  const first = await pg.evaluate(() => { const G = SB_FORGE_UI.state(), r = SB_FORGE_UI.cur(); const t = G.rack.find(t => !t.used && t.s === r.parts[0]); return t.id; });
  await pg.tap('.fg-tile[data-id="' + first + '"]');
  ok(await pg.evaluate(() => { const s = SB_FORGE_UI.state().slots[0]; return !!s && s.s === SB_FORGE_UI.cur().parts[0]; }), 'a tapped tile goes to the next empty slot');
  await pg.tap('.fg-slot[data-slot="0"]');
  ok(await pg.evaluate(() => !SB_FORGE_UI.state().slots[0]), 'a tapped slot gives its part back to the rack');
  const sizes = await pg.evaluate(() => [...document.querySelectorAll('.fg-tile:not(.used),.fg-ctl .fg-btn,.fg-slot')].map(e => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); }));
  ok(sizes.length && Math.min(...sizes) >= 40, `every tile, slot and control is at least 40px on a phone (smallest ${Math.round(Math.min(...sizes))}px)`);
  await ctx.close();

  /* ---------------------------------------------------------------- 4. T14 / T15 */
  console.log('\n4. T14/T15 — full, symmetric, no white, no scroll' + (STAGECHECK ? ' (shared checker)' : ' (local measure)'));
  for (const phone of [false, true]) for (const mode of ['light', 'dusk']) {
    ({ ctx, pg, errs } = await open(b, { dev: true, phone, mode, hash: '#/forge' }));
    await stage(pg);
    await pg.evaluate(() => { SB_FORGE_UI.start('medium'); SB_FORGE_UI.begin(); });
    await W.until(pg, () => SB_FORGE_UI.state().phase === 'forge', null, 3000);
    const tag = (phone ? '390x844' : '1280x800') + ' ' + mode;
    if (STAGECHECK && STAGECHECK.check) {
      const res = await STAGECHECK.check(pg, '#fg-host .sg-stage, #fg-host .fg-stage');
      ok(!res.length, `${tag}: shared stage check (${res.join(' | ') || 'clean'})`);
    } else {
      const m = await measure(pg);
      ok(m.flat <= 0.06, `${tag}: T14 no flat colour over 6% (largest ${(m.flat * 100).toFixed(1)}%)`);
      ok(m.white <= 0.02 && m.black <= 0.02, `${tag}: T14 pure white ${(m.white * 100).toFixed(2)}%, pure black ${(m.black * 100).toFixed(2)}% (each ≤ 2%)`);
      ok(Math.abs(m.hl - m.hr) <= 4, `${tag}: T15 HUD stats equal width (${Math.round(m.hl)} / ${Math.round(m.hr)})`);
      ok(Math.abs(m.st.l - (m.vw - m.st.r)) <= 4, `${tag}: T15 gutters equal (${Math.round(m.st.l)} / ${Math.round(m.vw - m.st.r)})`);
      ok(m.scroll <= 1, `${tag}: T15 no page scroll in play (${Math.round(m.scroll)}px)`);
      ok(m.ctlBottom <= m.barTop + 1, `${tag}: T15 controls clear the tab bar (${Math.round(m.ctlBottom)} ≤ ${Math.round(m.barTop)})`);
    }
    await ctx.close();
  }

  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall passed');
  process.exit(fails ? 1 : 0);
})();
