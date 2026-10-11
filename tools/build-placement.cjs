#!/usr/bin/env node
/* THE PLACEMENT WORDS, CUT FROM EACH REGION'S OWN STOPS (road to 4.5, P1.7/P1.8).

   Placement asks a child of 11+ twelve words and recommends where on the Word Atlas Continue should start.
   Every word it asks for a region is one of that region's own words: a word in the pool of a stop the
   region walks on Tier 1 (trail-map-data.js, every band), so it carries the region's patterns.

   WHY NOT SIMPLY THE FIRST SET. A stop's first set is its easiest round, and late regions open gently:
   the Subject Sprints' first round is "lung, atom, mural", the Big Stage's "strut, pity". Asked those, any
   decent eleven-year-old "passes" the last regions of the road and is told to start at the end. The Atlas
   is ordered by concept, but it is also meant to climb — its round grows from 15 words in the Meadow to 50
   on the Big Stage — so placement reads the road as a DIFFICULTY ladder: region r's words are taken at
   the library's own difficulty band (`y`, the calibrated 1–9 band every game already draws by)
   TARGET(r) = r + 1 — nine regions, nine bands: the Meadow at 1, the Great Library at 2 … the Big Stage
   at 9 — nearest band first where a region is short. Asking "can you spell the Forum's words at the Forum's place on the
   road" is the question a start stop needs answered, and it is one ladder a level can be read from.

   Nothing is typed: every word, its meaning, its band and its stop come out of trail-data.js,
   trail-map-data.js and the served library, loaded the way the page loads them (tools/feed-corpus.cjs).
   tests/placement.cjs rebuilds and compares, so placement-data.js cannot drift.

   A word may be asked only if a child hearing it once could fairly spell it:
     · plain letters, 4–14 of them (no hyphen, space, apostrophe or capital);
     · it has a recorded clip (SB_WVOICE) and a meaning that passes SB_GLOSS_OK;
     · its meaning does not give the word away — not even its first five letters;
     · it is not a homophone (SB_HOM), a two-pronunciation word (SB_ALT_PRON) or a word with a marked
       spelling (SB_DIACRITICS), and its stop does not teach sound-alikes or marked spellings (a title naming
       homophones, homonyms or accent marks — every word there has a twin or an accent, listed or not): spoken once with no sentence, "pair" or
       "pear" would be a coin toss, and the meaning line is a hint, not a key;
     · its meaning names no faith, figure or rite of one (FAITH) — a measurement is no place for a faith's
       word, which belongs in a lesson that can say whose it is;
     · no two of a region's words share their first six letters (tableau / tableaux is one word asked twice);
     · it passes the kid-safe list at the strictest age (SB_KID_SAFE.check(record, 9)) — placement is for 11+,
       but a word that would be held from a nine-year-old has no business being the one a child is tested on.
   Within a region, words are taken nearest-band first, stop by stop round-robin, ties broken by a fixed
   hash of the word — so the items walk across the region's patterns and the same build always picks the
   same words. No Math.random anywhere.

     node tools/build-placement.cjs          write placement-data.js
     node tools/build-placement.cjs --check  exit 1 if placement-data.js is not what this would write */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { load, APP } = require('./feed-corpus.cjs');
const OUT = path.join(APP, 'placement-data.js');
const PER_REGION = 6;   // the engine asks one region at most four times; six gives it room
const TARGET = r => r + 1;
/* a meaning that names a faith or its figures: a placement word is a measurement, and a faith's word belongs in
   a lesson that can say whose it is (Bizzing India's editorial rule, which the family keeps) */
const FAITH = /\b(gods?|goddess\w*|christ\w*|soul|souls|church\w*|holy|sacred|relig\w*|pray\w*|heaven\w*|hell|saints?|bible|biblical|scripture\w*|worship\w*|deit(y|ies)|divine|spirit\w*|crucif\w*|rebirth|reincarnat\w*)\b/i;
const fnv = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const shortTitle = t => { t = String(t || ''); const i = t.indexOf(' — '); if (i > 0) t = t.slice(0, i); return t.replace(/\s*\([^)]*\)\s*$/, '').trim(); };

