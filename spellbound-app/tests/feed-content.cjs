/* MY FEED — THE CARDS AND THE RANKING (FAMILY-STANDARD §6a).                              @check

   THE CONTENT (against the corpus, loaded as the page loads it — tools/feed-corpus.cjs)
     count      at least 1,000 cards (no upper limit), unique ids; every level (the nine Word Atlas
                regions) holds at least 100, at least 300 carry no level; the lazy groups on disk are
                exactly the ones the meta names, each body chunk ≤ 400 cards
     near       no two cards say ≥ 80% the same words (tools/feed-near.cjs; candidates found here
                independently of the build)
     resolves   every `src` resolves to the object it was cut from and the card's words are that
                object's words: a chapter's card is in that chapter, a word's meaning is the
                chapter's or the library's, a question is the bank's with c[0] keyed right, a game
                is the arcade's own line, an idiom is the library's meaning and example
     levels     a card's level is the region of the stop it came from (or of the word it asks about)
     held       nothing from the unsourced quotations, the Advanced Pack or an archived avatar pack;
                no capitalised headword; a question never gives its answer away; nothing above
                its band (a level-4/5 question and a hard idiom never reach a 5–7 child)
     distinct   no two cards share src + kind + text
   THE RANKING (the family engine, BZ_FEED, the port Bee ships)
     bands      a 5–7 child never sees a card whose bands leave them out, on any level
     levels     a child on level n sees nothing above n+1, at most two "Coming up on …" peeks,
                and moving up a level changes the "now" cards
     context    the stop a child is at moves its cards up, and the card says why
     due        a word that slipped comes back first, saying so
     ends       a session is at most twenty cards, never three of a kind in a row, at most five
                questions; what was seen this week sinks
   Each was watched to fail by breaking what it holds (see the bottom of the file).
   Run: node tests/feed-content.cjs                                                            */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');
const { load, regionName } = require(path.join(APP, 'tools', 'feed-corpus.cjs'));
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };

const C = load();
const w = { console }; w.window = w; vm.createContext(w);
const FD = path.join(APP, 'feed');
vm.runInContext(fs.readFileSync(path.join(FD, 'feed-meta.js'), 'utf8'), w);
const DATA = w.SB_FEED_META;
Object.values(DATA.index).concat(Object.values(DATA.body)).forEach(f => vm.runInContext(fs.readFileSync(path.join(FD, f), 'utf8'), w, { filename: f }));
vm.runInContext(fs.readFileSync(path.join(APP, 'bizzing-feed.js'), 'utf8'), w);
const F = w.BZ_FEED, ITEMS = [], GROUP_OF = {};
Object.keys(DATA.index).forEach(g => w.SB_FEED_IDX[g].forEach(r => { const o = {}; DATA.keys.forEach((k, i) => { if (r[i] != null) o[k] = r[i]; });
  GROUP_OF[o.id] = g; ITEMS.push(Object.assign({}, w.SB_FEED_BODY[o.id], o)); }));
const onDisk = fs.readdirSync(FD).filter(f => /\.js$/.test(f));
const BANDS = ['5-7', '8-10', '11-13', '14-18'];
const bandsOf = it => it.bands || BANDS;

/* ------------------------------------------------------------------ the content */
const ids = new Set(ITEMS.map(i => i.id));
ok(ITEMS.length >= 1000 && ids.size === ITEMS.length, `${ITEMS.length} cards, every id unique (at least 1,000, no upper limit)`);
ok(ITEMS.every(i => w.SB_FEED_BODY[i.id] && DATA.body[i.g] && +GROUP_OF[i.id] === (i.level == null ? 0 : i.level) && i.g.split('-')[0] === GROUP_OF[i.id]),
  'every card has its words in a body chunk, and sits in its own level\'s index and chunks');
