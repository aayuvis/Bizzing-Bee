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
// and prevTower must be the LIVE tower object: a snapshot {x:Wd+30} goes stale as towers
// drift, which put the "midpoint" exactly ON the next pillar (the pot-in-the-wall bug, twice)
ok(/prevTower=o; \}/.test(src) && !/prevTower=\{x:/.test(src),
   'prevTower holds the live tower object, so its x drifts with the world');
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
const STEER  = +src.match(/const dxs=dt\*([\d.]+)\*Math\.max/)[1];
/* THE PUSH HAS NO MEMORY — AND IS STRONG ENOUGH THAT IT DOESN'T NEED ONE.
   History, because this has swung twice. Two memoryless models were weak enough that a
   kart pendulumed across the alternating bends and never left the road ("it drives
   itself"). The fix was a slide WITH memory (2.4s half-life), which then carried each
   bend's push onto the next straight: an unsteered kart moved 0.17 road-half-widths a
   second on straights, and kept sliding after stopping in the grass ("the car is
   veering in all random directions"). The answer to the pendulum was never memory — it
   was strength. PULL is set so hands-off leaves the road at the first bend on medium,
   and the push is the bend under the kart NOW. tests/gp-handling.cjs checks it live. */
ok(/push=\(seg\.curve\|\|0\)\*vf\*vf\*PULL;/.test(src), 'the push is the bend under the kart now, times speed squared');
ok(/playerX-=push\*dt;/.test(src), 'and it is applied as it is — nothing accumulates');
ok(!/DRIFT_HALF|GRIP_HALF|SPEED_BITE|drift\+=/.test(src), 'the slide-with-memory model is gone, all of it');

ok(!/hill=0; curve\*=0\.7;/.test(src), 'the authored curves are no longer softened 30%');   // anchored to the CODE, not my comment about it
const CURVE_MAX = Math.max(...[...src.matchAll(/road\(\d+,\d+,\d+,(-?\d+(?:\.\d+)?),/g)].map(m => Math.abs(+m[1])));
ok(CURVE_MAX >= 4, `hardest authored bend is ${CURVE_MAX}`);
/* SPEED HAS TO COST SOMETHING. With steering linear in v and a push linear in v their
   ratio was constant — flat out was exactly as easy as crawling. The push is SQUARED in
   v, so lifting is the answer to a corner: at 80% speed it pulls a third less. Per
   difficulty, because the ladder is the product. On the tightest bend flat out: */
const PULLS = [...src.matchAll(/pull:([\d.]+)\}/g)].map(m => +m[1]);
ok(PULLS.length === 4, `every difficulty names its own pull (${PULLS.join(' / ')})`);
ok(PULLS.every((b, i) => i === 0 || b > PULLS[i - 1]), 'and the pull rises with the difficulty, in order');
const lock = PULLS.map(p => CURVE_MAX * p / STEER);
ok(lock[0] < 0.85, `easy holds the tightest bend flat out at ${Math.round(lock[0] * 100)}% of full lock`);
ok(lock[3] > 1.15, `champ cannot — ${Math.round(lock[3] * 100)}% of the wheel, so it needs the brake`);
/* a lift is not quite enough there (80% speed: 1.82 of push against 1.76 of wheel) — that
   bend is what the brake is for, and a third of a second on it (to 70%) answers it */
ok(CURVE_MAX * PULLS[3] * 0.49 < STEER * 0.7, `and braking to 70% brings even champ's tightest bend back inside the wheel (${(CURVE_MAX * PULLS[3] * 0.49).toFixed(2)} vs ${(STEER * 0.7).toFixed(2)})`);
/* not self-driving: the displacement a medium curve-3 bend gives an unsteered kart, flat
   out — enter (16, ∫p² = 1/3), hold 22, leave (16, ∫ = 1/2) — must clear the road's half-width */
const bend3 = 3 * (16 / 3 + 22 + 16 / 2) / 46 * PULLS[1];
ok(bend3 > 0.95, `hands off, one medium curve-3 bend carries the kart ${bend3.toFixed(2)} sideways — off a 0.95 road`);

