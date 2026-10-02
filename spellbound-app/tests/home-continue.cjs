/* ONE CONTINUE ON HOME (FIX-BEE B1/B2/B3, family standard §2).

   Bee's home is the family template and keeps its look; what changed is the buttons. The audit
   saw three calls to action that competed — "Find your level · Start", the Atlas "Start" and
   the journey "Practise". Now:
     · exactly ONE filled primary button on Home — "Next on your journey" — in every look
       (light / white / dusk), on a desktop and on a phone; every other card is secondary;
     · on a 390×844 phone that Continue is above the fold, clear of the bottom tab bar;
     · beside it, one progress strip says where the child is: the Atlas region, a bar for how
       far along the tier (no "N/102" total), and the level;
     · every "next" in the app goes through ONE function, SB_NEXT_STEP / app.goNext: Home,
       the drawer, the end of placement and the Hive's #/continue all land on the same stop;
     · the home anatomy: greeting first, then Continue, Today's row of at most three, and no
       more than six ways-in tiles.
   "Filled primary" is measured, not declared: a control counts when it, or a labelled part
   of it, is painted in the app's action colour.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/home-continue.cjs                     */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const KIDS = {
  started: { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, band: 3, bandSeed: 3,
    lists: { journey: { xp: 30 } }, activeList: 'journey',
    trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 85 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 }, 'u2:1': { l: 1, p: 85 } }, elap: 1, edone: {}, echk: {} } },
  fresh: { name: 'Ravi', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0, lists: { journey: { xp: 0 } }, activeList: 'journey' } };

