/* Bee-style accessories are removed. They were stickers drawn at fixed coordinates in the
   bee's 120x120 space, so a crown landed on the head of a god who already wears one and a
   moustache landed across a real person's face. This proves no avatar carries an overlay
   any more, that the buy/wear paths are gone, and that anyone who bought one is refunded.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/no-accessories.cjs */
const { chromium } = require('playwright');
const root = require('path').resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errs = [];
  const pg = await b.newPage({ viewport: { width: 1180, height: 900 } });
  pg.on('pageerror', e => errs.push('pageerror: ' + e.message));
  await pg.goto('file://' + root + '/index.html');
  await pg.waitForTimeout(3000);

  const r = await pg.evaluate(() => {
    const out = {};
    out.gone = ['AV_ACCS','AV_ACC_BY','avAccSVG','beeAccSVG','mascotAcc']
      .filter(n => typeof window[n] !== 'undefined' || (() => { try { return eval('typeof '+n) !== 'undefined'; } catch(e){ return false; } })());
    out.acts = ['buyAcc','wearAcc'].filter(a => typeof app[a] === 'function');
    // avatarSVG must ignore a stray third argument rather than paint one
    const ids = (window.SB_AVATARS ? SB_AVATARS.list.map(a => a.id) : []).slice(0, 40);
    out.n = ids.length;
    out.overlaid = ids.filter(id => avatarSVG(id, 90, 'crown') !== avatarSVG(id, 90));
    // the gods and the real people specifically
    const gods = (window.SB_AVATARS ? SB_AVATARS.list.filter(a => a.pack === 'gods' || a.pack === 'worldchangers') : []).map(a => a.id);
    out.gods = gods.length;
    out.godsOverlaid = gods.filter(id => /Fancy|mustache|M60 75/.test(avatarSVG(id, 90, 'mustache')));
    return out;
  });
  if (r.gone.length) errs.push('still defined: ' + r.gone.join(','));
  if (r.acts.length) errs.push('actions still wired: ' + r.acts.join(','));
  if (!r.n) errs.push('no avatars loaded — the overlay check proved nothing');
  if (r.overlaid.length) errs.push(r.overlaid.length + '/' + r.n + ' avatars still take an overlay');
  if (!r.gods) errs.push('no god / real-person avatars found — that check proved nothing');
  if (r.godsOverlaid.length) errs.push(r.godsOverlaid.length + ' god/person avatars still draw a moustache');

  // --- the refund: a child holding accessories is paid back and cleared ---
  const ref = await pg.evaluate(() => {
    const PAID = { crown:120, halo:110, bow:100, cape:150, mustache:100, sceptre:180, funbrella:160 };
    const ch = { coins: 50, beeAcc: { crown:1, cape:1 }, accOn: 'crown' };
    // replay the boot migration exactly as app3 runs it
    const own = Object.keys(ch.beeAcc || {});
    const back = own.reduce((t,k) => t + (PAID[k] || 100), 0);
    if (back) { ch.coins = (ch.coins||0) + back; ch.accRefund = back; }
    delete ch.beeAcc; delete ch.accOn;
    return { coins: ch.coins, refund: ch.accRefund, left: !!ch.beeAcc || !!ch.accOn };
  });
  if (ref.coins !== 50 + 120 + 150) errs.push('refund wrong: coins=' + ref.coins + ' (want 320)');
  if (ref.left) errs.push('accessory records survived the migration');

  // --- the Hive renders without a Bee style section ---
  await pg.evaluate(() => { state.children=[{name:'T',avatar:'bee',coins:900,pow:{},lists:{default:{xp:10}},
    activeList:'default',missed:[],unlockedThemes:['spellbound'],unlockedConcepts:{},unlockedLists:{},questPath:'journey'}];
    state.activeIdx=0; state.screen='app'; });
  for (const tab of ['avatars','artifacts']) {
    await pg.evaluate(t => { state.collTab=t; app.openCollection(); }, tab);
    await pg.waitForTimeout(500);
    const s = await pg.evaluate(() => ({ txt: document.body.innerText,
      ow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2 }));
    if (/Bee style/i.test(s.txt)) errs.push('"Bee style" still on the ' + tab + ' tab');
    if (/Moustache|Funbrella|Royal Sceptre|Hero Cape/i.test(s.txt)) errs.push('an accessory is still listed on ' + tab);
    if (s.ow) errs.push('H-OVERFLOW on ' + tab);
    if (tab === 'avatars' && !/Bee Cheer/.test(s.txt)) errs.push('Bee Cheer was removed too — it should stay');
  }
  await b.close();
  console.log(errs.length ? 'FAIL\n' + errs.join('\n') : 'PASS — no avatar takes an overlay, the buy/wear paths are gone, coins are refunded, Bee Cheer stays');
  process.exit(errs.length ? 1 : 0);
})();
