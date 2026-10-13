/* THE JUICE CELEBRATES THE ANSWER AND THE ROUND — NEVER A RUN (road to 4.5, P3.14 / P3.15, and P3.8) — @check

   (P3.8 rides here too: a page transition is the same kind of motion.) The quiz games got their feel: a sting on a right answer, a calm shake on a miss, a card that flips in, a round's end
   that lands. The owner's rule bounds all of it: no streaks or run counts anywhere (FIX-BEE removed them; lore-hubs fails on
   "in a row"). So this holds, live, in Word Lore, Hive Mind, the Spelling Gym, Daily Bee, Word Forge and the Analogies:
     1. a right answer plays the game's OWN sting (SGUI.sting, oscillators on the one AudioContext — counted here by
        wrapping createOscillator), and the notes of the first right answer and the fourth are the SAME: nothing climbs,
        counts or reads the round's history; two hubs do not share a sting;
     2. a right pick pops, a missed pick shakes (calmly), the miss card arrives with one shake, a new question card flips
        in and the round's end card lands — each seen as the class arrives (a MutationObserver from the first paint, so a
        loaded machine cannot miss a 400 ms window);
     3. a finished round plays the game's 'done' sting (Lore, the Gym, Daily Bee, Forge) — never one for a run of rights;
     4. the stings are OFF in Calm mode and when sound effects are off (the plain tone, or nothing at all), and at volume 0;
     5. all of that motion is OFF under Reduce motion: the OS setting (prefers-reduced-motion) and the app's own
        (data-motion="off") each leave every juice class with no animation;
     6. no "in a row", streak, combo, "on fire" or run count is on any of these screens after several rights.
     7. (P3.8) a screen the child asks for (a real tap on a tab) fades in; one the app opens by itself, or a re-render of
        the same screen, does not; under either Reduce motion it arrives still.
   Proved by breaking (13 Oct 2026, the faults put in, the test watched to fail, the files compared with their copies
   after): run 1, five at once — a sting that climbs with the round (SGUI.sting transposed by the stings already
   played), saga2.css's reduced-motion line for the juice classes taken out, the fade with no "asked for" condition,
   and saga2.css's reduced-motion line for the fade taken out: 5 fail (the fourth Lore right's notes, the gym's last
   right's notes, prefers-reduced-motion — the miss card on <body> shaking, the screen opened by itself flashing,
   the fade under prefers-reduced-motion); run 2, stingOn() ignoring Calm: 1 fails (Calm plays a sting); run 3, Word
   Lore's ding() back on plain sfx: 3 fail (Lore's sting, the fourth right's notes, Hive Mind's own sting).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/game-juice.cjs                                      */
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' };

