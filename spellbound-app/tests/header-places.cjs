/* THE HEADER SEARCH FINDS PLACES, NOT ONLY WORDS (audit v4 C4)

   The bar returned dictionary words only: "meadow" found a gloss for hay, and "grand prix",
   "roman forum" and "quotes" found nothing. It now also offers Atlas regions and stops, arcade
   games, concept chapters and Library tools (app3 `suggestPlaces` / `headerSuggest`), and a
   picked place opens through the opener a TAP on that place uses. This holds, on a desktop
   with the keyboard (↓ / Enter) and on a touch phone with a tap:
     · each of the four queries the audit typed offers its place, beside the words;
     · picking it lands where the place's own tile / pin lands — and a lock stands: a stop past
       the frontier stays shut, a plan-locked tool asks for the grown-up PIN exactly as its
       Library tile does, a concept chapter goes where its route sends it;
     · the word results are still there, and the place half costs well under a millisecond a
       keystroke (it runs on every key, on every screen).
   Road to 4.5, P3.27 (13 Oct 2026): it also finds what is INSIDE a concept chapter (a card's heading — opening its
   chapter through the chapter's route) and the medals (opening the Medals shelf as the drawer's row does), ranked after
   every place. Proved by breaking (13 Oct 2026): the contents taken out of the index → the headings check fails; a medal
   opening Home → the Medals check fails (phone and desktop); the contents ranked with the places (no `sec`) → "places
   rank before" fails (that check FINDS its query — one a heading outmatches — after "meadow" was shown to hold nothing).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/header-places.cjs */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = (tier) => ({ name: 'T', avatar: 'bee', coins: 50, pow: {}, age: 9, ageBand: '8-10', tier,
  lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
  trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 88 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } });
