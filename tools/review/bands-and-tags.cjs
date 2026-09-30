#!/usr/bin/env node
/* ============================================================================
   THE LIST BUILDER'S EDITORIAL CALLS, LAID OUT TO BE JUDGED.
   ----------------------------------------------------------------------------
   Three things in the List Builder are judgement, not arithmetic, and a person
   who has run a spelling bee should look at them:

     1. THE FIVE DIFFICULTY BAND LABELS. Gentle · Steady · Testing · Hard ·
        Brutal, cut at spellDiff 32.5 / 42 / 50 / 60.5. The cut points are
        defensible from the distribution; the WORDS in each band are the only
        way to judge whether the label is fair. A parent reads "Brutal" and
        decides whether to hand it to their nine-year-old.
     2. THE FIVE BEE-PROBABILITY LABELS. Long shot → Bee staple, on `bp`.
     3. THE ELEVEN TAG GROUPS and ELEVEN ORIGIN FAMILIES. 768 flat tags is a
        haystack; the grouping is ~450 hand assignments. What matters for review
        is not the assignments that landed — it is the tags that landed NOWHERE,
        because those are invisible in the filter rail.

   It computes against the REAL library in a real browser, because the corpus is
   sharded and lazy and most of the interesting fields are computed at runtime.

   USAGE  node tools/review/bands-and-tags.cjs      → tools/review/build/review.html
   ==========================================================================*/
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const APP = path.resolve(__dirname, '..', '..');
const OUT = path.join(__dirname, 'build');

