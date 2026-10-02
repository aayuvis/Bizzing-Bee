/* EVERY QUESTION IS GENERATED AND TESTED (FIX-BEE D8, family standard §6).

   The question generators are run over REAL words — a seeded sample of the served library,
   weighted towards the risky ones whose own definition or sentence names them — and every
   question that comes out is checked the way Bizzing Maths and Geography check theirs:
     · the target spelling is never in the visible text before the attempt
     · exactly one option is right, and the options are distinct
     · the right answer lands evenly across the option slots (option order has leaked answers
       here before: authored answers sat in slot B; sort(()=>Math.random()-.5) is biased)
   Modes: the practice card (all three hints open), the Atlas quiz gate (spell, kit, concept and
   meaning items), the vocabulary check, the Mock Bee (at the microphone with every question
   asked, and its meaning round), trivia (all five levels), and the game cards (Word Quiz
   spellings / meanings / origins / vocabulary / idioms, Magic Squares, the typed game hint).
   Plus the header search: off while a word is live, on again after.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/question-leaks.cjs                 */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const seed = { theme: 'spellbound', mode: 'light', premium: false, activeIdx: 0, pin: '1234',
  children: [{ name: 'Ahana', age: 11, ageBand: '11-13', avatar: 'bizzy', theme: 'spellbound', coins: 50, xp: 0, lists: { default: { xp: 3 } },
    activeList: 'default', missed: [], unlockedThemes: ['spellbound'], trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } }] };
