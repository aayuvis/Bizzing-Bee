/* NO EMOJI IN A GAME'S HUD, ITS CONTROLS OR A REGION BOARD (road to 4.5, P3.7; the audit's N4)

   The audit: "Emoji persist in region boards (🌸⛩️🎭) and game HUDs (💨🍯💡❤)". An emoji is a different picture in
   every font and a flat box on some Android phones; the app's marks are its own drawn glyphs (iconSVG / SB_ICON / the
   kit's art). This walks the LIVE DOM of every game a child can reach and every Atlas board, at 390×844 and 1280×800,
   and reads every visible text node in:
     HUDS     the kit's .sg-st-hud, every .sg-hud, the arcade's .arc-play-top, and any element whose class names a hud;
     BOARDS   the Atlas overview and every Honey region board (#sb-pan, .atlas-board, its key, the stop card, the
              music pill, the caches, the secrets, the wanderer, the bloom, the ambient casts), the Ultra board;
     CONTROLS every visible button, link, [data-act], [role=button], input and select on the screen — their text,
              aria-label, title, value and placeholder.
   An emoji is anything Chromium's own Unicode tables call Extended_Pictographic (so the browser decides, not a list in
   this file), except © ® ™. ONE exemption, stated: the 🐞 bug tab (.sb-bug-tab and its panel) is a testing tool that
   shows only in testing mode — trust-v2 holds it off a child's screen — and the boards are walked with the testing
   unlock on so every region opens.
   Every screen must open: a screen that does not draw its marker fails here, it is never skipped.
   Proved by breaking (13 Oct 2026, each fault put back in a scratch copy and this test watched to fail):
     · the bloom stop's 🌸 put back (trail.js mw-bloom): 2 fail (the Meadow board, phone and desktop);
     · a ❤ added to Word Lore's HUD stat label (lore.js stat()): 10 fail (the five Lore rounds at both widths);
     · the music pill's 🎵/🔇 put back: 20 fail (the nine Honey boards and the Ultra board, at both widths).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/hud-emoji.cjs                                            */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey',
  missed: [{ w: 'necessary', n: 1, ts: Date.now() - 86400000 * 2 }] };

