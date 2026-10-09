#!/usr/bin/env node
/* build-app.cjs — cut the Analogy Trail's data file (analogy-data.js) from the engine.

     node tools/analogy/build-app.cjs          (~3 min cold, ~2.5 min warm)

   Reads lessons.json (the lessons, the hand-written stems and the seed rows), runs the engine with the
   seed rows in the table, keeps only the rows whose kind measured well in review, and lays them out
   as the trail: regions by Bee level band, a stop per lesson in each region, and a level check per
   region drawn from items no stop uses (mastery is claimed on unseen items only).

   What ships, by relation (analogy-review/judged.json has the rates):
     seed rows (every relation)                    written by hand (a draft awaiting a person's review); wrong answers by the engine
     synonym     only when each word lists the other in Bee's synonym file (both ways)
     antonym     prefix/gloss evidence only ("not X", un-/in-/dis- with the base named, -ful/-less)
     kind        only the concrete categories (KIND_OK)
     word family action / quality / relating / able (89–93% usable in review)
     agent       level 5 and up, a verb base
   part, material, function and degree ship from the seed rows only: the engine's own rows of those
   kinds were usable about half the time.

   The file is lazy (boot-lazy group `analogy`). It carries reviewed:false until a person has read the items;
   the owner put the tab live on 9 Oct 2026 ahead of that review. */
'use strict';
const fs = require('fs'), path = require('path');
const { load, APP } = require('./data.cjs');
const { build } = require('./relations.cjs');
const { train } = require('./embed.cjs');
const { compose, fnv } = require('./compose.cjs');

const L = JSON.parse(fs.readFileSync(path.join(__dirname, 'lessons.json'), 'utf8'));
const D = load();
const R = build(D);
const W = D.W, X = R.X;
const log = (...a) => console.log(...a);

/* every part of speech a word is recorded with */
const POS = (w) => { const x = W.get(w); if (!x) return new Set(); const s = new Set([x.ps]); for (const a of x.alt || []) s.add(String(a.p || '').replace(/^plural\s+/, '')); return s; };
const pick = (a, b, pref) => { const A = POS(a), B = POS(b); for (const p of pref) if (A.has(p) && B.has(p)) return p; return null; };
const ROLE_OF = {
  /* hand-written rows are trusted where the library's part-of-speech record is thin ("quiet" is filed only as a noun) */
  antonym: (a, b) => pick(a, b, ['adjective', 'verb', 'noun']) || (POS(a).has('adjective') || POS(b).has('adjective') ? 'adjective' : (W.get(a) || {}).ps),
  degree: (a, b) => pick(a, b, ['adjective', 'verb', 'noun']) || (POS(a).has('adjective') || POS(b).has('adjective') ? 'adjective' : (W.get(a) || {}).ps),
  function: () => 'verb', agent: () => 'noun', kind: () => 'noun', part: () => 'noun', material: () => 'noun',
  action: () => 'noun', quality: () => 'noun', relating: () => 'adjective',
};

/* ---- seed rows into the table ---- */
const ALLOW = new Set(), ROLE = new Map(), SEED = new Set(), dropped = [];
const have = new Set(R.E.map((e) => e[2] + '|' + e[0] + '|' + e[1]));
for (const [rel, rows] of Object.entries(L.seed)) {
  for (const [a, b] of rows) {
    if (!W.has(a) || !W.has(b)) { dropped.push(rel + ' ' + a + '/' + b + ' (not a headword)'); continue; }
    const role = ROLE_OF[rel](a, b);
    if (!role) { dropped.push(rel + ' ' + a + '/' + b + ' (no shared part of speech)'); continue; }
    ALLOW.add(a); ALLOW.add(b);
    const k = rel + '|' + a + '|' + b;
    if (!have.has(k)) { R.E.push([a, b, rel, 'seed (draft, for review)']); have.add(k); }
    ROLE.set(k, role); SEED.add(k);
    if (rel === 'antonym') { ROLE.set('antonym|' + b + '|' + a, role); SEED.add('antonym|' + b + '|' + a); }
  }
}
const SYN = D.SYN;
const lessonOf = {};
for (const l of L.lessons) for (const r of l.rels) lessonOf[r] = l.id;
for (const l of L.lessons) for (const [a, b] of l.stems) { ALLOW.add(a); ALLOW.add(b); if (!W.has(a) || !W.has(b)) dropped.push('stem ' + a + '/' + b + ' (not a headword)'); }
log('seed rows', SEED.size, '· dropped', dropped.length ? dropped.join(' · ') : 'none');

const EMB = train(D, X, (m) => log('  map', m));
const { items } = compose(D, R, EMB, { allow: ALLOW, role: ROLE, noStem: true, keepSeeds: true });
log('engine items', items.length);

/* ---- seed rows short of wrong answers: the right KIND of answer for a different pair. For "used for"
   every option should be an action (scissors → cut; sweep, dig, stir…), ranked by how close the word
   map puts it to C, so the nearest jobs tempt first. Never a job C also does, never a twin of D. ---- */
