/* HOME READS THE ATLAS'S ROAD, AND THE ROAD IS THE ATLAS'S (road to 4.5, P1.13 step 3 — first-load JS ≤ 400 KB). @check

   Home's "You are here" card, Continue and its strip read SB_TRAIL_NEXT / SB_TRAIL_HERE / SB_TRAIL_STOPS, which live in
   trail-home.js (a boot script) over trail-home-data.js (the ROAD, cut from trail-data.js by tools/build-trail-home.cjs),
   so neither trail-data.js (~75 KB gz) nor trail.js (~49 KB gz) is on a first screen. Here, in node:
     1. GENERATED: trail-home-data.js is exactly what the tool writes, and the road it holds is trail-data.js's — the
        same regions, stops, titles and laps, in order, and trail-road.js counts the same nodes from it on every lap.
     2. THE SAME ANSWER FROM THE ROAD AS FROM THE CURRICULUM: for every stop of every lap of the Honey road (a child
        who has walked up to it, by quiz, by practice, past a checkpoint), for a child placed at every region's start
        line, for every lap finished, and on the Advanced Rounds, SB_TRAIL_NEXT(), SB_TRAIL_HERE('honey'|'exp') and
        SB_TRAIL_STOPS() over SB_TRAIL_HOME alone are deep-equal to the same three over the whole SB_TRAIL.
     3. ONE COPY OF THE ARITHMETIC: trail.js defines no frontier, no road, no start line, no pins of its own — it builds
        them from trail-home.js's SB_TRAIL_FRONT — so the board and Home cannot drift apart.
     4. WIRING: index.html carries trail-road.js, trail-home-data.js and trail-home.js and neither trail.js nor
        trail-data.js; boot-lazy's `atlas` group fetches both, and nothing fetches them before the first tap (FIRST is
        gone).
   home-here, placement-step and home-first-paint run the page (the card at first paint, before the Atlas lands).
   Run: node tests/trail-home.cjs
   PROVED by breaking (each put in, watched to fail, taken out): a region retitled by hand in trail-home-data.js (2: §1
   generated, §2 the readings differ); a frontier() / reach() of its own put back in trail.js (1: §3); trail-home.js
   with its pins unbound (1: §2, "no answer" for every child — the swallowed error the check was added for); trail.js
   put back in index.html (1: §4). tests/first-load.cjs and tests/home-first-paint.cjs hold the browser half.      */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = process.env.SB_ROOT || path.resolve(__dirname, '..');
const B = require(path.join(APP, 'tools', 'build-trail-home.cjs'));
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const read = (f) => fs.readFileSync(path.join(APP, f), 'utf8');
const some = (a) => (a.length ? ' — ' + a.slice(0, 5).join(' | ') + (a.length > 5 ? ' … (' + a.length + ')' : '') : '');

/* 1 — generated */
const TRAIL = B.trail(), S = B.summary(TRAIL);
ok(B.text(S) === read('trail-home-data.js'), 'trail-home-data.js is exactly what tools/build-trail-home.cjs writes' + (B.text(S) === read('trail-home-data.js') ? '' : ' — run node tools/build-trail-home.cjs'));
const W0 = {}; W0.window = W0; vm.runInNewContext(read('trail-road.js'), W0);
const R = W0.SB_TRAIL_ROAD;
const nodeKey = (n) => n.kind + ':' + (n.kind === 'unit' ? n.u.id + ':' + n.u.title : n.id) + '@' + n.act;
const roadSame = [1, 2, 3].every((lap) => JSON.stringify(R.nodes(S, 'honey', lap).map(nodeKey)) === JSON.stringify(R.nodes(TRAIL, 'honey', lap).map(nodeKey)))
  && JSON.stringify(R.nodes(S, 'exp', 1).map(nodeKey)) === JSON.stringify(R.nodes(TRAIL, 'exp', 1).map(nodeKey));
ok(roadSame && S.honey.acts.length === TRAIL.honey.acts.length && S.honey.units.length === TRAIL.honey.units.length,
  `the road is trail-data.js's: ${S.honey.acts.length} regions, ${S.honey.units.length} Honey stops and ${S.expedition.units.length} on the Advanced Rounds, the same nodes on every lap`);

/* 2 — the same answer from the road as from the curriculum */
function page() {
  const W = { console, Math, Object, Array, String, JSON, Set, Map }; W.window = W;
  const ctx = vm.createContext(W);
  W.state = { trailCourse: 'honey' }; W.__c = null; W.active = () => W.__c;
  vm.runInContext(read('trail-road.js'), ctx, { filename: 'trail-road.js' });
  vm.runInContext(read('trail-home-data.js'), ctx, { filename: 'trail-home-data.js' });
  vm.runInContext(read('trail-home.js'), ctx, { filename: 'trail-home.js' });
  return W;
}
const Wr = page(), Wf = page(); Wf.SB_TRAIL = TRAIL;
const read3 = (W, c) => { W.__c = JSON.parse(JSON.stringify(c)); W.state.trailCourse = 'honey';
  return JSON.stringify([W.SB_TRAIL_NEXT(), W.SB_TRAIL_HERE('honey'), W.SB_TRAIL_HERE('exp'), W.SB_TRAIL_STOPS(W.__c)]); };
