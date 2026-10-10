/* TIME TO FIRST LEARNING (FIX-BEE A3, with N5's "accounts optional locally").

   The audit counted the road from a stranger's first tap to a child's first word: landing →
   an email + password form (whose answers were never even stored) → five setup steps → Home →
   a cinematic splash needing two taps → the first word. Now:
     · "Start free" goes straight to setup — no email, no password, no account;
     · the privacy notice still sits on the name step (the point of collection);
     · finishing setup drops the child INTO the first Atlas stop's lesson — zero further taps,
       and the brief's bound is three;
     · the opening splash stays away all of the first day, even across a reload, and comes
       back for a returning child the next day;
     · "Find your level" is a choice inside setup that starts asking words at once, and is
       no longer a call to action on Home;
     · signing in on an empty device sets a speller up instead of inventing one.
   Taps are real clicks, counted.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/first-run.cjs                        */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ymd = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');

/* What counts as learning on screen: a lesson open on a stop, or a word being asked. */
const LEARNING = () => {
  const S = state;
  if (S.screen !== 'app') return null;
  if (S.nav === 'firstword' && S.fw && !S.fw.done) return 'firstword';
  if (S.nav === 'concepts' && S.conceptSel && S.trailReturn) return 'lesson:' + S.trailReturn;
  if (S.nav === 'trail' && S.trailView === 'quiz' && S.tq && S.tq.items && S.tq.items.length) return 'quiz';
  if (S.nav === 'train' && S.sessionWords && S.sessionWords.length && !S.sessionOver) return 'drill';
  if (S.nav === 'leveltest' && S.lt && S.lt.words && S.lt.words.length && !S.lt.done) return 'placement';
  return null;
};

/* (road to 4.5, P1.22) every tap is a real click and is counted: the name box is tapped to type in it, the age
   band is tapped only when it is not the one already chosen, and the world is NOT tapped — the first free
   world is preselected, so its step is one Continue. `band` picks an age band ('8-10' is the default). */
