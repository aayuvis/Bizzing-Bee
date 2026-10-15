/* THE BEE CIRCUIT ON THE ATLAS, IN A REAL PAGE (circuit/BEE-CIRCUIT.md §3.1, §13 tests 1, 2, 9, 14) — browser

   The Circuit itself (circuit.js, window.SB_CIRCUIT) is CORE's file. Every section but REAL injects a STUB of its contract
   before the app boots (hallUnlocked, teamOpen, boardExtras, visitorFor, state, open, openVisitor, chip, onHallOpen,
   onRegionDone, onHall, onTeamNight — each driven by window.__circCfg, so one page can be every state of the story) and
   answers circuit.js / circuit-data.js with an empty script, so the real file cannot land over the stub. "The Circuit
   off" is a page with no SB_CIRCUIT at all (the real file blocked the same way).
   The child has walked the Atlas to the last stop of the Wide Strait (Act VI): six regions reached, three not.
     OVERLAY (t1)   a bot that ignores every hall sees, on all nine region boards, the same stops (labels, states,
                    marks), the same "n of N stops", the same stop card, the same SB_TRAIL_NEXT, Home's same Continue
                    and the same Atlas overview pins as a page with the Circuit off; the hall pins stand on exactly the
                    reached regions, none of them is an .atlas-stop, and none is inside one
     GATES (t2)     nothing gates: every region board and its stops open the same whatever the halls' state — no hall
                    unlocked, every hall unlocked, every hall played — and a stop beyond the reach stays shut in all three
     STORY ORDER    a hall pin stands only where the region's fourth leg is reached AND hallUnlocked says so; before the
                    Circuit is on the page nothing extra is drawn; Team Night only once teamOpen() says so; onHallOpen is
                    told exactly the regions whose hall pin stands, onRegionDone exactly the regions walked end to end
     REAL           (only when circuit.js is in the tree) the real Circuit, nothing stubbed: Round I's hall stands on the
                    Meadow and Round II's waits; the pin delivers the invitation and programme (onHallOpen) and the board
                    shows the Circuit's envelope; the hall played to its finish (the child out in round two, Finish now)
                    reaches onHall — the hall is recorded, its bee file and stamp are in the mail — and the Library's hall
                    then stands
     PHONE (t9)     at 390×844, on all nine boards (testing unlock: every hall reached): every hall pin and the Team
                    Night pin is at least 44×44 and inside its board; the Atlas chip and a stop's Visitor line are 44 px
                    tall and the page never scrolls sideways; a hall's lobby and its stage, Team Night's lobby and a call
                    pass the stage geometry (no control under the tab bar, the page does not scroll, nothing wider than
                    the phone) and every call button is 44 px tall
     FAMILY (t14)   checkShell(page, {phone, bee:true}) returns [] on Home with the Circuit on the page, desk and phone,
                    and Home's words are the same with it and without it
     KEYS / TOUCH   a hall pin opens its hall by Enter and by a tap; Team Night's caller works by 1–9 + Enter and by taps;
                    the Atlas chip and a Visitor line call the Circuit's open
     NO EMOJI / NO LEAK  no emoji on a pin, the chip or Team Night's screens; a call never shows the word it asks about
   Every wait is on state (lib/wait.cjs). ONLY=overlay|gates|phone|desk|family runs those sections.
   Proved by breaking — SB_ROOT=<a scratch root of symlinks with ONE file replaced> (the tree never touched), the
   section named, each watched to fail:
     trail.js  a hall pin drawn as an .atlas-stop ........................ OVERLAY (t1) and "none a stop" fail
     trail.js  the reach ignored (every region gets its pin) ............. "exactly the reached regions" fails
     trail.js  hallUnlocked ignored ........................................ STORY ORDER fails (forum, strait get pins)
     trail.js  pins drawn before the Circuit is on the page ............... OVERLAY ("a pin with the Circuit off") and
                                                                             STORY ORDER fail
     trail.js  a stop refused until the Meadow's hall is unlocked ......... GATES fails (none false/false)
     trail.js  a 30 px pin with no label ................................... PHONE (t9) fails (33×33 on all nine)
     trail.js  the chip's CSS leaking onto the family top bar ............. FAMILY (t14) fails, desk and phone (checkShell:
                                                                             top bar 62px, Bee's is 56px …)
     mockbee   a call sent the moment it is picked ......................... the keys check fails (the first pick graded)
     mockbee   the word printed on the caller's card ....................... the call check fails (the word on the stage)
   Before the breaks, the first run caught two of its own faults: lobby geometry read during a lazy file's redraw
   (now quietRender first) and innerText under text-transform (the side headings read "THE CIRCUIT").
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-halls-board.cjs                             */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), vm = require('vm');
const { serve } = require('./lib/serve.cjs');
const { booted, until, frames, quietRender } = require('./lib/wait.cjs');
const SC = require('./lib/stage-check.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ONLY = process.env.ONLY ? new RegExp(process.env.ONLY, 'i') : null;   /* ONLY=overlay|gates|phone|desk|family runs those sections */
const run = k => !ONLY || ONLY.test(k);
const ACTS = ['meadow', 'library', 'forum', 'storm', 'roots', 'strait', 'junkyard', 'sprints', 'stage'];
const EMO = /\p{Extended_Pictographic}/u;

/* the walk: every stop and checkpoint up to the last stop of `upto`, which is the reach */
const T = (() => { const c = { window: null }; c.window = c; vm.createContext(c);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'trail-data.js'), 'utf8'), c); vm.runInContext(fs.readFileSync(path.join(ROOT, 'trail-road.js'), 'utf8'), c); return c; })();
const NODES = T.SB_TRAIL_ROAD.nodes(T.SB_TRAIL, 'honey', 1);
function kidAt(upto, band) {
  const last = NODES.map(n => n.act).lastIndexOf(upto); const done = {}, chk = {};
  NODES.slice(0, last).forEach(n => { if (n.kind === 'unit') done[n.u.id] = { 1: 90 }; else chk['1:' + n.id] = 90; });
  return { name: 'Ahana', age: band === '11-15' ? 12 : 9, ageBand: band === '11-15' ? '11-13' : '8-10', avatar: 'panda', theme: 'spellbound', coins: 0,
    lists: { journey: { xp: 12 } }, activeList: 'journey', missed: [], unlockedThemes: ['spellbound'],
    trail: { lap: 1, done, chk, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } };
}
const REACH = { meadow: 1, library: 1, forum: 1, storm: 1, roots: 1, strait: 1 };   /* walked to the strait's last stop */
const ALL = { unlock: ACTS.slice(), halls: {}, extras: 1, visit: {}, team: false };
const HAS_CORE = fs.existsSync(path.join(ROOT, 'circuit.js'));
const firstUnit = act => NODES.find(n => n.act === act && n.kind === 'unit').u.id;

