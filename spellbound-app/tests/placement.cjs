/* PLACEMENT LANDS A KNOWN LEVEL WITHIN ONE REGION OF IT (road to 4.5, P1.7 / P1.8). @check

   The placement step (placement.js) asks a child of 11+ twelve words, adaptively, and suggests a start region
   on the Word Atlas. Its words are cut from each region's own stops by tools/build-placement.cjs. Here:
     1. THE WORDS: placement-data.js is exactly what the build writes (rebuilt from the corpus, the way the
        page loads it), nine regions in road order, each opening at its own first Tier-1 stop, every word
        from that region's Tier-1 stops, and the difficulty ladder climbing region by region.
     2. THE RUN: exactly twelve words, never more than four from one region, the same answers giving the
        same words and the same suggestion every time — and Math.random is never called (it throws here).
     3. THE VALIDATION THE BRIEF ASKS FOR: a bot of KNOWN level K — it can spell every region before K and
        none from K on — is placed at K, for all nine K and both bands; with deterministic noise (one answer
        in 6, 5 or 4 flipped, slipped or lucky, at every phase) it still lands within one region, every run;
        and a bot whose ability is on the LIBRARY's difficulty scale instead (it spells a word iff its band
        y ≤ θ) lands within one region of where θ puts it on the road. The rate for scattered noise (one
        answer in ten flipped by a hash of the word) is printed and held under a ceiling.
     4. THE CHOICE: one easier, the suggestion, one harder — never off the road.
   Run: node tests/placement.cjs                                                                       */
'use strict';
const fs = require('fs'), path = require('path');
const APP = path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');

/* 1 — the words */
const B = require(path.join(APP, 'tools', 'build-placement.cjs'));
const C = B.corpus();
const fresh = B.text(B.build(C));
ok(fresh === fs.readFileSync(B.OUT, 'utf8'), 'placement-data.js is exactly what tools/build-placement.cjs writes from the corpus' + (fresh === fs.readFileSync(B.OUT, 'utf8') ? '' : ' — run node tools/build-placement.cjs'));
const g = {};
new Function('window', fs.readFileSync(path.join(APP, 'placement-data.js'), 'utf8'))(g);
new Function('window', fs.readFileSync(path.join(APP, 'placement.js'), 'utf8'))(g);
const D = g.SB_PLACE_DATA, P = g.SB_PLACE, R = D.regions.length;
ok(R === 9 && D.regions.map(r => r.act).join() === C.ACTS.map(a => a.id).join(), 'nine regions, in road order');
const lap1 = a => a.units.map(id => C.UNITS[id]).filter(u => (u.laps || [u.lap || 1]).includes(1));
ok(D.regions.every((r, i) => r.entry.u === lap1(C.ACTS[i])[0].id), "each region's start is its own first Tier-1 stop: " + D.regions.map(r => r.entry.u).join(' '));
const bad = [];
D.regions.forEach((r, i) => {
  const units = lap1(C.ACTS[i]).map(u => u.id);
  if (r.items.length < P.MAX_PER) bad.push(r.act + ' has only ' + r.items.length + ' words');
  r.items.forEach(it => { const p = C.MAP[it.u] || {};
    if (units.indexOf(it.u) < 0) bad.push(it.w + ' comes from ' + it.u + ', not a Tier-1 stop of ' + r.act);
    if (![].concat(p[1] || [], p[2] || [], p[3] || []).includes(it.w)) bad.push(it.w + ' is not in ' + it.u + "'s pool");
    if (it.d.toLowerCase().indexOf(it.w.slice(0, 5)) >= 0) bad.push(it.w + "'s meaning gives it away");
    if ((C.WORD[it.w] || {}).y !== it.y) bad.push(it.w + ' band ' + it.y + ' is not the library\'s'); });
});
ok(!bad.length, "every word is one of its region's own Tier-1 stop words, with the library's band and a meaning that does not give it away" + (bad.length ? ' — ' + bad.slice(0, 4).join(' | ') : ''));
const mean = r => r.items.reduce((t, it) => t + it.y, 0) / r.items.length;
ok(D.regions.every((r, i) => !i || mean(r) > mean(D.regions[i - 1])), 'the ladder climbs: mean band per region ' + D.regions.map(r => mean(r).toFixed(1)).join(' < '));

