/* NO STREAKS (FIX-BEE J2, FAMILY-STANDARD §8).

   There was a streak card ("12-day streak · Best 30 · practise today to keep it going"), a
   reward ladder at 3/7/14/30 days (15/40/100/300 coins), a Streak Freeze artifact that the
   streak itself handed out to protect itself, six streak medals up to 100 days, a streak
   pill on Practice, a "STREAK" column for grown-ups, a Daily Buzz streak, and parent tips
   that said "a visible chain kids can't bear to break". A day off was a loss, by design.

   Now a day only records that it happened, and the one number made from it is GOOD DAYS
   THIS WEEK. This test seeds the most streak-laden child it can — a 29-day run that would
   cross the 30-day reward tomorrow, two freezes, every streak reward claimed, a Daily Buzz
   run — and then fails on:
     • any streak count, freeze or streak copy on any screen a child or grown-up reaches;
     • the streak moving, or paying, or a freeze appearing, when a new day is marked;
     • streak copy left in the source strings (comments are allowed to remember it).
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/no-streaks.cjs                       */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const APP = path.resolve(__dirname, '..');

/* what a streak SAYS, however it is phrased — run over rendered text. It is about the MECHANIC
   ("12-day streak", "Streak Freeze", "STREAK", "keep your streak"), not the word: the library's
   own text can carry "a streak of light" or "water freezes" on the word of the hour. */
const STREAK_I = /\d+\s*[- ]?\s*day streak|\bday streak|streak (freeze|reward|bonus|pays|survives)|\b(your|best|keep the|lose the) streak\b|\d+\s*streak\b|\bstreak\s*:?\s*\d+|streaks pay|days? in a row|you['’]ll lose|don['’]t lose|keep (it|the chain) going|break the chain|🧊/i;
const STREAK_U = /\bSTREAKS?\b/;
const STREAK_RX = { test: t => STREAK_I.test(t) || STREAK_U.test(t), match: t => t.match(STREAK_I) || t.match(STREAK_U) };

