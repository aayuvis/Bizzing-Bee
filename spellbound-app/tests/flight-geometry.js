/* Proves the collectible-placement invariant from the REAL constants in saga2.js, so a
   later retune of CFG cannot silently reintroduce "honey pot flush against a pillar". */
const fs=require('fs');
const src=fs.readFileSync(__dirname+'/../saga2.js','utf8');
const cfgLine=src.match(/const CFG=\{easy:\{gap:[\s\S]*?\}\[diff\];/)[0];
const CFG={}; for(const m of cfgLine.matchAll(/(easy|medium|hard|champ):\{gap:(\d+),speed:([\d.]+),pots:(\d+),every:([\d.]+)\}/g))
  CFG[m[1]]={gap:+m[2],speed:+m[3],pots:+m[4],every:+m[5]};
const TRAIL=+src.match(/const TRAIL=(\d+);/)[1];
const POT_R=+src.match(/Math\.abs\(bee\.y-\(pot\.y\+18\)\)<(\d+)/)[1];
const COIN_R=+src.match(/Math\.abs\(c\.y-bee\.y\)<(\d+)/)[1];
const ampX=src.match(/const amp=Math\.min\((\d+),Math\.max\((\d+),g\/2-(\d+)\)\)/);
const amp=(g)=>Math.min(+ampX[1],Math.max(+ampX[2],g/2-+ampX[3]));
let bad=0; const ok=(c,m)=>{ console.log((c?'  OK   ':'  FAIL ')+m); if(!c) bad++; };
console.log(`TRAIL=${TRAIL}px  potReach=${POT_R}  coinReach=${COIN_R}  amp=[${ampX[2]}..${ampX[1]}]\n`);
for(const [k,c] of Object.entries(CFG)){
  const half=c.gap/2;                       // corridor half-height around the gap centre
  const spacing=c.every*60*c.speed;         // px between towers at ~60fps
  ok(POT_R<=half, `${k.padEnd(6)} pot: bee reaches it at mid±${POT_R}, corridor is ±${half}`);
  ok(amp(c.gap)+COIN_R<=half, `${k.padEnd(6)} coins: furthest coin+reach = ±${amp(c.gap)+COIN_R}, corridor ±${half}`);
  ok(TRAIL<spacing, `${k.padEnd(6)} trail: ${TRAIL}px lands before the next tower at ${Math.round(spacing)}px`);
}
console.log(bad?`\n${bad} FAILED`:'\nall invariants hold across every difficulty');
process.exit(bad?1:0);
