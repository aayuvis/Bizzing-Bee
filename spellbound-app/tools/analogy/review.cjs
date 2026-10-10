#!/usr/bin/env node
/* review.cjs — the three agent-review rounds over the analogy content (owner, 10 Oct 2026: "the analogy content
   is reviewed by agents, not a human: three independent rounds").
     node tools/analogy/review.cjs sheets <round> [size]   write analogy-review/rounds/r<round>-<n>.json for the agents
     node tools/analogy/review.cjs blind2                   round 2's blind answers (b2-*) → verdicts (v2-*)
     node tools/analogy/review.cjs ledger                   fold every analogy-review/rounds/v<round>-*.json verdict file
                                                             into analogy-review/analogy-review.json ({item, round, verdict, reason})
     node tools/analogy/review.cjs status                   passes per unit, what still needs a round
   Units: every analogy item (item:<id>), every lesson stem pair (stem:<lesson>:<i>), every lesson's words
   (lesson:<id>:<field>) and the two deity cards (card:<avatar>). Round 1 sees the answer; round 2 is BLIND (the
   item as a child meets it, options shuffled, no answer, no link name) and never sees round 1; round 3 adjudicates
   every disagreement and re-checks a 10% sample of passes (chosen by hash, never by chance). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..', '..'), DIR = path.join(APP, 'analogy-review'), RD = path.join(DIR, 'rounds');
const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(path.join(APP, 'analogy-data.js'), 'utf8'), ctx);
const A = ctx.window.SB_ANALOGY;
const CARDS = JSON.parse(fs.readFileSync(path.join(DIR, 'deity-cards.json'), 'utf8'));
const fnv = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
const lessonOf = {}; A.lessons.forEach((l) => l.rels.forEach((r) => { lessonOf[r] = l; }));
function units() { const U = [];
  for (const [id, it] of Object.entries(A.items)) { const [rel, lv, c, d] = it; const L = lessonOf[rel];
    U.push({ unit: 'item:' + id, kind: 'item', rel, link: L ? L.title : rel, level: lv, c, d, wrong: it.slice(4).map((x) => String(x).split('|')[0]),
      bridge: L ? L.bridge : '', gloss: A.gloss[d] || '' }); }
  A.lessons.forEach((L) => (L.stems || []).forEach((s, i) => U.push({ unit: 'stem:' + L.id + ':' + i, kind: 'stem', link: L.title, rel: s[2] || L.rels[0], a: s[0], b: s[1] })));
  A.lessons.forEach((L) => ['title', 'idea', 'bridge', 'spot', 'trap'].forEach((f) => U.push({ unit: 'lesson:' + L.id + ':' + f, kind: 'text', what: 'analogy lesson “' + L.title + '”, its ' + f, text: L[f] })));
  ['shiva', 'zeus'].forEach((k) => U.push({ unit: 'card:' + k, kind: 'card', what: 'the avatar card for ' + k[0].toUpperCase() + k.slice(1) + ' (a Legendary avatar in the Indian Gods / European Gods pack)', text: CARDS[k] }));
  return U; }
/* round 2: the item as a child meets it — a stem pair from its lesson's bank (no shared word, never containing the
   answer), C, and the options shuffled; no answer and no link name */