/* runs in the page: every control on Home painted in the action colour */
function filledPrimaries() {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-99px;background:var(--action,var(--accent))';
  document.body.appendChild(probe); const act = getComputedStyle(probe).backgroundColor;
  probe.style.background = 'var(--accent)'; const acc = getComputedStyle(probe).backgroundColor; probe.remove();
  const paint = el => { const c = getComputedStyle(el).backgroundColor; return c === act || c === acc; };
  const home = document.querySelector('.sb-content');
  const ctrls = [...home.querySelectorAll('button,a[href],[data-act]')].filter(e => !e.parentElement.closest('button,a[href],[data-act]'));
  const out = [];
  for (const c of ctrls) {
    const r = c.getBoundingClientRect(); if (!r.width || !r.height) continue;
    /* the control itself, or a part of it that carries a label (a progress bar's fill does not) */
    const hit = [c, ...c.querySelectorAll('*')].some(e => paint(e) && /[A-Za-z]/.test(e.textContent || '') && e.getBoundingClientRect().width > 0);
    if (hit) out.push(c.getAttribute('data-act') + ':' + (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30));
  }
  return out;
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{ w: 1180, h: 900, n: 'desktop' }, { w: 390, h: 844, n: 'phone' }]) {
    for (const who of ['started', 'fresh']) {
      const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.n === 'phone' });
      await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KIDS[who]);
      const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ' ' + e.message));
      await pg.goto(URL); await pg.waitForTimeout(3200);
      const tag = vp.n + '/' + who;
      /* ---- one filled primary, in every look ---- */
      for (const mode of ['light', 'white', 'dusk']) {
        await pg.evaluate(m => { state.mode = m; app.setNav('home'); }, mode); await pg.waitForTimeout(250);
        const f = await pg.evaluate(filledPrimaries);
        ok(f.length === 1 && /^goNext:/.test(f[0]), `${tag} ${mode}: exactly one filled primary on Home, and it is Continue (${f.join(' | ') || 'none'})`);
      }
      await pg.evaluate(() => { state.mode = 'light'; render(); }); await pg.waitForTimeout(200);
      const g = await pg.evaluate(() => {
        const next = document.querySelector('.sb-content [data-act="goNext"]');
        const cont = next && next.querySelector('.sb-continue');
        const strip = next && next.querySelector('.sb-home-where');
        const bar = strip && strip.querySelector('[role="progressbar"]');
        const tab = document.querySelector('.sb-tabbar'); const tabTop = tab && getComputedStyle(tab).display !== 'none' ? tab.getBoundingClientRect().top : innerHeight;
        const cr = cont && cont.getBoundingClientRect(), sr = strip && strip.getBoundingClientRect();
        const ns = SB_NEXT_STEP();
        const prac = document.querySelector('.sb-content [data-act="openCoach"]');
        const pracCta = prac && [...prac.querySelectorAll('span')].find(s => s.textContent.trim() === 'Practise' && s.children.length === 1);
        const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;background:var(--action,var(--accent))';
        document.body.appendChild(probe); const actCol = getComputedStyle(probe).backgroundColor; probe.remove();
        const greet = document.querySelector('.sb-content .sb-home-greet');
        const today = document.querySelectorAll('.sb-home > div:not(.sb-home-r1):not(.sb-home-r2):not(:last-child) > *').length;
        return { has: !!next, nextTxt: next && next.textContent.replace(/\s+/g, ' '),
          above: !!cr && cr.top >= 0 && cr.bottom <= Math.min(innerHeight, tabTop) + 0.5, contBottom: cr && Math.round(cr.bottom), fold: Math.round(Math.min(innerHeight, tabTop)),
          beside: !!(cr && sr && sr.left >= cr.right - 1 && sr.top < cr.bottom && sr.bottom > cr.top),
          region: strip && strip.textContent, pct: bar && +bar.getAttribute('aria-valuenow'), want: ns.ready ? ns.pct : 0, act: ns.ready ? ns.act : 'The Word Atlas',
          level: strip && /Level \d|level/i.test(strip.textContent),
          bigTotal: strip && /\d+\s*(\/|of)\s*\d+/.test(strip.textContent),
          pracOutline: !!(pracCta && getComputedStyle(pracCta).borderTopStyle !== 'none' && getComputedStyle(pracCta).backgroundColor !== actCol),
          greetFirst: !!(greet && next && (greet.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING)),
          today, tiles: document.querySelectorAll('.sb-content .sb-home-tiles > *').length,
          placement: !!document.querySelector('.sb-content [data-act="startLevelTest"],.sb-content .sb-band-call') };
      });
      ok(g.has, `${tag}: the Continue card is on Home`);
      ok(g.above, `${tag}: Continue is above the fold and clear of the tab bar (bottom ${g.contBottom}px, fold ${g.fold}px)`);
      ok(g.beside && g.region && g.region.indexOf(g.act) >= 0 && g.level && g.pct === g.want && !g.bigTotal,
        `${tag}: beside Continue, one strip says the region ("${g.act}"), the level, and draws a bar at ${g.pct}% — no total printed`);
      ok(g.pracOutline, `${tag}: the journey card's Practise is an outline button, not a second primary`);
      ok(!g.placement, `${tag}: "Find your level" is not a call to action on Home`);
      ok(g.greetFirst && g.today <= 3 && g.tiles <= 6, `${tag}: anatomy — greeting before Continue, Today's row of ${g.today} (≤3), ${g.tiles} ways-in tiles (≤6)`);

      /* ---- every next goes through the one function ---- */
      if (vp.n === 'desktop') {
        const want = await pg.evaluate(() => SB_NEXT_STEP().arg);
        await pg.click('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(1800);
        const viaHome = await pg.evaluate(() => state.trailUnit || state.trailReturn);
        ok(viaHome === want, `${tag}: Home's Continue opens SB_NEXT_STEP's stop (${viaHome} = ${want})`);
        await pg.evaluate(() => { state.trailUnit = null; state.trailReturn = null; app.setNav('home'); state.drawerOpen = true; render(); }); await pg.waitForTimeout(300);
        const row = await pg.evaluate(() => { const r = document.querySelector('aside [data-act="drawer"][data-arg="next"]'); return r && r.textContent.replace(/\s+/g, ' '); });
        await pg.evaluate(() => app.drawer('next')); await pg.waitForTimeout(1500);
        const viaDrawer = await pg.evaluate(() => state.trailUnit || state.trailReturn);
        ok(!!row && /Next on your journey/.test(row) && viaDrawer === want, `${tag}: the drawer's jump-back-in row is the same next step (${viaDrawer})`);
        await pg.evaluate(() => { state.trailUnit = null; state.trailReturn = null; state.lt = { done: true, placed: 3, words: [] }; app.setNav('leveltest'); }); await pg.waitForTimeout(300);
        await pg.evaluate(() => app.ltGo()); await pg.waitForTimeout(1500);
        const viaPlace = await pg.evaluate(() => state.trailUnit || state.trailReturn);
        ok(viaPlace === want, `${tag}: finishing placement goes on through the same next step (${viaPlace})`);
      }
      await ctx.close();
    }
  }
  /* ---- and nobody else reads the frontier for a call to action ---- */
  const files = fs.readdirSync(ROOT).filter(f => /\.js$/.test(f) && f !== 'trail.js');   // trail.js owns it
  const stray = []; let shellReads = 0;
  for (const f of files) {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    /* the one reader, and the Progress page — which displays the Atlas, and offers no next step */
    const allowed = [];
    const span = (start) => { const i = src.indexOf(start); if (i < 0) return; const j = src.indexOf('\nfunction ', i + 1); allowed.push([i, j < 0 ? src.length : j]); };
    if (f === 'family-shell.js') span('function trailNext(');
    if (f === 'app3.js') span('function viewProgress(');
    let i = -1;
    while ((i = src.indexOf('SB_TRAIL_NEXT(', i + 1)) >= 0) {
      if (allowed.some(([a2, b2]) => i > a2 && i < b2)) { if (f === 'family-shell.js') shellReads++; continue; }
      stray.push(f + ' @' + src.slice(0, i).split('\n').length);
    }
  }
  ok(shellReads >= 1 && stray.length === 0, 'SB_TRAIL_NEXT is read only by the next-step function (and the Progress page, which only displays it): ' + (stray.join(', ') || 'no strays'));
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
