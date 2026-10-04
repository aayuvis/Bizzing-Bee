/* T13 — THE LEVEL RULE (games spec §1.7, owner's rule) — @check

   The child chooses a level; after every round 50% or more keeps it and under 50% drops it one
   (floor Easy) with a kind line; a hand-set level sticks until the next round's check; two rounds in
   a row at 80%+ offer the next level as a tap. SB_LEVEL (app3.js) keeps it per child in c.levels,
   through the store. This drives SB_LEVEL on the real page:
     · three rounds at 40% from Champ drop one level each — Hard, Medium, Easy — and a fourth stays
       on Easy without saying it dropped; the line reads "Let's warm up on Medium…"
     · 50% holds, exactly; 0.4 means 40%
     · a hand-set level sticks through renders, other games' rounds and a reload, until its own
       next check moves it
     · Auto drops from the level it stands for; a hub's level is its modes' default
     · two rounds at 80% offer the next level (none on Champ, none with OFFER_UP off)
     · one child's level is not another's; the chip is a labelled button that steps the level
   Proved by breaking: change `p<50` to `p<40` in SB_LEVEL.after and the 40% checks fail.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/levels.cjs                            */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const kid = (name, band) => ({ name, age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, band, lists: { journey: { xp: 12 } }, activeList: 'journey' });
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [kid('Ahana', 5), kid('Bea', 2)] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const ctx = await b.newContext({ viewport: { width: 1000, height: 800 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_lv')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_lv', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html');
  ok(await booted(pg), 'the app booted');
  const r = await pg.evaluate(() => { const L = SB_LEVEL, o = {};
    o.api = ['get', 'set', 'after', 'chip'].every(k => typeof L[k] === 'function');
    o.fresh = L.get('honeycombRun');
    L.set('typeBlaster', 'champ');
    o.drops = [40, 40, 40, 40].map(p => { const x = L.after('typeBlaster', p); return x.level + (x.dropped ? '↓' : ''); });
    L.set('typeBlaster', 'hard'); o.line = L.after('typeBlaster', 40).line;
    L.set('beeGrandPrix', 'medium'); o.hold = [L.after('beeGrandPrix', 50).level, L.after('beeGrandPrix', 0.5).level, L.after('beeGrandPrix', 0.4).level];
    o.hist = (active().levels.beeGrandPrix || {}).history.join(',');
    /* a hand-set level sticks */
    L.set('gym/sprint', 'hard'); render(); L.after('typeBlaster', 10); L.after('gym/warmup', 10); render();
    o.stick = L.get('gym/sprint');
    /* auto */
    o.autoIs = L.resolve('honeycombRun'); const a = L.after('honeycombRun', 20); o.autoDrop = a.level + (a.dropped ? '↓' : '');
    /* hub default */
    L.set('lore', 'champ'); o.hub = [L.get('lore/roots'), L.get('lore/clock')]; L.set('lore/roots', 'easy'); o.hub.push(L.get('lore/roots'), L.get('lore/clock'));
    /* offer up */
    L.set('wordForge', 'medium'); const u1 = L.after('wordForge', 85), u2 = L.after('wordForge', 90);
    o.offer = [u1.offerUp, u2.offerUp]; o.upBtn = L.upButton('wordForge', u2);
    L.set('dailyBee', 'champ'); L.after('dailyBee', 90); o.champ = L.after('dailyBee', 95).offerUp;
    L.OFFER_UP = false; L.set('mockbee', 'easy'); L.after('mockbee', 90); o.off = L.after('mockbee', 90).offerUp; L.OFFER_UP = true;
    /* the chip */
    const div = document.createElement('div'); div.innerHTML = L.chip('mockbee', 'Mock Spelling Bee'); const btn = div.firstElementChild;
    o.chip = { tag: btn.tagName, act: btn.dataset.act, arg: btn.dataset.arg, label: btn.getAttribute('aria-label'), text: btn.textContent.trim() };
    app.levelChip('mockbee'); o.stepped = L.get('mockbee');
    /* another child */
    state.activeIdx = 1; o.other = [L.get('typeBlaster'), L.get('gym/sprint')]; state.activeIdx = 0;
    save(); return o; });
  ok(r.api && r.fresh === 'auto', 'SB_LEVEL is on the page, and a game never played is on Auto');
  ok(r.drops.slice(0, 3).join() === 'hard↓,medium↓,easy↓', `three rounds at 40% from Champ drop one level each: ${r.drops.slice(0, 3).join(' → ')}`);
  ok(r.drops[3] === 'easy', `the floor is Easy, and a fourth round there does not say it dropped (${r.drops[3]})`);
  ok(r.line === 'Let’s warm up on Medium. You can move back up any time.', `the drop comes with the kind line: "${r.line}"`);
  ok(r.hold.join() === 'medium,medium,easy' && r.hist === '50,50,40', `50% holds (as 50 or 0.5), 0.4 is 40% and drops — ${r.hold.join(', ')}; history ${r.hist}`);
  ok(r.stick === 'hard', `a hand-set level sticks through renders and other games' rounds (${r.stick})`);
  ok(r.autoIs === 'medium' && r.autoDrop === 'easy↓', `Auto drops from the level it stands for (Auto = ${r.autoIs} → ${r.autoDrop})`);
  ok(r.hub.join() === 'champ,champ,easy,champ', `a hub's level is its modes' default until a mode has its own (${r.hub.join(', ')})`);
  ok(r.offer[0] === null && r.offer[1] === 'hard' && /data-act="levelUp"[^>]*data-arg="wordForge\|hard"[^>]*>Ready for Hard\?</.test(r.upBtn), `two rounds at 80%+ offer the next level as a tap: "${r.upBtn.replace(/<[^>]+>/g, '')}"`);
  ok(r.champ === null && r.off === null, 'no offer above Champ, and none with OFFER_UP switched off');
  ok(r.chip.tag === 'BUTTON' && r.chip.act === 'levelChip' && r.chip.arg === 'mockbee' && /^Word level for Mock Spelling Bee: Easy\. Tap for Medium$/.test(r.chip.label) && r.chip.text === 'Easy ▾', `the chip is a labelled button (${r.chip.label})`);
  ok(r.stepped === 'medium', `tapping it steps the level (Easy → ${r.stepped})`);
  ok(r.other.join() === 'auto,auto', 'one child’s levels are not another’s');
  /* a reload: the levels are the child's, in the household */
  await pg.reload(); await booted(pg);
  const after = await pg.evaluate(() => { const raw = JSON.parse(SB_STORE.get('household')); return { sv: raw.sv, levels: Object.keys(raw.children[0].levels || {}).length, sprint: SB_LEVEL.get('gym/sprint'), hist: SB_LEVEL.get('beeGrandPrix') }; });
  ok(after.levels >= 6 && after.sprint === 'hard' && after.hist === 'easy', `after a reload the levels are still the child's (${after.levels} kept in the household, sv ${after.sv}); the hand-set Hard still stands`);
  const moved = await pg.evaluate(() => SB_LEVEL.after('gym/sprint', 30).level);
  ok(moved === 'medium', `and its next round's check moves it (${moved})`);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
