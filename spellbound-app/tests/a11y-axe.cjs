/* ACCESSIBILITY — an automated axe-core pass (FIX-BEE L5, family standard §12/§15).

   axe-core (a devDependency; `npm install` in spellbound-app/) is injected into the live app
   and run against WCAG 2.1 A + AA on six screens — Home, the Word Atlas, Practice, the
   Library, the Arcade and Settings — in all three looks (light, white, dusk) at a phone
   (390×844) and a desktop (1280×900) width. That is 36 passes.

   It also checks the three things axe cannot see from a static snapshot:
   · focus is VISIBLE — tabbing to a control changes its outline or box-shadow;
   · reduced motion is RESPECTED — with prefers-reduced-motion, nothing on the screen runs
     a CSS animation longer than a blink;
   · every icon-only button has a NAME (axe's button-name, but counted on its own);
   · text on a GRADIENT clears 4.5:1 (3:1 large) against every stop of it — axe files such text
     under "incomplete" and never fails it, which is how Home's "Quote of the hour" kicker sat at
     1.7:1 on dusk's purple (P0.20) with this test green. Reported as rule `gradient-contrast`,
     ratcheted through KNOWN like any axe rule. (A text halo — a text-shadow — is credited, as axe
     credits it.)

   RATCHET. Some violations live in views other batches are rewriting right now (home and the
   header, the Hive and avatars, Practice and the parent zone, all in app3.js). Those are
   listed in KNOWN with the owner, reported every run, and do not fail it; anything NOT in
   KNOWN fails. Fix one and delete its line — a KNOWN entry that no longer occurs is reported
   as stale so the list can only shrink.
   Run: node tests/a11y-axe.cjs        (A11Y_SCREENS=home,library to narrow)               */
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const { booted, until, lazy, frames, STILL } = require('./lib/wait.cjs');
const SRC = process.env.SRC || path.resolve(__dirname, '..');
const AXE = (() => { try { return require.resolve('axe-core/axe.min.js'); } catch (e) {}
  for (const p of [path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js')]) if (fs.existsSync(p)) return p; return null; })();
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
if (!AXE) { console.log('  FAIL axe-core is not installed — run `npm install` in spellbound-app/'); process.exit(1); }

/* rule|screen|look -> who owns the fix and why it is not fixed here. EMPTY since 10 Oct 2026 (P0.19):
   Practice's "Choose this path" chips were white on the path's own colour (#13A892 3.0:1, #7C5CFF 4.3:1)
   and now sit on a darker ink of the same hue (viewQuest `ink`). Keep it empty: a new entry needs an owner
   and a reason a person can check, and it is reported every run until it is deleted. */
const KNOWN = {};

const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 40, level: 3,
    lists: { default: { xp: 30 } }, activeList: 'default', missed: [], unlockedThemes: ['spellbound'] }] };
const SCREENS = {
  home: () => app.setNav('home'),
  atlas: () => app.setNav('trail'),
  practice: () => app.setNav('coach'),
  library: () => app.setNav('explore'),
  arcade: () => app.setNav('games'),
  settings: () => { app.setNav('home'); state.pinDlg = null; app.openSettings(); },
};
/* what each screen must show before axe reads it — waited on, never slept for (tests/lib/wait.cjs).
   Home waits for the Quote of the hour card itself: its quotes arrive on the idle queue, and until
   they do the card is a shimmer (cardHold) that has no text for axe to measure — so the dusk kicker
   that was brown on purple at 1.5:1 (P0.20) was never read at all. */
const READY = {
  home: () => state.nav === 'home' && !!document.querySelector('#root .sb-home .sb-qoh-k'),
  atlas: () => state.nav === 'trail' && !!document.querySelector('#root .atlas-board'),
  practice: () => (state.nav === 'coach' || state.nav === 'quest') && !!document.querySelector('#root [data-act]'),
  library: () => state.nav === 'explore' && !!document.querySelector('#root .lib-grid .lib-tile'),
  arcade: () => state.nav === 'games' && !!document.querySelector('#root .pl-card'),
  settings: () => !!state.settingsOpen && !!document.querySelector('#sb-set-ov'),
};
/* text whose nearest painted background is a gradient, measured against the WORST stop of that gradient
   (each stop composited over what lies under it). Runs in the page; returns the failures. */
const GRADIENT_CONTRAST = (scope) => {
  const toRGB = s => { s = String(s || '').trim(); let m = s.match(/^rgba?\(([^)]+)\)$/); if (m) { const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; }
    m = s.match(/^color\(srgb ([^)]+)\)$/); if (m) { const p = m[1].split(/[ /]+/).filter(Boolean).map(Number); return { r: p[0] * 255, g: p[1] * 255, b: p[2] * 255, a: p.length > 3 ? p[3] : 1 }; } return null; };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const over = (t, b) => ({ r: t.r * t.a + b.r * (1 - t.a), g: t.g * t.a + b.g * (1 - t.a), b: t.b * t.a + b.b * (1 - t.a), a: 1 });
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const stops = img => { const out = [], re = /(rgba?\([^)]*\)|color\(srgb[^)]*\))/g; let m; while ((m = re.exec(img))) { const c = toRGB(m[1]); if (c) out.push(c); } return out; };
  const under = el => { const acc = []; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const c = toRGB(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { acc.push(c); if (c.a >= 1) break; } }
    let bg = { r: 255, g: 255, b: 255, a: 1 }; for (let i = acc.length - 1; i >= 0; i--) bg = over(acc[i], bg); return bg; };
  const root = document.querySelector(scope) || document.body, out = [], seen = new Set();
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) { const t = w.currentNode, el = t.parentElement; if (!t.textContent.trim() || !el || seen.has(el)) continue; seen.add(el);
    if (el.closest('[aria-hidden="true"]')) continue;
    const rc = el.getBoundingClientRect(), cs = getComputedStyle(el); if (!rc.width || !rc.height || cs.visibility === 'hidden') continue;
    if (cs.textShadow && cs.textShadow !== 'none') continue;
    let g = null; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const s = getComputedStyle(e);
      if (/gradient\(/.test(s.backgroundImage) && !/url\(/.test(s.backgroundImage)) { g = e; break; }
      const c = toRGB(s.backgroundColor); if ((c && c.a >= 1) || s.backgroundImage !== 'none') break; }
    if (!g) continue;
    const gs = getComputedStyle(g), base = over(toRGB(gs.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 }, under(g.parentElement || g));
    const bgs = stops(gs.backgroundImage).map(c => over(c, base)); if (!bgs.length) continue;
    let op = 1; for (let q = el; q; q = q.parentElement) op *= +getComputedStyle(q).opacity;
    const fg = toRGB(cs.color); if (!fg) continue;
    const worst = Math.min(...bgs.map(bg => ratio(over(Object.assign({}, fg, { a: fg.a * op }), bg), bg)));
    const fs = parseFloat(cs.fontSize), need = (fs >= 24 || (+cs.fontWeight >= 700 && fs >= 18.66)) ? 3 : 4.5;
    if (worst < need) out.push({ t: (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : el.tagName.toLowerCase()) + ' "' + t.textContent.trim().slice(0, 30) + '"',
      s: worst.toFixed(2) + ':1 against its gradient (needs ' + need + ':1), text ' + cs.color }); }
  return out;
};
const only = (process.env.A11Y_SCREENS || '').split(',').filter(Boolean);
const MODES = (process.env.A11Y_MODES || 'light,white,dusk').split(',');
const SIZES = { phone: { width: 390, height: 844 }, desktop: { width: 1280, height: 900 } };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const found = {};          // key rule|screen -> {impact, help, modes:Set, targets:Set, count}
  const errs = [];
  for (const [size, vp] of Object.entries(SIZES)) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
    await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
    const pg = await ctx.newPage(); pg.on('pageerror', e => errs.push(e.message));
    await pg.goto('file://' + SRC + '/index.html'); await booted(pg);
    await lazy(pg, ['quotes', 'trail', 'atlas']);   // the data Home's reading row and the Atlas draw from
    await pg.addScriptTag({ path: AXE });
    for (const mode of MODES) {
      for (const [scr, go] of Object.entries(SCREENS)) {
        if (only.length && !only.includes(scr)) continue;
        await pg.evaluate(`(()=>{ state.screen='app'; state.pinDlg=null; state.settingsOpen=false; app.setMode(${JSON.stringify(mode)}); (${go.toString()})(); })()`).catch(e => errs.push(scr + ': ' + e.message));
        if (!(await until(pg, READY[scr], null, 30000))) errs.push(`${size}/${mode}: ${scr} never drew what axe reads`);
        /* colour is measured with transitions and animations off, so nothing is caught mid-fade (the
           sheet removed again before the reduced-motion check below, which must see the real CSS) */
        const still = await pg.addStyleTag({ content: STILL }); await frames(pg, 2);
        const res = await pg.evaluate(async () => {
          const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
          return r.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.map(n => ({ t: n.target.join(' '), s: (n.failureSummary || '').split('\n').slice(1, 2).join(' ').slice(0, 140) })) }));
        });
        const grad = await pg.evaluate(`(${GRADIENT_CONTRAST.toString()})(${JSON.stringify(scr === 'settings' ? '#sb-set-ov' : '#root')})`);
        if (grad.length) res.push({ id: 'gradient-contrast', impact: 'serious', help: 'Text on a gradient must meet minimum contrast against every stop', nodes: grad });
        await still.evaluate(e => e.remove());
        for (const v of res) {
          const k = v.id + '|' + scr + '|' + mode;
          const f = found[k] = found[k] || { id: v.id, scr, mode, impact: v.impact, help: v.help, where: new Set(), targets: new Map() };
          f.where.add(size + '/' + mode);
          v.nodes.forEach(n => f.targets.set(n.t, n.s));
        }
      }
    }
    /* focus is visible: tab to the first few controls on Home and look at the ring */
    await pg.evaluate(() => { state.screen = 'app'; app.setMode('light'); app.setNav('home'); });
    await until(pg, READY.home, null, 30000); await frames(pg, 2);
    await pg.evaluate(() => document.activeElement && document.activeElement.blur());
    let ringless = [], tabbed = 0;
    for (let i = 0; i < 8; i++) {
      await pg.keyboard.press('Tab');
      const r = await pg.evaluate(() => {
        const el = document.activeElement; if (!el || el === document.body) return null;
        const cs = getComputedStyle(el);
        const ring = (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 1.5) || /\d+px \d+px 0px [1-9]|0px 0px 0px [2-9]/.test(cs.boxShadow) || (cs.boxShadow !== 'none' && cs.boxShadow.includes('0px 0px 0px'));
        return { tag: el.tagName.toLowerCase() + (el.getAttribute('data-act') ? '[' + el.getAttribute('data-act') + ']' : ''), ring, visible: !!el.matches(':focus-visible') };
      });
      if (!r) continue; tabbed++;
      if (!r.ring) ringless.push(r.tag);
    }
    ok(tabbed >= 4 && !ringless.length, `${size}: keyboard focus is visible on every control tabbed to (${tabbed} tabbed)` + (ringless.length ? ' — no ring on ' + ringless.join(', ') : ''));
    /* reduced motion: nothing long-running is animating */
    const moving = await pg.evaluate(() => {
      const out = [];
      document.querySelectorAll('body *').forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.animationName && cs.animationName !== 'none' && cs.animationPlayState === 'running') {
          const d = parseFloat(cs.animationDuration) * (/ms/.test(cs.animationDuration) ? 0.001 : 1);
          const it = cs.animationIterationCount;
          if (d > 0.05 && (it === 'infinite' || d * parseFloat(it) > 1)) out.push((el.className && String(el.className).split(' ')[0]) + ':' + cs.animationName);
        }
      });
      return [...new Set(out)];
    });
    ok(!moving.length, `${size}: with reduced motion asked for, nothing on Home runs a long animation` + (moving.length ? ' — ' + moving.slice(0, 8).join(', ') : ''));
    await ctx.close();
  }
  await b.close();

  /* ---- the report ---- */
  const keys = Object.keys(found).sort();
  const fresh = keys.filter(k => !KNOWN[k]);
  const known = keys.filter(k => KNOWN[k]);
  console.log(`\n  axe: ${keys.length} rule×screen×look violations (${fresh.length} new, ${known.length} known and owned elsewhere)`);
  for (const k of keys) {
    const f = found[k], tag = fresh.includes(k) ? 'NEW  ' : 'KNOWN';
    console.log(`  ${tag} ${f.id} on ${f.scr} in ${f.mode} [${f.impact}] — ${f.help} (${[...f.where].join(', ')})` + (KNOWN[k] ? ' → ' + KNOWN[k] : ''));
    [...f.targets].slice(0, process.env.A11Y_ALL ? 99 : 4).forEach(([t, s]) => console.log('          ' + t.slice(0, 110) + (s ? '  — ' + s : '')));
  }
  const stale = Object.keys(KNOWN).filter(k => !keys.includes(k));
  if (stale.length && !only.length) console.log('  stale KNOWN entries (fixed — delete them): ' + stale.join(', '));
  ok(!fresh.length, 'no axe violation outside the KNOWN list' + (fresh.length ? ' — ' + fresh.join(', ') : ''));
  ok(!errs.length, 'no page errors' + (errs.length ? ' — ' + errs.slice(0, 3).join(' | ') : ''));
  console.log(fails ? `\n${fails} FAILED` : '\naccessibility pass holds');
  process.exit(fails ? 1 : 0);
})();
