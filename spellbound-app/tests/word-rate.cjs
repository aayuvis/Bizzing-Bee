/* WORD RATE — the floor every shipped game has to clear.

   A spelling game has to ask for spelling. That sounds too obvious to test until
   you measure it: beeGrandPrix, keepFlying, honeycombRun, wordHive and
   spotlightSimon each asked for ZERO words in forty seconds of play. The three
   biggest engines in the arcade — 1,292 lines between them — were racing, flying
   and maze-running, and never once put a word in front of the child.

   THE FLOOR IS SIX UNIQUE WORDS A MINUTE.

   Unique, not total, and that distinction is the whole test. stageRhythm scored
   201 words/minute by speaking ONE word 134 times, and constellationConnect
   spoke one word seventeen times. Repetition is not practice. Counting asks
   rewards a game for nagging; counting distinct words rewards it for teaching.

   HOW IT COUNTS WITHOUT PLAYING WELL: every engine speaks the word it wants,
   because that is how a child knows what to spell. Hooking say() counts the asks
   directly, so the number does not depend on the driver being good at the game —
   which matters, because three earlier attempts at scoring a bot measured the
   bot instead of the game. The driver here only has to keep the game running.

   A game below the floor is not a bad game. It is a game that belongs somewhere
   other than a spelling app.

   THIS IS A FLOOR, AND ONLY A FLOOR. A self-paced engine reads far above it —
   spellShield prints 123/min because the oracle answers the instant the word is
   spoken, which measures the driver's 300ms tick and not the game. Nothing here
   ranks games against each other; the only question asked is whether a minute of
   play contains six words a child had to spell. */
const { chromium } = require('playwright');
const SRC = require('path').resolve(__dirname, '..');
/* 40s, not 30: at 30 the window quantises hard — a game asking every 9 seconds
   lands on 3 or 4 words, which reads as 6 or 8 a minute with nothing in between,
   and a game genuinely at 6.7/min can print 6 on one run and fail on the next.
   The fix belongs in the instrument. Shortening a game's clock so it clears a
   coarse measurement is the tail wagging the dog. */
