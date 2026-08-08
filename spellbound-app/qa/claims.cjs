/* Every number the creative plan wants to put in public, counted from the shipping build.
   The plan says to do this ("verify against the shipping build before they appear in any
   public claim") and it disagrees with itself twice: 41,136 vs 41,652 recorded words, and
   13 vs 14 engines. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await p.goto('http://localhost:8991/index.html');
  await p.waitForTimeout(7000);
  // pull in everything lazy so the counts are the real ones
  await p.evaluate(async () => {
    const gs = ['words','trivia','saga','concepts','trail','advanced','sounds','vocab','atlas','figurative'];
    await Promise.all(gs.map(g => new Promise(r => {
      try { window.SB_LAZY ? SB_LAZY.need(g, r) : r(); } catch (e) { r(); } })));
    await new Promise(r => setTimeout(r, 3000));
  });
  console.log(await p.evaluate(() => {
    const L = [];
    const n = (label, v, claimed) => L.push(
      `  ${String(label).padEnd(34)} ${String(v).padStart(9)}   plan says ${claimed}`);
    const cnt = o => { try { return o.length || Object.keys(o).length; } catch (e) { return '?'; } };

    try { n('voiced words (SB_WVOICE)', SB_WVOICE.split('|').filter(Boolean).length, '41,136 / 41,652'); }
    catch (e) { n('voiced words', 'ERR', '41,136 / 41,652'); }

    // full library size
    try {
      const seen = new Set();
      const walk = v => { if (!v) return;
        if (Array.isArray(v)) { v.forEach(x => (x && x.w) ? seen.add(String(x.w).toLowerCase()) : walk(x)); return; }
        if (typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); };
      walk(SB_DATA);
      n('distinct words in SB_DATA', seen.size, '(core)');
      n('words-full library', (window.SB_WORDS_FULL ? cnt(SB_WORDS_FULL) : 'not loaded'), '128,040');
    } catch (e) { n('library', 'ERR ' + e, '128,040'); }

    try { n('saga engines', Object.keys(SB_SAGA_ENGINES).length, '13 and 14 (both)'); } catch (e) {}
    try { n('saga chapters (CH_META)', cnt(window.CH_META || []), '31'); } catch (e) {}
    try { n('avatars (SB_AVATARS.list)', SB_AVATARS.list.length, '170'); } catch (e) {}
    try { n('avatar packs', new Set(SB_AVATARS.list.map(a => a.pack)).size, '17'); } catch (e) {}
    try {
      const worlds = Object.keys(EVO).length;
      const forms = Object.values(EVO).reduce((s, v) => s + v.length, 0);
      n('evolution worlds x forms', worlds + ' x ' + (forms / worlds) + ' = ' + forms, '80');
    } catch (e) { n('evolution forms', 'ERR', '80'); }
    try {
      const bl = SB_TRIVIA.byLevel || {};
      const tot = Object.values(bl).reduce((s, v) => s + (+v || 0), 0);
      n('trivia questions', tot, '5,000');
      n('trivia themes', cnt(SB_TRIVIA.themes || []), '20');
    } catch (e) { n('trivia', 'ERR', '5,000'); }
    try { n('concept chapters (free)', SB_CONCEPTS.chapters.length, '—'); } catch (e) {}
    try { n('advanced chapters', SB_ADV_CONCEPTS.chapters.length, '—'); } catch (e) {}
    try { n('champion techniques (SB_ADV_TIPS)', cnt(SB_ADV_TIPS), '36'); } catch (e) {}
    try { n('Word Journeys lessons', cnt(typeof lessonsAll === 'function' ? lessonsAll() : []), '100'); } catch (e) {}
    try { n('IPA sounds', cnt(SB_IPA), '—'); } catch (e) {}
    try { n('vocabulary set SB_VOCAB26', cnt(window.SB_VOCAB26 || []), '—'); } catch (e) {}
    try { n('homophone groups', cnt(SB_HOM), '—'); } catch (e) {}
    try { n('trail acts / units', SB_TRAIL.acts.length + ' acts', '—'); } catch (e) {}

    // Scripps winners seeded in the library
    try {
      let sc = 0;
      const walk = v => { if (!v) return;
        if (Array.isArray(v)) { v.forEach(x => { if (x && x.w) { const t = (x.nt || x.t || []) + '';
          if (/scripps|winner|champion/i.test(t)) sc++; } else walk(x); }); return; }
        if (typeof v === 'object') Object.keys(v).forEach(k => walk(v[k])); };
      walk(SB_DATA);
      n('words tagged scripps/winner', sc, '108 winning words');
    } catch (e) {}
    return L.join('\n');
  }));
  await b.close();
})();
