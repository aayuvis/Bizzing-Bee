/* feed-corpus.cjs — Bee's corpus, loaded in node exactly as the page loads it (the same files,
   run as classic scripts in one window-shaped context), for tools/build-feed.cjs and
   tests/feed.cjs. Nothing here is copied or typed: every card My Feed carries is cut from
   these globals, and the test resolves each card against them again.

   Two things the page holds as code rather than data are read out of app3.js by the same
   literal the page evaluates: the two game lists (GAMES and SB_ARCADE_GAMES). They are
   array literals of plain strings, evaluated in an empty context. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const APP = path.resolve(__dirname, '..');

const FILES = ['words-data.js', 'words-extra.js', 'words-patch.js', 'words-data-s.js', 'words-data-2.js', 'words-lore.js', 'concepts-data.js',
  'trail-data.js', 'trail-road.js', 'trail-map-data.js', 'trivia-words.js', 'story-data.js', 'figurative-data.js', 'voice-words.js', 'avatars.js',
  'analogy-data.js', 'sounds-data.js'];

function literal(src, re, what) {
  const m = src.match(re);
  if (!m) throw new Error('feed-corpus: could not find ' + what + ' in app3.js');
  /* the literal ends at the first "];" at the start of a line after it */
  const start = m.index + m[0].length - 1, end = src.indexOf('\n];', start);
  const txt = src.slice(start, end + 2).replace(/\/\*[\s\S]*?\*\//g, '');
  return vm.runInNewContext('(' + txt + ')', {});
}

function load() {
  const win = { console };
  win.window = win; win.document = {};
  const ctx = vm.createContext(win);
  for (const f of FILES) vm.runInContext(fs.readFileSync(path.join(APP, f), 'utf8'), ctx, { filename: f });
  /* the library's QC pass (removals, kid-safe sentences, definitions that leaked the word), run over
     both shards exactly as the page runs it when words-data-2.js lands */
  if (typeof win.SB_WORDS_PATCH === 'function') win.SB_WORDS_PATCH();
  /* the boot tier's sentences ride in their own file (boot-lazy merges them by word) */
  const C = { win, DATA: win.SB_DATA.nsf, LORE: win.SB_LORE || {}, CONCEPTS: win.SB_CONCEPTS.chapters,
    TRAIL: win.SB_TRAIL, MAP: win.SB_TRAIL_MAP, TRIVIA: win.SB_TRIVIA.questions, ARCS: win.SB_STORY_ARCS || [],
    FIG: win.SB_FIG, AVATARS: win.SB_AVATARS, ANL: win.SB_ANALOGY, HOM: win.SB_HOM || [], ALT: win.SB_ALT_PRON || {},
    ROAD: win.SB_TRAIL_ROAD };   /* the board's own count of a region (trail-road.js) */
  const sent = {}; (win.SB_SENT_BOOT || []).forEach(([w, s]) => { sent[w] = s; });
  C.WORD = {};
  for (const r of C.DATA) if (r && r.w && !C.WORD[r.w]) C.WORD[r.w] = Object.assign({}, r, (!r.s && sent[r.w]) ? { s: sent[r.w] } : {});
  C.VOICED = new Set(String(win.SB_WVOICE || '').split('|'));
  const app3 = fs.readFileSync(path.join(APP, 'app3.js'), 'utf8');
  C.GAMES = literal(app3, /\nconst GAMES=\[/, 'GAMES');
  C.ARCADE = literal(app3, /\nconst SB_ARCADE_GAMES = \[/, 'SB_ARCADE_GAMES');
  /* the Atlas, as the page reads it: units by id, each with its region (1-based, the act order) */
  C.UNITS = {}; C.ACTS = C.TRAIL.honey.acts;
  C.TRAIL.honey.units.forEach(u => { C.UNITS[u.id] = u; });
  C.ACTS.forEach((a, i) => a.units.forEach(id => { if (C.UNITS[id]) C.UNITS[id].level = i + 1; }));
  C.chapterOf = u => (u.neu ? u.chapter : (u.gi >= 0 ? C.CONCEPTS[u.gi] : null));
  return C;
}
/* a region's name as Home says it ("Act III · The Roman Forum" → "the Roman Forum") */
const regionName = t => String(t || '').replace(/^Act [IVX]+ · /, '').replace(/^The /, 'the ');

module.exports = { load, APP, regionName };