function blind(u) { if (u.kind === 'item') { const L = lessonOf[u.rel]; const opts = [u.d].concat(u.wrong.slice(0, 4));
    const pool = (L.stems || []).filter((x) => ((x[2] || u.rel) === u.rel || L.id !== 'family') && !opts.includes(x[0]) && !opts.includes(x[1]) && x[0] !== u.c && x[1] !== u.c);
    const st = pool.length ? pool[fnv('r2|' + u.unit) % pool.length] : ['?', '?'];
    const ord = opts.map((o, i) => [fnv('r2o|' + u.unit + '|' + o), o]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    return { unit: u.unit, kind: 'item', analogy: st[0] + ' is to ' + st[1] + ' as ' + u.c + ' is to …', options: ord }; }
  if (u.kind === 'stem') return { unit: u.unit, kind: 'stem', pair: [u.a, u.b], links: A.lessons.map((l) => l.title) };
  return { unit: u.unit, kind: u.kind, what: u.what, text: u.text }; }
function ledger() { const rows = []; if (fs.existsSync(RD)) for (const f of fs.readdirSync(RD).filter((f) => /^v\d-.*\.json$/.test(f)).sort()) {
    const round = +f[1]; for (const v of JSON.parse(fs.readFileSync(path.join(RD, f), 'utf8'))) rows.push({ item: v.unit || v.item, round, verdict: v.verdict, reason: v.reason || '' }); }
  return rows; }
function passes(rows) { const P = {}; for (const r of rows) { const p = P[r.item] = P[r.item] || {}; p[r.round] = r.verdict; } return P; }
const cmd = process.argv[2];
if (cmd === 'sheets') { const round = +process.argv[3], size = +(process.argv[4] || 280); fs.mkdirSync(RD, { recursive: true });
  let U = units(); if (round === 2) U = U.map(blind);
  if (round === 3) { const P = passes(ledger()); const all = units();
    const dis = all.filter((u) => { const p = P[u.unit] || {}; return p[1] !== 'pass' || p[2] !== 'pass'; });
    const ok = all.filter((u) => !dis.includes(u) && fnv('r3sample|' + u.unit) % 10 === 0);
    const rows = ledger(); U = dis.map((u) => Object.assign({ why: 'disagreement', verdicts: rows.filter((r) => r.item === u.unit) }, u))
      .concat(ok.map((u) => Object.assign({ why: '10% re-check of a pass', verdicts: rows.filter((r) => r.item === u.unit) }, u))); }
  for (const f of fs.readdirSync(RD).filter((f) => f.startsWith('r' + round + '-'))) fs.unlinkSync(path.join(RD, f));
  const n = Math.ceil(U.length / size); for (let i = 0; i < n; i++) fs.writeFileSync(path.join(RD, 'r' + round + '-' + (i + 1) + '.json'), JSON.stringify(U.slice(i * size, (i + 1) * size), null, 1));
  console.log('round ' + round + ': ' + U.length + ' units in ' + n + ' sheets'); }
else if (cmd === 'blind2') {
  /* round 2's blind answers → verdicts: an item passes only if the solver picked the intended answer, named no second
     defensible answer and flagged no unsafe word; a stem only if it named the stem's own link and nothing else */
  const byId = {}; units().forEach((u) => { byId[u.unit] = u; }); let n = 0, pass = 0;
  for (const f of fs.readdirSync(RD).filter((f) => /^b2-\d+\.json$/.test(f))) { const out = [];
    for (const b of JSON.parse(fs.readFileSync(path.join(RD, f), 'utf8'))) { const u = byId[b.unit]; if (!u) continue; n++;
      const second = (b.second || []).filter(Boolean), unsafe = (b.unsafe || []).filter(Boolean); let verdict, reason;
      if (u.kind === 'item') { const ok = String(b.pick || '').toLowerCase() === u.d.toLowerCase();
        /* a worry the solver wrote down (a broken link, an obscure word, a doubt) fails it too: a doubtful item fails */
        const worry = String(b.reason || '').trim();
        verdict = ok && !second.length && !unsafe.length && !worry ? 'pass' : 'fail';
        reason = [ok ? '' : 'blind pick “' + (b.pick || '—') + '”, intended “' + u.d + '”', second.length ? 'second defensible: ' + second.join(', ') : '', unsafe.length ? 'unsafe: ' + unsafe.join(', ') : '', worry].filter(Boolean).join(' · '); }
      else if (u.kind === 'stem') { const ok = String(b.pick || '').toLowerCase() === u.link.toLowerCase();
        const worry = String(b.reason || '').trim();
        verdict = ok && !second.length && !unsafe.length && !worry ? 'pass' : 'fail';
        reason = [ok ? '' : 'blind link “' + (b.pick || '—') + '”, intended “' + u.link + '”', second.length ? 'also fits: ' + second.join(', ') : '', unsafe.length ? 'unsafe: ' + unsafe.join(', ') : '', worry].filter(Boolean).join(' · '); }
      else { verdict = b.verdict === 'pass' ? 'pass' : 'fail'; reason = b.reason || ''; }
      if (verdict === 'pass') pass++; out.push({ unit: b.unit, verdict, reason }); }
    fs.writeFileSync(path.join(RD, f.replace(/^b2-/, 'v2-')), JSON.stringify(out, null, 1)); }
  console.log('round 2: ' + n + ' units, ' + pass + ' pass, ' + (n - pass) + ' fail'); }
else if (cmd === 'ledger') { const rows = ledger(); fs.writeFileSync(path.join(DIR, 'analogy-review.json'), JSON.stringify(rows, null, 1) + '\n');
  const P = passes(rows); const three = Object.values(P).filter((p) => p[1] === 'pass' && p[2] === 'pass' && p[3] !== 'fail').length; console.log(rows.length + ' verdicts; ' + three + ' units with no failing round'); }
else if (cmd === 'status') { const P = passes(ledger()); const U = units(); const c = { r1: 0, r2: 0, r3: 0 }; U.forEach((u) => { const p = P[u.unit] || {}; if (p[1]) c.r1++; if (p[2]) c.r2++; if (p[3]) c.r3++; }); console.log(U.length + ' units', c); }
else { console.log('usage: review.cjs sheets <1|2|3> [size] | ledger | status'); }
module.exports = { units, blind, ledger, passes };
