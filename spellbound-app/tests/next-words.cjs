/* T7 (in the page) — ONE DOOR FOR WORDS: nextWords() and kidSafe() hold their contract (games spec §1.1–1.2)

   tests/word-door.cjs proves no game reads the corpus around the door; this proves the door itself,
   on the real page, with the whole core library in:
     · 1,000 words a level for a nine-year-old and a twelve-year-old, every one kidSafe for that child,
       inside the level window, none repeated inside the 150-word window
     · the audit's two words: "doping" and "stupid" sitting in a nine-year-old's own missed words —
       which the old picker put straight into its pool — are not in a Grand Prix gate pool at Medium
       and never come out of a draw
     · tier -1 / +1 move the window one step; daily is the same word twice and for every child in a
       band, and leaves the window alone; review serves the child's own due words
     · War & Weaponry (minBand 11-15) gives a nine-year-old nothing and a twelve-year-old words, and is
       not in a nine-year-old's theme catalogue; forge/paths without their tables serve nothing
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/next-words.cjs                          */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const { booted, lazy } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const kid = (name, band, age) => ({ name, age, ageBand: band, avatar: 'panda', theme: 'spellbound', coins: 0, band: 4, lists: { journey: { xp: 12 } }, activeList: 'journey' });
const SEED = { theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [kid('Ahana', '8-10', 9), kid('Dev', '11-13', 12)] };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || (fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined) });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('t_nw')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_nw', '1'); } } catch (e) {} }, SEED);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html');
  ok(await booted(pg), 'the app booted');
  await lazy(pg, 'words2');
  const r = await pg.evaluate(() => {
    const out = {}; const kids = state.children; const K = (i) => { state.activeIdx = i; return kids[i]; };
    out.api = typeof nextWords === 'function' && typeof nextWords.pool === 'function' && typeof kidSafe === 'function' && !!window.SB_KID_SAFE;
    out.lib = (SB_DATA.nsf || []).length;
    /* 1. a thousand a level, per band */
    out.levels = [];
    for (const i of [0, 1]) { const c = K(i);
      for (const level of ['easy', 'medium', 'hard', 'champ']) { c.gameLog = [];
        const [lo, hi] = diffRange(c, level); const ws = nextWords(c, 1000, { purpose: 'drill', level });
        const keys = ws.map(w => nkey(w.w)); const win = new Set();
        let rep = 0; keys.forEach((k, j) => { if (j >= 150) win.delete(keys[j - 150]); if (win.has(k)) rep++; win.add(k); });
        out.levels.push({ age: c.age, level, n: ws.length, unsafe: ws.filter(w => !kidSafe(w, c)).map(w => w.w).slice(0, 5),
          outside: ws.filter(w => { const y = w.y || 3; return y < lo || y > hi; }).length, rep,
          logged: JSON.stringify(c.gameLog.slice(-150)) === JSON.stringify(keys.slice(-150)) }); } }
    /* 2. the audit's words, planted where the old picker looked first */
    const c9 = K(0); c9.gameLog = [];
    const rec = w => (SB_DATA.nsf || []).find(x => x.w === w) || { w, d: '', y: 2 };
    state.missedWords = [rec('doping'), rec('stupid'), rec('meadow')];
    const gate = []; for (let k = 0; k < 40; k++) gate.push(...nextWords(c9, 12, { purpose: 'gate', level: 'medium' }));
    const gpool = nextWords.pool(c9, { purpose: 'gate', level: 'medium' });
    out.audit = { served: gate.filter(w => /^(doping|stupid)$/.test(w.w)).map(w => w.w).concat(gpool.filter(w => /^(doping|stupid)$/.test(w.w)).map(w => 'pool:' + w.w)), meadow: gpool.some(w => w.w === 'meadow'),
      ks: [kidSafe(rec('doping'), c9), kidSafe(rec('stupid'), c9)], old: (() => { try { return gameWords({}).some(w => w.w === 'doping'); } catch (e) { return null; } })() };
    state.missedWords = [];
    /* 3. tiers, daily, review */
    c9.gameLog = []; const [mlo, mhi] = diffRange(c9, 'medium');
    const up = nextWords(c9, 200, { level: 'medium', tier: 1 }), down = nextWords(c9, 200, { level: 'medium', tier: -1 });
    out.tier = { up: up.every(w => (w.y || 3) >= Math.min(9, mlo + 1) && (w.y || 3) <= Math.min(9, mhi + 1)), down: down.every(w => (w.y || 3) >= Math.max(1, mlo - 1) && (w.y || 3) <= Math.max(1, mhi - 1)), n: up.length + down.length };
    const log0 = c9.gameLog.length;
    const d1 = nextWords(c9, 1, { purpose: 'daily', date: '2026-10-04' }), d2 = nextWords(c9, 1, { purpose: 'daily', date: '2026-10-04' }), d3 = nextWords(c9, 1, { purpose: 'daily', date: '2026-10-05' });
    const twin = Object.assign({}, c9, { name: 'Twin', band: 8, gameDiff: 'champ' });
    out.daily = { a: d1[0] && d1[0].w, b: d2[0] && d2[0].w, next: d3[0] && d3[0].w, twin: (nextWords(twin, 1, { purpose: 'daily', date: '2026-10-04' })[0] || {}).w,
      teen: (nextWords(kids[1], 1, { purpose: 'daily', date: '2026-10-04' })[0] || {}).w, logged: c9.gameLog.length - log0, def: !!(d1[0] && d1[0].d) };
    c9.mast = Object.assign({}, c9.mast || {}, { harbour: { b: 1, due: mastDay() - 1, d: mastDay() - 3, ok: 0, n: 2 } });
    const rv = nextWords(c9, 10, { purpose: 'review' }); out.review = rv.map(w => w.w);
    /* 4. themes, tables, lemmas, origin */
    out.theme = { kid: nextWords(c9, 10, { theme: 'war' }).length, kidCat: themeDefs().some(t => t.id === 'war'), teen: nextWords(kids[1], 10, { theme: 'war' }).length, teenCat: (state.activeIdx = 1, themeDefs().some(t => t.id === 'war')) };
    state.activeIdx = 0;
    out.forge = nextWords(c9, 5, { purpose: 'forge' }).length; out.paths = nextWords(c9, 5, { purpose: 'paths' }).length;
    const lem = nextWords(c9, 300, { lemmaOnly: true, level: 'hard' }); out.lemma = lem.filter(w => /^(an? )?(plural|past tense)\b/i.test(w.d || '')).map(w => w.w);
    const lore = nextWords(c9, 40, { purpose: 'lore', origin: 'French' }); out.lore = { n: lore.length, all: lore.every(w => /french/i.test(w.o || '') && w.d) };
    const len = nextWords(c9, 60, { minLen: 4, maxLen: 6 }); out.len = len.every(w => w.w.replace(/[^a-z]/gi, '').length >= 4 && w.w.replace(/[^a-z]/gi, '').length <= 6);
    return out;
  });
  ok(r.api, 'nextWords, nextWords.pool, kidSafe and the kid-safe list are on the page');
  ok(r.lib > 40000, `the whole core library is in (${r.lib} records)`);
  for (const L of r.levels) {
    ok(L.n === 1000 && !L.unsafe.length && L.outside === 0, `age ${L.age} · ${L.level}: 1,000 words, every one kidSafe for this child and inside the level window` + (L.unsafe.length ? ' — ' + L.unsafe.join(', ') : '') + (L.outside ? ` (${L.outside} outside)` : ''));
    ok(L.rep === 0 && L.logged, `age ${L.age} · ${L.level}: no word twice inside any 150-word window, and every word served is logged (${L.rep} repeats)`);
  }
  ok(!r.audit.served.length && r.audit.ks.every(v => v === false), `"doping" and "stupid" fail kidSafe for a nine-year-old and never come out of a Grand Prix gate draw at Medium — 480 words drawn${r.audit.served.length ? ', served: ' + r.audit.served.join(', ') : ''}`);
  ok(r.audit.meadow, 'while a harmless missed word from the same list is still in the pool');
  ok(r.tier.up && r.tier.down && r.tier.n === 400, 'tier +1 and -1 move the window one step up and down');
  ok(r.daily.a && r.daily.a === r.daily.b && r.daily.a === r.daily.twin && r.daily.def, `daily: the same word twice in a day, and for another child in the band at another level ("${r.daily.a}")`);
  ok(r.daily.next && r.daily.next !== r.daily.a && r.daily.teen && r.daily.logged === 0, `daily: a new word the next day ("${r.daily.next}"), its own word for an older band ("${r.daily.teen}"), and the window untouched`);
  ok(r.review.includes('harbour'), 'review serves a word whose Leitner gap is up — ' + r.review.slice(0, 5).join(', '));
  ok(r.theme.kid === 0 && !r.theme.kidCat && r.theme.teen > 0 && r.theme.teenCat, `War & Weaponry: nothing and not listed for a nine-year-old; ${r.theme.teen} words and listed for a twelve-year-old`);
  ok(r.forge === 0 && r.paths === 0, 'forge and paths serve nothing until their tables exist');
  ok(!r.lemma.length, 'lemmaOnly serves no "plural of / past tense of" glosses' + (r.lemma.length ? ' — ' + r.lemma.slice(0, 5).join(', ') : ''));
  ok(r.lore.n > 0 && r.lore.all, `lore + origin: ${r.lore.n} French words, each with a meaning`);
  ok(r.len, 'minLen / maxLen hold');
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