const EVEN = (h, label) => { const n = h.reduce((a, b) => a + b, 0); const sh = h.map(x => x / (n || 1));
  return { n, ok: n >= 500 && sh.every(x => Math.abs(x - 1 / h.length) <= 0.06), txt: label + ' slots ' + sh.map(x => (x * 100).toFixed(0) + '%').join('/') + ' over ' + n }; };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1100, height: 900 } });
  await ctx.addInitScript(s => { try { if (!localStorage.getItem('sb_t_seeded')) { localStorage.setItem('sb_saas_v2', JSON.stringify(s)); localStorage.setItem('sb_t_seeded', '1'); } } catch (e) {} }, seed);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(2800);

  const r = await pg.evaluate(async () => {
    const W = ms => new Promise(res => setTimeout(res, ms)); const o = { leaks: {}, dup: {}, one: {}, hist: {}, n: {} };
    state.sound = false; window.Audio = function () { return { play: () => Promise.resolve(), pause: () => {} }; }; try { speechSynthesis.speak = () => {}; } catch (e) {}
    await new Promise(res => SB_LAZY.need(['words', 'atlas', 'lists'], res)); await W(600);
    state.screen = 'app'; render();
    /* a seeded sample of real words: the risky ones (named by their own definition or sentence) first */
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const has = (txt, w) => new RegExp('(^|[^a-z])' + esc(String(w).toLowerCase()) + '($|[^a-z])', 'i').test(String(txt || ''));
    const all = (SB_DATA.nsf || []).filter(w => w && w.w && /^[a-z][a-z'-]{2,}$/.test(w.w) && w.d);
    const risky = all.filter(w => has(w.d, w.w) || has(w.s, w.w));
    const pick = (arr, n) => { const out = []; const seen = new Set(); let g = 0; while (out.length < n && g++ < n * 20 && arr.length) { const w = arr[Math.floor(rnd() * arr.length)]; if (!seen.has(w.w)) { seen.add(w.w); out.push(w); } } return out; };
    /* every word whose own DEFINITION names it (a handful survive the generator's check), then
       ones whose sentence does (nearly all — the sentence always uses the word), then any */
    const defRisky = all.filter(w => has(w.d, w.w)).slice(0, 12);
    const SAMPLE = defRisky.concat(pick(risky, 40 - defRisky.length)).concat(pick(all, 40));
    o.sample = SAMPLE.length; o.risky = Math.min(40, risky.length);
    const vis = () => document.querySelector('#root').innerText;
    const L = (k, w) => { (o.leaks[k] = o.leaks[k] || []).push(w); };
    const D = (k, x) => { (o.dup[k] = o.dup[k] || []).push(x); };
    const ONE = (k, x) => { (o.one[k] = o.one[k] || []).push(x); };
    const H = (k, i, n) => { if (n !== 4) return; const h = (o.hist[k] = o.hist[k] || [0, 0, 0, 0]); h[i]++; };
    const distinct = arr => new Set(arr.map(x => String(x).trim().toLowerCase())).size === arr.length;

    /* ---- 1. the practice card, every hint open ---- */
    for (const w of SAMPLE) { state.sessionWords = [w]; app.startTrain(); state.showDef = true; state.showSent = true; state.showOrigin = true; render();
      if (has(vis(), w.w)) L('practice', w.w); }
    o.n.practice = SAMPLE.length;
    /* while a word is live, the header search is off — and the Finder will not open */
    o.searchOff = !!document.querySelector('.sb-hsearch input[disabled]');
    app.hqType(SAMPLE[0].w.slice(0, 4)); o.searchIgnored = !state.hq && !document.querySelector('.sb-hsug');
    app.openFinder(); o.finderRefused = state.nav === 'train';
    state.typed = SAMPLE[0].w; app.check(); await W(50); app.exitTrain(); await W(100);
    app.setNav('home'); await W(100); o.searchBackOn = !document.querySelector('.sb-hsearch input[disabled]');

    /* ---- 2. the Atlas quiz gate, many builds over many stops ---- */
    state.devUnlock = true;   // testing mode opens every stop, so the generator runs over many units
    const units = []; for (const act of ['meadow', 'library', 'forum', 'storm']) { app.trailAct('honey|' + act); await W(150);
      [...document.querySelectorAll('[data-act="trailUnit"]')].map(el => el.getAttribute('data-arg')).filter(Boolean).slice(0, 4).forEach(u => { if (units.indexOf(u) < 0) units.push(u); }); }
    o.units = units.length;
    let builds = 0, items = 0;
    for (let rep = 0; rep < Math.ceil(110 / Math.max(1, units.length)); rep++) for (const uid of units) {
      app.trailUnit(uid); app.trailQuiz(); await W(0); const q2 = state.tq; if (!q2) continue; builds++;
      q2.items.forEach((it, k) => { items++;
        if (it.ty === 'spell' || it.ty === 'kit') { if (rep === 0) { q2.i = k; q2.picked = null; render(); const v = vis();
            if (it.ty === 'spell' && has(v, it.w)) L('quiz-spell', it.w);
            if (it.ty === 'kit' && has(maskTxt(it.d || '', it.w), it.w)) L('quiz-kit', it.w); }
          if (it.kit === 'butterfly') { const c = it.opts.map(x => x.c); if (!distinct(c)) D('quiz-kit', c.join('|')); if (it.opts.filter(x => nkey(x.c) === nkey(it.w)).length !== 1) ONE('quiz-kit', it.w); H('quiz-kit', it.ans, c.length); }
          return; }
        const c = it.opts.map(x => x.c);
        if (!distinct(c)) D('quiz-' + it.ty, c.join(' | ').slice(0, 120));
        if (it.opts.filter(x => x.ok).length !== 1 || !it.opts[it.ans] || !it.opts[it.ans].ok) ONE('quiz-' + it.ty, it.q);
        if (it.ty === 'mean') { const m = /“([^”]+)”/.exec(it.q); if (m && has(it.opts[it.ans].c, m[1])) L('quiz-mean', m[1]); }
        H('quiz-mc', it.ans, c.length); }); }
    o.n.quiz = builds + ' builds / ' + items + ' items';
    state.tq = null; state.trailView = null; app.setNav('home');

    /* ---- 3. the vocabulary check ---- */
    const vw = SAMPLE.filter(w => w.d);
    for (let rep = 0; rep < 14; rep++) { const qs = vocBuildCheck(vw);
      qs.forEach(q => { if (!distinct(q.choices)) D('vocab', q.w.w); if (q.choices.filter(c => c === q.answer).length !== 1) ONE('vocab', q.w.w); H('vocab', q.choices.indexOf(q.answer), q.choices.length); }); }
    const vq = vocBuildCheck(vw.slice(0, 40)); state.nav = 'vocab'; state.vocCheck = { deck: 'mix', mode: 'practice', qs: vq, i: 0, picked: null, ok: null, right: 0, missed: [], done: false };
    for (let i = 0; i < vq.length; i++) { state.vocCheck.i = i; state.vocCheck.picked = null; render();
      const opts = [...document.querySelectorAll('[data-act="vocPick"]')].map(el => el.innerText).join(' \n ');
      if (has(opts, vq[i].w.w)) L('vocab-options', vq[i].w.w); }
    state.vocCheck = null; o.n.vocab = vw.length * 14;

    /* ---- 4. the Mock Bee: at the microphone with every question asked, and its meaning round ---- */
    app.mbOpen(); app.mbStart(); await W(50);
    for (const w of SAMPLE) { const g = state.mb; g.word = w; g.phase = 'me'; g.typed = ''; g.asked = { def: 1, org: 1, sent: 1, ps: 1 }; g.c2 = null; render();
      if (has(vis(), w.w)) L('mockbee-mic', w.w); }
    for (let rep = 0; rep < 10; rep++) for (const w of vw) { const q = MOCKBEE.vocQ(w); if (!q) continue;
      if (!distinct(q.choices)) D('mockbee-vocab', w.w); if (q.choices.filter(c => c === q.answer).length !== 1) ONE('mockbee-vocab', w.w);
      H('mockbee-vocab', q.choices.indexOf(q.answer), q.choices.length);
      if (rep === 0) { const g = state.mb; g.vq = q; g.word = q.w; g.phase = 'vme'; render();
        const opts = [...document.querySelectorAll('.mb-vopt')].map(el => el.innerText).join(' \n '); if (has(opts, w.w)) L('mockbee-vocab-options', w.w); } }
    state.mb = null; state.nav = 'home'; render();

    /* ---- 5. trivia, all five levels ---- */
    for (let lv = 1; lv <= 5; lv++) await new Promise(res => ttNeed(lv, res));
    let tq = 0;
    for (let lv = 1; lv <= 5; lv++) for (let rep = 0; rep < 12; rep++) { const qs = STV._pool({ th: 'mix', lv, ths: [] }, 40);
      qs.forEach(q => { tq++;
        if (!distinct(q.c)) D('trivia', q.id);
        if (q.c.filter(c => String(c).trim().toLowerCase() === String(q.c[0]).trim().toLowerCase()).length !== 1) ONE('trivia', q.id);
        if (q.sh.slice().sort().join() !== q.c.map((x, i) => i).join()) ONE('trivia-perm', q.id);
        const m = /“([^”]+)”/.exec(q.q); if (m && q.ty === 'mc' && has(q.c[0], m[1])) L('trivia', q.id + ':' + m[1]);
        H('trivia', q.sh.indexOf(0), q.c.length); }); }
    o.n.trivia = tq;

    /* ---- 6. the game cards ---- */
    const card = (q) => { state.nav = 'games'; state.game = { type: 'wordquiz', round: 'x', qs: [q], i: 0, picked: null, right: 0, status: 'play' }; render(); return vis(); };
    let gq = 0;
    for (let rep = 0; rep < 60; rep++) {
      const sets = { spell: buildMC('spell', 10), meaning: buildMC('meaning', 10), origin: buildMC('origin', 10), vocab: buildVocabQs(10), idiom: buildFigQs('idiom', 10) };
      for (const k in sets) for (const q of sets[k]) { gq++;
        if (!distinct(q.choices)) D('game-' + k, q.choices.join('|').slice(0, 120));
        if (q.choices.filter(c => c === q.answer).length !== 1) ONE('game-' + k, q.word);
        H('game-' + (k === 'meaning' ? 'meaning' : k), q.choices.indexOf(q.answer), q.choices.length);
        if (rep === 0 && (q.kind === 'spell' || q.kind === 'meaning' || q.kind === 'sentence')) { card(q);
          /* the prompt is everything on the card except the option buttons (a spelling MCQ's
             options hold the word by design — that is the question) */
          const cl = document.querySelector('#root').cloneNode(true); cl.querySelectorAll('[data-act="gPick"]').forEach(x => x.remove());
          const promptTxt = cl.textContent;
          if (q.kind === 'spell' ? has(promptTxt, q.answer) : has(promptTxt, q.word)) L('game-' + q.kind + '-prompt', q.word); }
        if (q.kind === 'vocab' && q.choices.some(c => has(c, q.word))) L('game-vocab-options', q.word); } }
    o.n.games = gq;
    /* magic squares */
    magicNewBoard(); const mg = state.game; let mq = 0;
    for (let cell = 0; cell < 9; cell++) for (let rep = 0; rep < 24; rep++) { const qs = magicBuildQs(mg.board[cell].id); qs.forEach(q => { mq++;
      if (q.k === 'mean') { if (!distinct(q.choices)) D('magic', q.w.w); if (q.choices.filter(c => nkey(c) === nkey(q.w.w)).length !== 1) ONE('magic', q.w.w); H('magic', q.choices.indexOf(q.w.w), q.choices.length); }
      if (rep === 0) { mg.status = 'play'; mg.cell = cell; mg.qs = [q]; mg.qi = 0; mg.picked = null; mg.revealed = false; mg.ok = null; state.nav = 'games'; render();
        const body = document.querySelector('#root').innerText; const promptPart = q.k === 'spell' ? body : body.split('\n').filter(x => /Which word means/.test(x) || /“/.test(x)).join(' ');
        if (has(q.k === 'spell' ? body : promptPart, q.w.w)) L('magic-' + q.k, q.w.w); } }); }
    o.n.magic = mq;
    /* and every sampled word on both Magic Squares screens — a square's meaning line and its
       theme label sit above the input; the option buttons of a meaning item hold the word by design */
    for (const w of SAMPLE) for (const k of ['spell', 'mean']) {
      const q = k === 'spell' ? { k, w } : { k, w, choices: sample([w.w, 'lantern', 'meadow', 'harbour']) };
      mg.status = 'play'; mg.cell = 0; mg.qs = [q]; mg.qi = 0; mg.picked = null; mg.revealed = false; mg.ok = null; state.nav = 'games'; render();
      const cl = document.querySelector('#root').cloneNode(true); cl.querySelectorAll('[data-act="magicPick"]').forEach(x => x.remove());
      if (has(cl.textContent, w.w)) L('magic-' + k, w.w); }
    /* the Ultra drill and the Ultra written mock show a meaning before the attempt */
    state.devUnlock = true;
    for (const w of SAMPLE) { state.nav = 'adv'; state.advView = 'sprint'; state.adv = { mode: 'drill', words: [w], all: [w], gaps: [w], drillIdx: 0, right: 0, know: [], i: 0, bi: 0 }; render();
      if (has(vis(), w.w)) L('ultra-drill', w.w);
      state.advView = 'mock'; state.adv = { mode: 'mock', round: 'written', list: [w], i: 0, right: 0, results: [] }; render();
      if (has(vis(), w.w)) L('ultra-written', w.w); }
    state.adv = null; state.advView = null;
    /* the typed game card with its hint open */
    for (const w of SAMPLE) { state.nav = 'games'; state.game = { type: 'buzz', list: [w], i: 0, right: 0, ans: [], status: 'play' }; state.gInfo = true; render();
      if (has(vis(), w.w)) L('game-typed-hint', w.w); }
    state.game = null; state.gInfo = false; state.nav = 'home'; render();

    /* ---- 7. the book reader's Try-it (meaning → word, from the chapter's own words) ---- */
    app.openBook('book-01');
    await new Promise(res => { const t0 = Date.now(); (function w2() { if ((state.nav === 'reader' && window.SB_READER) || Date.now() - t0 > 20000) res(); else setTimeout(w2, 250); })(); });
    await W(300); let rq = 0;
    const nCh = document.querySelectorAll('[data-act="readerCh"]').length;
    for (let ch = 0; ch < Math.min(nCh, 12); ch++) { app.readerCh(ch); await W(60);
      for (let rep = 0; rep < 14; rep++) { app.readerTry(); const z = state.readerQuiz; if (!z) break;
        z.qs.forEach((q, i) => { rq++;
          if (!distinct(q.opts)) D('reader', q.ok); if (q.opts.filter(x => x === q.ok).length !== 1) ONE('reader', q.ok);
          H('reader', q.opts.indexOf(q.ok), q.opts.length);
          if (rep === 0) { z.i = i; z.picked = null; render(); const box = document.querySelector('[data-act="readerAns"]'); const card = box ? box.closest('div').parentElement : null;
            const cl = card ? card.cloneNode(true) : null; if (cl) { cl.querySelectorAll('[data-act="readerAns"]').forEach(x => x.remove()); if (has(cl.textContent, q.ok)) L('reader-prompt', q.ok); } } });
        app.readerTryClose(); } }
    o.n.reader = rq; state.nav = 'home'; render();
    return o;
  });

  console.log(`  ·    sample: ${r.sample} real words (${r.risky} whose own definition or sentence names them); ` + Object.entries(r.n).map(([k, v]) => k + ' ' + v).join(' · '));
  const leakList = Object.entries(r.leaks); const dupList = Object.entries(r.dup); const oneList = Object.entries(r.one);
  ok(r.sample >= 60 && r.risky >= 20, 'the sample is real and leans on the risky words');
  for (const k of ['practice', 'quiz-spell', 'quiz-kit', 'quiz-mean', 'vocab-options', 'mockbee-mic', 'mockbee-vocab-options', 'trivia', 'game-spell-prompt', 'game-meaning-prompt', 'game-sentence-prompt', 'game-vocab-options', 'magic-spell', 'magic-mean', 'game-typed-hint', 'reader-prompt', 'ultra-drill', 'ultra-written'])
    ok(!r.leaks[k], `${k}: the target is never in the visible text before the attempt` + (r.leaks[k] ? ` — ${r.leaks[k].length}: ${r.leaks[k].slice(0, 5).join(', ')}` : ''));
  ok(dupList.length === 0, 'every question\'s options are distinct' + (dupList.length ? ' — ' + dupList.map(([k, v]) => k + ' ×' + v.length + ' (' + v[0] + ')').join('; ') : ''));
  ok(oneList.length === 0, 'every question has exactly one right answer' + (oneList.length ? ' — ' + oneList.map(([k, v]) => k + ' ×' + v.length + ' (' + v[0] + ')').join('; ') : ''));
  for (const [k, h] of Object.entries(r.hist)) { const e = EVEN(h, k); if (e.n < 500) { console.log('  ·    ' + e.txt + ' (too few 4-option items to judge)'); continue; } ok(e.ok, e.txt + ' — even across the four positions'); }
  ok(r.searchOff && r.searchIgnored && r.finderRefused, 'while a word is live the header search is disabled, typing in it does nothing, and the Finder will not open');
  ok(r.searchBackOn, 'and the search is back the moment the drill is over');
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
