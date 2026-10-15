/* THE HIVE POST ON A PHONE AND A DESKTOP (circuit/BEE-CIRCUIT.md §3.1, §9, §13 tests 8, 9, 10, 13; L7, L8, L9).

   The Bee Circuit's mail lives in the Collection's fourth tab, drawn by circuit.js (boot-lazy `circuit`). A season is
   played through the API (as the halls, cases and Team Night builds will), then the screen is held to:
     TAB          the Collection carries "Hive Post" (a drawn envelope, no emoji); #/hive/post opens it; circuit.js is
                  fetched at that door, never before (not on the first screen).
     L9           every Hive Post page — the mail, each piece, the Suspect Board, the Visitors' Book, the stamps — carries
                  the fiction line.
     TEST 8/9     EVERY delivered piece, opened in the reader at 390 × 844, fits between the top bar and the tab bar with
                  its controls; and every one of SB_CIRCUIT.keys() (every line in circuit-data.js) set as a piece fits
                  too. Read aloud says exactly the piece (device speech, speechSynthesis — no clip, amendment 3).
     TARGETS      every control on every Hive Post view, the moment card and the board's envelope is ≥ 44 × 44 at 390.
     NO EMOJI     no pictograph in any control or heading (the browser's own Extended_Pictographic, ©®™ aside).
     TEST 10      no text input anywhere: no input, textarea, select or [contenteditable] on any view or the moment card.
     TOUCH        taps: Pip's word shows and says its meaning; the turn's choice; pinning a clue under a suspect; naming V.
                  (a wrong name looks again with that suspect's line, the right one opens the reveal); the closing reply;
                  a bee file's "Add missed words to revision"; the board's envelope opens the Hive Post.
     KEYBOARD     desktop: Tab + Enter opens a chapter, → and ← page through, Esc goes back; the moment card takes the
                  focus, traps Tab, closes on Esc and on its button, and "Open the Hive Post" opens it.
     TEST 13      ?demo: a season played on a demo page leaves the real storage without a single Circuit piece.
     AXE          axe (WCAG 2.1 A + AA) finds nothing on the mail, a piece, the board and the stamps, light and dusk.
   SB_ROOT=<dir> runs against another tree (a scratch root of symlinks with one file replaced).
   PROVED BY BREAKING (circuit/BUILD-core.md has the record):
     - circuit.js without the fiction line on the reader → L9 fails;
     - circuit.js bee file with its intro back in the open (no details) → "every delivered piece fits" fails (bee files);
     - circuit.js reader controls at min-height 36px → TARGETS fails;
     - circuit.js reading aloud the piece's label instead of its text → "Read aloud says exactly the piece" fails;
     - circuit.js with a <textarea> on the Suspect Board → TEST 10 fails;
     - circuit.js's keydown handler without Escape → KEYBOARD fails;
     - circuit.js's persist() without its SB_DEMO guard and a save on a demo page… holds (the demo sandbox keeps it in
       memory) — so this check was proved by pointing the demo page's writes at the real storage (app3.js's save()
       writing through a non-demo SB_STORE): fails.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/circuit-post.cjs                                       */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { until } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT ? path.resolve(process.env.SB_ROOT) : path.resolve(__dirname, '..');
const AXE = (() => { try { return require.resolve('axe-core/axe.min.js'); } catch (e) {} const p = path.join(__dirname, '..', 'node_modules', 'axe-core', 'axe.min.js'); return fs.existsSync(p) ? p : null; })();
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const some = (a, n) => (a.length ? ' — ' + a.slice(0, n || 5).join(' | ') + (a.length > (n || 5) ? ' … (' + a.length + ')' : '') : '');
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 0, fr: '2026-10-01', lists: { default: { xp: 30 } }, activeList: 'default',
  missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: { u11: { 1: 1 }, u93: { 1: 1 } }, chk: {}, seen: {}, st: {}, elap: 1, edone: {}, echk: {} } };
const URL = 'file://' + ROOT + '/index.html';

