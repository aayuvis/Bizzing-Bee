/* THE WORLD FITS THE KART, CHANGES AS YOU DRIVE, AND THE KART HOLDS STILL.

   Three play-test notes in one afternoon:
     "the car is shaking"  — the kart's size came from the nearest road band's width, which
        steps every time a band scrolls past: it grew and snapped back 4.5% per band.
        Rivals were snapped to their band's near edge and hopped a band at a time.
     "the trees on the side are too small as compared to the kart" — when the kart grew to
        0.38 of a road half-width nothing else did: trees 0.19 wide, a tower shorter than
        the kart, a cop car half a kart, a marker post a sixth of its height.
     "too many trees and cacti… too repetitive and boring" — one prop on a fixed beat, the
        whole race. Each world is now a lap of four zones with their own props and ground.

   Every check is measured from the live engine (window._race.state()/scale()). Sizes are
   in kart units: a kart is 0.38 half-widths wide and 0.44 tall with its driver. Run:
     NODE_PATH=/opt/node22/lib/node_modules node tests/gp-world.cjs                     */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

/* height of each kind, in kart heights — a real-world size, made cartoon-friendly */
const H = { tree: [2.2, 4.5], parktree: [1.5, 3.5], bush: [0.6, 1.3], flowers: [0, 0.6], haybale: [0.7, 1.9],
  barn: [4, 6], windmill: [6, 9], reeds: [0.9, 1.6], cactus: [2, 4], rock: [0.6, 1.3], boulders: [1.4, 2.4],
  deadtree: [2.5, 4], butte: [4, 7], watertower: [6, 8.5], signpost: [1.8, 2.6], formation: [4, 8],
  tower: [6, 20], lamp: [2.8, 4.2], billboard: [4.5, 6.5], shop: [2.5, 3.6], hedge: [0.8, 1.4] };

