/* BUILD A WORD — Word Lore's drag-to-build mode over Word Forge's table (road to 4.5, P3.16) — @check

   A new item type: hear a word, read what it means (masked), put its parts in order. It shares Word Forge's data
   (forge-data.js, GENERATED and cited — never edited) and its rules (forge-core.js: rack, grade, the reason a part is
   wrong, the pay). This holds:
     1. THE GATE: while the forge's table is unsigned a child sees no Build tile on Word Lore's hub, and the typed
        address #/lore/build lands on the hub — only tester mode (or the owner's sign-off) shows it;
     2. NEVER THE ANSWER: while an item is open the word is in no text node and no attribute on the page (aria-labels
        and the live prompt included), and the meaning is masked;
     3. KEYBOARD: the number on a tile places it in the next slot, Backspace takes the last one back, Enter checks;
        a right build plays the mode's own sting and shows the word only now;
     4. TOUCH, TAP: tapping a tile drops it in the next empty slot, tapping a filled slot takes it back;
     5. TOUCH, DRAG: a part dragged onto the SECOND slot lands in the second slot (not the next empty one);
     6. A MISS HOLDS: a wrong part, checked, holds on the shared miss card with the word, what was built and why;
        Continue moves on; nothing auto-advances;
     7. PAY through Word Forge's own rule (forge-core roundPay): Medium pays its rights at the round's end once half are
        built, and the finish card's coins equal the wallet's change; under half pays nothing; Easy (the exact parts, no
        look-alikes) is practice and never pays; no mastery is written by picking parts;
     8. ON A PHONE (390×844, touch): every Build control is a 44px target and nothing leaves the screen sideways.
   Proved by breaking (13 Oct 2026, the four faults put in together, the test watched to fail, all taken out and the
   file compared with its copy): 8 fail —
     · the mode's tile gate removed (gate: () => true): "no Build tile" fails (the address still lands on the hub: start()
       asks buildOpen() again, so the door holds on its own);
     · the word put in every tile's aria-label: "in no text and no attribute" fails, naming the attributes;
     · bPlace ignoring the slot a part was dropped on (always the next empty one): the desktop drag and the finger drag
       fail, and the item it leaves half-built takes "a miss holds" and "nothing moves on by itself" with it;
     · owed() on Lore's own 6-of-10 rule instead of forge-core's roundPay: "Easy is practice … no coins" fails (+8).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/lore-build.cjs                                     */
const { chromium } = require('playwright');
const path = require('path');
const W = require('./lib/wait.cjs');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' };
const seed = k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } };

/* in the page: the word anywhere — a text node or any attribute — as a whole word */
function wordOnPage(w) { const re = new RegExp('\\b' + w + '\\b', 'i'); const hits = [];
  const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  for (let n = walk.currentNode; n; n = walk.nextNode()) {
    if (n.nodeType === 3) { if (re.test(n.nodeValue) && !(n.parentElement && n.parentElement.closest('script,style'))) hits.push('text: ' + n.nodeValue.trim().slice(0, 60)); continue; }
    if (n.tagName === 'SCRIPT' || n.tagName === 'STYLE') continue;
    for (const a of n.attributes) if (re.test(a.value)) hits.push(n.tagName.toLowerCase() + '[' + a.name + ']: ' + a.value.slice(0, 60)); }
  return hits; }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });

  /* ---------------------------------------------------------------- 1. the gate */
  console.log('\n1. The gate: unsigned and not a tester — no tile, and the address lands on the hub');
  let ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await ctx.addInitScript(seed, KID);
  let pg = await ctx.newPage(); let errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await W.booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['quizhubs', 'forgeData'], r)));
  const signed = await pg.evaluate(() => !!(window.SB_FORGE && SB_FORGE.signedOff));
  if (!signed) {
    await pg.evaluate(() => app.openLore());
    await W.until(pg, () => state.nav === 'lore' && !!document.querySelector('[data-act="hubMode"]'), null, 30000);
    const tiles = await pg.evaluate(() => [...document.querySelectorAll('[data-act="hubMode"]')].map(e => e.dataset.arg));
    ok(tiles.length === 7 && !tiles.includes('lore/build'), `a child sees Word Lore's seven modes and no Build tile (${tiles.join(', ')})`);
    await pg.evaluate(() => { location.hash = '#/lore/build'; });
    await W.until(pg, () => state.nav === 'lore', null, 8000); await pg.waitForTimeout(500);
    ok(await pg.evaluate(() => state.qz && state.qz.mode !== 'build'), `#/lore/build lands on the hub (${await pg.evaluate(() => state.qz && (state.qz.mode || 'hub'))})`);
  } else console.log('  SKIP the gate: the owner has signed the table off');
  await ctx.close();

  /* ---------------------------------------------------------------- 2–7 on a desktop, as a tester */
  ctx = await b.newContext({ viewport: { width: 1280, height: 800 } }); await ctx.addInitScript(seed, KID);
  pg = await ctx.newPage(); errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await W.booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['quizhubs', 'arcade'], r)));
  await pg.evaluate(() => { state.tester = true; try { SB_VOL.setMusic(false); } catch (e) {} });
  const open = async (level) => { await pg.evaluate(l => { if (window.SB_LEVEL) SB_LEVEL.set('lore/build', l); app.openLore('build'); }, level);
    return W.until(pg, () => state.qz && state.qz.mode === 'build' && state.qz.phase === 'play' && !!document.querySelector('.qzb-tile'), null, 60000); };
  const it = () => pg.evaluate(() => { const g = state.qz, i = g.it; return { i: g.i, n: g.n, w: i.r.w, parts: i.r.parts, rack: i.rack.map(t => ({ id: t.id, s: t.s, used: t.used })),
    slots: i.slots.map(x => x && x.s), done: i.done, ok: i.ok, held: !!g.held, right: g.right, asked: g.asked }; });
  /* the rack index (the key on its tile) of each right part, in order */
  const keysFor = (x) => { const used = {}; return x.parts.map(p => { const k = x.rack.findIndex((t, j) => t.s === p && !used[j] && !t.used); used[k] = 1; return k; }); };

  console.log('\n2. Never the answer');
  ok(await open('medium'), 'tester mode opens Build a Word (#/lore/build) on Medium');
  ok(await pg.evaluate(() => [...document.querySelectorAll('.sb-stage [data-act="qzbTile"]')].length >= 4), 'the rack holds the parts and look-alikes (Medium)');
  let x = await it();
  const hits = await pg.evaluate(wordOnPage, x.w);
  ok(!hits.length, `while the item is open "${x.w}" is in no text and no attribute on the page${hits.length ? ' — ' + hits.slice(0, 3).join(' | ') : ''}`);
  const live = await pg.evaluate(() => (document.getElementById('sb-live') || {}).textContent || '');
  ok(/^Word 1 of \d+\. Listen, then build the word from its parts/.test(live), `the one live region says which word and what to do ("${live.slice(0, 70)}")`);

  console.log('\n3. Keyboard');
  const st0 = await pg.evaluate(() => Date.now());
  const ks = keysFor(x);
  await pg.keyboard.press(String(ks[0] + 1));
  ok((await it()).slots[0] === x.parts[0], `the number on a tile places it in the next slot (${(await it()).slots.join(' + ')})`);
  await pg.keyboard.press('Backspace');
  ok((await it()).slots.every(s => s == null), 'Backspace takes the last part back');
  for (const k of ks) await pg.keyboard.press(String(k + 1));
  await pg.keyboard.press('Enter');
  await W.until(pg, () => state.qz.it.done, null, 3000);
  x = await it();
  const sting = await pg.evaluate(t => (window.SGUI && SGUI._stung || []).filter(s => s.t >= t).map(s => s.game + '/' + s.kind), st0);
  ok(x.ok && x.right === 1 && sting.includes('build/right'), `Enter checks: a right build counts and plays the mode's own sting (${sting.join(', ')})`);
  ok(await pg.evaluate(w => document.querySelector('.qzb-got') && new RegExp('\\b' + w + '\\b', 'i').test(document.querySelector('.qzb-got').textContent), x.w), 'the word is shown only now, with what its parts mean');
  await pg.keyboard.press('Enter'); await W.until(pg, i => state.qz.i !== i && !state.qz.it.done, x.i, 5000);

  console.log('\n4. Touch: tap a part, tap a slot');
  x = await it(); let k2 = keysFor(x);
  await pg.click(`.qzb-tile[data-tile="${x.rack[k2[0]].id}"]`);
  ok((await it()).slots[0] === x.parts[0], 'a tapped part drops into the next empty slot');
  await pg.click('.qzb-slot[data-slot="0"]');
  ok((await it()).slots[0] == null, 'a tapped slot gives its part back');
  for (const k of k2) await pg.click(`.qzb-tile[data-tile="${x.rack[k].id}"]`);
  await pg.click('.qzb-check');
  await W.until(pg, () => state.qz.it.done, null, 3000);
  ok((await it()).ok, 'tapped in order and checked: right');
  await pg.click('.sb-stage .qz-go'); await W.until(pg, i => state.qz.i !== i && !state.qz.it.done, x.i, 5000);

  console.log('\n5. Touch: drag a part onto a slot');
  x = await it(); k2 = keysFor(x);
  const drag = async (tileId, slot) => { const a = await pg.locator(`.qzb-tile[data-tile="${tileId}"]`).boundingBox(), s = await pg.locator(`.qzb-slot[data-slot="${slot}"]`).boundingBox();
    await pg.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await pg.mouse.down();
    for (let t = 1; t <= 8; t++) await pg.mouse.move(a.x + a.width / 2 + (s.x + s.width / 2 - a.x - a.width / 2) * t / 8, a.y + a.height / 2 + (s.y + s.height / 2 - a.y - a.height / 2) * t / 8);
    await pg.mouse.up(); await pg.waitForTimeout(120); };
  await drag(x.rack[k2[1]].id, 1);
  const afterDrag = (await it()).slots;
  ok(afterDrag[1] === x.parts[1] && afterDrag[0] == null, `a part dragged onto the second slot lands in the second slot (${afterDrag.map(s => s || '·').join(' + ')})`);
  await drag(x.rack[k2[0]].id, 0);
  for (let j = 2; j < k2.length; j++) await drag(x.rack[k2[j]].id, j);
  await pg.click('.qzb-check'); await W.until(pg, () => state.qz.it.done, null, 3000);
  ok((await it()).ok, `dragged into place and checked: right (${(await it()).slots.join(' + ')})`);
  await pg.keyboard.press('Enter'); await W.until(pg, i => state.qz.i !== i && !state.qz.it.done, x.i, 5000);

  console.log('\n6. A miss holds');
  x = await it();
  const wrongIdx = x.rack.findIndex(t => !x.parts.includes(t.s));
  const kk = keysFor(x); kk[0] = wrongIdx;
  for (const k of kk) await pg.keyboard.press(String(k + 1));
  await pg.keyboard.press('Enter');
  await W.until(pg, () => !!document.querySelector('.sg-misscard'), null, 4000);
  const miss = await pg.evaluate(() => { const c = document.querySelector('.sg-misscard'); return c ? c.textContent.replace(/\s+/g, ' ') : ''; });
  ok(/Here is the word/.test(miss) && /Its parts:/.test(miss) && (await it()).held && !(await it()).ok, `a wrong build holds on the miss card with the word, what was built and why ("${miss.slice(0, 110)}")`);
  await pg.waitForTimeout(1900);
  ok((await it()).i === x.i && !!(await pg.evaluate(() => document.querySelector('.sg-misscard'))), 'nothing moves on by itself');
  await pg.keyboard.press('Enter'); await W.until(pg, i => state.qz.i !== i, x.i, 5000);
  ok((await it()).i === x.i + 1, 'Continue moves on');

  console.log('\n7. Pay: Word Forge\'s own rule');
  const playRound = async (level, rightN) => { await open(level); await pg.evaluate(() => { walletSync(active()); });
    const c0 = await pg.evaluate(() => earnedSoFar()); const m0 = await pg.evaluate(() => JSON.stringify(active().mast || {}));
    for (let guard = 0; guard < 20 && await pg.evaluate(() => state.qz.phase === 'play'); guard++) {
      const y = await it(); if (y.held) { await pg.keyboard.press('Enter'); await pg.waitForTimeout(150); continue; }
      if (y.done) { await pg.keyboard.press('Enter'); await W.until(pg, i => state.qz.phase !== 'play' || state.qz.i !== i, y.i, 4000); continue; }
      const ks2 = keysFor(y); if (y.asked >= rightN) { const w = y.rack.findIndex(t => !y.parts.includes(t.s)); if (w >= 0) ks2[0] = w; else ks2.reverse(); }
      for (const k of ks2) await pg.keyboard.press(String(k + 1));
      await pg.keyboard.press('Enter'); await W.until(pg, () => state.qz.it.done || state.qz.held, null, 3000);
      if (await pg.evaluate(() => state.qz.held)) { await W.until(pg, () => !!document.querySelector('.sg-misscard'), null, 3000); await pg.waitForTimeout(300); await pg.keyboard.press('Enter'); }
      await W.until(pg, i => state.qz.phase !== 'play' || state.qz.i !== i, y.i, 5000); }
    await W.until(pg, () => state.qz.phase === 'done', null, 6000);
    return pg.evaluate(([c0, m0]) => ({ right: state.qz.right, asked: state.qz.asked, coins: state.qz.coins, ledger: earnedSoFar() - c0, rack: state.qz.rack, mast: JSON.stringify(active().mast || {}) === m0,
      card: (document.querySelector('.qz-pay, .qz-nopay') || {}).textContent || '' }), [c0, m0]); };
  const med = await playRound('medium', 99);
  ok(med.rack === 'medium' && med.right === med.asked && med.coins === med.right && med.ledger === med.coins,
    `Medium, every word built: ${med.right} of ${med.asked} pays ${med.coins} at the round's end, and the wallet moved ${med.ledger} ("${med.card.trim()}")`);
  ok(med.mast, 'picking parts writes no mastery');
  const low = await playRound('medium', 2);
  ok(low.right < low.asked / 2 && low.coins === 0 && low.ledger === 0, `Medium under half (${low.right} of ${low.asked}) pays nothing (${low.coins}, wallet ${low.ledger})`);
  const easy = await playRound('easy', 99);
  ok(easy.rack === 'easy' && easy.right === easy.asked && easy.coins === 0 && easy.ledger === 0, `Easy is practice: the exact parts, ${easy.right} of ${easy.asked} built, and no coins (${easy.coins}; "${easy.card.trim()}")`);
  ok(!errs.length, 'no page errors (desktop)' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await ctx.close();

  /* ---------------------------------------------------------------- 8. a phone */
  console.log('\n8. A phone, 390×844, touch');
  ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }); await ctx.addInitScript(seed, KID);
  pg = await ctx.newPage(); errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await W.booted(pg);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need(['quizhubs', 'arcade'], r)));
  await pg.evaluate(() => { state.tester = true; if (window.SB_LEVEL) SB_LEVEL.set('lore/build', 'medium'); app.openLore('build'); });
  await W.until(pg, () => state.qz && state.qz.mode === 'build' && state.qz.phase === 'play' && !!document.querySelector('.qzb-tile'), null, 60000);
  await W.quietRender(pg, 500);
  const px = await pg.evaluate(() => { const els = [...document.querySelectorAll('.sb-stage .qzb-tile:not([disabled]), .sb-stage .qzb-slot, .sb-stage .qzb-acts button:not([disabled]), .sb-stage .qz-hear')];
    const small = [], off = [];
    for (const e of els) { e.scrollIntoView({ block: 'center' }); const q = e.getBoundingClientRect(); const cx = (q.left + q.right) / 2, cy = (q.top + q.bottom) / 2;
      if (q.left < 0 || q.right > innerWidth) off.push(e.className);
      const pts = [[-15, -15], [0, -21], [15, -15], [-21, 0], [21, 0], [-15, 15], [0, 21], [15, 15]];
      if (pts.some(([dx, dy]) => { const h = document.elementFromPoint(cx + dx, cy + dy); return !(h && (h === e || e.contains(h))); })) small.push((e.getAttribute('aria-label') || e.textContent).trim().slice(0, 24) + ' ' + Math.round(q.width) + '×' + Math.round(q.height)); }
    return { n: els.length, small, off, sideways: document.scrollingElement.scrollWidth > innerWidth }; });
  ok(px.n >= 6 && !px.small.length && !px.off.length && !px.sideways, `every Build control is a 44px target and on screen (${px.n} measured${px.small.length ? '; small: ' + px.small.join(', ') : ''}${px.off.length ? '; off: ' + px.off.join(', ') : ''}${px.sideways ? '; the page scrolls sideways' : ''})`);
  /* a real finger drag on a phone */
  x = await it(); k2 = keysFor(x);
  const cdp = await ctx.newCDPSession(pg);
  const fdrag = async (tileId, slot) => { const a = await pg.locator(`.qzb-tile[data-tile="${tileId}"]`).boundingBox(), s = await pg.locator(`.qzb-slot[data-slot="${slot}"]`).boundingBox();
    const p0 = { x: a.x + a.width / 2, y: a.y + a.height / 2 }, p1 = { x: s.x + s.width / 2, y: s.y + s.height / 2 };
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [p0] });
    for (let t = 1; t <= 8; t++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: p0.x + (p1.x - p0.x) * t / 8, y: p0.y + (p1.y - p0.y) * t / 8 }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await pg.waitForTimeout(150); };
  await fdrag(x.rack[k2[1]].id, 1);
  const fd = (await it()).slots;
  ok(fd[1] === x.parts[1] && fd[0] == null, `a finger drags a part onto the second slot (${fd.map(s => s || '·').join(' + ')})`);
  ok(!errs.length, 'no page errors (phone)' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
