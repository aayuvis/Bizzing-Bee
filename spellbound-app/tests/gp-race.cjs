/* BEE GRAND PRIX — A KART RACE FIRST, SPELLING IS THE FUEL (games spec §2.10).

   Raced by bots through the real engine (window._race.bot + fast: the physics steps of a whole
   race run as fast as the machine allows, with the bots answering each box synchronously), in
   the order the coins need: the ledger checks first, before twenty winning races reach the
   family's 100-a-day cap.

     GP11  the finish card's coins are exactly the change in the family ledger
     GP6   a random speller earns 0 coins (and one who spells does earn — the check can fail)
     GP9   200 races' box words are kid-safe, inside the level window, and none repeats in a race
     GP5   live: at each place 1st–5th (and last, a quarter-lap down) the box gives the §2.4
           power-up, full when Clean and standard when Right; the slot showed it as a ghost
           first; it fires at its §2.4 strength; three Clean add a Turbo; a Miss gives nothing
     GP3   the ±2% band: a 30-band lead earned on the road holds (≤10% shrink over a lap)
     GP1   random steering + perfect spelling, 20 races at Medium: never wins, average ≥ 4th
     GP2   a racing-line driver, 20 races each: all box words missed → average 2nd–4th, wins
           ≤ 20%; all Clean → wins ≥ 65%; and the gap is at least one place
     GP12  a race at Medium takes 3–4 minutes (median), for a child-like driver (a 0.3s
           reaction, full lock or none) and an at-level speller (70% right), the box time
           counted as hearing the word, typing it, and reading the card

   The pace numbers these hold are CFG.rival in saga2.js. Proved by breaking (4 Oct 2026), each
   put back and the file cmp'd after: see the bottom of this file.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/gp-race.cjs                       */
