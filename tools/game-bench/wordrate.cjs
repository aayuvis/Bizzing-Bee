#!/usr/bin/env node
/* ============================================================================
   WORD RATE — how much spelling a minute of each game actually contains.
   ----------------------------------------------------------------------------
   WHY THIS METRIC, AFTER THREE FAILED ONES

   Scoring a bot against these games kept measuring the bot. Four iterations in,
   watching a real run of beeGrandPrix showed something the scores could not:
   twelve seconds of racing, speed climbing 42 → 92 → 80, and say() never fired
   once. No word was asked for. The child was driving, not spelling.

   That is the number this product lives or dies on, and it does not depend on
   how well a bot plays: HOW MANY WORDS DOES A MINUTE OF THIS GAME ASK FOR?

   A spelling game whose first word arrives after forty seconds is a racing game.
   One that asks every four seconds is a spelling game. Both can be fun; only one
   is the product. Hooking say() counts it directly, because every engine speaks
   the word it wants — that is how a child knows what to spell.

   Two supporting measures, both independent of bot skill:
     ttfw  seconds to the FIRST word — how long before a child does the thing
           they came for. A menu, an intro card and a warm-up lap all live here.
     fps/p99  what the device actually paints while this is on screen.

   The policy here is deliberately dumb — dismiss cards, tap the controls the
   engine drew, keep the vehicle alive. It is not trying to play well. It only
   has to keep the game running so the game can ask for words.

   USAGE  node tools/game-bench/wordrate.cjs [--secs 45]
   ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const SECS = +arg('--secs', 45);
const APP = '/home/user/Bizzing-Bee/spellbound-app';
const OUT = path.join(__dirname, 'build');

const RUN = async ({ name, secs }) => {
  const R = { name, words: [], ttfw: null, frames: 0, ft: [], finished: false, win: null, score: 0, err: '' };
  const host = document.createElement('div');
  host.style.cssText = 'width:680px;height:520px;position:fixed;left:0;top:0;z-index:9999;background:#fff';
  document.body.appendChild(host);
  const t0 = performance.now();

  /* every engine speaks the word it is asking for — that is the ask, counted */
  const realSay = window.say;
  window.say = function (w) {
    if (typeof w === 'string' && /^[a-z][a-z'-]{1,19}$/i.test(w)) {
      const t = (performance.now() - t0) / 1000;
      if (R.ttfw === null) R.ttfw = +t.toFixed(1);
      R.words.push({ w: w.toLowerCase(), t: +t.toFixed(1) });
    }
    try { return realSay && realSay.apply(this, arguments); } catch (e) {}
  };

  let last = performance.now(), raf = 0;
  const frame = () => { const n = performance.now(); R.frames++; R.ft.push(n - last); last = n; raf = requestAnimationFrame(frame); };
  raf = requestAnimationFrame(frame);

  let handle = null, ended = false;
  try { handle = window.SB_SAGA_ENGINES[name](host, { diff: 'medium', world: 'Hive' },
    res => { if (!ended) { ended = true; R.finished = true; R.win = !!(res && res.win); R.score = (res && res.score) || 0; } }); }
  catch (e) { R.err = String(e.message).slice(0, 90); window.say = realSay; return R; }

  const START = /to the grid|start|play|begin|go!|ready|→/i;
  const alive = () => {
    const card = [...host.querySelectorAll('button')].find(x => x.offsetParent !== null &&
      (/howto|rbtn/.test(x.className) || START.test(x.textContent || '')));
    if (card) { try { card.click(); } catch (e) {} return; }
    const pad = [...host.querySelectorAll('.sg-dbtn,.sg-sbtn,.sg-cell,.ss-kb,button')]
      .filter(b => b.offsetParent !== null && !/howto/.test(b.className));
    if (pad.length) { try { pad[Math.floor(Math.random() * pad.length)].click(); } catch (e) {} }
    for (const k of ['ArrowRight', 'ArrowUp', ' ']) {
      try { document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); } catch (e) {}
    }
  };
  const iv = setInterval(alive, 300);
  await new Promise(r => setTimeout(r, secs * 1000));
  clearInterval(iv); cancelAnimationFrame(raf);
  try { if (handle && handle.destroy) handle.destroy(); } catch (e) {}
  window.say = realSay; host.remove();
  R.ft = R.ft.slice(0, 5000);
  return R;
};

const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 100)));
  await page.goto('file://' + APP + '/index.html');
  await page.waitForTimeout(3200);

  const names = await page.evaluate(() => Object.keys(window.SB_SAGA_ENGINES || {}));
  console.log(`${names.length} engines · ${SECS}s each · measuring words asked, not bot skill\n`);
  console.log('ENGINE'.padEnd(22) + 'words/min'.padStart(10) + '1st word'.padStart(10) +
              'uniq'.padStart(6) + 'fps'.padStart(5) + 'p99'.padStart(8) + '   verdict');

  const rows = [];
  for (const name of names) {
    const before = errs.length;
    let r; try { r = await page.evaluate(RUN, { name, secs: SECS }); }
    catch (e) { r = { name, err: String(e.message).slice(0, 70), words: [], ft: [] }; }
    r.errs = errs.length - before;
    r.p50 = +pct(r.ft || [], 0.5).toFixed(1); r.p99 = +pct(r.ft || [], 0.99).toFixed(1);
    r.fps = r.p50 ? Math.round(1000 / r.p50) : 0;
    r.wpm = +((r.words.length / SECS) * 60).toFixed(1);
    r.uniq = new Set(r.words.map(w => w.w)).size;
    delete r.ft;
    rows.push(r);
    const verdict = r.err ? 'MOUNT ERROR' :
      r.wpm === 0 ? 'asks for NO words' :
      r.wpm < 4 ? 'arcade with a word bolted on' :
      r.wpm < 10 ? 'thin' : 'real practice';
    console.log(name.padEnd(22) + String(r.wpm).padStart(10) +
      String(r.ttfw === null ? '—' : r.ttfw + 's').padStart(10) +
      String(r.uniq).padStart(6) + String(r.fps).padStart(5) +
      String(r.p99 + 'ms').padStart(8) + '   ' + verdict +
      (r.errs ? `  (${r.errs} pageerror)` : ''));
    await page.evaluate(() => document.querySelectorAll('div[style*="z-index:9999"]').forEach(n => n.remove()));
  }
  fs.writeFileSync(path.join(OUT, 'wordrate.json'), JSON.stringify({ secs: SECS, rows }, null, 1));
  console.log('\n→', path.join(OUT, 'wordrate.json'));
  await browser.close();
})();