const esc = t => String(t == null ? '' : t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const pg = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  await pg.goto('file://' + APP + '/index.html');
  /* `fullWords()` is the accessor, not `wordDB()` — that one returns a keyed MAP and
     reads as an empty array if you ask it for a length. The core arrives on an idle
     queue and the 1,915-word championship shard merges LATER, inside fullWords()
     itself, so wait for the count to stop growing rather than for a threshold. */
  process.stdout.write('waiting for the full library');
  await pg.evaluate(() => { try { loadFullLibrary(); } catch (e) {} });
  /* words-hard.js is appended by words-full.js's own onload and merged by a SECOND
     fullWords() call, so "the count stopped growing" is not the finish line — wait for
     mergeHard's non-enumerable `_hard` stamp, which is the shard's own receipt. */
  let n = 0, hard = false;
  for (let i = 0; i < 120 && !hard; i++) {
    await pg.waitForTimeout(2000);
    const r = await pg.evaluate(() => { try { const a = fullWords(); return { n: (a && a.length) || 0, hard: !!(a && a._hard) }; } catch (e) { return { n: 0, hard: false }; } });
    n = r.n; hard = r.hard;
    process.stdout.write('.');
  }
  console.log(' — ' + n.toLocaleString() + ' words' + (hard ? ' (championship shard merged)' : ' (NO championship shard)'));
  if (!n) { await browser.close(); console.error('ABORT: the library never loaded'); process.exit(1); }

  const data = await pg.evaluate(() => {
    const db = fullWords();
    /* app3.js declares these as top-level `const`, which lands in the SCRIPT's lexical
       scope and never on `window` — the same trap CLAUDE.md records for `app`. A bare
       identifier resolves; `window.B2_DIFF` is undefined. */
    const DIFF = (typeof B2_DIFF !== 'undefined' ? B2_DIFF : []);
    const ODDS = (typeof B2_ODDS !== 'undefined' ? B2_ODDS : []);
    if (!DIFF.length || !ODDS.length) return { err: 'B2_DIFF / B2_ODDS are not in scope' };
    const band = (tab, v) => { for (let i = 0; i < tab.length; i++) if (v < tab[i].hi) return i; return tab.length - 1; };
    const out = { total: db.length, hard: !!db._hard, diff: [], odds: [], tagGroups: [], ungrouped: [], origFams: [], unmatchedOrig: [] };

    const dbuck = DIFF.map(() => []), obuck = ODDS.map(() => []);
    const tagCount = Object.create(null), origCount = Object.create(null);
    for (const w of db) {
      const d = spellDiff(w);
      dbuck[band(DIFF, d)].push(w);
      if (typeof w.bp === 'number') obuck[band(ODDS, w.bp)].push(w);
      if (Array.isArray(w.t)) for (const t of w.t) tagCount[t] = (tagCount[t] || 0) + 1;
      if (w.o) origCount[w.o] = (origCount[w.o] || 0) + 1;
    }
    const sample = (arr, n) => {
      const s = [], step = Math.max(1, Math.floor(arr.length / n));
      for (let i = 0; i < arr.length && s.length < n; i += step) s.push(arr[i].w);
      return s;
    };
    DIFF.forEach((b, i) => out.diff.push({
      lab: b.lab, hi: b.hi === 1e9 ? '∞' : b.hi, n: dbuck[i].length,
      pct: +(dbuck[i].length / db.length * 100).toFixed(1),
      sample: sample(dbuck[i].slice().sort((a, c) => spellDiff(a) - spellDiff(c)), 14),
    }));
    ODDS.forEach((b, i) => out.odds.push({
      lab: b.lab, hi: b.hi === 1e9 ? '∞' : b.hi, n: obuck[i].length,
      pct: +(obuck[i].length / db.length * 100).toFixed(1),
      sample: sample(obuck[i].slice().sort((a, c) => (a.bp || 0) - (c.bp || 0)), 14),
    }));

    const G = (typeof B2_TAGGRP !== 'undefined' ? B2_TAGGRP : []);
    const claimed = new Set();
    for (const g of G) for (const t of g[3]) claimed.add(t);
    for (const g of G) {
      let words = 0; const tags = [];
      for (const t of g[3]) { const c = tagCount[t] || 0; if (c) { words += c; tags.push([t, c]); } }
      tags.sort((a, b) => b[1] - a[1]);
      out.tagGroups.push({ id: g[0], label: g[1], tagsListed: g[3].length, tagsSeen: tags.length, words, top: tags.slice(0, 10) });
    }
    out.ungrouped = Object.entries(tagCount).filter(([t]) => !claimed.has(t))
      .sort((a, b) => b[1] - a[1]).slice(0, 60);
    out.ungroupedTotal = Object.entries(tagCount).filter(([t]) => !claimed.has(t)).length;

    const F = (typeof B2_ORIGRP !== 'undefined' ? B2_ORIGRP : []);
    const fam = F.map(() => 0); let unmatched = [];
    for (const [name, c] of Object.entries(origCount)) {
      const i = b2OrigFam(name);
      if (i >= 0) fam[i] += c; else unmatched.push([name, c]);
    }
    F.forEach((f, i) => out.origFams.push({ id: f[0], label: f[1], keys: f[2].length, words: fam[i] }));
    unmatched.sort((a, b) => b[1] - a[1]);
    out.unmatchedOrig = unmatched.slice(0, 40);
    out.unmatchedOrigTotal = unmatched.length;
    out.unmatchedOrigWords = unmatched.reduce((s, x) => s + x[1], 0);
    return out;
  });
  await browser.close();
  if (data.err) { console.error('ABORT: ' + data.err); process.exit(1); }

  const chips = a => a.map(w => `<span class="w">${esc(w)}</span>`).join('');
  const rows = (a, cols) => a.map(r => `<tr>${cols.map(c => `<td>${c(r)}</td>`).join('')}</tr>`).join('');

  const html = `<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>List Builder — editorial review</title>
<style>
 :root{--ink:#241E33;--mut:#7A6E5C;--line:#E7E1D6;--bg:#FDFBF7;--hi:#F0B429;--acc:#5A3FD6}
 @media (prefers-color-scheme:dark){:root:not([data-theme=light]){--ink:#F2ECE1;--mut:#A79B86;--line:#3A3446;--bg:#1A1626}}
 body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.6 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:0 16px 80px}
 .wrap{max-width:960px;margin:0 auto}
 h1{font-size:28px;margin:34px 0 4px;letter-spacing:-.01em}
 h2{font-size:20px;margin:40px 0 6px;padding-top:18px;border-top:1px solid var(--line)}
 p.lede{color:var(--mut);margin:0 0 18px;max-width:64ch}
 table{width:100%;border-collapse:collapse;margin:10px 0 4px;font-size:14px}
 th,td{text-align:left;padding:9px 10px;border-bottom:1px solid var(--line);vertical-align:top}
 th{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--mut);font-weight:700}
 td.n{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
 .lab{font-weight:800}
 .w{display:inline-block;border:1px solid var(--line);border-radius:999px;padding:1px 9px;margin:2px 3px 2px 0;font-size:13px;background:rgba(240,180,41,.09)}
 .ask{background:rgba(240,180,41,.13);border-left:3px solid var(--hi);padding:12px 14px;border-radius:0 10px 10px 0;margin:12px 0}
 .ask b{display:block;margin-bottom:2px}
 code{font:13px ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:5px}
 @media (prefers-color-scheme:dark){:root:not([data-theme=light]) code{background:rgba(255,255,255,.07)}}
 footer{margin-top:44px;color:var(--mut);font-size:13px;border-top:1px solid var(--line);padding-top:14px}
</style>
<div class="wrap">
<h1>List Builder — the calls that need a person</h1>
<p class="lede">Generated from the live library — <b>${data.total.toLocaleString()} words</b>${data.hard ? ', championship shard included' : ', <b>without</b> the 1,915-word championship shard'}. Everything below is
my judgement, not arithmetic, and it ships to parents as fact. The cut points are defensible from the
distribution; the <em>labels</em> and the <em>groupings</em> are the part to argue with.</p>

<h2>1 · The five difficulty bands</h2>
<p class="lede">Cut on <code>spellDiff</code> — trickiness dominates, rarity and length are minor terms. A
parent reads the label and decides what to hand their child, so judge the label against the words.</p>
<table><tr><th>Label</th><th class="n">Under</th><th class="n">Words</th><th class="n">Share</th><th>Across the band, easiest → hardest</th></tr>
${rows(data.diff, [r => `<span class="lab">${esc(r.lab)}</span>`, r => r.hi, r => r.n.toLocaleString(), r => r.pct + '%', r => chips(r.sample)])}</table>
<div class="ask"><b>The question</b>Is “Brutal” the right word for that last row, and is “Gentle” fair to the first? Rename freely — they are five strings in <code>B2_DIFF</code>.</div>

<h2>2 · The five bee-probability bands</h2>
<p class="lede">Cut on <code>bp</code>, the bee-probability score, which tracks the competition tier
(<code>nt</code>) closely — Open ≈ 31, Finals ≈ 71.</p>
<table><tr><th>Label</th><th class="n">Under</th><th class="n">Words</th><th class="n">Share</th><th>Across the band</th></tr>
${rows(data.odds, [r => `<span class="lab">${esc(r.lab)}</span>`, r => r.hi, r => r.n.toLocaleString(), r => r.pct + '%', r => chips(r.sample)])}</table>
<div class="ask"><b>The question</b>“Bee staple” is a claim about real competitions. Does the last row earn it?</div>

<h2>3 · The eleven tag groups</h2>
<p class="lede">768 flat tags is a haystack, so each is assigned to one of eleven groups — roughly 450
hand assignments. <b>The assignments that landed are the easy part.</b> What matters is the tail below.</p>
<table><tr><th>Group</th><th class="n">Tags listed</th><th class="n">Seen in corpus</th><th class="n">Words</th><th>Biggest members</th></tr>
${rows(data.tagGroups, [r => `<span class="lab">${esc(r.label)}</span>`, r => r.tagsListed, r => r.tagsSeen, r => r.words.toLocaleString(), r => chips(r.top.map(t => t[0] + ' ' + t[1]))])}</table>

<h2>4 · Tags that landed in no group — ${data.ungroupedTotal} of them</h2>
<p class="lede"><b>This is the actionable list.</b> A tag in no group is invisible in the filter rail: the
words carry it and nothing can select them. The top 60 by word count:</p>
<p>${chips(data.ungrouped.map(t => t[0] + ' · ' + t[1]))}</p>
<div class="ask"><b>The question</b>Which of these deserve a home, and which are noise that should stay out? Each is one string added to a group's list in <code>B2_TAGGRP</code>.</div>

<h2>5 · The eleven origin families</h2>
<p class="lede">Matched on keyword substrings rather than an enumerated name list, deliberately: the field
carries case variants, an abbreviation, and twenty-odd compounds (“Latin and Greek”, “Spanish from
Nahuatl”). First match wins, so a compound lands in the earliest family it names — the order below
<em>is</em> that decision.</p>
<table><tr><th>#</th><th>Family</th><th class="n">Keywords</th><th class="n">Words</th></tr>
${rows(data.origFams.map((r, i) => ({ ...r, i: i + 1 })), [r => r.i, r => `<span class="lab">${esc(r.label)}</span>`, r => r.keys, r => r.words.toLocaleString()])}</table>

<h2>6 · Origins that matched no family — ${data.unmatchedOrigTotal} strings, ${data.unmatchedOrigWords.toLocaleString()} words</h2>
<p>${data.unmatchedOrig.length ? chips(data.unmatchedOrig.map(t => t[0] + ' · ' + t[1])) : '<em>none — every origin string lands somewhere</em>'}</p>

<footer>Generated by <code>tools/review/bands-and-tags.cjs</code> against the live library.
Re-run it after any change to <code>B2_DIFF</code>, <code>B2_ODDS</code>, <code>B2_TAGGRP</code> or <code>B2_ORIGRP</code>.</footer>
</div>`;

  const file = path.join(OUT, 'review.html');
  fs.writeFileSync(file, html);
  console.log('→ ' + file);
  console.log(`   ${data.total.toLocaleString()} words · ${data.ungroupedTotal} ungrouped tags · ${data.unmatchedOrigTotal} unmatched origins`);
})();
