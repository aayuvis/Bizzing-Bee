/* DAILY BUZZ, BACK AS IT WAS (owner, 5 Oct 2026: "we need the guess the word of the day game back" —
   "its own card again" — "come back as it was")

   daily-buzz.js is the 4 Oct game with only its names moved (SB_DAILY_BUZZ, dz-*, nav 'dailybuzz',
   #/buzz) so it can stand beside Daily Bee, which kept #/daily. This holds:
   1. its card on the Play tab opens it at #/buzz inside the shell (top bar, tab bar, Play marked), the
      typed address opens it, and Back returns to #/play with nothing of it left on screen
   2. it is the old game: six rows of five, the on-screen keys (touch) and the real keyboard both type,
      a short word shakes and is not spent, six misses end on "The word was …"
   3. NEVER THE ANSWER IN PLAIN SIGHT, played on the days that test it: a normal day, the day whose list
      word is DAILY (the title), SPELL (the greeting) and MARCH on a March date. The answer is learned
      only from the end card, then checked against everything the screen said before the end.
   4. coins as it was: solving pays exactly one answer coin; a random guesser's six tries pay nothing;
      coming back to a solved day (without a reload) pays nothing more and shows it solved
   5. its old record (sb_daily) comes back with it: a child's solved / played counts show on the end card
   6. it shares a page with Daily Bee: open one, then the other, and each draws its own board
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/daily-buzz.cjs                          */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 30 } }, activeList: 'journey' };

/* the list, read from the game's own file — only to choose the days that test the leak rule */
const SRC = fs.readFileSync(path.join(ROOT, 'daily-buzz.js'), 'utf8');
const WORDS = ((SRC.match(/"((?:[a-z]{5} ){100,}[a-z]{5})"/) || [])[1] || '').split(' ');
const EPOCH = Date.UTC(2026, 0, 1);
/* the first local date (from 1 Jan 2026) whose list word is w, optionally in a given month */
function dayFor(w, month) {
  const i = WORDS.indexOf(w); if (i < 0) return null;
  for (let d = i; d < 4000; d += WORDS.length) { const u = new Date(EPOCH + d * 86400000);
    if (month == null || u.getUTCMonth() === month) return new Date(u.getUTCFullYear(), u.getUTCMonth(), u.getUTCDate(), 10, 0, 0); }
  return null;
}

