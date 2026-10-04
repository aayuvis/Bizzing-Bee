/* THE ATLAS ENCOUNTERS ARE COUNTED, NOT ROLLED (games spec 4 Oct 2026, §4.7) — every check here
   was watched failing once with its fault put back.

   MOTH AMBUSH. It was a 22% roll on each visit, once a region a day: an encounter decided by
   Math.random, which the family standard forbids wherever a coin can follow. Now:
     A1 it comes on every THIRD return to a region (3rd, 6th…), never on a first visit, and
        exactly the same whatever Math.random returns
     A2 a right spelling pays one coin and the copy says +1
     A3 a first miss keeps the net shut and shows what the child wrote, NOT the word; a second
        miss shows the word, letter against letter, and holds until Continue — no coin after
     A4 the moth is the game's moth sprite, not a 🦇; the net is drawn only once the buddy
        inside it has loaded
   RIVAL CHAMPION DUEL. The rival used to score whenever the child missed. Now:
     D1 the rival is a Mock Bee speller, and spells its OWN word each round by its profile —
        the same duel for the same child, whatever Math.random returns
     D2 each word the child spells right pays one coin as it lands; no contest 10
     D3 a miss holds on the word until Continue, and only then does the rival spell
     S  no Math.random in any encounter path (the ambush, its word, the duel's words, the rival)

   Usage: NODE_PATH=/opt/node22/lib/node_modules node tests/atlas-encounters.cjs           */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SRC = path.resolve(__dirname, '..');
const { booted } = require('./lib/wait.cjs');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

