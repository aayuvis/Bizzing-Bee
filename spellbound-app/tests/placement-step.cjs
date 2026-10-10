/* THE PLACEMENT STEP, WALKED BY A CHILD OF KNOWN LEVEL (road to 4.5, P1.7 / P1.8 / P1.22; owner, 10 Oct 2026).

   Owner decisions this test holds: onboarding keeps ONE decision per step; placement is its OWN step for the
   10+ bands, adaptive, twelve words, and it only RECOMMENDS a start (one region easier and one harder beside
   it) — the child chooses; it never changes the Atlas route, stops, order or unlocks, only where Continue
   starts; buddy and world stay separate steps, with the first free world preselected.

   A phone (390×844, touch). An 11–13 speller who can spell every region before the Storm of Elements (and
   nothing from there on) walks setup with real clicks and real typing:
     · the step is its own screen: first the words (one thing on screen — a box to spell into, the word
       spoken, never printed), then the choice (one thing — where to start); keyboard (Enter, R) and touch
       (the foot's "Next word", "Hear it again") both work;
     · it suggests the Storm of Elements, preselected, with the Roman Forum and the Root Kingdoms beside it;
       the child takes ONE EASIER (the Forum);
     · buddy is one Continue, world is one Continue (preselected), "Start spelling" goes straight INTO the
       Forum's first stop's lesson — the twelve words were the first words;
     · the child's record: a start line at u24 with the suggestion, nothing walked, no mastery, no coins;
     · the Atlas is unchanged: the road is the same, a stop before the start is open but not walked, the stop
       after the start is still locked until the start is walked — and when it is, it opens by the same rule;
     · Home's Continue lands on the Forum, "Stop 1"; the report card says where placement started them.
   Every new check was watched to fail with its fault put back (see CLAUDE.md, "Road to 4.5, P1").
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/placement-step.cjs                              */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2600);
  await pg.evaluate(() => { window._said = []; const s0 = window.say; window.say = function (w) { window._said.push(String(w)); try { return s0.apply(this, arguments); } catch (e) {} }; });
  const wallet0 = await pg.evaluate(() => { try { return BZ_WALLET.balance(); } catch (e) { return null; } });
  let taps = 0;
  const tap = async sel => { await pg.tap(sel); taps++; await pg.waitForTimeout(220); };
  await tap('[data-act="goSignup"]');
  await tap('[data-inp="onDraftName"]'); await pg.keyboard.type('Rhea');
  await tap('.sb-onb-next');
  await tap('[data-act="onDraftBand"][data-arg="11-13"]');
  await tap('.sb-onb-next');
  await pg.waitForFunction(() => !!(state.draft.pl && document.querySelector('[data-inp="placeType"]')), null, { timeout: 15000 });
  await pg.waitForTimeout(600);
  const w1 = await pg.evaluate(() => ({ key: onbKey(), steps: onbKeys().join(','), w: SB_PLACE.pick(state.draft.pl.s, SB_PLACE_DATA).w, said: window._said.slice(),
    picks: document.querySelectorAll('[data-act="placePick"]').length, boxes: document.querySelectorAll('.sb-onb-card input').length,
    card: (() => { const bits = [], root = document.querySelector('.sb-onb'); const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n; while ((n = tw.nextNode())) bits.push(n.data); root.querySelectorAll('*').forEach(el => { for (const a of el.attributes) bits.push(a.value); if (typeof el.value === 'string' && el.value) bits.push(el.value); }); return bits; })(), next: document.querySelector('.sb-onb-next').textContent.trim(),
    focus: document.activeElement && document.activeElement.getAttribute('data-inp') }));
  ok(w1.key === 'place' && w1.steps === 'name,age,place,buddy,world,goal', `placement is its own step, third of six for 11–13 (${w1.steps})`);
  ok(taps === 5 && w1.said.includes(w1.w), `the first word is spoken ${taps} taps from the landing page (P1.22) — "${w1.w}"`);
  ok(w1.boxes === 1 && w1.picks === 0 && w1.focus === 'placeType' && /Next word/.test(w1.next), 'the words screen asks one thing — a box to spell into, focused, with "Next word" as the step\'s one primary');
  ok(!w1.card.some(t => new RegExp('\\b' + w1.w + '\\b', 'i').test(t)), 'the word is never printed on the step — in no text node and no attribute (' + w1.card.length + ' read)');
  /* keyboard: R says it again (outside the box) */
  await pg.evaluate(() => document.activeElement && document.activeElement.blur());
  const n0 = await pg.evaluate(() => window._said.length);
  await pg.keyboard.press('r'); await pg.waitForTimeout(150);
  await pg.tap('[data-act="placeSay"]'); await pg.waitForTimeout(150);
  const n1 = await pg.evaluate(() => window._said.slice(-2));
  ok(n1.length === 2 && n1.every(x => x === w1.w) && (await pg.evaluate(() => window._said.length)) === n0 + 2, 'R on the keyboard and the "Hear it again" button both say the same word again');

  /* the bot: right for every region before the Storm (index 3), nothing from there on. Half the answers by Enter,
     half by tapping the foot's "Next word". */
  const K = 3; let enter = 0, tapped = 0;
  for (let i = 0; i < 20; i++) {
    const it = await pg.evaluate(() => { const p = state.draft.pl; return p && SB_PLACE.pick(p.s, SB_PLACE_DATA); });
    if (!it) break;
    await pg.fill('[data-inp="placeType"]', it.r < K ? it.w : 'not sure');
    if (i % 2) { await pg.press('[data-inp="placeType"]', 'Enter'); enter++; } else { await pg.tap('.sb-onb-next'); tapped++; }
    await pg.waitForTimeout(120);
  }
  const ch = await pg.evaluate(() => { const p = state.draft.pl;
    return { n: p.s.asked.length, rec: p.rec, pick: p.pick, key: onbKey(), boxes: document.querySelectorAll('.sb-onb-card input').length,
      opts: [...document.querySelectorAll('[data-act="placePick"]')].map(x => ({ r: +x.getAttribute('data-arg'), on: x.getAttribute('aria-pressed') === 'true', t: x.textContent.replace(/\s+/g, ' ').trim() })),
      next: document.querySelector('.sb-onb-next').textContent.trim(), coins: (state.children[0] || {}).coins }; });
  ok(ch.n === 12 && enter + tapped === 12, `exactly twelve words, ${enter} answered by Enter and ${tapped} by touch`);
  ok(ch.key === 'place' && ch.boxes === 0 && ch.opts.length === 3 && /Continue/.test(ch.next), 'then the same step shows one decision — where to start — and the primary becomes Continue');
  ok(ch.rec === K && ch.opts.map(o => o.r).join() === '2,3,4' && ch.opts.find(o => o.r === 3).on && /Suggested/.test(ch.opts[1].t) && /One easier/.test(ch.opts[0].t) && /One harder/.test(ch.opts[2].t),
    `a child of known level (the Storm, region ${K}) is suggested the Storm — preselected — with one easier and one harder beside it (${ch.opts.map(o => o.r + (o.on ? '*' : '')).join(' ')})`);
  await tap('[data-act="placePick"][data-arg="2"]');
  ok(await pg.evaluate(() => state.draft.pl.pick === 2 && document.querySelector('[data-act="placePick"][data-arg="2"]').getAttribute('aria-pressed') === 'true'), 'the child chooses: one easier (the Roman Forum)');
  /* the rest of setup: buddy one Continue, world one Continue (preselected), Start spelling */
  const t0 = taps;
  await tap('.sb-onb-next');
  const k1 = await pg.evaluate(() => onbKey());
  await tap('.sb-onb-next');
  const k2 = await pg.evaluate(() => ({ key: onbKey(), theme: state.draft.theme }));
  await tap('.sb-onb-next');
  const k3 = await pg.evaluate(() => onbKey());
  ok(k1 === 'buddy' && k2.key === 'world' && k3 === 'goal', 'buddy and world stay two separate steps');
  ok(k2.theme === 'spellbound', 'the first free world is preselected, so its step is one tap on Continue');
  await tap('.sb-onb-next');
  await pg.waitForFunction(() => state.screen === 'app' && state.nav === 'concepts' && !!state.conceptSel, null, { timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(400);
  const land = await pg.evaluate(() => { const c = state.children[0] || {}, t = c.trail || {};
    return { nav: state.nav, ret: state.trailReturn, fw: !!state.fw, start: t.start || null, done: Object.keys(t.done || {}).length + Object.keys(t.st || {}).filter(k => (t.st[k] || {}).p >= 70).length,
      mast: Object.keys(c.mast || {}).length, kids: state.children.length }; });
  ok(taps - t0 === 4, `after the choice, four taps finish setup (Continue · Continue · Continue · Start spelling)`);
  ok(land.nav === 'concepts' && land.ret === 'u24' && !land.fw, `"Start spelling" goes straight INTO the chosen stop's lesson (u24, the Forum's first) — no separate first word: the twelve were the first words (${land.nav} ${land.ret})`);
  ok(land.start && land.start.u === 'u24' && land.start.act === 'forum' && land.start.pick === 2 && land.start.rec === 3 && land.start.n === 12 && land.start.ok >= 1,
    'the child carries a start line at the Forum, with the suggestion (the Storm) and the run beside it: ' + JSON.stringify(land.start));
  const wallet1 = await pg.evaluate(() => { try { return BZ_WALLET.balance(); } catch (e) { return null; } });
  ok(land.done === 0 && land.mast === 0 && wallet1 === wallet0, `placement writes no walked stop (${land.done}), no mastery (${land.mast}) and no coins (${wallet0} → ${wallet1}) — a measurement is not practice`);

  /* the Atlas is unchanged — only where Continue starts */
  const at = await pg.evaluate(() => new Promise(res => SB_LAZY.need('atlas', () => {
    const before = SB_TRAIL_ROAD.nodes(SB_TRAIL, 'honey', 1).map(n => n.kind === 'unit' ? n.u.id : n.id).join();
    const ns = SB_NEXT_STEP();
    const out = { arg: ns.arg, act: ns.actId, stop: ns.stop, done: ns.done, road: before.length };
    app.trailUnit('u5'); out.early = state.trailView === 'unit' && state.trailUnit === 'u5';
    app.trailUnit('u25'); out.after = state.trailUnit === 'u25' && state.trailView === 'unit';
    out.u5passed = !!(((active().trail || {}).done || {}).u5);
    /* walk the start stop by the ordinary rule: Practice at 70% */
    SB_TRAIL_PRACTICED('u24', 9, 10);
    app.trailUnit('u25'); out.afterWalk = state.trailUnit === 'u25' && state.trailView === 'unit';
    out.next2 = SB_NEXT_STEP().arg;
    out.roadAfter = SB_TRAIL_ROAD.nodes(SB_TRAIL, 'honey', 1).map(n => n.kind === 'unit' ? n.u.id : n.id).join() === before;
    res(out); })));
  ok(at.arg === 'u24' && at.act === 'forum' && at.stop === 1 && at.done === 0, `Continue starts at the chosen stop — the Forum, stop 1, nothing counted as walked (${at.arg}, stop ${at.stop}, done ${at.done})`);
  ok(at.early && !at.u5passed, 'a stop before the start line is open to walk back to, and is not marked walked');
  ok(!at.after, 'the stop after the start is still locked until the start is walked');
  ok(at.afterWalk && at.next2 === 'u25' && at.roadAfter, 'walked by the ordinary rule (70% in Practice), the start opens the next stop; the road itself never changed');

  /* Home's Continue goes to the Forum */
  await pg.evaluate(() => app.setNav('home')); await pg.waitForTimeout(500);
  await pg.tap('.sb-content [data-act="goNext"]'); await pg.waitForTimeout(2000);
  const hc = await pg.evaluate(() => ({ nav: state.nav, act: state.trailAct, view: state.trailView, pins: [...document.querySelectorAll('.atlas-stop.on')].map(x => x.getAttribute('aria-label')) }));
  ok(hc.nav === 'trail' && hc.act === 'forum' && hc.view === 'act', `Home's Continue opens the Atlas on the Forum (${hc.act}, ${hc.pins.join()})`);

  /* the report card (behind the PIN) says where placement started this child */
  await pg.evaluate(() => { state.progTab = 'parent'; set({ nav: 'progress', screen: 'app' }); }); await pg.waitForTimeout(400);
  const rc = await pg.evaluate(() => ((document.querySelector('.sb-rc-placed') || {}).textContent || '').replace(/\s+/g, ' '));
  ok(/Started at The Roman Forum after placement/.test(rc) && /it suggested The Storm of Elements/.test(rc), 'the grown-ups\' report card says where placement started them, and what it suggested: "' + rc.slice(0, 120) + '"');
  await ctx.close();

  /* adding a SECOND child: during setup the first child is still the active one, so a placement that paid a coin
     or wrote a mastery record would land on HER. It must write nothing to anyone. */
  {
    const ctx3 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await ctx3.addInitScript(() => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
      children: [{ name: 'Asha', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, lists: { journey: { xp: 5 } }, activeList: 'journey', mast: { cat: { b: 1, due: 1, d: 1, ok: 1, n: 1 } } }] }));
      localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } });
    const pg3 = await ctx3.newPage(); pg3.on('pageerror', e => errs.push('second child: ' + e.message));
    await pg3.goto(URL); await pg3.waitForTimeout(2600);
    const before = await pg3.evaluate(() => ({ mast: JSON.stringify(state.children[0].mast || {}), coins: state.children[0].coins | 0, ledger: (() => { try { return BZ_WALLET.ledger().length; } catch (e) { return -1; } })() }));
    await pg3.evaluate(() => { app.addChild(); state.draft.name = 'Ravi'; render(); });
    await pg3.waitForTimeout(200);
    await pg3.tap('.sb-onb-next'); await pg3.waitForTimeout(200);
    await pg3.tap('[data-act="onDraftBand"][data-arg="14-18"]'); await pg3.waitForTimeout(150);
    await pg3.tap('.sb-onb-next');
    await pg3.waitForFunction(() => !!(state.draft.pl && document.querySelector('[data-inp="placeType"]')), null, { timeout: 15000 });
    for (let i = 0; i < 14; i++) {
      const it = await pg3.evaluate(() => { const p = state.draft.pl; return p && SB_PLACE.pick(p.s, SB_PLACE_DATA); });
      if (!it) break;
      await pg3.fill('[data-inp="placeType"]', it.r < 5 ? it.w : 'x'); await pg3.press('[data-inp="placeType"]', 'Enter'); await pg3.waitForTimeout(100);
    }
    const mid = await pg3.evaluate(() => ({ active: (active() || {}).name, mast: JSON.stringify(state.children[0].mast || {}), coins: state.children[0].coins | 0, ledger: (() => { try { return BZ_WALLET.ledger().length; } catch (e) { return -1; } })(), rec: state.draft.pl.rec }));
    for (let i = 0; i < 6 && await pg3.evaluate(() => state.screen === 'onboarding'); i++) { await pg3.tap('.sb-onb-next'); await pg3.waitForTimeout(220); }
    const after = await pg3.evaluate(() => ({ n: state.children.length, ravi: state.children[1] && { start: (state.children[1].trail || {}).start, mast: Object.keys(state.children[1].mast || {}).length },
      asha: { mast: JSON.stringify(state.children[0].mast || {}), start: (state.children[0].trail || {}).start || null } }));
    ok(mid.active === 'Asha' && mid.mast === before.mast && mid.coins === before.coins && mid.ledger === before.ledger,
      `adding a second child, twelve placement words (suggestion: region ${mid.rec}) write nothing to the child who is active meanwhile — no mastery, no coin, no wallet line`);
    ok(after.n === 2 && after.ravi && after.ravi.start && after.ravi.mast === 0 && after.asha.mast === before.mast && !after.asha.start,
      'the start line goes on the new child only; neither child gains a mastery record from placement');
    await ctx3.close();
  }

  /* an 8–10 speller never meets the step */
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
  const pg2 = await ctx2.newPage(); pg2.on('pageerror', e => errs.push(e.message));
  await pg2.goto(URL); await pg2.waitForTimeout(2400);
  await pg2.tap('[data-act="goSignup"]'); await pg2.waitForTimeout(200);
  await pg2.fill('[data-inp="onDraftName"]', 'Ravi');
  const seen = [];
  for (let i = 0; i < 6 && await pg2.evaluate(() => state.screen === 'onboarding'); i++) { seen.push(await pg2.evaluate(() => onbKey())); await pg2.tap('.sb-onb-next'); await pg2.waitForTimeout(220); }
  ok(seen.join() === 'name,age,buddy,world,goal' && await pg2.evaluate(() => !((state.children[0] || {}).trail || {}).start), `an 8–10 speller walks the five steps and no placement (${seen.join(' → ')})`);
  await ctx2.close();

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