async function open(b, o) {
  o = o || {};
  const vp = o.vp || { width: 1180, height: 900 }, phone = vp.width < 500;
  const ctx = await b.newContext({ viewport: vp, isMobile: phone, hasTouch: phone, reducedMotion: 'reduce' });
  await ctx.addInitScript(([k, rec]) => { if (!localStorage.getItem('t_seed')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] }));
    localStorage.setItem('sb_splash', '0'); if (rec) localStorage.setItem('sb_daily', JSON.stringify(rec)); localStorage.setItem('t_seed', '1'); } }, [KID, o.rec || null]);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  if (o.time) await pg.clock.setFixedTime(o.time);
  await pg.goto(URL + (o.hash || '')); await W.booted(pg);
  return { ctx, pg, errs };
}
const board = pg => W.until(pg, () => !!document.querySelector('#dz-host .dz-grid'), null, 30000);
const coins = pg => pg.evaluate(() => { walletSync(active()); return active().coins || 0; });
/* what the screen says: the content area and the shell around it */
const said = pg => pg.evaluate(() => (document.getElementById('root') || document.body).innerText.toLowerCase());
async function typeKeys(pg, s) { for (const ch of s) await pg.keyboard.press(ch); await pg.keyboard.press('Enter'); }
async function tapKeys(pg, s) { for (const ch of s) await pg.click(`#dz-host .dz-k[data-k="${ch}"]`); await pg.click('#dz-host .dz-k[data-k="enter"]'); }
const rows = pg => pg.evaluate(() => [...document.querySelectorAll('#dz-host .dz-row')].map(r => [...r.querySelectorAll('.dz-cell')].map(c => c.textContent).join('')));
/* six guesses no list word can be: the game accepts any five letters, as it always did */
const MISSES = ['qqqqq', 'xxxxx', 'zzzzz', 'jjjjj', 'vvvvv', 'kkkkk'];
async function loseAndLearn(pg, tap) {
  for (const g of MISSES) { if (tap) await tapKeys(pg, g); else await typeKeys(pg, g); }
  await W.until(pg, () => !!document.querySelector('#dz-host .dz-done'), null, 8000);
  const h = await pg.evaluate(() => (document.querySelector('#dz-host .dz-done h3') || {}).textContent || '');
  return ((h.match(/The word was ([A-Z]{5})/) || [])[1] || '').toLowerCase();
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  ok(WORDS.length >= 300, `read the game's word list (${WORDS.length} words)`);
  const TODAY = new Date(2026, 9, 5, 10, 0, 0);

  /* ---- 1. the card, the address, Back ---- */
  {
    const { ctx, pg, errs: e } = await open(b, { vp: { width: 390, height: 844 }, hash: '#/play', time: TODAY }); errs.push(...e);
    const look = () => pg.evaluate(() => { const tab = document.querySelector('nav.sb-tabbar [data-arg="games"]');
      return { h: location.hash, nav: state.nav, board: !!document.querySelector('#root #dz-host .dz-grid'), bar: !!document.querySelector('#root .sb-fam-bar'),
        tabbar: !!document.querySelector('#root nav.sb-tabbar'), play: !!tab && tab.getAttribute('aria-current') === 'page',
        head: ((document.querySelector('#root .sb-phead') || {}).textContent || '').includes('Daily Buzz') }; });
    const CARD = '.pl-card[data-card="dailyBuzz"] [data-act="playCard"]';
    await W.until(pg, s => !!document.querySelector(s), CARD, 15000);
    const tile = await pg.evaluate(() => { const el = document.querySelector('.pl-card[data-card="dailyBuzz"]'); return { door: el && el.closest('[data-door]') ? el.closest('[data-door]').dataset.door : null, title: el ? el.innerText.split('\n').find(t => /Daily Buzz/.test(t)) : null, chip: !!(el && el.querySelector('.sb-lvchip')) }; });
    ok(tile.door === 'play' && tile.title && !tile.chip, `Daily Buzz has its own card in the Play door, with no level chip (${JSON.stringify(tile)})`);
    await pg.click(CARD); await board(pg);
    let L = await look();
    ok(L.h === '#/buzz' && L.nav === 'dailybuzz' && L.board && L.bar && L.tabbar && L.play && L.head, 'its card opens it at #/buzz, inside the shell (top bar, tab bar, Play marked, the page head) (' + JSON.stringify(L) + ')');
    await pg.click('#root .sb-phead [data-act="openGames"]');
    await W.until(pg, () => location.hash === '#/play' && !document.querySelector('#dz-host'), null, 10000);
    L = await look(); ok(L.h === '#/play' && !L.board, `Back returns to #/play and leaves nothing of it on screen (${L.h})`);
    await pg.evaluate(() => { location.hash = '#/buzz'; }); await board(pg);
    L = await look(); ok(L.nav === 'dailybuzz' && L.board, 'the typed address #/buzz opens it');
    await ctx.close();
  }

  /* ---- 2 + 3. the old game, and never the answer in plain sight ---- */
  const days = [['a normal day', TODAY, null], ['the day whose list word is DAILY', dayFor('daily'), 'daily'],
    ['the day whose list word is SPELL', dayFor('spell'), 'spell'], ['a March day whose list word is MARCH', dayFor('march', 2), 'march']];
  let learned = null;
  for (const [label, when, raw] of days) {
    if (!when) { ok(false, `${label}: no such date found in the list`); continue; }
    const phone = label === 'a normal day';
    const { ctx, pg, errs: e } = await open(b, { vp: phone ? { width: 390, height: 844 } : null, hash: '#/buzz', time: when }); errs.push(...e);
    await board(pg);
    const shape = await rows(pg);
    if (phone) ok(shape.length === 6 && shape.every(r => r === ''), `it is the old board: six empty rows of five (${shape.length} rows)`);
    const before = await said(pg);
    if (phone) {
      /* a short word shakes and is not spent; the on-screen keys type (touch) */
      await tapKeys(pg, 'abc');
      const r1 = await rows(pg); const m = await pg.evaluate(() => document.querySelector('#dz-host .dz-msg').textContent);
      ok(r1[0] === 'abc' && r1[1] === '' && /Five letters/.test(m), `a short word is not spent and says so ("${m}")`);
      for (let i = 0; i < 3; i++) await pg.click('#dz-host .dz-k[data-k="back"]');
      ok((await rows(pg))[0] === '', 'the on-screen ⌫ key deletes');
    }
    const c0 = await coins(pg);
    const word = await loseAndLearn(pg, phone);
    const c1 = await coins(pg);
    ok(/^[a-z]{5}$/.test(word), `${label}: six misses end on "The word was ${word.toUpperCase()}"`);
    ok(word && !new RegExp('\\b' + word + '\\b').test(before), `${label}: the answer (${word}) is nowhere on the screen before the end`);
    if (raw) ok(word !== raw, `${label}: the day's word moved off the screen's own word (${raw} → ${word})`);
    ok(c1 === c0, `${label}: six wrong tries pay nothing (${c1 - c0})`);
    if (phone) learned = { when, word };
    await ctx.close();
  }

  /* ---- 4 + 5. solving pays one coin, once; the old record comes back ---- */
  if (learned) {
    const { ctx, pg, errs: e } = await open(b, { hash: '#/buzz', time: learned.when, rec: { wins: 3, played: 5, lastWin: '2026-9-30', playedDay: '2026-9-30' } }); errs.push(...e);
    await board(pg);
    const c0 = await coins(pg);
    await typeKeys(pg, 'qqqqq'); await typeKeys(pg, learned.word);   // the real keyboard
    await W.until(pg, () => !!document.querySelector('#dz-host .dz-done'), null, 8000);
    const end = await pg.evaluate(() => ({ h: document.querySelector('#dz-host .dz-done h3').textContent, stats: [...document.querySelectorAll('#dz-host .dz-stat')].map(s => s.innerText.replace(/\s+/g, ' ').toLowerCase()), share: !!document.querySelector('#dz-share') }));
    const c1 = await coins(pg);
    ok(/Solved it/.test(end.h) && c1 - c0 === 1, `solving on the second try pays exactly one coin (${c1 - c0}) — "${end.h}"`);
    ok(end.stats.join('|') === '4 solved|6 played|67% won' && end.share, `its old record came back and counted this day: ${end.stats.join(', ')}; Share your grid is there`);
    await pg.evaluate(() => app.openGames()); await W.until(pg, () => location.hash === '#/play', null, 8000);
    await pg.evaluate(() => app.openDailyBuzz()); await W.until(pg, () => !!document.querySelector('#dz-host .dz-done'), null, 8000);
    await typeKeys(pg, learned.word);
    const c2 = await coins(pg), r = await rows(pg);
    ok(c2 === c1 && r[1] === learned.word && r[2] === '', `coming back to a solved day shows it solved and pays nothing more (${c2 - c1})`);

    /* ---- 6. beside Daily Bee ---- */
    await pg.evaluate(() => { location.hash = '#/daily'; });
    const bee = await W.until(pg, () => !!document.querySelector('#db-host .db-grid, #db-host #db-end'), null, 60000);
    await pg.evaluate(() => { location.hash = '#/buzz'; }); await board(pg);
    const both = await pg.evaluate(() => { const c = document.querySelector('#dz-host .dz-cell'); const cs = c && getComputedStyle(c);
      return { cells: document.querySelectorAll('#dz-host .dz-cell').length, w: cs && Math.round(parseFloat(cs.width)), beeSheet: !!document.getElementById('db-css') || [...document.styleSheets].length > 0, dbOnBuzz: document.querySelectorAll('#dz-host .db-cell').length }; });
    ok(bee && both.cells === 30 && both.w >= 44 && both.w <= 56 && !both.dbOnBuzz, `after Daily Bee, Daily Buzz still draws its own board (${both.cells} cells, ${both.w}px)`);
    await ctx.close();
  }

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall passed'); process.exit(fails ? 1 : 0);
})();
