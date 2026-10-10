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
     place      the region's road: its stop count, first and last stop          trail-road.js place() (lap 1)
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
     analogy    an Analogy Atlas question (stem from the lesson's bank, the    analogy-data.js items
                item's answer and recipe wrong answers; level = the item's),
                and each analogy lesson's idea, spot-it and trap (no level)    analogy-data.js lessons
     sounds     a homophone group, each word with the library's meaning        sounds-data.js SB_HOM
     saying     a word's two written pronunciations and the library's note     sounds-data.js SB_ALT_PRON
   Doubled 10 Oct 2026 (owner: "look for additional content and double the feed cards… e.g. analogies"):
   14,169 → 28,874, by the three sources above and 650 library words per region (was 80).
   Held back: quotes-lib.js / quotes.js (unsourced — data-lint's ratchet), the concept `method`
   blocks (generated drill scaffolding, not prose), the `card` concept questions (their options
   are cut mid-word), the Advanced Pack, the parent coaching tips, capitalised headwords (the
   proper-noun cleanup) and the archived packs' stories.

   SPEED. The cards are written as lazy groups under feed/: an INDEX per level (what the ranking
   needs: id, kind, level, bands, topics, key, group) and BODY chunks of at most 400 cards.
   #/feed loads the indexes for the levels a child can be shown (their own, those passed, the
   next one, and the level-free cards), ranks, and then fetches only the body chunks its twenty
   cards live in. Nothing is on the first screen. tests/feed-screen.cjs holds that.

   Dropped, never edited (10 Oct 2026, the 4.5 brief): a card on the stigma list (tools/stigma.cjs) and a root
   question whose answer's stem sits in its prompt (tools/root-leak.cjs). A place card's count is the board's
   (trail-road.js), never units.length.

   Run: node tools/build-feed.cjs        (then node tests/feed-content.cjs) */
'use strict';
const fs = require('fs'), path = require('path');
const { load, APP, regionName } = require('./feed-corpus.cjs');
const STIGMA = require('./stigma.cjs');                 // the stigma list (kid-safe.js), node's one door to it
const { leak: rootLeak } = require('./root-leak.cjs');  // a root question whose answer's stem is in its prompt
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
const SPOT_WORDS = 650;             // library words per region (the word maps hold 700–3,600 each; see the manifest)
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

  /* place — the region's road as its own board counts it (the 4.5 brief, P0.14): trail-road.js's place(),
     the function trail.js builds the board from — stops AND checkpoints, on the first walk (lap 1). It used
     to say `units.length`, every lap's units at once: the Meadow board said 13 where the card said 11, the
     Big Stage 2 where it said 15. A child on a later lap gets the same function's words for their lap
     (bee-feed.js re-cuts the card); tests/feed-content.cjs holds the card to the board for all nine. */
  const road = C.ROAD.place(C.TRAIL, a.id, 1);
  if (road) put({ id: 'pl-' + a.id, kind: 'place', src: 'act:' + a.id, route: '#/atlas/honey/' + a.id, cta: 'Open ' + lv.name,
    title: a.title, body: road.body });

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
    if (rootLeak(q)) return;                                                                      // …or its stem, inside a root's Latin or Greek form
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

/* ------------------------------------------------------------- analogies (the Analogy Atlas, analogy-data.js) */
/* One question per item, exactly as the tab builds it: a stem pair from the lesson's own hand-written bank
   (never sharing a word with the item, never containing the answer), C, and the item's answer first with its
   recipe wrong answers after (the card orders them by its id). The level is the item's own level, which the
   engine cut per Bee level — the same nine the feed counts. The answer's gloss, when it reads cleanly, is
   what the card says after. Then each lesson's idea, its "spot it" and its trap, with no level. */
const fnv = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h; };
const ANL = C.ANL, anlLesson = {};
ANL.lessons.forEach((l) => l.rels.forEach((r) => { anlLesson[r] = l; }));
const anlStem = (L, rel, words, d) => (L.stems || []).filter((x) => ((x[2] || rel) === rel || L.id !== 'family') && words.indexOf(x[0]) < 0 && words.indexOf(x[1]) < 0
  && !(x[0] + ' ' + x[1]).toLowerCase().includes(d.toLowerCase()));
const anlQ = (a, b, c) => a + ' is to ' + b + ' as ' + c + ' is to …';
Object.keys(ANL.items).forEach((id) => {
  const it = ANL.items[id], [rel, lv, c, d] = it, L = anlLesson[rel]; if (!L) return;
  const wrong = it.slice(4).map((x) => String(x).split('|')[0]).slice(0, 3); if (!wrong.length) return;
  const opts = [d].concat(wrong); if (new Set(opts).size !== opts.length) return;
  /* the Atlas asks an item only when every word on it passes kidSafe for the child (analogy.js itemOK, the 4.5
     brief P0.7) — so does the feed: a word no game may serve (murder, a stigmatising gloss) drops the card, and
     one held back under eleven (absinthe) lifts it to the 11–13 band */
  const kidWhy = (age) => opts.concat(c).map((x) => STIGMA.K.why({ w: x, d: ANL.gloss[x] || (C.WORD[x] || {}).d || '' }, age)).find(Boolean);
  if (kidWhy(99)) return;
  const under11 = !!kidWhy(8);
  const pool = anlStem(L, rel, opts.concat(c), d); if (!pool.length) return;
  const st = pool[fnv('feed|' + id) % pool.length], q = anlQ(st[0], st[1], c), title = 'Analogy · ' + L.title;
  if ((q + ' ' + title).toLowerCase().includes(d.toLowerCase())) return;                           // the question gives its answer away
  const g = ANL.gloss[d], after = g && GLOSS_OK(g, d) && !g.toLowerCase().includes(d.toLowerCase()) ? d + ': ' + g : '';
  add({ id: 'aq-' + id, kind: 'analogy', level: lv, bands: lv >= 7 || under11 ? from('11-13') : lv >= 5 ? from('8-10') : undefined, topics: ['anl:' + L.id],
    src: 'anl:' + id, route: '#/analogies', cta: 'Open the Analogy Atlas', title, play: { q, opts, after } });
});
ANL.lessons.forEach((L) => [['idea', 'Analogies · '], ['spot', 'Spot it · '], ['trap', 'The trap · ']].forEach(([f, pre]) => {
  if (L[f]) add({ id: 'al-' + L.id + '-' + f, kind: 'analogy', topics: ['anl:' + L.id], src: 'anl-lesson:' + L.id + ':' + f, route: '#/analogies',
    cta: 'Open the Analogy Atlas', title: pre + L.title, body: L[f] });
}));

