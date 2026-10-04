/* THE MOCK BEE ON THE STAGE, IN A REAL PAGE (games spec §4.1 and §5.0, 4 Oct 2026)

   tests/mockbee-sim.cjs holds the rules on a simulated clock. This holds what only a browser
   can show, at a desktop and on a phone:
     ROUTE   #/mockbee opens the lobby through its opener; its Back says Play and lands on #/play.
     CHAIR   on the child's turn the requests are drawn in their fixed order and at ONE size;
             a word with no sentence and no alternate pronunciation draws neither button (never
             an empty one); asking a question takes 3 s off the clock on screen; with every
             answer open, the hall's visible text never contains the word.
     INPUT   the real keyboard spells (type + Enter) on a desktop; on a touch phone the Chair
             and Spell it are tapped; Chair buttons are at least 40 px tall and every control
             sits above the tab bar, in the window, with the page not scrolled.
     STAGE   the hall stands on the engine kit's SGUI.stage (.sb-stage) and passes the shared
             T14/T15 checks (tests/lib/stage-check.cjs: mirrored HUD, centred title and
             controls, equal gutters, no page scroll, nothing under the tab bar, a phone's
             controls in the bottom 38%, keys ≥ 40 px, no flat fill, no pure white or black);
             the two benches are the same width and the microphone is on the centre line.
     KEYS    on a touch phone the word is typed on SGUI.keys (the box only shows the letters);
             a miss opens the kit's miss card, and Continue lets the bee go on.
     FAMILY  names typed for Family Bee night are on the stage and nowhere in localStorage.
   Every wait is on state (lib/wait.cjs). Run: NODE_PATH=/opt/node22/lib/node_modules node tests/mockbee-stage.cjs */