(async () => {
  /* S · the source: the encounter functions draw nothing */
  const trail = fs.readFileSync(path.join(SRC, 'trail.js'), 'utf8');
  const fnBody = name => { const i = trail.search(new RegExp('(function ' + name + '\\b|app2\\.' + name + ' = )')); if (i < 0) return '';
    let d = 0, j = trail.indexOf('{', i); for (let k = j; k < trail.length; k++) { if (trail[k] === '{') d++; else if (trail[k] === '}') { d--; if (!d) return trail.slice(i, k + 1); } } return ''; };
  const enc = ['maybeAmbush', 'ambushWord', 'uWordPick', 'uRival', 'uRivalTurn', 'uSlip', 'uDuel', 'uqNext', 'villGo', 'uqGo'];
  const rolled = enc.filter(n => /Math\.random/.test(fnBody(n).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')));
  ok(enc.every(n => fnBody(n)) && !rolled.length, 'S · no Math.random in any encounter path' + (rolled.length ? ' — ' + rolled.join(', ') : ''));

  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1100, height: 900 } });
  const errs = []; pg.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
  await pg.goto('file://' + SRC + '/index.html'); await booted(pg);
  const r = await pg.evaluate(async () => {
    const out = {}; const W = ms => new Promise(res => setTimeout(res, ms));
    const kid = name => ({ name, avatar: 'bee', coins: 0, pow: {}, age: 10, lists: { default: { xp: 10 } }, activeList: 'default',
      missed: [], unlockedThemes: ['spellbound'], unlockedConcepts: {}, unlockedLists: {}, questPath: 'journey',
      trail: { lap: 1, done: {}, chk: {}, seen: {}, elap: 1, edone: {}, echk: {} } });
    state.children = [kid('T'), kid('U')]; state.activeIdx = 0; state.screen = 'app'; state.devUnlock = true;
    await new Promise(res => SB_LAZY.need('atlas', res)); await W(300);
    const R = Math.random;

    /* A1 · every third return, whatever the dice say */
    const pattern = async (region, rnd) => { Math.random = () => rnd; const seen = [];
      for (let v = 0; v < 7; v++) { app.trailToMap(); await W(40); app.trailAct('honey|' + region); await W(1850);
        seen.push(state.villain ? 1 : 0); if (state.villain) { app.villFlee(); await W(60); } }
      Math.random = R; return seen.join(''); };
    out.pLow = await pattern('library', 0.0);       // the old code sprang on every visit after the first
    out.pHigh = await pattern('forum', 0.99);       // and on none here
    /* A2 · a right spelling: one coin, "+1" */
    const c = active();
    const spring = async region => { for (let v = 0; v < 4; v++) { app.trailToMap(); await W(40); app.trailAct('honey|' + region); await W(v < 3 ? 60 : 1850); } return !!state.villain; };
    out.up = await spring('storm');
    out.mothArt = !!document.querySelector('[data-trap="villain"] img[src*="gart/moth"]') && !/🦇/.test((document.querySelector('[data-trap="villain"]') || {}).innerHTML || '');
    const w = state.villain && state.villain.w, c0 = c.coins;
    app.villType(w); app.villGo(); await W(120);
    out.paid = !state.villain && c.coins === c0 + 1 && /\+1\b/.test(state.toast || '') && !/\+12\b/.test(state.toast || '');
    out.toast = state.toast;
    /* A3 · two misses */
    out.up2 = await spring('roots');
    const w2 = state.villain && state.villain.w, c1 = c.coins;
    const shows = () => { const d = document.querySelector('[data-trap="villain"] .sb-miss'); if (!d || !d.getClientRects().length) return false;
      const t = (d.textContent || '') + ' ' + [...d.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ');
      return t.replace(/[^a-z]/gi, '').toLowerCase().includes(String(w2).toLowerCase()); };
    app.villType('qzqzq'); app.villGo(); await W(120);
    const card1 = (document.querySelector('[data-trap="villain"]') || {}).textContent || '';
    out.miss1 = !!state.villain && !shows() && /You wrote/.test(card1) && /qzqzq/.test(card1) && !card1.toLowerCase().includes(String(w2).toLowerCase());
    app.villType('zqzqz'); app.villGo(); await W(120);
    out.miss2 = !!state.villain && shows(); await W(2200); out.held = !!state.villain && shows();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await W(150);
    out.cont = !state.villain && c.coins === c1;
    /* A4 · the net waits for the buddy: an avatar image with no source yet shows no net */
    /* the buddy's picture is held back (no source yet), then released */
    const realAv = window.SB_AVATAR; window._avSrc = '';
    window.SB_AVATAR = (id, sz) => '<img class="t-av" width="' + sz + '" height="' + sz + '" alt=""' + (window._avSrc ? ' src="' + window._avSrc + '"' : '') + '>';
    out.up3 = await spring('strait');
    const net = () => document.querySelector('[data-trap="villain"] .sb-vnet');
    const mesh = () => { const m = document.querySelector('[data-trap="villain"] .sb-vnet-mesh'); return m ? +getComputedStyle(m).opacity : -1; };
    await W(400); out.netBefore = !!net() && !net().classList.contains('ready') && mesh() < 0.1;
    window._avSrc = 'avatars/s/bizzy.png'; render();
    for (let k = 0; k < 40 && !(net() && net().classList.contains('ready')); k++) await W(50);
    await W(300); out.netAfter = !!net() && net().classList.contains('ready') && mesh() > 0.9;
    out.netDbg = [!!net(), net() && net().className, mesh(), (document.querySelector('[data-trap="villain"] .sb-vnet') || {}).innerHTML];
    window.SB_AVATAR = realAv; app.villFlee(); await W(60);

    /* D · the duel, twice from scratch with different dice: the same rival, words and outcomes */
    const duel = async (rnd, missFirst) => { Math.random = () => rnd;
      const u = SB_EXPED.prog(); delete (u.finds.u0 || {}).duel; delete u.duel.u0;
      app.ultraAct(0); await W(200); app.uDuel(); await W(150);
      const q = state.uq; const o = { rival: q.rival.name, id: q.rival.id, coins0: active().coins, held: null, rivalWaited: null };
      for (let k = 0; k < 6 && state.uq && state.uq.phase !== 'done'; k++) {
        if (state.uq.phase === 'me') { const miss = missFirst && k === 0; app.uqType(miss ? 'qzqzq' : state.uq.words[state.uq.i].w); app.uqGo(); await W(120);
          if (miss) { const d = document.querySelector('.sb-miss'); const want = state.uq.mine[0].w;
            const t = d ? (d.textContent || '') + ' ' + [...d.querySelectorAll('[aria-label]')].map(e => e.getAttribute('aria-label')).join(' ') : '';
            await W(1500); o.held = state.uq.phase === 'miss' && t.replace(/[^a-z]/gi, '').toLowerCase().includes(want.toLowerCase());
            o.rivalWaited = state.uq.theirs.length === 0; } }
        if (state.uq && (state.uq.phase === 'rival' || state.uq.phase === 'miss')) { app.uqNext(); await W(120); }
        if (state.uq && state.uq.phase === 'rival') { app.uqNext(); await W(120); } }
      const qq = state.uq || {}; o.mine = (qq.mine || []).map(m => m.w + ':' + m.ok); o.theirs = (qq.theirs || []).map(t => t.w + ':' + t.ok + ':' + t.said);
      o.ownWords = (qq.theirs || []).every((t, i) => qq.mine[i] && t.w !== qq.mine[i].w);
      o.rightN = (qq.mine || []).filter(m => m.ok).length; o.paid = active().coins - o.coins0; o.done = qq.phase === 'done';
      app.uqNext(); await W(100); Math.random = R; return o; };
    await duel(0.3, false);                          // a first walk lets the champions' word pool finish loading
    out.d1 = await duel(0.01, false); out.d2 = await duel(0.97, false); out.d3 = await duel(0.5, true);
    out.names = (window.MOCKBEE && MOCKBEE.faces) ? MOCKBEE.faces().map(f => f.name) : ['Pip', 'Nova', 'Rafi', 'Suki', 'Dax', 'Mira', 'Theo', 'Ines', 'Kwame', 'Vesper'];
    return out;
  });
  ok(r.pLow === '0001001' && r.pHigh === '0001001', `A1 · the moth comes on the 3rd and 6th return, never the first visit — and the dice change nothing (${r.pLow} / ${r.pHigh})`);
  ok(r.up && r.paid, `A2 · a right spelling cuts the net: one coin, and the copy says +1 ("${r.toast}")`);
  ok(r.mothArt, 'A4 · the moth is the game\'s own moth sprite, not a 🦇');
  ok(r.up2 && r.miss1, 'A3 · a first miss keeps the net shut and shows what the child wrote — not the word');
  ok(r.miss2 && r.held, 'A3 · a second miss shows the word, letter against letter, and holds it');
  ok(r.cont, 'A3 · Enter is Continue: the moth lets go, and no coin is paid once the word has been shown');
  ok(r.up3 && r.netBefore && r.netAfter, 'A4 · the net is drawn only once the buddy inside it has loaded' + (r.up3 && r.netBefore && r.netAfter ? '' : ' ' + JSON.stringify([r.up3, r.netBefore, r.netAfter, r.netDbg])));
  const d1 = r.d1, d2 = r.d2, d3 = r.d3;
  ok(r.names.includes(d1.rival), `D1 · the rival is a Mock Bee speller (${d1.rival})`);
  ok(d1.done && d1.ownWords && d1.theirs.length === d1.mine.length && d1.theirs.length >= 3, `D1 · the rival spells its OWN word each round (${d1.theirs.join(', ')})`);
  ok(JSON.stringify(d1.theirs) === JSON.stringify(d2.theirs) && JSON.stringify(d1.mine) === JSON.stringify(d2.mine) && d1.rival === d2.rival,
    'D1 · the same duel for the same child, whatever Math.random returns' + (JSON.stringify(d1.theirs) === JSON.stringify(d2.theirs) ? '' : ' — ' + d1.theirs.join(',') + ' vs ' + d2.theirs.join(',') + ' / ' + d1.mine.join(',') + ' vs ' + d2.mine.join(',')));
  ok(d1.paid === d1.rightN && d1.rightN >= 3 && d1.paid < 10, `D2 · one coin per word spelled right: ${d1.paid} for ${d1.rightN} (no contest 10)`);
  ok(d3.held && d3.rivalWaited, 'D3 · a miss holds on the word until Continue, and the rival waits for it');
  ok(d3.paid === d3.rightN && d3.mine[0] && /:false$/.test(d3.mine[0]), `D3 · the missed word pays nothing (${d3.paid} coins for ${d3.rightN} right)`);
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + errs[0] : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