const kids = [];
const honey1 = R.nodes(TRAIL, 'honey', 1);
const walk = (upto, how) => { const done = {}, chk = {}, st = {};
  honey1.slice(0, upto).forEach((n, i) => { if (n.kind === 'chk') chk['1:' + n.id] = 1; else if (how === 'quiz' || (how === 'mix' && i % 2)) done[n.u.id] = { 1: 90 }; else st[n.u.id + ':1'] = { p: 80 }; });
  return { name: 'K' + upto + how, trail: { lap: 1, done, chk, st, seen: {}, elap: 1, edone: {}, echk: {} } }; };
for (let k = 0; k <= honey1.length; k++) kids.push(walk(k, 'quiz'), walk(k, 'practice'), walk(k, 'mix'));
TRAIL.honey.acts.forEach((a) => { const u = a.units.find((id) => (TRAIL.honey.units.find((x) => x.id === id).laps || [1]).includes(1));
  kids.push({ name: 'placed ' + a.id, trail: { lap: 1, done: {}, chk: {}, st: {}, seen: {}, elap: 1, edone: {}, echk: {}, start: { u, act: a.id } } }); });
for (const lap of [2, 3]) { const ns = R.nodes(TRAIL, 'honey', lap); const done = {};
  ns.filter((n) => n.kind === 'unit').slice(0, 7).forEach((n) => { done[n.u.id] = { [lap]: 90 }; }); kids.push({ name: 'lap ' + lap, trail: { lap, done, chk: {}, st: {}, seen: {}, elap: 1, edone: {}, echk: {} } }); }
{ const ex = R.nodes(TRAIL, 'exp', 1).filter((n) => n.kind === 'unit'); const edone = {}; ex.slice(0, 9).forEach((n) => { edone[n.u.id] = { 1: 95 }; });
  kids.push({ name: 'exp', trail: { lap: 1, done: {}, chk: {}, st: {}, seen: {}, elap: 1, edone, echk: {} } }); }
kids.push({ name: 'no trail at all' });
const differ = kids.filter((c) => read3(Wr, c) !== read3(Wf, c)).map((c) => c.name);
/* and an answer, never a swallowed error: every child with a road gets a frontier, both maps and a count */
const blank = kids.filter((c) => c.trail).filter((c) => { const r = JSON.parse(read3(Wr, c)); return !r[0] || !r[1] || !r[1].pins || !r[2] || !r[2].pins || typeof r[3] !== 'number'; }).map((c) => c.name);
differ.push(...blank.map((n) => n + ' (no answer)'));
ok(kids.length > 300 && !differ.length, `SB_TRAIL_NEXT, SB_TRAIL_HERE (both courses) and SB_TRAIL_STOPS are the same from the road as from the whole curriculum, for ${kids.length} children (every stop of the road by quiz, practice and both, a start line in every region, laps 2 and 3, the Advanced Rounds)` + some(differ));
const sample = JSON.parse(read3(Wr, walk(13, 'mix')));
ok(sample[0] && sample[0].stop > 0 && sample[0].stops >= sample[0].stop && sample[1].ready && sample[1].pins.length === 9, `and they answer from the road alone, at first paint: "${sample[0].act} — Stop ${sample[0].stop} of ${sample[0].stops}"`);

/* 3 — one copy */
const trail = read('trail.js').replace(/\/\*[\s\S]*?\*\//g, '');
const own = [/function (seq|startIdx|reachIn|reach|frontier)\(/, /const (passedNode|lapOf|doneMap|chkMap|tr|course) = /, /const PGATE = \d/, /ATLAS_PINS = \{/, /window\.SB_TRAIL_(NEXT|HERE|STOPS) =/]
  .filter((re) => re.test(trail)).map(String);
ok(!own.length && /= window\.SB_TRAIL_FRONT\(T\)/.test(trail) && /const ATLAS_PINS = window\.SB_ATLAS_PINS/.test(trail),
  'trail.js keeps no second copy of the road\'s arithmetic, the pins or Home\'s readings — it builds them from trail-home.js' + some(own));

/* 4 — wiring */
const html = read('index.html'), lazy = read('boot-lazy.js');
const tags = [...html.matchAll(/<script[^>]*\ssrc="([^"?]+)/g)].map((m) => m[1]);
ok(tags.includes('trail-road.js') && tags.includes('trail-home-data.js') && tags.includes('trail-home.js') && tags.indexOf('trail-home-data.js') < tags.indexOf('trail-home.js')
  && !tags.includes('trail.js') && !tags.includes('trail-data.js'), 'index.html: the road and Home\'s reading of it are boot scripts; the Atlas and its curriculum are not');
ok(/trailCode: 'trail\.js'/.test(lazy) && /atlas: \['words1', 'trail', 'trailCode'/.test(lazy) && /trailCode: \['trail'\]/.test(lazy) && !/\bFIRST\b\s*=/.test(lazy) && !/FIRST\.forEach/.test(lazy),
  'boot-lazy: the atlas group fetches the curriculum then the code; nothing fetches them before the first tap (no FIRST)');

console.log(fails ? `\n${fails} FAILED` : '\nHome reads the road, and the road is the Atlas\'s');
process.exit(fails ? 1 : 0);
