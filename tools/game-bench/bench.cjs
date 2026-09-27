#!/usr/bin/env node
/* ============================================================================
   GAME BENCH — plays every arcade engine and measures what reading code cannot.
   ----------------------------------------------------------------------------
   THE ONE METRIC THAT MATTERS, AND WHY IT NEEDS A BOT

   "Depth" is not lines of code and not a feature list. A game has depth when
   PLAYING IT WELL BEATS PLAYING IT BADLY. That is measurable, but only by
   playing: run the same game under three policies and compare the scores.

     idle    no input at all — what does doing nothing earn?
     random  legal but thoughtless input — mashing
     smart   reads the DOM for the thing the game is asking for and does it

   Read the gap. If smart ≈ random, the game rewards presence, not skill: there
   is nothing to get good at, and no child will come back to it. If idle scores
   at all, the game pays out for watching. Both are fatal for a game meant to be
   competitive, and neither is visible in the source.

   The second thing only playing shows is FEEL. Eleven of these engines drive
   themselves with setInterval rather than requestAnimationFrame, so this
   instruments rAF and records real frame times during play — p50 for the normal
   case and p99 for the stutter a child actually notices.

   USAGE  node tools/game-bench/bench.cjs [--secs 15] [--diff medium] [--only name]
   ==========================================================================*/
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const SECS = +arg('--secs', 15);
const DIFF = arg('--diff', 'medium');
const ONLY = arg('--only', '');
const APP = '/home/user/Bizzing-Bee/spellbound-app';
const CHROME = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const OUT = path.join(__dirname, 'build');

/* Runs INSIDE the page. Mounts one engine, drives it under one policy, and
   samples the world every 250ms so "was there anything to do just then?" is
   measured across the whole run rather than guessed at the end. */