/* [name, open (page JS), ready (page predicate)] — each opener is the screen's own door */
const GAMES = [
  ['Play tab', () => app.setNav('games'), () => !!document.querySelector('[data-card]')],
  ['Spelling Gym hub', () => app.openGym(), () => !!document.querySelector('.sb-stage .sg-hub-tile')],
  ['Gym · Warm-up', () => app.openGym('warmup'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Gym · Sprint', () => app.openGym('sprint'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Gym · Spot the Error', () => app.openGym('spot'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Gym · Squares', () => app.openGym('squares'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Gym · Word Doctor', () => app.openGym('doctor'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Gym · Level Challenge', () => app.openGym('challenge'), () => !!document.querySelector('.sb-stage') && !document.querySelector('.sg-hub-tile')],
  ['Word Lore hub', () => app.openLore(), () => !!document.querySelector('.sb-stage .sg-hub-tile')],
  ['Lore · Meanings', () => app.openLore('meanings'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-opt')],
  ['Lore · Ladder', () => app.openLore('ladder'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-ll')],
  ['Lore · Squares', () => app.openLore('squares'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-cell')],
  ['Lore · Clock', () => app.openLore('clock'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('#qz-time')],
  ['Lore · Origins', () => app.openLore('origins'), () => state.qz && state.qz.phase === 'play' && !!document.querySelector('.qz-card')],
  ['Lore · Build a Word (tester: Word Forge\'s table is unsigned)', () => { state.tester = true; app.openLore('build'); }, () => state.qz && state.qz.mode === 'build' && state.qz.phase === 'play' && !!document.querySelector('.qzb-tile')],
  ['Hive Mind hub', () => app.openHive(), () => !!document.querySelector('.sb-stage .sg-hub-tile')],
  ['Hive · Classic', () => app.openHive('classic'), () => state.qz && state.qz.mode === 'classic' && !!document.querySelector('.qz-card')],
  ['Daily Bee', () => app.openDailyBee(), () => !!document.querySelector('#db-host .sb-stage')],
  ['Daily Buzz', () => app.openDailyBuzz(), () => !!document.querySelector('[class^="dz-"],[class*=" dz-"]')],
  ['Word Forge', () => app.openForge(), () => !!document.querySelector('#fg-host .sb-stage, #fg-host .fg-stage')],
  ['Mock Spelling Bee lobby', () => app.mbOpen(), () => !!document.querySelector('.sb-stage.mb-stage')],
  ['Mock Spelling Bee turn', () => app.mbStart(), () => state.mb && state.mb.view === 'stage' && !!document.querySelector('.sb-stage.mb-stage')],
  ['Bee Grand Prix', () => { app.setNav('games'); app.arcadePlay('beeGrandPrix', { fromMenu: true }); }, () => !!document.querySelector('.arc-play canvas')],
  ['Type Blaster', () => { arcadeClose(); app.arcadePlay('typeBlaster', { fromMenu: true }); }, () => !!document.querySelector('.arc-play .sb-stage, .arc-play canvas')],
  ['Honeycomb Run', () => { arcadeClose(); app.arcadePlay('honeycombRun', { fromMenu: true }); }, () => !!document.querySelector('.arc-play canvas')],
  ['Analogies · practice', async () => { arcadeClose(); app.openAnalogies();
    await new Promise(r => { const t = setInterval(() => { if (document.querySelector('.anl-board .anl-stop') && app.anl) { clearInterval(t); r(); } }, 100); }); app.anl('practice'); },
    () => !!(state.anl && state.anl.run && document.querySelector('.sb-stage .anl-opt'))],
  ['Analogies · clock', async () => { app.anl('clock');
    await new Promise(r => { const t = setInterval(() => { if (document.querySelector('[data-arg="clockgo"]')) { clearInterval(t); r(); } }, 100); }); app.anl('clockgo'); },
    () => !!document.querySelector('.sb-stage #anl-time')],
  ['Mock Analogy Bee lobby', () => { app.anl('leave'); app.openAnlBee(); }, () => !!document.querySelector('.sb-stage .anl-field .anl-rival')],
  ['Mock Analogy Bee round', () => app.anlBee('start'), () => state.anlBee && state.anlBee.phase === 'turn' && !!document.querySelector('.sb-stage .anl-opt')],
  ["Today's ten", () => app.openToday(), () => state.nav === 'today' && !!document.querySelector('.sb-content button')]];
const ACTS = ['meadow', 'library', 'forum', 'storm', 'roots', 'strait', 'junkyard', 'sprints', 'stage'];
const BOARDS = [['the Word Atlas', () => { state.devUnlock = true; app.setNav('trail'); }, () => !!document.querySelector('.atlas-board')]]
  .concat(ACTS.map(a => [`the ${a} board`, new Function(`location.hash = '#/atlas/honey/${a}'`), () => !!document.querySelector('.act-board')]))
  .concat([['the Ultra board', () => app.ultraAct(0), () => state.trailView === 'ultra' && !!document.querySelector('.atlas-board, .act-board')],
    ['a landmark round (the Meadow)', () => { location.hash = '#/atlas/honey/meadow'; setTimeout(() => app.mwLmk('0'), 500); }, () => !!(state.tq && state.tq.items)],
    ['a landmark round (the Storm)', () => { app.trailBack(); location.hash = '#/atlas/honey/storm'; setTimeout(() => app.mwLmk('0'), 500); }, () => !!(state.tq && state.tq.items)],
    ['a cache opened (a game)', () => { app.trailBack(); location.hash = '#/atlas/honey/forum'; setTimeout(() => { state.treG = { kind: 'game', act: 'forum', game: 'typeBlaster' }; render(); }, 500); }, () => !!document.querySelector('[data-act="treGame"]')],
    ['a cache opened (a riddle)', () => { state.treG = { kind: 'trivia', act: 'forum', q: { q: 'Which is a word?', f: 'A fact.', opts: [{ c: 'cat', ok: true }, { c: 'xqz', ok: false }], picked: null } }; render(); }, () => !!document.querySelector('[data-act="treTrivAns"]')]]);

async function scan(pg) {
  return pg.evaluate(() => {
    const RE = /\p{Extended_Pictographic}/u, OKC = /[©®™]/;
    const emo = t => [...String(t || '')].filter(c => RE.test(c) && !OKC.test(c)).join('');
    const vis = e => e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none';
    const exempt = e => !!e.closest('.sb-bug-tab, .sb-bug-panel, [data-bug]');
    const where = e => { const p = []; for (let x = e; x && p.length < 3 && x !== document.body; x = x.parentElement) p.unshift(x.tagName.toLowerCase() + (x.className && typeof x.className === 'string' ? '.' + x.className.trim().split(/\s+/)[0] : '')); return p.join('>'); };
    const out = [];
    const ZONE = '.sg-st-hud, .sg-hud, .arc-play-top, [class*="hud"], #sb-pan, .atlas-board, .act-board, .atlas-key, .atlas-pop, .atlas-wrap';
    document.querySelectorAll(ZONE).forEach(z => { if (!vis(z) || exempt(z)) return;
      const tw = document.createTreeWalker(z, NodeFilter.SHOW_TEXT); let n;
      while ((n = tw.nextNode())) { const e = n.parentElement; if (!e || !vis(e) || exempt(e)) continue; const m = emo(n.nodeValue); if (m) out.push(m + ' in ' + where(e) + ' "' + n.nodeValue.trim().slice(0, 30) + '"'); } });
    document.querySelectorAll('button, a[href], [data-act], [role="button"], input, select, summary').forEach(c => { if (!vis(c) || exempt(c)) return;
      const m = emo([c.innerText, c.getAttribute('aria-label'), c.getAttribute('title'), c.value, c.getAttribute('placeholder')].filter(Boolean).join(' '));
      if (m) out.push(m + ' on control ' + where(c) + ' "' + (c.innerText || c.getAttribute('aria-label') || '').trim().slice(0, 30) + '"'); });
    return [...new Set(out)];
  });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{ n: 'phone', w: 390, h: 844 }, { n: 'desktop', w: 1280, h: 800 }]) {
    const phone = vp.w < 500;
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
    await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('sb_tester', '1'); localStorage.setItem('t_seed', '1'); } }, KID);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await pg.goto(URL); await W.booted(pg);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need(['arcade', 'scrGames', 'quizhubs'], r)));
    /* ONLY=<regex> walks just the screens it names (a debugging aid for proving a break; the suite runs them all) */
    const only = process.env.ONLY ? new RegExp(process.env.ONLY, 'i') : null;
    for (const [name, open, ready] of GAMES.concat(BOARDS).filter(([n]) => !only || only.test(n))) {
      await pg.evaluate(`(${open.toString()})()`).catch(e => errs.push(vp.n + ' ' + name + ': ' + e.message));
      const drawn = await W.until(pg, ready, null, 40000);
      ok(drawn, `${vp.n} · ${name}: the screen opened`);
      if (!drawn) continue;
      await W.frames(pg, 3);
      const found = await scan(pg);
      ok(!found.length, `${vp.n} · ${name}: no emoji in a HUD, a control or the board` + (found.length ? ' — ' + found.slice(0, 5).join(' | ') + (found.length > 5 ? ' …+' + (found.length - 5) : '') : ''));
    }
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
