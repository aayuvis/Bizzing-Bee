/* THE SPELLING GYM'S SOURCE PROMISES (games spec §4.2, 4 Oct 2026) — node, a second, joins the data gate.

   1. The hub's name is the owner's: gym.js and app3.js read it from SB_HUB_NAMES and type it only as
      the fallback, once each (a second literal is a name that will not follow a rename).
   2. Nothing paid or graded in the gym rolls a die: no Math.random() in gym.js (presentation picks
      are seeded, and say so).
   3. The gym is one door: gym.js is registered lazily in boot-lazy (never a <script> in index.html),
      #/gym is routed to app.openGym, and the old alias that sent #/gym to the Word Gym tab is gone.
   4. The old entry points are gone: no Beat the Buzzer or Magic Squares tile, no Word Quiz spelling
      round on the picker, no Daily Buzz quick action on the Word Gym tab.
   5. The "National-ready" verdict is retired from every shipped script.
   Proved by breaking (see the commit that added it).
   Run: node tests/gym-source.cjs                                                                    */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const gym = read('gym.js'), app3 = read('app3.js'), lazy = read('boot-lazy.js'), shell = read('family-shell.js'), index = read('index.html');
const count = (s, re) => (s.match(re) || []).length;

ok(count(gym, /'Spelling Gym'/g) === 1 && /SB_HUB_NAMES\.gym/.test(gym), `gym.js reads the hub's name from SB_HUB_NAMES and types it once, as the fallback (${count(gym, /'Spelling Gym'/g)})`);
ok(count(app3, /'Spelling Gym'/g) === 1 && /SB_HUB_NAMES=Object\.assign\(\{gym:'Spelling Gym'/.test(app3), `app3.js types the name once, as SB_HUB_NAMES's default, and reads it everywhere else (${count(app3, /'Spelling Gym'/g)} literal)`);
const code = gym.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
ok(!/Math\.random\s*\(/.test(code), 'gym.js never calls Math.random() — no reward, grade or word fate is left to chance');
ok(/gym:\s*'gym\.js'/.test(lazy) && /gym:\s*\[[^\]]*'gym'/.test(lazy) && !/gym\.js/.test(index), 'gym.js arrives through boot-lazy (group gym), never as a boot <script>');
ok(/head === 'gym'\)\s*\{\s*app\.openGym\(/.test(shell) && !/head === 'practice' \|\| head === 'gym'/.test(shell), '#/gym and #/gym/<mode> go through app.openGym; #/gym is no longer an alias of the Word Gym tab');
ok(/if \(n === 'gym'\) return 'gym'/.test(shell), 'the shell writes #/gym/<mode> for a gym screen, so Back walks mode → hub → Play');
const GAMES = (app3.match(/const GAMES=\[[\s\S]*?\];/) || [''])[0];
ok(!/type:'beat'/.test(GAMES) && !/title:'Magic Squares'/.test(app3), 'Beat the Buzzer and Magic Squares are off the Play tab');
ok(!/pickerCard\('wqStart','spell'/.test(app3), 'Word Quiz no longer offers its spelling round (Spot the Error replaces it)');
ok(!/act\('startBuzz'/.test(app3) && /act\('openGym','flame','Warm-up','#E8845C','warmup'\)/.test(app3), "the Word Gym tab's quick action is Warm-up, opening the gym's Warm-up");
const shipped = fs.readdirSync(ROOT).filter(f => f.endsWith('.js'));
const nat = shipped.filter(f => /National-ready/.test(read(f)));
ok(!nat.length, `no shipped script carries the "National-ready" verdict${nat.length ? ' (' + nat.join(', ') + ')' : ''}`);
console.log(fails ? `\n${fails} FAILED\n` : '\nall good\n');
process.exit(fails ? 1 : 0);
