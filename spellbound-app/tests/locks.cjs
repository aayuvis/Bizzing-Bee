/* A LOCK SAYS HOW TO OPEN IT, AND NEVER SHOWS A CHILD A PRICE (FIX-BEE C4).

   Locks used to come in one shape — a padlock — and most carried a price: "🔒 400 🪙" on a
   world, "🔒 150 🪙" on a chapter, "Unlock · $299/yr →" across the Atlas, "🔒 $299/yr" on a
   Practice pill. Two different things wore the same padlock: a LEARNING lock (you have not
   got there yet) and a PAYWALL (a grown-up has not bought it), and a child could not tell
   which was which or what to do about either.

   Now there are two kinds, drawn differently (lockChip): a learning lock — path icon, accent
   ink, dashed edge — that names the learning that opens it ("Reach Level 5", "Opens at stop
   3 of the Meadow"); and a plan lock — padlock, quiet grey — that says it comes with the plan
   and to ask a grown-up. Prices live on the plan sheet, behind the grown-up PIN.

   This walks the screens a child reaches on a FREE plan and fails on:
     • any money on a child's screen ($, /yr, /month…), or a coin price on a locked thing;
     • any lock — chip or padlock icon — whose words do not name how to open it;
     • learning and plan locks that look the same;
     • a lock that, tapped, goes nowhere (every one must lead somewhere a child can act).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/locks.cjs                           */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');
const MONEY = /\$\s?\d|\d\s*\/\s*(yr|year|mo|month)\b|per (year|month)|[₹£€]\s?\d/i;
const OPENER = /reach level|opens? |finish|master|spell|grown-up|comes with|advanced pack|clear the earlier|earlier stops|the plan|ultra/i;

