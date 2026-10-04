/* EVERY ENGINE ENDS ON A SCREEN THAT SHOWS THE WORDS.

   The result screen of a spelling game is the one place a child finds out which
   words they just learned and which one beat them. Six of the eleven engines did
   not have one at all — whackAMoth, keepFlying, stageRhythm, unscrambleStars and
   spellScene called done() and handed the child straight back to the app's
   generic text card — and the five that did printed a score, a honey count and
   ★★☆ typed as glyphs. Not one of them listed a word.

   TWO PHASES, BECAUSE NEITHER ONE IS ENOUGH ON ITS OWN.

   A · STRUCTURE, read off the live engine (all eleven, strict). Each engine's own
       source is read with Function.prototype.toString, so there is no guessing
       which `finish` in a 3,000-line file belongs to which engine, and the host
       is mounted for real. Two things must be true:
         · the engine calls SGUI.result — one screen, not eleven dialects;
         · `#sg-card` exists in its host. whackAMoth, unscrambleStars and
           spellScene had NO card element, so a perfectly correct SGUI.result
           call fell straight through to the done() fallback and looked exactly
           like the bug it was meant to fix. Source alone cannot see that.

   B · IT ACTUALLY RENDERS, played by the oracle from tests/word-rate.cjs — the
       target is taken from the say() hook and typed back. Where a round ends, the
       screen must carry drawn stars (not ★☆ glyphs) and, if the round lasted long
       enough to have resolved a word, at least one word chip. That last clause is
       the one this phase exists for: an engine can call SGUI.result with a round
       array nothing ever pushed to, which renders the original defect wearing the
       fix.

   WHAT PHASE B DOES NOT CLAIM. A generic driver cannot play every game: it cannot
   steer a snake into letters in order, or hit a four-lane rhythm game on the beat.
   Those rounds are allowed not to finish inside the window — phase A is what holds
   them — and a round that ended in under FLOOR_SECS is allowed to list nothing,
   because a child who lost in five seconds resolved no word either.

   USAGE  node tests/result-screen.cjs   [RS_SECS=70 RS_ONLY=typeBlaster]        */
