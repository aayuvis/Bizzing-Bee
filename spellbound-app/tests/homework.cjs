/* MY HOMEWORK (owner, 15 Oct 2026: "a homework to do the student in a separate top nav left of the search bar … my homework
   section … similar look and feel as the app (tabs are the homework concepts, homework atlas concepts, homework wordlist,
   history) but only tracks homework … completion in homework applies as completion in main app … also captured in progress
   report"). app3-homework.js, the top bar's button (family-shell hwBtn), the report card's Homework section (app3-grownups).
   Driven for real: Ahana (8–10, at the Meadow's third stop) has homework set the way the Teacher's Corner sets it (SB_HW.add,
   words drawn through the word door); Ravi, her brother, has none.
     TOP BAR    the entry is there only for a child with homework, LEFT of the search bar (before it in the bar; on a desk its
                right edge before the search's left), with a quiet dot while something is open and no number; on a desk and at
                390px the search bar, the coin chip and the header stand exactly where they stand for Ravi (measured), nothing
                spills sideways, and at 390 it is a 44px target (the eight points of a 44px circle land on it); the family's
                checkShell(page,{phone,bee:true}) returns [] on Home with homework present — desk and phone, light and dusk
     ROUTES     #/homework/<tab> lands on each of the four tabs (Concepts · Atlas · Word list · History), the tab marked
     WORD LIST  "Study the list" is a reading deck (the words in print, scoring nothing); "Spell them" never shows the word
                while it is asked (#root's text and every attribute); 1 says it; a miss HOLDS on the shared miss panel and goes
                to the revision pile; a right answer writes the main app's mastery evidence (c.mast), XP and ONE `answer` coin —
                exactly as Today's ten — and nothing is paid for finishing; the list says "N of M spelled right"; left half way
                and RELOADED (a persistent profile, reloadSettled), #/homework/words resumes at the same word; when every word
                has been spelled right once the item is done and goes to History
     ATLAS      the stop opens through trailUnit (spied) and walking it — the stop's own Practice, every word typed — marks the
                Atlas (Practice at the gate) AND the homework done; a stop set as homework and walked in the main app (the
                Atlas, not homework) shows done in homework too
     CONCEPTS   a chapter set AHEAD of the child's Atlas opens from My Homework through the app's own opener, despite its
                learning lock; read to its last card it is done (in homework, and on the child's own record c.cRead); the
                sibling's lock holds
     HISTORY    finished homework with the day set, due and done, and its result; an unfinished one past its due date says
                "Not finished yet" and nothing harsher
     REPORT     the Parent Zone's report card carries the Homework section with the record's own numbers and the open items
     DEMO       ?demo: homework set and spelled in the sample writes nothing to the device's real storage
     LOOKS      axe (WCAG 2.1 A+AA) finds nothing on My Homework in light and dusk; no page errors
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/homework.cjs        (SB_ROOT=<a scratch root> to point it elsewhere)
   Proved by breaking (15 Oct 2026; each a scratch root of symlinks with ONE file replaced, SB_ROOT pointed at it, the tree never
   touched; every one watched to fail):
     family-shell.js the button drawn for a child with no homework → 4 fail (Ravi, desk/phone × light/dusk)
     index.html the logo kept beside it on a phone → 4 fail (the search row pushed to y 96, a 147px header; checkShell names both)
     index.html the search's narrower basis taken out → 1 fails (at 700px the bar wraps: a 159px header, the coins moved)
     app3.js the button drawn after the search bar → 8 fail (left of the search, the search moved, checkShell "163px before the coins")
     app3-homework.js the word printed in the drill's header → 1 fails (five words leaked as text)
     app3-homework.js a `stop` coin paid for finishing a round → 2 fail (stop, stop in the ledger; the wallet moved by seven)
     app3-homework.js a miss moving on by itself → 1 fails (the panel gone before Next)
     app3-homework.js a right answer without markMastered → 1 fails (no c.mast record)
     app3-homework.js the round not kept on the child across a reload → 1 fails
     app3-homework.js a stop's walk not read from the Atlas → 4 fail (homework, the main-app walk, the report's numbers and open items)
     app3.js conceptReadMark writing nothing → 5 fail (c.cRead, done, History, the report's numbers and open items)
     app3-grownups.js the report card without its Homework section → 1 fails
     app3-homework.js History saying "Overdue" → 1 fails
     app3.js isConceptUnlocked ignoring the grant → 2 fail (the chapter does not open from homework; never read) */
