/* One back control, on every screen, in the same place.
   There were thirty-odd bespoke "← Home" links in whatever weight the screen happened to
   use; on a painted header they all but vanished. backPill (window.SB_BACK) is the only
   one now, it sits hard left, and the screen's name is centred against the page beside it.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/back-pill.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{width:1180,height:900,n:'desktop'},{width:390,height:844,n:'phone'}]) {
    const pg = await b.newPage({ viewport: { width: vp.width, height: vp.height } });
    pg.on('pageerror', e => errs.push(vp.n + ' pageerror: ' + e.message));
    await pg.goto('file://' + root + '/index.html');
    await pg.waitForTimeout(3000);
    await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},
      lists:{default:{xp:30},journey:{xp:20}},activeList:'default',missed:[{w:'rhythm',n:2,ts:Date.now()}],
      unlockedThemes:['spellbound'],unlockedConcepts:{},unlockedLists:{},questPath:'journey',
      trail:{done:{},lap:1}}]; state.activeIdx=0; state.screen='app'; try{loadConcepts();}catch(e){} });
    await pg.waitForTimeout(1800);

    const screens = [['openGames','arcade'],['openCollection','hive'],['openTrail','atlas'],
      ['openCoachDesk','coach'],['setNav','progress','progress'],['openFinder','finder'],
      ['openTraps','traps'],['openEvo','yourbee'],['openBuilder','builder']];
    for (const sc of screens) {
      const [act, name, arg] = sc.length===3 ? [sc[0],sc[2],sc[1]] : [sc[0],sc[1],undefined];
      try { await pg.evaluate(([a,g]) => app[a] && app[a](g), [act, arg]); } catch(e){}
      await pg.waitForTimeout(700);
      const r = await pg.evaluate(() => {
        const p = document.querySelector('.sb-phead');
        const pills = [...document.querySelectorAll('button[aria-label^="Back to"]')];
        const out = { pills: pills.length, ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 };
        if (pills.length) { const r0 = pills[0].getBoundingClientRect(); out.h = Math.round(r0.height); out.w = Math.round(r0.width); }
        // measure the CENTRE CELL, not the <h2>: the cell holds icon + name + meta and it
        // is the group that is centred; the h2 sits off-centre inside it whenever a meta
        // string is present, which is correct.
        if (p) { const h = p.querySelector('.sb-phead-c'), l = p.querySelector('.sb-phead-l');
          if (h && l) { const hr = h.getBoundingClientRect(), lr = l.getBoundingClientRect(), pr = p.getBoundingClientRect();
            out.titleCentre = Math.round(hr.left + hr.width/2);
            out.barCentre = Math.round(pr.left + pr.width/2);
            out.pillLeftOfTitle = lr.right <= hr.left + 1;
            out.stacked = hr.top > lr.bottom - 2; } }
        // no weak text-link back controls should survive on a page header
        out.weak = [...document.querySelectorAll('button')].filter(e => {
          const t=(e.textContent||'').trim(); if(!/^←/.test(t)) return false;
          const s=getComputedStyle(e); return s.borderRadius.indexOf('999') < 0 && parseFloat(s.borderTopWidth) < 1; }).map(e=>e.textContent.trim().slice(0,28));
        return out;
      });
      if (!r.pills) errs.push(vp.n + ' ' + name + ': no back pill');
      if (r.ow) errs.push(vp.n + ' H-OVERFLOW on ' + name);
      if (r.h && (r.h < 26 || r.h > 42)) errs.push(vp.n + ' ' + name + ': pill height ' + r.h);
      if (r.weak && r.weak.length) errs.push(vp.n + ' ' + name + ': weak text back link — ' + r.weak.join(' | '));
      if (r.titleCentre != null && !r.stacked) {
        if (!r.pillLeftOfTitle) errs.push(vp.n + ' ' + name + ': pill is not left of the title');
        if (Math.abs(r.titleCentre - r.barCentre) > 3)
          errs.push(vp.n + ' ' + name + ': title off-centre by ' + Math.abs(r.titleCentre - r.barCentre) + 'px');
      }
    }
    await pg.close();
  }
  // a Library destination goes back to the LIBRARY, not to Home — play-testing flagged
  // that getting back there from deep inside was not obvious.
  const pg2 = await b.newPage({ viewport: { width: 1180, height: 900 } });
  await pg2.goto('file://' + root + '/index.html'); await pg2.waitForTimeout(3000);
  await pg2.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},age:9,
    lists:{default:{xp:30}},activeList:'default',missed:[],unlockedThemes:['spellbound'],
    unlockedConcepts:{},unlockedLists:{},questPath:'journey'}]; state.activeIdx=0; state.screen='app';
    state.devUnlock=true; });   // these hubs sit behind plan gates; the back pill is what is under test
  for (const [act, name] of [['openTyping','typing'],['openQuotes','quotes'],['openTraps','traps'],['openBuilder','builder']]) {
    await pg2.evaluate(a => app[a] && app[a](), act); await pg2.waitForTimeout(600);
    const r = await pg2.evaluate(() => { const p = document.querySelector('.sb-phead-l button');
      return p ? { label: p.textContent.trim(), act: p.dataset.act, arg: p.dataset.arg } : null; });
    if (!r) { errs.push(name + ': no back pill'); continue; }
    if (!/Library/i.test(r.label)) errs.push(name + ': back pill says "' + r.label + '", not Library');
    if (r.act !== 'setNav' || r.arg !== 'explore') errs.push(name + ': back pill goes to ' + r.act + '/' + r.arg);
  }
  // and Home-family screens still say Home
  await pg2.evaluate(() => app.openCollection()); await pg2.waitForTimeout(500);
  const hive = await pg2.evaluate(() => { const p = document.querySelector('.sb-phead-l button'); return p ? p.textContent.trim() : null; });
  if (hive && !/Home/i.test(hive)) errs.push('My Hive back pill says "' + hive + '" — it is not a Library screen');
  await pg2.close();
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — one back pill per screen, hard left, name centred, and Library screens go back to the Library');
  process.exit(errs.length ? 1 : 0);
})();
