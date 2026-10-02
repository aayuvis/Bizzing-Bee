/* THE KART IS A KART.

   "The kart graphics look cheap." Measured, the reasons were: a sprite with a helmeted
   driver PAINTED IN and the player's avatar stuck on top of the helmet (two drivers);
   steering that ROTATED the whole card; nothing that moved; and — once the kart was
   drawn at a kart's size — a phone kart that drove under the brake button.
   The kart is drawn now (SB_KART_ART in saga2.js). This holds the parts a viewer would
   complain about, measured from the live engine and its pixels. Run:
     NODE_PATH=/opt/node22/lib/node_modules node tests/gp-kart.cjs                        */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

async function race(pg, kart) {
  await pg.evaluate((kart) => {
    document.querySelectorAll('#gpk').forEach(n => n.remove());
    const host = document.createElement('div'); host.id = 'gpk';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#111';
    document.body.appendChild(host);
    window.SB_SAGA_ENGINES.beeGrandPrix(host, { diff: 'medium', world: 'Hive', scene: 'meadow', kart }, () => {});
  }, kart);
  await pg.waitForTimeout(900);
  await pg.evaluate(() => document.querySelector('#gpk #sg-howgo').click());
  for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => window._race.state().mode === 'race')) break; await pg.waitForTimeout(150); }
  await pg.evaluate(() => window._race.clearBoxes());
}
const st = pg => pg.evaluate(() => window._race.state());
const key = (pg, t, k) => pg.evaluate(([t, k]) => dispatchEvent(new KeyboardEvent(t, { key: k })), [t, k]);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)), args: ['--allow-file-access-from-files'] });
  const errs = [];
  const open = async (w, h) => { const pg = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    pg.on('pageerror', e => errs.push(e.message)); await pg.addInitScript(() => { window.SB_DEBUG = true; });
    await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html'); await pg.waitForTimeout(3500);
    await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));   // the engines are lazy since FIX-BEE N2 (boot-lazy 'arcade')
    return pg; };

  /* ---------- desktop ---------- */
  const pg = await open(1280, 860);
  await race(pg, 'kart');

  /* 1 — ONE DRIVER. The kart is drawn, not a sprite with a helmet painted in. */
  const src = await pg.evaluate(() => !!(window.SB_KART_ART && SB_KART_ART.draw && SB_KART_ART.thumb));
  ok(src, 'the karts come from SB_KART_ART, not a painted sprite');

  /* 2 — IT TURNS, IT DOES NOT TILT. Hold a direction: the kart yaws toward it. */
  await pg.evaluate(() => { window._race.toStraight(90); window._race.setV(1); window._race.steerTo(-0.4); });
  await key(pg, 'keydown', 'ArrowRight'); await pg.waitForTimeout(300);
  const yR = (await st(pg)).yaw; await key(pg, 'keyup', 'ArrowRight');
  await key(pg, 'keydown', 'ArrowLeft'); await pg.waitForTimeout(300);
  const yL = (await st(pg)).yaw; await key(pg, 'keyup', 'ArrowLeft');
  await pg.waitForTimeout(500); const y0 = (await st(pg)).yaw;
  ok(yR > 0.5 && yL < -0.5 && Math.abs(y0) < 0.1, `the kart yaws into the steer — right ${yR.toFixed(2)}, left ${yL.toFixed(2)}, straight ${y0.toFixed(2)}`);

  /* 3 — THE BRAKE LAMPS LIGHT, AND YOU CAN SEE THEM. Out at ±27 units the nearer tyre
     covered all but a sliver; they are inboard now. Red measured at each lamp, off and on. */
  const lamp = async () => pg.evaluate(() => {
    const s = window._race.state(), K = s.kart, u = K.w / 100, cv = document.querySelector('#gpk #sg-cv'), g = cv.getContext('2d');
    const r = [-1, 1].map(k => { const x = Math.round((K.x + k * 18 * u) * s.dpr), y = Math.round((K.y - 32 * u) * s.dpr);
      const d = g.getImageData(x - 2, y - 2, 5, 5).data; let R = 0, G = 0; for (let i = 0; i < d.length; i += 4) { R += d[i]; G += d[i + 1]; } return { R: R / 25, G: G / 25 }; });
    return r; });
  await pg.evaluate(() => { window._race.toStraight(90); window._race.setV(1); window._race.steerTo(0); });
  await pg.waitForTimeout(300); const off = await lamp();
  /* read the lamps only once braking has been DRAWN: under load 150ms can be two frames,
     and a pixel read before the frame that lit them measures the timer, not the lamp */
  await key(pg, 'keydown', 'ArrowDown');
  await pg.waitForFunction(() => window._race.state().braking, null, { timeout: 2000 });
  await pg.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r)))));
  const on = await lamp(); await key(pg, 'keyup', 'ArrowDown');
  const lit = on.every((q, i) => q.R > 200 && q.R - off[i].R > 50 && q.R - q.G > 80);
  ok(lit, `both brake lamps are red and brighten under braking — R ${off.map(q => Math.round(q.R)).join('/')} → ${on.map(q => Math.round(q.R)).join('/')}`);

  /* 4 — THE VERGE KICKS UP DUST. */
  await pg.evaluate(() => { window._race.toStraight(90); window._race.setV(1); window._race.steerTo(-0.93); });
  await pg.waitForTimeout(400);
  const dust = (await st(pg)).puffs;
  ok(dust >= 6, `two wheels on the verge throw up dust — ${dust} puffs in the air`);

  /* 5 — THE PICKER SHOWS THE KART YOU RACE. */
  const thumbs = await pg.evaluate(() => Object.keys(SB_KART_ART.styles).map(k => SB_KART_ART.thumb(k, 120).slice(0, 15)));
  ok(thumbs.length === 5 && thumbs.every(t => t === 'data:image/png;'), `all five kart styles draw a picker thumbnail (${thumbs.length})`);
  await pg.close();

  /* ---------- phone ---------- */
  const ph = await open(430, 900);
  await race(ph, 'kart');
  /* 6 — ON A PHONE THE KART NEVER DRIVES UNDER A BUTTON. Measured WHILE steering to each
     kerb, not parked there: mid-steer the kart leads the camera by ~40px, and that is the
     moment the child's thumb is on the arrow beside the brake. Parked, it never touched. */
  const clash = [];
  for (const [from, k] of [[-0.3, 'ArrowRight'], [0.3, 'ArrowLeft']]) {
    await ph.evaluate((x) => { window._race.toStraight(90); window._race.setV(0.8); window._race.steerTo(x); }, from);
    await ph.waitForTimeout(200);
    await key(ph, 'keydown', k);
    for (let n = 0; n < 14; n++) {
      await ph.waitForTimeout(45);
      const r = await ph.evaluate(() => {
        const s = window._race.state(), K = s.kart, cvr = document.querySelector('#gpk #sg-cv').getBoundingClientRect();
        const kb = { l: cvr.left + K.x - K.w * 0.5, r: cvr.left + K.x + K.w * 0.5, t: cvr.top + K.y - K.w * 1.1, b: cvr.top + K.y };
        const hit = [...document.querySelectorAll('#gpk .sg-steer .sg-sbtn')].map(bn => bn.getBoundingClientRect())
          .filter(q => q.left < kb.r && q.right > kb.l && q.top < kb.b && q.bottom > kb.t).length;
        return { hit, kl: Math.round(kb.l), kr: Math.round(kb.r), x: +s.x.toFixed(2) };
      });
      if (r.hit) { clash.push(`${k} at x=${r.x}: kart ${r.kl}–${r.kr}px under ${r.hit} button(s)`); break; }
    }
    await key(ph, 'keyup', k);
  }
  ok(!clash.length, clash.length ? clash.join('; ') : 'steering hard to either kerb, the kart stays clear of every control');
  await ph.close();

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