const OUTR = new Map();
for (const [a, b, rel] of R.E) { const k = rel + '|' + a; if (!OUTR.has(k)) OUTR.set(k, new Set()); OUTR.get(k).add(b);
  if (rel === 'antonym' || rel === 'synonym') { const k2 = rel + '|' + b; if (!OUTR.has(k2)) OUTR.set(k2, new Set()); OUTR.get(k2).add(a); } }
const outR = (rel, a) => OUTR.get(rel + '|' + a) || new Set();
const seedD = {};
for (const k of SEED) { const [rel, , b] = k.split('|'); (seedD[rel] = seedD[rel] || new Set()).add(b); }
let filled = 0;
for (const it of items) {
  const k = it.rel + '|' + it.c + '|' + it.d;
  if (!SEED.has(k)) continue;
  const want = it.rel === 'function' ? 4 : 4 - it.traps.length;
  if (want <= 0) continue;
  const bad = new Set([it.c, it.d, ...outR(it.rel, it.c), ...outR('synonym', it.d), ...(SYN.get(it.d) || []), ...it.traps.map((t) => t[0])]);
  const sib = [...(seedD[it.rel] || [])].filter((w) => !bad.has(w) && w.slice(0, 4) !== it.d.slice(0, 4) && w.slice(0, 4) !== it.c.slice(0, 4))
    .map((w) => [w, EMB.has(w) && EMB.has(it.c) ? EMB.cos(it.c, w) : -1]).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const add = sib.slice(0, want).map(([w, s]) => [w, 'sibling', +s.toFixed(3)]);
  it.traps = it.rel === 'function' ? add.concat(it.traps.filter((t) => t[1] !== 'assoc')).slice(0, 4) : it.traps.concat(add).slice(0, 4);
  filled++;
}
log('seed rows topped up with sibling answers', filled);

/* ---- what ships ---- */
const KIND_OK = new Set(('bird fish mammal insect reptile amphibian dog cat horse snake spider shellfish plant tree shrub flower ' +
  'herb grass vegetable fruit nut grain cereal mushroom vine tool instrument vehicle boat ship aircraft container bag box ' +
  'furniture utensil garment coat hat shoe fabric cloth gem stone rock mineral metal wood food dish bread cake cheese sauce ' +
  'soup drink beverage sweet dessert spice building house room game sport dance shape color colour coin storm cloud animal').split(' '));
const KIND_SEED_ONLY = new Set(['shape', 'building', 'house', 'room', 'fruit', 'food', 'game', 'sport']);
const whyOf = new Map(R.E.map((e) => [e[2] + '|' + e[0] + '|' + e[1], e[3]]));
const FAMILY = new Set(['action', 'quality', 'relating']);   // 'able' has no hand-written stems of its own, so it does not ship
function ships(it) {
  const k = it.rel + '|' + it.c + '|' + it.d;
  if (SEED.has(k)) return 'seed';
  if (!lessonOf[it.rel]) return null;
  const why = whyOf.get(k) || whyOf.get(it.rel + '|' + it.d + '|' + it.c) || '';
  if (it.rel === 'synonym') return (SYN.get(it.c) || new Set()).has(it.d) && (SYN.get(it.d) || new Set()).has(it.c) ? 'engine' : null;
  if (it.rel === 'antonym') return /^prefix|^-ful|^gloss "not/.test(why) && !/helpful|helpless|restful|restless/.test(it.c + it.d) && !/ing$/.test(it.c) && !/ing$/.test(it.d) ? 'engine' : null;
  /* the engine's own categories ship only when the definition NAMES the category, never through a hop, and
     never for the categories that measured worst (a shoe "is a kind of" shape, a shingle of building) */
  if (it.rel === 'kind') return KIND_OK.has(it.d) && !KIND_SEED_ONLY.has(it.d) && /^gloss names/.test(why) && !/\bmade (?:of|from)\b/.test(X.gloss(W.get(it.c).d)) ? 'engine' : null;
  if (FAMILY.has(it.rel)) return 'engine';
  if (it.rel === 'agent') return it.L >= 5 && POS(it.c).has('verb') ? 'engine' : null;
  return null;
}
/* kind and part: a category or a whole is never a safe wrong answer — a jet is an aircraft AND a vehicle,
   a root belongs to a plant AND a tree — so those traps go, and so do another whole's siblings */
const WHOLE = new Set([...KIND_OK]);
for (const [a, b, rel] of R.E) if (rel === 'kind' || rel === 'part') WHOLE.add(b);
for (const it of items) if (it.rel === 'kind' || it.rel === 'part') it.traps = it.traps.filter(([w, kind]) => !WHOLE.has(w) && !(it.rel === 'part' && kind === 'sibling'));
const pool = items.map((it) => Object.assign(it, { src: ships(it) })).filter((it) => it.src && it.traps.length >= 2 && !it.older);
log('shippable', pool.length, '· seed', pool.filter((x) => x.src === 'seed').length);

