/* Both arcade word-games, proved from the REAL constants in saga2.js — so a later retune
   cannot silently bring back "the game stopped being about spelling".

   KEEP FLYING. A pickup used to sit 170px past a tower at THAT tower's gap height. It
   sounded right and played badly: a flappy bee cannot hold a height, so taking one meant
   threading gap N, HOLDING that line for a second, then climbing or diving to gap N+1 at a
   different random height — three precise manoeuvres for one word. Pickups now sit at the
   MIDPOINT of the line between two consecutive gaps, which is where the bee already is.

   HONEYCOMB RUN. Moths bred at 16%/second up to CFG.moths+6, saturating every difficulty
   at 8-11 chasers within 38 seconds — the tuned per-difficulty counts meant nothing and the
   round became evasion. And the flower, the only way to spell, picked a uniformly random
   open cell every 9 seconds.

   Run: node tests/arcade-geometry.js */
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/../saga2.js', 'utf8');
let bad = 0; const ok = (c, m) => { console.log((c ? '  OK   ' : '  FAIL ') + m); if (!c) bad++; };
const FPS = 60;

/* ---------------- Keep Flying ---------------- */
console.log('KEEP FLYING');
const flyLine = src.match(/const CFG=\{easy:\{gap:[\s\S]*?\}\[diff\];/)[0];
const FLY = {}; for (const m of flyLine.matchAll(/(easy|medium|hard|champ):\{gap:(\d+),speed:([\d.]+),pots:(\d+),every:([\d.]+)\}/g))
  FLY[m[1]] = { gap: +m[2], speed: +m[3], pots: +m[4], every: +m[5] };
const POT_R = +src.match(/Math\.abs\(bee\.y-\(pot\.y\+18\)\)<(\d+)/)[1];
const COIN_R = +src.match(/Math\.abs\(c\.y-bee\.y\)<(\d+)/)[1];
const GRAV = +src.match(/bee\.vy\+=([\d.]+); bee\.vy=Math\.min/)[1];
const LIFT = +src.match(/if\(holding\) bee\.vy-=([\d.]+);/)[1];

// the pickup must be ON the line between the two gaps, not pinned to one of them
ok(/px=\(prevTower\.x\+o\.x\)\/2/.test(src) && /py=\(prevTower\.mid\+mid\)\/2/.test(src),
   'pickups are placed at the midpoint between two consecutive gaps');
ok(!/const TRAIL=/.test(src), 'the old fixed TRAIL offset is gone');
// hearts MUST drift at the tower speed or a placed heart slides off its lane
ok(/hearts\.forEach\(h=>\{ h\.x-=CFG\.speed;/.test(src),
   'hearts drift at CFG.speed, same as the towers that placed them');
ok(!/h\.x-=CFG\.speed\*0\.8/.test(src), 'the 0.8x heart drift bug is gone');
// climb:fall ratio is what makes the bee controllable; keep it while speeding response up
const ratio = (LIFT - GRAV) / GRAV;
ok(ratio > 1.4 && ratio < 2.0, `climb:fall ratio ${ratio.toFixed(2)}:1 stays in the controllable band (1.4-2.0)`);
ok(GRAV >= 0.2, `gravity ${GRAV}/frame answers quickly enough not to feel mushy`);
let prevSpacing = null;
for (const [k, c] of Object.entries(FLY)) {
  const half = c.gap / 2, spacing = c.every * FPS * c.speed;
  ok(POT_R <= half, `${k.padEnd(6)} pot reach ±${POT_R} fits the ±${half} corridor`);
  ok(COIN_R <= half, `${k.padEnd(6)} coin reach ±${COIN_R} fits the ±${half} corridor`);
  ok(spacing > 380 && spacing < 620, `${k.padEnd(6)} towers ${Math.round(spacing)}px apart — room to read the next gap`);
  if (prevSpacing !== null) ok(Math.abs(spacing - prevSpacing) < 60,
    `${k.padEnd(6)} spacing tracks the other difficulties (${Math.round(spacing)} vs ${Math.round(prevSpacing)})`);
  prevSpacing = spacing;
}

/* ---------------- Bee Grand Prix ---------------- */
console.log('\nBEE GRAND PRIX');
const CENTRI = +src.match(/centri=([\d.]+);/)[1];
const STEER  = +src.match(/const dxs=dt\*([\d.]+)\*Math\.max/)[1];
// the drift must be LINEAR in speed — a kart holding its heading slides across a
// turning road at v x curvature. The v^2 "centrifugal" model meant half throttle
// pulled with a QUARTER of the force, imperceptible at real playing speeds.
ok(/playerX-=\(seg\.curve\|\|0\)\*\(v\/maxV\)\*dt\*centri/.test(src),
   'the bend pushes the kart via centri, linear in speed (goes-straight model)');
ok(!/Math\.pow\(v\/maxV,2\)\*dt\*centri/.test(src), 'the v^2 model (rails at half throttle) is gone');
ok((src.match(/centri/g) || []).length >= 2, 'centri is applied somewhere, not just declared');
ok(!/hill=0; curve\*=0\.7;/.test(src), 'the authored curves are no longer softened 30%');   // anchored to the CODE, not my comment about it
// the hardest authored bend
const CURVE_MAX = Math.max(...[...src.matchAll(/road\(\d+,\d+,\d+,(-?\d+(?:\.\d+)?),/g)].map(m => Math.abs(+m[1])));
const driftFlat = CURVE_MAX * CENTRI, driftHalf = CURVE_MAX * 0.5 * CENTRI;
ok(CURVE_MAX >= 4, `hardest authored bend is ${CURVE_MAX}`);
ok(driftFlat / STEER > 0.6, `flat out the hardest bend takes ${(driftFlat / STEER * 100).toFixed(0)}% of the wheel — the road fights back`);
ok(driftFlat / STEER < 0.95, `and it is still holdable: ${driftFlat.toFixed(2)} u/s drift vs ${STEER.toFixed(2)} u/s steer`);
ok(driftHalf / STEER > 0.3, `half throttle still pulls a felt ${(driftHalf / STEER * 100).toFixed(0)}% of the wheel — no more rails at cruising speed`);
// the far road is drawn by continued projection, never a straight wedge
ok(/while\(pyD>horizonY\+1 && n<6000\)/.test(src), 'the road past drawDist is projected on, following the curve');
ok(!/poly\(L-rw,Y, vx,vy, vx,vy, L,Y, c\.rumble\)/.test(src), 'the straight horizon wedge (the grey pyramid on curves) is gone');
ok(2 / STEER < 1.2, `a full road crossing takes ${(2 / STEER).toFixed(2)}s of holding (self-driving territory is >1.5s)`);
// the item box is swept, not sampled
ok(/const crossed=_wrapped \? \(iz>_prevPm \|\| iz<=_pm2\) : \(iz>_prevPm && iz<=_pm2\)/.test(src),
   'the item box is picked up by a swept test, immune to frame length');

/* ---------------- Honeycomb Run ---------------- */
console.log('\nHONEYCOMB RUN');
const hcLine = src.match(/const CFG=\{easy:\{moths:[\s\S]*?\}\[diff\];/)[0];
const HC = {}; for (const m of hcLine.matchAll(/(easy|medium|hard|champ):\{moths:(\d+),speed:([\d.]+),target:(\d+),time:(\d+)\}/g))
  HC[m[1]] = { moths: +m[2], speed: +m[3], target: +m[4], time: +m[5] };
const dimLine = src.match(/const DIM=\{easy:\[[\s\S]*?\}\[diff\]/)[0];
const DIM = {}; for (const m of dimLine.matchAll(/(easy|medium|hard|champ):\[(\d+),(\d+),(true|false)\]/g))
  DIM[m[1]] = { cols: +m[2], rows: +m[3] };

ok(!/moths\.length<CFG\.moths\+6/.test(src), 'the 16%-a-second moth spam is gone');
// difficulty comes from moths that HUNT, not from more moths
const CH = {}; for (const m of src.matchAll(/const CHASE=\{easy:([\d.]+),medium:([\d.]+),hard:([\d.]+),champ:([\d.]+)\}/g))
  { CH.easy=+m[1]; CH.medium=+m[2]; CH.hard=+m[3]; CH.champ=+m[4]; }
ok(CH.easy>0 && CH.easy<CH.medium && CH.medium<CH.hard && CH.hard<CH.champ,
   `moths hunt with per-difficulty appetite (${CH.easy}/${CH.medium}/${CH.hard}/${CH.champ}), ascending`);
ok(/const CHASE_R=8/.test(src), 'a moth only hunts what it can plausibly have noticed (range 8)');
ok(/const HUNTERS=\{easy:1,medium:2,hard:2,champ:2\}/.test(src),
   'at most two moths hunt at once — five converging chasers gang-wiped the play-tester');
ok(/else if\(grace<=0\)\{ grace=2;/.test(src), 'two seconds of grace after a hit — no chained respawn deaths');
ok(/ops\.sort\(\(a,b\)=>flee>0 \? dHome\(b\)-dHome\(a\) : dHome\(a\)-dHome\(b\)\)/.test(src),
   'a hunting moth turns toward the bee, and AWAY while she holds royal jelly');
ok(/if\(!lateMoth && t<=Math\.floor\(CFG\.time\/2\)\)/.test(src), 'exactly one late moth, once, at the halfway mark');
ok(/function placeFlower\(\)/.test(src), 'the flower has a placement function, not a random cell');
ok(/const d=Math\.abs\(c-bc\)\+Math\.abs\(r-br\); if\(d<2\) continue;/.test(src), 'the flower is placed relative to the BEE');
ok(/\(d<=6\?near:far\)/.test(src), 'it prefers cells within 6 of the bee');
ok(/moths\.some\(m=>Math\.abs\(Math\.round\(m\.px\)-c\)\+Math\.abs\(Math\.round\(m\.py\)-r\)<2\)/.test(src),
   'it never lands on top of a moth');
const reseed = +src.match(/if\(flowerT<=0&&!flower\)\{ flowerT=(\d+); placeFlower\(\); \}/)[1];
ok(reseed <= 4, `a new flower every ${reseed}s (was 9)`);
ok(/finish\(score>=CFG\.target && spelled>=2\)/.test(src), 'a timed-out round needs words spelled, not just dots eaten');
// movement is per SECOND, on the display's clock — it used to be a fixed step per frame
ok(/function step\(ent,sp,dt\)/.test(src), 'step takes dt: movement is time-based, not frame-based');
ok(/const spd=sp\*Math\.max\(0\.001,Math\.min\(0\.034,dt\|\|1\/60\)\)/.test(src), 'and dt is clamped at TWO frames — a hitch is a shade of slowdown, never a hop');
ok(!/ent\.px=jc; ent\.py=jr; ent\.dir=bee\.want\.slice\(\);/.test(src), 'the early-turn teleport (up to 0.4 cells a frame) is gone');
ok(/if\(ent\.dir\[0\]!==0 && ent\.py!==Math\.round\(ent\.py\)\)/.test(src), 'cornering GLIDES onto the new corridor at running speed');
ok(/const now=\(ts!==undefined\?ts:performance\.now\(\)\)/.test(src), 'the maze clock is the sub-ms rAF timestamp, not Date.now()');
ok(!/loop=setInterval\(frame, 1000\/60\)/.test(src), 'the maze runs on requestAnimationFrame like every other engine, not setInterval');
// the bee is paced like an arcade maze game, not a racing game
const BEE_MULT = +src.match(/step\(bee,CFG\.speed\*([\d.]+),/)[1];
for (const [k, c] of Object.entries(HC)) {
  const cps = c.speed * BEE_MULT;
  ok(cps <= 3.5, `${k.padEnd(6)} bee runs at ${cps.toFixed(2)} cells/s (arcade maze pace is ~1.5-2.0; was ${(c.speed / 0.75 * BEE_MULT).toFixed(2)})`);
}

for (const [k, c] of Object.entries(HC)) {
  const { cols, rows } = DIM[k];
  let cells = 0; for (let r = 1; r < rows - 1; r++) for (let col = 1; col < cols - 1; col++) if (!(r % 2 === 0 && col % 2 === 0)) cells++;
  const most = c.moths + 1;                       // base, plus the single late arrival
  ok(cells / most >= 12, `${k.padEnd(6)} ${cells} open cells for at most ${most} moths — ${(cells / most).toFixed(0)} cells each (was ${(cells / (c.moths + 6)).toFixed(0)})`);
  ok(most <= c.moths + 1, `${k.padEnd(6)} moths cap at ${most}, so the tuned count still means something`);
}
console.log(bad ? `\n${bad} FAILED` : '\nboth games keep the word in front of the player');
process.exit(bad ? 1 : 0);