function corpus() {
  const C = load();
  vm.runInContext(fs.readFileSync(path.join(APP, 'kid-safe.js'), 'utf8'), C.win, { filename: 'kid-safe.js' });
  return C;
}

function build(C) {
  C = C || corpus();
  const W = C.win, KS = W.SB_KID_SAFE, GLOSS = W.SB_GLOSS_OK;
  const hom = new Set(); (C.HOM || []).forEach(g => (Array.isArray(g) ? g : (g && g.w) || []).forEach(w => hom.add(String(w).toLowerCase())));
  const alt = C.ALT || {}, dia = W.SB_DIACRITICS || {};
  const ok = w => {
    if (!/^[a-z]{4,14}$/.test(w)) return false;
    const r = C.WORD[w]; if (!r || !r.d || !(r.y >= 1)) return false;
    const d = String(r.d).trim();
    if (d.length < 12 || d.length > 150) return false;
    if (!C.VOICED.has(w)) return false;
    if (hom.has(w) || Object.prototype.hasOwnProperty.call(alt, w) || Object.prototype.hasOwnProperty.call(dia, w)) return false;
    if (typeof GLOSS !== 'function' || !GLOSS(d, w)) return false;
    if (d.toLowerCase().indexOf(w.slice(0, 5)) >= 0) return false;
    if (!KS || typeof KS.check !== 'function' || !KS.check(r, 9)) return false;   // the strictest age: the young lists too
    if (FAITH.test(d)) return false;
    return true;
  };
  return C.ACTS.map((act, r) => {
    const t = TARGET(r);
    const units = act.units.map(id => C.UNITS[id]).filter(u => u && (u.laps || [u.lap || 1]).includes(1));
    const cand = [];
    const twins = u => /homophone|homonym|accent mark/i.test(String(u.title || ''));
    units.forEach((u, si) => { if (twins(u)) return; const p = C.MAP[u.id] || {};
      const ws = [...new Set((p[1] || []).concat(p[2] || [], p[3] || []))].filter(ok)
        .map(w => ({ w, dy: Math.abs(C.WORD[w].y - t), h: fnv(w) }))
        .sort((a, b) => a.dy - b.dy || a.h - b.h || (a.w < b.w ? -1 : 1));
      ws.forEach((x, rank) => cand.push({ w: x.w, dy: x.dy, rank, si, h: x.h, u: u.id })); });
    /* nearest band first; inside a band, one from each stop in turn */
    cand.sort((a, b) => a.dy - b.dy || a.rank - b.rank || a.si - b.si || a.h - b.h);
    const items = [], seen = new Set();
    for (const x of cand) { if (items.length >= PER_REGION) break; if (seen.has(x.w) || items.some(it => it.w.slice(0, 6) === x.w.slice(0, 6))) continue; seen.add(x.w);
      items.push({ w: x.w, d: String(C.WORD[x.w].d).trim(), y: C.WORD[x.w].y, u: x.u }); }
    const u0 = units[0];
    return { act: act.id, title: act.title, name: String(act.title || '').replace(/^Act [IVX]+ · /, ''), target: t,
      entry: { u: u0.id, t: shortTitle(u0.title) }, items };
  });
}

function text(regions) {
  return '/* placement-data.js — WRITTEN BY tools/build-placement.cjs from each region\'s own Tier-1 stops, at its place on the road.\n' +
    '   Never edit by hand: tests/placement.cjs rebuilds it and fails on any difference. */\n' +
    'window.SB_PLACE_DATA=' + JSON.stringify({ v: 1, per: PER_REGION, regions }) + ';\n';
}

module.exports = { build, text, corpus, TARGET, PER_REGION, fnv, OUT };

if (require.main === module) {
  const txt = text(build());
  if (process.argv.includes('--check')) {
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : '';
    if (cur !== txt) { console.error('placement-data.js is stale — run node tools/build-placement.cjs'); process.exit(1); }
    console.log('placement-data.js is current'); process.exit(0);
  }
  fs.writeFileSync(OUT, txt);
  console.log('wrote ' + path.relative(APP, OUT) + ' (' + txt.length + ' bytes)');
}
