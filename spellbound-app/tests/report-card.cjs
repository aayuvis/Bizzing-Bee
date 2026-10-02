/* THE GROWN-UPS' REPORT SAYS WHAT THE CHILD CAN NOW DO, FROM EVIDENCE (FIX-BEE M2, family
   standard §7). Three measures, the same in every Bizzing app: Time (active minutes from the
   family feed) · Progress (steps along the path) · Mastery (from the evidence record c.mast).

   A child is seeded with a hand-made evidence record covering every state a word can be in —
   retained, carried over from before spacing, due for a re-check, slipped since mastered,
   learning, never right — and an activity feed holding minutes that must and must not count
   (another app, another child, too long ago, a milestone row). The report's numbers are
   checked three ways: against the expected values, against an independent recount of the same
   record done here in the test, and against each other (mastered = retained + carried, the
   families add up to retained, nothing slipped is also mastered). Then the same numbers must
   appear on the Parent Zone card and on the printed weekly report.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/report-card.cjs                   */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 900 } });
  await ctx.addInitScript(() => { try { if (localStorage.getItem('sb_t_seeded')) return;
    const now = Date.now(), D = 864e5; const d0 = new Date(); const T = Math.floor((d0.getTime() - d0.getTimezoneOffset() * 60000) / D);
    const ymd = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    const mast = {
      harbour:   { b: 3, due: T + 5, d: T - 2, ok: 3, n: 3, mt: now - 2 * D },
      committee: { b: 2, due: T - 1, d: T - 4, ok: 2, n: 2, mt: now - 20 * D },
      meadow:    { b: 4, due: T + 10, d: T - 1, ok: 4, n: 4, mt: now - 3 * D },
      knight:    { b: 2, due: T, d: T - 1, ok: 1, n: 1, leg: 1 },
      rhythm:    { b: 1, due: T, d: T, ok: 3, n: 5, lp: 1, sl: now - D, miss: 2, mt: now - 9 * D },
      island:    { b: 1, due: T + 1, d: T, ok: 1, n: 1 },
      necessary: { b: 0, due: T, d: T, ok: 0, n: 3, miss: 3 },
    };
    const kid = (name, m) => ({ name, age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 0, lists: { default: { xp: 3 } }, activeList: 'default', missed: [], mast: m });
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234', children: [kid('Ahana', mast), kid('Ravi', {})] }));
    localStorage.setItem('bizzing.activity', JSON.stringify({ v: 1, s: [
      { a: 'bee', d: ymd(now), t: 600, m: 12, who: 'Ahana' },
      { a: 'bee', d: ymd(now - D), t: 500, m: 8, who: 'ahana ' },           // same child, case and space-blind
      { a: 'maths', d: ymd(now), t: 700, m: 30, who: 'Ahana' },             // another app
      { a: 'bee', d: ymd(now), t: 800, m: 40, who: 'Ravi' },                // another child
      { a: 'bee', d: ymd(now - 10 * D), t: 600, m: 50, who: 'Ahana' },     // too long ago
      { a: 'bee', d: ymd(now), t: 610, m: 0, ev: 'stop', label: 'Meadow 1', who: 'Ahana' } ] }));  // a milestone, not minutes
    localStorage.setItem('sb_t_seeded', '1'); } catch (e) {} });
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2800);

  const r = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms)); const o = {};
    state.screen = 'app'; state.activeIdx = 0; render();
    const R = SB_REPORT_CARD(active()); o.R = JSON.parse(JSON.stringify(R));
    /* an independent recount of the same record */
    const M = active().mast; const T = mastDay(); let ret = 0, car = 0, due = 0, sl = [];
    for (const k in M) { const x = M[k]; if (x.b >= 2) { if (x.leg) car++; else ret++; if (T >= x.due) due++; } else if (x.lp) sl.push(k); }
    o.indep = { ret, car, due, sl };
    o.famSum = R.mastery.families.reduce((t, f) => t + f.n, 0);
    o.trapWordsMastered = R.mastery.traps.some(t => t.words.some(w => M[w] && M[w].b >= 2));
    /* the Parent Zone card, behind the PIN */
    app.setNav('parent'); for (const k of '1234') app.pinKey(k); await W(300);
    const card = document.querySelector('.sb-report-card'); o.card = card ? card.innerText : '';
    o.cardOrder = card ? [...card.querySelectorAll('.sb-rc-box')].map(x => x.innerText.split('\n')[0].trim().toUpperCase()) : [];
    return o;
  });
  const m = r.R.mastery;
  ok(m.retained === 3 && r.indep.ret === 3, 'retained = 3: mastered on two different days, carried-over words excluded');
  ok(m.carried === 1 && m.mastered === m.retained + m.carried, 'carried-over words are counted separately, and mastered = retained + carried');
  ok(m.due === 2 && m.due === r.indep.due && m.due <= m.mastered, 'due for a re-check = 2, never more than mastered');
  ok(JSON.stringify(m.slipped.map(x => x.w)) === JSON.stringify(r.indep.sl) && m.slipped.length === 1 && m.slipped[0].w === 'rhythm', 'slipped since mastered = the word that lapsed, and nothing that is still mastered');
  ok(m.newThisWeek === 2, 'mastered this week = 2 (the one mastered 20 days ago does not count)');
  ok(m.learning === 2, 'spelled right once, waiting for another day = 2');
  ok(r.famSum === m.retained, 'the concept families add up to exactly the retained count');
  ok(m.traps.length >= 1 && !r.trapWordsMastered, 'traps to help with come from real misses, and never list a mastered word');
  ok(r.R.time.feed && r.R.time.minutes === 20 && r.R.time.days === 2, 'time = 20 active minutes on 2 days — only Bee, only this child, only 7 days, no milestone rows');
  ok(r.cardOrder.join('|') === 'TIME|PROGRESS|MASTERY', 'the Parent Zone card is laid out Time · Progress · Mastery');
  ok(/3 words mastered/.test(r.card) && /20 active minutes/.test(r.card) && /2 due for a re-check/.test(r.card) && /1 slipped since mastered/.test(r.card),
    'the card shows the same numbers: 3 mastered, 20 minutes, 2 due, 1 slipped');
  ok(/1 more was marked before mastery needed a second day/.test(r.card), 'and says plainly that 1 carried-over word is not counted until re-checked');

  /* the printed weekly report reads the same record */
  const [pop] = await Promise.all([pg.waitForEvent('popup', { timeout: 8000 }).catch(() => null), pg.evaluate(() => app.printReport())]);
  let printed = ''; if (pop) { await pop.waitForTimeout(400); printed = await pop.evaluate(() => document.body.innerText).catch(() => ''); await pop.close().catch(() => {}); }
  ok(/3\s*\n?\s*Mastered on two days/i.test(printed) && /2\s*\n?\s*Due for a re-check/i.test(printed) && /20\s*\n?\s*Active minutes/i.test(printed),
    'the printed weekly report carries the same report card (3 mastered, 2 due, 20 minutes)');
  ok(/3\s*\n?\s*Words mastered/i.test(printed), 'and its "Words mastered" is the same evidence count, not the old one-right-answer tally');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