/* the careful season, played in the page through the API */
const SEASON = () => {
  const C = SB_CIRCUIT; const acts = SB_CIRCUIT_DATA.rounds.map((r) => r.act);
  acts.forEach((a, i) => { C.onHallOpen(a); C.onHall(a, { place: i % 2 ? 1 : 3, of: 6, above: !!(i % 2),
    words: [{ w: 'knife', ok: false, asks: 0 }, { w: 'phantom', ok: true, asks: 2 }, { w: 'rhythm', ok: true, asks: 1 }, { w: 'separate', ok: true, asks: 0 }], missed: ['knife'] }); });
  C.onTeamNight({ place: 1, of: 2, words: [{ w: 'listen', ok: true, asks: 1 }], calls: { right: 5, of: 7 } });
  C.onLevelUp(3);
  return C.state().mail.length;
};
/* the screen between the fixed top bar and the fixed tab bar */
const SPACE = () => { const H = innerHeight; let top = 0, bot = H;
  for (const e of document.querySelectorAll('body *')) { const cs = getComputedStyle(e); if (cs.position !== 'fixed' || cs.display === 'none' || cs.visibility === 'hidden' || e.closest('.hp-moment')) continue;
    const r = e.getBoundingClientRect(); if (!r.height || r.height > H / 3 || r.width < innerWidth / 2) continue;
    if (r.top <= 1) top = Math.max(top, r.bottom); else if (r.bottom >= H - 1) bot = Math.min(bot, r.top); }
  return { top, bot, h: bot - top }; };