/* A BRAKE EXISTS, ON BOTH INPUTS. Without one a bend can only be a steering-hold test:
   there is no way to answer a corner, so making one bite just makes it unfair. */
ok(/k==='ArrowDown'\|\|k==='s'\)\{ e\.preventDefault\(\); brakeOn/.test(src), 'the brake is on the keyboard');
ok(/class="sg-sbtn sg-brake" id="sg-brk"/.test(src), 'and under a thumb, between the two steering buttons');
ok(/v=Math\.max\(maxV\*0\.34, v-\(maxV\/1\.05\)\*dt\)/.test(src), 'braking sheds real speed — and speed is what the push squares');

/* THE WHEEL IS WHAT IS HELD. Every input registers in one Map and every way it can end
   removes it — including pointercancel, which nothing used to listen for. */
ok(/\['pointerup','pointercancel','lostpointercapture'\]/.test(src), 'a touch ends on up, cancel OR lost capture');
ok(/const press=\(id,d\)=>\{ wheel\.delete\(id\); wheel\.set\(id,d\); reSteer\(\); \}/.test(src), 'the last input pressed wins while others are still held');
ok(/addEventListener\('blur',letGo\)/.test(src), 'losing focus lets go of the wheel');

/* THE CAMERA FOLLOWS — MOST OF THE WAY, ALMOST AT ONCE. Welded to the kart it re-centred
   a kart on the grass onto a road it had left; lagging at 0.55 / 0.30s it made the kart
   swim across the screen for most of a second after every input. */
const CAM_FOLLOW = +src.match(/CAM_FOLLOW=([\d.]+)/)[1];
const CAM_HALF = +src.match(/CAM_HALF=([\d.]+)/)[1];
ok(CAM_FOLLOW < 1 && CAM_FOLLOW >= 0.8, `the camera takes most of the kart's offset (${CAM_FOLLOW}) — a kart on the grass is still drawn on the grass`);
ok(CAM_HALF <= 0.12, `and catches up in ${CAM_HALF}s, so nothing glides after you let go`);
ok(/const camX=camLag\*roadW/.test(src), 'and the camera rides camLag, not playerX');
ok(/const px=Wd\/2 \+ \(playerX-camLag\)\*hwK;/.test(src) && /const hwAt=y=>\(\(y-horizonY\)\*2\/\(camH\*Ht\)\)\*roadW\*Wd\/2;/.test(src),
  'the kart is drawn at its real offset, measured in the road\'s own projection');
// the far road is drawn by continued projection, never a straight wedge
ok(/while\(pyD>horizonY\+1 && n<6000\)/.test(src), 'the road past drawDist is projected on, following the curve');
ok(!/poly\(L-rw,Y, vx,vy, vx,vy, L,Y, c\.rumble\)/.test(src), 'the straight horizon wedge (the grey pyramid on curves) is gone');
ok(2 / STEER < 1.2, `a full road crossing takes ${(2 / STEER).toFixed(2)}s of holding (self-driving territory is >1.5s)`);
/* THE KART IS DRAWN, SEATED, AND IT TURNS. A painted sprite had a helmeted driver baked in
   under the player's avatar (two drivers), and steering rotated the whole card. */