const PLAY = async ({ name, policy, secs, diff }) => {
  const R = {
    name, policy, frames: 0, ft: [], score: 0, win: null, finished: false,
    ticks: 0, dead: 0, targets: 0, inputs: 0, err: '',
    /* THROUGHPUT, not final score. These engines only report a score when their
       own 90s clock runs out, so a short run would read 0 for every policy and
       every game — which looks like "no depth" when it is really "no time". What
       actually separates a good player from a masher is how much SPELLING they
       get done per minute, so count letters solved and words completed as they
       happen, by watching the game's own HUD. */
    letters: 0, words: 0, hudScore: 0,
  };
  let lastDone = 0, lastWord = 0;
  const host = document.createElement('div');
  host.style.cssText = 'width:680px;height:520px;position:fixed;left:0;top:0;z-index:9999';
  document.body.appendChild(host);

  /* Count every frame the page actually paints while the game is up. A game on
     setInterval still yields frames — they just are not its frames, which is the
     point: nothing it draws is synchronised to them. */
  let last = performance.now(), raf = 0;
  const tickFrame = () => {
    const now = performance.now();
    R.frames++; R.ft.push(now - last); last = now;
    raf = requestAnimationFrame(tickFrame);
  };
  raf = requestAnimationFrame(tickFrame);

  /* HOW A REAL PLAYER KNOWS THE WORD. These engines deliberately never print the
     answer — unsolved letters render as bullets, which is the app's own rule
     ("never leak the answer in on-screen text"). So a DOM-reading bot cannot play
     them, and that is the game working, not a bug. A child knows the word because
     the game SAYS it. Hooking say() gives the bot exactly the same input a
     listening player has, and nothing more: hear the word, then spell it. */
  let heard = '';
  const realSay = window.say;
  window.say = function (w) { if (typeof w === 'string' && /^[a-z-]{2,20}$/i.test(w)) heard = w.toLowerCase();
    try { return realSay && realSay.apply(this, arguments); } catch (e) {} };

  let handle = null, ended = false;
  const done = res => {
    if (ended) return; ended = true;
    R.finished = true; R.win = !!(res && res.win); R.score = (res && res.score) || 0;
  };
  try { window.__engSrc = String(window.SB_SAGA_ENGINES[name]); } catch (e) { window.__engSrc = ''; }
  try { handle = window.SB_SAGA_ENGINES[name](host, { diff, world: 'Hive' }, done); }
  catch (e) { R.err = 'mount: ' + String(e.message).slice(0, 90); return R; }

  const KEYS = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  const fire = (type, init) => { try { host.dispatchEvent(new KeyboardEvent(type, Object.assign({ bubbles: true }, init)));
    document.dispatchEvent(new KeyboardEvent(type, Object.assign({ bubbles: true }, init))); } catch (e) {} };
  const press = k => { fire('keydown', { key: k }); fire('keyup', { key: k }); R.inputs++; };
  const tap = el => { try { el.click(); R.inputs++; } catch (e) {} };

  /* What the game is asking for right now, read generically from the DOM. These
     engines share a vocabulary — a target strip of .sg-tl spans with the next one
     marked, a grid of .sg-cell buttons, sometimes a text input — so one reader
     covers all fourteen without per-game bot code. */
  const look = () => {
    const nextEl = host.querySelector('.sg-tl.next, .next');
    const strip = [...host.querySelectorAll('.sg-tl')];
    const doneN = strip.filter(s => s.classList.contains('done')).length;
    const word = (host.querySelector('#sg-target, .sg-target') || {}).textContent || '';
    const cells = [...host.querySelectorAll('button,.sg-cell,[data-i],[data-ch]')]
      .filter(b => b.offsetParent !== null && !b.disabled);
    const input = host.querySelector('input[type=text],input:not([type]),textarea');
    const arrows = /Arrow/.test(window.__engSrc || '');
    return { nextEl, strip, doneN, word, cells, input, arrows };
  };

  const step = () => {
    if (ended) return;
    const w = look();
    R.ticks++;
    /* "Dead" = the policy had nothing it could meaningfully act on. Idle time is
       not difficulty; it is a child waiting for the game to offer them a turn. */
    /* letters: .sg-tl.done grows within a word and resets when the next begins,
       so bank the peak on each reset rather than trusting the instantaneous count */
    const nowDone = w.strip.filter(s2 => s2.classList.contains('done')).length;
    if (nowDone < lastDone) R.letters += lastDone; 
    lastDone = nowDone;
    const wm = (host.textContent.match(/Word\s+(\d+)\s*\/\s*(\d+)/) || [])[1];
    if (wm) { const n = +wm; if (n > lastWord) { R.words = n - 1; lastWord = n; } }
    const sc = (host.querySelector('#sg-score') || {}).textContent;
    if (sc && !isNaN(+sc)) R.hudScore = Math.max(R.hudScore, +sc);

    const actionable = w.cells.length + (w.input ? 1 : 0);
    R.targets += actionable;
    if (!actionable) R.dead++;

    if (policy === 'idle') return;
    if (clearIntro()) return;                 /* a card is up: nothing else is playable */

    if (policy === 'random') {
      if (w.cells.length && Math.random() < 0.8) tap(w.cells[Math.floor(Math.random() * w.cells.length)]);
      else press(KEYS[Math.floor(Math.random() * KEYS.length)]);
      if (Math.random() < 0.3) press(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '][Math.floor(Math.random() * 5)]);
      return;
    }

    /* smart: find the letter the game wants next and deliver it, by whichever
       route this engine accepts — a cell carrying that letter, or the keyboard. */
    let need = '';
    /* the word it just spoke, at the position this game has reached */
    if (heard) need = heard[w.doneN] || '';
    const nx = w.nextEl;
    if (!need && nx && nx.dataset && nx.dataset.ch) need = nx.dataset.ch;
    if (!need) {
      const target = (host.querySelector('[data-word]') || {}).dataset?.word || '';
      if (target) need = target[w.doneN] || '';
    }
    if (!need) {
      /* a word printed in full (falling-word games do show it) is fair to read */
      const shown = (host.textContent.match(/\b[a-z]{3,14}\b/i) || [])[0];
      if (shown) need = shown[w.doneN] || '';
    }
    /* THE GATE. Nine of the fourteen spell through a text box that appears when the
       arcade layer pauses — the whole "spell at a gate" pattern. A bot that only
       taps cells and presses single keys walks straight past the mechanic and
       scores nothing, which reads as "no depth" and is really "never played".
       Fill it the way a child does: the word it just heard, then commit. */
    if (w.input && heard) {
      const el = w.input;
      if ((el.value || '').toLowerCase() !== heard) {
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
        try { setter && setter.set ? setter.set.call(el, heard) : (el.value = heard); } catch (e) { el.value = heard; }
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        R.inputs++;
        return;                       /* let the engine see the value before commit */
      }
      el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      const go = w.cells.find(c => /check|go|submit|enter|spell|✓|done/i.test(c.textContent || ''));
      if (go) tap(go);
      R.inputs++;
      return;
    }
    if (need) {
      /* an on-screen keyboard (.ss-kb) is how typeBlaster takes letters — it has no
         text field at all, so "type the word" means tapping these keys in order */
      const kb = [...host.querySelectorAll('.ss-kb,.sg-tbkey,.ss-key')]
        .find(k => (k.textContent || '').trim().toLowerCase() === need.toLowerCase());
      if (kb) { tap(kb); return; }
      const cell = w.cells.find(c => (c.dataset && c.dataset.ch === need) ||
        c.textContent.trim().toLowerCase() === need.toLowerCase());
      if (cell) { tap(cell); return; }
      press(need.toLowerCase()); return;
    }
    /* arcade layer with no gate up: keep the vehicle alive and moving, which is
       what a player does between gates — standing still is not neutral, it dies */
    if (w.arrows) {
      /* the engines draw their own d-pad (.sg-dbtn) and steer buttons (.sg-sbtn);
         tapping those is the touch path a phone player uses */
      const pad = [...host.querySelectorAll('.sg-dbtn,.sg-sbtn')].filter(b => b.offsetParent !== null);
      if (pad.length) { tap(pad[Math.floor(Math.random() * pad.length)]); return; }
      press(['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '][Math.floor(Math.random() * 4)]); return;
    }
    /* nothing legible to aim at: keep the game alive the way a player would */
    if (w.cells.length) tap(w.cells[0]); else press(' ');
  };

  /* THESE GAMES OPEN ON A HOW-TO CARD. beeGrandPrix greets you with "To the grid!
     →" and does not start until it is dismissed — so a bot that starts tapping
     immediately spends the whole run reading the instructions and scores zero,
     which is what thirteen 0x readings actually were. Clear any start gate first,
     the way a player does, and keep clearing it: several engines show a fresh card
     between rounds. */
  const START = /to the grid|start|play|begin|go!|let's|→|ready/i;
  const clearIntro = () => {
    const b = [...host.querySelectorAll('button')].find(x =>
      x.offsetParent !== null && (/howto|rbtn/.test(x.className) || START.test(x.textContent || '')));
    if (b) { try { b.click(); R.inputs++; return true; } catch (e) {} }
    return false;
  };
  clearIntro();

  const iv = setInterval(step, 250);
  await new Promise(r => setTimeout(r, secs * 1000));
  clearInterval(iv); cancelAnimationFrame(raf);
  R.letters += lastDone;
  window.say = realSay;
  try { if (handle && handle.destroy) handle.destroy(); } catch (e) {}
  host.remove();
  R.ft = R.ft.slice(0, 4000);
  return R;
};

const pct = (a, p) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * p))]; };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: CHROME });
  const page = await browser.newPage({ viewport: { width: 900, height: 700 } });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await page.goto('file://' + APP + '/index.html');
  await page.waitForTimeout(3200);

  let names = await page.evaluate(() => Object.keys(window.SB_SAGA_ENGINES || {}));
  if (ONLY) names = names.filter(n => n === ONLY);
  console.log(`${names.length} engines · ${SECS}s each · idle/random/smart · diff=${DIFF}\n`);

  const rows = [];
  for (const name of names) {
    const line = { name };
    for (const policy of ['idle', 'random', 'smart']) {
      const before = errs.length;
      let r;
      try { r = await page.evaluate(PLAY, { name, policy, secs: SECS, diff: DIFF }); }
      catch (e) { r = { name, policy, err: 'eval: ' + String(e.message).slice(0, 80), ft: [] }; }
      r.errs = errs.length - before;
      r.p50 = Math.round(pct(r.ft || [], 0.5) * 10) / 10;
      r.p99 = Math.round(pct(r.ft || [], 0.99) * 10) / 10;
      r.fps = r.p50 ? Math.round(1000 / r.p50) : 0;
      r.deadPct = r.ticks ? Math.round(100 * r.dead / r.ticks) : 100;
      delete r.ft;
      line[policy] = r;
      /* a crashed engine keeps throwing into the next run; clear the page state */
      await page.evaluate(() => { document.querySelectorAll('div[style*="z-index:9999"]').forEach(n => n.remove()); });
    }
    /* Progress beats final score as the comparison basis, for the reason above.
       Fall back to the reported score when an engine did finish inside the run. */
    const prog = p => (line[p].letters || 0) + (line[p].words || 0) * 3 + (line[p].score ? 5 : 0);
    const s = prog('smart'), rd = prog('random'), id = prog('idle');
    line.progress = { idle: id, random: rd, smart: s };
    line.skillGap = rd > 0 ? +(s / rd).toFixed(2) : (s > 0 ? 99 : 0);
    line.idlePay = id;
    rows.push(line);
    console.log(
      name.padEnd(22) +
      ` fps ${String(line.smart.fps).padStart(3)}` +
      `  p99 ${String(line.smart.p99).padStart(6)}ms` +
      `  dead ${String(line.smart.deadPct).padStart(3)}%` +
      `  idle ${String(id).padStart(4)}` +
      `  rand ${String(rd).padStart(4)}` +
      `  smart ${String(s).padStart(4)}` +
      `  gap ${String(line.skillGap).padStart(5)}x` +
      (line.smart.err ? '  ERR ' + line.smart.err : '') +
      (line.smart.errs ? `  (${line.smart.errs} pageerror)` : ''));
  }

  fs.writeFileSync(path.join(OUT, 'bench.json'), JSON.stringify({ secs: SECS, diff: DIFF, rows }, null, 1));
  console.log('\n→', path.join(OUT, 'bench.json'));
  await browser.close();
})();