async function race(pg, scene) {
  await pg.evaluate((scene) => {
    document.querySelectorAll('#gpw').forEach(n => n.remove());
    const h = document.createElement('div'); h.id = 'gpw'; h.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#111';
    document.body.appendChild(h);
    window.SB_SAGA_ENGINES.beeGrandPrix(h, { diff: 'medium', scene, kart: 'kart', autoGo: true }, () => {});
  }, scene);
  for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => window._race && window._race.state().mode === 'race')) break; await pg.waitForTimeout(150); }
  await pg.evaluate(() => window._race.clearBoxes());
  await pg.waitForTimeout(600);   // let the tree sprite decode: its aspect is part of the audit
}
const frames = (pg, n, f) => pg.evaluate(([n, f]) => new Promise(res => { const out = []; const g = new Function('s', 'return ' + f);
  const tick = () => { out.push(g(window._race.state())); if (out.length < n) requestAnimationFrame(tick); else res(out); }; requestAnimationFrame(tick); }), [n, f]);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await b.newPage({ viewport: { width: 1280, height: 860 } });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { window.SB_DEBUG = true; });
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html');
  await pg.waitForTimeout(3500);

  /* ---- 1. the kart holds still ---- */
  await race(pg, 'meadow');
  await pg.evaluate(() => { window._race.toStraight(100); window._race.setV(1); window._race.steerTo(0.2); });
  await pg.waitForTimeout(300);
  const kw = await frames(pg, 90, 's.kart.w');
  const kr = Math.max(...kw) - Math.min(...kw);
  ok(kr < 0.5, `flat out on a straight the kart's drawn width is steady — it varied ${kr.toFixed(2)}px over 90 frames (the shaking was ~9.8)`);
  /* a rival we are pulling away from moves every frame — never frozen, never a hop */
  /* 45 bands ahead is mid-screen (the road only comes into view ~21 bands out); the kart is
     slowed so the rival pulls away and has to move on screen every frame */
  await pg.evaluate(() => { window._race.toStraight(100); window._race.setV(0.4); window._race.pace(0, 9000, 0.3); });
  await pg.waitForTimeout(120);
  const rv = await frames(pg, 70, 's.rivScr.map(q=>q&&q[1])');
  let worst = null;
  for (let i = 0; i < rv[0].length; i++) { const ys = rv.map(f => f[i]).filter(v => v != null); if (ys.length < 20) continue;
    const st = []; for (let k = 1; k < ys.length; k++) st.push(Math.abs(ys[k] - ys[k - 1]));
    const med = [...st].sort((a, c) => a - c)[st.length >> 1]; if (med < 0.3) continue;
    const r = { frozen: st.filter(v => v < 0.001).length, spike: Math.max(...st) / med }; if (!worst || r.frozen > worst.frozen) worst = r; }
  ok(worst && worst.frozen === 0, worst ? `a rival on screen moves every frame — ${worst.frozen} frozen frames (band-snapping froze it 2–4 times a second)` : 'no moving rival found to measure');
  /* and a rival the camera has jumped away from is not drawn from a band's stale screen position:
     put every rival on screen, let the bands they stand on be drawn, then jump half a lap on —
     those bands are now out of range and nothing re-visits them to clear their 'visible' flag */
  await pg.evaluate(() => { const R = window._race; R.toStraight(100); R.setV(0); [0, 1, 2, 3, 4].forEach(i => R.pace(i, 6000 + i * 1500, -0.5 + i * 0.25)); });
  const before = await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(window._race.state().rivScr.filter(Boolean).length)))));
  const ghosts = await pg.evaluate(() => new Promise(r => { const R = window._race, s0 = R.state(), L = s0.trackLen;
    R.jump(s0.pos + L / 2);
    requestAnimationFrame(() => requestAnimationFrame(() => { const s = R.state(), z = R.rivZ();
      r(s.rivScr.filter((q, i) => { if (!q) return false; const rel = (((z[i] - s.pos) % L) + L) % L; return rel > 100 * 200 + 400; }).length); })); }));
  ok(before >= 3 && ghosts === 0, `no rival out of draw range is drawn after a jump — ${ghosts} ghosts (${before} were on screen before it; a band's stale 'visible' flag drew them where they used to be)`);

  /* ---- 2. the world fits the kart, in every world ---- */
  for (const scene of ['meadow', 'sunset', 'city']) {
    await race(pg, scene);
    const S = await pg.evaluate(() => window._race.scale());
    const K = S.kartW, KH = S.kartH, bad = [];
    ok(S.rivalW === K, `${scene}: rivals are drawn at the kart's own scale`);
    Object.entries(S.kinds).forEach(([k, d]) => { const t = H[k]; if (!t) { bad.push(k + ' has no size target'); return; }
      const hs = Array.isArray(d.h) ? d.h : [d.h, d.h]; if (hs[0] == null) { bad.push(k + ' height unknown'); return; }
      const lo = hs[0] / KH, hi = hs[1] / KH; if (lo < t[0] - 1e-6 || hi > t[1] + 1e-6) bad.push(`${k} ${lo.toFixed(1)}–${hi.toFixed(1)} kart heights (want ${t[0]}–${t[1]})`); });
    ok(!bad.length, bad.length ? `${scene}: out of scale — ${bad.join('; ')}` :
      `${scene}: all ${Object.keys(S.kinds).length} kinds of prop are in scale — ${Object.entries(S.kinds).map(([k, d]) => k + ' ' + ((Array.isArray(d.h) ? d.h[1] : d.h) / KH).toFixed(1) + '×').join(', ')}`);
    ok(S.clear.d >= S.verge - 1e-6, `${scene}: every placed prop's footprint stands clear of the verge — nearest is a ${S.clear.kind} at ${S.clear.d.toFixed(2)} (verge ends at ${S.verge})`);
    if (scene === 'meadow') {
      const r = [S.copW / K, S.oilW / K, S.boxW / K, S.postH / KH];
      ok(r[0] >= 1 && r[0] <= 1.4, `a police car is a car beside a kart — ${r[0].toFixed(2)}× its width (was 0.55)`);
      ok(r[1] >= 0.7 && r[1] <= 1.2 && Math.abs((K + S.oilW) / 2 - S.catchR) / S.catchR <= 0.15, `an oil slick is ${r[1].toFixed(2)}× a kart, and touching it looks like the hit test says it is`);
      ok(r[2] >= 0.5 && r[2] <= 0.9, `the item box is ${r[2].toFixed(2)}× a kart's width`);
      ok(r[3] >= 0.35 && r[3] <= 0.7, `a marker post is ${r[3].toFixed(2)}× a kart's height (was 0.15)`);
    }
    /* ---- 3. it changes as you drive ---- */
    const rep = S.runs.some((r, i) => i && r === S.runs[i - 1]);
    ok(S.zones.length >= 4 && !rep && Object.keys(S.kinds).length >= 5,
      `${scene}: ${S.zones.length} zones (${S.zones.join(', ')}), never the same twice in a row, ${Object.keys(S.kinds).length} kinds of prop`);
    /* "too many trees and cacti": per 100 road bands in any zone, at most 8 trees and 6 cacti;
       and no zone that is not dense ON PURPOSE (canyon, street) carries more than 12 standing
       props — ground cover (flowers, reeds, small rocks) and street lamps aside */
    const per = (c, ks) => 100 * ks.reduce((t, k) => t + (c.kinds[k] || 0), 0) / Math.max(1, c.bands);
    const trees = Math.max(...Object.values(S.counts).map(c => per(c, ['tree', 'parktree'])));
    const cacti = Math.max(...Object.values(S.counts).map(c => per(c, ['cactus'])));
    ok(trees <= 8 && cacti <= 6, `${scene}: trees at most ${trees.toFixed(1)} and cacti at most ${cacti.toFixed(1)} per 100 bands in any zone (caps 8 and 6)`);
    const stand = Object.entries(S.counts).filter(([, c]) => !c.dense).map(([z, c]) => [z, per(c, Object.keys(c.kinds).filter(k => !['flowers', 'reeds', 'rock', 'lamp'].includes(k)))]);
    const mx = Math.max(...stand.map(d => d[1]));
    ok(mx <= 12, `${scene}: no zone is crowded by accident — at most ${mx.toFixed(1)} standing props per 100 bands (${stand.map(d => d[0] + ' ' + d[1].toFixed(1)).join(', ')})`);
  }
  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