const { chromium } = require('playwright');
const path = require('path');
const { booted, lazy } = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const ONLY = process.env.GP_ONLY ? process.env.GP_ONLY.split(',') : null;
const want = k => !ONLY || ONLY.includes(k);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)) });
  const pg = await b.newPage({ viewport: { width: 640, height: 520 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { window.SB_DEBUG = true; try { if (!localStorage.getItem('gpr-seeded')) {
    localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', activeIdx: 0,
      children: [{ name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'panda', theme: 'spellbound', coins: 0, unlockedThemes: ['spellbound'], xp: 40, level: 3 }] }));
    localStorage.setItem('gpr-seeded', '1'); localStorage.setItem('sb_splash', '0'); } } catch (e) {} });
  await pg.goto('file://' + ROOT + '/index.html');
  await booted(pg); await lazy(pg, 'arcade');
  /* one helper in the page: a race with a bot, start to flag */
  await pg.evaluate(() => {
    window.__gpRace = (o) => {
      document.querySelectorAll('.gpr-host').forEach(n => n.remove());
      const h = document.createElement('div'); h.className = 'gpr-host'; h.style.cssText = 'position:fixed;inset:0;background:#111'; document.body.appendChild(h);
      const e = window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: o.words || 'medium', drive: o.drive || 'medium', scene: o.scene || 'meadow', kart: 'kart', autoGo: true, seed: o.seed }, () => {});
      const rng = (s => () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; })(o.seed || 1);
      let box = 0; const spellers = {
        clean: (w, p) => ({ typed: w.w, secs: p.par * 0.8 }),
        right: (w, p) => ({ typed: w.w, secs: p.par * 1.3 }),
        miss: () => ({ typed: 'zzzq', secs: 4 }),
        random: (w) => ({ typed: Array.from({ length: String(w.w).length }, () => String.fromCharCode(97 + Math.floor(rng() * 26))).join(''), secs: 2 }),
        /* at level: 70% right (alternating Clean and Right), 30% missed — on a fixed pattern */
        level: (w, p) => { const k = box % 10; return k === 2 || k === 5 || k === 8 ? { typed: w.w.slice(1) + 'e', secs: p.par * 1.3 } : { typed: w.w, secs: p.par * (k % 2 ? 0.9 : 1.2) }; } };
      const log = [];
      window._race.bot({ drive: o.steer, seed: o.seed, spell: (w, p) => { const a = spellers[o.spell](w, p); box++; log.push({ w: w.w, y: w.y, ...a, par: p.par, ok: a.typed === w.w }); return a; } });
      const res = window._race.fast(1500);
      const card = h.querySelector('[data-gp-coins]');
      return { res, log, cardCoins: card ? +card.getAttribute('data-gp-coins') : null, end: !!h.querySelector('.sg-endcard'), destroy: () => e.destroy() };
    };
  });
  const runMany = (spec, n) => pg.evaluate(({ spec, n }) => { const out = []; const scenes = ['meadow', 'sunset', 'city', 'bazaar'];
    for (let i = 1; i <= n; i++) { const r = window.__gpRace({ ...spec, seed: i * 7919, scene: scenes[i % 4] });
      out.push(r.res ? { p: r.res.place, t: r.res.raceT, met: r.res.met, right: r.res.right, log: r.log.map(x => ({ secs: x.secs, ok: x.ok })) } : { p: 9 }); r.destroy(); }
    return out; }, { spec, n });
  const avg = a => a.reduce((s, x) => s + x, 0) / a.length;

  /* ---------------- GP11 / GP6: the coins are the ledger's ---------------- */
  if (want('GP11') || want('GP6')) {
    const led = await pg.evaluate(() => { const bal = () => BZ_WALLET.balance('Ahana');
      const w0 = bal(); const a = window.__gpRace({ steer: 'line', spell: 'level', seed: 11 }); const w1 = bal(); a.destroy();
      const r = window.__gpRace({ steer: 'line', spell: 'random', seed: 12 }); const w2 = bal(); r.destroy();
      return { w0, w1, w2, card1: a.cardCoins, res1: a.res && { right: a.res.right, met: a.res.met, place: a.res.place, coins: a.res.coins, contest: a.res.contest },
        card2: r.cardCoins, res2: r.res && { right: r.res.right, met: r.res.met } }; });
    ok(led.card1 != null && led.w1 - led.w0 > 0 && led.card1 === led.w1 - led.w0,
      `GP11: the finish card's coins are the ledger's change — card ${led.card1}, wallet ${led.w0} → ${led.w1} (${led.res1 && led.res1.right}/${led.res1 && led.res1.met} box words, ${led.res1 && ['', '1st', '2nd', '3rd', '4th', '5th'][led.res1.place]}${led.res1 && led.res1.contest ? ', the contest coin' : ''})`);
    ok(led.res2 && led.res2.met >= 8 && led.res2.right === 0 && led.w2 === led.w1 && led.card2 === 0,
      `GP6: a random speller earns 0 coins — ${led.res2 && led.res2.met} boxes met, ${led.res2 && led.res2.right} right, wallet ${led.w1} → ${led.w2}, card ${led.card2}`);
  }

  /* ---------------- GP9: the words ---------------- */
  if (want('GP9')) {
    const w = await pg.evaluate(() => { const c = active(), [lo, hi] = diffRange(c);
      const safe = x => typeof window.kidSafe === 'function' ? !!window.kidSafe(x) : safeWord(x);
      const missed = new Set((c.missed || []).map(m => nkey(m.w)));
      let n = 0, unsafe = [], outside = [], repeats = 0, short = 0;
      for (let r = 0; r < 200; r++) { const ws = window.SB_GP.drawWords(12, null); n += ws.length; if (ws.length < 12) short++;
        const keys = ws.map(x => String(x.w).toLowerCase()); repeats += keys.length - new Set(keys).size;
        ws.forEach(x => { if (!safe(x)) unsafe.push(x.w); const y = x.y || 3; if (!(y >= lo && y <= hi) && !missed.has(nkey(x.w))) outside.push(x.w + ':' + y); }); }
      /* the Cup's words come from their family first */
      const fam = window.SB_GP.CUP.map(o => { const ws = window.SB_GP.drawWords(12, o);
        return [o.origin, ws.filter(x => o.re.test(x.o || '')).length, ws.length, ws.filter(x => !safe(x) || ((x.y || 3) > Math.min(9, hi + 1) && !missed.has(nkey(x.w)))).length]; });
      return { n, unsafe: unsafe.slice(0, 5), nUnsafe: unsafe.length, outside: outside.slice(0, 5), nOut: outside.length, repeats, short, lo, hi, fam, door: typeof window.nextWords === 'function', ks: typeof window.kidSafe === 'function' }; });
    ok(w.n >= 2300 && !w.short && !w.nUnsafe && !w.nOut && !w.repeats,
      `GP9: 200 races' box words (${w.n}) through ${w.door ? 'nextWords' : 'the guarded fallback'} — ${w.nUnsafe} fail ${w.ks ? 'kidSafe' : 'the corpus filter (kidSafe not on this branch)'}${w.nUnsafe ? ' (' + w.unsafe.join(', ') + ')' : ''}, ${w.nOut} outside the level window y${w.lo}–${w.hi}${w.nOut ? ' (' + w.outside.join(', ') + ')' : ''}, ${w.repeats} repeats inside a race`);
    ok(w.fam.every(f => f[1] >= 10 && f[3] === 0), `the Cup's box words come from their family (one tier up at most): ${w.fam.map(f => f[0] + ' ' + f[1] + '/' + f[2] + (f[3] ? ' (' + f[3] + ' unsafe or above the tier)' : '')).join(', ')}`);
  }

  /* ---------------- GP5 live: the box, the place, the slot, the strength ---------------- */
  if (want('GP5')) {
    const g = await pg.evaluate(() => { const out = [];
      const one = (place, grade, honey) => { const h = document.createElement('div'); h.className = 'gpr-host'; h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
        const e = window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: 'medium', scene: 'meadow', autoGo: true, seed: 5 }, () => {});
        const R = window._race; R.fast(1.1); R.rivalPowers(false);
        R.bot({ spell: (w, p) => grade === 'miss' ? { typed: 'qqq', secs: 2 } : { typed: w.w, secs: grade === 'clean' ? p.par * 0.5 : p.par + 1 } });
        R.gateNow(); R.setV(0.7); R.forcePlace(place);
        if (honey) { const s = R.state(); R.rivalsAt().forEach((x, i) => R.setRival(i, s.pos + s.trackLen * 0.3 + i * 400)); }
        R.fast(0.02); const ghost = R.state().slot;
        let n = 0; while (R.state().met < 1 && n++ < 400) R.fast(0.02);
        const s = R.state(); const r = { place, grade, honey: !!honey, ghost, held: s.held, full: s.full, met: s.met, placeAt: s.place };
        e.destroy(); h.remove(); return r; };
      for (let p = 1; p <= 5; p++) for (const gr of ['clean', 'right']) out.push(one(p, gr));
      out.push(one(5, 'clean', true)); out.push(one(3, 'miss'));
      /* strengths, fired: Shield 10/6 s, Turbo ×1.45/×1.3, Oil spins the nearest chaser 2.8/1.8 s */
      const h = document.createElement('div'); h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
      const e = window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: 'medium', scene: 'meadow', autoGo: true, seed: 5 }, () => {});
      const R = window._race; R.fast(1.1); R.rivalPowers(false); R.clearBoxes();
      const st = {}; R.usePower('shield', true); st.shieldFull = R.state().shieldT; R.usePower('shield', false); st.shieldStd = R.state().shieldT;
      R.usePower('turbo', true); st.turboFull = R.state().boost; R.usePower('turbo', false); st.turboStd = R.state().boost;
      R.forcePlace(1); R.usePower('oil', true); st.oil = Math.max(...R.rivalsAt().map(x => x.spin));
      /* the combo: three Clean in a row add a Turbo on top of the box's own power-up */
      R.bot({ spell: (w, p) => ({ typed: w.w, secs: p.par * 0.5 }) }); R.clearBoxes();
      const combo = []; for (let k = 0; k < 3; k++) { R.gateNow(); R.setV(0.7); let n = 0; const m0 = R.state().met; while (R.state().met === m0 && n++ < 400) R.fast(0.02); const s = R.state(); combo.push({ combo: s.combo, boost: s.boost }); }
      e.destroy(); h.remove();
      return { out, st, combo }; });
    const T = ['shield', 'oil', 'gust', 'turbo', 'rocket'];
    const bad = g.out.filter(r => r.grade !== 'miss' && !r.honey).filter(r => r.met !== 1 || r.placeAt !== r.place || r.held !== T[r.place - 1] || r.full !== (r.grade === 'clean') || r.ghost !== 'ghost:' + T[r.place - 1]);
    ok(!bad.length, bad.length ? `GP5: wrong power-up — ${bad.map(r => `${r.place}/${r.grade}: ghost ${r.ghost}, got ${r.held}${r.full ? ' full' : ''} (at place ${r.placeAt})`).join('; ')}`
      : `GP5: at every place the box gives the table's power-up — ${T.join(', ')} — full when Clean, standard when Right, and the slot showed its ghost first`);
    const hon = g.out.find(r => r.honey), miss = g.out.find(r => r.grade === 'miss');
    ok(hon && hon.held === 'honey' && hon.ghost === 'ghost:honey', `last and a quarter-lap down, the box gives Sticky honey (${hon && hon.held}, ghost ${hon && hon.ghost})`);
    ok(miss && miss.met === 1 && !miss.held, `a Miss gives no power-up (${miss && miss.held})`);
    ok(Math.abs(g.st.shieldFull - 10) < 0.05 && Math.abs(g.st.shieldStd - 6) < 0.05 && g.st.turboFull[1] === 1.45 && Math.abs(g.st.turboFull[0] - 4) < 0.05 && g.st.turboStd[1] === 1.3 && Math.abs(g.st.oil - 2.8) < 0.05,
      `fired at their strengths: Shield ${g.st.shieldFull}/${g.st.shieldStd}s, Turbo ×${g.st.turboFull[1]} ${g.st.turboFull[0]}s / ×${g.st.turboStd[1]}, Oil spins the chaser ${g.st.oil}s`);
    ok(g.combo[0].combo === 1 && g.combo[1].combo === 2 && g.combo[2].combo === 0 && g.combo[2].boost[0] > 0,
      `three Clean in a row add a free Turbo (combo ${g.combo.map(c => c.combo).join(' → ')}, boost after the third ${g.combo[2].boost.map(x => +(+x).toFixed(2)).join(' ×')})`);
  }

  /* ---------------- GP3: the band ---------------- */
  if (want('GP3')) {
    const r = await pg.evaluate(() => { const out = [];
      for (let seed = 1; seed <= 10; seed++) { const h = document.createElement('div'); h.style.cssText = 'position:fixed;inset:0'; document.body.appendChild(h);
        const e = window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', drive: 'medium', scene: 'meadow', autoGo: true, seed: seed * 101 }, () => {});
        const R = window._race; R.clearBoxes(); R.rivalPowers(false); R.hazards(false); R.bot({ drive: 'line', seed });
        R.fast(1.2); R.fast(4);
        const s0 = R.state(), L = s0.trackLen; R.rivalsAt().forEach((x, i) => R.setRival(i, s0.pos - 200 * (30 + i * 3)));
        const g0 = (s0.pos - Math.max(...R.rivalsAt().map(x => x.z))) / 200;
        let n = 0; while (R.state().pos < s0.pos + L && n++ < 4000) R.fast(0.05);
        const g1 = (R.state().pos - Math.max(...R.rivalsAt().map(x => x.z))) / 200;
        out.push(+(g1 / g0).toFixed(2)); e.destroy(); h.remove(); }
      return out; });
    /* the band, isolated: no boxes, no rival power-ups, no hazards — one oil slick costs ~70 bands,
       which is a lesson about oil, not about the band */
    ok(r.every(k => k >= 0.9), `GP3: a 30-band lead driven on the racing line keeps ≥ 90% over a lap with the ±2% band and the draft on (kept ${r.map(k => Math.round(k * 100) + '%').join(', ')})`);
  }

  /* ---------------- GP1 / GP2: the pace ---------------- */
  if (want('GP1')) {
    const r = await runMany({ steer: 'random', spell: 'clean' }, 20); const ps = r.map(x => x.p);
    ok(!ps.includes(1) && avg(ps) >= 4, `GP1: random steering + perfect spelling never wins — average ${avg(ps).toFixed(2)}, places ${ps.join('')}`);
  }
  if (want('GP2')) {
    const a = (await runMany({ steer: 'line', spell: 'miss' }, 20)).map(x => x.p), c = (await runMany({ steer: 'line', spell: 'clean' }, 20)).map(x => x.p);
    const wa = a.filter(p => p === 1).length, wc = c.filter(p => p === 1).length;
    ok(avg(a) >= 2 && avg(a) <= 4 && wa <= 4, `GP2a: racing line, every box word missed — average ${avg(a).toFixed(2)} (2nd–4th), wins ${wa}/20 (≤ 4); places ${a.join('')}`);
    ok(wc >= 13, `GP2b: racing line, every box word Clean — wins ${wc}/20 (≥ 13); places ${c.join('')}`);
    ok(avg(a) - avg(c) >= 1, `GP2: spelling is worth at least a place — ${avg(a).toFixed(2)} → ${avg(c).toFixed(2)}`);
  }

  /* ---------------- GP12: the length ---------------- */
  if (want('GP12')) {
    const r = await runMany({ steer: 'human', spell: 'level' }, 20);
    /* the wall clock of a box: the bot's secs (from the card opening — hearing the word is inside
       it, as it is inside par), then the card: 1.1s for a power-up, ~3.5s reading the word and
       pressing Continue after a miss. The 1s countdown back to racing is already race time. */
    const mins = r.map(x => (x.t + x.log.reduce((s, b) => s + b.secs + (b.ok ? 1.1 : 3.5), 0)) / 60).sort((p, q) => p - q);
    const med = mins[mins.length >> 1];
    ok(med >= 3 && med <= 4, `GP12: a race at Medium takes ${med.toFixed(2)} min (median of 20; ${mins[0].toFixed(2)}–${mins[mins.length - 1].toFixed(2)}), a child-like driver and an at-level speller`);
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