ok(!/drawKart\(|sgTexPreload\(\[KART/.test(src), 'no painted kart sprite is loaded or drawn — the karts come from SB_KART_ART');
const kd = src.slice(src.indexOf('function kartDraw('), src.indexOf('function kartThumb('));
ok(kd.indexOf('c.drawImage(s.driver') > 0 && kd.indexOf('c.drawImage(s.driver') < kd.indexOf('c.fillStyle=G.seat') && kd.indexOf('c.fillStyle=G.seat') < kd.indexOf('c.fillStyle=G.tub'),
  'the driver is drawn before the seat back and the body, so they sit IN the kart');
ok(/kartDraw\(cx,px,py,pw,\{style:KART,[^}]*yaw:yawS/.test(src) && !/cx\.rotate\(steer\*/.test(src), 'the player\'s kart YAWS into a turn; nothing rotates the picture');
ok(/pw=hwK\*KART_W;/.test(src) && /kw=w\*\(KART_W\/0\.11\)/.test(src), 'you and the rivals are drawn at one scale, so a kart alongside is your size');
/* THE KART'S SIZE IS A CONSTANT. It came from _nearW, the nearest road band's width, which
   steps every time a band scrolls past (46 a second flat out): the kart grew and snapped
   back 4.5% per band — "the car is shaking". It comes from the exact road width at its
   ground line now. tests/gp-world.cjs measures it frame to frame. */
ok(!/_nearW\s*=/.test(src) && !/let _nearW/.test(src), 'nothing sizes the kart from a road band any more');
/* A RIVAL IS DRAWN WHERE IT IS — interpolated inside its band, not snapped to the band's
   near edge, which made rivals hop a band at a time. */
ok(/const f=\(zm-si\*segLen\)\/segLen, a=seg\.p1\.camera, b=seg\.p2\.camera/.test(src), 'rivals are placed inside their road band, not snapped to its edge');

// the item box is swept, not sampled
ok(/const crossed=_wrapped \? \(iz>_prevPm \|\| iz<=_pm2\) : \(iz>_prevPm && iz<=_pm2\)/.test(src),
   'the item box is picked up by a swept test, immune to frame length');

/* ---------------- Honeycomb Run ----------------
   REWRITTEN 4 Oct 2026 (games spec §4.6), deliberately: the round is now four gates to the
   hive on the shared fixed-step clock, so three checks that pinned the OLD behaviour changed —
   "a timed-out round needs two words" (a time-out now simply loses: the hive is the only win),
   "the maze clock is the rAF timestamp" (the clock is the shared loop; the ROUND clock reads the
   frame's own timestamp), and the CFG shape (moths have their own speed, the clock is per level).
   Every check that still describes the game is kept as it was. The live behaviour is held by
   tests/arcade-honeycomb.cjs. */
console.log('\nHONEYCOMB RUN');
const hcEng = src.slice(src.indexOf('function honeycombRun('), src.indexOf('/* ---------- ENGINE B'));
const hcLine = hcEng.match(/const CFG=calmCFG\(\{easy:\{moths:[\s\S]*?\}\[diff\]/)[0];
const HC = {}; for (const m of hcLine.matchAll(/(easy|medium|hard|champ):\{moths:(\d+),speed:([\d.]+),moth:([\d.]+),time:(\d+)\}/g))
  HC[m[1]] = { moths: +m[2], speed: +m[3], moth: +m[4], time: +m[5] };
const dimLine = hcEng.match(/const DIM=\{easy:\[[\s\S]*?\}\[diff\]/)[0];
const DIM = {}; for (const m of dimLine.matchAll(/(easy|medium|hard|champ):\[(\d+),(\d+),(true|false)\]/g))
  DIM[m[1]] = { cols: +m[2], rows: +m[3] };
const LV = ['easy', 'medium', 'hard', 'champ'];
ok(LV.every(k => HC[k] && DIM[k]), 'all four levels configured');

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
ok(/if\(!lateMoth && t<=CFG\.time\/2\)/.test(hcEng), 'exactly one late moth, once, at the halfway mark');
ok(/function placeFlower\(\)/.test(hcEng), 'the bonus flower has a placement function, not a random cell');
ok(/const d=Math\.abs\(c-bc\)\+Math\.abs\(r-br\); if\(d<2\) continue;/.test(hcEng), 'it is placed relative to the BEE');
ok(/\(d<=6\?near:far\)/.test(hcEng), 'it prefers cells within 6 of the bee');
ok(/moths\.some\(m=>Math\.abs\(Math\.round\(m\.px\)-c\)\+Math\.abs\(Math\.round\(m\.py\)-r\)<2\)/.test(hcEng),
   'it never lands on top of a moth');
ok(!/flower=pool\[Math\.floor\(Math\.random/.test(hcEng), 'and it is picked by a fixed stride, not a dice roll');
const reseed = +hcEng.match(/if\(flowerT<=0&&!flower\)\{ flowerT=(\d+); placeFlower\(\); \}/)[1];
ok(reseed <= 4, `a new bonus flower every ${reseed}s (was 9)`);
// THE WIN: the hive, through four gates — never the dots, never the clock
const wins = [...hcEng.matchAll(/finish\(true/g)].length;
ok(wins === 1 && /if\(bc===HIVE\.c && br===HIVE\.r && G\.every\(g=>g\.open\)\)\{ over=true; finish\(true,'home'\)/.test(hcEng),
   'the ONLY win is the bee in the hive with every gate open');
ok(!/if\(dots<=0\)/.test(hcEng), 'clearing the dots wins nothing (it used to end the round as a win)');
ok(/const LIVES=3, GATES=4;/.test(hcEng), 'three lives on every level, four gates');
ok(LV.every((k, i) => i === 0 || HC[k].time < HC[LV[i - 1]].time) && HC.easy.time === 180 && HC.champ.time === 120,
   `a fixed clock per level, Easy 3:00 down to Champ 2:00 (${LV.map(k => HC[k].time).join('/')} s)`);
ok(!/t\+=15/.test(hcEng), 'a word adds score, never time — a good speller\'s round still ends');
ok(LV.every((k, i) => i === 0 || (HC[k].moth > HC[LV[i - 1]].moth && HC[k].moth / HC[k].speed > HC[LV[i - 1]].moth / HC[LV[i - 1]].speed)),
   `moths chase faster per level, and gain on the bee (${LV.map(k => (HC[k].moth / (HC[k].speed * 1.25)).toFixed(2)).join(' / ')} of her speed)`);
// movement is per SECOND, on the shared clock — it used to be a fixed step per frame
ok(/function step\(ent,sp,dt\)/.test(hcEng), 'step takes dt: movement is time-based, not frame-based');
ok(/const spd=sp\*Math\.max\(0\.001,Math\.min\(0\.034,dt\|\|1\/60\)\)/.test(hcEng), 'and dt is clamped at TWO frames — a hitch is a shade of slowdown, never a hop');
ok(!/ent\.px=jc; ent\.py=jr; ent\.dir=bee\.want\.slice\(\);/.test(hcEng), 'the early-turn teleport (up to 0.4 cells a frame) is gone');
ok(/if\(ent\.dir\[0\]!==0 && ent\.py!==Math\.round\(ent\.py\)\)/.test(hcEng), 'cornering GLIDES onto the new corridor at running speed');
ok(/const loop=AK\.loop\(update,/.test(hcEng) && !/setInterval\(/.test(hcEng), 'the maze runs on the shared fixed-step clock (sgLoop), never setInterval');
ok(/document\.timeline&&document\.timeline\.currentTime/.test(hcEng), 'the round clock reads the frame\'s own timestamp, capped like the shared clock');
// the bee is paced like an arcade maze game, not a racing game
const BEE_MULT = +hcEng.match(/step\(bee,CFG\.speed\*([\d.]+),/)[1];
for (const [k, c] of Object.entries(HC)) {
  const cps = c.speed * BEE_MULT;
  ok(cps <= 3.5, `${k.padEnd(6)} bee runs at ${cps.toFixed(2)} cells/s (arcade maze pace is ~1.5-2.0)`);
}
for (const [k, c] of Object.entries(HC)) {
  const { cols, rows } = DIM[k];
  const MC = (cols - 1) / 2, MR = (rows - 1) / 2;
  ok(MC % 2 === 0 && MR % 2 === 0, `${k.padEnd(6)} ${cols}x${rows}: the zone walls sit on pillar lines, so every zone is connected inside`);
  let cells = 0; for (let r = 1; r < rows - 1; r++) for (let col = 1; col < cols - 1; col++) if (!(r % 2 === 0 && col % 2 === 0) && r !== MR && col !== MC) cells++;
  const most = c.moths + 1;                       // base, plus the single late arrival
  ok(cells / most >= 12, `${k.padEnd(6)} ${cells} open cells for at most ${most} moths — ${(cells / most).toFixed(0)} cells each`);
}
console.log(bad ? `\n${bad} FAILED` : '\nboth games keep the word in front of the player');
process.exit(bad ? 1 : 0);