/* ---- the source: no streak copy in any string the app can show ---- */
const SRC_RX = [/-day streak/i, /day streak/i, /streak freeze/i, /streak rewards?/i, /days? in a row/i,
  /(keep|lose) (the|your) streak/i, /\byour streak\b/i, /streaks? (pay|die|bonus)/i, /STREAK_REWARDS/, /\bstreakCard\b/,
  /grantArt\(\s*'freeze'/, /you['’]ll lose/i, /\bc\.streak\s*=/, /\bstreakRewards\[[^\]]*\]\s*=/];
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[\s;{}(,])\/\/[^\n]*/g, '$1');
const files = fs.readdirSync(APP).filter(f => /\.(js|html)$/.test(f) && !/^(words|voice|trivia-q|trivia-words|trivia-all|concepts-data|adv-|figurative|nsf-|scripps|story-data|word-|southasia|lessons|trail-data|trail-map|sounds-data|quotes|eponym|avatar-greetings|avatar-cards|backend)/.test(f));
const hits = [];
for (const f of files) { const src = stripComments(fs.readFileSync(path.join(APP, f), 'utf8'));
  for (const rx of SRC_RX) { const m = src.match(rx); if (m) hits.push(f + ': "' + src.slice(Math.max(0, m.index - 30), m.index + 40).replace(/\s+/g, ' ') + '"'); } }
ok(!hits.length, 'no streak copy or streak mechanics in ' + files.length + ' source files' + (hits.length ? ' — ' + hits.slice(0, 4).join(' | ') : ''));

const day = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 40,
    streak: 29, streakBest: 29, lastActiveDay: day(1), streakRewards: { 3: 1, 7: 1, 14: 1 }, freezes: 2,
    daysPlayed: [...Array(40)].map((_, i) => day(39 - i)).filter(k => k !== day(0)),
    xp: 60, level: 4, lists: { default: { xp: 60 }, journey: { xp: 20 } },
    activity: [{ kind: 'practice', label: 'Practice', ts: Date.now() - 86400000, done: 10, right: 9, coins: 9, misses: [] }] }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 950 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_ns_seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_ns_seeded', '1');
    localStorage.setItem('sb_daily', JSON.stringify({ streak: 9, wins: 9, played: 12, lastWin: 'x' })); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + APP + '/index.html'); await pg.waitForTimeout(3200);

  /* ---- a new day is marked: nothing moves, nothing pays, nothing protects a run ---- */
  const r = await pg.evaluate(() => { const c = active(); const w0 = BZ_WALLET.balance(c.name); const pow0 = JSON.stringify(c.pow || {});
    state.toast = ''; markActiveToday(); markActiveToday();
    return { streak: c.streak, freezes: c.freezes, pow: JSON.stringify(c.pow || {}) === pow0, paid: BZ_WALLET.balance(c.name) - w0,
      toast: String(state.toast || ''), today: (c.daysPlayed || []).includes(todayKey()), good: goodDaysThisWeek(c),
      art: ART_DEFS.map(a => a.name).join('|') }; });
  ok(r.streak === 29, 'marking a new day does not move the old streak counter (' + r.streak + ')');
  ok(r.paid === 0 && r.pow && r.freezes === 2, 'and pays nothing — no 30-day reward, no Streak Freeze (+' + r.paid + ' coins)');
  ok(!STREAK_RX.test(r.toast), 'and says nothing about a run of days' + (r.toast ? ' — "' + r.toast + '"' : ''));
  ok(r.today, 'the day is recorded (c.daysPlayed) — the only thing a day does now');
  const dow = (new Date().getDay() + 6) % 7;
  ok(r.good === dow + 1, `good days this week counts Monday to today (${r.good}, expected ${dow + 1}) — never a run`);
  ok(!/freeze/i.test(r.art), 'the Streak Freeze is not an artifact any more (' + r.art + ')');

  /* ---- every screen, child and grown-up ---- */
  const screens = [['home'], ['progress'], ['coachdesk'], ['coach'], ['trail'], ['games'], ['beeband'], ['evolution'], ['settings'],
    ['collection', 'badges'], ['collection', 'avatars'], ['collection', 'worlds'], ['trivia'], ['parent']];
  const found = [];
  for (const [nav, tab] of screens) {
    await pg.evaluate(([n, t]) => { state.pinDlg = null; state.screen = 'app'; if (t) state.collTab = t;
      if (n === 'parent') { state.parentPin = '1234'; app.setNav('parent'); for (const k of '1234') app.pinKey(k); }
      else if (n === 'trivia') { try { app.openTrivia ? app.openTrivia() : app.setNav('trivia'); } catch (e) { app.setNav('trivia'); } }
      else app.setNav(n); }, [nav, tab]);
    await pg.waitForTimeout(900);
    const t = await pg.evaluate(() => document.body.innerText);
    const m = STREAK_RX.match(t);
    if (m) found.push(nav + (tab ? '/' + tab : '') + ': "…' + t.slice(Math.max(0, m.index - 40), m.index + 30).replace(/\s+/g, ' ') + '…"');
    if (nav === 'progress') ok(/good days? this week/i.test(t), 'Progress shows good days this week in place of the streak');
    if (nav === 'parent') ok(/good days this week/i.test(t) || /GOOD DAYS THIS WEEK/.test(t), 'the grown-ups page counts good days this week, not a streak');
    if (nav === 'collection' && tab === 'badges') ok(/Kept from before/.test(t) && /Week of Wings/.test(t), 'medals already earned on the old streak are KEPT (shown, never re-locked)');
  }
  ok(!found.length, 'no streak copy on ' + screens.length + ' screens' + (found.length ? ' — ' + found.slice(0, 4).join(' | ') : ''));

  /* ---- the daily game no longer counts a run either ----
     (4 Oct 2026: Daily Bee replaced Daily Buzz and loads lazily — opened through its door and read once
     its board is up, so this cannot pass on an empty screen; its HUD counts good days THIS WEEK) */
  await pg.evaluate(() => { try { app.openDaily(); } catch (e) {} });
  await pg.waitForFunction(() => !!document.querySelector('#db-host .db-grid, #db-host #db-end'), null, { timeout: 60000 }).catch(() => {});
  const db = await pg.evaluate(() => ({ t: document.body.innerText, up: !!document.querySelector('#db-host .db-stat') }));
  ok(db.up && !STREAK_RX.test(db.t) && /good days this week/i.test(db.t), 'the Daily Bee shows no streak — good days this week');

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