/* at the first paint: count the oscillators, and record every juice class as it arrives (with its animation then) */
function rig() {
  try { const P = (window.AudioContext || window.webkitAudioContext).prototype, o = P.createOscillator;
    P.createOscillator = function () { window.__osc = (window.__osc || 0) + 1; return o.apply(this, arguments); }; } catch (e) {}
  window.__fx = [];
  const seen = new WeakMap();
  const note = el => { const c = typeof el.className === 'string' ? el.className : ''; const m = c.match(/\bsg-fx-(in|pop|shake|done)\b|\bsb-enter\b/); if (!m) return;
    if (seen.get(el) === m[0]) return; seen.set(el, m[0]);
    let an = ''; try { an = getComputedStyle(el).animationName; } catch (e) {}
    window.__fx.push({ fx: m[0], cls: c.replace(/\s+/g, ' ').slice(0, 80), an, t: Date.now() }); if (window.__fx.length > 400) window.__fx.shift(); };
  const scan = n => { if (!n || n.nodeType !== 1) return; note(n); if (n.querySelectorAll) n.querySelectorAll('[class*="sg-fx-"]').forEach(note); };
  new MutationObserver(ms => { for (const m of ms) { if (m.type === 'attributes') note(m.target); else m.addedNodes.forEach(scan); } })
    .observe(document, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  await ctx.addInitScript(rig);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await W.booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['arcade', 'quizhubs'], r)));
  /* the music (composed in code, on the same AudioContext) is switched off so the oscillators counted are the answer's */
  await pg.evaluate(() => { try { SB_VOL.setMusic(false); } catch (e) {} });
  /* SGUI._stung keeps the last 24 stings, so a count would stop moving: read the ones played since a moment instead */
  const now = () => pg.evaluate(() => Date.now());
  const stung = (t) => pg.evaluate(t => (window.SGUI && SGUI._stung || []).filter(s => s.t >= t).map(s => ({ game: s.game, kind: s.kind, notes: JSON.stringify(s.notes) })), t || 0);
  const osc = () => pg.evaluate(() => window.__osc || 0);
  const fx = (k, re) => pg.evaluate(([k, re]) => (window.__fx || []).filter(x => x.fx === k && new RegExp(re).test(x.cls)), [k, re]);
  const clearFx = () => pg.evaluate(() => { window.__fx = []; });
  const noRun = async (where) => { const t = await pg.evaluate(() => document.body.innerText);
    const m = t.match(/in a row|streak|combo|on fire|\b\d+\s*(x|×)\s*(combo|bonus)?\b(?! of)|hot hand/i);
    ok(!m, `${where}: no run, streak or combo on screen (${m ? '"' + m[0] + '"' : 'none'})`); };

  /* ---------------------------------------------------------------- Word Lore */
  console.log('\n1–3. Word Lore: a right answer, a fourth, a miss, the round');
  await pg.evaluate(() => app.openLore('meanings'));
  await W.until(pg, () => state.qz && state.qz.mode === 'meanings' && state.qz.phase === 'play' && !!document.querySelector('.qz-opt'), null, 60000);
  const lv = async (wrong) => { const t0 = await now(), o0 = await osc();
    await pg.evaluate(w => { const q = SB_QHUB._cur(); app.qzPick(w ? (q.ans + 1) % q.opts.length : q.ans); }, wrong);
    await pg.waitForTimeout(120); return { added: await stung(t0), osc: (await osc()) - o0 }; };
  const nextQ = async () => { const i = await pg.evaluate(() => state.qz.i); await pg.evaluate(() => app.qzGo());
    await W.until(pg, i => state.qz.phase === 'done' || (state.qz.i !== i && state.qz.picked == null && !!document.querySelector('.qz-opt:not([disabled])')), i, 8000); };
  const r1 = await lv(false);
  ok(r1.added.length === 1 && r1.added[0].game === 'lore' && r1.added[0].kind === 'right' && r1.osc >= 3,
    `a right answer plays Word Lore's own sting on the AudioContext (${JSON.stringify(r1.added.map(s => s.game + '/' + s.kind))}, ${r1.osc} oscillators)`);
  ok((await fx('sg-fx-pop', 'qz-opt')).length >= 1, 'the right pick pops');
  ok((await fx('sg-fx-in', 'qz-card')).length >= 1, 'the question card flipped in when it arrived');
  const firsts = [r1];
  for (let k = 0; k < 3; k++) { await nextQ(); firsts.push(await lv(false)); }
  ok((await fx('sg-fx-in', 'qz-card')).length >= 4, `every new question card flips in (${(await fx('sg-fx-in', 'qz-card')).length})`);
  ok(firsts.every(r => r.added.length === 1 && r.added[0].notes === r1.added[0].notes),
    'the fourth right answer plays exactly the first one\'s notes — nothing climbs with a run');
  await noRun('Word Lore after four rights');
  await nextQ();
  await clearFx();
  const m1 = await lv(true);
  await pg.waitForTimeout(150);
  ok(m1.added.length === 0 && m1.osc >= 1, `a miss plays the plain miss tone, never a sting (${m1.added.length} stings, ${m1.osc} oscillators)`);
  ok((await fx('sg-fx-shake', 'qz-opt')).length >= 1 || (await fx('sg-fx-shake', 'sg-misscard')).length >= 1, 'the missed pick shakes');
  ok((await fx('sg-fx-shake', 'sg-misscard')).length >= 1, 'the miss card arrives with one calm shake');
  await pg.evaluate(() => app.qzGo()); await W.until(pg, () => state.qz.phase === 'done' || (!state.qz.held && !!document.querySelector('.qz-opt:not([disabled])')), null, 8000);
  for (let k = 0; k < 12 && await pg.evaluate(() => state.qz.phase !== 'done'); k++) { await lv(false); if (await pg.evaluate(() => state.qz.phase !== 'done')) await nextQ(); }
  await W.until(pg, () => state.qz.phase === 'done', null, 6000);
  const lastL = (await stung()).slice(-1)[0] || {};
  ok(lastL.game === 'lore' && lastL.kind === 'done', `a finished round plays Word Lore's round sting (${lastL.game}/${lastL.kind})`);
  ok((await fx('sg-fx-done', 'qz-done')).length >= 1, 'the round\'s end card lands');
  await noRun('Word Lore\'s round end');

  /* ---------------------------------------------------------------- Hive Mind */
  console.log('\n1. Hive Mind: its own sting');
  await pg.evaluate(() => app.openHive('classic'));
  await W.until(pg, () => state.qz && state.qz.hub === 'hive' && state.qz.mode === 'classic' && /^(intro|play)$/.test(state.qz.phase), null, 60000);
  if (await pg.evaluate(() => state.qz.phase === 'intro')) await pg.evaluate(() => app.qzGo());   // the themes card: Start
  await W.until(pg, () => state.qz.phase === 'play' && !!document.querySelector('.qz-opt:not([disabled])'), null, 30000);
  const h1 = await lv(false);
  ok(h1.added.length === 1 && h1.added[0].game === 'hive' && h1.added[0].kind === 'right' && h1.added[0].notes !== r1.added[0].notes,
    `Hive Mind's right answer plays its own sting, not Word Lore's (${JSON.stringify(h1.added.map(s => s.game + '/' + s.kind))})`);

  /* ---------------------------------------------------------------- the Spelling Gym */
  console.log('\n1–3. The Spelling Gym: a typed right answer, the round');
  await pg.evaluate(() => { app.qzBack && app.qzBack(); app.openGym('warmup'); });
  await W.until(pg, () => window.SB_GYM && SB_GYM.peek().mode === 'warmup' && /^(ready|answer)$/.test(SB_GYM.peek().phase), null, 60000);
  await pg.evaluate(() => { const s = document.querySelector('[data-g="start"]'); if (s) s.click(); });
  await W.until(pg, () => SB_GYM.peek().phase === 'answer' && !!document.querySelector('.gym-in'), null, 20000);
  await clearFx();
  const gymRight = async () => { const t0 = await now(), a = await pg.evaluate(() => SB_GYM.peek().asked);
    await pg.evaluate(() => { const i = document.querySelector('.gym-in'); i.value = SB_GYM.peek().word; i.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    await W.until(pg, a => SB_GYM.peek().asked !== a, a, 6000); await W.until(pg, () => SB_GYM.peek().phase === 'answer' || SB_GYM.peek().phase === 'done', null, 6000);
    return (await stung(t0)).filter(s => s.kind === 'right'); };
  const g1 = await gymRight();
  ok(g1.length === 1 && g1[0].game === 'gym' && g1[0].kind === 'right', `a right word plays the gym's own sting (${JSON.stringify(g1.map(s => s.game + '/' + s.kind))})`);
  ok((await fx('sg-fx-in', 'gym-card')).length >= 1 && (await fx('sg-fx-pop', 'sg-st-n')).length >= 1, 'the next word\'s card flips in and the "right" count pops');
  let gN = g1; for (let k = 0; k < 12 && await pg.evaluate(() => SB_GYM.peek().phase === 'answer'); k++) { const x = await gymRight(); if (x.length && x[0].kind === 'right') gN = x; }
  ok(gN[0] && gN[0].notes === g1[0].notes, 'the gym\'s last right word plays the first one\'s notes');
  await W.until(pg, () => SB_GYM.peek().phase === 'done', null, 8000);
  const lastG = (await stung()).slice(-1)[0] || {};
  ok(lastG.game === 'gym' && lastG.kind === 'done', `a finished gym round plays its round sting (${lastG.game}/${lastG.kind})`);
  ok((await fx('sg-fx-done', 'sg-endcard')).length >= 1, 'the gym\'s end card lands');
  await noRun('the Spelling Gym\'s round end');

  /* ---------------------------------------------------------------- Daily Bee */
  console.log('\n3. Daily Bee: a solved day');
  await pg.evaluate(() => app.openDailyBee());
  await W.until(pg, () => !!(active().dbee && active().dbee.word) && !!document.querySelector('#db-host .db-grid'), null, 60000);
  const dw = await pg.evaluate(() => active().dbee.word);
  for (const ch of dw) await pg.keyboard.press(ch); await pg.keyboard.press('Enter');
  await W.until(pg, () => !!document.querySelector('#db-end'), null, 8000);
  const lastD = (await stung()).slice(-1)[0] || {};
  ok(lastD.game === 'daily' && lastD.kind === 'done', `a solved Daily Bee plays its own sting (${lastD.game}/${lastD.kind})`);
  ok((await fx('sg-fx-done', 'db-end')).length >= 1, 'the Daily Bee\'s end card lands');

  /* ---------------------------------------------------------------- Word Forge (tester: the table is unsigned) */
  console.log('\n1. Word Forge: a forged word');
  await pg.evaluate(() => { state.tester = true; app.openForge(); });
  await W.until(pg, () => window.SB_FORGE_UI && state.nav === 'forge' && !!document.querySelector('#fg-host'), null, 60000);
  await pg.evaluate(() => { SB_FORGE_UI.start('medium'); SB_FORGE_UI.begin(); });
  await W.until(pg, () => SB_FORGE_UI.state().phase === 'forge', null, 6000);
  const s0 = await now();
  const keys = await pg.evaluate(() => { const G = SB_FORGE_UI.state(), r = SB_FORGE_UI.cur(), used = {};
    return r.parts.map(p => { const i = G.rack.findIndex((t, k) => t.s === p && !used[k] && !t.used); used[i] = 1; return String(i + 1); }); });
  for (const k of keys) await pg.keyboard.press(k); await pg.keyboard.press('Enter');
  await W.until(pg, () => ['fused', 'done'].includes(SB_FORGE_UI.state().phase), null, 4000);
  const f1 = await stung(s0);
  ok(f1.length === 1 && f1[0].game === 'forge' && f1[0].kind === 'right', `a forged word plays the forge's own sting (${JSON.stringify(f1.map(s => s.game + '/' + s.kind))})`);

  /* ---------------------------------------------------------------- the Analogies (tester: gated) */
  console.log('\n1. The Analogies: a right pick');
  await pg.evaluate(() => { app.openGames(); app.openAnalogies(); });
  await W.until(pg, () => state.nav === 'analogy' && !!document.querySelector('.anl-board'), null, 60000);
  await pg.evaluate(() => app.anl('practice'));
  await W.until(pg, () => state.anl && state.anl.run && !!document.querySelector('.sb-stage .anl-opt'), null, 30000);
  await pg.evaluate(() => { const g = state.anl.run; if (g.bq && g.phase !== 'pick') { app.anl('bridge:' + g.bq.ans); app.anl('cont'); } });
  await W.until(pg, () => state.anl.run.phase === 'pick', null, 8000);
  const a0 = await now();
  await pg.evaluate(() => app.anl('pick:' + state.anl.run.q.ans)); await pg.waitForTimeout(150);
  const an1 = await stung(a0);
  ok(an1.length === 1 && an1[0].game === 'analogy' && an1[0].kind === 'right', `a right analogy plays its own sting (${JSON.stringify(an1.map(s => s.game + '/' + s.kind))})`);
  await pg.evaluate(() => { app.anl('leave'); state.tester = false; app.openGames(); });

  /* ---------------------------------------------------------------- 4. Calm, sound off, volume 0 */
  console.log('\n4. Calm mode, sound effects off, volume 0');
  const quiet = async (setup, undo) => { await pg.evaluate(setup);
    await pg.evaluate(() => app.openLore('meanings'));
    await W.until(pg, () => state.qz && state.qz.mode === 'meanings' && state.qz.phase === 'play' && !!document.querySelector('.qz-opt:not([disabled])'), null, 30000);
    const r = await lv(false); await pg.evaluate(undo); return r; };
  const calm = await quiet(() => { state.calmMode = true; window.SB_CALM = true; }, () => { state.calmMode = false; window.SB_CALM = false; });
  ok(calm.added.length === 0, `Calm mode plays no sting (${calm.added.length}; the plain tone: ${calm.osc} oscillators)`);
  const off = await quiet(() => { state.sound = false; }, () => { state.sound = true; });
  ok(off.added.length === 0 && off.osc === 0, `sound effects off: no sting and no tone (${off.added.length} stings, ${off.osc} oscillators)`);
  const zero = await quiet(() => { window.__vfx = SB_VOL.fx; SB_VOL.fx = () => 0; }, () => { SB_VOL.fx = window.__vfx; });
  ok(zero.added.length === 0 && zero.osc === 0, `volume 0: silence (${zero.added.length} stings, ${zero.osc} oscillators)`);

  /* ---------------------------------------------------------------- 5. Reduce motion */
  console.log('\n5. Reduce motion: the OS setting and the app\'s own');
  const still = async (how) => { await clearFx(); await pg.evaluate(() => app.openLore('meanings'));
    await W.until(pg, () => state.qz && state.qz.mode === 'meanings' && state.qz.phase === 'play' && !!document.querySelector('.qz-opt:not([disabled])'), null, 30000);
    await lv(false); await nextQ(); await lv(true); await W.until(pg, () => !!document.querySelector(".sg-misscard"), null, 4000); await pg.waitForTimeout(100);
    const all = await pg.evaluate(() => window.__fx || []); await pg.keyboard.press("Enter"); await pg.waitForTimeout(200);   // a right answer on the stage AND a miss card off it, on <body>
    ok(all.length >= 3 && all.some(x => /sg-misscard/.test(x.cls)) && all.every(x => x.an === 'none'), `${how}: every juice class arrives with no animation, the miss card on <body> included (${all.length} seen; moving: ${all.filter(x => x.an !== 'none').map(x => x.fx + ' ' + x.an).slice(0, 3).join(', ') || 'none'})`); };
  await pg.emulateMedia({ reducedMotion: 'reduce' });
  await still('prefers-reduced-motion');
  await pg.emulateMedia({ reducedMotion: 'no-preference' });
  await pg.evaluate(() => { state.a11yMotion = true; render(); });   // the app's own setting (Settings → Comfort), as the app sets it
  await still('the app\'s Reduce motion (data-motion="off")');
  await pg.evaluate(() => { state.a11yMotion = false; render(); });
  await clearFx(); await pg.evaluate(() => app.openLore('meanings'));
  await W.until(pg, () => state.qz && state.qz.mode === 'meanings' && state.qz.phase === 'play' && !!document.querySelector('.qz-opt:not([disabled])'), null, 30000);
  await lv(false); await pg.waitForTimeout(100);
  const moving = await pg.evaluate(() => (window.__fx || []).filter(x => x.an && x.an !== 'none').length);
  ok(moving >= 1, `with motion on, the same moment does move (${moving} animated) — the two checks above measure something`);

  /* ---------------------------------------------------------------- 7. page transitions (P3.8) */
  console.log('\n7. A screen the child asks for fades in; one the app opens by itself does not; Reduce motion stills it');
  const tab = async (k) => { await pg.evaluate(() => { try { if (document.querySelector('[data-act="celebrateClose"]')) app.celebrateClose(); } catch (e) {} }); await pg.waitForTimeout(100); await pg.click(`button[data-act="setNav"][data-arg="${k}"]:visible`); await W.until(pg, k => state.nav === k || (k === 'games' && state.nav === 'games'), k, 15000); await pg.waitForTimeout(250); };
  await pg.evaluate(() => app.setNav('home')); await W.until(pg, () => state.nav === 'home', null, 10000); await pg.waitForTimeout(800);
  await clearFx(); await tab('games');
  const enter = await fx('sb-enter', 'sb-content');
  ok(enter.length >= 1 && enter[0].an === 'sb-enter', `a tapped tab's screen fades in (${enter.length} seen, animation "${enter[0] ? enter[0].an : ''}")`);
  await pg.waitForTimeout(800); await clearFx();
  await pg.evaluate(() => app.setNav('home')); await W.until(pg, () => state.nav === 'home', null, 10000); await pg.waitForTimeout(300);
  ok(!(await fx('sb-enter', 'sb-content')).length, 'a screen the app opens by itself (no tap or key just before) does not flash');
  await pg.waitForTimeout(400); await clearFx();
  await pg.evaluate(() => { const c = document.querySelector('#root .sb-content'); window.__c0 = c; });
  await pg.evaluate(() => render()); await pg.waitForTimeout(200);
  ok(!(await fx('sb-enter', 'sb-content')).length, 'a re-render of the same screen does not fade');
  await pg.emulateMedia({ reducedMotion: 'reduce' }); await clearFx(); await tab('games');
  const still1 = await fx('sb-enter', 'sb-content');
  ok(still1.length >= 1 && still1.every(x => x.an === 'none'), `prefers-reduced-motion: the new screen arrives still (${still1.map(x => x.an).join(', ') || 'none seen'})`);
  await pg.emulateMedia({ reducedMotion: 'no-preference' });
  await pg.evaluate(() => { state.a11yMotion = true; render(); }); await pg.waitForTimeout(700); await clearFx(); await tab('home');
  const still2 = await fx('sb-enter', 'sb-content');
  ok(still2.length >= 1 && still2.every(x => x.an === 'none'), `the app's Reduce motion: the new screen arrives still (${still2.map(x => x.an).join(', ') || 'none seen'})`);
  await pg.evaluate(() => { state.a11yMotion = false; render(); });

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
