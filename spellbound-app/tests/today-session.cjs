/* TODAY'S TEN, HOME'S TODAY RIBBON, AND THE FIRST-DAY CARD (road to 4.5, P1.16 · P1.17 · P1.18) — @check

   The audit: "no fixed daily session that ends" (F1), "no single 'today' card on Home" (B4), "new child: Home shows
   stop 1, 0/10 rings — no welcome card" (B9). Driven for real at 390×844 with touch AND a keyboard:
     HOME, a returning child — one line in row 2 (app3 homeToday): the daily ring, Today's ten and My Feed; under
       Continue on a phone, above the two journey cards on a desktop; one line tall, inside the column, every control a
       44px target; Continue still the ONLY filled button and still above the fold; light and dusk;
     THE SESSION (today.js) — ten words, the DUE revisions first (Home's own homeDueWords: missed on an earlier day, or
       slipped and due), today's miss not among them; every word came through nextWords (the door, spied on); nothing
       on screen spells the word while it is asked; 1 says it; a miss HOLDS with the miss panel and its typed error
       (data-err) until Next; a right answer moves on; leave half way and Home says "Carry on" and #/today resumes at
       that word; it ENDS on a finish card listing the words right and the words to practise; the coins are exactly the
       right answers, all `answer`, and the card prints the ledger's change; misses are on the revision pile and rights
       on the mastery record; the ribbon then says the day is done, and the day's session is not built twice;
     A NEW child — the first-day card in the ribbon's place, ONE button (Start), outlined, opening exactly where
       Continue does; no Today ribbon on day one; one filled button still.
   Proved by breaking (10 Oct 2026, all four at once, each put back after): today.js building the level words before
   the due ones → the due-first check fails ("chief, think, swedish" first); the ribbon's Start painted with the accent
   fill → the one-filled-button check fails on the phone (light and dusk) and the desktop; the first-day Start opening
   Today's ten instead of goNext → the one-button check fails (light and dusk); a finish that pays a `stop` coin → the
   coins check and the card-equals-ledger check fail (13 against 8).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/today-session.cjs                                              */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { booted, until } = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const D = 864e5, NOW = Date.now();
const KID = (extra) => Object.assign({ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey',
  daysPlayed: ['2026-09-30'], trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} },
  /* due: two words missed on earlier days and one whose mastery slipped (filled in the page with today's day number);
     NOT due: a word missed a minute ago */
  missed: [{ w: 'island', ts: NOW - 3 * D, n: 1 }, { w: 'friend', ts: NOW - 2 * D, n: 1 }, { w: 'castle', ts: NOW - 60e3, n: 1 }] }, extra || {});
function filledPrimaries() {   // family-check's measure
  const probe = document.createElement('span'); probe.style.cssText = 'position:absolute;left:-99px;background:var(--action,var(--accent))';
  document.body.appendChild(probe); const act = getComputedStyle(probe).backgroundColor; probe.style.background = 'var(--accent)'; const acc = getComputedStyle(probe).backgroundColor; probe.remove();
  const paint = (el) => { const c = getComputedStyle(el).backgroundColor; return c === act || c === acc; };
  const home = document.querySelector('.sb-content'); if (!home) return ['no home'];
  const ctrls = [...home.querySelectorAll('button,a[href],[data-act]')].filter((e) => !e.parentElement.closest('button,a[href],[data-act]'));
  return ctrls.filter((c) => { const r = c.getBoundingClientRect(); return r.width && r.height && [c, ...c.querySelectorAll('*')].some((e) => paint(e) && /[A-Za-z]/.test(e.textContent || '') && e.getBoundingClientRect().width > 0); })
    .map((c) => c.getAttribute('data-act') + ':' + (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 24)); }