ok(onDisk.length === Object.keys(DATA.index).length + Object.keys(DATA.body).length + 1, `feed/ holds exactly the ${onDisk.length} files the meta names — no stale group`);
ok(Object.values(DATA.body).every(f => (fs.readFileSync(path.join(FD, f), 'utf8').match(/"[a-z]{2}-[^"]+":\{/g) || []).length <= 400), 'no body chunk carries more than 400 cards');
const per = {}; let agnostic = 0;
ITEMS.forEach(i => { if (i.level == null) agnostic++; else per[i.level] = (per[i.level] || 0) + 1; });
ok(DATA.levels.length === C.ACTS.length && DATA.levels.every((l, i) => l.n === i + 1 && l.id === C.ACTS[i].id && l.name === regionName(C.ACTS[i].title)),
  `the levels are the ${C.ACTS.length} Word Atlas regions, in road order, named as Home names them`);
ok(DATA.levels.every(l => (per[l.n] || 0) >= 100), 'every level holds at least 100 cards: ' + DATA.levels.map(l => l.n + ':' + (per[l.n] || 0)).join(' '));
ok(agnostic >= 300, `${agnostic} cards carry no level (at least 300)`);
ok(Object.keys(per).every(k => +k >= 1 && +k <= DATA.levels.length), 'no card sits on a level the road does not have');
ok(Object.keys(DATA.units).length === C.TRAIL.honey.units.length && C.TRAIL.honey.units.every(u => DATA.units[u.id] === u.level), 'every stop is mapped to its own region');

const wordLevel = {};
C.ACTS.forEach((a, ai) => a.units.forEach(id => {
  const m = C.MAP[id] || {}; ['1', '2', '3'].forEach(k => (m[k] || []).forEach(x => { if (wordLevel[x] == null) wordLevel[x] = ai + 1; }));
  const ch = C.chapterOf(C.UNITS[id]); ((ch && ch.words) || []).forEach(x => { if (wordLevel[x.w] == null) wordLevel[x.w] = ai + 1; });
}));
const LIVE = new Set(C.AVATARS.packs.map(p => p.label));
const trivia = {}; C.TRIVIA.forEach(q => { trivia[q.id] = q; });
const has = (hay, needle) => needle && String(hay || '').includes(needle);
function resolve(it) {
  const p = it.src.split(':'), k = p[0];
  const fail = m => { throw new Error(it.id + ': ' + m); };
  const wordOf = () => { if (!it.key || !/^[a-z]+$/.test(it.key.slice(5))) fail('a capitalised or odd headword'); if (!C.WORD[it.key.slice(5)]) fail('a word the served library no longer holds (the cleanups removed it)'); return it.key.slice(5); };
  const clipRight = (wd) => { if (!!it.clip !== C.VOICED.has(wd)) fail('says it has a recording when it does not, or the other way round'); };
  if (k === 'act') {
    const ai = C.ACTS.findIndex(a => a.id === p[1]); if (ai < 0) fail('no region ' + p[1]);
    const a = C.ACTS[ai], u0 = C.UNITS[a.units[0]], u1 = C.UNITS[a.units[a.units.length - 1]];
    if (it.title !== a.title || !has(it.body, u0.title) || !has(it.body, u1.title) || !has(it.body, String(a.units.length))) fail('not the region\'s own road');
    if (it.level !== ai + 1) fail('the wrong level');
  } else if (k === 'unit' && p[2] === 'qs') {
    const u = C.UNITS[p[1]], q = u && (u.qs || [])[+p[3]];
    if (!q || q.ty === 'card' || it.play.q !== q.q || JSON.stringify(it.play.opts) !== JSON.stringify(q.c.slice(0, 4))) fail('not the stop\'s own question');
    if (it.level !== u.level || it.route !== '#/stop/' + u.id) fail('not its stop\'s level or route');
  } else if (k === 'concept' || k === 'unit') {
    let ch, u;
    if (k === 'concept') { ch = C.CONCEPTS[+p[1]]; u = C.TRAIL.honey.units.find(x => x.gi === +p[1]); }
    else { u = C.UNITS[p[1]]; ch = u && u.neu && u.chapter; }
    if (!ch || !u) fail('no chapter for ' + it.src);
    const f = k === 'concept' ? p.slice(2) : p.slice(3);
    if (f[0] === 'concept') { if (!has(ch.concept, it.body) || it.title !== ch.title) fail('not the chapter\'s idea'); }
    else if (f[0] === 'cards') { const c = ch.cards[+f[1]]; if (!c || !has(c.body, it.body) || it.title !== ch.title + ' · ' + c.title) fail('not the chapter\'s card'); }
    else if (f[0] === 'words') {
      const x = ch.words[+f[1]], wd = wordOf(); if (!x || x.w !== wd) fail('not the chapter\'s word');
      if (f[2] === 'def') { if (x.def !== it.body || (x.say || '') !== (it.roman || '') || it.title !== wd) fail('not the chapter\'s meaning'); clipRight(wd); }
      else if (f[2] === 'ex') { if (x.ex !== it.body) fail('not the chapter\'s sentence'); clipRight(wd); }
      else if (f[2] === 'hook') { if (x.hook !== it.body) fail('not the chapter\'s hook'); }
      else fail('unknown word field ' + it.src);
    } else fail('unknown field ' + it.src);
    if (it.level !== u.level) fail(`level ${it.level}, its stop is in ${u.level}`);
    if (f[0] !== 'words' && it.route !== '#/stop/' + u.id) fail('route is not its stop');
  } else if (k === 'lore') {
    const wd = wordOf(), lore = C.LORE[p[1]];
    if (p[1] !== wd || !lore || lore[+p[2]] !== it.body || p[2] !== '0') fail('not the etymology library\'s origin');
    if (it.level !== wordLevel[wd]) fail('not the region of its word');
  } else if (k === 'library') {
    const wd = wordOf(), r = C.WORD[p[1]]; if (!r || p[1] !== wd) fail('no library word ' + p[1]);
    if (p[2] === 'd') { if (r.d !== it.body || r.p !== it.roman || it.title !== 'Word spotlight · ' + r.w) fail('not the library\'s meaning'); }
    else if (p[2] === 's') { if (r.s !== it.body) fail('not the library\'s sentence'); }
    else fail('unknown library field');
    if (it.level !== wordLevel[wd]) fail('not the region whose stop holds the word');
    clipRight(wd);
  } else if (k === 'trivia') {
    const q = trivia[p[1]]; if (!q || !it.play) fail('no question ' + p[1]);
    if (it.play.q !== q.q || JSON.stringify(it.play.opts) !== JSON.stringify(q.c.slice(0, 4)) || it.play.after !== (q.f || '')) fail('not the bank\'s question');
    if (q.th === 'wstories') { if (it.level != null) fail('a word story has a level'); }
    else { const wd = q.th === 'wroots' ? q.c[0] : (q.q.match(/“([^”]+)”/) || [])[1]; if (it.level !== wordLevel[wd]) fail('level is not its word\'s region'); }
    if (q.lv >= 4 && bandsOf(it).includes('5-7')) fail('a level-' + q.lv + ' question reaches a 5–7 child');
  } else if (k === 'game') {
    const g = p[1] === 'GAMES' ? C.GAMES.find(x => x.type === p[2]) : C.ARCADE.find(x => x.k === p[2]);
    if (!g || (g.name || g.n) !== it.title || g.blurb !== it.body) fail('not the arcade\'s own line');
  } else if (k === 'arc') {
    const arc = C.ARCS[+p[1]]; if (!arc) fail('no arc');
    if (p[2] === 'log') { if (arc.log !== it.body || it.title !== arc.title) fail('not the arc\'s opening'); }
    else if (p[2] === 'beats') { const b = arc.beats[+p[3]]; if (!b || b.x !== it.body || it.title !== arc.title + ' · ' + b.t) fail('not the arc\'s moment'); }
    else if (p[2] === 'cast') { const c = arc.cast[+p[3]]; if (!c || c.a !== it.body || !it.title.startsWith(c.n) || has(it.body + it.title, c.f)) fail('not the character\'s part'); }
    else fail('unknown arc field');
    if (!LIVE.has(arc.pack)) fail('an archived pack\'s story');
    if (it.level != null) fail('a story has a level');
  } else if (k === 'fig') {
    const f = (C.FIG[p[1]] || [])[+p[2]];
    if (!f || !f.kid || f.m !== it.body || '“' + f.ex + '”' !== it.source || !it.title.endsWith(f.p)) fail('not the library\'s idiom or simile');
    if (f.diff === 'hard' && bandsOf(it).some(b => b === '5-7' || b === '8-10')) fail('a hard idiom reaches a younger band');
    if (has(it.body + it.source, f.os)) fail('carries the origin story');
  } else fail('a src nothing resolves: ' + it.src);
  if (it.play) {
    if (new Set(it.play.opts).size !== it.play.opts.length) fail('two options are the same');
    const q = k === 'trivia' && trivia[p[1]];
    if (!(q && q.th === 'wbreak') && (it.play.q + ' ' + it.title).toLowerCase().includes(String(it.play.opts[0]).toLowerCase())) fail('the question gives its answer away');
  }
}
const bad = []; ITEMS.forEach(it => { try { resolve(it); } catch (e) { bad.push(e.message); } });
ok(!bad.length, `every src resolves and every card's words are its source's (${ITEMS.length - bad.length}/${ITEMS.length})` + (bad.length ? ' — ' + bad.slice(0, 3).join(' · ') : ''));
ok(!ITEMS.some(i => /quote/i.test(i.src) || /quote/i.test(i.kind)), 'nothing is cut from the unsourced quotation library');
const seenKey = {}; let dup = null;
ITEMS.forEach(it => { const k = it.src + '|' + it.kind + '|' + it.title + '|' + (it.body || '') + '|' + (it.play ? it.play.q : ''); if (seenKey[k] && !dup) dup = it.id + ' = ' + seenKey[k]; seenKey[k] = it.id; });
ok(!dup, 'no two cards share src + kind + text' + (dup ? ' — ' + dup : ''));
/* near-duplicates, found independently of the build: candidates share any of each card's FIVE rarest words */
{
  const { textOf, toks, LIMIT } = require(path.join(APP, 'tools', 'feed-near.cjs'));
  const T = ITEMS.map(it => toks(textOf(it))), df = {}; T.forEach(t => t.forEach(x => { df[x] = (df[x] || 0) + 1; }));
  const bk = {}; let near = null, pairs = 0;
  T.forEach((t, i) => { t.slice().sort((x, y) => df[x] - df[y]).slice(0, 5).forEach(x => (bk[x] = bk[x] || []).push(i)); });
  const done = new Set();
  for (const list of Object.values(bk)) { if (list.length > 400) continue;
    for (let a = 0; a < list.length; a++) for (let c = a + 1; c < list.length; c++) { const i = list[a], j = list[c], key = i + ',' + j; if (done.has(key)) continue; done.add(key); pairs++;
      const B = new Set(T[j]); let inter = 0; T[i].forEach(x => { if (B.has(x)) inter++; });
      if (inter / Math.max(T[i].length, B.size) >= LIMIT && !near) near = ITEMS[i].id + ' ≈ ' + ITEMS[j].id; } }
  ok(!near, `no two cards say ≥ ${LIMIT * 100}% the same words (${pairs} candidate pairs compared)` + (near ? ' — ' + near : ''));
}
const wordsTwice = {}; ITEMS.filter(i => i.kind === 'word' || i.kind === 'spotlight').forEach(i => { wordsTwice[i.key] = (wordsTwice[i.key] || 0) + 1; });
ok(Object.values(wordsTwice).every(n => n === 1), 'a word is a chapter word or a library spotlight, never both');
const angles = {}; ITEMS.filter(i => i.key && i.level != null).forEach(i => { const a = angles[i.key] = angles[i.key] || {}; a[i.kind] = (a[i.kind] || 0) + 1; });
ok(Object.values(angles).every(a => Object.keys(a).every(k => k === 'play' || a[k] === 1)), 'one word, several angles — but never two cards of the same angle');
ok(ITEMS.every(i => /^#\/(atlas\/honey\/[a-z]+|stop\/u\d+|word\/[a-z]+|play|trivia|figurative|hive\/avatars)$/.test(i.route)), 'every route is one of the app\'s own screens (the browser test opens each)');
ok(ITEMS.some(i => !bandsOf(i).includes('5-7')), 'some cards are above the youngest band, so the band rule below is tested');

/* ------------------------------------------------------------------ the ranking */
const NOW = Date.UTC(2026, 9, 2, 10), DAYN = Math.floor(NOW / 864e5);
const nm = n => DATA.levels[n - 1].name;
const run = o => F.feedFor(Object.assign({ items: ITEMS, now: NOW, band: '8-10', levelName: nm }, o));
const byId = {}; ITEMS.forEach(i => { byId[i.id] = i; });
let bandBad = null;
for (const band of BANDS) for (let L = 1; L <= DATA.levels.length; L++) run({ band, level: L }).forEach(x => { if (!bandsOf(byId[x.id]).includes(band) && !bandBad) bandBad = `a ${band} child on level ${L} was shown ${x.id}`; });
ok(!bandBad, 'no child, in any band on any level, sees a card above their band' + (bandBad ? ' — ' + bandBad : ''));
let lvBad = null, peekBad = null;
for (let L = 1; L <= DATA.levels.length; L++) {
  const l = run({ level: L });
  l.forEach(x => { const lv = byId[x.id].level; if (lv != null && lv > L + 1 && !lvBad) lvBad = `level ${L} saw ${x.id} (level ${lv})`; });
  const peeks = l.filter(x => x.tier === 'next');
  if ((peeks.length > 2 || peeks.some(x => !/^Coming up on /.test(x.why))) && !peekBad) peekBad = `level ${L}: ${peeks.length} peeks`;
  if (l.filter(x => x.tier === 'now').length < 12 && !peekBad) peekBad = `level ${L}: only ${l.filter(x => x.tier === 'now').length} cards at the child's own level`;
}
ok(!lvBad, 'a child on level n sees no card above n+1' + (lvBad ? ' — ' + lvBad : ''));
ok(!peekBad, 'at most two "Coming up on …" peeks, and most of the session at the child\'s own level' + (peekBad ? ' — ' + peekBad : ''));
const nowOf = L => run({ level: L }).filter(x => x.tier === 'now').map(x => x.id);
const n3 = nowOf(3), n4 = nowOf(4);
ok(n3.length && n4.length && n3.every(id => byId[id].level === 3 || byId[id].level == null) && n4.every(id => byId[id].level === 4 || byId[id].level == null) && !n3.some(id => n4.includes(id) && byId[id].level != null),
  'moving up from level 3 to 4 changes the "now" cards: ' + n3.length + ' → ' + n4.length);
/* context: the stop a child is at */
const stop = C.ACTS[1].units[3];
const rel = l => l.filter(x => (byId[x.id].topics || []).includes('stop:' + stop));
const before = run({ level: 2 }), after = run({ level: 2, signals: [{ topic: 'stop:' + stop, w: 5, why: 'You are at “' + C.UNITS[stop].title + '”' }] });
ok(rel(after).length > rel(before).length && rel(after).every(x => /^You are at /.test(x.why)), `being at a stop moves its cards up, saying why (${rel(before).length} → ${rel(after).length})`);
/* due: a slipped word comes back first */
const slip = ITEMS.find(i => i.level === 2 && i.kind === 'word' && !i.bands) || { key: 'word:none' };
const dl = run({ level: 2, due: { [slip.key]: 'A word that slipped on Tuesday — its gap is over' } });
ok(dl[0] && byId[dl[0].id].key === slip.key && /slipped/.test(dl[0].why), `a word that slipped comes back first (${dl[0] && dl[0].id}: ${dl[0] && dl[0].why})`);
const slipOld = ITEMS.find(i => i.level === 1 && i.kind === 'word') || { key: 'word:none' };
const dr = run({ level: 5, due: { [slipOld.key]: 'A word that slipped on Monday — its gap is over' } });
ok(dr.some(x => byId[x.id].key === slipOld.key && x.tier === 'review'), 'a word that slipped on a passed level comes back as review');
/* ends and mix */
let mixBad = null;
for (const band of BANDS) for (let L = 1; L <= DATA.levels.length; L++) {
  const l = run({ band, level: L });
  if (!l.length || l.length > 20) mixBad = mixBad || `${l.length} cards`;
  for (let i = 2; i < l.length; i++) if (l[i].kind === l[i - 1].kind && l[i].kind === l[i - 2].kind) mixBad = mixBad || `three ${l[i].kind} in a row (level ${L})`;
  if (l.filter(x => byId[x.id].play).length > 5) mixBad = mixBad || 'more than five questions';
  if (l.filter(x => x.tier === 'any').length > 5) mixBad = mixBad || 'more than a quarter level-free';
}
ok(!mixBad, 'every session: at most twenty cards, never three of a kind in a row, at most five questions, at most a quarter with no level' + (mixBad ? ' — ' + mixBad : ''));
const a = run({ level: 6 }), seen = {}; a.forEach(x => { seen[x.id] = DAYN; });
const again = run({ level: 6, seen }).filter(x => seen[x.id] != null).length;
ok(again <= 2, `what was seen today sinks: ${again} of today's cards came straight back`);

console.log(fails ? `\n${fails} FAILED` : '\nall good');
process.exit(fails ? 1 : 0);
/* PROVED BY BREAKING (2 Oct 2026), each put back after:
   · one spotlight's meaning edited in feed-data.js        → "every src resolves" fails (ws-habit)
   · PER_LEVEL 80 in tools/build-feed.cjs                  → "every level holds at least 100" fails (1:91 … 7:80)
   · the engine's tier rule widened to level n+2           → "no card above n+1" fails (level 7 saw a level-9 word)
   · the engine's due bonus removed                        → both "slipped" checks fail
   · the engine's band filter removed                      → "above their band" fails (a 5–7 child saw pq-w1111)
   · the build's near-duplicate pass switched off          → "≥ 80% the same words" fails (uq-u45-0 ≈ uq-u50-0) */