async function walkSetup(pg, stopAtLast, band) {
  let taps = 0;
  await pg.click('[data-inp="onDraftName"]'); taps++;
  await pg.keyboard.type('Ahana');
  for (let i = 0; i < 8; i++) {
    const st = await pg.evaluate(() => ({ s: state.screen, key: onbKey(), last: state.onbStep === onbKeys().length - 1 }));
    if (st.s !== 'onboarding') break;
    if (st.key === 'age' && band && band !== '8-10') { await pg.click('[data-act="onDraftBand"][data-arg="' + band + '"]'); taps++; }
    if (st.key === 'place') return taps;
    if (st.last && stopAtLast) return taps;
    await pg.click('.sb-onb-next'); taps++;
    await pg.waitForTimeout(250);
  }
  return taps;
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];

  /* ---- 1. a stranger, on a phone, from the landing page to the first lesson ---- */
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2600);
  ok(await pg.evaluate(() => state.screen === 'landing' && !document.querySelector('#sb-splash')), 'a new device opens on the landing page, with no splash in front of it');
  await pg.click('[data-act="goSignup"]');
  await pg.waitForTimeout(250);
  const start = await pg.evaluate(() => ({ s: state.screen, email: !!document.querySelector('input[type="email"]'), pw: !!document.querySelector('input[type="password"]'),
    priv: !!document.querySelector('a[href="privacy.html"]'), name: !!document.querySelector('[data-inp="onDraftName"]') }));
  ok(start.s === 'onboarding' && !start.email && !start.pw, 'one tap on "Start free" goes straight to setup — no email, no password, no account');
  ok(start.name && start.priv, 'the first step asks for a name, with the privacy notice beside it (the point of collection)');
  const setupTaps = await walkSetup(pg, true);
  const last = await pg.evaluate(() => ({ step: state.onbStep, key: onbKey(), place: !!document.querySelector('[data-act="startLevelTest"]'), world: state.draft.theme,
    nx: (document.querySelector('.sb-onb-next') || {}).textContent || '' }));
  /* (road to 4.5, P1.7) placement is a STEP of its own for the 11+ bands, not a dashed card on the goal step */
  ok(last.key === 'goal' && !last.place, 'the last setup step carries no dashed "Find my level" card — placement is its own step for the 11+ bands');
  ok(last.world === 'spellbound', `the first free world was preselected, so the world step was one Continue (${last.world})`);
  /* finishing setup is the tap the brief counts from */
  await pg.click('.sb-onb-next');
  const tapsToWord = 1 + setupTaps + 1;   // "Start free" + the setup taps + "Start spelling"
  ok(tapsToWord <= 7, `P1.22: ${tapsToWord} taps from "Start free" to the first word for a child of 8–10 (target 7): Start free · name box · Continue ×4 · Start spelling`);
  let reached = null, taps = 0;
  for (let t = 0; t < 40 && !reached; t++) { await pg.waitForTimeout(200); reached = await pg.evaluate(LEARNING); }
  /* if not there by itself, allow up to three taps on the obvious next thing, as the brief does */
  while (!reached && taps < 3) {
    const sel = await pg.evaluate(() => { const c = ['[data-act="goNext"]', '[data-act="trailLesson"]', '[data-act="trailPractice"]', '[data-act="trailQuiz"]'].find(s => document.querySelector(s)); return c || null; });
    if (!sel) break;
    await pg.click(sel); taps++;
    for (let t = 0; t < 20 && !reached; t++) { await pg.waitForTimeout(200); reached = await pg.evaluate(LEARNING); }
  }
  const first = await pg.evaluate(() => { try { const n = SB_NEXT_STEP(); return n && n.arg; } catch (e) { return null; } });
  ok(!!reached && taps <= 3, `a real lesson or question is on screen within 3 taps of finishing setup (${reached || 'nothing'} after ${taps} taps)`);
  /* A8 (FIX-BEE v2): the first thing is ONE spoken word to spell — right, and celebrated, inside two
     minutes — and then the first Atlas stop's own lesson. */
  ok(reached === 'firstword' && taps === 0, `the first thing on screen is one word to spell, with no tap at all (${reached})`);
  const t0 = Date.now();
  await pg.fill('[data-inp="fwType"]', 'zzz'); await pg.click('[data-act="fwCheck"]'); await pg.waitForTimeout(250);
  const held = await pg.evaluate(() => ({ nav: state.nav, miss: !!state.fw.miss, panel: !!document.querySelector('.sb-content') && /Nearly/.test(document.querySelector('.sb-content').textContent) }));
  ok(held.nav === 'firstword' && held.miss && held.panel, 'a wrong first try HOLDS and shows the letters — it never moves on by itself');
  const w = await pg.evaluate(() => state.fw.w);
  await pg.fill('[data-inp="fwType"]', w); await pg.click('[data-act="fwCheck"]'); await pg.waitForTimeout(300);
  const yay = await pg.evaluate(() => ({ done: !!(state.fw && state.fw.done), msg: /spelled right/i.test(document.querySelector('.sb-content').textContent), ms: Date.now() - state.fw.t0 }));
  ok(yay.done && yay.msg && yay.ms < 120000, `the first word is spelled right and celebrated inside two minutes (${Math.round(yay.ms / 1000)}s)`);
  await pg.click('[data-act="fwDone"]'); reached = null;
  for (let t = 0; t < 30 && !reached; t++) { await pg.waitForTimeout(200); reached = await pg.evaluate(LEARNING); }
  ok(reached === 'lesson:' + first, `then one tap opens the first Atlas stop's own lesson (${reached}, first stop ${first})`);
  ok(await pg.evaluate(() => !document.querySelector('#sb-splash')), 'no splash stood in the way');
  const kid = await pg.evaluate(() => { const c = state.children[0] || {}; return { fr: c.fr, n: state.children.length, lu: Object.keys(state.luMastered || {}).length }; });
  ok(kid.n === 1 && kid.fr === ymd(new Date()), 'the new child carries the day they were set up (fr = today)');

  /* the same day, the app is opened again: still no splash */
  await pg.reload(); await pg.waitForTimeout(1500);
  ok(await pg.evaluate(() => state.screen === 'app' && !document.querySelector('#sb-splash')), 'reopened on the first day, the splash stays away');
  /* the reload put the child back on the lesson they were reading (the hash); go Home to look at it */
  await pg.click('.sb-tabbar [data-act="setNav"][data-arg="home"]'); await pg.waitForTimeout(500);
  ok(await pg.evaluate(() => state.nav === 'home' && !!document.querySelector('.sb-content [data-act="goNext"]') && !document.querySelector('.sb-content [data-act="startLevelTest"],.sb-content .sb-band-call')), 'and Home carries no "Find your level" call to action');
  await ctx.close();

  /* ---- 2. a returning child the next day gets the welcome back ---- */
  const yday = ymd(new Date(Date.now() - 864e5));
  const ctx2 = await b.newContext({ viewport: { width: 1000, height: 800 } });
  await ctx2.addInitScript(d => { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', children: [{ name: 'T', fr: d }] })); localStorage.setItem('sb_splash', '1'); }, yday);   /* the splash is opt-in since FIX-BEE v2 (Settings → Look) */
  const pg2 = await ctx2.newPage(); pg2.on('pageerror', e => errs.push(e.message));
  await pg2.goto(URL); await pg2.waitForTimeout(600);
  ok(await pg2.evaluate(() => !!document.querySelector('#sb-splash')), 'set up yesterday, with the splash switched on: it plays for the returning child');
  await ctx2.close();

  /* ---- 3. (road to 4.5, P1.7) the 11+ bands meet PLACEMENT as a step of its own, asking a word at once ---- */
  const ctx3 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pg3 = await ctx3.newPage(); pg3.on('pageerror', e => errs.push(e.message));
  await pg3.goto(URL); await pg3.waitForTimeout(2600);
  await pg3.evaluate(() => { window._said = []; const s0 = window.say; window.say = function (w) { window._said.push(String(w)); try { return s0.apply(this, arguments); } catch (e) {} }; });
  await pg3.click('[data-act="goSignup"]'); await pg3.waitForTimeout(250);
  const t3 = 1 + await walkSetup(pg3, true, '11-13');
  await pg3.waitForFunction(() => !!(state.draft.pl && document.querySelector('[data-inp="placeType"]')), null, { timeout: 15000 });
  await pg3.waitForTimeout(700);
  const pl = await pg3.evaluate(() => { const it = SB_PLACE.pick(state.draft.pl.s, SB_PLACE_DATA);
    return { key: onbKey(), kids: state.children.length, input: !!document.querySelector('[data-inp="placeType"]'), said: window._said.slice(), w: it && it.w,
      card: (() => { const bits = [], root = document.querySelector('.sb-onb'); const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) bits.push(n.data); root.querySelectorAll('*').forEach(el => { for (const a of el.attributes) bits.push(a.value); if (typeof el.value === 'string' && el.value) bits.push(el.value); }); return bits; })() }; });
  const tapsToPlace = t3;   // walkSetup stops ON the placement step: its last tap was the age step's Continue
  ok(pl.key === 'place' && pl.input && pl.kids === 0 && pl.said.includes(pl.w), `an 11–13 speller's first word is the placement step's, spoken at once, ${tapsToPlace} taps from "Start free" (Start free · name box · Continue · 11–13 · Continue) — no child is made until setup ends`);
  ok(tapsToPlace <= 5, `P1.22: ${tapsToPlace} taps to the first word for the 11+ bands`);
  ok(!pl.card.some(t => new RegExp('\\b' + pl.w + '\\b', 'i').test(t)), 'the word being asked is in no text node and no attribute of the step (never leak the answer)');
  /* skipping placement goes on through the same steps and starts at the Meadow's first word, as any child */
  await pg3.click('[data-act="placeSkip"]'); await pg3.waitForTimeout(250);
  for (let i = 0; i < 6 && await pg3.evaluate(() => state.screen === 'onboarding'); i++) { await pg3.click('.sb-onb-next'); await pg3.waitForTimeout(250); }
  let after3 = null; for (let t = 0; t < 30 && !after3; t++) { await pg3.waitForTimeout(200); after3 = await pg3.evaluate(LEARNING); }
  const st3 = await pg3.evaluate(() => ({ start: ((state.children[0] || {}).trail || {}).start || null, arg: SB_NEXT_STEP().arg }));
  ok(after3 === 'firstword' && !st3.start && st3.arg === 'u1', `skipping placement records no start, and setup ends on the first word like any child's (${after3}, next stop ${st3.arg})`);
  await ctx3.close();

  /* ---- 4. "I already have an account" on an empty device invents nobody ---- */
  const ctx4 = await b.newContext({ viewport: { width: 1000, height: 900 } });
  const pg4 = await ctx4.newPage(); pg4.on('pageerror', e => errs.push(e.message));
  await pg4.goto(URL); await pg4.waitForTimeout(2600);
  await pg4.evaluate(() => { app.goSignin(); state.email = 'parent@example.com'; state.pw = 'x'; app.doAuth(); });
  await pg4.waitForTimeout(300);
  ok(await pg4.evaluate(() => state.children.length === 0 && state.screen === 'onboarding'), 'signing in on an empty device sets a speller up — it no longer conjures "Ahana, level 9"');
  await ctx4.close();

  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
