/* THE ENGINE KIT: ONE MISS CARD AND ONE CLOCK (games spec §1.4, §1.5; §8 T3, T4 — 4 Oct 2026)

   SGUI.miss / SGUI.missQ (saga2.js):
     - T3: the right spelling stays on screen until Continue — letters typed, time passing and
       an Enter that arrives with the card (the one that submitted the answer) do not close
       it; Enter after that does, and so does a tap; onContinue fires once;
     - the differing letters are marked by SHAPE as well as colour: a wrong letter struck
       through, a missing one a dashed empty box, the right one underlined with a caret;
     - the word is spoken again (say) when the card opens;
     - the note names THIS error, classified from where the letters part company — "aerial"
       typed "arial" is a sound spelled ae, not the Greek f→ph tip it used to get;
     - clocks hold while the card is up (SGUI.held → sgLoop runs no steps).
   sgLoop / SGUI.clock:
     - T4: at 4× CPU throttle, under a heavy game frame, a 6-second clock ends after 6 s of
       real time (± 3%), and the
       loop's simulated time keeps pace with real time (± 3%);
     - hold(true) stops the steps; the clock patches its element's textContent in place and
       never re-renders the app while it runs.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/engine-kit.cjs                    */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, lazy, until, frames } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey' }] };
/* word, typed, expected kind, a pattern the note must match, one it must not */
const KINDS = [
  [{ w: 'aerial', o: 'Latin aerius, from Greek aer' }, 'arial', 'sound', /spelled ae/, /ph|Greek/],
  [{ w: 'knight' }, 'night', 'silent', /k in knight is silent/, null],
  [{ w: 'rhythm' }, 'rythm', 'silent', /h in rhythm is silent/, null],
  [{ w: 'committee' }, 'comittee', 'double', /doubles the m/, null],
  [{ w: 'necessary' }, 'neccessary', 'single', /Only one c/, null],
  [{ w: 'independence' }, 'independance', 'suffix', /-ence \(you wrote -ance\)/, null],
  [{ w: 'doctor' }, 'docter', 'suffix', /-or \(you wrote -er\)/, null],
  [{ w: 'receive' }, 'recieve', 'ie', /spelled with ei/, null],
  [{ w: 'phone', o: 'Greek phone, sound' }, 'fone', 'sound', /spelled ph, not f\. That is a Greek spelling/, null],
  [{ w: 'separate' }, 'seperate', 'vowel', /vowel here is spelled a/, null],
];

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 820 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html');
  ok(await booted(pg), 'the app boots'); await lazy(pg, 'arcade');
  ok(await pg.evaluate(() => typeof sgLoop === 'function' && typeof SGUI.miss === 'function' && typeof SGUI.missQ === 'function' && typeof SGUI.keys === 'function'
    && typeof SGUI.stage === 'function' && typeof SB_HUB === 'function' && typeof SB_PLATE === 'function' && typeof app.hubMode === 'function'), 'the kit is on window: sgLoop, SGUI.miss/missQ/keys/stage, SB_HUB, SB_PLATE, app.hubMode');

  /* ---- the classifier ---- */
  const kinds = await pg.evaluate(K => K.map(([w, t]) => SGUI.missKind(w, t)), KINDS);
  KINDS.forEach(([w, t, k, yes, no], i) => { const r = kinds[i];
    ok(r.k === k && yes.test(r.line) && !(no && no.test(r.line + ' ' + r.rule)), `"${w.w}" typed "${t}" → ${k}: ${r.k} — ${r.line}`); });

  /* ---- T3: the miss card ---- */
  await pg.evaluate(() => {
    window.__render = window.render; window.render = function () {};          // the test owns the screen
    window.__said = []; window.say = w => window.__said.push(w);
    const h = document.createElement('div'); h.id = 'kit-host'; h.style.cssText = 'position:fixed;left:20px;top:80px;width:520px;height:640px;z-index:90;background:#eee';
    document.body.appendChild(h);
    window.__steps = 0; window.__lp = sgLoop(() => { window.__steps++; }, () => {});
    window.__cont = 0;
    window.__h = SGUI.miss(h, { w: 'committee', d: 'a group of people', h: 'Two m, two t, two e — a committee has plenty of everything.' }, 'comittee', { onContinue: () => { window.__cont++; } });
  });
  const card = await pg.evaluate(() => {
    const c = document.querySelector('#kit-host .sg-misscard'); const st = e => getComputedStyle(e), pb = e => getComputedStyle(e, '::before');
    const rowW = [...c.querySelectorAll('.sg-mrow.w .sg-mc')].map(e => e.textContent).join(''), rowT = [...c.querySelectorAll('.sg-mrow.t .sg-mc')].map(e => e.textContent).join('');
    const good = c.querySelector('.sg-mrow.w .sg-mc.good'), gap = c.querySelector('.sg-mrow.t .sg-mc.gap');
    return { visible: !!c && c.getClientRects().length > 0, rowW, rowT, held: SGUI.held,
      goodShape: !!good && /inset/.test(st(good).boxShadow) && pb(good).content !== 'none', gapShape: !!gap && /dashed/.test(st(gap).borderStyle),
      why: (c.querySelector('.sg-mwhy') || {}).getAttribute && c.querySelector('.sg-mwhy').getAttribute('data-why'), note: (c.querySelector('.sg-mwhy') || {}).textContent || '',
      say: !!c.querySelector('[data-sg-say="committee"]') };
  });
  ok(card.visible && card.rowW === 'committee' && card.rowT === 'comittee', `the card shows the child's letters over the word's (${card.rowT} / ${card.rowW})`);
  ok(card.goodShape && card.gapShape, 'the differing letters are marked by shape: the right letter underlined with a caret, the missing one a dashed box');
  ok(card.why === 'double' && /doubles the m/.test(card.note) && /Memory hook/.test(card.note), `the note is about THIS miss: ${card.note.slice(0, 90)}`);
  ok(card.held, 'SGUI.held is true while the card is up');
  ok(await until(pg, () => window.__said.indexOf('committee') >= 0, null, 3000), 'the word is spoken again when the card opens');
  const s0 = await pg.evaluate(() => window.__steps); await frames(pg, 20);
  ok(await pg.evaluate(s0 => window.__steps === s0, s0), 'sgLoop runs no steps while the card is up');
  for (const k of ['x', 'y', 'Backspace', 'a']) await pg.keyboard.press(k);
  await frames(pg, 60);
  ok(await pg.evaluate(() => !!document.querySelector('#kit-host .sg-misscard') && window.__cont === 0), 'letters typed and time passing do not close it — the word stays until Continue');
  await pg.keyboard.press('Enter');
  ok(await until(pg, () => !document.querySelector('#kit-host .sg-misscard') && window.__cont === 1 && !SGUI.held, null, 3000), 'Enter continues: the card closes, onContinue fires once, SGUI.held is false');
  ok(await until(pg, () => window.__steps > 0, null, 3000), 'the loop runs again after Continue');
  /* the Enter that submitted the answer arrives with the card; it is not a Continue */
  const early = await pg.evaluate(() => { window.__cont = 0; SGUI.miss(document.getElementById('kit-host'), 'army', 'armey', { onContinue: () => { window.__cont++; } });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return !!document.querySelector('#kit-host .sg-misscard') && window.__cont === 0; });
  ok(early, 'an Enter in the same moment the card opens does not dismiss it');
  await pg.evaluate(() => document.querySelector('#kit-host .sg-miss-go').click());
  ok(await until(pg, () => !document.querySelector('#kit-host .sg-misscard') && window.__cont === 1), 'a tap on Continue closes it');
  /* the trivia card */
  await pg.evaluate(() => { window.__cont = 0; SGUI.missQ(document.getElementById('kit-host'), { q: 'Which word comes from the Greek for "star"?', c: ['asterisk', 'stellar', 'sidereal', 'astral'], f: 'An asterisk is a little star on the page.' }, 'stellar', { onContinue: () => { window.__cont++; } }); });
  const q = await pg.evaluate(() => { const c = document.querySelector('#kit-host .sg-misscard');
    return { q: !!c && /Greek for "star"/.test(c.textContent), picked: (c.querySelector('.sg-mopt.bad s') || {}).textContent, right: (c.querySelector('.sg-mopt.good b') || {}).textContent, fact: /Did you know\?.*little star/.test(c.textContent), held: SGUI.held }; });
  ok(q.q && q.picked === 'stellar' && q.right === 'asterisk' && q.fact && q.held, `the trivia card: the question, the pick struck, the answer, its "Did you know?" (${q.picked} → ${q.right})`);
  await frames(pg, 30);
  ok(await pg.evaluate(() => !!document.querySelector('#kit-host .sg-misscard')), 'the trivia card waits for Continue too');
  await pg.keyboard.press('Enter');
  ok(await until(pg, () => !document.querySelector('#kit-host .sg-misscard') && window.__cont === 1), 'Enter continues the trivia card');
  await pg.evaluate(() => { window.__lp.stop(); });

  /* ---- T4: real time at 4× CPU throttle, on a stage (where every timed round runs) ---- */
  await pg.evaluate(() => { document.querySelector('.sb-content').innerHTML = SGUI.stage({ plate: 'gym', hud: { left: 'a', center: '<h1 class="sg-st-title">Sprint</h1>', right: 'b' }, play: '<div id="kit-play"></div>' });
    SGUI.stageFit(); document.getElementById('kit-play').appendChild(document.getElementById('kit-host')); });
  await pg.evaluate(() => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = SB_PLATE('gym'); }));
  await frames(pg, 6);
  /* a game's own frame costs time too: 60ms of work a frame on top of the 4x throttle, so the
     frames run ~70ms — slow enough that a clock counting frames, or one clamping dt to 50ms
     (the old engines' Math.min(0.05, …)), visibly runs slow */
  await pg.evaluate(() => { window.__stopLoad = false; window.__ft = []; window.__ms = 60; let last = performance.now();
    const L = now => { window.__ft.push(now - last); last = now; const t0 = performance.now(); while (performance.now() - t0 < window.__ms) {} if (!window.__stopLoad) requestAnimationFrame(L); }; requestAnimationFrame(L); });
  const cdp = await ctx.newCDPSession(pg);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  const clk = await pg.evaluate(() => new Promise(res => {
    const el = document.createElement('b'); el.id = 'kit-clock'; document.getElementById('kit-host').appendChild(el);
    /* any render() a lazy file's arrival makes is not the clock's: count only those called from saga2.js */
    let renders = 0; const R = window.render; window.render = function () { if (/saga2\.js/.test(new Error().stack || '')) renders++; };
    const ticks = []; const t0 = performance.now(), k0 = window.__ft.length;
    SGUI.clock(6, { el, onTick: s => ticks.push(s), onEnd: () => { const t = (document.timeline.currentTime - t0) / 1000; window.render = R;   /* the frame it ended on, not the game work queued ahead of it */
      const f = window.__ft.slice(k0).sort((a, b) => a - b);
      res({ t, ticks, same: document.getElementById('kit-clock') === el, text: el.textContent, renders, ft: f.length ? f[f.length >> 1] : 0 }); } });
  }));
  ok(Math.abs(clk.t - 6) <= 0.18, `a 6 s clock at 4× throttle ends after ${clk.t.toFixed(3)} s of real time (± 3%)`);
  ok(clk.ticks.join() === '6,5,4,3,2,1,0' && clk.same && clk.text === '0' && clk.renders === 0, `the clock patches its own element in place (${clk.ticks.join(',')}) and never re-renders the app (${clk.renders})`);
  /* the loop is the spec's: at most 12 steps (0.1 s) a frame, so it is held to real time on
     frames under 100ms: the same 60ms of work a frame, and what the accumulator owes counts */
  const sim = await pg.evaluate(() => new Promise(res => { window.__ms = 60; let s = 0; const t0 = performance.now();
    /* simulated time = the steps run + what the accumulator still owes (render's alpha / 120):
       a frame over 100ms defers steps to the next frames, it never drops them */
    /* the spec clips a single hitch at 0.25 s on purpose (a stall is not play): `due` is real
       time with that clip applied, measured beside the loop, so a loaded machine's stalls are
       neither blamed on the loop nor hidden by it */
    let due = 0, prev = performance.now(), clipped = 0;
    /* the frame's own timestamp (what the loop reads), not performance.now() inside the callback,
       which runs after the 30ms of game work queued ahead of it in the same frame */
    const lp = sgLoop(dt => { s += dt; }, a => { const now = document.timeline.currentTime, d = (now - prev) / 1000; prev = now; due += Math.min(0.25, d); if (d > 0.25) clipped++;
      const real = (now - t0) / 1000; if (real >= 2) { lp.stop(); res({ s: s + a / 120, real, due, clipped }); } }); }));
  ok(Math.abs(sim.s - sim.due) / sim.due <= 0.03, `sgLoop's simulated time keeps pace with real time at 4× throttle (${sim.s.toFixed(3)} s simulated, ${sim.due.toFixed(3)} s due, ${sim.real.toFixed(3)} s on the clock, ${sim.clipped} hitch${sim.clipped === 1 ? '' : 'es'} over 0.25 s)`);
  await pg.evaluate(() => { window.__stopLoad = true; });
  ok(clk.ft >= 60, `the throttled frames were really slow while the clock ran (median ${clk.ft.toFixed(0)}ms) — it was tested under load`);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  const hold = await pg.evaluate(() => new Promise(res => { let n = 0; const lp = sgLoop(() => { n++; }, () => {});
    setTimeout(() => { lp.hold(true); const a = n; setTimeout(() => { const b = n; lp.hold(false); setTimeout(() => { lp.stop(); res({ a, b, c: n }); }, 150); }, 300); }, 150); }));
  ok(hold.a > 0 && hold.b === hold.a && hold.c > hold.b, `hold(true) stops the steps and hold(false) resumes them (${hold.a} → ${hold.b} → ${hold.c})`);

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