const SNAP = () => ({ nav: state.nav, view: state.trailView || null, act: state.trailAct || null, unit: state.trailUnit || null,
  concept: (state.conceptSel && state.conceptSel.title) || null, pin: !!state.pinDlg, tiers: !!state.showTiers,
  arcade: !!document.querySelector('.arc-menu,.arc-play'), hq: state.hq || '', coll: state.collTab || null });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const errs = [];
  for (const vp of [{ n: 'desktop', width: 1180, height: 900 }, { n: 'phone', width: 390, height: 844, touch: true }]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch });
    const pg = await ctx.newPage();
    pg.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await pg.goto(URL);
    await pg.waitForFunction(() => typeof state !== 'undefined' && typeof app !== 'undefined', null, { timeout: 30000 });
    const reset = (tier) => pg.evaluate(k => { try { arcadeClose(); } catch (e) {}
      state.children = [k]; state.activeIdx = 0; state.screen = 'app'; state.pinDlg = null; state.showTiers = false; state.showPaywall = false;
      state.conceptSel = null; state.trailAct = null; state.trailUnit = null; state.trailView = 'map'; state.hq = ''; state.hqSel = -1; app.setNav('home'); }, KID(tier));
    await reset('free');
    await pg.evaluate(() => new Promise(r => SB_LAZY.need(['atlas', 'words'], r)));
    await pg.waitForTimeout(400);

    const type = async q => {
      if (vp.touch) await pg.tap('.sb-hsearch input'); else await pg.click('.sb-hsearch input');
      await pg.fill('.sb-hsearch input', ''); await pg.keyboard.type(q, { delay: 15 }); await pg.waitForTimeout(250);
      return pg.evaluate(() => [...document.querySelectorAll('.sb-hsug-row')].map(e => ({ place: e.classList.contains('sb-hsug-place'),
        w: (e.querySelector('.sb-hsug-w') || {}).textContent || '', d: (e.querySelector('.sb-hsug-d') || {}).textContent || '' })));
    };
    /* pick the row that names `title`: ↓ to it and Enter on a desktop, a tap on a phone */
    const pick = async (rows, title) => {
      const i = rows.findIndex(r => r.place && r.w === title); if (i < 0) return false;
      if (vp.touch) await pg.tap(`.sb-hsug-row:nth-child(${i + 1})`);
      else { for (let k = 0; k <= i; k++) { await pg.keyboard.press('ArrowDown'); await pg.waitForTimeout(60); }
        const on = await pg.evaluate(() => { const e = document.querySelector('.sb-hsug-row.on .sb-hsug-w'); return e ? e.textContent : ''; });
        if (on !== title) { ok(false, `${vp.n}: ↓ did not reach "${title}" (highlighted "${on}")`); return false; }
        await pg.keyboard.press('Enter'); }
      await pg.waitForTimeout(900);
      return true;
    };

    // the four the audit typed
    const CASES = [
      ['meadow', 'The Meadow', 'Word Atlas region', s => s.nav === 'trail' && s.view === 'act' && s.act === 'meadow'],
      ['roman forum', 'The Roman Forum', 'Word Atlas region', s => s.nav === 'trail' && s.view === 'act' && s.act === 'forum'],
      ['grand prix', 'Bee Grand Prix', 'Arcade game', s => s.arcade],
      ['quotes', 'Quotes & Poems', 'Library', s => s.nav !== 'quotes' && (s.pin || s.tiers)],   // a free child: the plan lock + PIN, as the tile does
    ];
    for (const [q, title, kind, landed] of CASES) {
      await reset('free');
      const rows = await type(q);
      const row = rows.find(r => r.place && r.w === title);
      ok(!!row && row.d === kind, `${vp.n}: "${q}" offers ${title} (${kind}) — [${rows.map(r => (r.place ? '◇' : '') + r.w).join(', ')}]`);
      if (q === 'meadow') ok(rows.some(r => !r.place && /^meadow/i.test(r.w)), `${vp.n}: "meadow" still offers the word itself`);
      ok(rows.length <= 7, `${vp.n}: "${q}" — ${rows.length} rows (seven at most)`);
      if (!row) continue;
      await pick(rows, title);
      const s = await pg.evaluate(SNAP);
      ok(landed(s) && !s.hq, `${vp.n}: picking ${title} lands where its tap does — ${JSON.stringify(s)}`);
    }

    // a plan that includes the tool: the same pick opens it
    await reset('regional');
    { const rows = await type('quotes'); await pick(rows, 'Quotes & Poems'); const s = await pg.evaluate(SNAP);
      ok(s.nav === 'quotes' && !s.pin, `${vp.n}: with the plan, Quotes & Poems opens — nav=${s.nav}`); }

    // the same as the Library tile's tap, for the free child
    await reset('free');
    await pg.evaluate(() => app.setNav('explore')); await pg.waitForTimeout(300);
    await pg.evaluate(() => { const t = [...document.querySelectorAll('.lib-tile')].find(e => /Quotes/.test(e.textContent)); t.click(); });
    await pg.waitForTimeout(500);
    const tapS = await pg.evaluate(SNAP);
    await reset('free');
    { const rows = await type('quotes'); await pick(rows, 'Quotes & Poems'); }
    const srchS = await pg.evaluate(SNAP);
    ok((tapS.nav === 'quotes') === (srchS.nav === 'quotes') && srchS.pin === tapS.pin && srchS.tiers === tapS.tiers,
      `${vp.n}: the free child's search pick and tile tap meet the same lock — tile ${JSON.stringify({ pin: tapS.pin, tiers: tapS.tiers })}, search ${JSON.stringify({ pin: srchS.pin, tiers: srchS.tiers })}`);

    // a stop past the frontier stays shut
    await reset('free');
    const far = await pg.evaluate(() => { const a = SB_TRAIL.honey.acts.find(x => x.id === 'stage');
      const u = a.units.map(id => SB_TRAIL.honey.units.find(x => x.id === id)).find(u => (u.laps || [u.lap || 1]).includes(1));
      const t = String(u.title); const cut = t.indexOf(' — '); return { id: u.id, title: cut > 0 ? t.slice(0, cut) : t }; });
    { const rows = await type(far.title.slice(0, 18)); const hit = rows.find(r => r.place && r.w === far.title);
      ok(!!hit && hit.d === 'Word Atlas stop', `${vp.n}: a stop is found by its name — "${far.title}"`);
      if (hit) { await pick(rows, far.title); const s = await pg.evaluate(SNAP);
        ok(!(s.view === 'unit' && s.unit === far.id), `${vp.n}: a stop past the frontier stays shut from search — ${JSON.stringify(s)}`); } }

    // a concept chapter goes where its route goes
    await reset('regional');
    const cc = await pg.evaluate(() => new Promise(r => SB_LAZY.need('concepts', () => { loadConcepts(); _placeIdx = null;
      const P = placeIndex().filter(p => p.kind === 'Concept chapter'); const p = P[Math.floor(P.length / 3)]; r({ t: p.t, i: +p.go.split('|')[1] }); })));
    await pg.evaluate(i => SB_SHELL.applyRoute('concepts/' + i), cc.i); await pg.waitForTimeout(700);
    const routeS = await pg.evaluate(SNAP);
    await reset('regional');
    { const rows = await type(cc.t.slice(0, 16)); const hit = rows.find(r => r.place && r.w === cc.t);
      ok(!!hit && hit.d === 'Concept chapter', `${vp.n}: a concept chapter is found — "${cc.t}"`);
      if (hit) { await pick(rows, cc.t); const s = await pg.evaluate(SNAP);
        ok(s.nav === routeS.nav && s.concept === routeS.concept && s.pin === routeS.pin, `${vp.n}: the chapter opens where #/concepts/${cc.i} does — ${s.concept || s.nav}`); } }

    /* road to 4.5, P3.27: what is INSIDE a concept chapter (a card's heading) is found, and opens the chapter where its
       route does — its lock and all; a heading three chapters share names no place */
    await reset('regional');
    const inside = await pg.evaluate(() => new Promise(r => SB_LAZY.need('concepts', () => { loadConcepts(); _placeIdx = null;
      const P = placeIndex(); const C = P.filter(p => /^In the chapter /.test(p.kind));
      const shared = P.some(p => p.k === 'the root');
      const p = C.filter(x => suggestPlaces(x.t, 3).some(y => y.w === x.t))[Math.floor(C.length / 4)] || C[0];
      r({ n: C.length, shared, t: p && p.t, kind: p && p.kind, i: p ? +p.go.split('|')[1] : -1 }); })));
    ok(inside.n > 300 && !inside.shared, `${vp.n}: ${inside.n} chapter headings are places; "The Root" (shared by many chapters) is not`);
    await pg.evaluate(i => SB_SHELL.applyRoute('concepts/' + i), inside.i); await pg.waitForTimeout(700);
    const inRoute = await pg.evaluate(SNAP);
    await reset('regional');
    { const rows = await type(inside.t); const hit = rows.find(r => r.place && r.w === inside.t);
      ok(!!hit && hit.d === inside.kind, `${vp.n}: a chapter's contents are found — "${inside.t}" (${hit && hit.d})`);
      if (hit) { await pick(rows, inside.t); const s = await pg.evaluate(SNAP);
        ok(s.nav === inRoute.nav && s.concept === inRoute.concept && s.pin === inRoute.pin, `${vp.n}: it opens its chapter where #/concepts/${inside.i} does — ${s.concept || s.nav}`); } }
    /* …and the medals: a medal's name opens the Medals shelf, as the drawer's Medals row does */
    await reset('free');
    const medal = await pg.evaluate(() => { _placeIdx = null; const M = placeIndex().filter(p => p.kind === 'Medal');
      const p = M.find(x => suggestPlaces(x.t, 3).some(y => y.w === x.t)); return { n: M.length, t: p && p.t }; });
    { const rows = await type(medal.t || 'zzz'); const hit = rows.find(r => r.place && r.w === medal.t);
      ok(medal.n > 20 && !!hit && hit.d === 'Medal', `${vp.n}: the ${medal.n} medals are places — "${medal.t}"`);
      if (hit) { await pick(rows, medal.t); const s = await pg.evaluate(SNAP);
        ok(s.nav === 'collection' && s.coll === 'badges', `${vp.n}: a medal opens the Medals shelf — ${s.nav}/${s.coll}`); } }
    /* a place still comes first. The query is FOUND, not typed: one where a chapter heading or a medal matches BETTER
       (an exact or a word-start match) than the best place does (inside a word) — the case a single ranking would
       hand to the content row — and the bar must still put the place on top */
    await reset('regional');
    const pick2 = await pg.evaluate(() => new Promise(r => SB_LAZY.need('concepts', () => { loadConcepts(); _placeIdx = null; const P = placeIndex();
      const cls = (p, q) => { const i = (' ' + p.k).indexOf(' ' + q); return i < 0 ? 9 : p.k === q ? 0 : i === 0 ? 1 : 2; };
      for (const s2 of P.filter(p => p.sec)) { const q = s2.k.split(' ')[0]; if (q.length < 4) continue;
        const prim = P.filter(p => !p.sec && cls(p, q) < 9); if (!prim.length) continue;
        if (Math.min(...P.filter(p => p.sec).map(p => cls(p, q))) < Math.min(...prim.map(p => cls(p, q)))) return r({ q, prim: prim.map(p => p.t).slice(0, 3) }); }
      r(null); })));
    if (pick2) { const rows = await type(pick2.q); const first = rows.find(r => r.place);
      ok(first && first.d !== 'Medal' && !/^In the chapter /.test(first.d), `${vp.n}: places rank before contents and medals — "${pick2.q}" lists ${first && first.w} (${first && first.d}) first, though a heading or medal matches it better`); }
    else ok(false, `${vp.n}: no query found where a heading or a medal outmatches a place — the ranking check has nothing to hold`);

    // Escape still closes; the place half costs nothing per keystroke
    await reset('free');
    await type('meadow'); await pg.keyboard.press('Escape'); await pg.waitForTimeout(200);
    ok(!(await pg.evaluate(() => !!document.querySelector('.sb-hsug'))), `${vp.n}: Escape closes the list`);
    const ms = await pg.evaluate(() => { const qs = ['mea', 'mead', 'meadow', 'gra', 'grand p', 'roman f', 'quo', 'bee', 'sil', 'zzz'];
      const t0 = performance.now(); for (let i = 0; i < 50; i++) qs.forEach(q => suggestPlaces(q, 3)); return (performance.now() - t0) / (50 * qs.length); });
    ok(ms < 0.5, `${vp.n}: the place half costs ${ms.toFixed(3)}ms a keystroke (budget 0.5ms)`);
    await ctx.close();
  }
  await b.close();
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\nPASS — the header search finds places, and opens them as a tap would');
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