const { chromium } = require('playwright');
const path = require('path');
const { booted, until } = require('./lib/wait.cjs');
const SC = require('./lib/stage-check.cjs');
const ROOT = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0,
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 40, mbDiff: 'hard' }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [vw, vh, phone] of [[1280, 800, false], [390, 844, true]]) {
    const tag = phone ? 'phone 390×844' : 'desktop 1280×800';
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, hasTouch: phone, isMobile: phone });
    await ctx.addInitScript(s => { if (!localStorage.getItem('t_mbs')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_mbs', '1'); } }, seed);
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + ROOT + '/index.html#/play'); await booted(pg);
    await pg.evaluate(() => { window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {} }; }; try { speechSynthesis.speak = () => {}; } catch (e) {} });
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));   /* the engine kit: the stage, the miss card, the keys */

    /* ---- ROUTE ---- */
    await pg.evaluate(() => { location.hash = '#/mockbee'; });
    const lobby = await until(pg, () => state.nav === 'mockbee' && state.mb && state.mb.view === 'lobby' && !!document.querySelector('.sb-stage .mb-mode'));
    if (lobby) { await pg.waitForTimeout(0); const lg = await SC.geometry(pg); const lp = await SC.pixels(pg); SC.report(ok, tag + ' lobby', lg, lp, { play: true }); }
    const backTxt = await pg.evaluate(() => (document.querySelector('.mb-st-hud .mb-back, .mb-back') || {}).innerText || '');
    if (lobby) await pg.click('.mb-back');
    const back = lobby && await until(pg, () => state.nav === 'games' && /#\/play/.test(location.hash));
    ok(lobby && /Play/.test(backTxt) && back, `${tag} ROUTE: #/mockbee opens the lobby (modes drawn), its Back says "${backTxt.trim()}" and lands on #/play`);
    if (!lobby) { await ctx.close(); continue; }

    /* ---- a turn at the microphone ---- */
    await pg.evaluate(() => { location.hash = '#/mockbee'; });
    await until(pg, () => state.nav === 'mockbee' && state.mb && state.mb.view === 'lobby');
    await pg.evaluate(() => new Promise(r => SB_LAZY.need(['sents', 'sounds', 'coachRules'], r)));
    await pg.evaluate(() => app.mbStart());
    await until(pg, () => state.mb && state.mb.phase === 'call', null, 30000);
    await pg.evaluate(() => { const m = state.mb; m.turn = m.roster.findIndex(s => s.kind === 'me'); });
    const meUp = await until(pg, () => state.mb.phase === 'me', null, 30000);
    /* a word with every answer on file, and one with no sentence and no alternate pronunciation */
    const words = await pg.evaluate(() => {
      const A = window.SB_ALT_PRON || {}; const all = (SB_DATA.nsf || []).filter(w => w && w.w && w.d && w.ps && w.o && /^[a-z]{4,}$/.test(w.w));
      const full = all.find(w => w.s && Object.prototype.hasOwnProperty.call(A, w.w) && !/Ahana|Pip|Nova|Rafi|Suki|Dax|Mira/i.test(w.w));
      const bare = all.find(w => !w.s && !Object.prototype.hasOwnProperty.call(A, w.w));
      return { full: full && full.w, bare: bare && bare.w }; });
    const setWord = w => pg.evaluate(w => { const g = state.mb; g.word = SB_DATA.nsf.find(x => x.w === w); g.asked = {}; render(); }, w);
    await setWord(words.full);
    const chair = await pg.evaluate(() => [...document.querySelectorAll('.mb-chair .mb-ask')].map(b => { const r = b.getBoundingClientRect(); return { q: b.dataset.q, w: Math.round(r.width), h: Math.round(r.height), t: b.innerText.trim() }; }));
    const order = chair.map(c => c.q).join(' ');
    const oneSize = chair.length && chair.every(c => Math.abs(c.w - chair[0].w) <= 1 && Math.abs(c.h - chair[0].h) <= 1);
    ok(meUp && order === 'def ps org sent say alt' && oneSize && chair.every(c => c.t.length > 2),
      `${tag} CHAIR: six requests in order (${order}) at one size (${chair[0] ? chair[0].w + '×' + chair[0].h : '-'}) for "${words.full}"`);
    await setWord(words.bare);
    const bareQ = await pg.evaluate(() => [...document.querySelectorAll('.mb-chair .mb-ask')].map(b => b.dataset.q).join(' '));
    ok(!/sent|alt/.test(bareQ) && /def/.test(bareQ) && /say/.test(bareQ), `${tag} CHAIR: no sentence and no alternate pronunciation on file — those buttons are not drawn (${bareQ})`);
    await setWord(words.full);
    /* 3 s a question, on the clock the child sees */
    const before = await pg.evaluate(() => ({ dl: state.mb.clock.deadline, txt: (document.getElementById('mb-clock') || {}).textContent }));
    if (phone) await pg.tap('.mb-chair [data-q="def"]'); else await pg.click('.mb-chair [data-q="def"]');
    await until(pg, () => state.mb.asked && state.mb.asked.def);
    const after = await pg.evaluate(() => ({ dl: state.mb.clock.deadline, txt: (document.getElementById('mb-clock') || {}).textContent, ans: (document.querySelector('.mb-answers') || {}).innerText || '' }));
    const secs = t => parseInt(String(t || '0'), 10);
    ok(before.dl - after.dl === 3000 && secs(before.txt) - secs(after.txt) >= 3 && after.ans.length > 4,
      `${tag} CHAIR: ${phone ? 'tapping' : 'clicking'} Definition answers it and takes 3 s off the clock (${before.txt} → ${after.txt})`);
    for (const q of ['ps', 'org', 'sent', 'alt']) { if (phone) await pg.tap(`.mb-chair [data-q="${q}"]`); else await pg.click(`.mb-chair [data-q="${q}"]`); }
    await until(pg, () => state.mb.asked && state.mb.asked.alt);
    const vis = await pg.evaluate(() => (document.querySelector('.mb-wrap') || document.body).innerText);
    const leak = new RegExp('(^|[^a-z])' + words.full + '($|[^a-z])', 'i').test(vis);
    ok(!leak && /Definition\./.test(vis) && /Sentence\./.test(vis), `${tag} CHAIR: every answer open and the word "${words.full}" is nowhere in the hall's visible text`);

    /* ---- the stage: the shared T14/T15 checks on the turn itself, and the hall's own mirror ---- */
    const tg = await SC.geometry(pg); const tp = await SC.pixels(pg);
    SC.report(ok, tag + ' turn', tg, tp, { play: true });
    const geo = await pg.evaluate(() => {
      const R = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, w: r.width }; };
      return { st: R('.sb-stage'), cen: R('.mb-centre'), bl: R('.mb-bench.l'), br: R('.mb-bench.r'), asks: [...document.querySelectorAll('.mb-chair .mb-ask')].map(e => e.getBoundingClientRect().height) }; });
    const mid = geo.st.l + geo.st.w / 2;
    const benchOk = phone ? true : (geo.bl && geo.br && Math.abs(geo.bl.w - geo.br.w) <= 4);   /* a phone hides the benches while the child is at the microphone */
    ok(benchOk && Math.abs((geo.cen.l + geo.cen.w / 2) - mid) <= 4 && Math.min(...geo.asks) >= 40,
      `${tag} STAGE: ${phone ? '' : 'benches ' + Math.round(geo.bl.w) + '/' + Math.round(geo.br.w) + 'px, '}the microphone on the centre line, Chair buttons ≥ 40px (${Math.round(Math.min(...geo.asks))})`);

    /* ---- spelling: the keyboard on a desktop, a tap on a phone ---- */
    const target = await pg.evaluate(() => state.mb.word.w);
    if (phone) {
      const keys = await pg.evaluate(() => document.querySelectorAll('#mb-keys .sg-key').length);
      for (const ch of target) await pg.tap(`#mb-keys .sg-key[data-k="${ch}"]`);
      const shown = await pg.evaluate(() => (document.getElementById('mb-in') || {}).value);
      await pg.tap('#mb-keys .sg-key.enter');
      const spelt = await until(pg, () => state.mb.phase !== 'me' && state.mb.mine.length && state.mb.mine[state.mb.mine.length - 1].ok);
      ok(keys >= 26 && shown === target && spelt, `${tag} KEYS: the word typed on the on-screen keys (${keys}) shows in the box ("${shown}") and Enter spells it`);
    } else {
      await pg.click('#mb-in'); await pg.keyboard.type(target); await pg.keyboard.press('Enter');
      const spelt = await until(pg, () => state.mb.phase !== 'me' && state.mb.mine.length && state.mb.mine[state.mb.mine.length - 1].ok);
      ok(spelt, `${tag} INPUT: typing and Enter spells the word, and it counts`);
    }
    /* a miss: the kit's card on the stage, held until Continue */
    await until(pg, () => state.mb.phase === 'call', null, 30000);
    await pg.evaluate(() => { const m = state.mb; m.turn = m.roster.findIndex(s => s.kind === 'me'); });
    await until(pg, () => state.mb.phase === 'me', null, 60000);
    await pg.evaluate(() => { app.mbType('zzqq'); app.mbSpell(); });
    const card = await until(pg, () => !!document.querySelector('.sb-stage .sg-misswrap .sb-miss'));
    await pg.evaluate(() => render());   /* a render under the card (a lazy file landing) must not lose it */
    const kept = await until(pg, () => !!document.querySelector('.sb-stage .sg-misswrap .sb-miss') && state.mb.phase === 'meDone' && !!state.mb.hold);
    if (phone) await pg.tap('.sg-miss-go'); else await pg.click('.sg-miss-go');
    const went = await until(pg, () => !state.mb.hold && !document.querySelector('.sg-misswrap') && !(window.SGUI && SGUI.held));
    ok(card && kept && went, `${tag} MISS: the kit's miss card covers the stage, survives a render, and Continue clears it and the hold`);
    await pg.evaluate(() => app.mbQuit());

    /* ---- Family Bee night: the names stay on the stage ---- */
    await pg.evaluate(() => { location.hash = '#/mockbee/family'; });
    await until(pg, () => state.mb && state.mb.view === 'family' && !!document.querySelector('.mb-pin'));
    if (phone) await pg.tap('.mb-pin'); else await pg.click('.mb-pin');
    await pg.keyboard.type('Zanzibar');
    await pg.evaluate(() => app.mbStart());
    await until(pg, () => state.mb && state.mb.view === 'stage' && state.mb.phase === 'pass', null, 30000);
    const onStage = await pg.evaluate(() => (document.querySelector('.mb-wrap') || {}).innerText || '');
    await pg.evaluate(() => { try { save(); } catch (e) {} });
    const stored = await pg.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/zanzibar/i.test(localStorage.getItem(k) || '')) out.push(k); } return out; });
    ok(/Zanzibar/.test(onStage) && !stored.length, `${tag} FAMILY: the name typed is on the stage and in no localStorage key${stored.length ? ' — found in ' + stored.join(', ') : ''}`);
    await pg.evaluate(() => app.mbQuit());
    ok(errs.length === 0, `${tag}: no page errors` + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
    await ctx.close();
  }
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