/* 2 — the run */
const realRandom = Math.random; Math.random = () => { throw new Error('Math.random called'); };
let threw = null; let r1, r2;
try { r1 = P.run(D, '11-13', it => it.r < 4); r2 = P.run(D, '11-13', it => it.r < 4); } catch (e) { threw = e.message; }
Math.random = realRandom;
ok(!threw, 'a whole run never calls Math.random' + (threw ? ' — ' + threw : ''));
ok(r1 && r1.asked.length === P.N && P.N === 12, `exactly twelve words are asked (${r1 && r1.asked.length})`);
ok(r1 && JSON.stringify(r1) === JSON.stringify(r2), 'the same answers give the same words and the same suggestion');
const perMax = Math.max(...[...Array(R).keys()].map(q => r1.asked.filter(a => a.r === q).length));
ok(perMax <= P.MAX_PER, `no region is asked more than ${P.MAX_PER} times (most: ${perMax})`);
ok(!/Math\.random/.test(strip(fs.readFileSync(path.join(APP, 'placement.js'), 'utf8'))) && !/Math\.random/.test(strip(fs.readFileSync(path.join(APP, 'tools', 'build-placement.cjs'), 'utf8'))),
  'no Math.random in placement.js or its build');

/* 3 — the bots */
const BANDS = ['11-13', '14-18'];
const exact = [];
for (const band of BANDS) for (let K = 0; K < R; K++) { const r = P.run(D, band, it => it.r < K); if (r.rec !== K) exact.push(band + ' K' + K + '→' + r.rec); }
ok(!exact.length, `a bot of known level K is placed at K — all ${R} levels × ${BANDS.length} bands` + (exact.length ? ' — ' + exact.join(', ') : ''));
let runs = 0, worst = 0; const off = [];
for (const per of [6, 5, 4]) for (const kind of ['flip', 'slip', 'lucky']) for (const band of BANDS) for (let K = 0; K < R; K++) for (let ph = 0; ph < per; ph++) {
  const r = P.run(D, band, (it, k) => { const t = it.r < K; if (k % per !== ph) return t; return kind === 'flip' ? !t : kind === 'slip' ? false : true; });
  runs++; const d = Math.abs(r.rec - K); worst = Math.max(worst, d); if (d > 1) off.push(kind + ' 1/' + per + ' ' + band + ' K' + K + ' ph' + ph + '→' + r.rec);
}
ok(!off.length, `with one answer in 6, 5 or 4 flipped, slipped or lucky (every phase, both bands, all levels): ${runs} runs, all within one region (worst ${worst})` + (off.length ? ' — ' + off.slice(0, 4).join(', ') : ''));
const ylad = [];
for (const band of BANDS) for (let th = 0; th <= 9; th++) {
  const first = D.regions.findIndex(r => r.items.some(it => it.y > th)); const K = first < 0 ? R - 1 : first;
  const r = P.run(D, band, it => D.regions[it.r].items[it.i].y <= th);
  if (Math.abs(r.rec - K) > 1) ylad.push(band + ' θ' + th + ' K' + K + '→' + r.rec);
}
ok(!ylad.length, 'a bot on the library\'s difficulty scale (spells a word iff its band ≤ θ, θ = 0…9) lands within one region of where θ puts it on the road' + (ylad.length ? ' — ' + ylad.join(', ') : ''));
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
let hn = 0, hoff = 0;
for (let seed = 0; seed < 60; seed++) for (const band of BANDS) for (let K = 0; K < R; K++) {
  const r = P.run(D, band, (it, k) => { const t = it.r < K; return (fnv(seed + ':' + it.w + ':' + k) % 1000) < 100 ? !t : t; });
  hn++; if (Math.abs(r.rec - K) > 1) hoff++; }
const rate = hoff / hn;
console.log(`  ·   scattered noise (one answer in ten flipped by a hash of the word): ${hn - hoff} of ${hn} runs within one region (${(100 * (1 - rate)).toFixed(1)}%)`);
ok(rate <= 0.01, `scattered noise stays at or under 1% beyond one region (${(100 * rate).toFixed(2)}%)`);

/* 4 — the choice */
ok([...Array(R).keys()].every(k => { const o = P.options(k, R); return o.includes(k) && o.length <= 3 && o.every(x => x >= 0 && x < R && Math.abs(x - k) <= 1); }) &&
  P.options(0, R).join() === '0,1' && P.options(R - 1, R).join() === (R - 2) + ',' + (R - 1),
  'the choice is one easier, the suggestion and one harder — never off the road (the Meadow and the Big Stage offer two)');

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
