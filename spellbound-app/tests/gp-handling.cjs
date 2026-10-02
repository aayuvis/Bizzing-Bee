/* THE GRAND PRIX GOES WHERE YOU STEER, AND THE ROAD IS ONE ROAD.

   Two play-test notes, one afternoon: "the car is veering in all random directions" and
   "the road rendering is two tone". Both were true, and both were measurable:

     · the push had MEMORY — a bend built a sideways slide with a 2.4s half-life, so an
       unsteered kart moved 0.17 road-half-widths a second on STRAIGHTS, kept sliding after
       it had stopped in the grass, and a counter-steer lost to it for most of a second;
     · releasing either arrow zeroed the wheel with the other still held, and a touch the
       browser claimed as a gesture (pointercancel) left it stuck full over;
     · the near road was fogged to 82% sky by its last band and the far ribbon not at all,
       so the two met in a hard seam straight across the screen.

   Each check below is measured from the live engine. Run:
     NODE_PATH=/opt/node22/lib/node_modules node tests/gp-handling.cjs                    */
const { chromium } = require('playwright');
const path = require('path');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

async function mount(pg, scene, diff) {
  await pg.evaluate(([scene, diff]) => {
    document.querySelectorAll('#gp-probe').forEach(n => n.remove());
    const host = document.createElement('div'); host.id = 'gp-probe';
    host.style.cssText = 'position:fixed;inset:0;z-index:2147483647;background:#111';
    document.body.appendChild(host);
    window._gpEng = window.SB_SAGA_ENGINES.beeGrandPrix(host, { diff, world: 'Hive', scene }, () => {});
  }, [scene, diff]);
  await pg.waitForTimeout(900);
  await pg.evaluate(() => { const g = document.querySelector('#gp-probe #sg-howgo'); if (g) g.click(); });
  for (let i = 0; i < 40; i++) { if (await pg.evaluate(() => window._race.state().mode === 'race')) break; await pg.waitForTimeout(150); }
  await pg.evaluate(() => window._race.clearBoxes());
}
const st = pg => pg.evaluate(() => window._race.state());
const key = (pg, type, k) => pg.evaluate(([type, k]) => dispatchEvent(new KeyboardEvent(type, { key: k, bubbles: true })), [type, k]);