const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 900,
    xp: 30, level: 3, lists: { default: { xp: 30 }, journey: { xp: 10 } }, missed: [] }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 950 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_lk_seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_lk_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(3200);
  await pg.evaluate(() => { try { loadConcepts(); } catch (e) {} if (window.SB_LAZY) SB_LAZY.need('atlas', () => {}); });
  await pg.waitForTimeout(2500);

  /* every padlock and every lock chip on the page, with the words of the thing it sits on */
  const scan = () => pg.evaluate(({ MONEY, OPENER }) => {
    const MRX = new RegExp(MONEY, 'i'), ORX = new RegExp(OPENER, 'i');
    const lockSvg = (() => { const d = document.createElement('div'); d.innerHTML = iconSVG('lock', 12); return d.querySelector('svg').innerHTML; })();
    const locks = [...document.querySelectorAll('[data-lock]')];
    document.querySelectorAll('svg').forEach(s => { if (s.innerHTML === lockSvg && !s.closest('[data-lock]')) locks.push(s); });
    const out = { n: 0, money: [], mute: [], coin: [], kinds: new Set() };
    for (const l of locks) { const host = l.closest('button,a,[data-act],.sb-card,.sb-cover-card') || l.parentElement;
      if (!host || !host.offsetParent && getComputedStyle(host).position !== 'fixed') continue;
      out.n++; const t = (host.innerText || host.textContent || '').replace(/\s+/g, ' ').trim();
      if (l.dataset && l.dataset.lock) out.kinds.add(l.dataset.lock + ':' + getComputedStyle(l).borderStyle);
      if (MRX.test(t)) out.money.push(t.slice(0, 70));
      if (/🪙|Unlock ·/.test(t) || host.querySelector('[class*="coin"]')) out.coin.push(t.slice(0, 70));
      if (!ORX.test(t)) out.mute.push(t.slice(0, 70)); }
    const page = document.body.innerText; const pm = page.match(MRX);
    out.pageMoney = pm ? page.slice(Math.max(0, pm.index - 40), pm.index + 20).replace(/\s+/g, ' ') : null;
    out.kinds = [...out.kinds]; return out; }, { MONEY: MONEY.source, OPENER: OPENER.source });

  const walk = [
    ['home', () => app.setNav('home')],
    ['atlas map', () => app.setNav('trail')],
    ['atlas region', () => app.trailAct('honey|meadow')],
    ['practice', () => app.setNav('coach')],
    ['word lists', () => app.coachSetupOpen()],
    ['practice paths', () => app.setNav('quest')],
    ['concepts', () => app.setNav('concepts')],
    ['concept shelf', () => { app.setNav('concepts'); const e = document.querySelector('[data-act="openConceptChapter"]'); if (e) e.click(); }],
    ['library', () => app.setNav('explore')],
    ['arcade', () => app.setNav('games')],
    ['hive avatars', () => { state.collTab = 'avatars'; app.openCollection(); }],
    ['hive worlds', () => { state.collTab = 'worlds'; app.openCollection(); }],
    ['hive medals', () => { state.collTab = 'badges'; app.openCollection(); }],
    ['your level', () => app.setNav('beeband')],
    ['your bee', () => app.setNav('evolution')],
    ['themes', () => app.setNav('themes')],
  ];
  let total = 0; const money = [], mute = [], coin = [], pageMoney = [], kinds = new Set();
  for (const [name, go] of walk) {
    await pg.evaluate(`(()=>{ state.pinDlg=null; state.showTiers=false; state.screen='app'; (${go.toString()})(); })()`);
    await pg.waitForTimeout(900);
    const r = await scan(); total += r.n;
    r.money.forEach(t => money.push(name + ': ' + t)); r.mute.forEach(t => mute.push(name + ': ' + t));
    r.coin.forEach(t => coin.push(name + ': ' + t)); if (r.pageMoney) pageMoney.push(name + ': "' + r.pageMoney + '"');
    r.kinds.forEach(k => kinds.add(k));
  }
  ok(total > 40, `walked ${walk.length} child screens and found ${total} locks to check`);
  ok(!pageMoney.length, 'no money anywhere on a child\'s screen' + (pageMoney.length ? ' — ' + pageMoney.slice(0, 4).join(' | ') : ''));
  ok(!money.length && !coin.length, 'no lock carries a price, in money or in coins' + ((money.length || coin.length) ? ' — ' + money.concat(coin).slice(0, 4).join(' | ') : ''));
  ok(!mute.length, 'every lock names how to open it' + (mute.length ? ' — ' + mute.length + ' do not: ' + mute.slice(0, 5).join(' | ') : ''));
  const k = [...kinds]; const learnStyle = k.filter(x => x.startsWith('learn:')), planStyle = k.filter(x => x.startsWith('plan:'));
  ok(learnStyle.length && planStyle.length && learnStyle.every(x => /dashed/.test(x)) && planStyle.every(x => !/dashed/.test(x)),
    'learning locks and plan locks are drawn differently (' + k.join(', ') + ')');

  /* ---- never a dead end: each kind of lock, tapped, leads somewhere ---- */
  const lead = await pg.evaluate(() => { const out = {}; const c = active();
    const w = THEMES.find(t => !isThemeUnlocked(t.id)); state.toast = ''; let said = '';
    const realFlash = window.flash; try { flash = (m) => { said = m; }; } catch (e) {}
    app.buyTheme(w.id); out.world = said; try { flash = realFlash; } catch (e) {}
    const ci = (state.conceptData || []).findIndex((ch, i) => !ch.adv && !isConceptUnlocked(i));
    state.pinDlg = null; app.buyConcept(ci); out.concept = { nav: state.nav, pin: !!state.pinDlg, act: state.trailAct };
    state.pinDlg = null; app.askPlan('avatarPacks'); out.plan = { pin: !!state.pinDlg, sheet: !!document.querySelector('[data-act="closeTiers"]') };
    state.pinDlg = null; render(); return out; });
  ok(/Level \d+/.test(lead.world), 'a locked world, tapped, says which Level opens it — "' + lead.world + '"');
  ok(lead.concept.nav === 'trail' || lead.concept.pin, 'a locked chapter, tapped, goes to the Atlas stop that opens it (or to a grown-up) — nav ' + lead.concept.nav + (lead.concept.act ? ' / ' + lead.concept.act : ''));
  ok(lead.plan.pin && !lead.plan.sheet, 'a plan lock, tapped, asks for a grown-up — the plan sheet waits behind the PIN');

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
