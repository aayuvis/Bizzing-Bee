/* THE PRACTICE TAB IS THE WORD GYM (owner, 4 Oct 2026) — the name changed, nothing else. @check

   What a child sees says "Word Gym": the desktop tab row, the phone's bottom bar, the page's
   own title, the back pill that returns to it and the Progress card that opens it. What a
   child never sees did not move, so old links and saves still work: the nav key is still
   'coach', the route is still #/practice (and #/gym, typed by hand, lands there too).
   Proved by breaking (4 Oct 2026): with the old label back in NAV_TABS, both old page titles
   and the #/gym alias removed, 7 of 10 fail — both bars, both headings and the route.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/word-gym.cjs                        */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, band: 3, bandSeed: 3,
  lists: { journey: { xp: 30 } }, activeList: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 } }, elap: 1, edone: {}, echk: {} } };

async function open(b, phone, errs, hash) {
  const ctx = await b.newContext(phone ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1280, height: 800 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL + (hash || '')); await pg.waitForTimeout(3000);
  return { ctx, pg };
}
const label = (pg, sel) => pg.evaluate(s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; }, sel);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];

  /* desktop: the tab row, the page title, and the way back to it */
  let { ctx, pg } = await open(b, false, errs);
  const desk = await pg.evaluate(() => [...document.querySelectorAll('.sb-topnav [data-act="setNav"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(desk.includes('Word Gym') && !desk.some(t => /practi[cs]e/i.test(t)), `the desktop tab row says Word Gym, never Practice (${desk.join(' · ')})`);
  ok(await label(pg, '.sb-topnav [data-act="setNav"][data-arg="coach"]') === 'Word Gym', 'the Word Gym tab is still the coach key underneath');
  /* first visit: the path chooser IS the Word Gym's first screen; after a path is picked, the gym itself */
  const heading = () => pg.evaluate(() => ({ nav: state.nav, h: location.hash,
    h2: (document.querySelector('.sb-content .sb-phead h2') || {}).textContent || '',
    big: [...document.querySelectorAll('.sb-content span,.sb-content h2')].filter(s => !s.children.length && parseFloat(getComputedStyle(s).fontSize) >= 18).map(s => s.textContent.trim()) }));
  await pg.click('.sb-topnav [data-act="setNav"][data-arg="coach"]'); await pg.waitForTimeout(900);
  const first = await heading();
  ok(first.nav === 'quest' && first.h2 === 'Word Gym', `a first visit opens the path chooser, headed Word Gym (${first.nav}: "${first.h2}")`);
  await pg.evaluate(() => { active().questPath = 'journey'; save(); });
  await pg.click('.sb-topnav [data-act="setNav"][data-arg="home"]'); await pg.waitForTimeout(600);
  await pg.click('.sb-topnav [data-act="setNav"][data-arg="coach"]'); await pg.waitForTimeout(900);
  const page = await heading();
  ok(page.nav === 'coach' && page.big.includes('Word Gym') && !page.big.includes('Practice'), `the gym itself is headed Word Gym (${page.nav}: ${page.big.slice(0, 3).join(' | ')})`);
  ok(/^#\/practice$/.test(page.h), `and its address did not move — old links still work (${page.h})`);
  /* a screen that sends you back names it the same way */
  await pg.evaluate(() => { state.progTab = 'me'; app.setNav('progress'); }); await pg.waitForTimeout(800);
  const prog = await pg.evaluate(() => [...document.querySelectorAll('[data-act="openCoach"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean));
  ok(prog.some(t => /Word Gym/.test(t)) && !prog.some(t => /^(Open |Back to )?Practice\b/.test(t)), `the buttons that open it say Word Gym (${prog.join(' | ').slice(0, 80)})`);
  await ctx.close();

  /* phone: the bottom bar, six tabs */
  ({ ctx, pg } = await open(b, true, errs));
  const bar = await pg.evaluate(() => [...document.querySelectorAll('nav.sb-tabbar [data-act="setNav"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()));
  ok(bar.includes('Word Gym') && !bar.some(t => /practi[cs]e/i.test(t)) && bar.length === 6, `the phone's bottom bar says Word Gym (${bar.join(' · ')})`);
  const fit = await pg.evaluate(() => { const e = [...document.querySelectorAll('nav.sb-tabbar [data-act="setNav"]')].find(x => /Word Gym/.test(x.textContent)); const s = e && e.querySelector('span:last-child');
    return s ? { sw: s.scrollWidth, cw: s.clientWidth, bw: e.getBoundingClientRect().width } : null; });
  ok(fit && fit.sw <= fit.cw + 1, `and the label fits its slot on a 390px phone (${fit && Math.round(fit.sw)} in ${fit && Math.round(fit.cw)})`);
  await ctx.close();

  /* the old route and the new one both land on it */
  ({ ctx, pg } = await open(b, false, errs, '#/practice'));
  const r1 = await pg.evaluate(() => state.nav);
  await ctx.close();
  ({ ctx, pg } = await open(b, false, errs, '#/gym'));
  const r2 = await pg.evaluate(() => state.nav);
  await ctx.close();
  ok(/^(coach|quest)$/.test(r1) && /^(coach|quest)$/.test(r2), `#/practice and #/gym both open it (${r1}, ${r2})`);

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
