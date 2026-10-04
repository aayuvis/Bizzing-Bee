#!/usr/bin/env node
/* build-feed.cjs — cuts My Feed's cards from Bee's own corpus (FAMILY-STANDARD §6a).

   NOTHING IN THE FEED IS TYPED. Every card is cut from an object the app already holds and
   carries `src`, the address of the very field it shows, which tests/feed-content.cjs resolves
   again on every run: change a chapter, a word or a question and the test fails until this is
   run again. One object may give several cards, each a DIFFERENT ANGLE on what it holds and
   each with its own kind and its own src path (owner, 2 Oct 2026: "do more… don't be
   constrained") — a word's meaning, its sentence, its memory hook and its origin are four
   cards; no two cards may say ≥ 80% the same words (`nearDup` below, held by the test).

   THE LEVEL IS THE WORD ATLAS REGION — the place Home's progress strip names beside Continue
   ("Act III · The Roman Forum"), nine in the order the child walks them. A card's level is the
   region of the stop it came from: a chapter's cards and words belong to the stop that teaches
   it, a library word to the stop whose word map holds it (trail-map-data.js, each word in ONE
   stop), a question to the region holding the word it asks about. Cards with no place on the
   road carry NO level: the games, the avatar packs' stories, the idioms and similes, and the
   word stories.

   Kinds, and the one field each shows:
     place      the region's road: its stop count, first and last stop          trail-data.js acts
     lesson     a chapter's idea (`concept`), and each teaching card           concepts-data.js
     quiz       the stop's own concept questions (idea, family member, hook)   trail-data.js units[].qs
     word       a chapter word's meaning and respelling, as the chapter has it concepts-data.js words[]
     usage      that word in the chapter's sentence (`ex`), or a library word  … .ex / words-data*.js s
                in the library's sentence
     hook       the chapter's memory hook for the word (`hook`)                … .hook
     origin     the word's etymology (`r`)                                     words-lore.js [0]
     spotlight  a library word from the stop's word map: meaning, respelling   words-data*.js
     play       a word question from the trivia bank, c[0] right              trivia-words.js
     story      an avatar pack's story: its opening (`log`) and each moment    story-data.js (live packs)
     character  each character's part in it (`a` — never the unsourced
                animal fact `f`)
     game       the arcade's own one-line how-to                              app3.js GAMES / SB_ARCADE_GAMES
     fun        an idiom or simile a child is shown (kid:true): the phrase,    figurative-data.js
                its meaning, its example — never the origin story, which the
                library itself marks folk or disputed for many
   Held back: quotes-lib.js / quotes.js (unsourced — data-lint's ratchet), the concept `method`
   blocks (generated drill scaffolding, not prose), the `card` concept questions (their options
   are cut mid-word), the Advanced Pack, the parent coaching tips, capitalised headwords (the
   proper-noun cleanup) and the archived packs' stories.

   SPEED. The cards are written as lazy groups under feed/: an INDEX per level (what the ranking
   needs: id, kind, level, bands, topics, key, group) and BODY chunks of at most 400 cards.
   #/feed loads the indexes for the levels a child can be shown (their own, those passed, the
   next one, and the level-free cards), ranks, and then fetches only the body chunks its twenty
   cards live in. Nothing is on the first screen. tests/feed-screen.cjs holds that.

   Run: node tools/build-feed.cjs        (then node tests/feed-content.cjs) */
'use strict';
const fs = require('fs'), path = require('path');
const { load, APP, regionName } = require('./feed-corpus.cjs');
const C = load();
/* A CARD IS NEVER CUT FROM A RAW GLOSS (audit v4, V3: "is an outfit…", "(ethics)… in the basis",
   "comfy`"). words-patch.js's SB_GLOSS_OK is the test — the same one the word of the hour uses —
   and a meaning that fails it gives no card: not a chapter word's meaning, not a spotlight, not a
   question whose options carry one. A word HELD for the owner's decision (SB_WORDS_HELD) gives no
   card at all. tests/struck-words.cjs re-checks the finished cards. */
const GLOSS_OK = C.win.SB_GLOSS_OK || (() => true);
const HELD = new Set((C.win.SB_WORDS_HELD || []).map((w) => String(w).toLowerCase()));
const heldKey = (it) => !!(it.key && HELD.has(String(it.key).slice(5).toLowerCase()));