'use strict';
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), os = require('os');
const { booted, until, reloadSettled } = require('./lib/wait.cjs');
const coins = require('./lib/coins.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; return b; };
const AXE = (() => { for (const p of [path.join(ROOT, 'node_modules', 'axe-core', 'axe.min.js'), path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js')]) if (fs.existsSync(p)) return p;
  try { return require.resolve('axe-core/axe.min.js'); } catch (e) { return null; } })();
const CHROME = process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const D = 864e5, NOW = Date.now();
const KID = (name, extra) => Object.assign({ name, age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 30, lists: { journey: { xp: 20 } }, activeList: 'journey',
  daysPlayed: ['2026-09-30'], trail: { lap: 1, done: { u1: { 1: 90 }, u2: { 1: 88 } }, chk: {}, seen: {}, st: { 'u1:1': { l: 1, w: 1, p: 90 }, 'u2:1': { l: 1, w: 1, p: 88 } }, elap: 1, edone: {}, echk: {} },
  missed: [] }, extra || {});
const HOUSE = (mode) => ({ theme: 'spellbound', mode: mode || 'light', pin: '1234', activeIdx: 0, children: [KID('Ahana'), KID('Ravi', { avatar: 'koi' })] });
const seedInit = (h) => { try { if (/storage-probe/.test(location.href)) return; if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(h)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} };

/* homework as the Teacher's Corner writes it — through SB_HW.add, the words through the word door */
async function setHomework(pg) {
  await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['atlas', 'scrHw', 'concepts', 'words'], r)));
  return pg.evaluate(() => { try { loadConcepts(); } catch (e) {}
    const c = state.children[0], A = active(); if (A !== c) throw new Error('Ahana is not active');
    const pool = nextWords.pool(c, { purpose: 'drill', level: 'easy', needDef: true, filter: (w) => /^[a-z]{4,8}$/.test(w.w) && !!w.s }).slice().sort((a, b) => a.w < b.w ? -1 : 1);
    const pick = (n, skip) => pool.filter((w) => !(skip || []).includes(w.w)).slice(0, n).map((w) => ({ w: w.w, d: w.d || '', s: w.s || '', p: w.p || '', y: w.y || 3, h: w.h || '' }));
    const five = pick(5), late = pick(3, five.map((w) => w.w));
    /* a chapter AHEAD of the Atlas (taught past the Meadow), with few cards; and the frontier stop's own chapter (open) */
    const D = state.conceptData; let ahead = -1;
    for (let ci = 0; ci < D.length; ci++) { const t = SB_TRAIL_TAUGHT(ci); if (!D[ci].adv && t && t.actId !== 'meadow' && !isConceptUnlocked(ci) && conceptLock(ci).kind === 'learn' && (D[ci].cards || []).length <= 4) { ahead = ci; break; } }
    const fr = SB_TRAIL_NEXT(); const gi = SB_TRAIL.honey.units.find((u) => u.id === fr.arg).gi;
    const y = new Date(); y.setDate(y.getDate() - 1); const yest = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    SB_HW.add(c, { kind: 'words', ref: null, words: five, t: 'Words: Easy, 5', due: SB_HW.plusDays(1) });
    SB_HW.add(c, { kind: 'stop', ref: fr.arg, chk: 0, crs: 'honey', lap: 1, act: 'The Meadow', t: SB_TRAIL.honey.units.find((u) => u.id === fr.arg).title, due: SB_HW.plusDays(3) });
    SB_HW.add(c, { kind: 'concept', ref: ahead, t: D[ahead].title, adv: 0, grant: 1, due: null });
    SB_HW.add(c, { kind: 'concept', ref: gi, t: D[gi].title, adv: 0, due: null });
    const it = SB_HW.add(c, { kind: 'words', ref: null, words: late, t: 'Words: Easy, 3', due: null }); it.due = yest;
    save(); render();
    return { five: five.map((w) => w.w), late: late.map((w) => w.w), ahead, aheadTitle: D[ahead].title, gi, stop: fr.arg }; });
}
function hitTest(sel) {   /* touch-targets' measure: the eight points of a 44px circle centred on the control land on it */
  const el = document.querySelector(sel); if (!el) return 'missing'; const r = el.getBoundingClientRect(); const cx = r.x + r.width / 2, cy = r.y + r.height / 2; const bad = [];
  for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, x = cx + Math.cos(a) * 21.5, y = cy + Math.sin(a) * 21.5; const hit = document.elementFromPoint(x, y);
    if (!hit || !(hit === el || el.contains(hit))) bad.push(Math.round(x) + ',' + Math.round(y) + '→' + (hit ? (hit.getAttribute('class') || hit.tagName) : 'none')); }
  return bad.length ? bad.join(' ') : ''; }
