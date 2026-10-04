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
const { booted, until, raceTime, lazy, RACE_DT_MAX } = require('./lib/wait.cjs');
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
  /* the how-to card, then the countdown: wait for each, not for a guess at how long they take */
  await pg.waitForSelector('#gp-probe #sg-howgo', { timeout: 30000 });
  await pg.evaluate(() => { const g = document.querySelector('#gp-probe #sg-howgo'); if (g) g.click(); });
  await until(pg, () => window._race && window._race.state().mode === 'race', null, 60000);
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
  await booted(pg);
  await lazy(pg, 'arcade');   // the engines are lazy since FIX-BEE N2 (boot-lazy 'arcade')
  await mount(pg, 'meadow', 'medium');

  /* 1 — A STRAIGHT DOES NOT MOVE YOU — NOT EVEN THE ONE AFTER A BEND. Flat out through
     the end of a tight bend, hands off, then a second of the straight it runs onto. A slide
     with memory shows up exactly here, where nothing on screen explains it. */
  const ex = await pg.evaluate(() => { const sg = window._race.toBendExit(3, 55); window._race.setV(1);
    window._race.steerTo(sg > 0 ? 0.45 : -0.45); return sg; });
  /* every interval below is RACE time (lib/wait.cjs raceTime), not wall time: the engine's
     frame moves the world at most 50ms however long the frame took, so on a loaded machine
     "700ms" of wall clock was a fraction of that on the track */
  await until(pg, () => window._race.curveHere() === 0, null, 20000);
  await raceTime(pg, 0.06);
  const a0 = await st(pg); await raceTime(pg, 0.7); const a1 = await st(pg);
  const onStraight = await pg.evaluate(() => window._race.curveHere()) === 0;
  const straightMove = Math.abs(a1.x - a0.x);
  ok(ex !== 0 && onStraight && straightMove < 0.01,
    `out of a bend and onto a straight, hands off, the kart holds its line — moved ${straightMove.toFixed(3)} in 0.7s${onStraight ? '' : ' (left the straight!)'}`);

  /* 2 — A PARKED KART IS NOT SHOVED. In the grass at a standstill, on a bend. */
  await pg.evaluate(() => { window._race.toBend(3); window._race.steerTo(1.1); window._race.setV(0); });
  await raceTime(pg, 0.15);
  const p0 = await st(pg); await raceTime(pg, 0.8); const p1 = await st(pg);
  ok(Math.abs(p1.x - p0.x) < 0.005 && p1.v < 1, `stopped in the grass on a bend, nothing pushes it — moved ${Math.abs(p1.x - p0.x).toFixed(3)}`);

  /* 3 — BUT IT IS NOT SELF-DRIVING. Flat out into a tight bend, hands off: the grass. */
  /* read inside the page, frame by frame, for 2.5s of race — a read from outside lands
     whenever the round trip lets it */
  const c = await pg.evaluate(() => { const c = window._race.toBend(4); window._race.setV(1); window._race.steerTo(0); return c; });
  const maxX = await pg.evaluate(([secs, cap]) => new Promise(r => { let acc = 0, last = null, m = 0;
    const f = ts => { if (last != null) acc += Math.min(cap, (ts - last) / 1000); last = ts; m = Math.max(m, Math.abs(window._race.state().x));
      if (acc >= secs) r(m); else requestAnimationFrame(f); }; requestAnimationFrame(f); }), [2.5, RACE_DT_MAX]);
  ok(maxX > 0.95, `hands off through a curve-${Math.abs(c)} bend at speed, the kart ends up on the grass (reached ${maxX.toFixed(2)} of 0.95)`);

  /* 4 — AND STEERING INTO IT HOLDS IT. Same bend, same speed, driven the way a person
     does: the wheel held into the turn while the bend is pushing and you are not already
     well inside it, let go otherwise.
     (Holding it on past the bend's end steers you off the INSIDE — that is steering, and
     it is correct.) */
  await pg.evaluate(() => { window._race.toBend(4); window._race.setV(1); window._race.steerTo(0); });
  const into = c > 0 ? 'ArrowRight' : 'ArrowLeft';
  /* the driver sits INSIDE the page and decides every 50ms of race time — thirty decisions,
     1.5s of race. Driven from outside, each look-and-press was a round trip, and on a loaded
     machine the kart covered most of the bend between the look and the press: a person
     reacting that late does run off (the old run saw 1.20 with the wheel held 550ms). */
  const drive = await pg.evaluate(([c, into, cap]) => new Promise(r => {
    const key = (type) => dispatchEvent(new KeyboardEvent(type, { key: into, bubbles: true }));
    let worst = 0, down = false, heldFor = 0, i = 0, acc = 0, last = null, next = 0;
    const f = ts => { if (last != null) acc += Math.min(cap, (ts - last) / 1000); last = ts;
      if (acc >= next) {
        const s = window._race.state(); worst = Math.max(worst, Math.abs(s.x));
        const inside = (c > 0 ? 1 : -1) * s.x;              // how far toward the inside of the turn
        const want = Math.abs(s.push) > 0.3 && inside < 0.3; // steer in while it pushes, until comfortably inside
        if (want && !down) { key('keydown'); down = true; }
        if (!want && down) { key('keyup'); down = false; }
        if (down) heldFor += 50;
        i++; next += 0.05;
        if (i >= 30) { if (down) key('keyup'); return r({ worst, heldFor }); }
      }
      requestAnimationFrame(f); };
    requestAnimationFrame(f); }), [c, into, RACE_DT_MAX]);
  const worst = drive.worst, heldFor = drive.heldFor;
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
     on one sample cannot fake a pass or a fail). The seam it replaces was ~300.
     ONE FRAME WAS A LOTTERY. The step across the join depends on where the light/dark bands
     and the steep end of the fog curve sit at that instant, and the frame read was whichever
     one the clock landed on — parked at each of 24 points through one band cycle, the city's
     join measures 26-57 against a control of 3-20, so a single read failed about one race in
     three and passed the rest, and the scenery is random per race (props, oil, rivals).
     Now the kart is PARKED and stepped through the whole cycle (segLen 200 × rumbleLen 3 ×
     two colours = 1200 units, saga2.js), the same per-frame test is taken at every step, and
     the verdict is the margin at the MEDIAN step — the same "median, so one sample cannot
     fake it" the four points already used, applied across time. A real seam (~290) fails
     at every step; the worst step is printed beside it. */
  for (const scene of ['meadow', 'sunset', 'city']) {
    await mount(pg, scene, 'medium');
    const sweep = await pg.evaluate(async () => {
      const R = window._race; R.toStraight(90); R.setV(0); R.steerTo(0);
      const p0 = R.state().pos, out = [];
      const drawn = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
      for (let k = 0; k < 24; k++) {
        R.jump(p0 + k * 50); R.setV(0); await drawn();
        const s = R.state(), j = s.join, cv = document.querySelector('#gp-probe #sg-cv'), g = cv.getContext('2d');
        if (!j) { out.push(null); continue; }
        const px = (x, y) => { const d = g.getImageData(Math.round(x * s.dpr), Math.round(y * s.dpr), 1, 1).data; return [d[0], d[1], d[2]]; };
        const step = (y1, y2) => { const d = [-0.3, -0.2, 0.2, 0.3].map(k => { const x = j.x + k * j.w, a = px(x, y1), b = px(x, y2);
            return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]); }).sort((p, q) => p - q);
          return (d[1] + d[2]) / 2; };
        /* control: the same 6px step taken wholly inside the near road, just below the join —
           the light/dark bands and the fog alone make this much change */
        const med = step(j.y + 3, j.y - 3), ctl = step(j.y + 15, j.y + 9);
        out.push({ med, ctl, over: med - Math.max(45, ctl * 2) });
      }
      return out;
    });
    const got = sweep.filter(Boolean), by = got.slice().sort((p, q) => p.over - q.over);
    const mid = by[Math.floor((by.length - 1) / 2)], worst = by[by.length - 1];
    /* the seam this replaces was ~290 (82%-fogged tarmac against bare tarmac); a join that
       changes no more than the road already does a few pixels lower is not a seam */
    ok(got.length === sweep.length && mid && mid.over <= 0, mid ? `${scene}: no seam where the near road meets the far — ${mid.med} RGB across the join (the road itself: ${mid.ctl}; the old seam: ~290) at the median of ${got.length} parked steps through a band cycle; worst step ${worst.med} vs ${worst.ctl}` : `${scene}: no join measured`);
  }

  await b.close();
  ok(!errs.length, errs.length ? 'page errors: ' + errs[0] : 'no page errors');
  console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
  process.exit(fails ? 1 : 0);
})();
