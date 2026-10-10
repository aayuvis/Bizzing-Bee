/* YOU ARE HERE — Home shows the child where they are on the World Atlas — @check

   Owner, 4 Oct 2026: "HOME screen should take to world atlas and show kids where they are
   instead of this" (a "Next on your journey" card and a "Your training journey" card). Home's one
   Continue card is now a window onto the World Atlas (app3 homeHereCard, trail.js SB_TRAIL_HERE):
     · it names the child's REAL region and stop — the region SB_TRAIL_NEXT names, and "Stop n of
       N" exactly as that region's own board counts it (this tier's stops AND checkpoints; Home once
       said "stop 3 of 11" where the board said "Stop 3 of 13"), with the stop's title;
     · the child's avatar stands on THEIR region, at the very point the Atlas overview pins it,
       inside the visible window, on a phone and a desktop, in light, white and dusk;
     · the regions already walked are starred, as the overview stars them;
     · the rail beside Continue is the region's own stops: as many as the board has, the walked
       ones filled, the one they are on marked;
     · every stop of the tier walked: the card says so, and Continue opens the Atlas overview with
       an honest note;
     · the picture is the overview's painting — never a region panorama (0.6–1MB each), which
       would blow Home's first-screen budget (tests/first-load.cjs).
   Added 10 Oct 2026 (owner — the road to 4.5, P0.16 and P0.2):
     · beside Continue, a small "mastered this week" chip: words mastered ON EVIDENCE since Monday (c.mast — right on
       two separate days), so 0 says 0; a word mastered weeks ago, or a carried-over legacy mark, does not count;
     · the second journey card beside it: the Spelling Gym while nothing is due (and analogies are gated), the
       MISTAKES DECK once a word missed on an earlier day is due — naming that word and not one missed today — and a
       tap opens Your Revisions.
     Proved by breaking (10 Oct 2026): the chip fed weekProgress().stops instead of .words → the "one this week" check
     fails; homeDueWords counting today's misses → the deck check fails (2 words, "rhythm" named).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/home-here.cjs                         */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey',
  trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } };

/* in the page: walk the first `n` nodes of tier 1 (stops and checkpoints, in road order); -1 = all */
function walk(n) {
  const c = active(), T = SB_TRAIL, per = T.rules.checkpointEvery || 4; let k = 0;
  c.trail = { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} };
  for (const act of T.honey.acts) { let m = 0;
    for (const id of act.units) { const u = T.honey.units.find(x => x.id === id); if (!(u.laps || [u.lap || 1]).includes(1)) continue;
      if (n < 0 || k < n) c.trail.done[id] = { 1: 90 }; k++;
      if (++m % per === 0) { if (n < 0 || k < n) c.trail.chk['1:' + act.id + ':' + m] = 90; k++; } } }
  state.trailCourse = 'honey'; save(); app.setNav('home');
}
/* in the page: what Home's card says and draws */
function card() {
  const el = document.querySelector('.sb-content .sb-here[data-act="goNext"]'); if (!el) return null;
  const map = el.querySelector('.sb-here-map').getBoundingClientRect();
  const me = el.querySelector('.sb-here-me'), av = el.querySelector('.sb-here-av'), img = el.querySelector('.sb-here-board>img');
  const ar = av && av.getBoundingClientRect(), mr = me && me.getBoundingClientRect();
  const inside = r => r && r.left >= map.left - 1 && r.right <= map.right + 1 && r.top >= map.top - 1 && r.bottom <= map.bottom + 1;
  const rail = [...el.querySelectorAll('.sb-here-rail>i')].map(i => i.className === 'd' ? 2 : i.className === 'n' ? 1 : 0);
  return { region: (el.querySelector('.sb-here-region') || {}).textContent, line: ((el.querySelector('.sb-here-stop') || {}).textContent || '').replace(/\s+/g, ' ').trim(),
    x: me && parseFloat(me.style.left), y: me && parseFloat(me.style.top), art: !!(av && av.querySelector('img,svg')),
    avIn: inside(ar) && ar.width > 20, pinIn: inside(mr), img: img && img.getAttribute('src'),
    stars: el.querySelectorAll('.sb-here-pin.is-done').length, rail, label: ((el.querySelector('.sb-continue') || {}).textContent || '').trim() };
}
/* in the page: the same facts, read off the Atlas itself */
async function atlas(pg) {
  const ns = await pg.evaluate(() => SB_TRAIL_NEXT());
  await pg.evaluate(() => app.openTrail()); await pg.waitForTimeout(500);
  const ov = await pg.evaluate(id => { const p = document.querySelector('.atlas-board .atlas-pin[data-arg="honey|' + id + '"]');
    return { x: p && parseFloat(p.style.left), y: p && parseFloat(p.style.top), stars: document.querySelectorAll('.aw-honey .atlas-board .atlas-pin.done').length }; }, ns.actId);
  let board = null;
  if (!ns.allDone) {
    await pg.evaluate(id => app.trailAct('honey|' + id), ns.actId); await pg.waitForTimeout(700);
    board = await pg.evaluate(() => { const st = [...document.querySelectorAll('.atlas-stop')]; const now = document.querySelector('.atlas-stop.now');
      return { now: now && now.getAttribute('aria-label'), n: st.length ? +(/of (\d+)/.exec(st[0].getAttribute('aria-label')) || [])[1] : 0,
        done: st.filter(b => /✓/.test(b.textContent)).length }; });
  }
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(400);
  return { ns, ov, board };
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  for (const vp of [{ w: 390, h: 844, n: 'phone' }, { w: 1280, h: 860, n: 'desktop' }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.n === 'phone' });
    await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ' ' + e.message));
    await pg.goto(URL); await pg.waitForTimeout(2500);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('atlas', r)));
    /* a new speller · two stops in · well along (the Storm) · near the end (the Sprints) */
    for (const [who, n] of [['new', 0], ['started', 2], ['storm', 52], ['sprints', 98]]) {
      await pg.evaluate(walk, n); await pg.waitForTimeout(500);
      const A = await atlas(pg);
      const tag = vp.n + '/' + who;
      for (const mode of (who === 'storm' ? ['light', 'white', 'dusk'] : ['light'])) {
        await pg.evaluate(m => { state.mode = m; render(); }, mode); await pg.waitForTimeout(350);
        const C = await pg.evaluate(card);
        if (!C) { ok(false, `${tag} ${mode}: the "You are here" card is on Home`); continue; }
        if (mode === 'light') {
          const want = `Stop ${A.ns.stop} of ${A.ns.stops} · ${A.ns.title}`;
          ok(C.region === A.ns.act && C.line === want, `${tag}: the card names the real region and stop — "${C.region}", "${C.line}"` + (C.line === want ? '' : ` (want "${want}")`));
          ok(A.board && A.board.now === `Stop ${A.ns.stop} of ${A.ns.stops}` && A.board.n === A.ns.stops, `${tag}: "Stop ${A.ns.stop} of ${A.ns.stops}" is the region board's own count (${A.board && A.board.now}, ${A.board && A.board.n} on the board)`);
          ok(Math.abs(C.x - A.ov.x) < 0.01 && Math.abs(C.y - A.ov.y) < 0.01, `${tag}: the avatar stands where the Atlas pins ${A.ns.actId} (${C.x},${C.y} = ${A.ov.x},${A.ov.y})`);
          ok(C.stars === A.ov.stars, `${tag}: the regions already walked are starred, as on the Atlas (${C.stars} = ${A.ov.stars})`);
          const railOk = C.rail.length === A.ns.stops && C.rail.filter(v => v === 2).length === A.ns.stopsDone && C.rail.indexOf(1) === A.ns.stop - 1 && C.rail.filter(v => v === 1).length === 1;
          ok(railOk, `${tag}: the rail is the region's ${A.ns.stops} stops, ${A.ns.stopsDone} walked, stop ${A.ns.stop} marked (${C.rail.join('')})`);
          ok(C.label === (A.ns.done ? 'Continue' : 'Start'), `${tag}: the one button reads "${C.label}"`);
          ok(C.img === 'app-art/atlas-map.jpg', `${tag}: the picture is the World Atlas painting, not a region panorama (${C.img})`);
        }
        ok(C.art && C.avIn && C.pinIn, `${tag} ${mode}: the child's avatar is drawn on their pin, inside the window`);
      }
      await pg.evaluate(() => { state.mode = 'light'; render(); });
    }
    /* every stop of the tier walked */
    await pg.evaluate(walk, -1); await pg.waitForTimeout(500);
    const E = await pg.evaluate(card);
    ok(!!E && /Tier 1 complete/.test(E.line) && E.rail.length > 0 && E.rail.every(v => v === 2) && E.avIn, `${vp.n}/all walked: the card says so ("${E && E.line}") and the avatar stands at the end of the road`);
    await pg.click('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(1500);
    const end = await pg.evaluate(() => ({ nav: state.nav, view: state.trailView || 'map', h: location.hash, note: [...document.querySelectorAll('body *')].some(e => e.children.length === 0 && /Every stop on Tier 1 is walked/.test(e.textContent)) }));
    ok(end.nav === 'trail' && end.view === 'map' && end.h === '#/atlas' && end.note, `${vp.n}/all walked: Continue opens the Atlas overview with an honest "all done" note (${end.h}, note: ${end.note})`);
    /* mastered this week, and the second journey card (owner, 10 Oct 2026) */
    await pg.evaluate(walk, 2); await pg.waitForTimeout(400);
    const H = await pg.evaluate(async () => { const Wt = ms => new Promise(r => setTimeout(r, ms));
      const c = active(); c.mast = {}; c.missed = []; save(); app.setNav('home'); await Wt(300);
      const chip = () => { const e = document.querySelector('.sb-content .sb-here .sb-home-mast'); return e ? { t: e.textContent.trim(), n: +e.getAttribute('data-week-mastered'), inStrip: !!e.closest('.sb-home-where') } : null; };
      const second = () => { const e = document.querySelector('.sb-content .sb-home-r2 > :nth-child(2)'); return e ? { kind: e.getAttribute('data-kind'), act: e.getAttribute('data-act'), text: e.innerText.replace(/\s+/g, ' ') } : null; };
      const zero = chip(), s0 = second();
      const now = Date.now(), today = mastDay();
      c.mast = { necessary: { b: 2, d: today, due: today + 3, ok: 2, n: 2, mt: now }, separate: { b: 2, d: today - 30, due: today + 3, ok: 2, n: 2, mt: now - 40 * 864e5 },
        rhythm: { b: 2, d: today, due: today, ok: 1, n: 1, leg: 1 } };
      save(); render(); await Wt(200);
      const one = chip();
      c.missed = [{ w: 'necessary', ts: now - 3 * 864e5 }, { w: 'rhythm', ts: now - 60e3 }]; save(); render(); await Wt(200);
      const s1 = second();
      document.querySelector('.sb-content .sb-home-r2 > :nth-child(2)').click(); await Wt(400);
      const went = state.nav; c.mast = {}; c.missed = []; save(); app.setNav('home');
      return { zero, one, s0, s1, went }; });
    ok(H.zero && H.zero.inStrip && H.zero.n === 0 && H.zero.t === '0 words mastered this week', `${vp.n}: beside Continue, a "mastered this week" chip that says nought honestly ("${H.zero && H.zero.t}")`);
    ok(H.one && H.one.n === 1 && H.one.t === '1 word mastered this week', `${vp.n}: a word mastered this week on evidence counts; one mastered 40 days ago and a carried-over mark do not ("${H.one && H.one.t}")`);
    ok(H.s0 && H.s0.kind === 'gym' && H.s0.act === 'openGym', `${vp.n}: with nothing due (analogies gated) the second journey card is the Spelling Gym (${H.s0 && H.s0.kind})`);
    ok(H.s1 && H.s1.kind === 'deck' && H.s1.act === 'openRevisions' && /1 word ready to revise/.test(H.s1.text) && /necessary/.test(H.s1.text) && !/rhythm/.test(H.s1.text) && H.went === 'revisions',
      `${vp.n}: a word missed on an earlier day turns it into the mistakes deck — that word, not today's miss — and a tap opens Your Revisions (${H.s1 && H.s1.text.slice(0, 70)} → ${H.went})`);
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