function barRead() { const R = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [b.x, b.y, b.width, b.height].map(Math.round); };
  const bar = document.querySelector('.sb-fam-bar'), hw = document.querySelector('.sb-fam-hw'), s = document.querySelector('.sb-hsearch');
  const kids = bar ? [...bar.children] : [];
  return { hw: R(hw), search: R(document.querySelector('.sb-hsearch input')), coins: R(document.querySelector('.bz-coinchip')), header: R(document.querySelector('.sb-header-sticky')),
    before: !!hw && !!s && kids.indexOf(hw) >= 0 && kids.indexOf(hw) < kids.indexOf(s), dot: !!document.querySelector('.sb-fam-hw .sb-fam-hwdot'), label: hw && hw.getAttribute('aria-label'),
    num: hw ? /\d/.test(hw.textContent) : false, sw: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }; }

(async () => {
  const b = await chromium.launch({ executablePath: CHROME });
  const errs = [];
  const { checkShell } = await import(path.join(__dirname, 'lib', 'family', 'shell-check.mjs'));
  /* a medal earned on the way (a stop walked, a first mastered word) celebrates over the screen 0.7 s after a round ends
     (logActivity → checkNewBadges): real, and not what this test is about — so the medals are seen silently here */
  const calm = (pg) => pg.evaluate(() => { window.checkNewBadges = function () {}; if (state.celebrate) { state.celebrate = null; render(); } });

  /* ================= 1. the top bar and the shell, desk and phone, light and dusk ================= */
  for (const vp of [{ n: 'desk', w: 1280, h: 800 }, { n: 'phone', w: 390, h: 844, m: 1 }]) {
    for (const mode of ['light', 'dusk']) {
      const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: !!vp.m, hasTouch: !!vp.m, deviceScaleFactor: vp.m ? 2 : 1 });
      await ctx.addInitScript(seedInit, HOUSE(mode));
      const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message));
      await pg.goto(URL); await booted(pg);
      await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
      /* Ravi first (no homework): the bar as it always was */
      await pg.evaluate(() => SB_SHELL.switchChild(1)); await until(pg, () => state.activeIdx === 1 && state.nav === 'home');
      await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['atlas', 'scrHw'], r)));
      await until(pg, () => !!document.querySelector('.sb-home'), null, 15000);
      const R0 = await pg.evaluate(barRead);
      ok(!R0.hw, `${vp.n} ${mode}: Ravi, with no homework, has no homework button — a family without a teacher sees no change`);
      await pg.evaluate(() => SB_SHELL.switchChild(0)); await until(pg, () => state.activeIdx === 0 && state.nav === 'home');
      await setHomework(pg);
      await until(pg, () => !!document.querySelector('.sb-fam-hw'), null, 10000);
      const R1 = await pg.evaluate(barRead);
      const sameSearch = JSON.stringify(R1.search) === JSON.stringify(R0.search), sameCoins = JSON.stringify(R1.coins) === JSON.stringify(R0.coins), sameHead = R1.header[3] === R0.header[3];
      ok(R1.hw && R1.before && (vp.m ? R1.hw[1] < R1.search[1] : R1.hw[0] + R1.hw[2] <= R1.search[0]) && R1.dot && !R1.num && /^My homework — something to do$/.test(R1.label),
        `${vp.n} ${mode}: Ahana's homework button sits left of the search bar ${JSON.stringify(R1.hw)} (search ${JSON.stringify(R1.search)}), a quiet dot and no number ("${R1.label}")`);
      ok(sameSearch && sameCoins && sameHead && R1.sw <= vp.w, `${vp.n} ${mode}: the search bar, the coin chip and the header stand exactly where they stand without it (search ${sameSearch}, coins ${sameCoins}, header ${R1.header[3]}px), nothing past ${vp.w}px (${R1.sw})`);
      if (vp.m) { const hit = await pg.evaluate(hitTest, '.sb-fam-hw'); ok(hit === '', `phone ${mode}: the homework button is a 44px target` + (hit ? ' — ' + hit : '')); }
      const f = await checkShell(pg, { phone: !!vp.m, bee: true });
      ok(!f.length, `${vp.n} ${mode}: checkShell(bee) on Home with homework present: [] ${f.length ? JSON.stringify(f) : ''}`);
      if (!vp.m && mode === 'light') {
        /* the widths between: the button never wraps the bar where it did not wrap before (a flex line wraps on the basis) */
        const W = [];
        for (const w of [700, 1000, 1100]) {
          await pg.setViewportSize({ width: w, height: 800 });
          const a = await pg.evaluate(barRead); await pg.evaluate(() => SB_SHELL.switchChild(1)); await until(pg, () => state.activeIdx === 1);
          const r0 = await pg.evaluate(barRead); await pg.evaluate(() => SB_SHELL.switchChild(0)); await until(pg, () => state.activeIdx === 0 && !!document.querySelector('.sb-fam-hw'));
          W.push(w + ':' + (a.header[3] === r0.header[3] && JSON.stringify(a.coins) === JSON.stringify(r0.coins) && a.sw <= Math.max(w, r0.sw) ? 'same' : 'header ' + a.header[3] + ' vs ' + r0.header[3] + ', coins ' + a.coins + ' vs ' + r0.coins + ', ' + a.sw + ' vs ' + r0.sw + 'px wide'));
        }
        await pg.setViewportSize({ width: vp.w, height: vp.h });
        ok(W.every((x) => /same$/.test(x)), `at 700, 1000 and 1100px the bar keeps its height and its coin chip with the button on it, and the page is no wider than without it (${W.join(', ')})`);
        /* the four tabs, each by its address */
        const T = [];
        for (const [tab, label] of [['concepts', 'Concepts'], ['atlas', 'Atlas'], ['words', 'Word list'], ['history', 'History']]) {
          await pg.evaluate((t) => { location.hash = '#/homework/' + t; }, tab);
          const got = await until(pg, (t) => state.nav === 'homework' && state.hwTab === t && !!document.querySelector('.hw-page[data-hw-tab="' + t + '"]'), tab, 20000);
          const r = await pg.evaluate(() => ({ tabs: [...document.querySelectorAll('.hw-page [role="tab"]')].map((e) => e.textContent.trim()), sel: (document.querySelector('.hw-page [role="tab"][aria-selected="true"]') || {}).textContent, hash: location.hash, cur: (document.querySelector('.sb-fam-hw') || {}).getAttribute && document.querySelector('.sb-fam-hw').getAttribute('aria-current') }));
          T.push(got && r.tabs.join('|') === 'Concepts|Atlas|Word list|History' && String(r.sel).trim() === label && r.hash === '#/homework/' + tab && r.cur === 'page');
        }
        ok(T.every(Boolean), `#/homework/concepts · atlas · words · history each land on their tab, the four tabs drawn and the one shown marked (${T.join(',')})`);
        await pg.evaluate(() => app.goHome());
      }
      await ctx.close();
    }
  }

  /* ================= 2. the word list, the Atlas stop, the chapters — a phone, a persistent profile (it reloads) ================= */
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sb-hw-profile-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: CHROME, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await ctx.addInitScript(seedInit, HOUSE('light'));
  const pg = ctx.pages()[0] || await ctx.newPage(); pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto(URL); await booted(pg);
  const H = await setHomework(pg); await calm(pg);
  await pg.evaluate(() => { window.__said = []; const s = window.say; window.say = function (w) { window.__said.push(String(w)); }; });
  await pg.tap('.sb-fam-hw');
  ok(await until(pg, () => state.nav === 'homework' && !!document.querySelector('.hw-page'), null, 20000), 'a tap on the top bar\'s button opens My Homework');
  ok((await pg.evaluate(() => state.hwTab)) === 'concepts', 'it opens on the first tab with something open (Concepts)');
  {
    await pg.tap('[data-act="hwTab"][data-arg="words"]'); await until(pg, () => state.hwTab === 'words' && !!document.querySelector('[data-act="hwSpell"]'));
    const id = await pg.evaluate(() => SB_HW.items(active()).find((x) => x.kind === 'words' && x.t === 'Words: Easy, 5').id);
    /* the reading deck: words in print, nothing scored */
    const m0 = await pg.evaluate(() => JSON.stringify(active().mast || {}));
    await pg.tap(`[data-act="hwStudy"][data-arg="${id}"]`); await until(pg, () => !!document.querySelector('.hw-deck'));
    await pg.tap('.hw-deck [data-act="hwDeckTog"][data-arg="0"]'); await until(pg, () => !!document.querySelector('.hw-dkb'));
    const deck = await pg.evaluate(() => ({ words: [...document.querySelectorAll('.hw-deck .hw-dk span:first-child')].map((e) => e.textContent), body: document.querySelector('.hw-dkb').innerText, mast: JSON.stringify(active().mast || {}) }));
    ok(deck.words.join() === H.five.join() && /Meaning:/.test(deck.body) && deck.mast === m0, `"Study the list" is a reading deck — the five words, a card opened to its meaning and sentence — and it scores nothing`);
    await pg.tap(`[data-act="hwStudy"][data-arg="${id}"]`);
    /* spell them */
    const cm = await coins.mark(pg);
    await pg.tap(`[data-act="hwSpell"][data-arg="${id}"]`);
    ok(await until(pg, () => !!document.querySelector('.hw-card .hw-in'), null, 10000), '"Spell them" starts the drill on the Word list tab');
    const word = () => pg.evaluate(() => { const R = SB_HW.run(active()); return R && { i: R.i, w: R.ws[R.i] && R.ws[R.i].w, st: R.st, ws: R.ws.map((x) => x.w) }; });
    const leak = () => pg.evaluate(() => { const R = SB_HW.run(active()), w = R.ws[R.i].w, re = new RegExp('\\b' + w + '\\b', 'i'); const root = document.querySelector('#root');
      if (re.test(root.innerText)) return 'text'; for (const el of root.querySelectorAll('*')) for (const a of el.attributes) if (re.test(a.value)) return el.tagName + '[' + a.name + ']'; return ''; });
    const type = (t) => pg.evaluate((t) => { const i = document.querySelector('.hw-in'); i.focus(); i.value = t; i.dispatchEvent(new Event('input', { bubbles: true })); }, t);
    const leaks = [];
    let W0 = await word(); { const l = await leak(); if (l) leaks.push(W0.w + ':' + l); }
    ok(W0.ws.join() === H.five.join() && W0.i === 0, 'the round is the list\'s words in its order');
    await pg.keyboard.press('1'); ok((await pg.evaluate(() => window.__said.slice(-1)[0])) === W0.w, 'the 1 key says the word');
    ok(await pg.evaluate(() => !!document.querySelector('.hw-card[data-live-prompt]') && document.querySelector('.sb-hsearch input').disabled), 'the prompt is in the one live region, and the header search waits while the word is asked');
    /* word 1: a miss, by keyboard */
    await type(W0.w.slice(0, -1) + (W0.w.endsWith('e') ? 'a' : 'e')); await pg.keyboard.press('Enter');
    await until(pg, () => !!document.querySelector('.hw-card .sb-miss'), null, 5000);
    await pg.waitForTimeout(2500);   // longer than any auto-advance: a miss must still be up
    const held = await pg.evaluate((w) => { const R = SB_HW.run(active()); return { i: R.i, st: R.st, next: !!document.querySelector('.hw-next'), err: (document.querySelector('.hw-card .sb-miss') || { dataset: {} }).dataset.err, pile: (active().missed || []).some((x) => x.w === w) }; }, W0.w);
    ok(held.i === 0 && held.st === 'miss' && held.next && held.pile, `a miss HOLDS on the shared miss panel (data-err "${held.err}") until Next, and the word is on the revision pile`);
    await pg.tap('.hw-next'); await until(pg, () => SB_HW.run(active()).i === 1 && SB_HW.run(active()).st === 'ask', null, 5000);
    /* words 2–3 right (a tap, then Enter) */
    for (const how of ['tap', 'key']) {
      const Wd = await word(); { const l = await leak(); if (l) leaks.push(Wd.w + ':' + l); }
      await type(Wd.w); if (how === 'tap') await pg.tap('.hw-check'); else await pg.keyboard.press('Enter');
      await until(pg, (i) => { const R = SB_HW.run(active()); return R.i === i + 1 && R.st === 'ask'; }, Wd.i, 8000);
    }
    const ev = await pg.evaluate((ws) => { const c = active(); return { mast: ws.map((w) => !!(c.mast && c.mast[w] && c.mast[w].ok >= 1)), xp: (c.lists.journey || {}).xp }; }, [H.five[1], H.five[2]]);
    ok(ev.mast.every(Boolean) && ev.xp > 20, `a right answer is the main app's evidence: both words on the mastery record (c.mast), XP up (${ev.xp})`);
    const mid = await coins.since(pg, cm);
    ok(mid.earned === 2 && mid.events.every((e) => e === 'answer'), `two right answers, two coins, both 'answer' (${mid.events.join(', ')})`);
    /* leave half way, reload, come back by address */
    const before = await word();
    await pg.tap('.sb-tabbar [data-act="setNav"][data-arg="home"]'); await until(pg, () => state.nav === 'home');
    await reloadSettled(pg); await booted(pg); await calm(pg);
    await pg.evaluate(() => { location.hash = '#/homework/words'; });
    ok(await until(pg, () => state.nav === 'homework' && !!document.querySelector('.hw-card .hw-in'), null, 30000), 'reloaded and back at #/homework/words, the drill is on screen');
    await pg.evaluate(() => { window.__said = []; window.say = function (w) { window.__said.push(String(w)); }; });
    const after = await word();
    ok(after.i === before.i && after.w === before.w && after.ws.join() === before.ws.join(), `it resumes where it stopped — word ${after.i + 1}, "${after.w}", the same round`);
    for (let k = 0; k < 2; k++) { const Wd = await word(); { const l = await leak(); if (l) leaks.push(Wd.w + ':' + l); }
      await type(Wd.w); await pg.keyboard.press('Enter'); await until(pg, (i) => { const R = SB_HW.run(active()); return R.st === 'done' || (R.i === i + 1 && R.st === 'ask'); }, Wd.i, 8000); }
    ok(!leaks.length, 'while a word is asked, nothing on screen spells it — text or attribute' + (leaks.length ? ' — ' + leaks.join(', ') : ''));
    ok(await until(pg, () => !!document.querySelector('.hw-fin'), null, 8000), 'the round ends on a finish card');
    const F1 = await pg.evaluate(() => ({ h: document.querySelector('.hw-fh').textContent, got: +document.querySelector('.hw-fh').dataset.hwFinGot, rest: !!document.querySelector('.hw-fin [data-act="hwSpell"]') }));
    ok(F1.h === '4 of 5 spelled right' && F1.rest, `it says "${F1.h}" and offers the rest — never a run, never "in a row"`);
    await pg.tap('.hw-fin [data-act="hwSpell"]'); await until(pg, () => !!document.querySelector('.hw-card .hw-in'));
    const Wl = await word(); ok(Wl.ws.join() === H.five[0], `"Spell the rest" asks only the one still to spell (${Wl.ws.join()})`);
    await type(Wl.w); await pg.keyboard.press('Enter');
    await until(pg, () => !!document.querySelector('.hw-fin'), null, 8000);
    const r = await coins.since(pg, cm); const shown = await coins.cardCoins(pg, '.hw-fin');
    ok(r.earned === 5 && r.events.every((e) => e === 'answer'), `five right answers, five coins, every one 'answer' — nothing for finishing (${r.events.join(', ')})`);
    ok(shown === 1 && r.balance === 5, `the finish card prints this round's coin (+${shown}); the wallet moved by the five`);
    const done = await pg.evaluate((id) => { const it = SB_HW.find(active(), id); return { done: it.done, res: it.res, today: SB_HW.today() }; }, id);
    ok(done.done === done.today && done.res.right === 5 && done.res.of === 5, 'every word spelled right once: the list is done today (5 of 5)');
    await pg.tap('.hw-fin [data-act="hwLeave"]'); await until(pg, () => !document.querySelector('.hw-fin'));
    const list = await pg.evaluate(() => [...document.querySelectorAll('.hw-page [data-hw-item]')].map((e) => e.innerText.replace(/\s+/g, ' ')));
    ok(list.length === 1 && /0 of 3 spelled right/.test(list[0]), `the Word list tab now holds only the open list, with "N of M spelled right" ("${list[0] && list[0].slice(0, 60)}")`);
  }
  /* ---- the Atlas stop: through trailUnit, walked by its own Practice ---- */
  {
    await calm(pg);
    await pg.tap('[data-act="hwTab"][data-arg="atlas"]'); await until(pg, () => !!document.querySelector('[data-act="hwStop"]'));
    await pg.evaluate(() => { window.__tu = []; const f = app.trailUnit; app.trailUnit = function (id) { window.__tu.push(id); return f.apply(this, arguments); }; });
    await pg.tap('[data-act="hwStop"]');
    ok(await until(pg, (u) => state.nav === 'trail' && state.trailView === 'unit' && state.trailUnit === u, H.stop, 20000) && (await pg.evaluate(() => window.__tu.slice())).join() === H.stop, `the stop opens through trailUnit (${H.stop}) — the Atlas's own door and lock`);
    const walk = async (u) => {
      await pg.evaluate(() => app.trailPractice());
      await until(pg, () => state.nav === 'train' && !!document.querySelector('[data-inp="onType"]'), null, 20000);
      for (let k = 0; k < 40; k++) { const s = await pg.evaluate(() => ({ over: !!state.sessionOver, w: state.sessionWords && state.sessionWords[state.gi] && state.sessionWords[state.gi].w, gi: state.gi }));
        if (s.over) break; await pg.fill('[data-inp="onType"]', s.w); await pg.press('[data-inp="onType"]', 'Enter');
        await until(pg, (gi) => state.sessionOver || state.gi === gi + 1, s.gi, 6000); }
      return pg.evaluate((u) => ({ over: !!state.sessionOver, p: ((active().trail.st || {})[u + ':1'] || {}).p || 0 }), u); };
    const w1 = await walk(H.stop);
    ok(w1.over && w1.p >= 70, `walked: every word of the stop's Practice typed — the Atlas records ${w1.p}% (the gate is 70)`);
    await calm(pg);
    await pg.evaluate(() => app.openHomework('history')); await until(pg, () => state.hwTab === 'history' && !!document.querySelector('[data-hw-hist]'));
    const s1 = await pg.evaluate((u) => { const it = SB_HW.items(active()).find((x) => x.kind === 'stop' && x.ref === u); const row = document.querySelector(`[data-hw-hist="${it.id}"]`); return { done: it.done, row: row && row.dataset.hwDone, txt: row && row.innerText }; }, H.stop);
    ok(!!s1.done && s1.row === '1' && /Stop walked/.test(s1.txt), 'and the homework is done too — in History, "Stop walked"');
    /* set the next stop, then walk it in the MAIN app — not from homework */
    const nx = await pg.evaluate(() => { const n = SB_TRAIL_NEXT(); SB_HW.add(active(), { kind: 'stop', ref: n.arg, chk: n.kind === 'chk' ? 1 : 0, crs: 'honey', lap: 1, act: 'The Meadow', t: n.title, due: null }); save(); return { arg: n.arg, kind: n.kind }; });
    await pg.evaluate((u) => { app.trailUnit(u); }, nx.arg); await until(pg, (u) => state.trailUnit === u && state.trailView === 'unit', nx.arg, 20000);
    const w2 = await walk(nx.arg); await calm(pg);
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    const s2 = await pg.evaluate((u) => { const it = SB_HW.items(active()).find((x) => x.kind === 'stop' && x.ref === u); return { done: it && it.done }; }, nx.arg);
    ok(nx.kind === 'unit' && w2.p >= 70 && !!s2.done, `a stop set as homework (${nx.arg}) and walked in the main Atlas shows done in homework`);
  }
  /* ---- the chapter set ahead of the Atlas ---- */
  {
    await pg.evaluate(() => app.openHomework('concepts')); await until(pg, () => state.hwTab === 'concepts' && !!document.querySelector('[data-act="hwConcept"]'));
    const id = await pg.evaluate((ci) => SB_HW.items(active()).find((x) => x.kind === 'concept' && +x.ref === ci).id, H.ahead);
    const lockedForRavi = await pg.evaluate((ci) => { state.activeIdx = 1; const r = isConceptUnlocked(ci); state.activeIdx = 0; return !r; }, H.ahead);
    await pg.tap(`[data-act="hwConcept"][data-arg="${id}"]`);
    ok(await until(pg, (t) => state.nav === 'concepts' && state.conceptSel && state.conceptSel.title === t, H.aheadTitle, 20000), `the chapter set ahead of the Atlas opens from My Homework through openConcept ("${H.aheadTitle.split(' — ')[0]}")`);
    ok(lockedForRavi, 'and its lock still holds for Ravi');
    for (let k = 0; k < 12; k++) { const more = await pg.evaluate(() => !!document.querySelector('[data-act="conceptNext"]')); if (!more) break; await pg.tap('[data-act="conceptNext"]'); }
    const rd = await pg.evaluate((ci) => (active().cRead || {})[ci], H.ahead);
    ok(rd === (await pg.evaluate(() => todayKey())), 'read to its last card, the child\'s own record says so (c.cRead)');
    await pg.tap('[data-act="conceptBack"]');
    ok(await until(pg, () => state.nav === 'homework', null, 10000), 'Back from the chapter comes to My Homework');
    const cd = await pg.evaluate((id) => ({ done: SB_HW.find(active(), id).done, open: [...document.querySelectorAll('[data-hw-item]')].map((e) => +e.dataset.hwItem) }), id);
    ok(!!cd.done && !cd.open.includes(id), 'the chapter is done in homework and has left the Concepts tab');
  }
  /* ---- History ---- */
  {
    await pg.tap('[data-act="hwTab"][data-arg="history"]'); await until(pg, () => state.hwTab === 'history');
    const Hs = await pg.evaluate(() => [...document.querySelectorAll('[data-hw-hist]')].map((e) => ({ id: +e.dataset.hwHist, done: e.dataset.hwDone, t: e.innerText.replace(/\s+/g, ' ') })));
    const late = Hs.find((x) => /Words: Easy, 3/.test(x.t)), list = Hs.find((x) => /Words: Easy, 5/.test(x.t)), ch = Hs.find((x) => x.t.indexOf(H.aheadTitle.split(' — ')[0]) >= 0);
    ok(list && list.done === '1' && /Set .* · due .* · done /.test(list.t) && /Every word spelled right/.test(list.t) && ch && /Read to the end/.test(ch.t),
      `History lists finished homework with the day set, due and done, and its result ("${list && list.t.slice(0, 80)}")`);
    ok(late && late.done === '0' && /Not finished yet/.test(late.t) && !/(late|overdue|missed|failed)/i.test(late.t), `past its due date and unfinished, it says "Not finished yet" and nothing harsher ("${late && late.t}")`);
  }
  /* ---- axe on My Homework, light and dusk ---- */
  if (AXE) {
    await pg.addScriptTag({ path: AXE });
    for (const mode of ['light', 'dusk']) for (const tab of ['words', 'history']) {
      await pg.evaluate(([m, t]) => { state.mode = m; app.openHomework(t); }, [mode, tab]); await until(pg, (t) => state.hwTab === t && !!document.querySelector('.hw-page'), tab);
      const v = await pg.evaluate(async () => { const r = await axe.run(document.querySelector('.sb-content'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
        return r.violations.map((x) => x.id + ' (' + x.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ') + ')'); });
      ok(!v.length, `axe finds nothing on My Homework (${tab}) in ${mode}` + (v.length ? ' — ' + v.join('; ') : ''));
    }
    await pg.evaluate(() => { state.mode = 'light'; render(); });
  } else ok(false, 'axe-core is not installed — symlink the main checkout\'s node_modules');
  /* ---- the report card ---- */
  {
    await pg.evaluate(() => app.goHome()); await until(pg, () => state.nav === 'home');
    await pg.tap('.sb-fam-lock'); await until(pg, () => !!state.pinDlg);
    for (const d of '1234') await pg.tap(`[data-pin-dlg] [data-act="pinKey"][data-arg="${d}"]`);
    ok(await until(pg, () => !!document.querySelector('[data-rc-hw]'), null, 30000), 'the Parent Zone\'s report card carries a Homework section');
    const rc = await pg.evaluate(() => { const e = document.querySelector('[data-rc-hw]'), R = SB_HW.report(active());
      return { d: Object.assign({}, e.dataset), R, open: [...e.querySelectorAll('[data-rc-hw-open]')].map((x) => x.innerText) }; });
    const R = rc.R;
    ok(+rc.d.hwAssigned === R.assigned && R.assigned === 6 && +rc.d.hwDone === R.done && R.done === 4 && +rc.d.hwOntime === R.onTime && rc.d.hwWords === '5/8' && rc.d.hwStops === '2/2' && rc.d.hwChs === '1/2',
      `its numbers are the record's: ${R.assigned} set, ${R.done} done (${R.onTime} on time), words ${rc.d.hwWords}, stops ${rc.d.hwStops}, chapters ${rc.d.hwChs}`);
    ok(rc.open.length === 2 && rc.open.some((t) => /Words: Easy, 3/.test(t) && /was due/.test(t)), `and the open items: ${rc.open.join(' · ')}`);
  }
  await ctx.close(); try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) {}

  /* ================= 3. ?demo writes nothing ================= */
  {
    const REAL = { sb_saas_v2: JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '4321', activeIdx: 0, children: [{ name: 'Zara', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'spellbound', coins: 77 }] }),
      'bizzing.wallet': JSON.stringify({ v: 1, kids: { zara: { coins: 31, ledger: [] } } }) };
    const c3 = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true });
    await c3.addInitScript((r) => { if (!localStorage.getItem('t_seed')) { for (const k in r) localStorage.setItem(k, r[k]); localStorage.setItem('t_seed', '1'); }
      try { const raw = {}; for (const k in r) raw[k] = Storage.prototype.getItem.call(window.localStorage, k); window.__raw = raw; } catch (e) {} }, REAL);
    const p3 = await c3.newPage(); p3.on('pageerror', (e) => errs.push('demo: ' + e.message));
    await p3.goto(URL.replace('index.html', 'index.html?demo')); await booted(p3);
    await p3.evaluate(() => new Promise((r) => SB_LAZY.need(['atlas', 'scrHw', 'words'], r)));
    const dm = await p3.evaluate(async () => { const c = active(); const ws = nextWords.pool(c, { purpose: 'drill', level: 'easy', needDef: true, filter: (w) => /^[a-z]{4,8}$/.test(w.w) }).slice(0, 3).map((w) => ({ w: w.w, d: w.d, s: w.s || '', p: w.p || '' }));
      const it = SB_HW.add(c, { kind: 'words', ref: null, words: ws, t: 'Words: Easy, 3', due: null }); save();
      app.openHomework('words'); app.hwSpell(it.id); await new Promise((r) => setTimeout(r, 200));
      app.hwType(ws[0].w); app.hwCheck(); await new Promise((r) => setTimeout(r, 300));
      return { demo: SB_SHELL.demo, name: c.name, got: (SB_HW.find(c, it.id).got || []).length }; });
    ok(dm.demo && dm.name === 'Mira' && dm.got === 1, '?demo: homework set and a word spelled in the sample');
    const p4 = await c3.newPage(); await p4.goto(URL.replace('index.html', 'privacy.html')); await p4.waitForFunction(() => !!window.__raw, null, { timeout: 10000 }).catch(() => {});
    const raw = await p4.evaluate(() => window.__raw);
    ok(raw && raw.sb_saas_v2 === REAL.sb_saas_v2 && raw['bizzing.wallet'] === REAL['bizzing.wallet'], '?demo writes nothing: the device\'s real household and wallet are byte-identical');
    await c3.close();
  }

  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + [...new Set(errs)].slice(0, 4).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nMy Homework holds');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
