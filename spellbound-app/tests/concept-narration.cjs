/* concept-narration.cjs — every concept chapter's animated explainer plays from its first scene to its last (app3.js
   renderStage / stageItem / stageOf / conceptAnimStage, adv-concepts-data.js SB_ADV_CSCRIPT, 8 Nov 2026).

   Why: the owner — "the animated narrator is not playing fully … the alphabet sound and the stop before it … the 3 or 4th
   are not playing". Three faults, found together:
     · The Spelling Bee Basics chapters (the first region's first eleven stops) write some list scenes as lines of text
       ("qu = /kw/ — queen"); renderStage read every item as {word} and threw on .length. playScene renders before it
       plays, so the throw stopped the narration: The Champion's Routine at its fifth scene, Alphabet Sounds at its fourth
       — 11 scenes in chapters 0–10, since the scripts were written (30 Aug).
     · The 43 Advanced Pack chapters had lost their scripts: a rewrite of adv-concepts-data.js on 5 Sep (b777088f4) wrote
       SB_ADV_CONCEPTS and dropped SB_ADV_CSCRIPT. Their 258 recorded clips stayed, so each chapter played its recorded
       voice over the pattern templates' pictures and captions — and only as many clips as the template had scenes.
       Restored as it was: the same 43 titles in the same order, and every chapter's scene count equals its clip count.
     · The Grand Trunk Road chapters' scenes are written in the book's shorthand ({word}, {parts}, {glyph}, {list},
       {big}), which renderStage did not read: all 44 drew an empty stage.

   Checks (1280×900, light; Audio and speechSynthesis replaced by fakes that end at once, so a run takes seconds):
     1. every free chapter (122): its explainer is the authored script, one scene per recorded clip, every clip on disk,
        and every scene draws a picture without throwing;
     2. every Advanced chapter (43): the same, against the Advanced clips — and its chip says "Narrated";
     3. every Grand Trunk Road chapter (11) and every Trickster chapter (the Atlas's inline ones): every scene draws a
        picture and has words to speak;
     4. playing: the first eleven chapters, every fifteenth chapter after them, three Advanced, two Grand Trunk Road and
        one Trickster chapter, each from Play — every scene's clip (or line) is played, in order, the last scene is
        reached, and nothing throws on the page;
     5. a word is never broken across two lines (tileFit, the stage a size container, the phone's full-width stage): at
        1280, 768 and 390 no word of up to 15 letters wraps, and no row of tiles sticks out of the stage. Before: 715
        word rows broke at 390 ("rememb / er"), 153 at 768, any 10-letter word on a tablet.
   Proved by breaking (8 Nov 2026; a scratch root of symlinks with ONE file replaced, SB_ROOT; ~2 min a run):
     · app3.js as it was (every list item read as {word}, no safety net round the stage) → 5 fail: 11 free scenes and 11
       Grand Trunk Road scenes throw; the play-through stops — Alphabet Sounds at scene 4 of 5 with 3 clips played, The
       Champion's Routine with 4 of 5, ten of the first eleven chapters in all; two Grand Trunk Road chapters; page errors;
     · app3.js with only the list fix taken out (the safety net kept) → 2 fail: the 22 scenes do not draw (the voice now
       plays on over an empty stage, which is why check 1 draws every scene itself);
     · adv-concepts-data.js as it was (no SB_ADV_CSCRIPT) → 4 fail: 43 Advanced chapters play the template (3 scenes)
       over 6 recorded clips (and check 5 meets 773 tile scenes, not 800);
     · app3.js with stageOf reading nothing (`return sh`) → 4 fail: all 44 Grand Trunk Road scenes draw an empty stage
       (and check 5 meets 786);
     · app3.js with tileFit fitting nothing (fixed tiles, as before) → 5 fail: 52 words break at 1280, 145 at 768, 198
       at 390 ("definition", "ventriloquist"), and rows stick out of the stage at 768 and 390;
     · index.html without the phone's full-width stage → 2 fail at 390: 226 words break, 13 rows stick out (196px stage);
     · app3.js with glyphs breaking only at spaces → 1 fails at 390: "sur/suf/sug/sup" sticks out of the stage.
   Run: NODE_PATH=/opt/node22/lib/node_modules node tests/concept-narration.cjs                                      */