/* ---- lay out the trail ---- */
const OUT = { items: {}, gloss: {} };
const used = new Set(), byLesson = {};
for (const it of pool) (byLesson[lessonOf[it.rel]] = byLesson[lessonOf[it.rel]] || []).push(it);
const rank = (it, lv) => {                   // in the band first, seeds first, confusing first, then a fixed shuffle
  const inBand = it.L >= lv[0] && it.L <= lv[1] ? 0 : it.L < lv[0] ? 1 + (lv[0] - it.L) : 3 + (it.L - lv[1]);
  return inBand * 1e6 + (it.src === 'seed' ? 0 : 5e5) + (it.strong ? 0 : 2e5) + (fnv(it.id) % 1e5);
};
let nId = 0;
const idOf = new Map();
const emit = (it) => {
  if (!idOf.has(it.id)) {
    const id = (nId++).toString(36);
    idOf.set(it.id, id);
    OUT.items[id] = [it.rel, it.L, it.c, it.d].concat(it.traps.map(([w, kind]) => w + '|' + kind.replace('other:', 'o:').replace('assoc', 'a').replace('sibling', 's').replace('form', 'f')));
    for (const w of [it.c, it.d]) if (!OUT.gloss[w]) OUT.gloss[w] = clip(X.gloss(W.get(w).d));
  }
  return idOf.get(it.id);
};
const clip = (s) => { s = String(s || '').trim(); s = s.charAt(0).toUpperCase() + s.slice(1); return s.length > 110 ? s.slice(0, 108).replace(/\s+\S*$/, '') + '…' : s; };
const PER_STOP = 36, PER_CHECK = 30, MIN_STOP = 16;
const regions = [];
for (const rg of L.regions) {
  const stops = [];
  for (const lid of rg.stops) {
    const cand = (byLesson[lid] || []).filter((it) => !used.has(it.id) && it.L <= rg.lv[1] + 1 && it.traps.length >= rg.opts - 1)
      .sort((a, b) => rank(a, rg.lv) - rank(b, rg.lv));
    const seenC = new Set(), take = [];
    for (const it of cand) { if (seenC.has(it.c) || take.length >= PER_STOP) continue; seenC.add(it.c); take.push(it); }
    if (take.length < MIN_STOP) { log('  skip', rg.id, lid, 'only', take.length); continue; }
    take.forEach((it) => used.add(it.id));
    stops.push({ id: rg.id + '-' + lid, lesson: lid, items: take.map(emit) });
  }
  const cand = pool.filter((it) => !used.has(it.id) && rg.stops.includes(lessonOf[it.rel]) && it.L <= rg.lv[1] + 1 && it.traps.length >= rg.opts - 1)
    .sort((a, b) => rank(a, rg.lv) - rank(b, rg.lv));
  const seenC = new Set(), chk = [];
  const perLesson = {};
  for (const it of cand) {
    const l = lessonOf[it.rel];
    if (seenC.has(it.c) || chk.length >= PER_CHECK || (perLesson[l] || 0) >= Math.ceil(PER_CHECK / rg.stops.length) + 1) continue;
    seenC.add(it.c); perLesson[l] = (perLesson[l] || 0) + 1; chk.push(it);
  }
  chk.forEach((it) => used.add(it.id));
  regions.push({ id: rg.id, name: rg.name, lv: rg.lv, art: rg.art, opts: rg.opts, about: rg.about, stops, check: chk.map(emit) });
  log(rg.id.padEnd(9), 'stops', stops.map((s) => s.lesson + ':' + s.items.length).join(' '), '· check', chk.length);
}
/* the games draw from everything that ships (practice, not evidence) */
const extra = pool.filter((it) => !used.has(it.id)).sort((a, b) => fnv(a.id) - fnv(b.id)).slice(0, 900);
OUT.games = extra.map(emit);

const lessons = L.lessons.map((l) => ({
  id: l.id, title: l.title, ic: l.ic, idea: l.idea, bridge: l.bridge, spot: l.spot, trap: l.trap, rels: l.rels,
  stems: l.stems.filter(([a, b]) => W.has(a) && W.has(b)).map(([a, b]) => {
    const rel = l.rels.find((r) => (L.seed[r] || []).some(([x, y]) => x === a && y === b)) || l.rels[0];
    return [a, b, rel]; }),
}));
const data = { v: new Date().toISOString().slice(0, 10), reviewed: false, lessons, regions, items: OUT.items, gloss: OUT.gloss, games: OUT.games };
const body = '/* analogy-data.js — the Analogy Trail, cut by tools/analogy/build-app.cjs from Bee\'s own words.\n' +
  '   GENERATED: never hand-edit; change lessons.json or the engine and rebuild. reviewed stays false until a\n' +
  '   person has read the items (the owner put the tab live on 9 Oct 2026 before that review).\n' +
  '   items[id] = [relation, level, C, D, "wrong|recipe", …] (a assoc · o:<rel> other relation · s sibling · f word form) */\n' +
  'window.SB_ANALOGY=' + JSON.stringify(data) + ';\n';
fs.writeFileSync(path.join(APP, 'analogy-data.js'), body);
log('wrote analogy-data.js', (body.length / 1024).toFixed(0) + ' KB ·', Object.keys(OUT.items).length, 'items ·', Object.keys(OUT.gloss).length, 'glosses');