const SECS = +(process.env.WR_SECS || 40);
const FLOOR = +(process.env.WR_FLOOR || 6);
let fails = 0;
const ok = (b, msg) => { console.log((b ? '  OK   ' : '  FAIL ') + msg); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 900, height: 700 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 100)));
  await pg.goto('file://' + SRC + '/index.html');
  await pg.waitForTimeout(3200);

  const names = await pg.evaluate(() => Object.keys(window.SB_SAGA_ENGINES || {}));
  console.log(`\n  ${names.length} engines · ${SECS}s each · floor ${FLOOR} unique words/min\n`);

  const out = [];
  for (const name of names) {
    const r = await pg.evaluate(async ({ name, secs }) => {
      const host = document.createElement('div');
      host.style.cssText = 'width:680px;height:520px;position:fixed;left:0;top:0;z-index:9999;background:#fff';
      document.body.appendChild(host);
      const said = [];
      let target = '';
      const realSay = window.say;
      window.say = function (w) {
        if (typeof w === 'string' && /^[a-z][a-z'-]{1,19}$/i.test(w)) { said.push(w.toLowerCase()); target = w; }
        try { return realSay && realSay.apply(this, arguments); } catch (e) {}
      };
      let err = '';
      try { window.SB_SAGA_ENGINES[name](host, { diff: 'medium', world: 'Hive' }, () => {}); }
      catch (e) { err = String(e.message).slice(0, 80); }
      /* keep it alive: clear the how-to card (these engines do not start until it is
         dismissed), then work whatever controls the engine drew */
      const START = /to the grid|start|play again|begin|go!|ready|take off|→/i;
      /* MATCH THE HOW-TO CARD, NEVER THE MERE BUTTON CLASS. This read `/howto|rbtn/`,
         and `sg-rbtn` is the shared button skin every engine's SUBMIT wears: spellShield's
         Cast button is `class="sg-rbtn go" id="sg-dgo"`, so the driver classified it as a
         start card, clicked it every 300ms with an empty box, lost the game in four casts
         and restarted through the how-to — 1.5 words/min for a game that asks every nine
         seconds. Fifth instrument bug in a row that made a game look worse than it is; see
         CLAUDE.md for the other four, because a sixth will look just as convincing.
         The how-to's go button is `#sg-howgo` / `.sg-howto-go`; nothing else is a start. */
      const isStart = x => /sg-howto-go/.test(x.className) || x.id === 'sg-howgo' ||
        (START.test(x.textContent || '') && !/\bgo\b/.test(x.className));
      const alive = () => {
        const card = [...host.querySelectorAll('button')].find(x => x.offsetParent !== null && isStart(x));
        if (card) { try { card.click(); } catch (e) {} return; }
        /* AN OPEN SPELL CARD IS ANSWERED, CORRECTLY, WITH THE WORD say() JUST SPOKE.
           Both other options are worse and both were measured. Mashing submit on an
           empty box loses spellShield in four casts, so the run scored the bot's
           suicide rate. Leaving the card alone stalls the three arcade engines dead —
           honeycombRun and beeGrandPrix are MODAL on their spell card, so an unanswered
           one is a paused game, and they read 3 and 4.5 words/min for want of a driver
           that could type.
           This is an ORACLE, not a bot: it is handed the answer through the same hook
           that does the counting, so there is no skill in it and no variance from it.
           That is the line the three failed bot-scoring attempts crossed. What the
           number means is how much spelling a minute of COMPETENT play contains, which
           is the question the product lives on. */
        if (target) {
          const box = [...host.querySelectorAll('input')].find(x => x.offsetParent !== null &&
            !/checkbox|radio|range/.test(x.type || ''));
          if (box) {
            if (box.value !== target) {
              box.value = target;
              try { box.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
            }
            const go = [...host.querySelectorAll('button')].find(x => x.offsetParent !== null &&
              /\bgo\b/.test(x.className) && !/cardw|spk|say/i.test(x.className + ' ' + x.id));
            if (go) { try { go.click(); } catch (e) {} return; }
          }
        }
        /* NEVER CLICK THE SPEAKER. Every engine has a hear-it-again control, and a
           driver that mashes it makes the game look like it is nagging: stageRhythm
           read as "one word said 101 times" when 100 of those were this bot pressing
           replay. A child presses it once, not four times a second. */
        const hit = [...host.querySelectorAll('.sg-dbtn,.sg-sbtn,.sg-cell,.ss-kb,button')]
          /* ...and never click a submit with nothing typed into it — see above. */
          .filter(x => x.offsetParent !== null &&
            !/cardw|spk|say/i.test(x.className + ' ' + x.id) &&
            (isStart(x) || !/\bgo\b/.test(x.className)));
        if (hit.length) { try { hit[Math.floor(Math.random() * hit.length)].click(); } catch (e) {} }
        for (const k of ['ArrowRight', 'ArrowUp', ' ']) {
          try { document.dispatchEvent(new KeyboardEvent('keydown', { key: k, bubbles: true })); } catch (e) {}
        }
      };
      const iv = setInterval(alive, 300);
      await new Promise(r => setTimeout(r, secs * 1000));
      clearInterval(iv); window.say = realSay; host.remove();
      return { name, err, total: said.length, uniq: new Set(said).size };
    }, { name, secs: SECS });
    r.upm = +((r.uniq / SECS) * 60).toFixed(1);
    out.push(r);
    await pg.evaluate(() => document.querySelectorAll('div[style*="z-index:9999"]').forEach(n => n.remove()));
  }
  await b.close();

  for (const r of out) {
    const detail = `${r.name} — ${r.upm} unique words/min (${r.uniq} distinct of ${r.total} asks)` +
      (r.err ? '  MOUNT ERROR: ' + r.err : '');
    ok(!r.err && r.upm >= FLOOR, detail);
  }
  /* a game that repeats one word looks busy and teaches nothing — name it plainly */
  const parrots = out.filter(r => r.total >= 8 && r.uniq <= 1);
  ok(!parrots.length, parrots.length
    ? `no game repeats a single word: ${parrots.map(p => p.name + ' said one word ' + p.total + '×').join(', ')}`
    : 'no game pads its count by repeating one word');
  ok(!errs.length, 'no page errors during play' + (errs.length ? ': ' + errs[0] : ''));

  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