const AUDIT = (sel) => { const root = document.querySelector(sel); if (!root) return null;
  const RE = /\p{Extended_Pictographic}/u, OKC = /[©®™]/g;
  const ctl = [...root.querySelectorAll('button, a[href], summary, [role="button"]')].filter((e) => e.offsetParent !== null || getComputedStyle(e).position === 'fixed');
  const small = ctl.map((e) => [e, e.getBoundingClientRect()]).filter(([, r]) => r.width && (r.width < 43.5 || r.height < 43.5)).map(([e, r]) => (e.getAttribute('aria-label') || e.textContent.trim().slice(0, 24)) + ' ' + Math.round(r.width) + '×' + Math.round(r.height));
  const emoji = [...root.querySelectorAll('button, a, summary, h1, h2, h3, h4, .hp-k, .hp-rg, .hp-rl, .hp-tab, .hp-row')].map((e) => e.textContent.replace(OKC, '')).filter((t) => RE.test(t)).map((t) => t.trim().slice(0, 30));
  const inputs = root.querySelectorAll('input, textarea, select, [contenteditable]').length;
  return { small, emoji, inputs, fiction: !!root.querySelector('.hp-fiction') || !!root.closest('.hp-post') }; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find((p) => fs.existsSync(p)) });
  const errs = [];
  const boot = async (vp, opts) => {
    opts = opts || {};
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, hasTouch: !!vp.touch, isMobile: !!vp.touch, reducedMotion: 'reduce' });
    await ctx.addInitScript(([a, mode]) => { try { if (!/[?&]demo/.test(location.search) && !localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode, pin: '1234', activeIdx: 0, children: [a] }));
      localStorage.setItem('t_seed', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {}
      window.__said = []; try { const S = window.speechSynthesis; if (S) { S.speak = (u) => { window.__said.push(String(u && u.text)); }; S.cancel = () => {}; } } catch (e) {} }, [KID, opts.mode || 'light']);
    const pg = await ctx.newPage(); pg.on('pageerror', (e) => errs.push(vp.n + ': ' + e.message));
    await pg.goto(URL + (opts.q || ''));
    await pg.waitForFunction(() => typeof state !== 'undefined' && typeof app !== 'undefined' && !!state.screen, null, { timeout: 30000 });
    return { ctx, pg };
  };
  const settle = (pg) => pg.waitForTimeout(120);

  /* ================================================================ phone */
  {
    const vp = { n: 'phone', width: 390, height: 844, touch: true };
    const { ctx, pg } = await boot(vp);
    ok(await pg.evaluate(() => !window.SB_CIRCUIT && !(window.SB_LAZY && SB_LAZY.ready('circuit')) && ![...document.scripts].some((s) => /circuit/.test(s.src))), 'nothing of the Circuit is on the first screen (circuit.js and its data are not fetched at boot)');
    await pg.evaluate(() => { state.screen = 'app'; render(); location.hash = '#/hive/post'; });
    const opened = await until(pg, () => !!document.querySelector('.hp-post .hp-fiction'), null, 30000);
    const tab = await pg.evaluate(() => { const t = document.querySelector('[data-act="collTab"][data-arg="post"]'); return t && { svg: !!t.querySelector('svg'), text: t.textContent.trim(), on: state.collTab === 'post' && state.nav === 'collection' }; });
    ok(opened && tab && tab.svg && tab.text === 'Hive Post' && tab.on, '#/hive/post opens the Collection\'s "Hive Post" tab (a drawn envelope, no emoji), fetching circuit.js at that door');
    ok(await pg.evaluate(() => /No mail yet/.test(document.querySelector('.hp-post').textContent)), 'a child with no Circuit mail yet sees "No mail yet."');
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need('words1', r)));   /* a tap made before the word tier lands is held for it (app3 tapAct) */
    const n = await pg.evaluate(SEASON); await settle(pg); await pg.evaluate(() => render()); await settle(pg);
    ok(n > 100, `a careful season delivered through the API: ${n} pieces`);
    const space = await pg.evaluate(SPACE);

    /* every delivered piece: fits, carries the fiction line, reads aloud exactly */
    const bad = [], said = [], aud = [];
    for (let i = 0; i < n; i++) {
      await pg.evaluate((i) => { app.hivePost('read|' + i); }, i);
      const r = await pg.evaluate(([i, sp]) => { const R = document.querySelector('.hp-reader'); if (!R) return { miss: true };
        R.scrollIntoView({ block: 'start' }); const top = R.getBoundingClientRect(); window.scrollBy(0, top.top - sp.top - 4);
        const rr = R.getBoundingClientRect(); return { h: Math.round(rr.height), fiction: !!document.querySelector('.hp-post .hp-fiction'), key: SB_CIRCUIT.state().mail[i].key }; }, [i, space]);
      if (r.miss) { bad.push(i + ' no reader'); continue; }
      if (r.h > space.h) bad.push(r.key + ' ' + r.h + 'px > ' + Math.round(space.h));
      if (!r.fiction) bad.push(r.key + ' without the fiction line');
      if (i % 9 === 0 || /bee\.|turn\.scene|closingLetter|pieces\.pip$/.test(r.key)) {
        await pg.tap('.hp-reader .hp-say'); const s = await pg.evaluate((i) => ({ got: window.__said[window.__said.length - 1], want: SB_CIRCUIT.piece(null, i).text }), i);
        if (s.got !== s.want) said.push(r.key);
        const a = await pg.evaluate(AUDIT, '.hp-post'); if (a.small.length || a.emoji.length || a.inputs) aud.push(r.key + ': ' + a.small.concat(a.emoji).join(', ') + (a.inputs ? ' inputs ' + a.inputs : ''));
      }
    }
    ok(!bad.length, `every one of the ${n} delivered pieces, opened at 390 × 844, fits the ${Math.round(space.h)}px between the top bar and the tab bar with its controls, fiction line above` + some(bad));
    ok(!said.length, 'Read aloud (a tap) says exactly the piece, through the device voice' + some(said));
    ok(!aud.length, 'on every piece checked: controls ≥ 44 × 44, no emoji, no text input' + some(aud));
    /* every line of the data, set as a piece */
    const lines = await pg.evaluate((sp) => { const K = SB_CIRCUIT.keys(); const host = document.querySelector('.hp-post'); const out = [];
      for (const k of K) { const a = document.createElement('article'); a.className = 'hp-reader hp-card';
        a.innerHTML = '<header class="hp-rh"><span class="hp-rg">Round VIII · the Finish Arch</span><span class="hp-rl">Letter · 9 of 20</span></header><div class="hp-body">' + SB_CIRCUIT.lineHTML(k) + '</div><div class="hp-ctl hp-nav"><button class="hp-btn">Read aloud</button></div>';
        host.appendChild(a); const h = a.getBoundingClientRect().height; a.remove(); if (h > sp.h) out.push(k + ' ' + Math.round(h)); }
      return { n: K.length, out }; }, space);
    ok(lines.n > 600 && !lines.out.length, `every one of the ${lines.n} lines in circuit-data.js, set as a piece, fits one 390 × 844 screen` + some(lines.out));

    /* the views */
    for (const v of ['mail', 'board', 'visitors', 'stamps']) {
      await pg.evaluate((v) => app.hivePost('view|' + v), v); await settle(pg);
      const a = await pg.evaluate(AUDIT, '.hp-post');
      ok(a && a.fiction && !a.small.length && !a.emoji.length && !a.inputs, `${v}: the fiction line, controls ≥ 44px, no emoji, no text input` + some(a ? a.small.concat(a.emoji) : ['no view']));
    }
    await pg.evaluate(() => app.hivePost('view|visitors')); await settle(pg);
    const vis = await pg.evaluate(() => { const t = document.querySelector('.hp-post').textContent; return { echo: /Echo · echo/.test(t), diesel: /Rudolf Diesel · diesel/.test(t), sources: document.querySelectorAll('.hp-vis details').length }; });
    ok(vis.echo && vis.diesel && vis.sources >= 2, 'the Visitors\' Book shows the visitors at stops the child has walked (Echo, Rudolf Diesel), each with its sources');

    /* touch flows */
    const idx = (k) => pg.evaluate((k) => SB_CIRCUIT.state().mail.findIndex((m) => m.key === k), k);
    await pg.evaluate(async (i) => app.hivePost('read|' + i), await idx('rounds[0].pieces.pip')); await settle(pg);
    await pg.tap('.hp-pipw'); await settle(pg);
    const pip = await pg.evaluate(() => ({ real: !!document.querySelector('.hp-real'), said: window.__said[window.__said.length - 1] }));
    ok(pip.real && /seeming to be everywhere at once/.test(pip.said), 'a tap on Pip\'s word shows its real meaning and says it');
    await pg.evaluate(async (i) => app.hivePost('read|' + i), await idx('turn.scene')); await settle(pg);
    await pg.tap('[data-arg="dax|false"]'); await settle(pg);
    ok(await pg.evaluate(() => SB_CIRCUIT.state().dax.helped === false && /Thanks for the minute/.test(document.querySelector('.hp-reader').textContent) && !document.querySelector('[data-arg^="dax|"]')),
      'the turn\'s choice is two pre-written buttons; a tap keeps it and shows its one line');
    await pg.evaluate(() => app.hivePost('view|board')); await settle(pg);
    await pg.tap('[data-arg="pin|v-slant"]'); await settle(pg);
    await pg.tap('[data-arg="pinto|v-slant|vale"]'); await settle(pg);
    const pin = await pg.evaluate(() => ({ pressed: (document.querySelector('[data-arg="pinto|v-slant|vale"]') || {}).getAttribute && document.querySelector('[data-arg="pinto|v-slant|vale"]').getAttribute('aria-pressed'), kept: SB_CIRCUIT.state().board.suspects.vale.join() }));
    await pg.tap('[data-arg="pindone"]'); await settle(pg);
    ok(pin.pressed === 'true' && pin.kept === 'v-slant' && await pg.evaluate(() => /runner fixed the last line/.test([...document.querySelectorAll('.hp-port')].pop().textContent)),
      'a clue is pinned under a suspect by a tap (pre-written labels only) and shows under that portrait');
    await pg.tap('[data-arg="accuseon"]'); await settle(pg);
    await pg.tap('[data-arg="accuse|ratchet"]'); await settle(pg);
    const look = await pg.evaluate(() => ({ t: (document.querySelector('.hp-look') || {}).textContent || '', accused: SB_CIRCUIT.state().board.accused }));
    ok(/Ratchet writes has a misprint/.test(look.t) && look.accused == null, 'naming the wrong suspect looks again with that suspect\'s own line');
    await pg.tap('[data-arg="accuse|vale"]'); await settle(pg);
    ok(await pg.evaluate(() => /The runner is at the back of the hall/.test((document.querySelector('.hp-reader') || {}).textContent || '') && SB_CIRCUIT.state().board.accused === 'vale'), 'naming Vale opens the reveal');
    await pg.evaluate(async (i) => app.hivePost('read|' + i), await idx('accusation.closingLetter')); await settle(pg);
    await pg.tap('[data-arg="closing|1"]'); await settle(pg);
    ok(await pg.evaluate(() => SB_CIRCUIT.state().closing === 1 && /can I help write to the newest speller/.test(document.querySelector('.hp-reader').textContent)), 'the closing reply is a pre-written choice, kept and shown');
    await pg.evaluate(async (i) => app.hivePost('read|' + i), await idx('bee.library.1')); await settle(pg);
    await pg.tap('.hp-reader [data-arg^="file|"]'); await settle(pg);
    ok(await pg.evaluate(() => (active().missed || []).some((x) => x.w === 'knife') && /On your revision pile/.test(document.querySelector('.hp-reader').textContent)), 'a bee file\'s one tap puts the missed word on the revision pile');
    /* the board's envelope and the moment card, at 390 */
    await pg.evaluate(() => { app.setNav('home'); }); await settle(pg);
    await pg.evaluate(() => { state.collTab = 'badges'; SB_CIRCUIT.state().mail.forEach((m) => { m.read = false; });
      const host = document.querySelector('#root .sb-content') || document.querySelector('#root'); const d = document.createElement('div'); d.id = 't-board'; d.style.cssText = 'position:relative;height:120px';
      d.innerHTML = SB_CIRCUIT.boardExtras('meadow'); host.prepend(d); });
    const env = await pg.evaluate(() => { const e = document.querySelector('#t-board .hp-env'); if (!e) return null; const r = e.getBoundingClientRect(); return { w: r.width, h: r.height, label: e.getAttribute('aria-label'), emoji: /\p{Extended_Pictographic}/u.test(e.textContent) }; });
    ok(env && env.w >= 44 && env.h >= 44 && env.label && !env.emoji, 'the board\'s envelope shows while mail waits: a drawn 44px+ button with a name, no count badge');
    await pg.tap('#t-board .hp-env'); await until(pg, () => state.nav === 'collection' && !!document.querySelector('.hp-post'), null, 10000);
    ok(await pg.evaluate(() => state.nav === 'collection' && state.collTab === 'post'), 'a tap on the envelope opens the Hive Post');
    await pg.evaluate(() => { SB_CIRCUIT.onLevelUp(7); SB_CIRCUIT.showMoment(); }); await settle(pg);
    const m = await pg.evaluate(AUDIT, '.hp-moment');
    ok(m && !m.small.length && !m.emoji.length && !m.inputs, 'the moment card: controls ≥ 44px, no emoji, no text input' + some(m ? m.small : ['no card']));
    await pg.tap('.hp-moment [data-hp="close"]'); await settle(pg);
    ok(await pg.evaluate(() => !document.querySelector('.hp-moment')), 'its Close button closes it');
    await ctx.close();
  }

  /* ================================================================ desktop, keyboard */
  {
    const vp = { n: 'desktop', width: 1280, height: 800 };
    const { ctx, pg } = await boot(vp);
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['words1', 'scrMe', 'circuit'], r)));
    await pg.evaluate(() => { state.screen = 'app'; SB_CIRCUIT.open('mail'); });
    await until(pg, () => !!document.querySelector('.hp-post'), null, 20000);
    await pg.evaluate(SEASON); await pg.evaluate(() => render()); await settle(pg);
    await pg.evaluate(() => document.activeElement && document.activeElement.blur());
    let found = false;
    for (let t = 0; t < 60 && !found; t++) { await pg.keyboard.press('Tab'); found = await pg.evaluate(() => !!(document.activeElement && document.activeElement.classList.contains('hp-row'))); }
    ok(found, 'Tab reaches the first chapter of the mail');
    await pg.keyboard.press('Enter'); await settle(pg);
    const k0 = await pg.evaluate(() => SB_CIRCUIT.state().mail.findIndex((m) => m === SB_CIRCUIT.state().mail[0]) === 0 && !!document.querySelector('.hp-reader') && document.activeElement && !!document.activeElement.closest('.hp-reader') && document.activeElement.classList.contains('hp-say'));
    ok(k0, 'Enter opens it in the reader, with the focus on the piece\'s Read aloud (a soft redraw keeps it there)');
    const l1 = await pg.evaluate(() => document.querySelector('.hp-rl').textContent);
    await pg.keyboard.press('ArrowRight'); await settle(pg);
    const l2 = await pg.evaluate(() => document.querySelector('.hp-rl').textContent);
    await pg.keyboard.press('ArrowLeft'); await settle(pg);
    const l3 = await pg.evaluate(() => document.querySelector('.hp-rl').textContent);
    ok(/1 of/.test(l1) && /2 of/.test(l2) && l3 === l1, `→ and ← page through the pieces ("${l1}" → "${l2}" → back)`);
    await pg.keyboard.press('Escape'); await settle(pg);
    ok(await pg.evaluate(() => !document.querySelector('.hp-reader') && !!document.querySelector('.hp-row')), 'Esc goes back to the mail');
    /* the moment card: focus, trap, Esc, its buttons, by keyboard */
    await pg.evaluate(() => { SB_CIRCUIT.onLevelUp(9); SB_CIRCUIT.showMoment(); }); await settle(pg);
    const f1 = await pg.evaluate(() => document.activeElement && document.activeElement.closest('.hp-moment') && document.activeElement.getAttribute('data-hp'));
    for (let t = 0; t < 5; t++) await pg.keyboard.press('Tab');
    const f2 = await pg.evaluate(() => !!(document.activeElement && document.activeElement.closest('.hp-moment')));
    ok(f1 === 'open' && f2, 'the moment card takes the focus (on "Open the Hive Post") and keeps Tab inside it');
    await pg.keyboard.press('Escape'); await settle(pg);
    ok(await pg.evaluate(() => !document.querySelector('.hp-moment')), 'Esc closes it');
    await pg.evaluate(() => { app.setNav('home'); }); await settle(pg);
    await pg.evaluate(() => { SB_CIRCUIT.onLevelUp(10); SB_CIRCUIT.showMoment(); }); await settle(pg);
    await pg.keyboard.press('Enter'); await until(pg, () => state.nav === 'collection' && !!document.querySelector('.hp-post'), null, 10000);
    ok(await pg.evaluate(() => state.nav === 'collection' && state.collTab === 'post' && !document.querySelector('.hp-moment')), 'Enter on "Open the Hive Post" opens it');
    /* axe on the Hive Post, light and dusk */
    if (!AXE) ok(false, 'axe-core is not installed — run `npm install` in spellbound-app/');
    else {
      await pg.addScriptTag({ path: AXE });
      const v = [];
      for (const mode of ['light', 'dusk']) {
        await pg.evaluate((m) => app.setMode(m), mode);
        for (const view of ['view|mail', 'read|8', 'view|board', 'view|stamps']) {
          await pg.evaluate((a) => app.hivePost(a), view); await settle(pg);
          const r = await pg.evaluate(async () => { const x = await axe.run(document.querySelector('.hp-post'), { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] }, resultTypes: ['violations'] });
            return x.violations.map((q) => q.id + ' ' + q.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(', ')); });
          r.forEach((x) => v.push(mode + '/' + view + ': ' + x));
        }
      }
      ok(!v.length, 'axe (WCAG 2.1 A + AA) finds nothing on the mail, a piece, the board and the stamps, light and dusk' + some(v));
    }
    await ctx.close();
  }

  /* ================================================================ ?demo writes nothing */
  {
    const { ctx, pg } = await boot({ n: 'demo', width: 390, height: 844 }, { q: '?demo=1' });
    await pg.evaluate(() => new Promise((r) => SB_LAZY.need(['words1', 'circuit'], r)));
    const n = await pg.evaluate(() => { state.screen = 'app'; return window.SB_DEMO ? (function () { const C = SB_CIRCUIT; SB_CIRCUIT_DATA.rounds.forEach((r) => C.onHall(r.act, { place: 1, of: 6, above: true, words: [] })); return C.state().mail.length; })() : -1; });
    const real = await ctx.newPage(); await real.goto('file://' + ROOT + '/tests/lib/storage-probe.html').catch(() => {});
    const leak = await real.evaluate(() => { const out = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (/"circuit"/.test(localStorage.getItem(k) || '') && /rounds\[/.test(localStorage.getItem(k) || '')) out.push(k); } return out; }).catch((e) => ['probe failed: ' + e.message]);
    ok(n > 50 && !leak.length, `a season played on a ?demo page (${n} pieces, in memory) leaves the real storage without one Circuit piece` + some(leak));
    await ctx.close();
  }

  ok(!errs.length, 'no page errors' + some(errs));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nthe Hive Post reads on a phone and a desktop, by touch and by key, one screen a piece');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('  FAIL ' + (e && e.stack || e)); process.exit(1); });
