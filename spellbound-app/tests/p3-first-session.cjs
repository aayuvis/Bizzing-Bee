/* ROAD TO 4.5, P3 — THE FIRST SESSION (P3.23 onboarding's look, P3.24 the first word's "aha"), in Chromium over http.

   wave       step 1 of setup: Bizzy is the drawn mascot with a raised arm that WAVES (animation sb-wave, three swings);
              with the device's reduced motion, or Settings → Calm (data-motion="off"), the arm is raised and still
   world      the world step: the two free worlds wear their painted plates (app-art/wt/<id>.webp, loaded, eager), the
              first is preselected (aria-pressed, draft.theme), no dot layer over a painting, nothing greyed
   first      the first word ever spelled right: its own sound (sfx 'first', ONCE, instead of 'correct'), a bee that flies
              for ~2 s on a layer outside #root and is gone by 2.6 s, the coin is the word's one 'answer' coin and
              nothing more; a redraw adds no second flight; the next right answer (the drill) is a plain 'correct'; a
              reload does not replay it (c.fwFx kept)
   calm       with reduced motion: the sound, and no flight at all — and still exactly one coin
   doors      a child who skipped the first word (nothing right on record) gets it on their first right answer in the
              Atlas drill, once; a child who has spelled before this build (xp on record) never does
   It waits on STATE (lib/wait.cjs), never on a sleep, except the flight's own clock (it is a 2 s animation).
   Proved by breaking (13 Oct 2026, six breaks, each in a scratch root of symlinks with ONE file replaced; the tree was
   never touched): the wave's device reduced-motion rule taken out of index.html (1 fails: the device's reduced
   motion); the world step's plates not eager (1: "load at once"); firstWordFx without its c.fwFx latch (4: the
   drill's next word flies again, the reload finds no record, calm's record, the skipped child's record); fwCheck paying
   addCoins('answer') twice (2: "one coin", in motion and calm); firstWordFx ignoring reduced motion (1: calm);
   firstWordDue without the rankXp test (1: the child with words on record flies).
   Run: node tests/p3-first-session.cjs                                                                              */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { serve } = require('./lib/serve.cjs');
