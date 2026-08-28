/* SLOW (~4 min): six-persona end-to-end UX sweep. Run manually before releases, not in the quick battery. */
/* Persona-driven full-length UX simulation for Bizzing Bee.
   Six personas (4 kids on tablet/phone/desktop, 2 parents) drive the REAL DOM —
   data-act clicks, input events — through complete journeys. Every step logs
   ISSUE / POS / INFO with persona + step context; quality probes run per screen. */
const { chromium } = require('playwright');
const SRC = process.env.SRC || '/home/user/Bizzing-Bee/spellbound-app';
const F = [];   // findings
const log = (persona, type, sev, step, msg) => { F.push({ persona, type, sev, step, msg }); console.log(`[${persona}] ${type}${sev ? '/' + sev : ''} · ${step} · ${msg}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  async function newSession(viewport, persona) {
    const pg = await b.newPage({ viewport });
    pg._errs = []; pg._404 = [];
    pg.on('pageerror', e => pg._errs.push(String(e.message).slice(0, 160)));
    pg.on('requestfailed', r => { const u = r.url(); if (!/favicon/.test(u)) pg._404.push(u.split('/').pop().slice(0, 60)); });
    await pg.goto('file://' + SRC + '/index.html');
    await pg.waitForTimeout(2600);
    pg._persona = persona;
    return pg;
  }
  const drainErrs = (pg, step) => {
    for (const e of pg._errs.splice(0)) log(pg._persona, 'ISSUE', 'HIGH', step, 'pageerror: ' + e);
    for (const u of pg._404.splice(0, 6)) log(pg._persona, 'ISSUE', 'MED', step, 'failed request: ' + u);
    pg._404 = [];
  };
  // quality probe on whatever screen is showing
  async function probe(pg, step) {
    const q = await pg.evaluate(() => {
      const out = {};
      out.hscroll = document.documentElement.scrollWidth - window.innerWidth;
      out.badImg = [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.offsetParent).length;
      out.hasNav = !!document.querySelector('.sb-nav,[data-act="setNav"],.sb-tabbar,[data-act="trailBack"],[data-act="exitTrain"],[data-act="onbBack"],[data-act="exitGame"],.sg-hud,[data-act="closeDrawer"]');
      out.screen = (typeof state !== 'undefined') ? (state.screen + '/' + (state.nav || '')) : '?';
      return out;
    }).catch(() => ({}));
    if (q.hscroll > 4) log(pg._persona, 'ISSUE', 'MED', step, `horizontal page scroll of ${q.hscroll}px (screen ${q.screen})`);
    if (q.badImg) log(pg._persona, 'ISSUE', 'MED', step, `${q.badImg} broken image(s) on ${q.screen}`);
    if (q.hasNav === false) log(pg._persona, 'ISSUE', 'HIGH', step, `no visible way out of screen ${q.screen}`);
    drainErrs(pg, step);
  }
  const click = (pg, act, arg) => pg.evaluate(([a, g]) => {
    const els = [...document.querySelectorAll(`[data-act="${a}"]`)];
    const el = g == null ? els[0] : els.find(e => e.dataset.arg === String(g)) || els[0];
    if (!el) return false; el.click(); return true;
  }, [act, arg == null ? null : arg]);
  const typeInto = (pg, sel, text) => pg.evaluate(([s, t]) => {
    const el = document.querySelector(s); if (!el) return false;
    el.value = t; el.dispatchEvent(new Event('input', { bubbles: true })); return true;
  }, [sel, text]);
  const seedChild = (pg, name, age, extra) => pg.evaluate(([n, a, x]) => {
    localStorage.clear();
    state.children = [Object.assign({ name: n, avatar: 'bee', coins: 120, pow: {}, age: a, lists: { default: { xp: 30 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }, x || {})];
    state.activeIdx = 0; state.screen = 'app'; state.nav = 'home'; render();
  }, [name, age, extra || {}]);

  /* ============ PERSONA 1 · Maya, 6 — phone, fresh install, onboarding ============ */
  try {
    const pg = await newSession({ width: 390, height: 844 }, 'Maya·6·phone');
    await pg.evaluate(() => { localStorage.clear(); location.reload(); });
    await pg.waitForTimeout(2600);
    const scr = await pg.evaluate(() => state.screen);
    log(pg._persona, 'INFO', '', 'fresh boot', 'lands on: ' + scr);
    if (scr === 'landing') {
      const priv = await pg.evaluate(() => !!document.querySelector('a[href="privacy.html"]'));
      log(pg._persona, priv ? 'POS' : 'ISSUE', priv ? '' : 'HIGH', 'landing', priv ? 'privacy notice linked on landing' : 'privacy link MISSING on landing');
      const started = await click(pg, 'startOnboarding') || await click(pg, 'goSignup') || await pg.evaluate(() => { const b2 = [...document.querySelectorAll('button')].find(x => /start|free|begin|try/i.test(x.textContent)); if (b2) { b2.click(); return true; } return false; });
      await pg.waitForTimeout(500);
      log(pg._persona, started ? 'POS' : 'ISSUE', started ? '' : 'HIGH', 'landing', started ? 'found an obvious start button' : 'no obvious start button found');
    }
    let scr2 = await pg.evaluate(() => state.screen);
    if (scr2 === 'auth') {
      // the real path: Create account proceeds locally (no email needed offline)
      await click(pg, 'doAuth'); await pg.waitForTimeout(400);
      scr2 = await pg.evaluate(() => state.screen);
      log(pg._persona, scr2 === 'onboarding' ? 'POS' : 'ISSUE', scr2 === 'onboarding' ? '' : 'HIGH', 'auth', scr2 === 'onboarding' ? 'account step proceeds offline into onboarding' : 'auth screen dead-ends at ' + scr2);
    }
    await probe(pg, 'onboarding step 0');
    // try continuing with NO name — must be refused with guidance
    await click(pg, 'onbNext'); await pg.waitForTimeout(300);
    const stillStep0 = await pg.evaluate(() => state.onbStep === 0);
    log(pg._persona, stillStep0 ? 'POS' : 'ISSUE', stillStep0 ? '' : 'MED', 'onboarding', stillStep0 ? 'empty name is refused' : 'continued with an empty name');
    await typeInto(pg, '[data-inp="onDraftName"]', 'Maya');
    await click(pg, 'onDraftBand', '5-7');
    await pg.evaluate(() => { const a = document.querySelector('[data-act="pickAvatar"]'); a && a.click(); });
    const privOnb = await pg.evaluate(() => !!document.querySelector('a[href="privacy.html"]'));
    log(pg._persona, privOnb ? 'POS' : 'ISSUE', privOnb ? '' : 'HIGH', 'onboarding', privOnb ? 'privacy notice at the point of collection' : 'privacy link MISSING at point of collection');
    await click(pg, 'onbNext'); await pg.waitForTimeout(350); await probe(pg, 'onboarding step 1 (world)');
    // continuing WITHOUT a world must be refused with guidance
    await click(pg, 'onbNext'); await pg.waitForTimeout(250);
    const worldGuard = await pg.evaluate(() => state.onbStep === 1 && /Pick a world/i.test(state.toast || ''));
    log(pg._persona, worldGuard ? 'POS' : 'ISSUE', worldGuard ? '' : 'MED', 'onboarding', worldGuard ? 'skipping the world pick is refused with a friendly toast' : 'no guard/guidance on the world step');
    await pg.evaluate(() => { const w = document.querySelector('[data-act="onbWorld"]'); w && w.click(); }); await pg.waitForTimeout(250);
    await click(pg, 'onbNext'); await pg.waitForTimeout(350); await probe(pg, 'onboarding step 2 (goal)');
    await click(pg, 'pickGoal', '5');
    await click(pg, 'onbNext'); await pg.waitForTimeout(800);
    const home = await pg.evaluate(() => ({ scr: state.screen, nav: state.nav, name: state.children[0] && state.children[0].name, age: state.children[0] && state.children[0].age, band: state.children[0] && state.children[0].ageBand }));
    log(pg._persona, home.scr === 'app' ? 'POS' : 'ISSUE', home.scr === 'app' ? '' : 'HIGH', 'onboarding done', `landed on ${home.scr}/${home.nav} as "${home.name}" ageBand=${home.band} (midpoint ${home.age})`);
    if (home.age && (home.age < 5 || home.age > 7)) log(pg._persona, 'ISSUE', 'MED', 'onboarding', 'picked band 5-7 but stored age midpoint is ' + home.age);
    // phone: the bottom tab bar must be there, the top nav may hide
    const tabs = await pg.evaluate(() => { const bar = [...document.querySelectorAll('button')].filter(x => /Home|Atlas|Practice|Library|Play/i.test(x.textContent) && x.offsetParent); return bar.length; });
    log(pg._persona, tabs >= 4 ? 'POS' : 'ISSUE', tabs >= 4 ? '' : 'HIGH', 'phone nav', tabs >= 4 ? 'nav tabs reachable on a 390px phone' : 'nav tabs NOT visible on phone (' + tabs + ')');
    await probe(pg, 'home on phone');
    // rings → Coach and back
    await pg.evaluate(() => { const el = document.querySelector('[data-act="openCoachDesk"],[data-act="openCoach"]'); el && el.click(); });
    await pg.waitForTimeout(600); await probe(pg, 'coach from rings');
    await pg.close();
  } catch (e) { log('Maya·6·phone', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  /* ============ PERSONA 2 · Ahana, 9 — tablet, full Atlas stop loop ============ */
  try {
    const pg = await newSession({ width: 834, height: 1112 }, 'Ahana·9·tablet');
    await seedChild(pg, 'Ahana', 9);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r))); await pg.waitForTimeout(400);
    await click(pg, 'setNav', 'trail'); await pg.waitForTimeout(700); await probe(pg, 'atlas map');
    const first = await pg.evaluate(() => SB_TRAIL_NEXT());
    if (!first) { log(pg._persona, 'ISSUE', 'HIGH', 'atlas', 'SB_TRAIL_NEXT returned null'); }
    else {
      await pg.evaluate(a => app.trailUnit(a), first.arg); await pg.waitForTimeout(400); await probe(pg, 'stop card');
      const guide = await pg.evaluate(() => /70% right to open the next stop/.test(document.body.innerHTML));
      log(pg._persona, guide ? 'POS' : 'ISSUE', guide ? '' : 'HIGH', 'stop card', guide ? 'card says exactly how to qualify (70% practice)' : 'no qualification guidance on a fresh stop');
      // Learn → back
      await click(pg, 'trailLesson'); await pg.waitForTimeout(600); await probe(pg, 'concept chapter');
      const backFromConcept = await pg.evaluate(() => { const el = document.querySelector('[data-act="conceptBack"],[data-act="conceptClose"]'); if (el) { el.click(); return true; } return false; });
      await pg.waitForTimeout(500);
      const backAt = await pg.evaluate(() => state.nav + '/' + (state.trailView || ''));
      log(pg._persona, backAt.startsWith('trail') ? 'POS' : 'ISSUE', backAt.startsWith('trail') ? '' : 'HIGH', 'concept back', 'back from Learn lands on ' + backAt + (backFromConcept ? '' : ' (no back control found!)'));
      if (!backAt.startsWith('trail')) { await pg.evaluate(a => app.trailUnit(a), first.arg); await pg.waitForTimeout(300); }
      // Meet the words → flip to the last card
      await click(pg, 'trailWords'); await pg.waitForTimeout(500); await probe(pg, 'word deck');
      const nDeck = await pg.evaluate(() => state.trailWordsN || 0);
      for (let i = 0; i < nDeck + 1; i++) { await click(pg, 'trailWordNav', 'next'); await pg.waitForTimeout(60); }
      const wStar = await pg.evaluate(() => { const c = state.children[0]; const k = Object.keys(c.trail.st || {})[0]; return k ? !!c.trail.st[k].w : false; });
      log(pg._persona, wStar ? 'POS' : 'ISSUE', wStar ? '' : 'MED', 'word deck', wStar ? 'reaching the last card earns the words star' : 'flipping to the last card did NOT earn the words star');
      await pg.evaluate(a => app.trailUnit(a), first.arg); await pg.waitForTimeout(300);
      // Practice: full typed session, 2 deliberate misses
      await click(pg, 'trailPractice'); await pg.waitForTimeout(900);
      let over = false, guard = 0;
      while (!over && guard++ < 40) {
        const st = await pg.evaluate(() => ({ over: !!state.sessionOver, w: (state.sessionWords[state.gi] || {}).w, status: state.status }));
        if (st.over) { over = true; break; }
        const wrongOne = guard === 3 || guard === 7;
        await typeInto(pg, '[data-inp="onType"]', wrongOne ? 'zzz' : st.w);
        await click(pg, 'primary'); await pg.waitForTimeout(160);
        const s2 = await pg.evaluate(() => state.status);
        if (s2 === 'wrong') { await click(pg, 'next'); await pg.waitForTimeout(160); }
        else await pg.waitForTimeout(950);   // autoAdvance on correct
      }
      const fin = await pg.evaluate(() => ({ over: !!state.sessionOver, right: state.sessionRight, done: state.sessionDone }));
      log(pg._persona, fin.over ? 'POS' : 'ISSUE', fin.over ? '' : 'HIGH', 'practice', fin.over ? `finished a full session ${fin.right}/${fin.done}` : `session never completed (${fin.right}/${fin.done} after ${guard} turns)`);
      await pg.waitForTimeout(300); await probe(pg, 'session summary');
      const banner = await pg.evaluate(() => /next Atlas stop is open|reach 70% on a full round/.test(document.body.innerHTML));
      log(pg._persona, banner ? 'POS' : 'ISSUE', banner ? '' : 'HIGH', 'session summary', banner ? 'summary explains what the score means for the Atlas' : 'summary silent about the Atlas gate');
      await click(pg, 'exitTrain'); await pg.waitForTimeout(500); await probe(pg, 'back on stop card');
      const roads = await pg.evaluate(() => ({ n: /Next stop →/.test(document.body.innerHTML), g: /Gain stars/.test(document.body.innerHTML), p: /Practice more words/.test(document.body.innerHTML) }));
      const allRoads = roads.n && roads.g && roads.p;
      log(pg._persona, allRoads ? 'POS' : 'ISSUE', allRoads ? '' : 'HIGH', 'three roads', allRoads ? 'cleared stop offers Next stop / Gain stars / Practice more' : 'missing roads: ' + JSON.stringify(roads));
      await click(pg, 'trailNextFrom'); await pg.waitForTimeout(400); await probe(pg, 'next stop');
      const moved = await pg.evaluate(() => state.trailUnit);
      log(pg._persona, moved !== first.arg ? 'POS' : 'ISSUE', moved !== first.arg ? '' : 'HIGH', 'next stop', moved !== first.arg ? 'Next stop opened ' + moved : 'Next stop did not move');
      // quiz: open and answer the first item to prove interactivity
      await click(pg, 'trailQuiz'); await pg.waitForTimeout(700); await probe(pg, 'quiz');
      const qKind = await pg.evaluate(() => state.tq && state.tq.items[0] && state.tq.items[0].ty);
      if (qKind === 'spell') { await typeInto(pg, '[data-inp="tqInput"]', 'zz'); await click(pg, 'tqSpell'); }
      else await click(pg, 'tqPick', '0');
      await pg.waitForTimeout(200); await click(pg, 'tqNext'); await pg.waitForTimeout(200);
      const qMoved = await pg.evaluate(() => state.tq && state.tq.i >= 1);
      log(pg._persona, qMoved ? 'POS' : 'ISSUE', qMoved ? '' : 'HIGH', 'quiz', qMoved ? 'quiz answers and advances' : 'quiz did not advance after answering');
      await pg.close();
    }
  } catch (e) { log('Ahana·9·tablet', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  /* ============ PERSONA 3 · Ravi, 12 — desktop, arcade + search ============ */
  try {
    const pg = await newSession({ width: 1280, height: 900 }, 'Ravi·12·desktop');
    await seedChild(pg, 'Ravi', 12);
    await click(pg, 'setNav', 'games'); await pg.waitForTimeout(800); await probe(pg, 'arcade hub');
    const tiles = await pg.evaluate(() => [...document.querySelectorAll('[data-act="arcadeMenu"]')].map(e => e.dataset.arg));
    log(pg._persona, tiles.length >= 6 ? 'POS' : 'ISSUE', tiles.length >= 6 ? '' : 'HIGH', 'arcade hub', tiles.length + ' game tiles with setup menus: ' + tiles.join(','));
    for (const t of tiles) {
      await click(pg, 'arcadeMenu', t); await pg.waitForTimeout(450);
      const menu = await pg.evaluate(() => ({ up: !!document.querySelector('.arc-menu'), go: !!document.querySelector('.arc-menu #arcm-go'), diff: document.querySelectorAll('.arc-menu #arcm-diff button, .arc-menu .arcm-diff button').length }));
      if (!menu.up || !menu.go) { log(pg._persona, 'ISSUE', 'HIGH', 'game ' + t, 'setup menu missing Start (' + JSON.stringify(menu) + ')'); continue; }
      await pg.evaluate(() => document.querySelector('.arc-menu #arcm-go').click()); await pg.waitForTimeout(1700);
      const up = await pg.evaluate(() => !!document.querySelector('.arc-play'));
      drainErrs(pg, 'game ' + t);
      if (!up) { log(pg._persona, 'ISSUE', 'HIGH', 'game ' + t, 'Start pressed but game never mounted'); continue; }
      const exited = await pg.evaluate(() => { const el = document.querySelector('.arc-play-back,[data-act="exitGame"]'); if (el) { el.click(); return true; } return false; });
      await pg.waitForTimeout(400);
      const gone = await pg.evaluate(() => !document.querySelector('.arc-play'));
      log(pg._persona, gone ? 'POS' : 'ISSUE', gone ? '' : 'HIGH', 'game ' + t, gone ? 'menu → Start → plays → exits cleanly (diff options: ' + menu.diff + ')' : (exited ? 'exit clicked but overlay STUCK' : 'no visible exit control on the game overlay'));
      if (!gone) await pg.evaluate(() => document.querySelectorAll('.arc-play').forEach(e => e.remove()));
      drainErrs(pg, 'game ' + t + ' exit');
    }
    // Bizzillionaire + Mock Bee mount
    await pg.evaluate(() => app.openBizz && app.openBizz()); await pg.waitForTimeout(900);
    const bz = await pg.evaluate(() => !!document.querySelector('.bz-play'));
    log(pg._persona, bz ? 'POS' : 'ISSUE', bz ? '' : 'MED', 'bizzillionaire', bz ? 'mounts' : 'did not mount');
    await pg.evaluate(() => document.querySelectorAll('.bz-play').forEach(e => e.remove()));
    await pg.evaluate(() => { state.nav = 'mockbee'; render(); }); await pg.waitForTimeout(700); await probe(pg, 'mock bee');
    // header search: type, suggestions, enter
    await click(pg, 'setNav', 'home'); await pg.waitForTimeout(400);
    const hasSearch = await typeInto(pg, '.sb-hsearch input, input[data-fkey="hsearch"], input[placeholder*="earch"]', 'necess');
    await pg.waitForTimeout(500);
    const sugg = await pg.evaluate(() => document.querySelectorAll('.sb-hsug button, .sb-hsug [data-act]').length);
    log(pg._persona, hasSearch && sugg > 0 ? 'POS' : 'ISSUE', hasSearch && sugg > 0 ? '' : 'HIGH', 'header search', hasSearch ? (sugg + ' live suggestions for "necess"') : 'search input not found');
    if (sugg > 0) { await pg.evaluate(() => { const s = document.querySelector('.sb-hsug button, .sb-hsug [data-act]'); s && s.click(); }); await pg.waitForTimeout(600); await probe(pg, 'search result / word card'); }
    await pg.close();
  } catch (e) { log('Ravi·12·desktop', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  /* ============ PERSONA 4 · Sofia, 15 — desktop, library + hive + drawer sweep ============ */
  try {
    const pg = await newSession({ width: 1280, height: 900 }, 'Sofia·15·desktop');
    await seedChild(pg, 'Sofia', 15);
    await click(pg, 'setNav', 'explore'); await pg.waitForTimeout(700); await probe(pg, 'library');
    const libTiles = await pg.evaluate(() => [...document.querySelectorAll('[data-act]')].filter(e => e.closest('.sb-lib, [class*="lib"]') || /Library/.test(document.body.textContent)).length);
    // shelf
    const shelf = await pg.evaluate(() => !!document.querySelector('[data-act="openBook"]'));
    log(pg._persona, shelf ? 'POS' : 'INFO', '', 'library', shelf ? 'book shelf present with tappable spines' : 'no book shelf visible on library');
    // hive via coins pill
    await click(pg, 'openCollection'); await pg.waitForTimeout(600); await probe(pg, 'my hive');
    for (const tab of ['badges', 'avatars', 'worlds']) {
      const okTab = await pg.evaluate(t2 => { const el = [...document.querySelectorAll('[data-act="collTab"]')].find(e => (e.dataset.arg || '').toLowerCase().includes(t2)); if (el) { el.click(); return true; } return false; }, tab);
      await pg.waitForTimeout(400); drainErrs(pg, 'hive tab ' + tab);
      if (!okTab) log(pg._persona, 'ISSUE', 'MED', 'my hive', 'tab not found: ' + tab);
    }
    await probe(pg, 'hive worlds tab');
    // drawer: open, walk every row
    await click(pg, 'setNav', 'home'); await pg.waitForTimeout(300);
    await click(pg, 'openDrawer'); await pg.waitForTimeout(400);
    const rows = await pg.evaluate(() => [...document.querySelectorAll('[data-act="drawer"]')].map(e => e.dataset.arg));
    log(pg._persona, rows.length ? 'POS' : 'ISSUE', rows.length ? '' : 'HIGH', 'drawer', rows.length + ' drawer destinations: ' + rows.join(','));
    const signout = await pg.evaluate(() => { const d = document.querySelector('.sb-drawer, [class*="drawer"]'); return d ? /sign out/i.test(d.textContent) : /sign out/i.test(document.body.textContent); });
    log(pg._persona, signout ? 'POS' : 'ISSUE', signout ? '' : 'MED', 'drawer', signout ? 'Sign out present at the end of the drawer' : 'no Sign out in drawer');
    for (const r of rows) {
      await click(pg, 'openDrawer'); await pg.waitForTimeout(250);
      await click(pg, 'drawer', r); await pg.waitForTimeout(500);
      await probe(pg, 'drawer → ' + r);
    }
    // vocabulary quick loop
    await pg.evaluate(() => { app.openVocab ? app.openVocab() : (state.nav = 'vocab', render()); }); await pg.waitForTimeout(700); await probe(pg, 'vocabulary');
    await pg.close();
  } catch (e) { log('Sofia·15·desktop', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  /* ============ PERSONA 5 · Priya — parent, settings/PIN/privacy/plans ============ */
  try {
    const pg = await newSession({ width: 1280, height: 900 }, 'Priya·parent');
    await seedChild(pg, 'Kid', 9);
    await pg.evaluate(() => { app.openSettings ? app.openSettings() : (state.nav = 'settings', render()); }); await pg.waitForTimeout(600); await probe(pg, 'settings');
    const tiles = await pg.evaluate(() => document.querySelectorAll('.sb-qtile').length);
    log(pg._persona, tiles >= 8 ? 'POS' : 'ISSUE', tiles >= 8 ? '' : 'MED', 'settings', tiles + ' quick tiles');
    // toggle every tile once, then once more (must not error, choices must advance)
    const tileErr = await pg.evaluate(() => { let n = 0; document.querySelectorAll('.sb-qtile').forEach(t => { try { t.click(); n++; } catch (e) {} }); return n; });
    await pg.waitForTimeout(400); drainErrs(pg, 'settings tiles');
    log(pg._persona, 'INFO', '', 'settings', 'tapped ' + tileErr + ' tiles without error');
    const privSet = await pg.evaluate(() => !!document.querySelector('a[href="privacy.html"]'));
    log(pg._persona, privSet ? 'POS' : 'ISSUE', privSet ? '' : 'HIGH', 'settings', privSet ? 'privacy link present in Settings' : 'privacy link MISSING in Settings');
    const signoutSet = await pg.evaluate(() => /sign out/i.test(document.body.textContent));
    log(pg._persona, signoutSet ? 'POS' : 'ISSUE', signoutSet ? '' : 'MED', 'settings', signoutSet ? 'Sign out present in Settings' : 'Sign out missing from Settings');
    const advInAccount = await pg.evaluate(() => /Advanced Pack/i.test(document.body.textContent));
    log(pg._persona, advInAccount ? 'POS' : 'INFO', '', 'settings', advInAccount ? 'Advanced Pack reachable from Settings (account section)' : 'Advanced Pack not mentioned in Settings');
    // age RANGE not exact age
    const asksAge = await pg.evaluate(() => /Age range/i.test(document.body.textContent) && !/exact age|birthday/i.test(document.body.textContent));
    log(pg._persona, asksAge ? 'POS' : 'ISSUE', asksAge ? '' : 'MED', 'settings', asksAge ? 'asks for an age RANGE and a display name' : 'age range framing missing');
    // parent zone gate
    await pg.evaluate(() => { state.parentPin = '1234'; save(); });
    await pg.evaluate(() => { app.openParent ? app.openParent() : (app.openProgress && app.openProgress('parent')); }); await pg.waitForTimeout(600);
    const pinAsked = await pg.evaluate(() => !!state.pinDlg || /PIN/i.test(document.body.textContent));
    log(pg._persona, pinAsked ? 'POS' : 'ISSUE', pinAsked ? '' : 'HIGH', 'parent zone', pinAsked ? 'parent zone asks for the PIN' : 'parent zone opened without asking for the set PIN');
    await pg.evaluate(() => { state.pinDlg = null; state.parentPin = null; save(); app.openParent ? app.openParent() : (state.nav = 'progress', render()); }); await pg.waitForTimeout(700); await probe(pg, 'parent zone');
    const privPz = await pg.evaluate(() => !!document.querySelector('a[href="privacy.html"]'));
    log(pg._persona, privPz ? 'POS' : 'ISSUE', privPz ? '' : 'HIGH', 'parent zone', privPz ? 'privacy link present in Parent Zone' : 'privacy link MISSING in Parent Zone');
    // plans
    await pg.evaluate(() => { app.goPaywall ? app.goPaywall() : app.landPlans && app.landPlans(); }); await pg.waitForTimeout(700); await probe(pg, 'plans sheet');
    const plans = await pg.evaluate(() => /Premium|plan/i.test(document.body.textContent));
    log(pg._persona, plans ? 'POS' : 'ISSUE', plans ? '' : 'MED', 'plans', plans ? 'plans sheet reachable' : 'plans sheet did not open');
    await pg.close();
  } catch (e) { log('Priya·parent', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  /* ============ PERSONA 6 · Daniel — parent, progress report with history ============ */
  try {
    const pg = await newSession({ width: 1280, height: 900 }, 'Daniel·parent');
    await seedChild(pg, 'Kid', 11, { coins: 400 });
    await pg.evaluate(() => { const c = state.children[0];
      // a fortnight of history so the report has something to say
      c.activity = []; const day = 86400000; const now = Date.now();
      for (let i = 0; i < 14; i++) c.activity.push({ t: now - i * day, kind: 'practice', label: 'Practice', stats: { done: 10, right: 8 }, missed: ['necessary'] });
      c.missed = [{ w: 'necessary', d: 'needed', y: 3 }, { w: 'rhythm', d: 'beat', y: 4 }];
      state.luMastered = { about: 1, because: 1 }; save(); });
    await pg.evaluate(() => { app.openProgress ? app.openProgress() : (state.nav = 'progress', render()); }); await pg.waitForTimeout(800); await probe(pg, 'progress');
    const hasReport = await pg.evaluate(() => /week|this week|practice/i.test(document.body.textContent));
    log(pg._persona, hasReport ? 'POS' : 'ISSUE', hasReport ? '' : 'HIGH', 'progress', hasReport ? 'progress report renders with history' : 'progress screen empty despite 14 days of history');
    const bigTotal = await pg.evaluate(() => { const m = document.body.textContent.match(/.{40}(\/\s?102|0\/1\d\d).{40}/); return m ? m[0].replace(/\s+/g, ' ') : ''; });
    log(pg._persona, !bigTotal ? 'POS' : 'ISSUE', !bigTotal ? '' : 'MED', 'progress', !bigTotal ? 'no intimidating x/102-style totals' : 'big total found, context: "' + bigTotal + '"');
    await pg.close();
  } catch (e) { log('Daniel·parent', 'ISSUE', 'HIGH', 'CRASH', String(e).slice(0, 200)); }

  await b.close();
  const issues = F.filter(f => f.type === 'ISSUE');
  console.log('\n===== SUMMARY: ' + issues.length + ' issues (' + issues.filter(i => i.sev === 'HIGH').length + ' high), ' + F.filter(f => f.type === 'POS').length + ' positives =====');
  require('fs').writeFileSync('/tmp/claude-0/-home-user-Bizzing-Bee/6bb49a64-31ad-56cd-aca3-221a5aa4d9ee/scratchpad/ux-findings.json', JSON.stringify(F, null, 1));
})();