const BANDS = ['5-7', '8-10', '11-13', '14-18'];
const from = (k) => BANDS.slice(BANDS.indexOf(k));
const LOWER = /^[a-z]+$/;
/* a long text is cut at a sentence end, never rewritten — so it is always a substring */
function clip(text, max) {
  text = String(text || '').trim(); max = max || 300;
  if (text.length <= max) return text;
  const parts = text.match(/[^.!?]+[.!?]+["”’)]*\s*/g) || [text];
  let out = '';
  for (const p of parts) { if ((out + p).trim().length > max) break; out += p; }
  return (out || parts[0]).trim();               // a first sentence longer than max stays whole
}
const items = [], add = (it) => { if (!heldKey(it)) items.push(it); return it; };

/* ------------------------------------------------------------- the road, region by region */
const LEVELS = C.ACTS.map((a, i) => ({ n: i + 1, id: a.id, title: a.title, name: regionName(a.title) }));
const SPOT_WORDS = 80;              // library words per region (the word maps hold 700–3,600 each; see the manifest)
const wordLevel = {};               // a word → the region whose stop holds it (first stop wins)
C.ACTS.forEach((a, ai) => a.units.forEach((id) => {
  const m = C.MAP[id] || {}; ['1', '2', '3'].forEach((k) => (m[k] || []).forEach((w) => { if (wordLevel[w] == null) wordLevel[w] = ai + 1; }));
  const ch = C.chapterOf(C.UNITS[id]); ((ch && ch.words) || []).forEach((x) => { if (wordLevel[x.w] == null) wordLevel[x.w] = ai + 1; });
}));
const chapterWord = new Set(); C.CONCEPTS.forEach((ch) => (ch.words || []).forEach((x) => chapterWord.add(x.w)));
const usedWord = new Set(), spotAvail = {};

C.ACTS.forEach((a, ai) => {
  const L = ai + 1, lv = LEVELS[ai], units = a.units.map((id) => C.UNITS[id]).filter(Boolean);
  const put = (it) => { it.level = L; return add(it); };

  /* place — the region's road, in its own stop titles */
  const firstT = units[0].title, lastT = units[units.length - 1].title;
  put({ id: 'pl-' + a.id, kind: 'place', src: 'act:' + a.id, route: '#/atlas/honey/' + a.id, cta: 'Open ' + lv.name,
    title: a.title, body: units.length + ' stops on this road, from “' + firstT + '” to “' + lastT + '”.' });

  units.forEach((u) => {
    const ch = C.chapterOf(u); if (!ch) return;
    const csrc = u.neu ? 'unit:' + u.id + ':chapter' : 'concept:' + u.gi, stop = ['stop:' + u.id], R = '#/stop/' + u.id;
    /* lesson — the idea, then each teaching card */
    put({ id: 'li-' + u.id, kind: 'lesson', topics: stop, src: csrc + ':concept', route: R, cta: 'Open this stop', title: ch.title, body: clip(ch.concept) });
    (ch.cards || []).forEach((k, j) => { if (k && k.body) put({ id: 'lc-' + u.id + '-' + j, kind: 'lesson', topics: stop, src: csrc + ':cards:' + j, route: R,
      cta: 'Open this stop', title: ch.title + ' · ' + k.title, body: clip(k.body) }); });
    /* quiz — the stop's own concept questions (c[0] right); the `card` ones are cut mid-word, so not those */
    (u.qs || []).forEach((q, j) => {
      if (!q || q.ty === 'card' || !q.c || q.c.length < 3 || new Set(q.c).size !== q.c.length) return;
      if (q.q.toLowerCase().includes(String(q.c[0]).toLowerCase())) return;
      put({ id: 'uq-' + u.id + '-' + j, kind: 'quiz', topics: stop, src: 'unit:' + u.id + ':qs:' + j, route: R, cta: 'Open this stop',
        title: q.ty === 'idea' ? 'The big idea' : q.ty === 'member' ? 'Which belongs?' : 'Whose hook?', play: { q: q.q, opts: q.c.slice(0, 4), after: 'From “' + ch.title + '”.' } });
    });
    /* a chapter's own words — four angles each */
    if (!u.neu) (ch.words || []).forEach((x, j) => {
      /* only a word the served library still holds: the proper-noun and safety cleanups removed some
         chapter words (philadelphia, vasectomy…) from the library, and a feed card must not bring one back */
      if (!x || !x.w || !LOWER.test(x.w) || usedWord.has(x.w) || !C.WORD[x.w]) return;
      usedWord.add(x.w);
      const ws = 'concept:' + u.gi + ':words:' + j, t = ['stop:' + u.id, 'word:' + x.w], key = 'word:' + x.w, rt = '#/word/' + x.w, clipOk = C.VOICED.has(x.w) ? 1 : 0;
      if (x.def && GLOSS_OK(x.def, x.w)) put({ id: 'wd-' + x.w, kind: 'word', topics: t, key, src: ws + ':def', route: rt, cta: 'Open the word card', title: x.w, roman: x.say || '', body: x.def, clip: clipOk });
      if (x.ex) put({ id: 'wx-' + x.w, kind: 'usage', topics: t, key, src: ws + ':ex', route: rt, cta: 'Open the word card', title: 'In a sentence · ' + x.w, body: x.ex, clip: clipOk });
      if (x.hook) put({ id: 'wh-' + x.w, kind: 'hook', topics: t, key, src: ws + ':hook', route: rt, cta: 'Open the word card', title: 'Remember it · ' + x.w, body: x.hook });
      const lore = C.LORE[x.w];
      if (lore && lore[0]) put({ id: 'wo-' + x.w, kind: 'origin', topics: t, key, src: 'lore:' + x.w + ':0', route: rt, cta: 'Open the word card', title: 'Where it comes from · ' + x.w, body: lore[0] });
    });
  });

  /* play — the trivia bank's questions about words that live in this region */
  C.TRIVIA.forEach((q) => {
    if (q.th === 'wstories' || !q.c || q.c.length < 3) return;
    const w = q.th === 'wroots' ? q.c[0] : ((q.q.match(/“([^”]+)”/) || [])[1]);
    if (!w || !LOWER.test(w) || wordLevel[w] !== L || !C.WORD[w]) return;
    const opts = q.c.slice(0, 4);
    if (new Set(opts).size !== opts.length) return;
    if (q.th !== 'wbreak' && q.q.toLowerCase().includes(String(opts[0]).toLowerCase())) return;   // a question that gives its answer away
    if (q.th === 'wmeaning' && !opts.every((o) => GLOSS_OK(o))) return;                          // an option that is a raw gloss
    put({ id: 'pq-' + q.id, kind: 'play', bands: q.lv >= 4 ? from('11-13') : undefined, topics: ['word:' + w], key: 'word:' + w,
      src: 'trivia:' + q.id, route: '#/word/' + w, cta: 'Open “' + w + '”', title: q.th === 'wmeaning' ? 'What does it mean?' : q.th === 'wroots' ? 'Which word?' : 'Break it down',
      play: { q: q.q, opts, after: q.f || '' } });
  });

  /* spotlight — library words from this region's word map (easiest band first), three angles each */
  let n = 0, avail = 0;
  units.forEach((u) => ['1', '2', '3'].forEach((band) => ((C.MAP[u.id] || {})[band] || []).forEach((w) => {
    const r = C.WORD[w];
    if (!r || !LOWER.test(w) || chapterWord.has(w) || usedWord.has(w) || wordLevel[w] !== L || !r.d || !r.p) return;
    if (r.d.toLowerCase().includes(w)) return;                                           // a meaning that spells its word
    if (!GLOSS_OK(r.d, w)) return;                                                       // a raw gloss
    avail++; if (n >= SPOT_WORDS) return;
    usedWord.add(w); n++;
    const t = ['stop:' + u.id, 'word:' + w], key = 'word:' + w, rt = '#/word/' + w, bands = (r.y || 1) >= 4 ? from('11-13') : undefined, clipOk = C.VOICED.has(w) ? 1 : 0;
    put({ id: 'ws-' + w, kind: 'spotlight', bands, topics: t, key, src: 'library:' + w + ':d', route: rt, cta: 'Open the word card', title: 'Word spotlight · ' + w, roman: r.p, body: r.d, clip: clipOk });
    if (r.s && r.s.toLowerCase().includes(w)) put({ id: 'wu-' + w, kind: 'usage', bands, topics: t, key, src: 'library:' + w + ':s', route: rt, cta: 'Open the word card', title: 'In a sentence · ' + w, body: r.s, clip: clipOk });
    const lore = C.LORE[w];
    if (lore && lore[0]) put({ id: 'wo-' + w, kind: 'origin', bands, topics: t, key, src: 'lore:' + w + ':0', route: rt, cta: 'Open the word card', title: 'Where it comes from · ' + w, body: lore[0] });
  })));
  spotAvail[L] = avail;
});

/* ------------------------------------------------------------- level-agnostic */
/* the arcade games on the Play tab only: GAMES (Beat the Buzzer, Word Quiz) left the tab on 4 Oct 2026
   (games spec §3.1) and live on inside the hubs, so a card saying "Play Beat the Buzzer" would open nothing */
C.ARCADE.forEach((g) => add({ id: 'ga-' + g.k, kind: 'game', topics: ['game:' + g.k], src: 'game:SB_ARCADE_GAMES:' + g.k, route: '#/play', cta: 'Play', title: g.n, body: g.blurb }));

/* story — the packs a child can still collect; an archived pack's story is not shown */
const LIVE_PACKS = new Set(C.AVATARS.packs.map((p) => p.label));
C.ARCS.forEach((arc, ai) => {
  if (!LIVE_PACKS.has(arc.pack)) return;
  const t = ['pack:' + arc.pack], R = '#/hive/avatars', cta = 'See the ' + arc.pack;
  if (arc.log) add({ id: 'so-' + ai, kind: 'story', topics: t, src: 'arc:' + ai + ':log', route: R, cta, title: arc.title, body: arc.log });
  (arc.beats || []).forEach((b, j) => add({ id: 'st-' + ai + '-' + j, kind: 'story', topics: t, src: 'arc:' + ai + ':beats:' + j, route: R, cta, title: arc.title + ' · ' + b.t, body: b.x }));
  (arc.cast || []).forEach((p, j) => { if (p.n && p.a) add({ id: 'sc-' + ai + '-' + j, kind: 'character', topics: t, src: 'arc:' + ai + ':cast:' + j, route: R, cta,
    title: p.n + (p.r ? ' · ' + p.r : ''), body: p.a }); });
});

/* fun — idioms and similes a child is shown, meaning and example only */
const DIFF = { easy: undefined, medium: from('8-10'), hard: from('11-13') };
['idioms', 'similes'].forEach((k) => (C.FIG[k] || []).forEach((f, i) => {
  if (!f.kid || !f.p || !f.m || !f.ex) return;
  add({ id: 'fg-' + k[0] + i, kind: 'fun', bands: f.diff in DIFF ? DIFF[f.diff] : from('8-10'), topics: ['fig:' + k], src: 'fig:' + k + ':' + i,
    route: '#/figurative', cta: 'More ' + k, title: (k === 'idioms' ? 'Idiom · ' : 'Simile · ') + f.p, body: f.m, source: '“' + f.ex + '”' });
}));

/* word stories — eponyms and literal origins, asked as a question */
C.TRIVIA.filter((q) => q.th === 'wstories' && q.c && q.c.length >= 3 && new Set(q.c.slice(0, 4)).size === Math.min(4, q.c.length)
  && !q.q.toLowerCase().includes(String(q.c[0]).toLowerCase())).forEach((q) =>
  add({ id: 'pq-' + q.id, kind: 'play', bands: q.lv >= 4 ? from('11-13') : undefined, topics: ['stories'], src: 'trivia:' + q.id, route: '#/trivia',
    cta: 'More word stories', title: 'Word story', play: { q: q.q, opts: q.c.slice(0, 4), after: q.f || '' } }));

/* ------------------------------------------------------------- no near-duplicates */
/* Two cards must not say ≥ 80% the same words (the owner's rule). What a card SAYS is its title,
   body, example and question together. Candidates share one of each other's rarer words; the
   later card of a near pair is dropped (the earlier is the more central angle). The same
   function, from tools/feed-near.cjs, is what the test runs over the finished set. */
const { textOf, nearDup } = require('./feed-near.cjs');
const nd = nearDup(items);
const kept = items.filter((_, i) => !nd.drop.has(i));

/* ------------------------------------------------------------- write: an index per level, bodies in chunks */
const seen = {};
kept.forEach((it) => { if (seen[it.id]) throw new Error('two feed cards share the id ' + it.id); seen[it.id] = 1; });
kept.forEach((it) => { ['bands', 'roman', 'source', 'clip', 'topics', 'key'].forEach((k) => { if (it[k] == null || it[k] === '' || it[k] === 0) delete it[k]; }); });
const CHUNK = 400, chunks = {}, counters = {};
const groupOf = (lv) => (lv == null ? 0 : lv);
kept.forEach((it) => { const g = groupOf(it.level), n = counters[g] = (counters[g] || 0) + 1; it.g = g + '-' + Math.floor((n - 1) / CHUNK); (chunks[it.g] = chunks[it.g] || []).push(it); });
const KEYS = ['id', 'kind', 'level', 'bands', 'topics', 'key', 'g'];
const head = '/* GENERATED by tools/build-feed.cjs from Bee\'s corpus — never edit by hand. Lazy (bee-feed.js loads it). */\n';
const DIR = path.join(APP, 'feed');
fs.mkdirSync(DIR, { recursive: true });
for (const f of fs.readdirSync(DIR)) if (/^(f[ib].*|feed-meta)\.js$/.test(f)) fs.unlinkSync(path.join(DIR, f));
const GROUPS = [0].concat(LEVELS.map((l) => l.n));
const files = { index: {}, body: {} };
GROUPS.forEach((g) => {
  const rows = kept.filter((it) => groupOf(it.level) === g).map((it) => KEYS.map((k) => (it[k] === undefined ? null : it[k])));
  const name = 'fi' + g + '.js';
  fs.writeFileSync(path.join(DIR, name), head + 'window.SB_FEED_IDX = window.SB_FEED_IDX || {};\nwindow.SB_FEED_IDX[' + g + '] = ' + JSON.stringify(rows) + ';\n');
  files.index[g] = name;
});
Object.keys(chunks).forEach((g) => {
  const body = {}; chunks[g].forEach((it) => { const o = Object.assign({}, it); KEYS.forEach((k) => { delete o[k]; }); body[it.id] = o; });
  const name = 'fb' + g + '.js';
  fs.writeFileSync(path.join(DIR, name), head + 'window.SB_FEED_BODY = window.SB_FEED_BODY || {};\nObject.assign(window.SB_FEED_BODY, ' + JSON.stringify(body) + ');\n');
  files.body[g] = name;
});
fs.writeFileSync(path.join(DIR, 'feed-meta.js'), head + 'window.SB_FEED_META = ' + JSON.stringify({
  keys: KEYS, levels: LEVELS.map((l) => ({ n: l.n, id: l.id, name: l.name })),
  units: Object.fromEntries(Object.values(C.UNITS).map((u) => [u.id, u.level])), index: files.index, body: files.body }) + ';\n');

const byKind = {}, byLevel = {}; let agnostic = 0;
kept.forEach((it) => { byKind[it.kind] = (byKind[it.kind] || 0) + 1; if (it.level == null) agnostic++; else byLevel[it.level] = (byLevel[it.level] || 0) + 1; });
fs.writeFileSync(path.join(__dirname, 'feed-manifest.json'), JSON.stringify({ total: kept.length, agnostic, byKind,
  byLevel: LEVELS.map((l) => [l.n, l.name, byLevel[l.n] || 0]), nearDuplicatesDropped: nd.pairs.length, nearDuplicateExamples: nd.pairs.slice(0, 12),
  libraryWordsHeldBackPerLevel: LEVELS.map((l) => [l.n, Math.max(0, spotAvail[l.n] - SPOT_WORDS)]) }, null, 1) + '\n');
console.log('feed: ' + kept.length + ' cards (' + nd.pairs.length + ' near-duplicates dropped) — ' + Object.keys(byKind).map((k) => k + ' ' + byKind[k]).join(' · '));
console.log('  by level: ' + LEVELS.map((l) => l.n + ' ' + l.name + ' ' + (byLevel[l.n] || 0)).join(' · ') + ' · no level ' + agnostic);
console.log('  files: ' + Object.keys(files.index).length + ' indexes, ' + Object.keys(files.body).length + ' body chunks in feed/');
void textOf;
