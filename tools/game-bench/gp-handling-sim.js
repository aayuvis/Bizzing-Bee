/* Grand Prix lateral handling — offline simulator. Where the `pull` numbers came from.

   Re-derive, don't guess: run it after touching PULL, the steering rate, the brake or the
   track's SECTORS, and copy what it prints into the comments that quote it
   (spellbound-app/saga2.js above `push=`, and CLAUDE.md).

     node tools/game-bench/gp-handling-sim.js            # the shipped ladder
     node tools/game-bench/gp-handling-sim.js --memory   # the 2.4s-slide model it replaced

   The track is rebuilt from the same road(enter, hold, leave, curve) calls as saga2.js;
   if SECTORS changes there, change it here. Drivers:
     handsOff  never steers — must end up on the grass (not self-driving)
     kid       sees the kart 300ms late, steers back only past |x|>0.32, lets go near the
               middle, never anticipates a bend and never brakes — a child, not a bot
     slowkid   the same at 450ms                                                        */
const segLen = 200, maxV = segLen * 46, accel = maxV / 4.6, STEER = 2.2;
const LEN = { easy: 1800, medium: 2300, hard: 2800, champ: 3300 };
const PULL = { easy: 0.33, medium: 0.46, hard: 0.52, champ: 0.57 };
const BITE = { easy: 1.35, medium: 2.10, hard: 2.90, champ: 3.60 };   // --memory only
const MEMORY = process.argv.includes('--memory');

function track(len) {
  const segs = [], eI = (a, b, p) => a + (b - a) * p * p, eIO = (a, b, p) => a + (b - a) * (-Math.cos(p * Math.PI) / 2 + 0.5);
  const road = (e, h, l, c) => { for (let i = 0; i < e; i++) segs.push(eI(0, c, i / e)); for (let i = 0; i < h; i++) segs.push(c); for (let i = 0; i < l; i++) segs.push(eIO(c, 0, i / l)); };
  const S = [() => { road(20, 24, 20, 0); road(16, 22, 16, -3); road(16, 26, 16, 0); }, () => { road(16, 22, 16, 4); road(14, 18, 14, 2); road(18, 28, 18, -4); },
    () => { road(16, 22, 16, 0); road(22, 28, 22, 0); road(14, 20, 14, -2); }, () => { road(16, 20, 16, 3); road(18, 24, 18, -5); road(20, 26, 20, 0); },
    () => { road(14, 18, 14, 5); road(16, 22, 16, 0); road(18, 24, 18, 2); }];
  let i = 0; while (segs.length < len) { S[i % 5](); i++; } return segs;
}
function race(diff, driver, react) {
  const segs = track(LEN[diff]), dt = 1 / 60, T = segs.length * segLen * 2;
  let pos = 0, x = 0, v = 0, t = 0, off = 0, steer = 0, drift = 0, firstOff = null, straightMove = 0, straightT = 0;
  const hist = [];
  while (pos < T && t < 400) {
    const c = segs[Math.floor(pos / segLen) % segs.length], vf = v / maxV, x0 = x;
    hist.push(x); steer = driver(hist[Math.max(0, hist.length - 1 - Math.round(react / dt))], steer);
    x += steer * dt * STEER * Math.max(0.42, vf);
    if (MEMORY) { drift += c * vf * (1 + BITE[diff] * vf * vf) * dt * 0.30;
      drift *= Math.pow(0.5, dt / ((steer !== 0 && steer * drift > 0) ? 0.55 : 2.4)); x -= drift * dt; }
    else x -= c * vf * vf * PULL[diff] * dt;
    x = Math.max(-1.2, Math.min(1.2, x));
    if (c === 0 && steer === 0) { straightMove += Math.abs(x - x0); straightT += dt; }
    if (Math.abs(x) > 0.95) { off += dt; if (firstOff === null) firstOff = t; v = Math.max(0, v - (maxV / 0.9) * dt); }
    else v = Math.min(maxV, v + accel * dt);
    pos += v * dt; t += dt;
  }
  return { grass: (100 * off / t).toFixed(1) + '%', firstGrass: firstOff === null ? '-' : firstOff.toFixed(1) + 's',
           straightDrift: straightT ? (straightMove / straightT).toFixed(2) : '-' };
}
const handsOff = () => 0;
const kid = (x, s) => { if (x > 0.32) return -1; if (x < -0.32) return 1; if (Math.abs(x) < 0.08) return 0; return s; };
console.log(MEMORY ? 'MODEL: slide with memory (replaced 30 Sep 2026)' : 'MODEL: memoryless push = curve x vf^2 x pull');
for (const d of ['easy', 'medium', 'hard', 'champ']) {
  const h = race(d, handsOff, 0.3), k = race(d, kid, 0.3), s = race(d, kid, 0.45);
  console.log(`${d.padEnd(7)} hands-off first grass ${h.firstGrass.padStart(6)}  |  kid on grass ${k.grass.padStart(6)} (straight drift ${k.straightDrift}/s)  |  slow kid ${s.grass.padStart(6)}`);
}
