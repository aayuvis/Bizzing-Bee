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
  if (S.nav === 'concepts' && S.conceptSel && S.trailReturn) return 'lesson:' + S.trailReturn;
  if (S.nav === 'trail' && S.trailView === 'quiz' && S.tq && S.tq.items && S.tq.items.length) return 'quiz';
  if (S.nav === 'train' && S.sessionWords && S.sessionWords.length && !S.sessionOver) return 'drill';
  if (S.nav === 'leveltest' && S.lt && S.lt.words && S.lt.words.length && !S.lt.done) return 'placement';
  return null;
};

async function walkSetup(pg, stopAtLast) {
  let taps = 0;
  await pg.fill('[data-inp="onDraftName"]', 'Ahana');
  for (let i = 0; i < 6; i++) {
    const st = await pg.evaluate(() => ({ s: state.screen, step: state.onbStep }));
    if (st.s !== 'onboarding') break;
    if (st.step === 3) { await pg.click('[data-act="onbWorld"]'); taps++; }
    if (st.step === 4 && stopAtLast) return taps;
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
  await walkSetup(pg, true);
  const last = await pg.evaluate(() => ({ step: state.onbStep, place: !!document.querySelector('[data-act="startLevelTest"]'),
    nx: (document.querySelector('.sb-onb-next') || {}).textContent || '' }));
  ok(last.step === 4 && last.place, 'the last setup step offers "Find my level" as a choice');
  /* finishing setup is the tap the brief counts from */
  await pg.click('.sb-onb-next');
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
  ok(reached === 'lesson:' + first && taps === 0, `and it is the first Atlas stop's own lesson, reached with no tap at all (${reached}, first stop ${first})`);
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
  await ctx2.addInitScript(d => { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', children: [{ name: 'T', fr: d }] })); localStorage.removeItem('sb_splash'); }, yday);
  const pg2 = await ctx2.newPage(); pg2.on('pageerror', e => errs.push(e.message));
  await pg2.goto(URL); await pg2.waitForTimeout(600);
  ok(await pg2.evaluate(() => !!document.querySelector('#sb-splash')), 'set up yesterday: the opening splash plays for the returning child');
  await ctx2.close();

  /* ---- 3. "Find my level" from setup starts asking words at once ---- */
  const ctx3 = await b.newContext({ viewport: { width: 1000, height: 900 } });
  const pg3 = await ctx3.newPage(); pg3.on('pageerror', e => errs.push(e.message));
  await pg3.goto(URL); await pg3.waitForTimeout(2600);
  await pg3.click('[data-act="goSignup"]'); await pg3.waitForTimeout(250);
  await walkSetup(pg3, true);
  await pg3.click('[data-act="startLevelTest"]'); await pg3.waitForTimeout(600);
  const pl = await pg3.evaluate(() => ({ what: (function () { const S = state; return S.nav === 'leveltest' && S.lt && S.lt.words && S.lt.words.length && !S.lt.done ? 'placement' : null; })(),
    input: !!document.querySelector('[data-inp="ltType"],input[data-key="ltKey"]'), kids: state.children.length }));
  ok(pl.what === 'placement' && pl.input && pl.kids === 1, 'choosing "Find my level" finishes setup and asks the first word at once');
  /* and leaving placement goes on to the journey, through the same next step */
  await pg3.evaluate(() => app.ltSkip()); await pg3.waitForTimeout(1500);
  ok(await pg3.evaluate(() => state.nav === 'concepts' && !!state.conceptSel && state.trailReturn === SB_NEXT_STEP().arg), 'skipping placement lands on the first lesson too, not on a menu');
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