const { booted, until, lazy } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const srv = await serve(SRC, {});
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });
  const errs = [];
  /* a context with no household (a first run) or a seeded one; the sound hook counts every sfx() kind */
  const open = async (o) => {
    o = o || {};
    const opts = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block', reducedMotion: o.calm ? 'reduce' : 'no-preference' };
    /* o.persist: a PERSISTENT profile (13 Oct 2026) for the walk that reloads and reads c.fwFx back. An off-the-record context
       can start a reloaded page on EMPTY storage under load (pin-mandatory measured it: off-the-record 3 of 48 reloads empty, on-disk 0 of 72) */
    const dir = o.persist ? fs.mkdtempSync(path.join(require('os').tmpdir(), 'sb-p3fs-profile-')) : null;
    const ctx = dir ? await chromium.launchPersistentContext(dir, Object.assign({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) }, opts))
      : await b.newContext(opts);
    await ctx.addInitScript((seed) => { try { if (!localStorage.getItem('t_p3')) { localStorage.clear(); if (seed) localStorage.setItem('sb_saas_v2', JSON.stringify(seed)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_p3', '1'); } } catch (e) {}
      window.__sfx = []; document.addEventListener('DOMContentLoaded', () => { const o = window.sfx; if (typeof o === 'function') window.sfx = function (k) { window.__sfx.push(k); return o.apply(this, arguments); }; }); }, o.seed || null);
    const pg = ctx.pages()[0] || await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    return { ctx, pg, dir };
  };
  const toWorld = async (pg) => { await pg.click('[data-act="goSignup"]'); await until(pg, () => state.screen === 'onboarding');
    await pg.fill('[data-inp="onDraftName"]', 'Ahana');
    for (let i = 0; i < 6 && await pg.evaluate(() => onbKey() !== 'world'); i++) await pg.click('.sb-onb-next');
    return until(pg, () => onbKey() === 'world'); };
  const toFirstWord = async (pg) => { await toWorld(pg);
    await lazy(pg, 'words1');   /* setup's end holds for the word tier (onbNext): ask for it first, as the first tap would */
    for (let i = 0; i < 6 && await pg.evaluate(() => state.screen === 'onboarding'); i++) { await pg.click('.sb-onb-next'); await until(pg, () => !document.querySelector('.sb-words-wait'), null, 30000); }
    return until(pg, () => state.nav === 'firstword' && !!state.fw && !!document.querySelector('[data-inp="fwType"]'), null, 30000); };
  const spellFirst = async (pg) => { const w = await pg.evaluate(() => state.fw.w); await pg.fill('[data-inp="fwType"]', w); await pg.click('[data-act="fwCheck"]'); };
  const coins = (pg) => pg.evaluate(() => (active().coins | 0));
  const drillRight = async (pg) => { await lazy(pg, 'scrGym'); await lazy(pg, 'words1');
    return pg.evaluate(async () => { const U = async (f, ms) => { for (const t = Date.now(); Date.now() - t < (ms || 15000);) { try { if (f()) return true; } catch (e) {} await new Promise((r) => setTimeout(r, 30)); } return false; };
      window.__sfx.length = 0;
      state.sessionWords = [{ w: 'garden', d: 'a place where plants grow' }, { w: 'basket', d: 'a woven container' }];
      app.startTrain(); await U(() => state.nav === 'train' && state.status === 'idle');
      state.typed = 'garden'; app.check(); await U(() => state.status !== 'idle', 4000);
      await new Promise((r) => setTimeout(r, 150));
      return { sfx: window.__sfx.slice(), fly: !!document.querySelector('.sb-fw-fly'), fx: active().fwFx || 0 }; }); };

  /* ---- wave ---- */
  {
    const { ctx, pg } = await open();
    await pg.click('[data-act="goSignup"]'); await until(pg, () => !!document.querySelector('.sb-onb-art .sb-wave-arm'));
    const a = await pg.evaluate(() => { const arm = document.querySelector('.sb-onb-art .sb-wave-arm'); const cs = arm && getComputedStyle(arm);
      return { arm: !!arm, name: cs && cs.animationName, n: cs && cs.animationIterationCount, img: !!document.querySelector('.sb-onb-art img') }; });
    ok(a.arm && a.name === 'sb-wave' && a.n === '3' && !a.img, `step 1: Bizzy is drawn, and the raised arm waves three times (${a.name} × ${a.n})`);
    const calm = await pg.evaluate(() => { state.a11yMotion = true; render(); const arm = document.querySelector('.sb-onb-art .sb-wave-arm'); return arm && getComputedStyle(arm).animationName; });
    ok(calm === 'none', `Settings → Calm: the hello is raised and still (${calm})`);
    await ctx.close();
    const R = await open({ calm: true });
    await R.pg.click('[data-act="goSignup"]'); await until(R.pg, () => !!document.querySelector('.sb-onb-art .sb-wave-arm'));
    const rm = await R.pg.evaluate(() => getComputedStyle(document.querySelector('.sb-onb-art .sb-wave-arm')).animationName);
    ok(rm === 'none', `the device's reduced motion: the hello is raised and still (${rm})`);
    await R.ctx.close();
  }

  /* ---- world ---- */
  {
    const { ctx, pg } = await open();
    const at = await toWorld(pg);
    await until(pg, () => [...document.querySelectorAll('.wh-band img.wh-plate')].every((i) => i.complete && i.naturalWidth > 0) && document.querySelectorAll('.wh-band img.wh-plate').length === 2, null, 15000);
    const w = await pg.evaluate(() => { const cards = [...document.querySelectorAll('[data-act="onbWorld"]')];
      return { n: cards.length, ids: cards.map((c) => c.getAttribute('data-arg')), pressed: cards.map((c) => c.getAttribute('aria-pressed')),
        plates: cards.map((c) => { const i = c.querySelector('img.wh-plate'); return i ? { src: i.getAttribute('src'), eager: i.getAttribute('loading'), w: i.naturalWidth } : null; }),
        fx: document.querySelectorAll('.wh-painted .wh-fx').length, grey: cards.filter((c) => /grayscale/.test(c.querySelector('.wh-band').getAttribute('style') || '')).length,
        theme: state.draft.theme }; });
    ok(at && w.n === 2 && w.plates.every((p, i) => p && p.src === 'app-art/wt/' + w.ids[i] + '.webp' && p.w === 480), `the world step shows the two free worlds on their painted plates (${w.plates.map((p) => p && p.src).join(', ')})`);
    ok(w.plates.every((p) => p && p.eager === 'eager'), 'the two plates load at once — they are the whole screen');
    ok(w.pressed[0] === 'true' && w.pressed[1] === 'false' && w.theme === w.ids[0], `the first free world is preselected (${w.theme}, aria-pressed ${w.pressed.join('/')})`);
    ok(!w.fx && !w.grey, 'no dot layer over a painting, nothing greyed on the step');
    await ctx.close();
  }

  /* ---- first ---- */
  {
    const { ctx, pg, dir } = await open({ persist: true });
    ok(await toFirstWord(pg), 'setup ends on the first word');
    const c0 = await coins(pg);
    await pg.evaluate(() => { window.__sfx.length = 0; });
    await spellFirst(pg);
    const fly = await until(pg, () => !!document.querySelector('body > .sb-fw-fly .sb-fw-bee'), null, 2000);
    const f = await pg.evaluate(() => { const bee = document.querySelector('.sb-fw-fly .sb-fw-bee'); const cs = bee && getComputedStyle(bee);
      return { anim: cs && cs.animationName, dur: cs && cs.animationDuration, inRoot: !!document.querySelector('#root .sb-fw-fly'), sfx: window.__sfx.slice(), fx: !!active().fwFx, done: !!(state.fw && state.fw.done) }; });
    ok(fly && f.anim === 'sb-fwfly' && f.dur === '2s' && !f.inRoot, `the first word right: a bee flies for 2 s on a layer outside #root (${f.anim}, ${f.dur})`);
    ok(f.sfx.filter((k) => k === 'first').length === 1 && !f.sfx.includes('correct'), `its own sound, once, instead of the plain chime (${f.sfx.join(', ')})`);
    await pg.evaluate(() => { render(); render(); });
    const n2 = await pg.evaluate(() => document.querySelectorAll('.sb-fw-fly').length);
    ok(n2 === 1, `a redraw adds no second flight (${n2} layer)`);
    const gone = await until(pg, () => !document.querySelector('.sb-fw-fly'), null, 4000);
    const t1 = await coins(pg);
    ok(gone, 'the flight is gone after its two seconds');
    ok(t1 - c0 === 1, `one coin — the word's own answer coin, and nothing for the flight (${c0} → ${t1})`);
    await pg.click('[data-act="fwDone"]');
    const d = await drillRight(pg);
    ok(d.sfx.includes('correct') && !d.sfx.includes('first') && !d.fly, `the next right answer, in the drill, is a plain "correct" (${d.sfx.join(', ')})`);
    await require('./lib/wait.cjs').reloadSettled(pg); await booted(pg);
    await wait(400);
    const r = await pg.evaluate(() => ({ fly: !!document.querySelector('.sb-fw-fly'), fx: !!active().fwFx }));
    ok(!r.fly && r.fx, 'a reload replays nothing, and the child keeps its "first word done" (c.fwFx)');
    await ctx.close(); fs.rmSync(dir, { recursive: true, force: true });
  }

  /* ---- calm ---- */
  {
    const { ctx, pg } = await open({ calm: true });
    await toFirstWord(pg);
    const c0 = await coins(pg);
    await pg.evaluate(() => { window.__sfx.length = 0; });
    await spellFirst(pg); await until(pg, () => state.fw && state.fw.done);
    await wait(300);
    const k = await pg.evaluate(() => ({ fly: !!document.querySelector('.sb-fw-fly'), sfx: window.__sfx.slice(), fx: !!active().fwFx }));
    const c1 = await coins(pg);
    ok(!k.fly && k.sfx.includes('first') && k.fx && c1 - c0 === 1, `reduced motion: the sound, no flight, one coin (${k.sfx.join(', ')}; ${c0} → ${c1})`);
    await ctx.close();
  }

  /* ---- doors ---- */
  {
    const kid = (o) => Object.assign({ name: 'Ravi', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { default: { xp: 0 } }, activeList: 'default', missed: [], fr: '2026-01-01',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {} } }, o || {});
    const A = await open({ seed: { theme: 'spellbound', mode: 'light', pin: '2468', activeIdx: 0, children: [kid()] } });
    const a = await drillRight(A.pg);
    ok(a.sfx.includes('first') && !a.sfx.includes('correct') && a.fly && a.fx, `a child who skipped the first word gets it on their first right answer in the drill (${a.sfx.join(', ')})`);
    const a2 = await A.pg.evaluate(async () => { await new Promise((r) => setTimeout(r, 2600)); window.__sfx.length = 0; state.typed = 'basket'; if (state.status !== 'idle') app.next(); await new Promise((r) => setTimeout(r, 200)); state.typed = (state.sessionWords[state.gi] || {}).w || 'basket'; app.check(); await new Promise((r) => setTimeout(r, 200)); return { sfx: window.__sfx.slice(), fly: !!document.querySelector('.sb-fw-fly') }; });
    ok(!a2.sfx.includes('first') && !a2.fly, `…once: the next word is not a first word again (${a2.sfx.join(', ')})`);
    await A.ctx.close();
    const B = await open({ seed: { theme: 'spellbound', mode: 'light', pin: '2468', activeIdx: 0, children: [kid({ lists: { journey: { xp: 40 } }, activeList: 'journey' })] } });
    const bb = await drillRight(B.pg);
    ok(bb.sfx.includes('correct') && !bb.sfx.includes('first') && !bb.fly && !bb.fx, `a child with words spelled right on record never gets a "first word" (${bb.sfx.join(', ')})`);
    await B.ctx.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nBizzy waves, the worlds are painted, and the first word flies once');
  process.exit(fails ? 1 : 0);
})();