'use strict';
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const W = require('./lib/wait.cjs');
const ROOT = process.env.SB_ROOT || path.resolve(__dirname, '..');
let fails = 0;
const ok = (b, m) => { console.log((b ? '  OK   ' : '  FAIL ') + m); if (!b) fails++; };
const KID = { name: 'Ahana', age: 9, ageBand: '8-10', avatar: 'fox', theme: 'spellbound', coins: 0, lists: {} };

(async () => {
  const b = await chromium.launch({ executablePath: process.env.SB_CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addInitScript((k) => {
    if (!localStorage.getItem('t_cn')) { localStorage.setItem('sb_saas_v2', JSON.stringify({ theme: 'spellbound', mode: 'light', pin: '1234', activeIdx: 0, children: [k] })); localStorage.setItem('sb_splash', '0'); localStorage.setItem('t_cn', '1'); }
    /* a clip "plays" for 20 ms, a spoken line the same: the player's own timing is what is under test */
    const log = window.__said = [];
    window.Audio = function (src) { const a = { src: String(src || ''), onended: null, onerror: null, volume: 1, pause() {}, load() {}, addEventListener() {},
      play() { log.push(a.src); setTimeout(() => { if (a.onended) a.onended(); }, 20); return Promise.resolve(); } }; return a; };
    const tts = { speaking: false, pending: false, paused: false, onvoiceschanged: null, getVoices: () => [], cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {},
      speak(u) { log.push('tts:' + String(u && u.text || '').slice(0, 40)); setTimeout(() => { if (u && u.onend) u.onend(); }, 20); } };
    try { Object.defineProperty(window, 'speechSynthesis', { configurable: true, get: () => tts }); } catch (e) {}
  }, KID);
  const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + ROOT + '/index.html'); await W.booted(pg);
  await pg.evaluate(() => { state.devUnlock = true; state.sound = true; return new Promise((r) => SB_LAZY.need(['concepts', 'advanced', 'atlas'], r)); });
  await W.until(pg, () => { try { loadConcepts(); } catch (e) {} return Array.isArray(state.conceptData) && state.conceptData.length > 150 && window.SB_SOUTHASIA && window.SB_TRAIL; }, null, 60000);

  /* 1–3. every chapter, every scene, drawn here (renderStage itself: conceptAnimStage's safety net must not hide a fault) */
  const inv = await pg.evaluate(() => {
    const rows = [];
    const draw = (stage) => { try { const h = renderStage(stage); return String(h || '').replace(/<[^>]*>/g, '').trim() ? 'ok' : 'empty'; } catch (e) { return 'throws: ' + e.message; } };
    const look = (src, i, ch, clips) => { const an = conceptAnim(ch); const bad = [];
      an.scenes.forEach((s, k) => { const d = draw(s.stage); if (d !== 'ok') bad.push(k + 1 + ' ' + d); if (!spokenScene(s)) bad.push(k + 1 + ' nothing to say'); });
      const urls = clips ? an.scenes.map((s, k) => { const c = voiceClip(ch, k); return c ? c.url : null; }) : [];
      rows.push({ src, i, t: String(ch.title).slice(0, 40), authored: !!an.authored, n: an.scenes.length, clips: clips ? clips.length : 0, urls, bad, chip: hasVoicePack(ch) }); };
    const free = window.SB_CONCEPTS.chapters, adv = window.SB_ADV_CONCEPTS.chapters;
    free.forEach((ch, i) => look('free', i, ch, (window.SB_VOICE.dur || {})[i] || []));
    adv.forEach((ch, i) => look('adv', i, ch, (window.SB_ADV_VOICE.dur || {})[i] || []));
    const sa = window.SB_SOUTHASIA.chapters || window.SB_SOUTHASIA; (sa || []).forEach((ch, i) => look('sa', i, ch, null));
    (window.SB_TRAIL.honey.units || []).filter((u) => u.neu && u.chapter).forEach((u, i) => look('neu', i, u.chapter, null));
    return rows; });
  const grp = (s) => inv.filter((r) => r.src === s);
  const free = grp('free'), adv = grp('adv'), sa = grp('sa'), neu = grp('neu');
  const missing = (rows) => rows.flatMap((r) => r.urls.filter((u) => !u || !fs.existsSync(path.join(ROOT, u))).map((u) => r.src + r.i + ':' + u));
  for (const [name, rows, want] of [['free', free, 122], ['Advanced', adv, 43]]) {
    const notAuth = rows.filter((r) => !r.authored || r.n !== r.clips || !r.clips);
    ok(rows.length >= want && !notAuth.length, `${name}: all ${rows.length} chapters play their authored script, one scene per recorded clip` + (notAuth.length ? ` — ${notAuth.length}: ` + notAuth.slice(0, 4).map((r) => `${r.i} "${r.t}" (${r.authored ? 'authored' : 'template'}, ${r.n} scenes, ${r.clips} clips)`).join(' | ') : ''));
    const miss = missing(rows);
    ok(!miss.length, `${name}: every scene's clip is on disk (${rows.reduce((a, r) => a + r.urls.length, 0)} clips)` + (miss.length ? ' — ' + miss.slice(0, 4).join(', ') : ''));
    const bad = rows.flatMap((r) => r.bad.map((x) => `${r.i} "${r.t}" scene ${x}`));
    ok(!bad.length, `${name}: every scene of every chapter draws a picture (${rows.reduce((a, r) => a + r.n, 0)} scenes)` + (bad.length ? ` — ${bad.length}: ` + bad.slice(0, 4).join(' | ') : ''));
  }
  ok(adv.every((r) => r.chip), 'Advanced: the explainer\'s chip says Narrated for every chapter with clips');
  for (const [name, rows, want] of [['Grand Trunk Road', sa, 11], ['Trickster', neu, 4]]) {
    const bad = rows.flatMap((r) => r.bad.map((x) => `${r.i} "${r.t}" scene ${x}`));
    ok(rows.length >= want && !bad.length, `${name}: every scene of all ${rows.length} chapters draws a picture and has words to say (${rows.reduce((a, r) => a + r.n, 0)} scenes)` + (bad.length ? ` — ${bad.length}: ` + bad.slice(0, 4).join(' | ') : ''));
  }

  /* 4. played from Play, scene by scene */
  const plays = [];
  for (let i = 0; i <= 10; i++) plays.push(['free', i]);
  for (let i = 25; i < 122; i += 15) plays.push(['free', i]);
  plays.push(['adv', 0], ['adv', 21], ['adv', 42], ['sa', 0], ['sa', 10], ['neu', 0]);
  const short = { free: [], adv: [], other: [] };
  for (const [src, i] of plays) {
    const r = await pg.evaluate(async ([src, i]) => {
      const ch = src === 'free' ? SB_CONCEPTS.chapters[i] : src === 'adv' ? SB_ADV_CONCEPTS.chapters[i] : src === 'sa' ? (SB_SOUTHASIA.chapters || SB_SOUTHASIA)[i] : SB_TRAIL.honey.units.filter((u) => u.neu && u.chapter)[i].chapter;
      try { clearAnimTimer(); stopNarration(); } catch (e) {}
      window.__said.length = 0; state.nav = 'concepts'; state.conceptSel = ch; state.conceptStep = 0; state.animOn = false; state.animScene = 0; try { render(); } catch (e) {}
      const N = conceptAnim(ch).scenes.length; const want = conceptAnim(ch).scenes.map((s, k) => { const c = voiceClip(ch, k); return c ? c.url : 'tts'; });
      try { app.conceptPlay(); } catch (e) {}   /* a throw here is the fault under test: report it as a short play */
      const t0 = Date.now();
      while (Date.now() - t0 < 20000) { if (window.__said.length >= N && state.animScene === N - 1) break; await new Promise((res) => setTimeout(res, 50)); }
      await new Promise((res) => setTimeout(res, 400));   /* nothing more after the last scene */
      const said = window.__said.slice(); try { clearAnimTimer(); stopNarration(); } catch (e) {} state.animOn = false;
      return { t: String(ch.title).slice(0, 34), N, scene: state.animScene, said, want }; }, [src, i]);
    const inOrder = r.said.length === r.N && r.want.every((u, k) => (u === 'tts' ? /^tts:/.test(r.said[k]) : r.said[k] === u));
    if (!inOrder || r.scene !== r.N - 1) (short[src] || short.other).push(`${src} ${i} "${r.t}" reached scene ${r.scene + 1} of ${r.N}, played ${r.said.length}`);
  }
  ok(!short.free.length, `playing: the first eleven chapters and every fifteenth after them play every scene's clip, in order, to the last scene` + (short.free.length ? ` — ${short.free.length}: ` + short.free.slice(0, 4).join(' | ') : ''));
  ok(!short.adv.length, `playing: three Advanced chapters play every recorded clip, in order, to the last scene` + (short.adv.length ? ' — ' + short.adv.join(' | ') : ''));
  ok(!(short.other || []).length, `playing: Grand Trunk Road and Trickster chapters speak every scene to the last` + ((short.other || []).length ? ' — ' + short.other.join(' | ') : ''));
  /* 5. a word is never broken across two lines: every word / breakdown / list / build scene of the free and Advanced
     chapters and the Grand Trunk Road, drawn at 1280, 768 and 390 (animations stilled — a tile mid-pop is not where it
     lands). Past 15 letters a row may wrap rather than shrink past reading (dendrochronology on a phone). */
  await pg.addStyleTag({ content: W.STILL });
  for (const vw of [1280, 768, 390]) {
    await pg.setViewportSize({ width: vw, height: 900 });
    const r = await pg.evaluate(async () => { const out = [], over = []; let seen = 0;
      const all = [...SB_CONCEPTS.chapters.map((c, i) => ['free ' + i, c]), ...SB_ADV_CONCEPTS.chapters.map((c, i) => ['adv ' + i, c]), ...(SB_SOUTHASIA.chapters || SB_SOUTHASIA).map((c, i) => ['sa ' + i, c])];
      for (const [id, ch] of all) { const an = conceptAnim(ch);
        for (let k = 0; k < an.scenes.length; k++) { const st = an.scenes[k].stage; if (!st || !/^(word|list|breakdown|build|glyph|rescue)$/.test(st.t)) continue;
          state.nav = 'concepts'; state.conceptSel = ch; state.conceptStep = 0; state.animScene = k; state.animOn = true; try { render(); } catch (e) { continue; }
          await new Promise((q) => requestAnimationFrame(() => requestAnimationFrame(q)));
          const fit = document.querySelector('.ca-fit'); if (!fit) continue; seen++; const F = fit.getBoundingClientRect();
          fit.querySelectorAll('div,span').forEach((row) => { const sp = [...row.children].filter((e) => e.tagName === 'SPAN' && e.textContent.length === 1 && !e.children.length); if (sp.length < 2) return;
            const w = sp.map((e) => e.textContent).join(''); const tops = new Set(sp.map((e) => Math.round(e.getBoundingClientRect().top)));
            if (tops.size > 1 && w.length <= 15) out.push(`${id} scene ${k + 1} "${w}"`);
            const R = row.getBoundingClientRect(); if (R.right > F.right + 1 || R.left < F.left - 1) over.push(`${id} scene ${k + 1} "${w}" ${Math.round(R.width)}px in ${Math.round(F.width)}px`); }); } }
      state.animOn = false; return { seen, out, over }; });
    ok(r.seen >= 800 && !r.out.length, `${vw}: no word of up to 15 letters breaks across two lines (${r.seen} scenes)` + (r.out.length ? ` — ${r.out.length}: ` + r.out.slice(0, 4).join(' | ') : ''));
    ok(!r.over.length, `${vw}: no row of tiles sticks out of the stage` + (r.over.length ? ` — ${r.over.length}: ` + r.over.slice(0, 4).join(' | ') : ''));
  }
  ok(!errs.length, 'no page errors' + (errs.length ? ': ' + [...new Set(errs)].slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? `\n${fails} FAILED` : '\nall good'); process.exit(fails ? 1 : 0);
})();