function ribbon() { const r2 = document.querySelector('.sb-content .sb-home-r2'); const e = r2 && r2.querySelector(':scope > .sb-today'); if (!e) return null;
  const R = (x) => { const b = x.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round); };
  const here = document.querySelector('.sb-content .sb-home-next'), ring = document.querySelector('.sb-content .sb-home-rings'), cont = document.querySelector('.sb-content .sb-continue');
  return { idx: [...r2.children].indexOf(e), first: e.classList.contains('sb-first'), r: R(e), here: here && R(here), ring: ring && R(ring), cont: cont && R(cont),
    btns: [...e.querySelectorAll('button')].map((b) => ({ act: b.getAttribute('data-act'), h: Math.round(b.getBoundingClientRect().height), t: b.innerText.replace(/\s+/g, ' ').trim(), aria: b.getAttribute('aria-label') || '' })),
    text: e.innerText.replace(/\s+/g, ' ').trim(), sw: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }; }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const errs = [];
  const open = async (kid, vp) => {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m, deviceScaleFactor: vp.m ? 2 : 1 });
    await ctx.addInitScript((k) => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, kid);
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message));
    await pg.goto(URL); ok(await booted(pg), `${vp.n}: the app boots`);
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need('trail', r)));
    await pg.evaluate(() => { const c = active(), t = mastDay(); if (c.name === 'Ahana' && !c.fr) { c.mast = { castle: { b: 1, d: t, due: t + 1, ok: 1, n: 2, miss: 1 }, garden: { b: 0, d: t - 2, due: t - 2, ok: 1, n: 2, miss: 1 } }; save(); } state.screen = 'app'; app.setNav('home'); });
    await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    await until(pg, () => !!document.querySelector('.sb-content .sb-home-r2 > .sb-today'), null, 15000);
    return { ctx, pg }; };

  /* ================= 1. a returning child, on a phone: the ribbon, then the whole session ================= */
  { const { ctx, pg } = await open(KID(), { n: 'phone', w: 390, h: 844, m: 1 });
    for (const mode of ['light', 'dusk']) {
      await pg.evaluate((m) => { state.mode = m; render(); }, mode); await until(pg, () => !!document.querySelector('.sb-today'), null, 5000);
      const R = await pg.evaluate(ribbon), prim = await pg.evaluate(filledPrimaries);
      ok(!!R && R.idx === 2 && !R.first, `phone ${mode}: the today ribbon is row 2's third child (the shell's two journey cards keep their places)`);
      ok(!!R && R.r[0] === 15 && R.r[2] === 360 && R.r[3] <= 64 && R.sw <= 390, `phone ${mode}: one line, in the 360px column, nothing past the edge (${R && R.r.join(',')}; page ${R && R.sw}px)`);
      ok(!!R && R.here && R.ring && R.r[1] > R.here[1] && R.r[1] < R.ring[1] && R.cont && R.cont[1] + R.cont[3] <= 776, `phone ${mode}: under Continue and above the rings, and Continue is still above the fold (Continue ends at ${R && R.cont && R.cont[1] + R.cont[3]}px)`);
      ok(!!R && R.btns.length === 3 && R.btns.every((x) => x.h >= 44) && R.btns.map((x) => x.act).join() === 'openCoachDesk,openToday,setNav' && /Today's ten/.test(R.text) && /Start/.test(R.text) && /Feed/.test(R.text),
        `phone ${mode}: the ring, Today's ten and My Feed — three 44px controls ("${R && R.text}")`);
      ok(prim.length === 1 && /^goNext:/.test(prim[0]), `phone ${mode}: Continue is still the only filled button on Home (${prim.join(' | ')})`);
    }
    await pg.evaluate(() => { state.mode = 'light'; render(); });
    /* the door, spied on; and the voice */
    await pg.evaluate(() => { window.__nw = new Set(); window.__said = [];
      const f = window.nextWords; const g = function () { const out = f.apply(this, arguments); (out || []).forEach((w) => window.__nw.add(String(w.w).toLowerCase())); return out; }; g.pool = f.pool; window.nextWords = g;
      const s = window.say; window.say = function (w) { window.__said.push(String(w)); }; window.__realSay = s;
      window.__due = homeDueWords(active()); window.__m0 = null; });
    const m0 = await coins.mark(pg);
    await pg.tap('.sb-today [data-act="openToday"]');
    ok(await until(pg, () => state.nav === 'today' && !!document.querySelector('.td-card .td-in'), null, 20000), 'a tap on Today\'s ten opens the session');
    const S = await pg.evaluate(() => ({ ws: active().today.ws.map((w) => w.w.toLowerCase()), due: window.__due.slice(), nw: [...window.__nw], hash: location.hash }));
    const nd = S.ws.filter((w) => S.due.includes(w)).length;
    ok(S.ws.length === 10 && new Set(S.ws).size === 10, `ten different words (${S.ws.join(' ')})`);
    ok(S.due.length >= 3 && nd === Math.min(10, S.due.length) && S.ws.slice(0, nd).every((w) => S.due.includes(w)) && !S.ws.slice(nd).some((w) => S.due.includes(w)) && !S.ws.slice(0, nd).includes('castle'),
      `the words due for revision come first — ${S.ws.slice(0, nd).join(', ')} — and today's miss (castle) is not one of them (due: ${S.due.join(', ')})`);
    ok(S.ws.every((w) => S.nw.includes(w)), 'every word came through nextWords, the one word door');
    ok(S.hash === '#/today', `the session has its own address (${S.hash})`);
    /* play: a miss by keyboard, a right by touch, and on */
    const leak = () => pg.evaluate(() => { const T = active().today, w = T.ws[T.i].w; return new RegExp('\\b' + w + '\\b', 'i').test(document.querySelector('#root').innerText); });
    const type = (t) => pg.evaluate((t) => { const i = document.querySelector('.td-in'); i.focus(); i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); }, t);
    const word = () => pg.evaluate(() => { const T = active().today; return { i: T.i, w: T.ws[T.i] && T.ws[T.i].w, st: T.st }; });
    const leaks = [];
    let W0 = await word(); if (await leak()) leaks.push(W0.w);
    await pg.keyboard.press('1'); const said = await pg.evaluate(() => window.__said.slice(-1)[0]);
    ok(said === W0.w, `the 1 key says the word (${said})`);
    await type(W0.w.slice(0, -1) + (W0.w.endsWith('e') ? 'a' : 'e')); await pg.keyboard.press('Enter');
    await until(pg, () => !!document.querySelector('.td-card .sb-miss'), null, 5000);
    await pg.waitForTimeout(2500);   // longer than any old auto-advance: a miss must still be up
    const held = await pg.evaluate(() => { const m = document.querySelector('.td-card .sb-miss'); const T = active().today; return { i: T.i, st: T.st, err: m && m.dataset.err, why: m && m.dataset.why, next: !!document.querySelector('.td-next') }; });
    ok(held.i === 0 && held.st === 'miss' && !!held.err && held.next, `a miss HOLDS with the letters and a tip matched to the mistake (data-err "${held.err}", family ${held.why}) until Next`);
    await pg.tap('.td-next'); await until(pg, () => active().today.i === 1 && active().today.st === 'ask', null, 5000);
    const plan = { 1: 'tap', 2: 'key', 3: 'tap', 4: 'miss', 5: 'key', 6: 'tap', 7: 'key', 8: 'tap', 9: 'key' };
    for (let i = 1; i < 10; i++) {
      if (i === 5) {   /* leave half way: Home says so, and the address resumes at this word */
        await pg.tap('.td-page .sb-phead-l button'); await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-today'), null, 8000);
        const mid = await pg.evaluate(() => { const e = document.querySelector('.sb-today [data-act="openToday"]'); return e ? e.getAttribute('aria-label') : ''; });
        ok(/5 of 10 done/.test(mid) && /Carry on/.test(mid), `left half way, Home's ribbon says so: "${mid}"`);
        await pg.evaluate(() => { location.hash = '#/today'; });
        ok(await until(pg, () => state.nav === 'today' && active().today.i === 5 && !!document.querySelector('.td-in'), null, 10000), '#/today resumes at the sixth word');
      }
      const Wd = await word(); if (i < 4 && await leak()) leaks.push(Wd.w);
      const how = plan[i];
      await type(how === 'miss' ? Wd.w + 'q' : Wd.w);
      if (how === 'tap') await pg.tap('.td-check'); else await pg.keyboard.press('Enter');
      if (how === 'miss') { await until(pg, () => !!document.querySelector('.td-next'), null, 5000); await pg.keyboard.press('Enter'); }
      await until(pg, (i) => { const T = active().today; return T.done === 1 || (T.i === i + 1 && T.st === 'ask'); }, i, 8000);
    }
    ok(!leaks.length, 'while a word is asked, nothing on screen spells it' + (leaks.length ? ' — ' + leaks.join(', ') : ''));
    ok(await until(pg, () => active().today.done === 1 && !!document.querySelector('.td-fin'), null, 8000), 'after the tenth word the session ENDS on a finish card');
    const F = await pg.evaluate(() => { const T = active().today, fin = document.querySelector('.td-fin');
      const lists = [...fin.querySelectorAll('.td-chips')].map((d) => [...d.querySelectorAll('.td-chip')].map((x) => x.textContent.trim()));
      return { right: T.res.filter((x) => x.ok).map((x) => x.w), wrong: T.res.filter((x) => !x.ok).map((x) => x.w), lists, missed: (active().missed || []).map((x) => x.w), mast: Object.keys(active().mast || {}) }; });
    ok(F.right.length === 8 && F.wrong.length === 2 && JSON.stringify(F.lists[0]) === JSON.stringify(F.right) && JSON.stringify(F.lists[1]) === JSON.stringify(F.wrong),
      `the finish card lists the ${F.right.length} words spelled right and the ${F.wrong.length} to practise (${F.wrong.join(', ')})`);
    ok(F.wrong.every((w) => F.missed.includes(w)) && F.right.every((w) => F.mast.includes(w.toLowerCase())), 'the misses are on the revision pile and every right word is on the mastery record');
    const r = await coins.since(pg, m0); const shown = await coins.cardCoins(pg, '.td-fin');
    ok(r.earned === 8 && r.events.every((e) => e === 'answer'), `the coins are the right answers and nothing else — ${r.earned} (${[...new Set(r.events)].join(', ')})`);
    coins.check(ok, "Today's ten", shown, r);
    await pg.evaluate(() => app.goHome()); await until(pg, () => !!document.querySelector('.sb-today'), null, 8000);
    const done = await pg.evaluate(() => document.querySelector('.sb-today [data-act="openToday"]').getAttribute('aria-label'));
    ok(/8 of 10 right/.test(done) && /See it/.test(done), `back on Home the ribbon says the day's ten are done: "${done}"`);
    const again = await pg.evaluate(async () => { const ws = active().today.ws.map((w) => w.w).join(); app.openToday(); await new Promise((r) => setTimeout(r, 300)); return { same: active().today.ws.map((w) => w.w).join() === ws, fin: !!document.querySelector('.td-fin') }; });
    ok(again.same && again.fin, 'opened again the same day, it is the same ten and the finish card — the day\'s session is built once');
    await ctx.close(); }

  /* ================= 2. a returning child on a desktop: above the two journey cards, one line ================= */
  { const { ctx, pg } = await open(KID(), { n: 'desktop', w: 1280, h: 860 });
    const R = await pg.evaluate(ribbon), prim = await pg.evaluate(filledPrimaries);
    const two = await pg.evaluate(() => { const a = document.querySelector('.sb-home-r2 > :nth-child(1)').getBoundingClientRect(), c = document.querySelector('.sb-home-r2 > :nth-child(2)').getBoundingClientRect(); return [Math.round(a.y), Math.round(c.y), Math.round(a.x), Math.round(c.x + c.width)]; });
    ok(!!R && R.r[3] <= 64 && R.r[1] < two[0] && two[0] === two[1] && Math.abs(R.r[0] - two[2]) <= 1 && Math.abs(R.r[0] + R.r[2] - two[3]) <= 1, `desktop: one line across both columns, above the two journey cards, which still share a top (${R && R.r.join(',')}; cards at y ${two[0]}/${two[1]})`);
    ok(!!R && /6 of 10|about 5 minutes/.test(R.text) === true && prim.length === 1 && /^goNext:/.test(prim[0]), `desktop: "${R && R.text}" — and Continue is the only filled button`);
    await ctx.close(); }

  /* ================= 3. a NEW child: the first-day card, one Start, where Continue goes ================= */
  { const today = new Date(); const ymd = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    const { ctx, pg } = await open(KID({ name: 'Mira', fr: ymd, daysPlayed: [], missed: [], trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } }), { n: 'phone', w: 390, h: 844, m: 1 });
    for (const mode of ['light', 'dusk']) {
      await pg.evaluate((m) => { state.mode = m; render(); }, mode); await until(pg, () => !!document.querySelector('.sb-today'), null, 5000);
      const R = await pg.evaluate(ribbon), prim = await pg.evaluate(filledPrimaries);
      ok(!!R && R.first && R.idx === 2 && R.btns.length === 1 && R.btns[0].act === 'goNext' && /^Start$/.test(R.btns[0].t) && R.btns[0].h >= 44 && /Day one, Mira/.test(R.text),
        `new child ${mode}: the first-day card, with ONE button — Start (${R && R.btns.map((x) => x.act + ':' + x.t).join(' | ')})`);
      ok(!!R && !/Today's ten · |Feed ·/.test(R.text) && !(await pg.evaluate(() => document.querySelector('.sb-content [data-act="openToday"]'))) && prim.length === 1 && /^goNext:/.test(prim[0]) && R.sw <= 390,
        `new child ${mode}: no Today ribbon on day one, Continue the only filled button, nothing past the edge (${prim.join(' | ')})`);
    }
    await pg.evaluate(() => { state.mode = 'light'; render(); });
    await pg.tap('.sb-content .sb-home-next'); await until(pg, () => state.nav !== 'home', null, 15000); await pg.waitForTimeout(600);
    const viaContinue = await pg.evaluate(() => location.hash);
    await pg.evaluate(() => app.goHome()); await until(pg, () => !!document.querySelector('.sb-first'), null, 8000);
    await pg.tap('.sb-first [data-act="goNext"]'); await until(pg, () => state.nav !== 'home', null, 15000); await pg.waitForTimeout(600);
    const viaStart = await pg.evaluate(() => location.hash);
    ok(viaStart === viaContinue && viaStart !== '#/home', `the first-day Start opens exactly where Continue does (${viaStart} = ${viaContinue})`);
    await ctx.close(); }

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
