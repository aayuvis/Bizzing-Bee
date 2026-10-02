/* THE FAMILY BROWSER CHECK (family standard §15) — @check

   The eight things every Bizzing app's browser check asserts, on a desktop and on a phone, in
   one place, so "is Bee in line with the family?" is one command and not a reading of fifty files:
     back stays in the app · Continue is the only primary on Home · the grown-ups area needs the
     PIN · no third-party requests · no overflow at 390px (measured against the device width) ·
     contrast in every theme · the activity feed is written · coins only from standard events.
   The deep versions live in their own tests (home-continue, hash-nav, pin-mandatory,
   privacy-requests, a11y-axe, hive-activity, wallet-coins); this one is the family's checklist,
   run together, so a regression in any of them shows up under the standard's own name.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/family-check.cjs                     */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
const URL = 'file://' + ROOT + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [
  { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 12 } }, activeList: 'journey',
    trail: { lap: 1, done: { u1: { 1: 90 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } },
  { name: 'Ravi', age: 12, ageBand: '11-13', avatar: 'froggy', theme: 'spellbound', coins: 5, lists: { journey: { xp: 1 } }, activeList: 'journey', trail: { lap: 1, done: {}, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } } ] };

function filledPrimaries() {   // the same measure as tests/home-continue.cjs
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;left:-99px;background:var(--action,var(--accent))';
  document.body.appendChild(probe); const act = getComputedStyle(probe).backgroundColor;
  probe.style.background = 'var(--accent)'; const acc = getComputedStyle(probe).backgroundColor; probe.remove();
  const paint = el => { const c = getComputedStyle(el).backgroundColor; return c === act || c === acc; };
  const home = document.querySelector('.sb-content'); if (!home) return ['no home'];
  const ctrls = [...home.querySelectorAll('button,a[href],[data-act]')].filter(e => !e.parentElement.closest('button,a[href],[data-act]'));
  const out = [];
  for (const c of ctrls) { const r = c.getBoundingClientRect(); if (!r.width || !r.height) continue;
    const hit = [c, ...c.querySelectorAll('*')].some(e => paint(e) && /[A-Za-z]/.test(e.textContent || '') && e.getBoundingClientRect().width > 0);
    if (hit) out.push(c.getAttribute('data-act') + ':' + (c.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)); }
  return out;
}
/* WCAG relative-luminance contrast of a text element against the first opaque background up its tree */
function lowContrast() {
  /* rgb()/rgba() carry 0-255; color(srgb …) carries 0-1 — read both */
  const rgb = c => { const m = String(c).match(/[\d.]+/g); if (!m) return null; const k = /^color\(srgb/.test(c) ? 255 : 1; return m.slice(0, 4).map((v, i) => i < 3 ? +v * k : +v); };
  const lum = c => { const m = rgb(c); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(v => { v = v / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const bgOf = el => { for (let e = el; e; e = e.parentElement) { const s = getComputedStyle(e); if (s.backgroundImage && s.backgroundImage !== 'none') return null; const m = rgb(s.backgroundColor); if (m && (m.length < 4 || +m[3] > 0.95)) return s.backgroundColor; } return 'rgb(255,255,255)'; };
  const bad = [];
  document.querySelectorAll('.sb-content *, .sb-fam *').forEach(el => {
    if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 2)) return;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) return;
    const s = getComputedStyle(el); if (s.visibility === 'hidden' || +s.opacity < 0.5) return;
    const bg = bgOf(el); if (!bg) return;
    const a = lum(s.color), b = lum(bg); if (a == null || b == null) return;
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    const big = parseFloat(s.fontSize) >= 24 || (parseFloat(s.fontSize) >= 18.66 && +s.fontWeight >= 700);
    if (ratio < (big ? 3 : 4.5)) bad.push(el.textContent.trim().slice(0, 24) + ' ' + ratio.toFixed(2)); });
  return bad;
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const errs = [];
  for (const vp of [{ n: 'desktop', width: 1280, height: 860 }, { n: 'phone', width: 390, height: 844, mobile: true }]) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, isMobile: !!vp.mobile, hasTouch: !!vp.mobile, deviceScaleFactor: vp.mobile ? 2 : 1 });
    await ctx.clock.install();
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } } catch (e) {} }, SEED);
    const ext = [];
    ctx.on('request', r => { const u = r.url(); if (!/^(file|data|blob|about):/.test(u)) ext.push(u.slice(0, 80)); });
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(vp.n + ': ' + e.message));
    await pg.goto(URL); await pg.clock.runFor(3000);
    await pg.evaluate(() => { state.screen = 'app'; app.setNav('home'); }); await pg.clock.runFor(800);
    const T = vp.n;

    /* 1. Continue is the only primary on Home */
    const prim = await pg.evaluate(filledPrimaries);
    ok(prim.length === 1 && /^goNext:/.test(prim[0]), `${T}: Continue is the only filled primary on Home (${prim.join(' | ')})`);
    /* 2. no overflow at the device width */
    const ov = await pg.evaluate(w => ({ sw: document.documentElement.scrollWidth, bw: document.body.scrollWidth, w }), vp.width);
    ok(Math.max(ov.sw, ov.bw) <= vp.width, `${T}: nothing runs past the screen edge (${Math.max(ov.sw, ov.bw)}px in a ${vp.width}px viewport)`);
    /* 3. contrast in every theme (light, white, dusk) — text on Home and the top bar */
    const contrast = {};
    /* transitions off while measuring: a card caught mid-fade from light to dusk is not the dusk look */
    await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
    for (const mode of ['light', 'white', 'dusk']) { await pg.evaluate(m => { state.mode = m; render(); }, mode); await pg.clock.runFor(300); contrast[mode] = await pg.evaluate(lowContrast); }
    await pg.evaluate(() => { state.mode = 'light'; render(); });
    ok(Object.values(contrast).every(a => a.length === 0), `${T}: every line of text on Home clears WCAG AA in light, white and dusk` + (Object.values(contrast).some(a => a.length) ? ' — ' + JSON.stringify(contrast).slice(0, 300) : ''));
    /* 4. the grown-ups area needs the PIN */
    await pg.click('.sb-fam-lock'); await pg.clock.runFor(300);
    const gate = await pg.evaluate(() => ({ dlg: !!state.pinDlg, parent: state.progTab === 'parent' && state.nav === 'progress' }));
    for (const k of '1234') await pg.evaluate(k => app.pinKey(k), k); await pg.clock.runFor(300);
    const opened = await pg.evaluate(() => state.progTab === 'parent' && !state.pinDlg);
    ok(gate.dlg && !gate.parent && opened, `${T}: 🔒 asks for the grown-up PIN before the grown-ups area opens`);
    /* 5. back stays in the app — through three screens and past the start */
    await pg.evaluate(() => app.setNav('home')); await pg.clock.runFor(300);
    for (const n of ['trail', 'library', 'games']) { await pg.evaluate(n => app.setNav(n), n); await pg.clock.runFor(400); }
    for (let i = 0; i < 6; i++) { await pg.goBack({ timeout: 2000 }).catch(() => null); await pg.clock.runFor(400); }
    const where = await pg.evaluate(() => ({ href: location.href, app: typeof state !== 'undefined' && state.screen === 'app' }));
    ok(/index\.html/.test(where.href) && where.app, `${T}: six presses of Back never leave the app (${where.href.split('/').pop()})`);
    /* 6. the activity feed is written — five minutes of real input, as the Hive reads it */
    for (let i = 0; i < 20; i++) { await pg.mouse.move(200 + i, 300); await pg.keyboard.press('Shift'); await pg.clock.runFor(15500); }
    const feed = await pg.evaluate(() => { try { const o = JSON.parse(localStorage.getItem('bizzing.activity') || 'null'); return (o && o.s || []).filter(x => x.a === 'bee' && x.who === 'Ahana' && !x.ev); } catch (e) { return []; } });
    ok(feed.length >= 1 && feed.reduce((t, x) => t + (+x.m || 0), 0) >= 3, `${T}: bizzing.activity holds Ahana's active Bee minutes (${feed.reduce((t, x) => t + (+x.m || 0), 0)} min)`);
    /* 7. coins only from the standard events */
    const coins = await pg.evaluate(() => { const nums = [7, 150, 400].map(n => addCoins(n)); const evs = ['answer', 'stop', 'contest', 'mastery'].map(e => addCoins(e)); const odd = ['streak', 'login', 'time', 'luck'].map(e => addCoins(e)); return { nums, evs, odd }; });
    ok(coins.nums.every(n => !n) && JSON.stringify(coins.evs) === '[1,5,10,20]' && coins.odd.every(n => !n), `${T}: coins arrive only from answer 1 · stop 5 · contest 10 · mastery 20 — never a bare number or a streak/login/time/luck (${JSON.stringify(coins)})`);
    /* 8. no third-party requests on the whole walk (file:// — anything on the network is a stray) */
    ok(ext.length === 0, `${T}: no request left the device on the walk` + (ext.length ? ': ' + [...new Set(ext)].slice(0, 4).join(' ') : ''));
    await ctx.close();
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