(async () => {
  /* file:// art is cross-origin to a file:// page unless told otherwise, and a tainted canvas
     refuses getImageData — which the seam check needs */
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].find(p => require('fs').existsSync(p)), args: ['--allow-file-access-from-files'] });
  const pg = await b.newPage({ viewport: { width: 430, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.addInitScript(() => { window.SB_DEBUG = true; });
  await pg.goto('file://' + path.resolve(__dirname, '..') + '/index.html');
  await pg.waitForTimeout(3500);
  await pg.evaluate(() => new Promise(r => SB_LAZY.need('arcade', r)));   // the engines are lazy since FIX-BEE N2 (boot-lazy 'arcade')
  await mount(pg, 'meadow', 'medium');

  /* 1 — A STRAIGHT DOES NOT MOVE YOU — NOT EVEN THE ONE AFTER A BEND. Flat out through
     the end of a tight bend, hands off, then a second of the straight it runs onto. A slide
     with memory shows up exactly here, where nothing on screen explains it. */
  const ex = await pg.evaluate(() => { const sg = window._race.toBendExit(3, 55); window._race.setV(1);
    window._race.steerTo(sg > 0 ? 0.45 : -0.45); return sg; });
  for (let i = 0; i < 40 && (await pg.evaluate(() => window._race.curveHere())) !== 0; i++) await pg.waitForTimeout(25);
  await pg.waitForTimeout(60);
  const a0 = await st(pg); await pg.waitForTimeout(700); const a1 = await st(pg);
  const onStraight = await pg.evaluate(() => window._race.curveHere()) === 0;
  const straightMove = Math.abs(a1.x - a0.x);
  ok(ex !== 0 && onStraight && straightMove < 0.01,
    `out of a bend and onto a straight, hands off, the kart holds its line — moved ${straightMove.toFixed(3)} in 0.7s${onStraight ? '' : ' (left the straight!)'}`);

  /* 2 — A PARKED KART IS NOT SHOVED. In the grass at a standstill, on a bend. */
  await pg.evaluate(() => { window._race.toBend(3); window._race.steerTo(1.1); window._race.setV(0); });
  await pg.waitForTimeout(150);
  const p0 = await st(pg); await pg.waitForTimeout(800); const p1 = await st(pg);
  ok(Math.abs(p1.x - p0.x) < 0.005 && p1.v < 1, `stopped in the grass on a bend, nothing pushes it — moved ${Math.abs(p1.x - p0.x).toFixed(3)}`);

  /* 3 — BUT IT IS NOT SELF-DRIVING. Flat out into a tight bend, hands off: the grass. */
  const c = await pg.evaluate(() => { const c = window._race.toBend(4); window._race.setV(1); window._race.steerTo(0); return c; });
  let maxX = 0;
  for (let i = 0; i < 25; i++) { await pg.waitForTimeout(100); maxX = Math.max(maxX, Math.abs((await st(pg)).x)); }
  ok(maxX > 0.95, `hands off through a curve-${Math.abs(c)} bend at speed, the kart ends up on the grass (reached ${maxX.toFixed(2)} of 0.95)`);

  /* 4 — AND STEERING INTO IT HOLDS IT. Same bend, same speed, driven the way a person
     does: the wheel held into the turn while the bend is pushing and you are not already
     well inside it, let go otherwise.
     (Holding it on past the bend's end steers you off the INSIDE — that is steering, and
     it is correct.) */
  await pg.evaluate(() => { window._race.toBend(4); window._race.setV(1); window._race.steerTo(0); });
  const into = c > 0 ? 'ArrowRight' : 'ArrowLeft';
  let worst = 0, down = false, heldFor = 0;
  for (let i = 0; i < 30; i++) {
    const s = await st(pg); worst = Math.max(worst, Math.abs(s.x));
    const inside = (c > 0 ? 1 : -1) * s.x;              // how far toward the inside of the turn
    const want = Math.abs(s.push) > 0.3 && inside < 0.3; // steer in while it pushes, until comfortably inside
    if (want && !down) { await key(pg, 'keydown', into); down = true; }
    if (!want && down) { await key(pg, 'keyup', into); down = false; }
    if (down) heldFor += 50;
    await pg.waitForTimeout(50);
  }
  if (down) await key(pg, 'keyup', into);
  ok(heldFor > 0 && worst < 0.95, `steering into the same bend keeps it on the road (widest ${worst.toFixed(2)}, wheel held ${heldFor}ms)`);

  /* 5 — THE WHEEL IS WHAT IS HELD. Roll from Left to Right: Right is still down. */
  await key(pg, 'keydown', 'ArrowLeft'); await key(pg, 'keydown', 'ArrowRight'); await key(pg, 'keyup', 'ArrowLeft');
  const r1 = (await st(pg)).steer;
  await key(pg, 'keyup', 'ArrowRight');
  const r0 = (await st(pg)).steer;
  ok(r1 === 1 && r0 === 0, `rolling Left→Right keeps steering right (${r1}), letting go centres it (${r0})`);

  /* 6 — A CANCELLED TOUCH LETS GO. And two thumbs: release one, the other still steers. */
  const touch = await pg.evaluate(() => {
    const L = document.querySelector('#gp-probe .sg-sbtn[data-s="-1"]'), R = document.querySelector('#gp-probe .sg-sbtn[data-s="1"]');
    const pe = (el, t, id) => el.dispatchEvent(new PointerEvent(t, { pointerId: id, bubbles: true, cancelable: true, pointerType: 'touch' }));
    const out = {};
    pe(R, 'pointerdown', 7); out.held = window._race.state().steer;
    pe(R, 'pointercancel', 7); out.cancelled = window._race.state().steer;
    pe(L, 'pointerdown', 8); pe(R, 'pointerdown', 9); pe(R, 'pointerup', 9); out.twoThumbs = window._race.state().steer;
    pe(L, 'pointerup', 8); out.none = window._race.state().steer;
    return out;
  });
  ok(touch.held === 1 && touch.cancelled === 0, `a touch the browser cancels releases the wheel (held ${touch.held} → ${touch.cancelled})`);
  ok(touch.twoThumbs === -1 && touch.none === 0, `two thumbs: lift Right and Left is still steering (${touch.twoThumbs}), lift both and it centres (${touch.none})`);

  /* 7 — A WINDOW THAT LOSES FOCUS NEVER HEARS THE KEYUP. */
  await key(pg, 'keydown', 'ArrowRight');
  await pg.evaluate(() => dispatchEvent(new Event('blur')));
  ok((await st(pg)).steer === 0, 'switching away mid-steer lets go of the wheel');

  /* 8 — ONE ROAD, NOT TWO. Colour just below and just above the join between the near
     road and the far ribbon, at four points across the tarmac (median, so a kart or a tree
     on one sample cannot fake a pass or a fail). The seam it replaces was ~300. */
  for (const scene of ['meadow', 'sunset', 'city']) {
    await mount(pg, scene, 'medium');
    await pg.evaluate(() => { window._race.toStraight(90); window._race.setV(0.9); window._race.steerTo(0); });
    await pg.waitForTimeout(500);
    const seam = await pg.evaluate(() => {
      const s = window._race.state(), j = s.join, cv = document.querySelector('#gp-probe #sg-cv'), g = cv.getContext('2d');
      if (!j) return null;
      const px = (x, y) => { const d = g.getImageData(Math.round(x * s.dpr), Math.round(y * s.dpr), 1, 1).data; return [d[0], d[1], d[2]]; };
      const step = (y1, y2) => { const d = [-0.3, -0.2, 0.2, 0.3].map(k => { const x = j.x + k * j.w, a = px(x, y1), b = px(x, y2);
          return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); }).sort((p, q) => p - q);
        return (d[1] + d[2]) / 2; };
      /* control: the same 6px step taken wholly inside the near road, just below the join —
         the light/dark bands and the fog alone make this much change */
      return { med: step(j.y + 3, j.y - 3), ctl: step(j.y + 15, j.y + 9), y: Math.round(j.y) };
    });
    /* the seam this replaces was ~290 (82%-fogged tarmac against bare tarmac); a join that
       changes no more than the road already does a few pixels lower is not a seam */
    ok(seam && seam.med <= Math.max(45, seam.ctl * 2), seam ? `${scene}: no seam where the near road meets the far — ${seam.med} RGB across the join (the road itself: ${seam.ctl}; the old seam: ~290)` : `${scene}: no join measured`);
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
