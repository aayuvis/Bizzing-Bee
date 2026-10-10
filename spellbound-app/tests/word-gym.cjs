/* THE WORD GYM LIVES UNDER THE WORD ATLAS — the second sub-nav, Atlas | Gym. @check

   Owner, 10 Oct 2026 (the road to 4.5, decision §1.1 — final): "The tab row becomes Home · Word Atlas · Analogies ·
   Library · Play · My Feed. Word Gym stops being a top tab. It becomes the second sub-nav of Word Atlas (Atlas | Gym),
   using the family's sub-page head pattern. Every deep link into the Gym (#/gym…) keeps working." — and "Update the
   word-gym test, which expects the old six phone tabs."
   REWRITTEN for that decision. What a child sees: no Word Gym tab on either bar (nor a "Practice" one); the Atlas map
   and the Word Gym each open on the sub-nav, two chips "Atlas | Gym", the one you are on marked; the chips swap the
   two pages by tap and by keyboard; on both pages the Word Atlas tab is the lit one. What a child never sees did not
   move, so old links and saves still work: the Word Gym's nav key is still 'coach', its route still #/practice, the
   page is still headed Word Gym, the buttons that open it still say so — and #/gym, #/gym/<mode> still open the
   Spelling Gym (the Play tab's drill hall, games spec §4.2), which is where they have led since 4 Oct.
   (Before 10 Oct this test held a "Word Gym" TAB on both bars; that is exactly what the owner removed.)
   Analogies is not in the bar here: it stands only through the analogy gate (tests/analogy-gate.cjs).
   Proved by breaking (10 Oct 2026), each run recorded: the Word Gym tab put back in NAV_TABS → both desktop bar
   checks, the phone bar and "the Word Atlas tab lit" (two tabs lit): 4 fail; the sub-nav taken off the Gym
   (atlasSubNav('gym') out of coachTrain and viewQuest) → the two "Gym marked" checks fail and the keyboard step has no
   chip to press (the run stops); the Word Atlas tab lit only for nav 'trail' (atlasTabOn without gymNav) → the four
   "lights" checks (desktop chooser, gym, phone, #/practice): 4 fail.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/word-gym.cjs                        */
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
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
  await pg.goto(URL + (hash || '')); await W.booted(pg);
  return { ctx, pg };
}
/* the page as a child sees it: where the nav is, the address, the sub-nav, and which tab is lit */
const look = (pg) => pg.evaluate(() => {
  const ph = innerWidth < 640;
  const tabs = [...document.querySelectorAll(ph ? 'nav.sb-tabbar [data-act="setNav"]' : '.sb-topnav [data-act="setNav"]')];
  const sub = document.querySelector('.sb-content .sb-subnav');
  const chips = sub ? [...sub.querySelectorAll('button')] : [];
  return { nav: state.nav, h: location.hash,
    tabs: tabs.map(x => x.textContent.replace(/\s+/g, ' ').trim()), args: tabs.map(x => x.getAttribute('data-arg')),
    lit: tabs.filter(x => x.getAttribute('aria-current') === 'page').map(x => x.getAttribute('data-arg')),
    chips: chips.map(x => x.textContent.trim()), cur: chips.filter(x => x.getAttribute('aria-current') === 'page').map(x => x.textContent.trim()),
    chipH: chips.map(x => Math.round(x.getBoundingClientRect().height)), subR: sub ? Math.round(sub.getBoundingClientRect().right) : 0,
    h2: (document.querySelector('.sb-content .sb-phead h2') || {}).textContent || '',
    big: [...document.querySelectorAll('.sb-content span,.sb-content h2')].filter(s => !s.children.length && parseFloat(getComputedStyle(s).fontSize) >= 18).map(s => s.textContent.trim()) };
});
const settle = (pg, nav) => W.until(pg, (n) => (Array.isArray(n) ? n.includes(state.nav) : state.nav === n) && !!document.querySelector('.sb-content'), nav, 30000).then(() => W.frames(pg, 2));

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];

  /* ---- desktop: the bar, the two sub-pages, the chips by tap and by key ---- */
  let { ctx, pg } = await open(b, false, errs);
  let L = await look(pg);
  ok(!L.tabs.some(t => /Word Gym|practi[cs]e/i.test(t)) && !L.args.includes('coach'), `the desktop tab row has no Word Gym tab, and no Practice one (${L.tabs.join(' · ')})`);
  ok(L.args.join() === 'home,trail,explore,games,feed', `Home · Word Atlas · Library · Play · My Feed — Home first, My Feed last (${L.args.join(' · ')})`);
  await pg.click('.sb-topnav [data-act="setNav"][data-arg="trail"]'); await settle(pg, 'trail');
  await W.until(pg, () => !!document.querySelector('.sb-content .sb-subnav'), null, 30000);
  L = await look(pg);
  ok(L.chips.join('|') === 'Atlas|Gym' && L.cur.join() === 'Atlas' && /^#\/atlas/.test(L.h), `the Word Atlas tab opens the map with its sub-nav "${L.chips.join(' | ')}", Atlas marked (${L.h})`);
  /* a first visit to the Gym: the path chooser is the Word Gym's first screen */
  await pg.click('.sb-content .sb-subnav button:nth-child(2)'); await settle(pg, ['quest', 'coach']);
  L = await look(pg);
  ok(L.nav === 'quest' && L.h2 === 'Word Gym' && L.h === '#/quest', `the Gym chip opens the Word Gym — a first visit's path chooser, headed Word Gym, at its own #/quest (${L.nav}: "${L.h2}", ${L.h})`);
  ok(L.chips.join('|') === 'Atlas|Gym' && L.cur.join() === 'Gym', `the Word Gym wears the same sub-nav, Gym marked (${L.cur.join()})`);
  ok(L.lit.join() === 'trail', `on the Word Gym the Word Atlas tab is the lit one (${L.lit.join() || 'none'})`);
  /* after a path is picked, the gym itself */
  await pg.evaluate(() => { active().questPath = 'journey'; save(); app.openCoach(); }); await settle(pg, 'coach');
  L = await look(pg);
  ok(L.nav === 'coach' && L.big.includes('Word Gym') && !L.big.includes('Practice') && L.h === '#/practice', `the gym itself is headed Word Gym, nav 'coach', its address unmoved (${L.nav}: ${L.big.slice(0, 3).join(' | ')}, ${L.h})`);
  ok(L.cur.join() === 'Gym' && L.lit.join() === 'trail', `…with Gym marked on the sub-nav and the Word Atlas tab lit (${L.cur.join()}, ${L.lit.join()})`);
  /* the Atlas chip, by KEYBOARD: Tab to it, Enter */
  await pg.focus('.sb-content .sb-subnav button:nth-child(1)'); await pg.keyboard.press('Enter'); await settle(pg, 'trail');
  L = await look(pg);
  ok(L.nav === 'trail' && /^#\/atlas/.test(L.h) && L.cur.join() === 'Atlas' && L.lit.join() === 'trail', `Enter on the Atlas chip goes back to the map (${L.nav}, ${L.h})`);
  /* a screen that sends you to it names it the same way */
  await pg.evaluate(() => { state.progTab = 'me'; app.setNav('progress'); }); await settle(pg, 'progress');
  const prog = await pg.evaluate(() => [...document.querySelectorAll('[data-act="openCoach"]')].map(x => x.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean));
  ok(prog.some(t => /Word Gym/.test(t)) && !prog.some(t => /^(Open |Back to )?Practice\b/.test(t)), `the buttons that open it say Word Gym (${prog.join(' | ').slice(0, 80)})`);
  await ctx.close();

  /* ---- phone: the bottom bar, and the chips under a thumb ---- */
  ({ ctx, pg } = await open(b, true, errs));
  L = await look(pg);
  ok(!L.tabs.some(t => /Word Gym|practi[cs]e/i.test(t)) && L.args.join() === 'home,trail,explore,games,feed', `the phone's bottom bar has no Word Gym tab (${L.tabs.join(' · ')})`);
  const fit = await pg.evaluate(() => [...document.querySelectorAll('nav.sb-tabbar [data-act="setNav"] span:last-child')].every(s => s.scrollWidth <= s.clientWidth + 1));
  ok(fit, 'every label fits its slot on a 390px phone');
  await pg.evaluate(() => app.openCoach()); await settle(pg, ['quest', 'coach']);
  L = await look(pg);
  ok(L.lit.join() === 'trail' && L.cur.join() === 'Gym' && L.chipH.every(h => h >= 44) && L.subR <= 390, `on a phone the Word Gym lights the Atlas tab, and its chips are thumb-sized and on screen (${L.chipH.join('/')}px, right edge ${L.subR})`);
  await ctx.close();

  /* ---- every deep link into the Gym keeps working ---- */
  const at = async (hash, want) => { const o = await open(b, false, errs, hash); await settle(o.pg, want); const r = await o.pg.evaluate(() => ({ nav: state.nav, mode: state.gymMode || null, h: location.hash,
    lit: [...document.querySelectorAll('.sb-topnav [aria-current="page"]')].map(x => x.getAttribute('data-arg')).join() })); await o.ctx.close(); return r; };
  const r1 = await at('#/practice', ['quest', 'coach']);
  ok(/^(coach|quest)$/.test(r1.nav) && r1.lit === 'trail', `#/practice opens the Word Gym, under the Word Atlas tab (${r1.nav}, lit ${r1.lit})`);
  const r2 = await at('#/gym', 'gym');
  ok(r2.nav === 'gym' && r2.lit === 'games', `#/gym opens the Spelling Gym hall on the Play tab, as since 4 Oct (${r2.nav}, lit ${r2.lit})`);
  const r3 = await at('#/gym/sprint', 'gym');
  ok(r3.nav === 'gym' && r3.mode === 'sprint', `#/gym/<mode> opens that Spelling Gym mode (${r3.nav}/${r3.mode})`);

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