const { chromium } = require('playwright');
const { booted } = require('./lib/wait.cjs');
const SRC = require('path').resolve(__dirname, '..');
const SECS = +(process.env.RS_SECS || 70);
const FLOOR_SECS = 15;          // long enough for the word floor to have fired twice
const ONLY = process.env.RS_ONLY || '';
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const pg = await b.newPage({ viewport: { width: 900, height: 700 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
  await pg.addInitScript(() => { window.SB_DEBUG = true; });
  await pg.goto('file://' + SRC + '/index.html');
  await booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));   // the engines are lazy since FIX-BEE N2 (boot-lazy 'arcade')

  let names = await pg.evaluate(() => Object.keys(window.SB_SAGA_ENGINES || {}));
  if (ONLY) names = names.filter(n => n === ONLY);
  console.log(`\n  ${names.length} engines · up to ${SECS}s each\n`);

  const out = [];
  for (const name of names) {
    const r = await pg.evaluate(async ({ name, secs }) => {
      const host = document.createElement('div');
      host.style.cssText = 'width:680px;height:520px;position:fixed;left:0;top:0;z-index:9999;background:#fff';
      document.body.appendChild(host);
      let target = '', asked = 0, err = '';
      const realSay = window.say;
      window.say = function (w) {
        if (typeof w === 'string' && /^[a-z][a-z'-]{1,19}$/i.test(w)) { target = w; asked++; }
        try { return realSay && realSay.apply(this, arguments); } catch (e) {}
      };
      const src = String(window.SB_SAGA_ENGINES[name] || '');
      try { window.SB_SAGA_ENGINES[name](host, { diff: 'easy', world: 'Hive' }, () => {}); }
      catch (e) { err = String(e.message).slice(0, 90); }

      const isStart = x => /sg-howto-go/.test(x.className) || x.id === 'sg-howgo';
      const drive = () => {
        if (host.querySelector('.sg-endcard')) return;
        const card = [...host.querySelectorAll('button')].find(x => x.offsetParent !== null && isStart(x));
        if (card) { try { card.click(); } catch (e) {} return; }
        if (target) {
          const box = [...host.querySelectorAll('input')].find(x => x.offsetParent !== null &&
            !/checkbox|radio|range/.test(x.type || ''));
          if (box) {
            if (box.value !== target) { box.value = target; try { box.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {} }
            const go = [...host.querySelectorAll('button')].find(x => x.offsetParent !== null &&
              /\bgo\b/.test(x.className) && !/cardw|spk|say/i.test(x.className + ' ' + x.id));
            if (go) { try { go.click(); } catch (e) {} return; }
          }
          for (const ch of target.toLowerCase()) {     // keyboard engines: type it
            try { document.dispatchEvent(new KeyboardEvent('keydown', { key: ch, bubbles: true })); } catch (e) {}
          }
        }
        const hit = [...host.querySelectorAll('.sg-dbtn,.sg-sbtn,.sg-cell,.ss-kb,button')]
          .filter(x => x.offsetParent !== null && !/cardw|spk|say/i.test(x.className + ' ' + x.id) &&
            !/\bgo\b/.test(x.className));
        if (hit.length) { try { hit[Math.floor(Math.random() * hit.length)].click(); } catch (e) {} }
        for (const k of ['ArrowRight', 'ArrowUp', ' ']) {
          try { document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); } catch (e) {}
        }
      };
      const iv = setInterval(drive, 160);
      /* the race and the flight carry their own debug hooks; use them rather than
         spending the whole window driving 2,300 segments of road. 30s first, so the
         word floor has asked for several words before the flag. */
      setTimeout(() => { try { if (window._race) window._race.jump(9e9); } catch (e) {} }, 30000);
      setTimeout(() => { try { if (window._fly) window._fly.steer(5000); } catch (e) {} }, 30000);

      /* GAME time, counted the way the engines count it: every engine advances by its frame's
         dt clamped to 34-50ms, so on a loaded machine 15s of wall clock can be 6s of game — the
         word floor had fired once, nothing had resolved, and "lasted 15s, listed no words" was a
         report on the machine. Clamped at the tightest engine's 34ms: never more than the game
         saw, and on an idle machine (16ms frames) exactly the wall clock it used to be. */
      let game = 0, gLast = null, gOn = true;
      const gTick = ts => { if (gLast != null) game += Math.min(34, ts - gLast); gLast = ts; if (gOn) requestAnimationFrame(gTick); };
      requestAnimationFrame(gTick);
      const t0 = Date.now();
      while (Date.now() - t0 < secs * 1000 && !host.querySelector('.sg-endcard')) {
        await new Promise(r => setTimeout(r, 200));
      }
      gOn = false;
      clearInterval(iv); window.say = realSay;
      const el = host.querySelector('.sg-endcard');
      const res = {
        name, err, asked,
        card: !!host.querySelector('#sg-card'),
        usesResult: /SGUI\.result\(/.test(src),
        end: !!el,
        title: el ? (el.querySelector('.sg-end-h') || {}).textContent || '' : '',
        stars: el ? el.querySelectorAll('.sg-rstar').length : 0,
        chips: el ? el.querySelectorAll('.sg-wchip').length : 0,
        glyph: el ? /[★☆]/.test(el.textContent || '') : false,
        secs: Math.round((Date.now() - t0) / 1000),
        gameSecs: Math.round(game / 1000),
      };
      try { host.remove(); } catch (e) {}
      return res;
    }, { name, secs: SECS });
    out.push(r);
    await pg.evaluate(() => document.querySelectorAll('div[style*="z-index:9999"]').forEach(n => n.remove()));
  }
  await b.close();

  console.log('  A · structure\n');
  for (const r of out) {
    if (r.err) { ok(false, `${r.name} — MOUNT ERROR: ${r.err}`); continue; }
    const why = [!r.usesResult && 'does not call SGUI.result', !r.card && 'has no #sg-card to draw it in']
      .filter(Boolean).join(' and ');
    ok(!why, `${r.name} — ${why || 'ends on SGUI.result, and has somewhere to draw it'}`);
  }

  console.log('\n  B · it renders\n');
  for (const r of out) {
    if (r.err) continue;
    if (!r.end) {
      console.log(`  --     ${r.name} — no ending inside ${r.secs}s of generic play (phase A holds it)`);
      continue;
    }
    const mustList = r.gameSecs >= FLOOR_SECS && r.asked > 0;
    const why = [
      r.stars !== 3 && `drew ${r.stars} stars, not 3`,
      r.glyph && 'still prints ★☆ as glyphs',
      mustList && !r.chips && `lasted ${r.gameSecs}s of play and listed NO words`,
    ].filter(Boolean).join('; ');
    ok(!why, `${r.name} — "${r.title}" · ${r.chips} word${r.chips === 1 ? '' : 's'} listed` +
      (why ? '  BUT ' + why : ''));
  }
  console.log('');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
