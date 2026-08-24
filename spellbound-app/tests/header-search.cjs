/* The header carries a real search bar: type in it, see suggestions, Enter opens the
   Finder on the query, a suggestion opens that word's card.
   It used to be a button that took you somewhere to find a search box.
   The dropdown must NOT close on blur — blur fires before the click that picks a
   suggestion, so closing there would kill the very tap the list exists for.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/header-search.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:900,n:'desktop'},{width:390,height:844,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(3200);
    await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
      lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
      unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
      state.activeIdx=0; state.screen='app'; app.setNav('home'); });
    await pg.waitForTimeout(700);

    const box = await pg.$('.sb-hsearch input');
    if (!box) { errs.push(vp.n + ': no search input in the header'); await pg.close(); continue; }
    const w = await pg.evaluate(() => Math.round(document.querySelector('.sb-hsearch').getBoundingClientRect().width));
    if (w < 150) errs.push(vp.n + ': search bar only ' + w + 'px wide');

    // typing shows suggestions, and the caret survives the re-render
    await box.click();
    await pg.keyboard.type('irid', { delay: 45 });
    await pg.waitForTimeout(500);
    const r = await pg.evaluate(() => ({
      val: document.querySelector('.sb-hsearch input').value,
      focused: document.activeElement === document.querySelector('.sb-hsearch input'),
      caret: document.querySelector('.sb-hsearch input').selectionStart,
      rows: [...document.querySelectorAll('.sb-hsug-row .sb-hsug-w')].map(e => e.textContent.trim()),
      seeAll: !!document.querySelector('.sb-hsug-all'),
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
    }));
    if (r.val !== 'irid') errs.push(vp.n + ': input holds "' + r.val + '" after typing "irid"');
    if (!r.focused) errs.push(vp.n + ': the input lost focus while typing (render clobbered it)');
    if (r.caret !== 4) errs.push(vp.n + ': caret jumped to ' + r.caret);
    if (!r.rows.length) errs.push(vp.n + ': no suggestions for "irid"');
    if (r.rows.length && !r.rows.some(x => /^irid/i.test(x))) errs.push(vp.n + ': suggestions do not start with the query — ' + r.rows.join(','));
    if (r.rows.length > 7) errs.push(vp.n + ': ' + r.rows.length + ' suggestions (capped at 7)');
    if (!r.seeAll) errs.push(vp.n + ': no "see all matches" row');
    if (r.ow) errs.push(vp.n + ': H-OVERFLOW with the dropdown open');

    // arrow-down then Enter takes the highlighted suggestion
    await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(250);
    const hi = await pg.evaluate(() => { const e = document.querySelector('.sb-hsug-row.on'); return e ? e.querySelector('.sb-hsug-w').textContent.trim() : null; });
    if (!hi) errs.push(vp.n + ': ArrowDown did not highlight a suggestion');
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
    const afterPick = await pg.evaluate(() => ({ nav: state.nav, sel: state.finderSel && state.finderSel.w, hq: state.hq }));
    if (afterPick.nav !== 'finder') errs.push(vp.n + ': Enter on a suggestion landed on nav=' + afterPick.nav);
    if (hi && afterPick.sel && afterPick.sel.toLowerCase() !== hi.toLowerCase())
      errs.push(vp.n + ': picked "' + hi + '" but opened "' + afterPick.sel + '"');
    if (afterPick.hq) errs.push(vp.n + ': the bar did not clear after picking');

    // plain Enter (no highlight) opens the Finder on the typed query
    await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(400);
    await pg.click('.sb-hsearch input');
    await pg.keyboard.type('quixotic', { delay: 30 });
    await pg.waitForTimeout(400);
    await pg.keyboard.press('Enter'); await pg.waitForTimeout(700);
    const afterGo = await pg.evaluate(() => ({ nav: state.nav, q: state.finderQ, hq: state.hq }));
    if (afterGo.nav !== 'finder') errs.push(vp.n + ': Enter did not open the Finder');
    if (afterGo.q !== 'quixotic') errs.push(vp.n + ': the Finder opened on "' + afterGo.q + '"');
    if (afterGo.hq) errs.push(vp.n + ': the bar did not clear on Enter');

    // a click elsewhere closes the list
    await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(400);
    await pg.click('.sb-hsearch input'); await pg.keyboard.type('bee', { delay: 30 });
    await pg.waitForTimeout(400);
    if (!await pg.evaluate(() => !!document.querySelector('.sb-hsug'))) errs.push(vp.n + ': no dropdown for "bee"');
    await pg.evaluate(() => { document.querySelector('.sb-content').click(); });
    await pg.waitForTimeout(400);
    if (await pg.evaluate(() => !!document.querySelector('.sb-hsug'))) errs.push(vp.n + ': the dropdown survived a click outside');
    await pg.close();
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — a real search bar: live suggestions, arrow keys, Enter to the Finder, taps to the word');
  process.exit(errs.length ? 1 : 0);
})();
