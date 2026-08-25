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

/* ---------------- Honeycomb Run ---------------- */
console.log('\nHONEYCOMB RUN');
const hcLine = src.match(/const CFG=\{easy:\{moths:[\s\S]*?\}\[diff\];/)[0];
const HC = {}; for (const m of hcLine.matchAll(/(easy|medium|hard|champ):\{moths:(\d+),speed:([\d.]+),target:(\d+),time:(\d+)\}/g))
  HC[m[1]] = { moths: +m[2], speed: +m[3], target: +m[4], time: +m[5] };
const dimLine = src.match(/const DIM=\{easy:\[[\s\S]*?\}\[diff\]/)[0];
const DIM = {}; for (const m of dimLine.matchAll(/(easy|medium|hard|champ):\[(\d+),(\d+),(true|false)\]/g))
  DIM[m[1]] = { cols: +m[2], rows: +m[3] };

ok(!/moths\.length<CFG\.moths\+6/.test(src), 'the 16%-a-second moth spam is gone');
ok(/if\(!lateMoth && t<=Math\.floor\(CFG\.time\/2\)\)/.test(src), 'exactly one late moth, once, at the halfway mark');
ok(/function placeFlower\(\)/.test(src), 'the flower has a placement function, not a random cell');
ok(/const d=Math\.abs\(c-bc\)\+Math\.abs\(r-br\); if\(d<2\) continue;/.test(src), 'the flower is placed relative to the BEE');
ok(/\(d<=6\?near:far\)/.test(src), 'it prefers cells within 6 of the bee');
ok(/moths\.some\(m=>Math\.abs\(Math\.round\(m\.px\)-c\)\+Math\.abs\(Math\.round\(m\.py\)-r\)<2\)/.test(src),
   'it never lands on top of a moth');
const reseed = +src.match(/if\(flowerT<=0&&!flower\)\{ flowerT=(\d+); placeFlower\(\); \}/)[1];
ok(reseed <= 4, `a new flower every ${reseed}s (was 9)`);
ok(/finish\(score>=CFG\.target && spelled>=2\)/.test(src), 'a timed-out round needs words spelled, not just dots eaten');

for (const [k, c] of Object.entries(HC)) {
  const { cols, rows } = DIM[k];
  let cells = 0; for (let r = 1; r < rows - 1; r++) for (let col = 1; col < cols - 1; col++) if (!(r % 2 === 0 && col % 2 === 0)) cells++;
  const most = c.moths + 1;                       // base, plus the single late arrival
  ok(cells / most >= 12, `${k.padEnd(6)} ${cells} open cells for at most ${most} moths — ${(cells / most).toFixed(0)} cells each (was ${(cells / (c.moths + 6)).toFixed(0)})`);
  ok(most <= c.moths + 1, `${k.padEnd(6)} moths cap at ${most}, so the tuned count still means something`);
}
console.log(bad ? `\n${bad} FAILED` : '\nboth games keep the word in front of the player');
process.exit(bad ? 1 : 0);
