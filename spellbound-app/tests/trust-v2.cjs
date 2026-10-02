/* FIX-BEE v2 — THE FIX-FIRST LIST, ONE GUARD EACH (2 Oct 2026).            @check

   1. Settings asks for the PIN where it matters: the child's four sections open freely, and the
      fifth (Grown-ups) is ONE row until the PIN is passed — the plan, "Manage plan" and the
      Advanced Pack never draw on a child's screen. The pass ends when the sheet closes.
   2. No developer furniture on a child's screen: no "BUG?" tab, no "still being built" banner.
   3. Magic Squares promises only what it pays (a claimed square = a finished round).
   4. The mastery coin fires on mastery EVIDENCE (a Stage mastered on two separate days), never on
      an XP stage-up.
   5. Esc closes the Settings sheet and the ☰ drawer, and Tab stays inside them.
   6. Spell Scene's result counts the word the round was lost on and never offers a map the
      arcade does not have.
   Each was proved by breaking it: put the old line back and the matching assertion fails.
   Run: node tests/trust-v2.cjs                                                              */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '2468',
  children: [{ name: 'Trusty', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 0, xp: 40, level: 3,
    lists: { default: { xp: 10 } }, activeList: 'default', questPath: 'journey', missed: [], unlockedThemes: [], unlockedConcepts: {}, unlockedLists: {},
    trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => fs.existsSync(p)) });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + SRC + '/index.html'); await pg.waitForTimeout(2800);
  await pg.evaluate(() => { state.screen = 'app'; state.nav = 'home'; state.devUnlock = false; render(); });

  /* ---- 2. no developer furniture on a child's screen ---- */
  for (const nav of ['home', 'collection', 'games', 'explore']) {
    const r = await pg.evaluate(async n => { state.nav = n; render(); await new Promise(r => setTimeout(r, 120));
      return { bug: !!document.querySelector('.sb-bug-tab'), banner: /still being built/i.test(document.body.textContent) }; }, nav);
    ok(!r.bug && !r.banner, `${nav}: no "BUG?" tab and no beta banner on the child's screen`);
  }
  const land = await pg.evaluate(() => { state.screen = 'landing'; render(); const t = /still being built/i.test(document.body.textContent); state.screen = 'app'; state.nav = 'home'; render(); return t; });
  ok(land, 'the "still being built" notice stays on the landing page, which is for grown-ups');

  /* ---- 1. Settings: four sections for the child, the fifth behind the PIN ---- */
  let s = await pg.evaluate(async () => { app.setNav('settings'); await new Promise(r => setTimeout(r, 150));
    const secs = [...document.querySelectorAll('.bz-set-sec h3')].map(h => h.textContent.replace(/\s+/g, ' ').trim());
    return { open: !!state.settingsOpen, dlg: !!state.pinDlg, secs,
      plan: !!document.querySelector('#sb-set-ov [data-act="openTiers"]') || /Manage plan|Advanced Pack/.test((document.getElementById('sb-set-ov') || {}).textContent || ''),
      grownRows: document.querySelectorAll('[data-sec="grownups"] .bz-row').length }; });
  ok(s.open && !s.dlg, 'Settings opens for the child with no PIN — sound, text size and the world are theirs');
  const want = ['Me', 'Sound & music', 'Look', 'Comfort', 'Grown-ups'];
  ok(want.every((w, i) => (s.secs[i] || '').includes(w)) && s.secs.length === 5, 'the five family sections, in order: ' + s.secs.join(' · '));
  ok(!s.plan && s.grownRows === 1, 'before the PIN, Grown-ups is one row: no plan, no "Manage plan", no Advanced Pack on the child\'s screen');
  s = await pg.evaluate(async () => { app.setGrownOpen(); await new Promise(r => setTimeout(r, 100)); const asked = !!state.pinDlg;
    for (const k of '2468') app.pinKey(k); await new Promise(r => setTimeout(r, 150));
    return { asked, plan: !!document.querySelector('#sb-set-ov [data-act="openTiers"]'), ageBand: !!document.querySelector('#sb-set-ov [data-act="setAgeBand"]') }; });
  ok(s.asked && s.plan && s.ageBand, 'Grown-ups asks for the PIN, and behind it are the plan and the age range');
  s = await pg.evaluate(async () => { app.closeSettings(); app.setNav('settings'); await new Promise(r => setTimeout(r, 120));
    return !!document.querySelector('#sb-set-ov [data-act="openTiers"]'); });
  ok(!s, 'closing the sheet ends the pass — reopening shows the one locked row again');

  /* every switch and choice in the child's sections changes something real */
  const eff = await pg.evaluate(async () => { const W = () => new Promise(r => setTimeout(r, 60)); const o = {};
    const snd = state.sound; app.toggleSound(); await W(); o.sound = state.sound !== snd && SB_STORE.get('sound') === (state.sound ? '1' : '0'); app.toggleSound();
    app.setVolume(70); await W(); o.vol = window.SB_VOL ? SB_VOL.pct() === 70 && SB_STORE.get('volume') === '70' : false; app.setVolume(40);
    const m = SB_VOL.musicOn(); app.toggleMusic(); await W(); o.music = SB_VOL.musicOn() !== m; app.toggleMusic();
    app.setTextSize('small'); await W(); o.size = document.documentElement.getAttribute('data-size') === 'small'; app.setTextSize('normal');
    app.setModePref('dusk'); await W(); o.dark = document.documentElement.getAttribute('data-mode') === 'dusk';
    app.setModePref('auto'); await W(); o.auto = state.modePref === 'auto' && /light|dusk/.test(state.mode); app.setModePref('light');
    const rm = !!state.a11yMotion; app.toggleReduceMotion(); await W(); o.motion = document.documentElement.hasAttribute('data-motion') !== rm; app.toggleReduceMotion();
    return o; });
  for (const [k, v] of Object.entries(eff)) ok(v, `Settings control "${k}" has an effect`);

  /* ---- 5. Esc closes the sheet and the drawer; Tab stays inside ---- */
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  ok(!(await pg.evaluate(() => state.settingsOpen)), 'Esc closes the Settings sheet');
  await pg.evaluate(() => { app.openDrawer(); }); await pg.waitForTimeout(150);
  const inside = [];
  for (let i = 0; i < 40; i++) { await pg.keyboard.press('Tab'); inside.push(await pg.evaluate(() => !!document.activeElement.closest('[data-trap="drawer"]'))); }
  ok(inside.every(Boolean), 'Tab cycles inside the ☰ drawer and never escapes behind the scrim');
  await pg.keyboard.press('Escape'); await pg.waitForTimeout(150);
  ok(!(await pg.evaluate(() => state.drawerOpen)), 'Esc closes the ☰ drawer');

  /* ---- 3. Magic Squares: no line bonus is promised, a claimed square pays a finished round ---- */
  const app3 = fs.readFileSync(path.join(SRC, 'app3.js'), 'utf8');
  ok(!/lines win bonus|row \+\$\{|MAGIC_BONUS\.(row|col|diag|square)/.test(app3), 'Magic Squares no longer prints row/column/diagonal coin bonuses it never paid');
  const mg = await pg.evaluate(async () => { const W = BZ_WALLET; const n0 = W.ledger('Trusty').length;
    state.nav = 'games'; magicNewBoard(); const g = state.game; g.cell = 0; g.right = 5; magicFinishCell();
    const lines = W.ledger('Trusty').slice(n0); return { lines: lines.map(x => x.why), shown: g.cellResult.coins }; });
  ok(mg.lines.length === 1 && mg.lines[0] === 'stop' && mg.shown === 5, `a claimed square pays exactly one finished round — ${JSON.stringify(mg)}`);

  /* ---- 4. the mastery coin: never on a stage-up, once on a Stage mastered on evidence ---- */
  const ms = await pg.evaluate(() => { const W = BZ_WALLET; const c = active(); ensureLists(c); state.game = null; state.nav = 'home';
    const key = activeListKey(); const n0 = W.ledger('Trusty').length;
    const lp = getList(c, key); const before = listLevel(c, key); let ups = 0;
    for (let i = 0; i < 400 && ups < 1; i++) { gainXp(); if (listLevel(c, key) > before) ups++; }
    const afterUp = W.ledger('Trusty').slice(n0).map(x => x.why);
    /* now master every word of the current stage on evidence: right yesterday-ish, right again today */
    const st = curStage(c, key); const today = mastDay();
    st.words.forEach((w, i) => { const k = nkey(w.w); c.mast[k] = { b: 1, d: today - 2, due: today - 1, ok: 1, n: 1 }; });
    mastSync(true);
    st.words.slice(0, -1).forEach(w => markMastered(w.w)); const midway = W.ledger('Trusty').slice(n0).filter(x => x.why === 'mastery').length;
    markMastered(st.words[st.words.length - 1].w); const once = W.ledger('Trusty').slice(n0).filter(x => x.why === 'mastery').length;
    markMastered(st.words[0].w); const again = W.ledger('Trusty').slice(n0).filter(x => x.why === 'mastery').length;
    return { ups, afterUp, midway, once, again, words: st.words.length }; });
  ok(ms.ups === 1 && !ms.afterUp.includes('mastery'), `an XP stage-up pays no mastery coin (${JSON.stringify(ms.afterUp)})`);
  ok(ms.midway === 0 && ms.once === 1 && ms.again === 1, `the coin fires once, when the last of ${ms.words} words is mastered on a second day — and never twice`);

  /* ---- 7. (B5) the buddy's hello comes from what the child did, and changes each visit ---- */
  const gr = await pg.evaluate(async () => { const W = () => new Promise(r => setTimeout(r, 80)); const c = active();
    c.missed = [{ w: 'rhythm', n: 1 }]; c.trapsBeaten = { necessary: 1 };
    const seen = []; const txt = () => (document.querySelector('.sb-home-greet') || {}).textContent || '';
    for (let i = 0; i < 6; i++) { app.setNav('games'); await W(); app.setNav('home'); await W(); const a = txt(); render(); await W(); seen.push({ a, b: txt(), k: (JSON.parse(SB_STORE.get('greet') || '{}')[c.name] || [])[1] }); }
    return { seen, leak: seen.some(x => /rhythm/i.test(x.a)) }; });
  ok(gr.seen.every(x => x.a && x.a === x.b), 'the hello holds still while the child is on Home (a re-render keeps it)');
  ok(gr.seen.every((x, i) => !i || x.k !== gr.seen[i - 1].k), 'it is never the same hello two visits running: ' + gr.seen.map(x => x.k).join(' → '));
  ok(gr.seen.some(x => x.k === 'miss') && gr.seen.some(x => x.k === 'trap') && !gr.leak, 'it speaks from evidence (a word to try again, a trap beaten) and never prints the missed word');

  /* ---- 8. (T3) no paywall on a child's screen: no price, no plan button, no sales page ---- */
  const pw = await pg.evaluate(async () => { const W = ms => new Promise(r => setTimeout(r, ms)); const out = [];
    for (const n of ['home', 'trail', 'coach', 'quest', 'explore', 'concepts', 'games', 'collection', 'shop']) { app.setNav(n); await W(400);
      const t = (document.querySelector('.sb-content') || document.body).textContent;
      const bad = [/ask a grown-up/i.test(t) && 'ask a grown-up', /\$\s?\d/.test(t) && 'a price', !!document.querySelector('.sb-content [data-act="openTiers"],.sb-content [data-act="showTiers"]') && 'a plan button', /Manage plan/.test(t) && 'Manage plan'].filter(Boolean);
      if (bad.length) out.push(n + ': ' + bad.join(', ')); }
    state.pinDlg = null; app.openAdvanced && window.ADV ? app.openAdvanced() : await new Promise(r => SB_LAZY.need('advanced', () => { app.openAdvanced(); r(); }));
    await W(200); const asked = !!state.pinDlg; state.pinDlg = null; render(); return { out, asked }; });
  ok(!pw.out.length, 'no "ask a grown-up", price, plan button or "Manage plan" on any child screen' + (pw.out.length ? ' — ' + pw.out.join(' | ') : ''));
  ok(pw.asked, 'the Advanced Pack\'s sales page asks for the grown-up PIN before it draws');

  /* ---- 9. (S3) the three privacy statements say the same thing as privacy.html ---- */
  { const idx = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8'), pol = fs.readFileSync(path.join(SRC, 'privacy.html'), 'utf8');
    const said = [app3, idx].join('\n');
    ok(!/backed up to your account whenever|Nothing is sent anywhere: no accounts/.test(said) && (said.match(/optional cloud backup/g) || []).length >= 3 && /cloud backup \(optional\)/i.test(pol),
      'the landing FAQ, its structured copy and the Parent Zone all say: on the device, optional cloud backup — as privacy.html does'); }

  /* ---- 10. (C5) the walkthrough's dead ends ---- */
  const c5 = await pg.evaluate(async () => { const W = ms => new Promise(r => setTimeout(r, ms));
    app.setNav('ipatrain'); await W(300); const ipa = document.querySelector('.sb-content').textContent;
    app.setNav('explore'); await W(100); state.pinDlg = { label: 'A locked book', typed: '' }; render(); app.setNav('home'); await W(150);
    return { stray: /x\/button>|→ x\b/.test(ipa), pin: !!state.pinDlg || !!document.querySelector('.sb-pin, [data-pin]') }; });
  ok(!c5.stray, 'the Sound Alphabet page prints no stray markup');
  ok(!c5.pin, 'a PIN dialog opened on one screen does not follow the child to the next');

  /* ---- 11. (E5) the miss names the right concept family ---- */
  const e5 = await pg.evaluate(() => ({ giant: missWhy({ w: 'giant' }, 'gient').k, gi2: missWhy({ w: 'giant' }, 'jiant').k,
    visible: missWhy({ w: 'visible' }, 'visable').k, station: missWhy({ w: 'station' }, 'stasion').k }));
  ok(e5.giant !== 'endings' && e5.gi2 !== 'endings', `"giant" is not explained as a suffix ending (${e5.giant}, ${e5.gi2})`);
  ok(e5.visible === 'endings' && e5.station === 'endings', `real suffixes still are: visible → ${e5.visible}, station → ${e5.station}`);

  /* ---- 12. (T9) certificates: a region walked, a Stage mastered — a PNG, from the grown-ups' area ---- */
  const t9 = await pg.evaluate(async () => { const W = ms => new Promise(r => setTimeout(r, ms)); await new Promise(r => SB_LAZY.need('atlas', r)); await W(300);
    const c = active(); const act = SB_TRAIL.honey.acts[0]; c.trail.paid = c.trail.paid || {}; act.units.forEach((u, i) => c.trail.paid[u + ':1'] = Date.now() - i);
    const L = certList(c); const app3 = viewParent.toString();
    state._certMade = null; app.certPng(L[0].id); for (let i = 0; i < 30 && !state._certMade; i++) await W(100);
    const kids = ['home', 'collection', 'trail'].map(n => { app.setNav(n); const e = document.querySelector('[data-act="certPng"]'); return e ? n + ':' + state.nav + ':' + (e.closest('[id]') || {}).id : ''; });
    return { n: L.length, kinds: L.map(x => x.kind), made: state._certMade, inParent: /certCard\(\)/.test(app3), onKid: kids.some(Boolean), kids }; });
  ok(t9.n >= 2 && t9.kinds.includes('Region') && t9.kinds.includes('Stage'), `a region walked end to end and a Stage mastered each give a certificate (${t9.kinds.join(', ')})`);
  ok(/\.png$/.test(t9.made || ''), 'the certificate is made on the device as a PNG (' + t9.made + ')');
  ok(t9.inParent && !t9.onKid, 'it is saved from the grown-ups\' area only — never from a child\'s screen ' + JSON.stringify(t9.kids) + ' ' + t9.inParent);

  /* ---- 13. (E6) graduated hints on the item in front of the child, never the word ---- */
  const e6 = await pg.evaluate(async () => { const W = () => new Promise(r => setTimeout(r, 80)); app.playGame('buzz'); await W();
    const g = state.game; if (!g || !g.list) return null; g.list[g.i] = Object.assign({}, g.list[g.i], { w: 'rhythm', d: 'a strong regular repeated pattern of movement or sound', p: 'RITH-uhm', s: 'She tapped out the rhythm on the table.' }); render(); await W();
    const steps = []; for (let i = 0; i < 4; i++) { app.gInfoToggle(); await W(); const t = document.querySelector('.sb-content').textContent; steps.push({ lv: state.gInfo, letters: /6 letters/.test(t), beats: /2 beats/.test(t), first: /Starts with — “R”/.test(t), leak: /rhythm/i.test(t) }); }
    app.exitGame(); return steps; });
  ok(e6 && e6[0].lv === 1 && !e6[0].letters && e6[1].letters && e6[1].beats && !e6[1].first && e6[2].first && e6[3].lv === 0,
    'hints come in steps: the meaning, then letters and beats, then the first letter — and a fourth tap hides them');
  ok(e6 && e6.every(x => !x.leak), 'no hint step ever prints the word');

  /* ---- 14. (G11) Bizzillionaire asks word questions, and there are enough of them at every rung ----
     Behaviour, not source text: this file also runs against the MINIFIED deploy tree, where the
     filter's parameter names are renamed. Draw every rung many times and read what came out. */
  const g11 = await pg.evaluate(async () => { for (let lv = 1; lv <= 5; lv++) await new Promise(r => { try { SB_TRIVIA.need(lv, r); } catch (e) { r(); } setTimeout(r, 8000); });
    const ths = {}, per = {}; let n = 0;
    for (let rung = 0; rung < 15; rung++) for (let k = 0; k < 12; k++) { _bizzS = { rung, used: new Set(), cur: null }; const d = bizzDraw(); if (!d) continue; n++; ths[d.q.th] = 1; }
    for (const q of SB_TRIVIA.questions || []) if (q.ty === 'mc' && /^(words|eponyms|langs|wmeaning|wroots|wbreak|wstories)$/.test(q.th)) per[q.lv] = (per[q.lv] || 0) + 1;
    _bizzS = null; try { localStorage.removeItem('sb_bizz_seen'); } catch (e) {} return { n, ths: Object.keys(ths), per }; });
  ok(g11.n >= 150 && g11.ths.every(t => /^(words|eponyms|langs|wmeaning|wroots|wbreak|wstories)$/.test(t)), `${g11.n} Bizzillionaire draws across all 15 rungs are all word questions (${g11.ths.join(', ')})`);
  ok([1, 2, 3, 4, 5].every(l => (g11.per[l] || 0) >= 150), 'and every level holds 150+ of them: ' + [1, 2, 3, 4, 5].map(l => g11.per[l]).join(' · '));

  /* ---- 6. Spell Scene's result ---- */
  const saga = fs.readFileSync(path.join(SRC, 'saga2.js'), 'utf8');
  ok(!/Back to map/.test(saga), 'no result card offers "Back to map" — the arcade has no map');
  /* Behaviour, not source text (the deploy tree is minified): lose a real round — three wrong
     answers — and read the result card. */
  const ss = await pg.evaluate(async () => { const W = ms => new Promise(r => setTimeout(r, ms)); const host = document.createElement('div');
    host.style.cssText = 'position:fixed;inset:0;z-index:9999'; document.body.appendChild(host); let out = null;
    SB_SAGA_ENGINES.spellScene(host, { diff: 'easy' }, () => {});
    for (let t = 0; t < 3; t++) { await W(500); const n = host.querySelectorAll('#ss-slots .ss-slot').length; for (let j = 0; j < n; j++) host.querySelector('.ss-kb[data-k="z"]').click(); }
    for (let t = 0; t < 30 && !(host.querySelector('#sg-card') || {}).innerHTML; t++) await W(100);
    const chips = [...host.querySelectorAll('#sg-card .sg-wchip')]; out = { n: chips.length, no: chips.filter(c => c.classList.contains('no')).length, txt: (host.querySelector('#sg-card') || {}).textContent || '' };
    host.remove(); return out; });
  ok(ss.n >= 1 && ss.no >= 1, `a lost Spell Scene logs the word it was lost on, so "N of N spelled" can never sit over a lost round (${ss.no} of ${ss.n} chips marked missed)`);

  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good');
  process.exit(fails ? 1 : 0);
})();
