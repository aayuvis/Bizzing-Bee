/* A GAME'S PROMPT AND RESULT ARE SPOKEN TO A SCREEN READER (audit v4 P6) — @check

   No game said anything to assistive technology: the clue, the question and the end card were
   only drawn. One polite live region now carries them (#sb-live, visually hidden, on <body> so a
   render never replaces it — a live region rebuilt with new text is not announced). This holds:
     1. the region exists once, outside #root, role=status / aria-live=polite, and takes no space;
     2. an arcade engine's clue is said as it appears, word for word what the screen shows
        (typeBlaster, which took in Spell Scene on 4 Oct 2026) — never more than the screen;
     3. Word Lore (was Word Quiz) says "Question 1 of 10" and the question; a wrong pick adds only the miss line;
        the next question is said afresh;
     4. a typed game says which word and what to do — and never the word it is asking for;
     5. the Ladder (Word Lore, was Bizzillionaire) says its question; Daily Buzz says its message ("Five letters, please.").
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/live-prompts.cjs                     */
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..') + '/index.html';
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 40, lists: { journey: { xp: 30 } }, activeList: 'journey' };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1180, height: 900 } });
  await ctx.addInitScript(k => { if (!localStorage.getItem('t_seed')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_seed', '1'); } }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto(URL); await pg.waitForTimeout(2600);
  const said = () => pg.evaluate(() => (document.getElementById('sb-live') || {}).textContent || '');

  /* 1 */
  const reg = await pg.evaluate(() => { const all = document.querySelectorAll('#sb-live'); const e = all[0]; if (!e) return null; const r = e.getBoundingClientRect();
    return { n: all.length, inRoot: !!e.closest('#root'), onBody: e.parentElement === document.body, role: e.getAttribute('role'), live: e.getAttribute('aria-live'), w: r.width, h: r.height }; });
  ok(reg && reg.n === 1 && !reg.inRoot && reg.onBody && reg.role === 'status' && reg.live === 'polite' && reg.w <= 1 && reg.h <= 1,
    'one polite live region on <body>, outside the re-rendered #root, taking no space ' + JSON.stringify(reg));

  /* 2 */
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));
  const arc = [];
  /* 4 Oct 2026: Spell Scene left the Play tab (games spec §3.1 — it merges into Type Blaster), so only
     the arcade cards that remain are walked; the merged Type Blaster keeps this check */
  for (const k of ['typeBlaster']) {
    await pg.evaluate(g => app.arcadePlay(g, { fromMenu: true }), k); await pg.waitForTimeout(2200);
    const r = await pg.evaluate(() => { const vis = e => e && e.getClientRects().length; const h = document.querySelector('#arc-host');
      const clue = [...h.querySelectorAll('.sg-cardmean, #ss-hint')].filter(vis).map(e => e.textContent.trim())[0] || '';
      return { clue, said: (document.getElementById('sb-live') || {}).textContent || '' }; });
    arc.push(k + ': ' + JSON.stringify(r));
    ok(r.clue && r.said === 'Clue: ' + r.clue, `${k}: its clue is said as it appears, exactly as shown ("${r.said.slice(0, 60)}")`);
    await pg.evaluate(() => { const x = document.querySelector('#arc-back'); if (x) x.click(); }); await pg.waitForTimeout(200);
  }

  /* 3 — REWRITTEN 4 Oct 2026 (games spec §4.3): Word Quiz's meaning round is Word Lore's Meanings now;
     the same three promises, said by the hub's question card and its miss card */
  await pg.evaluate(() => { app.openLore('meanings'); });
  await pg.waitForFunction(() => state.qz && state.qz.mode === 'meanings' && state.qz.phase === 'play', null, { timeout: 30000 }).catch(() => {}); await pg.waitForTimeout(400);
  const q1 = await said();
  await pg.evaluate(() => { const q = SB_QHUB._cur(); app.qzPick((q.ans + 1) % q.opts.length); }); await pg.waitForTimeout(400);
  const miss = await said();
  await pg.evaluate(() => app.qzGo()); await pg.waitForTimeout(400);
  const q2 = await said();
  ok(/^Question 1 of \d+\. \S/.test(q1), `Word Lore says the question with its number ("${q1.slice(0, 70)}")`);
  ok(/^Not this (time|one)/.test(miss) && !/Question 1/.test(miss), `a wrong pick adds only the miss line ("${miss.slice(0, 70)}")`);
  ok(/^Question 2 of /.test(q2), `and the next question is said afresh ("${q2.slice(0, 40)}")`);

  /* 4 */
  await pg.evaluate(() => { app.exitGame(); app.playGame('buzz'); }); await pg.waitForTimeout(700);
  const ty = await pg.evaluate(() => ({ said: (document.getElementById('sb-live') || {}).textContent || '', w: state.game && state.game.list && state.game.list[state.game.i].w }));
  ok(/^Word 1\. Listen and type\.$/.test(ty.said) && ty.w && !new RegExp('\\b' + ty.w + '\\b', 'i').test(ty.said), `a typed game says which word and what to do, never the word ("${ty.said}")`);

  /* 5 — REWRITTEN 4 Oct 2026: Bizzillionaire is Word Lore's Ladder; it says its rung and its question */
  await pg.evaluate(() => { app.exitGame(); app.openLore('ladder'); });
  await pg.waitForFunction(() => state.qz && state.qz.mode === 'ladder' && state.qz.phase === 'play' && document.querySelector('.qz-card'), null, { timeout: 30000 }).catch(() => {}); await pg.waitForTimeout(400);
  const bz = await pg.evaluate(() => ({ said: (document.getElementById('sb-live') || {}).textContent || '', q: (SB_QHUB._cur() || {}).prompt || '' }));
  ok(bz.q && bz.said.indexOf('Rung 1 of 12. ' + bz.q) === 0, `the Ladder says its rung and its question ("${bz.said.slice(0, 60)}")`);
  await pg.evaluate(() => { app.qzBack(); app.openDaily(); }); await pg.waitForTimeout(600);
  const d1 = await said(); await pg.keyboard.press('Enter'); await pg.waitForTimeout(200); const d2 = await said();
  ok(/morning word/.test(d1) && d2 === 'Five letters, please.', `Daily Buzz says its message, and its "Five letters, please." (${d2})`);
  const tiny = await pg.evaluate(() => [...document.querySelectorAll('.sb-sr')].every(e => { const r = e.getBoundingClientRect(); return r.width <= 1 && r.height <= 1; }));
  ok(tiny, 'every spoken-only line is visually hidden');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