/* ------------------------------------------------------------- how words sound (sounds-data.js) */
/* sound-alikes: a homophone group whose every word the served library holds with a clean meaning — the
   words in the title, each one's own meaning in the body. Two ways to say it: a word with two written
   pronunciations, both shown with the library's note. A card's level is the region of its (first) word. */
const lvOf = (ws) => { const ls = ws.map((x) => wordLevel[x]).filter((x) => x != null); return ls.length ? Math.min.apply(null, ls) : undefined; };
C.HOM.forEach((grp, i) => {
  const ws = [...new Set(grp)];
  if (ws.length < 2 || ws.some((x) => !LOWER.test(x) || !C.WORD[x] || !C.WORD[x].d || !GLOSS_OK(C.WORD[x].d, x) || HELD.has(x))) return;
  if (ws.some((x) => ws.some((y) => C.WORD[x].d.toLowerCase().includes(y)))) return;                // a meaning that spells a partner
  add({ id: 'hs-' + i, kind: 'sounds', level: lvOf(ws), topics: ws.map((x) => 'word:' + x), src: 'hom:' + i, route: '#/word/' + ws[0],
    cta: 'Open “' + ws[0] + '”', title: 'Sound the same · ' + ws.join(' · '), body: ws.map((x) => x + ': ' + C.WORD[x].d).join('  ·  ') });
});
Object.keys(C.ALT).forEach((w) => {
  const r = C.ALT[w], lib = C.WORD[w];
  if (!LOWER.test(w) || !lib || HELD.has(w) || !r || !r.a || !r.b || r.a === r.b) return;
  const body = r.n && r.n !== 'also heard' ? r.a + ' or ' + r.b + ' — ' + r.n : r.a + ', also heard ' + r.b + '.';
  add({ id: 'ap-' + w, kind: 'saying', level: wordLevel[w], topics: ['word:' + w], key: 'word:' + w, src: 'alt:' + w, route: '#/word/' + w,
    cta: 'Open the word card', title: 'Two ways to say it · ' + w, body, clip: C.VOICED.has(w) ? 1 : 0 });
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
/* no card whose words call anyone an idiot, a moron or worse — a library sentence or an origin can (the
   sycamore's lore, a sentence for "irresponsible"); the list is tests/struck-words.cjs's INSULT, held there */
const INSULT = new Set(['idiot', 'idiots', 'idiotic', 'moron', 'morons', 'moronic', 'cretin', 'cretins', 'imbecile', 'imbeciles',
  'mongolism', 'negroid', 'midget', 'midgets', 'hottentot', 'hottentots']);
const rude = (it) => [it.title, it.body, it.source].concat(it.play ? [it.play.q, it.play.after].concat(it.play.opts) : [])
  .some((x) => (String(x || '').toLowerCase().match(/[a-z]+(?:-[a-z]+)*/g) || []).some((t) => INSULT.has(t)));
/* …nor any card whose words hurt someone for a disability, their mental health, their ethnicity or their body
   (the 4.5 brief, P0.11–P0.13: "the tragic spectacle of cripples" was a usage card). The list is kid-safe.js's,
   read through tools/stigma.cjs; a card is DROPPED, never edited — its source is fixed at rest by
   tools/stigma-fix.cjs, and tests/stigma.cjs holds the finished cards to the same list. */
let stigmaDropped = 0;
for (let i = items.length - 1; i >= 0; i--) if (rude(items[i])) items.splice(i, 1);
  else if (STIGMA.hit(STIGMA.cardText(items[i]))) { items.splice(i, 1); stigmaDropped++; }
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
  byLevel: LEVELS.map((l) => [l.n, l.name, byLevel[l.n] || 0]), stigmaDropped, nearDuplicatesDropped: nd.pairs.length, nearDuplicateExamples: nd.pairs.slice(0, 12),
  libraryWordsHeldBackPerLevel: LEVELS.map((l) => [l.n, Math.max(0, spotAvail[l.n] - SPOT_WORDS)]) }, null, 1) + '\n');
console.log('feed: ' + kept.length + ' cards (' + nd.pairs.length + ' near-duplicates, ' + stigmaDropped + ' on the stigma list dropped) — ' + Object.keys(byKind).map((k) => k + ' ' + byKind[k]).join(' · '));
console.log('  by level: ' + LEVELS.map((l) => l.n + ' ' + l.name + ' ' + (byLevel[l.n] || 0)).join(' · ') + ' · no level ' + agnostic);
console.log('  files: ' + Object.keys(files.index).length + ' indexes, ' + Object.keys(files.body).length + ' body chunks in feed/');
void textOf;
