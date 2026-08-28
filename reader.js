/* reader.js — the Bizzing Bee Library, read IN the app.
   The 24 printed volumes stay published (and purchasable) on the books site;
   this file is the same library as living cards: tap a word for its full card
   with audio, pop a Try-it exercise, keep your own notes on every chapter, and
   the volume's mascot keeps you company. Content is NOT duplicated — 19 of the
   24 volumes render straight from the app's own data (SB_CONCEPTS,
   SB_ADV_CONCEPTS, SB_SOUTHASIA), and the rest load their authored chapter
   files (SB_EPONYMS / SB_ULTRA / SB_POEMS / SB_FIG / SB_QUOTES) lazily.
   Cover art streams from the books site; a missing cover just hides.
   `app` and the app3 helpers (esc, escA, say, flash, set, save, active,
   iconSVG, addCoins, advOn, devOn, nkey) are bare lexical globals — same
   contract trail.js uses. */
(function () {
  const app2 = app;
  const SITE = (typeof SB_BOOKS_URL !== 'undefined' ? SB_BOOKS_URL : 'https://aayuvis.github.io/bizzing-bee-books/books/');
  const ART = SITE + 'art/';

  /* world -> the ambience motif classes index.html already ships for the Atlas */
  const AMB = { meadow: ['bees', '#F0B429'], library: ['motes', '#E8D9A8'], forum: ['motes', '#EAD9B0'],
    stage: ['motes', '#FFF0C2'], strait: ['drift', '#BFE9FF'], engine: ['sparks', '#FFC46B'],
    junkyard: ['sparks', '#FFC46B'], origami: ['rise', '#FFD9A8'], elements: ['rain', '#BFD8FF'],
    greysea: ['drift', '#CFE6F2'], warfield: ['sparks', '#FFB86B'], vibe: ['motes', '#E8D9A8'],
    grandtrunk: ['drift', '#FFD9A8'], night: ['motes', '#C9B8E8'] };

  /* The volume plan mirrors mkbooks.js (that file stays the print authority).
     kind: con (SB_CONCEPTS by category) · adv (SB_ADV_CONCEPTS) · sa · epon ·
     ultra · poems · similes · quotes · quizbook */
  const VOLS = {
    'book-01': { n: 1, t: 'Lift-Off!', tag: 'Bee basics from first buzz to first trophy', a: '#FFC23D', av: 'honeypot', world: 'meadow', kind: 'con', re: /^Spelling Bee Basics$/ },
    'book-02': { n: 2, t: 'The Rulebook', tag: 'Spelling rules that hold up on stage', a: '#6C4FE0', av: 'waggle', world: 'library', kind: 'con', re: /Spelling Rules|Word Formation/ },
    'book-03': { n: 3, t: 'Latin Launchers', tag: 'Fifteen prefix families, thousands of words', a: '#E06A3C', av: 'bumble', world: 'forum', kind: 'con', re: /^Latin Prefixes$/ },
    'book-04': { n: 4, t: 'Greek Lightning', tag: 'Greek and number prefixes, endings included', a: '#2E8FB8', av: 'star', world: 'elements', kind: 'con', re: /Greek Prefixes|Number Prefixes|Greek Suffixes|Greek Medical/ },
    'book-05': { n: 5, t: 'Endings That Win', tag: 'Suffixes, strategy and championship closers', a: '#E8458C', av: 'diva', world: 'stage', kind: 'con', re: /Latin Suffixes|Latin & Old English Suffixes|Agent Suffixes|Advanced Vocabulary|Advanced Spelling Strategy|Championship Level/ },
    'book-06': { n: 6, t: 'Root Camp: Latin', tag: 'Eleven Latin root families, drilled', a: '#C08A3E', av: 'drone', world: 'engine', kind: 'con', re: /^Latin Root Families$/ },
    'book-07': { n: 7, t: 'Root Camp: Greek', tag: 'Ten Greek root families, drilled', a: '#13A892', av: 'clover', world: 'origami', kind: 'con', re: /^Greek Root Families$/ },
    'book-08': { n: 8, t: 'The World Tour', tag: 'French, Italian, Celtic — words that immigrated', a: '#3E63D6', av: 'nectar', world: 'strait', kind: 'con', re: /French Loanword|Italian Loanword|Loanword Language Groups/ },
    'book-09': { n: 9, t: 'Subject Sprints', tag: 'Science, music, law, food — words of everything', a: '#F0A93C', av: 'lumen', world: 'junkyard', kind: 'con', re: /^Subject-Area Vocabulary$/ },
    'book-10': { n: 10, t: 'Word Personalities', tag: 'Every word has a character. Meet them.', a: '#B14FC4', av: 'jester', world: 'vibe', kind: 'con', re: /^Personality Themes$/ },
    'book-11': { n: 11, t: 'The Playbook', tag: 'Bee-day procedure and deep orthography', a: '#D6353F', av: 'queenhive', world: 'warfield', kind: 'adv', adv: true, plan: 'proc+orth5' },
    'book-12': { n: 12, t: 'Schwa Country', tag: 'The vanishing vowel and its disguises', a: '#7E8AA0', av: 'blossom', world: 'greysea', kind: 'adv', adv: true, plan: 'orth5-12' },
    'book-13': { n: 13, t: 'Letters Behaving Badly', tag: 'Doubles, silents and sounds that lie', a: '#B8562F', av: 'propolis', world: 'junkyard', kind: 'adv', adv: true, plan: 'orth12+' },
    'book-14': { n: 14, t: 'The Grand Trunk Road', tag: 'South Asian words that became English', a: '#D97A1E', av: 'cobra', world: 'grandtrunk', kind: 'sa', adv: true },
    'book-15': { n: 15, t: 'Far-Flung Words', tag: 'Origins beyond the big four', a: '#0E8A78', av: 'mic', world: 'strait', kind: 'adv', adv: true, cat: /^Origins Beyond the Big Four$/ },
    'book-16': { n: 16, t: 'The Word Factory', tag: 'How English bolts words together', a: '#5B6BA8', av: 'maestro', world: 'engine', kind: 'adv', adv: true, cat: /^How Words Are Built$/ },
    'book-17': { n: 17, art: 'b19', t: 'Named After Someone', tag: 'Every word here was a person first', a: '#C2586B', av: 'goldlegend', world: 'forum', kind: 'epon', adv: true },
    'book-18': { n: 18, art: 'b20', t: "The Champion's Mind", tag: 'Getting words in, and getting them back fast', a: '#7C5CFF', av: 'encore', world: 'library', kind: 'ultra', half: 'mind', adv: true },
    'book-19': { n: 19, art: 'b21', t: "The Champion's Method", tag: 'Origin first, then the microphone', a: '#C8901B', av: 'goldlegend', world: 'warfield', kind: 'ultra', half: 'method', adv: true },
    'book-similes': { art: 'b17', t: 'As Busy as a Bee', tag: 'Every simile we know, and the idiom hall of fame', a: '#3DA85C', av: 'popcorn', world: 'meadow', kind: 'similes' },
    'book-champion': { art: 'b18', t: 'Say It Like a Champion', tag: 'Lines worth keeping — and what they mean for spellers', a: '#7C3F9E', av: 'melody', world: 'stage', kind: 'quotes' },
    'book-lines': { art: 'bl', t: 'Lines Worth Keeping', tag: 'Poems, speeches and sonnets, printed whole', a: '#2E6FA8', av: 'melody', world: 'night', kind: 'poems' },
    'book-quiz': { art: 'bq', t: 'The Long Quiz', tag: 'Fifty rounds of general and speciality questions', a: '#C24E2E', av: 'jester', world: 'stage', kind: 'quizbook' }
  };
  const QUOTE_CH = [['perseverance', 'Keep Going', 'For the round after the round you almost lost.'], ['courage', 'Be Brave', 'For the walk to the microphone.'], ['hardwork', 'Do the Work', 'For the days the list looks too long.'], ['believe', 'Back Yourself', 'For the voice that says you can’t.'], ['dreams', 'Dream Big', 'For the trophy you can already see.'], ['curiosity', 'Stay Curious', 'For the words you haven’t met yet.'], ['learning', 'Love Learning', 'For every list that made you better.'], ['imagination', 'Imagine It', 'For seeing the word before you spell it.'], ['creativity', 'Make Things', 'For building your own way to remember.'], ['kindness', 'Be Kind', 'For the speller who just went out.'], ['friendship', 'Bring Friends', 'For the people cheering in row three.'], ['humor', 'Laugh a Little', 'For when the nerves need popping.']];

  const artOf = (slug) => VOLS[slug].art || ('b' + String(VOLS[slug].n).padStart(2, '0'));
  /* the same gate the Concepts library uses: the Advanced Pack (or testing unlock) */
  const locked = v => { if (!v.adv) return false;
    try { return !(state.devUnlock || advModeOn(active())); } catch (e) { return false; } };

  /* one word shape for the card overlay + chips, whatever the source called its fields */
  const wNorm = x => ({ w: x.w, d: x.d || x.def || '', s: x.s || x.ex || '', p: x.p || x.say || '', h: x.h || x.hook || '', o: x.o || '' });

  /* ---- chapters, per volume kind. Every chapter comes back as
     {title, sub, prose, cards:[{title,body}], words:[wNorm], extra} ---- */
  function chapters(slug) {
    const v = VOLS[slug]; const out = [];
    const shape = ch => ({ title: ch.title, sub: ch.category || '', prose: ch.concept || '', method: ch.method || '', cards: ch.cards || [], words: (ch.words || []).map(wNorm) });
    if (v.kind === 'con') ((window.SB_CONCEPTS && SB_CONCEPTS.chapters) || []).forEach(ch => { if (v.re.test(ch.category || '')) out.push(shape(ch)); });
    else if (v.kind === 'adv') {
      const chs = (window.SB_ADV_CONCEPTS && SB_ADV_CONCEPTS.chapters) || [];
      if (v.cat) chs.forEach(ch => { if (v.cat.test(ch.category || '')) out.push(shape(ch)); });
      else { const orth = chs.filter(ch => ch.category === 'Advanced Orthography');
        if (v.plan === 'proc+orth5') chs.filter(ch => ch.category === 'Championship Procedure').concat(orth.slice(0, 5)).forEach(ch => out.push(shape(ch)));
        else if (v.plan === 'orth5-12') orth.slice(5, 12).forEach(ch => out.push(shape(ch)));
        else orth.slice(12).forEach(ch => out.push(shape(ch))); }
    }
    else if (v.kind === 'sa') (window.SB_SOUTHASIA || []).forEach(ch => out.push(shape(ch)));
    else if (v.kind === 'epon') (window.SB_EPONYMS || []).forEach(ch => out.push(shape(ch)));
    else if (v.kind === 'ultra') (((window.SB_ULTRA || {})[v.half]) || []).forEach(ch => out.push(shape(ch)));
    else if (v.kind === 'poems') { const P = window.SB_POEMS || {};
      Object.keys(P).forEach(k => { const s = P[k]; if (s && s.pieces) out.push({ title: s.title || k, sub: s.blurb || '', pieces: s.pieces }); }); }
    else if (v.kind === 'similes') { const F = window.SB_FIG || {};
      if (F.similes) out.push({ title: 'The similes', sub: 'as ___ as a ___ — pictures that stuck', figs: F.similes.filter(x => x.kid !== false) });
      if (F.idioms) out.push({ title: 'The idiom hall of fame', sub: 'phrases that stopped meaning their words', figs: F.idioms.filter(x => x.kid !== false) }); }
    else if (v.kind === 'quotes') { const Q = window.SB_QUOTES || [];
      QUOTE_CH.forEach(([c, t, sub]) => { const qs = Q.filter(q => q && q.c === c); if (qs.length) out.push({ title: t, sub, quotes: qs.slice(0, 24) }); }); }
    return out;
  }

  /* ---- per-child state ---- */
  const notes = () => { const c = active(); c.readerNotes = c.readerNotes || {}; return c.readerNotes; };
  const readSet = () => { const c = active(); c.readerRead = c.readerRead || {}; return c.readerRead; };
  const nKey = () => state.readerBook + ':' + state.readerCh;

  /* ---- actions ---- */
  app2.readerOpen = slug => { if (!VOLS[slug]) return;
    set({ nav: 'reader', screen: 'app', readerBook: slug, readerCh: null, readerPg: 0, readerQuiz: null, wordCard: null }); };
  app2.readerCh = i => set({ readerCh: i === '' || i == null ? null : +i, readerPg: 0, readerQuiz: null });
  /* page turns: one spread on screen at a time — Next past the last spread is Done */
  app2.readerPg = d => { const S = spreadsOf(chapters(state.readerBook)[state.readerCh]); const n = S.length;
    let p = state.readerPg || 0;
    if (d === 'next') { if (p + 1 >= n) { app2.readerDone(); return; } p++; }
    else if (d === 'prev') p = Math.max(0, p - 1);
    else p = Math.max(0, Math.min(n - 1, +d || 0));
    set({ readerPg: p, readerQuiz: null });
    try { const sc = document.scrollingElement; if (sc) sc.scrollTop = 0; } catch (e) {} };
  app2.readerBack = () => { if (state.readerQuiz) { set({ readerQuiz: null }); return; }
    if (state.readerCh != null) { set({ readerCh: null }); return; }
    set({ nav: 'explore', readerBook: null }); };
  app2.readerWord = i => { const chs = chapters(state.readerBook); const ch = chs[state.readerCh]; if (!ch) return;
    const w = (ch.words || [])[+i]; if (!w) return;
    set({ wordCard: w }); try { say(w.w); } catch (e) {} };
  /* arrow keys turn the pages (never while typing a note) */
  window.addEventListener('keydown', e => { try {
    if (state.nav !== 'reader' || state.readerCh == null || state.readerQuiz || state.wordCard) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t2 = e.target; if (t2 && (t2.tagName === 'INPUT' || t2.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); app2.readerPg('next'); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); app2.readerPg('prev'); }
  } catch (_) {} });
  app2.readerSayHard = w => { try { say(String(w)); } catch (e) {}
    try { const idx = (typeof wordIndex === 'function' && wordIndex()) || {}; const rec = idx[nkey(String(w))];
      if (rec) { set({ wordCard: wNorm(rec) }); } } catch (e) {} };
  app2.readerNote = v => { notes()[nKey()] = String(v == null ? '' : v).slice(0, 2000); save(); };
  app2.readerDone = () => { const k = state.readerBook; const r = readSet(); r[k] = r[k] || {};
    r[k][state.readerCh] = 1; save();
    const total = chapters(k).length; const done = Object.keys(r[k]).length;
    if (done >= total) { try { sfx('win'); burstConfetti(120); } catch (e) {} flash('🏁 ' + VOLS[k].t + ' — read cover to cover!'); set({ readerCh: null }); }
    else if (state.readerCh + 1 < total) { try { sfx('correct'); } catch (e) {} set({ readerCh: state.readerCh + 1, readerPg: 0, readerQuiz: null }); }
    else set({ readerCh: null, readerPg: 0 }); };
  /* Try it: four meaning→word questions from THIS chapter. A coin per correct,
     and — deliberately — no spelling-progress writes: reading is not drilling. */
  app2.readerTry = () => { const ch = chapters(state.readerBook)[state.readerCh]; if (!ch) return;
    const pool = (ch.words || []).filter(x => x.w && x.d);
    if (pool.length < 4) { flash('This chapter drills its words in Practice instead'); return; }
    const pick = pool.slice().sort(() => Math.random() - 0.5).slice(0, 4);
    const qs = pick.map(w => { const wrong = pool.filter(x => x.w !== w.w).sort(() => Math.random() - 0.5).slice(0, 3);
      return { d: w.d, ok: w.w, opts: [w.w].concat(wrong.map(x => x.w)).sort(() => Math.random() - 0.5) }; });
    set({ readerQuiz: { qs, i: 0, right: 0, picked: null } }); };
  app2.readerAns = i => { const z = state.readerQuiz; if (!z || z.picked != null) return; const q = z.qs[z.i];
    z.picked = +i; const ok = q.opts[+i] === q.ok;
    if (ok) { z.right++; try { addCoins(1); sfx('correct'); } catch (e) {} } else { try { sfx('wrong'); say(q.ok); } catch (e) {} }
    render();
    setTimeout(() => { const n = state.readerQuiz; if (n !== z) return;
      if (z.i + 1 < z.qs.length) { z.i++; z.picked = null; } else z.over = true; render(); }, ok ? 900 : 2400); };
  app2.readerTryClose = () => set({ readerQuiz: null });
  app2.readerPrint = () => { try { const w = window.open(SITE + state.readerBook + '.html', '_blank', 'noopener');
    if (!w) flash('Pop-up blocked — allow pop-ups to open the print edition'); } catch (e) {} };

  /* ---- pieces of view ---- */
  const amb = v => { const a = AMB[v.world]; return a ? `<span class="atlas-amb amb-${a[0]}" style="--ac:${a[1]}" aria-hidden="true"></span>` : ''; };
  const mascot = (v, sz) => { try { return window.SB_AVATAR ? `<span class="w4-flutter" style="display:inline-block;width:${sz}px;height:${sz}px">${SB_AVATAR(v.av, sz)}</span>` : ''; } catch (e) { return ''; } };
  const printPill = slug => `<button data-act="readerPrint" title="The printed edition — read it on paper, or buy the book" style="display:inline-flex;align-items:center;gap:6px;padding:8px 14px;border-radius:999px;background:var(--surface2);border:1px solid var(--line);color:var(--text);font-weight:800;font-size:12px">📕 Print edition</button>`;
  const chip = (w, i) => `<button data-act="readerWord" data-arg="${i}" title="Open the word card" style="display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:var(--chip);color:var(--accent);font-family:var(--mono);font-weight:800;font-size:12.5px">🔊 ${esc(w.w)}</button>`;

  function volHome(slug) {
    const v = VOLS[slug]; const chs = chapters(slug); const done = readSet()[slug] || {};
    const cover = `<img src="${ART}${artOf(slug)}-cover.jpg" alt="" loading="lazy" decoding="async" onerror="this.style.display='none'" style="width:100%;height:100%;object-fit:cover">`;
    const lockCard = locked(v) ? `<button data-act="openAdvanced" style="display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:var(--surface2);border:1px solid var(--line);border-radius:14px;padding:14px 16px;margin-bottom:12px">
        <span style="font-size:20px">🔒</span><span style="flex:1;font-size:13px;line-height:1.5">This volume reads with the <b>Advanced Pack</b> — the print edition is always open.</span>
        <span style="flex-shrink:0;padding:8px 14px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">Unlock →</span></button>` : '';
    const toc = chs.map((ch, i) => `<button data-act="readerCh" data-arg="${i}" ${locked(v) ? 'disabled style="opacity:.45;pointer-events:none;' : 'style="'}display:flex;align-items:center;gap:11px;width:100%;text-align:left;background:var(--paper,var(--bg2));border:1px solid var(--line);border-radius:13px;padding:12px 14px">
        <span style="flex-shrink:0;width:30px;height:30px;border-radius:10px;display:grid;place-items:center;font-family:var(--display);font-weight:800;font-size:13px;background:${done[i] ? 'var(--good)' : 'var(--surface2)'};color:${done[i] ? '#fff' : 'var(--muted)'}">${done[i] ? '✓' : i + 1}</span>
        <span style="min-width:0;flex:1"><span style="display:block;font-weight:800;font-size:13.5px;line-height:1.3">${esc(ch.title)}</span>
        ${ch.sub ? `<span style="display:block;font-size:11.5px;color:var(--muted);font-weight:600;margin-top:1px">${esc(ch.sub)}</span>` : ''}</span>
        ${notes()[slug + ':' + i] ? '<span title="You have a note here" style="flex-shrink:0">📝</span>' : ''}
        <span style="color:var(--accent);font-weight:800;flex-shrink:0">→</span></button>`).join('');
    return `<div style="max-width:720px;margin:0 auto;animation:sb-rise .3s ease both">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
        ${window.SB_BACK ? SB_BACK('readerBack', 'Library') : '<button data-act="readerBack" style="font-weight:800;color:var(--muted)">← Library</button>'}
        <span style="margin-left:auto">${printPill(slug)}</span></div>
      <div style="position:relative;border-radius:20px;overflow:hidden;border:1px solid var(--line);background:linear-gradient(150deg,${v.a},var(--ink,#241E33));min-height:190px;margin-bottom:14px">
        ${amb(v)}
        <div style="position:absolute;inset:0;opacity:.85">${cover}</div>
        <div style="position:relative;z-index:2;display:flex;align-items:flex-end;gap:13px;padding:70px 18px 14px;background:linear-gradient(180deg,transparent 20%,rgba(12,8,26,.82))">
          ${mascot(v, 52)}
          <div style="min-width:0;flex:1">
            ${v.n ? `<div style="font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.75)">Volume ${v.n}</div>` : '<div style="font-size:10.5px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.75)">Companion</div>'}
            <div style="font-family:var(--display);font-weight:800;font-size:23px;line-height:1.1;color:#fff">${esc(v.t)}</div>
            <div style="font-size:12.5px;color:rgba(255,255,255,.88);font-weight:600;margin-top:3px">${esc(v.tag)}</div>
          </div></div></div>
      ${lockCard}
      ${chs.length ? `<div style="display:flex;flex-direction:column;gap:8px">${toc}</div>`
        : v.kind === 'quizbook'
          ? `<div class="sb-card" style="padding:18px;text-align:center"><div style="font-size:34px;margin-bottom:6px">✏️</div>
             <p style="font-size:13.5px;line-height:1.6;color:var(--muted);max-width:34em;margin:0 auto 12px">The Long Quiz is a <b>paper</b> book — fifty write-in rounds, crosswords and letter squares with the answer key at the back. Open the print edition to play it on the sofa; for a screen quiz, the Arcade has Bee Trivia and Bizzillionaire.</p>
             <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap">${printPill(slug)}<button data-act="openGames" style="padding:8px 16px;border-radius:999px;background:var(--accent);color:#fff;font-weight:800;font-size:12.5px">🕹 To the Arcade</button></div></div>`
          : `<div class="sb-cn">This volume's chapters are still loading — one moment.</div>`}
    </div>`;
  }

  function tryOverlay() {
    const z = state.readerQuiz; if (!z) return '';
    const frame = inner => `<div style="position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:18px;background:rgba(14,10,26,.6)">
      <div style="width:min(430px,94vw);background:var(--bg2);border:1px solid var(--line);border-radius:20px;padding:22px;text-align:center;box-shadow:0 18px 50px rgba(0,0,0,.45);animation:sb-rise .3s ease both">${inner}</div></div>`;
    if (z.over) return frame(`<div style="font-size:38px">${z.right >= 3 ? '🏆' : '💪'}</div>
      <h3 style="font-family:var(--display);font-weight:800;font-size:19px;margin:8px 0 4px">${z.right} of ${z.qs.length}</h3>
      <p style="font-size:13px;color:var(--muted);margin:0 0 14px">${z.right >= 3 ? 'You read like a champion.' : 'Read the words once more — they will come.'}</p>
      <button data-act="readerTryClose" style="padding:12px 22px;border-radius:13px;background:var(--accent);color:#fff;font-weight:800;font-size:14px">Back to the chapter</button>`);
    const q = z.qs[z.i];
    return frame(`<div style="font-size:11.5px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)">Try it · ${z.i + 1} of ${z.qs.length}</div>
      <p style="font-size:14.5px;line-height:1.55;margin:9px 0 13px">${esc(q.d)}</p>
      <div style="display:flex;flex-direction:column;gap:8px">${q.opts.map((o, i) => { const on = z.picked != null;
        const good = on && o === q.ok, bad = on && z.picked === i && !good;
        return `<button data-act="readerAns" data-arg="${i}" style="padding:12px;border-radius:12px;font-family:var(--mono);font-weight:800;font-size:14px;border:1.5px solid ${good ? 'var(--good)' : bad ? 'var(--bad)' : 'var(--line)'};background:${good ? 'color-mix(in srgb,var(--good) 15%,transparent)' : bad ? 'color-mix(in srgb,var(--bad) 12%,transparent)' : 'var(--surface2)'};color:var(--text)">${esc(o)}${good ? ' ✓' : bad ? ' ✗' : ''}</button>`; }).join('')}</div>
      ${z.picked != null && z.qs[z.i].opts[z.picked] !== q.ok ? `<div style="margin-top:10px;font-size:12.5px;font-weight:700;color:var(--muted)">It's “${esc(q.ok)}” — ⚑ worth a revise.</div>` : ''}
      <button data-act="readerTryClose" style="margin-top:12px;color:var(--muted);font-weight:700;font-size:12px;text-decoration:underline;text-underline-offset:2px">Close</button>`);
  }

  /* ---- SPREADS: a chapter is a sequence of pages, ONE on screen at a time.
     Play-tested verdict on the first cut: "boring... too many at a time... no
     visuals". So every spread leads with the world's own painted banner (the
     app-art/w-*.jpg set the Atlas and the printed books share), content is
     capped per page, and the mascot rides along. ---- */
  const BANNERS = ['elements','engine','forum','grandtrunk','greysea','junkyard','library','meadow','origami','stage','strait','vibe','warfield'];
  const bWorld = v => BANNERS.indexOf(v.world) >= 0 ? v.world : (v.world === 'night' ? 'greysea' : 'stage');
  const bnr = (v, i, tall) => {
    const w = bWorld(v); const r = (i % 2) ? 3 : 2;
    return `<div style="position:relative;height:${tall ? 172 : 96}px;overflow:hidden;flex:none">
      <img src="app-art/w-${w}-r${r}.jpg" alt="" decoding="async" onerror="this.style.display='none'"
        style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:${(i * 29) % 78 + 8}% ${28 + (i * 17) % 44}%">
      <span style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(14,10,26,.08) 30%,rgba(14,10,26,${tall ? '.66' : '.5'}))"></span>
    </div>`; };
  function spreadsOf(ch) {
    if (!ch) return [{ k: 'notes' }];
    const S = [{ k: 'open' }];
    if (ch.pieces) ch.pieces.forEach(p => S.push({ k: 'piece', p }));
    else if (ch.figs) { const F = ch.figs.slice(0, 72); for (let i = 0; i < F.length; i += 6) S.push({ k: 'figs', list: F.slice(i, i + 6) }); }
    else if (ch.quotes) { for (let i = 0; i < ch.quotes.length; i += 6) S.push({ k: 'quotes', list: ch.quotes.slice(i, i + 6) }); }
    else {
      (ch.cards || []).forEach(c2 => S.push({ k: 'card', c: c2 }));
      if (ch.method) S.push({ k: 'method' });
      const ws = ch.words || [];
      for (let i = 0; i < ws.length; i += 10) S.push({ k: 'words', from: i, list: ws.slice(i, i + 10) });
    }
    S.push({ k: 'notes' });
    return S;
  }
  function spreadBody(v, ch, sp, slug, i) {
    const H = (t) => `<div style="font-family:var(--display);font-weight:800;font-size:19px;line-height:1.2;margin-bottom:10px;color:${v.a}">${esc(t)}</div>`;
    if (sp.k === 'open') return `
      <div style="display:flex;align-items:flex-start;gap:14px">
        <div style="min-width:0;flex:1">
          ${ch.sub ? `<div style="font-size:11px;font-weight:800;letter-spacing:.11em;text-transform:uppercase;color:${v.a};margin-bottom:6px">${esc(ch.sub)}</div>` : ''}
          <div style="font-family:var(--display);font-weight:800;font-size:clamp(21px,4vw,26px);line-height:1.15;text-wrap:balance">${esc(ch.title)}</div>
        </div>${mascot(v, 62)}</div>
      ${ch.prose ? `<p style="font-size:15.5px;line-height:1.7;margin:14px 0 0">${esc(ch.prose)}</p>` : ''}
      ${ch.pieces ? `<p style="font-size:13px;color:var(--muted);font-weight:700;margin:14px 0 0">${ch.pieces.length} pieces — turn the page.</p>` : ''}
      ${(ch.words && ch.words.length) ? `<p style="font-size:13px;color:var(--muted);font-weight:700;margin:14px 0 0">${ch.words.length} words wait at the end of this chapter — tap any of them for the full card.</p>` : ''}`;
    if (sp.k === 'card') return H(sp.c.title || '') + `<p style="font-size:15.5px;line-height:1.75;margin:0">${esc(sp.c.body || '')}</p>`;
    if (sp.k === 'method') return H('The trick') + `<div class="rd-method" style="font-size:14.5px;line-height:1.7">${ch.method}</div>`;
    if (sp.k === 'words') return `
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:12px">${H('Meet the words').replace('margin-bottom:10px', 'margin-bottom:0')}
        <button data-act="readerTry" style="margin-left:auto;flex:none;padding:9px 16px;border-radius:999px;background:${v.a};color:#fff;font-weight:800;font-size:12.5px;box-shadow:var(--edge)">⚡ Try it</button></div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(240px,100%),1fr));gap:8px">
        ${sp.list.map((w, k) => `<button data-act="readerWord" data-arg="${sp.from + k}" title="Open the word card" style="display:flex;align-items:center;gap:9px;text-align:left;padding:10px 12px;border-radius:12px;background:var(--surface2);border:1px solid var(--line)">
          <span style="flex:none;width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:${v.a};color:#fff">${iconSVG('volume', 14)}</span>
          <span style="min-width:0"><span style="display:block;font-family:var(--mono);font-weight:800;font-size:13.5px;color:var(--text)">${esc(w.w)}</span>
          ${w.d ? `<span style="display:block;font-size:11.5px;color:var(--muted);line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical">${esc(w.d)}</span>` : ''}</span>
        </button>`).join('')}</div>`;
    if (sp.k === 'piece') { const p = sp.p; return `
      <div style="font-family:var(--display);font-weight:800;font-size:20px;line-height:1.2">${esc(p.t)}</div>
      <div style="font-size:12px;color:var(--muted);font-weight:700;margin:3px 0 12px">${esc(p.a || '')}${p.src ? ' · ' + esc(p.src) : ''}${p.y ? ' · ' + esc(p.y) : ''}</div>
      <div style="font-family:var(--display);font-size:15px;line-height:1.85;white-space:pre-wrap;border-left:3px solid ${v.a};padding-left:14px">${(p.lines || []).map(esc).join('\n')}</div>
      ${p.note ? `<div style="margin-top:12px;padding:11px 13px;border-radius:11px;background:var(--surface2);font-size:12.5px;line-height:1.6;color:var(--muted)">${esc(p.note)}</div>` : ''}
      ${(p.hard && p.hard.length) ? `<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px">${p.hard.map(w => `<button data-act="readerSayHard" data-arg="${escA(w)}" style="display:inline-flex;align-items:center;gap:5px;padding:7px 12px;border-radius:999px;background:var(--chip);color:var(--accent);font-family:var(--mono);font-weight:800;font-size:12.5px">🔊 ${esc(w)}</button>`).join('')}</div>` : ''}`; }
    if (sp.k === 'figs') return sp.list.map(x => `<div style="padding:11px 0;border-bottom:1px solid var(--line)">
        <button data-act="say" data-arg="${escA(x.p)}" style="font-family:var(--display);font-weight:800;font-size:16px;color:${v.a};text-align:left">🔊 ${esc(x.p)}</button>
        <div style="font-size:13.5px;line-height:1.55;margin-top:3px">${esc(x.m)}</div>
        ${x.os ? `<div style="font-size:12px;color:var(--muted);line-height:1.5;margin-top:4px">${esc(x.os)}</div>` : ''}
      </div>`).join('');
    if (sp.k === 'quotes') return sp.list.map(q => `<div style="padding:12px 0;border-bottom:1px solid var(--line)">
        <div style="font-family:var(--display);font-size:15.5px;line-height:1.6">“${esc(q.q)}”</div>
        <div style="font-size:12.5px;font-weight:800;color:${v.a};margin-top:5px">— ${esc(q.a)}${q.who ? `<span style="color:var(--muted);font-weight:600"> · ${esc(q.who)}</span>` : ''}</div>
      </div>`).join('');
    // notes
    const note = notes()[slug + ':' + i] || '';
    return H('📝 My notes') + `
      <p style="font-size:13px;color:var(--muted);line-height:1.6;margin:0 0 10px">What do you want to remember from “${esc(ch.title)}”? Saved on this device, just for you.</p>
      <textarea data-inp="readerNote" data-fkey="readerNote" placeholder="Write it your way…" style="width:100%;min-height:110px;border:1px solid var(--line);border-radius:12px;background:var(--surface);padding:11px 13px;font-size:14px;line-height:1.6;font-family:inherit;color:var(--text);resize:vertical">${esc(note)}</textarea>`;
  }
  function chView(slug) {
    const v = VOLS[slug]; const chs = chapters(slug); const i = Math.max(0, Math.min(chs.length - 1, state.readerCh || 0)); const ch = chs[i];
    if (!ch) return volHome(slug);
    const S = spreadsOf(ch); const p = Math.max(0, Math.min(S.length - 1, state.readerPg || 0)); const sp = S[p];
    const last = p + 1 >= S.length; const lastCh = i + 1 >= chs.length;
    const pgLabel = sp.k === 'open' ? 'the opener' : sp.k === 'notes' ? 'your page' : sp.k === 'words' ? 'the words' : sp.k === 'method' ? 'the trick' : '';
    return `<div style="max-width:680px;margin:0 auto;animation:sb-rise .3s ease both">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <button data-act="readerCh" data-arg="" style="display:inline-flex;align-items:center;gap:6px;font-weight:800;font-size:13px;color:var(--muted)">← ${esc(v.t)}</button>
        <span style="margin-left:auto;font-size:12px;font-weight:800;color:var(--muted)">Chapter ${i + 1} of ${chs.length}</span></div>
      <div class="sb-card" style="position:relative;overflow:hidden;padding:0;border-radius:22px;margin-bottom:12px">
        ${amb(v)}
        ${bnr(v, p * 7 + i, sp.k === 'open')}
        <div style="position:relative;z-index:2;padding:clamp(16px,3.5vw,24px)">
          ${sp.k !== 'open' ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)"><span style="color:${v.a}">${esc(wordsClampT(ch.title, 38))}</span>${pgLabel ? `<span>· ${pgLabel}</span>` : ''}</div>` : ''}
          ${spreadBody(v, ch, sp, slug, i)}
        </div></div>
      <div style="display:flex;align-items:center;gap:11px;margin-bottom:8px">
        <button data-act="readerPg" data-arg="prev" style="flex:none;padding:12px 18px;border-radius:13px;background:var(--surface2);border:1px solid var(--line);font-weight:800;font-size:13.5px;${p <= 0 ? 'opacity:.4;pointer-events:none' : ''}">← Back</button>
        <div style="flex:1;min-width:0">
          <div style="height:6px;border-radius:999px;background:var(--surface2);overflow:hidden"><div style="height:100%;border-radius:999px;background:${v.a};width:${Math.round((p + 1) / S.length * 100)}%;transition:width .3s"></div></div>
          <div style="font-size:10.5px;color:var(--muted);font-weight:700;text-align:center;margin-top:3px">page ${p + 1} of ${S.length}</div></div>
        <button data-act="readerPg" data-arg="next" style="flex:none;padding:12px 20px;border-radius:13px;background:${last ? 'var(--good)' : 'var(--accent)'};color:#fff;font-weight:800;font-size:13.5px;box-shadow:var(--edge)">${last ? (lastCh ? 'Finish the book 🎉' : 'Chapter done ✓') : 'Next →'}</button></div>
      <div style="text-align:center;font-size:10.5px;color:var(--muted);font-weight:600;margin-bottom:18px">← → keys turn the pages too</div>
      ${tryOverlay()}
    </div>`;
  }
  const wordsClampT = (s, n) => { s = String(s || ''); return s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…'; };

  window.SB_READER = {
    open: slug => app2.readerOpen(slug),
    vols: VOLS,
    view: () => { const slug = state.readerBook;
      if (!slug || !VOLS[slug]) { return volShelfFallback(); }
      const v = VOLS[slug];
      if (state.readerCh != null && !locked(v)) return chView(slug);
      return volHome(slug); }
  };
  function volShelfFallback() { return `<div style="max-width:640px;margin:0 auto;padding-top:30px;text-align:center">
      <div style="font-size:34px;margin-bottom:8px">📚</div>
      <p style="font-size:13.5px;color:var(--muted)">Pick a book from the Library shelf.</p>
      <button data-act="readerBack" style="margin-top:10px;padding:11px 20px;border-radius:12px;background:var(--accent);color:#fff;font-weight:800;font-size:13.5px">← To the Library</button></div>`; }
})();