(async () => {
  const srv = await serve(ROOT, {});
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const { checkShell } = await import(path.join(__dirname, 'lib', 'family', 'shell-check.mjs'));
  const errs = [];
  async function open(o) {
    const ctx = await b.newContext({ viewport: o.phone ? { width: 390, height: 844 } : { width: 1280, height: 800 }, isMobile: !!o.phone, hasTouch: !!o.phone, deviceScaleFactor: 1, serviceWorkers: 'block' });
    const seed = { theme: 'spellbound', mode: 'light', pin: '2468', activeIdx: 0, children: [kidAt(o.upto || 'strait', o.band)] };
    await ctx.addInitScript(([s, cfg, dev]) => {
      if (/storage-probe\.html$/.test(location.pathname)) return;
      if (!sessionStorage.getItem('t_cb')) { localStorage.clear(); localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); sessionStorage.setItem('t_cb', '1'); }
      window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {}, addEventListener: () => {} }; };
      try { speechSynthesis.speak = () => {}; } catch (e) {}
      window.__dev = dev;
      if (!cfg) return;
      window.__circCfg = cfg;
      window.SB_CIRCUIT = { calls: [],
        hallUnlocked: (act) => (window.__circCfg.unlock || []).indexOf(act) >= 0,
        boardExtras: (act) => window.__circCfg.extras ? '<span class="circ-test-extra" data-x="' + act + '"></span>' : '',
        visitorFor: (id) => (window.__circCfg.visit || {})[id] || null,
        state: () => ({ halls: window.__circCfg.halls || {} }),
        teamOpen: () => !!window.__circCfg.team,
        chip: () => 'The Bee Circuit · Season 1',
        onHallOpen: (act) => { window.SB_CIRCUIT.calls.push(['onHallOpen', act]); return false; },
        onRegionDone: (act) => { window.SB_CIRCUIT.calls.push(['onRegionDone', act]); return false; },
        open: (...a) => window.SB_CIRCUIT.calls.push(['open'].concat(a)),
        openVisitor: (id) => window.SB_CIRCUIT.calls.push(['openVisitor', id]),
        onHall: (act, r) => window.SB_CIRCUIT.calls.push(['onHall', act, r]),
        onTeamNight: (r) => window.SB_CIRCUIT.calls.push(['onTeamNight', r]) };
    }, [seed, o.cfg || null, !!o.dev]);
    if (!o.real) await ctx.route(/\/circuit(-data)?\.js(\?|$)/, r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '/* the stub stands in */' }));
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
    await pg.goto(srv.url + 'index.html'); await booted(pg);
    await until(pg, () => { try { return SB_SHELL.nextStep().ready; } catch (e) { return false; } }, null, 30000);
    await pg.evaluate(() => { SB_LAZY.need('atlas', () => { window.__atlasIn = 1; }); });
    if (!(await until(pg, () => !!window.__atlasIn, null, 60000))) throw new Error('the Word Atlas never loaded' + (errs.length ? ': ' + errs.join(' | ') : ''));
    if (o.dev) await pg.evaluate(() => { state.devUnlock = true; });
    return { ctx, pg };
  }
  /* a region's board, laid out: its painting in, its stops drawn */
  async function board(pg, act) {
    await pg.evaluate(a => app.trailHere('honey|' + a), act);
    return until(pg, a => { if (state.nav !== 'trail' || state.trailAct !== a) return false; const im = document.querySelector('#sb-pan .act-board img');
      return !!im && im.complete && im.naturalWidth > 0 && document.querySelectorAll('.act-board .atlas-stop').length > 0; }, act, 30000);
  }
  /* a tap on the open map folds the stop card away (trailShut), as a child does before tapping a pin it covers */
  const fold = async pg => { await pg.evaluate(() => { state.trailStop = -9; render(); }); await until(pg, () => !document.querySelector('.atlas-pop')); await frames(pg, 2); };
  const snap = pg => pg.evaluate(() => {
    const stops = [...document.querySelectorAll('.act-board .atlas-stop')].map(x => [x.getAttribute('aria-label'), x.className.replace(/\s+/g, ' ').trim(), x.textContent.replace(/\s+/g, '')].join('|'));
    const head = ((document.querySelector('.sb-content') || {}).innerText || '').match(/(\d+) of (\d+) stops/);
    const card = document.querySelector('.atlas-pop'); let cardTxt = '';
    if (card) { const k = card.cloneNode(true); k.querySelectorAll('.circ-vis').forEach(x => x.remove()); cardTxt = k.innerText.replace(/\s+/g, ' ').trim(); }
    const nx = window.SB_TRAIL_NEXT ? SB_TRAIL_NEXT() : null;
    return { stops, head: head ? head[0] : '', card: cardTxt, next: JSON.stringify(nx && { stop: nx.stop, stops: nx.stops, act: nx.act, go: nx.go, arg: nx.arg, done: nx.done }),
      step: JSON.stringify((() => { try { const s = SB_NEXT_STEP(); return { go: s.go, arg: s.arg, label: s.label }; } catch (e) { return null; } })()),
      pins: [...document.querySelectorAll('.circ-pin')].map(x => x.getAttribute('data-act') + ':' + x.getAttribute('data-arg')),
      inStop: document.querySelectorAll('.atlas-stop .circ-pin, .circ-pin.atlas-stop').length, extras: document.querySelectorAll('.circ-test-extra').length };
  });

  /* ---------------- OVERLAY (t1) and STORY ORDER ---------------- */
  if (run('overlay')) {
    const off = await open({ cfg: null }), on = await open({ cfg: Object.assign({}, ALL, { halls: { meadow: { done: 1 } }, visit: { [firstUnit('strait')]: 'Janus' } }) });
    const diff = [], pins = {}; let extras = 0, inStop = 0;
    for (const act of ACTS) {
      const a1 = await board(off.pg, act), a2 = await board(on.pg, act);
      const A = await snap(off.pg), B = await snap(on.pg);
      if (!a1 || !a2) diff.push(act + ': board did not draw');
      for (const k of ['stops', 'head', 'card', 'next', 'step']) if (JSON.stringify(A[k]) !== JSON.stringify(B[k])) diff.push(`${act} ${k}: ${JSON.stringify(A[k]).slice(0, 80)} vs ${JSON.stringify(B[k]).slice(0, 80)}`);
      if (A.pins.length) diff.push(act + ': a pin with the Circuit off');
      pins[act] = B.pins; extras += B.extras; inStop += B.inStop;
    }
    const atlas = async pg => { await pg.evaluate(() => app.trailToMap()); await until(pg, () => state.trailView === 'map' && document.querySelectorAll('.atlas-pin').length > 0);
      return pg.evaluate(() => [...document.querySelectorAll('.atlas-pin')].map(x => x.className + '|' + x.textContent.replace(/\s+/g, ''))); };
    const pa = await atlas(off.pg), pb = await atlas(on.pg);
    const home = async pg => { await pg.evaluate(() => app.setNav('home')); await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-home-r2'));
      return pg.evaluate(() => { const s = SB_NEXT_STEP(); return JSON.stringify({ go: s.go, arg: s.arg }) + '|' + ((document.querySelector('.sb-home-r2') || {}).innerText || '').replace(/\s+/g, ' '); }); };
    const ha = await home(off.pg), hb = await home(on.pg);
    ok(!diff.length && JSON.stringify(pa) === JSON.stringify(pb) && ha === hb, `OVERLAY (t1): on all nine boards the stops, "n of N stops", the stop card, SB_TRAIL_NEXT and Continue are the same with the Circuit on as off; so are the Atlas's region pins and Home's journey row` + (diff.length ? ' — ' + diff.slice(0, 3).join(' · ') : '') + (ha !== hb ? ' — Home differs' : ''));
    const withHall = ACTS.filter(a => pins[a].some(p => p.startsWith('hallOpen:')));
    ok(withHall.join() === ACTS.filter(a => REACH[a]).join() && inStop === 0, `OVERLAY: a hall pin stands on exactly the reached regions (${withHall.join(', ')}), none of them a stop or inside one`);
    ok(extras === 9, `OVERLAY: SB_CIRCUIT.boardExtras(act) is dropped into each region board's overlay (${extras} of 9)`);
    ok(!ACTS.some(a => pins[a].some(p => p.startsWith('teamOpen'))), 'STORY ORDER: no Team Night pin while teamOpen() says no');
    const told = await on.pg.evaluate(() => { const C = SB_CIRCUIT.calls; const u = k => [...new Set(C.filter(x => x[0] === k).map(x => x[1]))];
      return { open: u('onHallOpen'), done: u('onRegionDone'), twice: C.filter(x => x[0] === 'onHallOpen').length }; });
    ok(told.open.slice().sort().join() === withHall.slice().sort().join() && told.twice === withHall.length,
      `STORY ORDER: onHallOpen is told each region whose hall pin stands, once (${told.open.join(', ')})`);
    ok(told.done.join() === 'meadow,library,forum,storm,roots', `STORY ORDER: onRegionDone is told exactly the regions walked end to end (${told.done.join(', ')}; the Strait's last stop is the reach)`);
    /* story order: only what hallUnlocked opens */
    await on.pg.evaluate(() => { window.__circCfg.unlock = ['meadow', 'library']; });
    const so = [];
    for (const act of ['meadow', 'library', 'forum', 'strait']) { await board(on.pg, act); so.push(act + ':' + (await on.pg.evaluate(() => document.querySelectorAll('.circ-hall').length))); }
    ok(so.join() === 'meadow:1,library:1,forum:0,strait:0', `STORY ORDER: a reached region's hall waits on hallUnlocked (${so.join(' ')})`);
    await off.ctx.close(); await on.ctx.close();
    /* nothing extra before the Circuit lands: a page whose SB_CIRCUIT arrives late draws its pins only then */
    const late = await open({ cfg: null });
    await board(late.pg, 'meadow');
    const before = await late.pg.evaluate(() => document.querySelectorAll('.circ-pin,.circ-chip').length);
    await late.pg.evaluate(cfg => { window.__circCfg = cfg; window.SB_CIRCUIT = { hallUnlocked: a => cfg.unlock.indexOf(a) >= 0, state: () => ({ halls: {} }), boardExtras: () => '' }; render(); }, ALL);
    const after = await until(late.pg, () => document.querySelectorAll('.circ-hall').length === 1);
    ok(before === 0 && after, 'STORY ORDER: before the Circuit is on the page the board shows nothing extra; once it lands, the hall pin stands');
    await late.ctx.close();
  }

  /* ---------------- GATES (t2) ---------------- */
  if (run('gates')) {
    const { ctx, pg } = await open({ cfg: Object.assign({}, ALL) });
    const states = { none: { unlock: [], halls: {} }, all: { unlock: ACTS.slice(), halls: {} },
      played: { unlock: ACTS.slice(), halls: Object.fromEntries(ACTS.concat(['team']).map(a => [a, { done: 1, best: 1, last: 1 }])) } };
    const seen = {}; const shut = {};
    const inside = firstUnit('meadow'), beyond = NODES.filter(n => n.act === 'junkyard' && n.kind === 'unit')[1].u.id;
    for (const [k, cfg] of Object.entries(states)) {
      await pg.evaluate(c => { Object.assign(window.__circCfg, c); }, cfg);
      seen[k] = [];
      for (const act of ACTS) { if (!(await board(pg, act))) { seen[k].push(act + ': no board'); break; }   /* a board that never draws fails at once */
        const s = await snap(pg); seen[k].push(JSON.stringify([s.stops, s.head, s.card])); }
      /* a stop inside the reach opens; one beyond it stays shut — whatever the halls say */
      await pg.evaluate(() => app.trailToMap());
      const isIn = await pg.evaluate(id => { app.trailUnit(id); return state.trailView === 'unit' && state.trailUnit === id; }, inside);
      await pg.evaluate(() => app.trailToMap());
      const out = await pg.evaluate(id => { app.trailUnit(id); return state.trailView === 'unit' && state.trailUnit === id; }, beyond);
      shut[k] = isIn + '/' + out;
    }
    const noBoard = [].concat(...Object.values(seen)).filter(x => / no board$/.test(x));
    ok(!noBoard.length && seen.none.join() === seen.all.join() && seen.all.join() === seen.played.join(), 'GATES (t2): every region board, its stops and its card are the same whether no hall is unlocked, every hall is, or every hall is played' + (noBoard.length ? ' — ' + noBoard.join(', ') : ''));
    ok(Object.values(shut).every(v => v === 'true/false'), `GATES: a stop inside the reach opens and one beyond it stays shut in all three (${Object.entries(shut).map(([k, v]) => k + ' ' + v).join(', ')})`);
    await ctx.close();
  }

  /* ---------------- PHONE (t9), KEYS / TOUCH, NO EMOJI, NO LEAK ---------------- */
  for (const phone of [true, false]) {
    if (!run(phone ? 'phone' : 'desk')) continue;
    const where = phone ? 'phone 390×844' : 'desktop';
    const vis = { [firstUnit('meadow')]: 'Janus' };
    const { ctx, pg } = await open({ phone, dev: true, cfg: Object.assign({}, ALL, { halls: { stage: { done: 1 } }, team: true, visit: vis }) });
    const bad = [];
    for (const act of ACTS) {
      await board(pg, act); await quietRender(pg); await frames(pg, 2);              /* measured once the board has stopped redrawing */
      const r = await pg.evaluate(() => { const bd = document.querySelector('.act-board').getBoundingClientRect();
        return [...document.querySelectorAll('.circ-pin')].map(p => { const r = p.getBoundingClientRect(); return { k: p.getAttribute('data-act'), w: r.width, h: r.height,
          inside: r.left >= bd.left - 1 && r.right <= bd.right + 1 && r.top >= bd.top - 1 && r.bottom <= bd.bottom + 1, txt: p.textContent,
          at: [r.left, r.top, r.right, r.bottom].map(Math.round).join(',') + ' in ' + [bd.left, bd.top, bd.right, bd.bottom].map(Math.round).join(',') }; }); });
      const want = act === 'stage' ? 2 : 1;
      if (r.length !== want) bad.push(`${act}: ${r.length} pins`);
      r.forEach(p => { if (p.w < 44 || p.h < 44 || !p.inside || EMO.test(p.txt)) bad.push(`${act} ${p.k}: ${Math.round(p.w)}×${Math.round(p.h)}${p.inside ? '' : ' outside (' + p.at + ')'}${EMO.test(p.txt) ? ' emoji' : ''}`); });
    }
    ok(!bad.length, `${where} PHONE (t9): on all nine boards every hall pin, and the Team Night pin, is at least 44×44, inside its board, no emoji` + (bad.length ? ' — ' + bad.join(' · ') : ''));
    /* the Visitor line on an ordinary stop's card, and what it calls */
    await pg.evaluate(id => app.trailHere('honey|meadow', 0), null);
    await until(pg, () => !!document.querySelector('.atlas-pop .circ-vis'));
    const v = await pg.evaluate(() => { const e = document.querySelector('.atlas-pop .circ-vis'); const r = e.getBoundingClientRect(); return { h: r.height, t: e.textContent.trim(), wide: document.documentElement.scrollWidth - innerWidth }; });
    if (phone) await pg.tap('.atlas-pop .circ-vis'); else await pg.click('.atlas-pop .circ-vis');
    const vcall = await until(pg, () => (SB_CIRCUIT.calls || []).some(c => c[0] === 'openVisitor'));
    ok(v.h >= 44 && /^Visitor: Janus$/.test(v.t) && v.wide <= 0 && vcall, `${where}: an ordinary stop's card carries one quiet line "${v.t}" (${Math.round(v.h)} px tall), and it opens the visitor through the Circuit`);
    /* the chip */
    await pg.evaluate(() => app.trailToMap()); await until(pg, () => !!document.querySelector('.circ-chip'));
    const chip = await pg.evaluate(() => { const e = document.querySelector('.circ-chip'); const r = e.getBoundingClientRect(); return { h: r.height, t: e.textContent.trim(), wide: document.documentElement.scrollWidth - innerWidth, r: r.right }; });
    if (phone) await pg.tap('.circ-chip'); else { await pg.focus('.circ-chip'); await pg.keyboard.press('Enter'); }
    const ccall = await until(pg, () => SB_CIRCUIT.calls.some(c => c[0] === 'open'));
    ok(chip.h >= 44 && chip.t === 'The Bee Circuit · Season 1' && chip.wide <= 0 && chip.r <= (phone ? 390 : 1280) && ccall, `${where}: the Atlas header chip "${chip.t}" (${Math.round(chip.h)} px), no sideways scroll, ${phone ? 'a tap' : 'Enter'} opens the Circuit`);
    /* a hall pin, by Enter or a tap */
    await board(pg, 'storm'); await fold(pg);
    if (phone) await pg.tap('.circ-hall'); else { await pg.focus('.circ-hall'); await pg.keyboard.press('Enter'); }
    const lobby = await until(pg, () => state.nav === 'mockbee' && state.mb && state.mb.mode === 'venue' && state.mb.view === 'lobby' && !!document.querySelector('.sb-stage .mb-hall-lobby'), null, 30000);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r))); await quietRender(pg); await frames(pg, 2);
    const lg = await SC.geometry(pg); const lwide = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    ok(lobby && lg && !lg.none && lg.scroll <= 1 && !lg.under.length && lwide <= 0, `${where}: ${phone ? 'a tap' : 'Enter'} on the Eye of the Storm's pin opens its hall; the lobby fits (no control under the tab bar, no page scroll, nothing wider than the screen)` + (lg && lg.under && lg.under.length ? ' — under: ' + lg.under.join(', ') : ''));
    const plate = await pg.evaluate(() => (document.querySelector('.sb-stage').getAttribute('style') || '').match(/map-storm-pano/) && getComputedStyle(document.querySelector('.sb-stage')).backgroundPositionX);
    ok(!!plate && /100%/.test(String(plate)), `${where}: the hall stands on its venue — the region's own panorama, drawn at its far end (${plate})`);
    await pg.evaluate(() => app.mbStart());
    const stg = await until(pg, () => state.mb && state.mb.view === 'stage' && /^(bot|practice|me|call)$/.test(state.mb.phase || ''), null, 30000);
    await quietRender(pg); await frames(pg, 2);
    const sg = await SC.geometry(pg);
    ok(stg && sg.scroll <= 1 && !sg.under.length, `${where}: the hall's stage fits (no control under the tab bar, no page scroll)` + (sg.under.length ? ' — under: ' + sg.under.join(', ') : ''));
    await pg.evaluate(() => app.mbQuit());
    const back = await until(pg, () => state.nav === 'trail' && state.trailView === 'act' && state.trailAct === 'storm');
    ok(back, `${where}: Leave goes back to the region's board`);
    /* Team Night: the pin, the lobby, a call by keys or taps */
    await board(pg, 'stage'); await fold(pg);
    if (phone) await pg.tap('.circ-team'); else { await pg.focus('.circ-team'); await pg.keyboard.press('Enter'); }
    const tl = await until(pg, () => state.mb && state.mb.mode === 'team' && !!document.querySelector('.sb-stage .tn-lobby'), null, 30000);
    await quietRender(pg); await frames(pg, 2);
    const tg = await SC.geometry(pg); const twide = await pg.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    const tTxt = await pg.evaluate(() => document.querySelector('.sb-stage').innerText);
    ok(tl && tg.scroll <= 1 && !tg.under.length && twide <= 0 && !EMO.test(tTxt) && /The Circuit/i.test(tTxt) && /Ravenmere/i.test(tTxt), `${where}: the Team Night pin opens its lobby (the Circuit's side and Ravenmere's); it fits, and carries no emoji` + (tl ? '' : ' — no lobby') + (tg.under.length ? ' — under: ' + tg.under.join(', ') : '') + (tg.scroll > 1 ? ' — page scrolls ' + tg.scroll : '') + (twide > 0 ? ' — ' + twide + ' px too wide' : '') + (EMO.test(tTxt) ? ' — emoji: ' + (tTxt.match(EMO) || [''])[0] : ''));
    if (phone) await pg.tap('[data-act="mbStart"]'); else { await pg.focus('[data-act="mbStart"]'); await pg.keyboard.press('Enter'); }
    const call = await until(pg, () => state.mb && state.mb.phase === 'tCall' && !!document.querySelector('.tn-calls'), null, 60000);
    await quietRender(pg); await frames(pg, 2);
    const cg = await SC.geometry(pg);
    const cs = await pg.evaluate(() => ({ hs: [...document.querySelectorAll('.tn-callb')].map(x => x.getBoundingClientRect().height), word: state.mb.st.w.w,
      txt: document.querySelector('.sb-stage').innerText, wide: document.documentElement.scrollWidth - innerWidth }));
    const leak = new RegExp('(^|[^a-z])' + cs.word + '($|[^a-z])', 'i').test(cs.txt);
    ok(call && cg.scroll <= 1 && !cg.under.length && cs.wide <= 0 && cs.hs.length >= 6 && Math.min(...cs.hs) >= 44 && !EMO.test(cs.txt) && !leak,
      `${where}: a call fits — ${cs.hs.length} call buttons, the smallest ${Math.round(Math.min(...cs.hs))} px; no emoji; the word is nowhere on the stage`);
    if (phone) { await pg.tap('.tn-callb[data-arg="2"]'); await pg.tap('.tn-callb[data-arg="1"]'); await pg.tap('[data-act="tnSend"]'); }
    else { await pg.keyboard.press('3'); await pg.keyboard.press('2'); await pg.keyboard.press('Enter'); }
    const sent = await until(pg, () => state.mb.calls.length === 1);
    const made = await pg.evaluate(() => state.mb.calls[0] && state.mb.calls[0].call);
    const want = await pg.evaluate(() => MOCKBEE.circuit.calls().filter(c => c[state.mb.lect])[1].call);
    ok(sent && made === want, `${where}: the caller ${phone ? 'taps' : 'presses 3, then 2, then Enter'} — the call changed before it was sent is the one graded ("${made}")`);
    await pg.evaluate(() => app.mbQuit());
    await ctx.close();
  }

  /* ---------------- FAMILY (t14) ---------------- */
  for (const phone of [false, true]) {
    if (!run('family')) continue;
    const on = await open({ phone, cfg: ALL }), off = await open({ phone, cfg: null });
    const homeOf = async pg => { await pg.evaluate(() => app.setNav('home'));
      await until(pg, () => state.nav === 'home' && !!document.querySelector('.sb-fam-bar') && !!document.querySelector('.sb-content .sb-home-second')); await frames(pg, 2);
      return pg.evaluate(() => document.querySelector('.sb-content').innerText.replace(/\s+/g, ' ')); };
    const hOn = await homeOf(on.pg), hOff = await homeOf(off.pg);
    const f = await checkShell(on.pg, { phone, bee: true });
    ok(!f.length && hOn === hOff, `FAMILY (t14) ${phone ? 'phone' : 'desktop'}: checkShell on Home with the Circuit on the page returns [] ${f.length ? JSON.stringify(f) : ''}, and Home says the same with it and without it`);
    await on.ctx.close(); await off.ctx.close();
  }
  /* ---------------- REAL: the real Circuit on the page, nothing stubbed (only once circuit.js is in the tree) ---------------- */
  if (run('real') && !HAS_CORE) console.log('  note REAL skipped: no circuit.js in this tree (CORE\'s file); the integrator runs it on the merged tree');
  if (run('real') && HAS_CORE) {
    const { ctx, pg } = await open({ real: true, cfg: null });
    const mail = re => pg.evaluate(src => { try { const R = new RegExp(src); return SB_CIRCUIT.state(active()).mail.filter(m => R.test(m.key)).map(m => m.key); } catch (e) { return []; } }, re);
    await board(pg, 'meadow');
    const landed = await until(pg, () => !!window.SB_CIRCUIT && typeof SB_CIRCUIT.onHallOpen === 'function' && !!document.querySelector('.circ-hall'), null, 30000);
    const inv = await until(pg, () => { try { return SB_CIRCUIT.state(active()).mail.some(m => /^rounds\[0\]\.pieces\.(inv|prog)/.test(m.key)); } catch (e) { return false; } }, null, 15000);
    const env = await until(pg, () => !!document.querySelector('.hp-env'), null, 15000);
    ok(landed && inv && env, `REAL: the Circuit lands; Round I's hall stands on the Meadow, its pin delivers the invitation and programme (${(await mail('^rounds\\[0\\]')).join(', ')}), and the board shows the Circuit's envelope`);
    await board(pg, 'library');
    const lib0 = await until(pg, () => !!window.SB_CIRCUIT && document.querySelectorAll('.circ-hall').length === 0 && document.querySelectorAll('.act-board .atlas-stop').length > 0);
    ok(lib0, "REAL: Round II's hall waits for Round I (hallUnlocked) — the Library is reached, and has no pin yet");
    /* the Meadow's hall, played to its finish: the child goes out in round two and taps Finish now */
    await board(pg, 'meadow'); await fold(pg);
    await pg.evaluate(() => app.hallOpen('meadow'));
    await until(pg, () => state.mb && state.mb.mode === 'venue' && state.mb.view === 'lobby', null, 30000);
    await pg.evaluate(() => app.mbStart());
    const ACTABLE = () => { const g = state.mb; return !g || g.view === 'result' || g.phase === 'me' || g.phase === 'practice' || (g.phase === 'meDone' && !!g.hold) || g.phase === 'outChoice'; };
    let done = false;
    for (let k = 0; k < 80 && !done; k++) {
      if (!(await until(pg, ACTABLE, null, 90000))) break;
      const st = await pg.evaluate(() => { const g = state.mb; if (!g || g.view === 'result') return { end: !!g };
        const key = [g.phase, g.round, g.turn, g.atMic && g.atMic.n, g.practice && g.practice.deadline].join('|');
        if (g.phase === 'me') { app.mbType('qzxqzx'); app.mbSpell(); }
        else if (g.phase === 'practice') app.mbPracSkip();
        else if (g.phase === 'meDone') app.mbGoOn();
        else if (g.phase === 'outChoice') app.mbFinishNow();
        return { key }; });
      if (st.end !== undefined) { done = st.end; break; }
      await until(pg, key => { const g = state.mb; return !g || g.view === 'result' || [g.phase, g.round, g.turn, g.atMic && g.atMic.n, g.practice && g.practice.deadline].join('|') !== key; }, st.key, 30000);
    }
    const rec = await until(pg, () => { try { const h = SB_CIRCUIT.state(active()).halls.meadow; return !!(h && h.done); } catch (e) { return false; } }, null, 15000);
    const bee = await mail('^(bee|stamp)\\.meadow');
    ok(done && rec && bee.indexOf('bee.meadow.1') >= 0 && bee.indexOf('stamp.meadow') >= 0,
      `REAL: the hall played to its finish reaches onHall — halls.meadow is recorded and the mail holds ${bee.join(', ') || 'nothing'}`);
    await pg.evaluate(() => app.mbQuit());
    await until(pg, () => state.nav === 'trail' && state.trailAct === 'meadow');
    await board(pg, 'library');
    const lib1 = await until(pg, () => document.querySelectorAll('.circ-hall').length === 1, null, 15000);
    ok(lib1, "REAL: with Round I's story in the mail, Round II's hall stands on the Library");
    await ctx.close();
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close(); srv.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
