/* BEE GRAND PRIX — THE RULES ARE TABLES, AND NOTHING IN THEM ROLLS A DIE.   @check

   Games spec §2.4 (4 Oct 2026): a box spelled right gives the power-up for YOUR PLACE at the box,
   full strength when it was Clean (right inside par, 1.2s + 0.45s a letter) and standard when
   it was merely Right; a miss gives nothing. Three Clean in a row add a free Turbo. The owner's
   choice (FAMILY-STANDARD: nothing random) is the deterministic table, so:

     GP4  no Math.random() in the grade, the power-up choice, the power-ups themselves, the combo,
          the pay path (payG / addCoins) or the finish's coins — read from the source;
     GP5  the power-up for every place and both grades is the §2.4 table, at the §2.4 strengths —
          run from the real helper block of saga2.js, not a copy of it.

   The live half of GP5 (a real box, a real place, the slot) is in tests/gp-race.cjs.
   Proved by breaking (4 Oct 2026), each put back and the file cmp'd: Math.random in
   gpPowerFor → GP4 fails; 2nd → 'gust' → GP5 fails; turbo full ×1.4 → GP5 fails; par 0.5s a
   letter → the grade check fails; COMBO 2 → fails.
   Run: node tests/gp-rules.cjs                                                             */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const src = fs.readFileSync(path.join(ROOT, 'saga2.js'), 'utf8');
const app3 = fs.readFileSync(path.join(ROOT, 'app3.js'), 'utf8');
if (/^\S{2000,}/m.test(src.slice(0, 5000))) { console.log('  --   minified tree: gp-rules reads source text, skipped'); process.exit(0); }

/* the body of a named function (declaration or arrow const), by brace matching */
function body(text, name) {
  let i = text.search(new RegExp('function ' + name + '\\s*\\(')); if (i < 0) i = text.search(new RegExp('const ' + name + '\\s*=')); if (i < 0) return null;
  const open = text.indexOf('{', i); let d = 0;
  for (let k = open; k < text.length; k++) { if (text[k] === '{') d++; else if (text[k] === '}') { d--; if (!d) return text.slice(i, k + 1); } }
  return null;
}

/* ---------------- GP4: nothing random where a reward is decided ---------------- */
const engine = body(src, 'beeGrandPrix');
ok(!!engine, 'the engine is in saga2.js');
const parts = {
  'the grade (gpGrade)': body(src, 'gpGrade'),
  'the power-up choice (gpPowerFor)': body(src, 'gpPowerFor'),
  'the box (spellGate: grade, power-up, payG, combo)': engine && body(engine, 'spellGate'),
  'the power-ups themselves (usePower)': engine && body(engine, 'usePower'),
  'a power-up landing (hitWith)': engine && body(engine, 'hitWith'),
  'firing the slot (fireHeld)': engine && body(engine, 'fireHeld'),
  'the finish (coins, contest, level)': engine && body(engine, 'finish'),
  'payG (app3)': body(app3, 'payG'),
  'addCoins (app3)': body(app3, 'addCoins'),
};
for (const [k, b] of Object.entries(parts)) ok(!!b && !/Math\.random/.test(b), `${k}: ${b ? (/Math\.random/.test(b) ? 'calls Math.random' : 'no Math.random') : 'NOT FOUND'}`);
/* the rivals' power-ups are the same table on a count, and the boxes are placed from the track's seed */
const rivalPw = engine && (engine.match(/a rival's box:[\s\S]{0,700}?usePower\(id,false,r\)/) || [''])[0];
ok(!!rivalPw && !/Math\.random/.test(rivalPw) && /Math\.floor\(r\.zk\*r\.pw\)/.test(rivalPw), 'a rival earns a power-up every 1/pw boxes, by the same table — counted, not rolled');
const boxes = engine && (engine.match(/const items=\[\];[^\n]*\n[^\n]*\n/) || [''])[0];
ok(!!boxes && !/Math\.random/.test(boxes), 'the box zones are placed by design (three across, the racing line in the middle), not at random');

/* ---------------- GP5: the §2.4 table, run from the real helper block ---------------- */
const a = src.indexOf('/* ===== BEE GRAND PRIX — THE RULES THAT ARE NOT THE ROAD'), z = src.indexOf('/* THE GARAGE:', a);
ok(a > 0 && z > a, 'the rules block is where the engine reads it');
const R = new Function('W', 'esc2', src.slice(a, z) + '\nreturn {gpGrade,gpPowerFor,GP_STR,GP_PAR,GP_COMBO,GP_TABLE,GP_CUP};')(() => ({}), x => x);
const want = ['shield', 'oil', 'gust', 'turbo', 'rocket'];
const got = [1, 2, 3, 4, 5].map(p => R.gpPowerFor(p, 5, 0));
ok(JSON.stringify(got) === JSON.stringify(want), `by place 1st→5th: ${got.join(', ')} (the table: Shield, Oil slick, Gust, Turbo, Rocket)`);
ok(R.gpPowerFor(5, 5, 0.3) === 'honey' && R.gpPowerFor(4, 4, 0.26) === 'honey', 'last and more than a quarter-lap behind the leader: Sticky honey (5 of 5, and 4 of 4 on Easy)');
ok(R.gpPowerFor(5, 5, 0.2) === 'rocket' && R.gpPowerFor(4, 5, 0.4) === 'turbo', 'not that far behind, or not last: the place decides (Rocket at 5th, Turbo at 4th)');
const S = R.GP_STR, T = {
  shield: [{ t: 10 }, { t: 6 }], oil: [{ t: 2.8 }, { t: 1.8 }], gust: [{ t: 2.0 }, { t: 1.3 }],
  turbo: [{ mul: 1.45, t: 4 }, { mul: 1.3, t: 3 }], rocket: [{ mul: 1.75, t: 2.6 }, { mul: 1.5, t: 2 }], honey: [{ t: 2.8 }, { t: 1.8 }] };
const bad = Object.entries(T).filter(([k, [f, s]]) => !S[k] || JSON.stringify(S[k].full) !== JSON.stringify(f) || JSON.stringify(S[k].std) !== JSON.stringify(s)).map(([k]) => k);
ok(!bad.length, bad.length ? `strengths differ from §2.4: ${bad.join(', ')}` : 'all six strengths match §2.4, full (Clean) and standard (Right)');
/* the grade: Clean = right first try within par; Right = slower; Miss = wrong */
const L = 7, par = 1.2 + 0.45 * L;
ok(R.gpGrade(true, par - 0.01, L, false) === 'clean' && R.gpGrade(true, par + 0.01, L, false) === 'right' && R.gpGrade(false, 1, L, false) === 'miss',
  `the grade turns on par (1.2s + 0.45s × letters = ${par.toFixed(2)}s for ${L} letters): Clean / Right / Miss`);
ok(R.gpGrade(true, par * 1.4, L, true) === 'clean' && Math.abs(R.GP_PAR(L, true) - par * 1.5) < 1e-9, 'Calm mode gives par half as long again');
ok(R.GP_COMBO === 3, `three Clean in a row add a Turbo (COMBO ${R.GP_COMBO})`);
/* the Cup: four tracks, the fourth ONE entry, each its own origin family */
ok(R.GP_CUP.length === 4 && new Set(R.GP_CUP.map(c => c.origin)).size === 4 && R.GP_CUP[3].scene === 'bazaar',
  `the Cup is ${R.GP_CUP.map(c => c.scene + ' (' + c.origin + ')').join(', ')}`);

console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
process.exit(fails ? 1 : 0);
