/* Bizzing Bee Library v2 — built on the APP's design system: lavender paper (--bg1),
   white cards with the app's line/chip/treasure tokens, cover-card gradients with the
   LIST_COVER textures, a guide avatar per volume (SB_AVATAR_ART), Bee Break boxes
   (quotes / similes / idioms), and paper games per chapter — crossword, word search,
   scramble & missing-letters — with an answer key in the back. Deterministic (seeded)
   so rebuilds are reproducible. Output: books/*.html + books/index.html. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('concepts-data.js', 'utf8'));
eval(fs.readFileSync('adv-concepts-data.js', 'utf8'));
eval(fs.readFileSync('avatars-art.js', 'utf8'));
eval(fs.readFileSync('quotes-lib.js', 'utf8'));
eval(fs.readFileSync('figurative-data.js', 'utf8'));
const GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
const AV = window.SB_AVATAR_ART, QUOTES = window.SB_QUOTES, FIG = window.SB_FIG;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shuf = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const maskDef = (d, w) => String(d || '').replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig'), '▁▁▁');

/* ---------------- volume plan (unchanged coverage) ---------------- */
const VOLS = [
  { n: 1,  title: 'Lift-Off!', tag: 'Bee basics from first buzz to first trophy', c: '#F0B429', c2: '#C8791B', tex: 'rings', av: 'honeypot', pick: ch => ch.category === 'Spelling Bee Basics' },
  { n: 2,  title: 'The Rulebook', tag: 'Spelling rules that actually hold up', c: '#13A892', c2: '#0E8A78', tex: 'grid', av: 'waggle', pick: ch => /Spelling Rules|Word Formation/.test(ch.category) },
  { n: 3,  title: 'Latin Launchers', tag: 'Fifteen prefix families that unlock thousands of words', c: '#7C5CFF', c2: '#4F2FC8', tex: 'stripes', av: 'bumble', pick: ch => ch.category === 'Latin Prefixes' },
  { n: 4,  title: 'Greek Lightning', tag: 'Greek and number prefixes, endings included', c: '#3D7DF0', c2: '#2A63D6', tex: 'cross', av: 'star', pick: ch => /Greek Prefixes|Number Prefixes|Greek Suffixes|Greek Medical/.test(ch.category) },
  { n: 5,  title: 'Endings That Win', tag: 'Suffixes, strategy and championship-level closers', c: '#E8458C', c2: '#CC2E72', tex: 'dots', av: 'diva', pick: ch => /Latin Suffixes|Latin & Old English Suffixes|Agent Suffixes|Advanced Vocabulary|Advanced Spelling Strategy|Championship Level/.test(ch.category) },
  { n: 6,  title: 'Root Camp: Latin', tag: 'Eleven Latin root families, drilled', c: '#C4453C', c2: '#B8322A', tex: 'diag', av: 'drone', pick: ch => ch.category === 'Latin Root Families' },
  { n: 7,  title: 'Root Camp: Greek', tag: 'Ten Greek root families, drilled', c: '#0E8A78', c2: '#075E51', tex: 'rings', av: 'clover', pick: ch => ch.category === 'Greek Root Families' },
  { n: 8,  title: 'The World Tour', tag: 'French, Italian, Celtic and the words that immigrated', c: '#E0922E', c2: '#B26E12', tex: 'stripes', av: 'nectar', pick: ch => /French Loanword|Italian Loanword|Loanword Language Groups/.test(ch.category) },
  { n: 9,  title: 'Subject Sprints', tag: 'Science, music, law, food — the vocabulary of everything', c: '#5B3DD6', c2: '#3A22A0', tex: 'grid', av: 'lumen', pick: ch => ch.category === 'Subject-Area Vocabulary' },
  { n: 10, title: 'Word Personalities', tag: 'Every word has a character. Meet them.', c: '#B14FC4', c2: '#7E2F92', tex: 'dots', av: 'jester', pick: ch => ch.category === 'Personality Themes' },
];
const orth = ADV.filter(ch => ch.category === 'Advanced Orthography');
const AVOLS = [
  { n: 11, title: 'The Playbook', tag: 'Bee-day procedure and the first deep-orthography drills', c: '#4A6B8A', c2: '#37506E', tex: 'grid', av: 'queenhive', chapters: ADV.filter(ch => ch.category === 'Championship Procedure').concat(orth.slice(0, 5)) },
  { n: 12, title: 'Schwa Country', tag: 'The vanishing vowel and its many disguises', c: '#5B3FA6', c2: '#3A2A72', tex: 'rings', av: 'blossom', chapters: orth.slice(5, 12) },
  { n: 13, title: 'Letters Behaving Badly', tag: 'Doubles, silents and sounds that lie', c: '#B8322A', c2: '#8F2B24', tex: 'diag', av: 'propolis', chapters: orth.slice(12) },
  { n: 14, title: 'Far-Flung Words', tag: 'Origins beyond the big four', c: '#2E8FB8', c2: '#1E6A8C', tex: 'cross', av: 'mic', chapters: ADV.filter(ch => ch.category === 'Origins Beyond the Big Four') },
  { n: 15, title: 'The Word Factory', tag: 'How English builds, borrows and bolts words together, piece by piece', c: '#4F9E6A', c2: '#3C8455', tex: 'stripes', av: 'maestro', chapters: ADV.filter(ch => ch.category === 'How Words Are Built') },
];
const NAMES = { honeypot: 'Honeypot', waggle: 'Waggle', bumble: 'Bumble', star: 'Star', diva: 'Diva', drone: 'Drone', clover: 'Clover', nectar: 'Nectar', lumen: 'Lumen', jester: 'Jester', queenhive: 'Queen Hive', blossom: 'Blossom', propolis: 'Propolis', mic: 'Mic', maestro: 'Maestro' };
const avatar = (id, size) => `<svg viewBox="0 0 120 120" style="width:${size};height:${size};flex-shrink:0" aria-hidden="true">${AV[id] || ''}</svg>`;

/* ---- the app's cover-card textures (LIST_COVER tex) ---- */
function texture(tex) {
  const S = 'stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none"';
  if (tex === 'rings') return `<circle cx="82%" cy="18%" r="70" ${S}/><circle cx="82%" cy="18%" r="110" ${S}/><circle cx="82%" cy="18%" r="150" ${S}/><circle cx="10%" cy="92%" r="60" ${S}/><circle cx="10%" cy="92%" r="95" ${S}/>`;
  if (tex === 'stripes') return [0, 1, 2, 3, 4, 5].map(i => `<path d="M${-80 + i * 90} 620 L${240 + i * 90} -40" ${S} stroke-width="14" stroke="rgba(255,255,255,.08)"/>`).join('');
  if (tex === 'dots') { let d = ''; for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) d += `<circle cx="${8 + x * 18}%" cy="${5 + y * 13}%" r="4" fill="rgba(255,255,255,.13)"/>`; return d; }
  if (tex === 'grid') { let d = ''; for (let i = 1; i < 8; i++) d += `<path d="M${i * 12.5}% 0 V100%" ${S}/><path d="M0 ${i * 12.5}% H100%" ${S}/>`; return d; }
  if (tex === 'diag') return [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-60 + i * 80} -40 L${140 + i * 80} 640" ${S}/>`).join('');
  return `<path d="M50% 0 V100% M0 50% H100%" ${S} stroke-width="30" stroke="rgba(255,255,255,.07)"/>`;
}

/* ---- Bee Break boxes: quotes / similes / idioms, seeded rotation ---- */
function beeBreak(rnd, kind) {
  if (kind === 0) { const pool = QUOTES.filter(q => q.q.length < 130); const q = pool[Math.floor(rnd() * pool.length)];
    return { icon: '💬', label: 'Bee Break · someone said it better', body: `“${esc(q.q)}”`, tail: '— ' + esc(q.a) + (q.who ? ', ' + esc(q.who) : '') }; }
  if (kind === 1) { const pool = FIG.similes.filter(x => (x.p + x.m).length < 150); const x = pool[Math.floor(rnd() * pool.length)];
    return { icon: '✨', label: 'Bee Break · simile of the page', body: `<b>${esc(x.p)}</b>`, tail: esc(x.m) }; }
  const pool = FIG.idioms.filter(x => (x.p + x.m).length < 150); const x = pool[Math.floor(rnd() * pool.length)];
  return { icon: '🎈', label: 'Bee Break · idiom to drop at dinner', body: `<b>${esc(x.p)}</b>`, tail: esc(x.m) };
}
const breakBox = bb => `<div class="bb"><span class="bbi">${bb.icon}</span><div><div class="bbl">${bb.label}</div><div class="bbb">${bb.body}</div><div class="bbt">${bb.tail}</div></div></div>`;

/* ---- games ---- */
function crossword(words, rnd) {
  const W = words.filter(w => /^[a-z]{4,12}$/i.test(w.w)).slice(0, 10).map(w => ({ ...w, u: w.w.toUpperCase() }));
  if (W.length < 4) return null;
  W.sort((a, b) => b.u.length - a.u.length);
  const N = 17, g = Array.from({ length: N }, () => Array(N).fill(null));
  const placed = [];
  const fits = (u, r, c, dr, dc) => {
    if (r < 0 || c < 0 || r + dr * (u.length - 1) >= N || c + dc * (u.length - 1) >= N) return false;
    const br = r - dr, bc = c - dc; if (br >= 0 && bc >= 0 && br < N && bc < N && g[br][bc]) return false;
    const ar = r + dr * u.length, ac = c + dc * u.length; if (ar < N && ac < N && g[ar][ac]) return false;
    for (let i = 0; i < u.length; i++) { const rr = r + dr * i, cc = c + dc * i; const cur = g[rr][cc];
      if (cur) { if (cur !== u[i]) return false; }
      else { // no touching parallel neighbours
        if (dr === 0) { if ((rr > 0 && g[rr - 1][cc]) || (rr < N - 1 && g[rr + 1][cc])) return false; }
        else { if ((cc > 0 && g[rr][cc - 1]) || (cc < N - 1 && g[rr][cc + 1])) return false; } } }
    return true;
  };
  const put = (w, r, c, dr, dc) => { for (let i = 0; i < w.u.length; i++) g[r + dr * i][c + dc * i] = w.u[i]; placed.push({ ...w, r, c, dr, dc }); };
  put(W[0], Math.floor(N / 2), Math.floor((N - W[0].u.length) / 2), 0, 1);
  for (const w of W.slice(1)) {
    let done = false;
    const opts = [];
    for (const p of placed) for (let i = 0; i < p.u.length && !done; i++) for (let j = 0; j < w.u.length; j++) {
      if (p.u[i] !== w.u[j]) continue;
      const dr = p.dr === 0 ? 1 : 0, dc = p.dr === 0 ? 0 : 1;
      const r = p.r + p.dr * i - dr * j, c = p.c + p.dc * i - dc * j;
      if (fits(w.u, r, c, dr, dc)) opts.push([r, c, dr, dc]);
    }
    if (opts.length) { const o = opts[Math.floor(rnd() * opts.length)]; put(w, o[0], o[1], o[2], o[3]); }
  }
  if (placed.length < 4) return null;
  let r0 = N, r1 = 0, c0 = N, c1 = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c]) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  // numbering
  const nums = {}; let n = 0; const across = [], down = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    if (!g[r][c]) continue;
    const startsA = (c === c0 || !g[r][c - 1]) && c + 1 <= c1 && g[r][c + 1];
    const startsD = (r === r0 || !g[r - 1][c]) && r + 1 <= r1 && g[r + 1][c];
    if (startsA || startsD) { n++; nums[r + ',' + c] = n;
      const findWord = (dr, dc) => placed.find(p => p.r === r && p.c === c && p.dr === dr && p.dc === dc);
      if (startsA) { const p = findWord(0, 1); if (p) across.push({ n, ...p }); }
      if (startsD) { const p = findWord(1, 0); if (p) down.push({ n, ...p }); } }
  }
  return { g, r0, r1, c0, c1, nums, across, down, placed };
}
function cwHTML(cw) {
  let rows = '';
  for (let r = cw.r0; r <= cw.r1; r++) { rows += '<tr>';
    for (let c = cw.c0; c <= cw.c1; c++) { const ch = cw.g[r][c]; const num = cw.nums[r + ',' + c];
      rows += ch ? `<td class="cwc">${num ? `<i>${num}</i>` : ''}</td>` : '<td class="cwx"></td>'; }
    rows += '</tr>'; }
  const clue = p => `<div><b>${p.n}.</b> ${esc(maskDef((p.def || '').slice(0, 78), p.w))}</div>`;
  return `<div class="cwwrap"><table class="cw">${rows}</table></div>
    <div class="clues"><div><div class="clueh">Across</div>${cw.across.map(clue).join('')}</div>
    <div><div class="clueh">Down</div>${cw.down.map(clue).join('')}</div></div>`;
}
function wordSearch(words, rnd) {
  const W = words.filter(w => /^[a-z]{4,12}$/i.test(w.w)).slice(0, 10).map(w => w.w.toUpperCase());
  if (W.length < 5) return null;
  const N = 13, g = Array.from({ length: N }, () => Array(N).fill(''));
  const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
  const placedW = [];
  for (const u of W) { let ok = false;
    for (let t = 0; t < 220 && !ok; t++) {
      const [dr, dc] = DIRS[Math.floor(rnd() * DIRS.length)];
      const r = Math.floor(rnd() * N), c = Math.floor(rnd() * N);
      const er = r + dr * (u.length - 1), ec = c + dc * (u.length - 1);
      if (er < 0 || ec < 0 || er >= N || ec >= N) continue;
      let clash = false;
      for (let i = 0; i < u.length; i++) { const cur = g[r + dr * i][c + dc * i]; if (cur && cur !== u[i]) { clash = true; break; } }
      if (clash) continue;
      for (let i = 0; i < u.length; i++) g[r + dr * i][c + dc * i] = u[i];
      placedW.push(u); ok = true;
    } }
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) g[r][c] = AZ[Math.floor(rnd() * 26)];
  return { g, words: placedW };
}
const wsHTML = ws => `<table class="ws">${ws.g.map(row => '<tr>' + row.map(ch => `<td>${ch}</td>`).join('') + '</tr>').join('')}</table>
  <div class="wsl">${ws.words.map(w => `<span class="chip">${esc(w.toLowerCase())}</span>`).join('')}</div>`;
function scramblePage(words, rnd) {
  const pool = words.filter(w => /^[a-z]{4,12}$/i.test(w.w));
  const sc = shuf(pool.slice(), rnd).slice(0, 7).map(w => { let s = w.w;
    for (let t = 0; t < 20 && s === w.w; t++) s = shuf(w.w.split(''), rnd).join('');
    return { w: w.w, s }; });
  const ml = shuf(pool.slice(), rnd).slice(0, 7).map(w => ({ w: w.w, m: w.w.replace(/[aeiou]/g, '_') }));
  return { sc, ml };
}

/* ---------------- CSS: the app's design system on paper ---------------- */
function css(vol) {
  return `
  @font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
  @font-face{font-family:'Fredoka';src:url('../fonts/fredoka-600.woff2') format('woff2');font-weight:600}
  @font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg1:#f3efff;--bg2:#fff;--line:#ddd4f2;--chip:#e6defc;--chipInk:#4a3aa0;--text:#241E33;--muted:#6b6482;
    --treasure:#F0B429;--treasure-tint:#FFF3D6;--treasure-deep:#8A5B00;--good:#2E8B57;--c:${vol.c};--c2:${vol.c2};
    --tint:color-mix(in srgb,${vol.c} 10%,white)}
  html{background:#e5dff2}
  body{font-family:'Hanken Grotesk',sans-serif;color:var(--text);letter-spacing:.02em;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{size:8.5in 11in;margin:0}
  .pg{width:8.5in;height:11in;background:var(--bg1);position:relative;overflow:hidden;padding:.58in .62in;page-break-after:always;break-after:page}
  @media screen{.pg{margin:24px auto;box-shadow:0 10px 40px rgba(30,20,60,.18);border-radius:4px}}
  h1,h2,h3,.disp{font-family:'Baloo 2';font-weight:800}
  .kicker{font-family:'Fredoka';font-weight:600;font-size:10pt;letter-spacing:.13em;text-transform:uppercase;color:var(--c2)}
  .foot{position:absolute;bottom:.32in;left:.62in;right:.62in;display:flex;justify-content:space-between;font-size:8.5pt;color:var(--muted);font-weight:600}
  .panel{background:var(--bg2);border:1px solid var(--line);border-radius:16px;box-shadow:0 4px 14px rgba(108,79,224,.08)}
  .badge{display:inline-grid;place-items:center;width:.58in;height:.58in;border-radius:15px;background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;font-family:'Baloo 2';font-size:16pt;box-shadow:0 3px 8px color-mix(in srgb,var(--c) 40%,transparent)}
  .chip{display:inline-block;background:var(--chip);color:var(--chipInk);font-weight:700;font-size:9pt;border-radius:999px;padding:3px 11px}
  .concept{background:var(--tint);border:1px solid color-mix(in srgb,var(--c) 30%,white);border-left:6px solid var(--c);border-radius:14px;padding:.13in .17in;font-size:10.4pt;line-height:1.5;margin:.1in 0}
  .method{background:#241E33;color:#F4EFFF;border-radius:16px;padding:.14in .18in;font-size:9.6pt;line-height:1.5;margin:.1in 0;box-shadow:0 5px 14px rgba(36,30,51,.28)}
  .method b{color:var(--treasure)} .method div{margin:3px 0}
  .method .trick,.method [class]{font-family:'Baloo 2';font-size:12pt;letter-spacing:.05em}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:.1in;margin-top:.1in}
  .card{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:.1in .12in;box-shadow:0 3px 10px rgba(108,79,224,.07)}
  .card h3{font-size:9.8pt;color:var(--c2);margin-bottom:3px}
  .card p{font-size:8.6pt;line-height:1.38;color:var(--text)}
  .dense .concept{font-size:9.4pt;line-height:1.42}
  .dense .method{font-size:8.8pt;line-height:1.44}
  .dense .card p{font-size:7.9pt;line-height:1.32} .dense .card h3{font-size:9pt}
  .wgrid{display:grid;grid-template-columns:1fr 1fr;gap:.12in}
  .wd{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:.11in .13in;box-shadow:0 3px 10px rgba(108,79,224,.06)}
  .wd .w{font-family:'Baloo 2';font-size:14pt;color:var(--c2)}
  .wd .say{font-family:'Fredoka';font-size:8.8pt;color:var(--muted);margin-left:6px}
  .wd .d{font-size:8.8pt;line-height:1.38;margin-top:2px}
  .wd .h{font-size:8.4pt;line-height:1.32;margin-top:4px;color:var(--chipInk);background:var(--chip);border-radius:8px;padding:4px 7px}
  .wd .line{border-bottom:2px dashed #C9BFE6;height:.22in;margin-top:6px}
  .rr{columns:2;column-gap:.28in;font-size:9pt;line-height:1.42}
  .rr>div{break-inside:avoid;padding:4px 6px;margin-bottom:4px;background:var(--bg2);border:1px solid var(--line);border-radius:9px}
  .rr b{font-family:'Fredoka';color:var(--c2)}
  .biglist{columns:4;column-gap:.2in;font-size:8.6pt;line-height:1.6}
  .biglist div{break-inside:avoid}
  .biglist span{display:inline-block;width:.13in;height:.13in;border:1.6px solid var(--c);border-radius:50%;margin-right:5px;vertical-align:-2px;background:var(--bg2)}
  .bb{display:flex;gap:.12in;align-items:flex-start;background:var(--treasure-tint);border:1px solid var(--treasure);border-radius:14px;padding:.11in .14in;margin-top:.14in}
  .bb .bbi{font-size:15pt} .bb .bbl{font-family:'Fredoka';font-size:8.4pt;letter-spacing:.1em;text-transform:uppercase;color:var(--treasure-deep);font-weight:600}
  .bb .bbb{font-size:9.8pt;line-height:1.4;margin-top:2px} .bb .bbt{font-size:8.6pt;color:var(--muted);margin-top:2px}
  .bubble{position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:.13in .17in;font-size:10.5pt;line-height:1.5;box-shadow:0 4px 14px rgba(108,79,224,.08)}
  .bubble:after{content:'';position:absolute;left:-9px;top:24px;width:16px;height:16px;background:var(--bg2);border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg)}
  .cwwrap{display:flex;justify-content:center}
  .cw{border-collapse:collapse} .cw td{width:.30in;height:.30in;position:relative}
  .cw .cwc{background:var(--bg2);border:1.4px solid var(--chipInk)}
  .cw .cwc i{position:absolute;top:1px;left:2px;font-style:normal;font-size:5.6pt;color:var(--muted)}
  .cw .cwx{background:transparent}
  .clues{display:grid;grid-template-columns:1fr 1fr;gap:.2in;margin-top:.14in;font-size:8.6pt;line-height:1.45}
  .clues .clueh{font-family:'Baloo 2';font-size:10.5pt;color:var(--c2);margin-bottom:3px}
  .clues b{color:var(--chipInk)}
  .ws{border-collapse:collapse;margin:0 auto} .ws td{width:.27in;height:.27in;text-align:center;font-family:'Fredoka';font-size:10pt;background:var(--bg2);border:1px solid var(--line)}
  .wsl{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin-top:.14in}
  .gtwo{display:grid;grid-template-columns:1fr 1fr;gap:.2in}
  .g1{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:.12in .14in}
  .g1 .gw{font-family:'Fredoka';font-size:11pt;letter-spacing:.16em;color:var(--c2)}
  .g1 .gl{border-bottom:2px dashed #C9BFE6;height:.24in;margin-top:5px}
  .key{columns:3;column-gap:.2in;font-size:8.4pt;line-height:1.55}
  .key h3{column-span:all;font-size:11pt;color:var(--c2);margin:.06in 0 .04in}
  `;
}
const foot = (vol, txt) => `<div class="foot"><span>${esc(vol.title)} · Bizzing Bee</span><span>${txt}</span></div>`;

/* ---------------- pages ---------------- */
function cover(vol, nCh, nWords, advB) {
  return `<div class="pg" style="background:linear-gradient(160deg,var(--c),var(--c2));color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:.55in">
    <svg style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${texture(vol.tex)}</svg>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'Fredoka';font-weight:600;letter-spacing:.16em;font-size:10.5pt">BIZZING BEE ${advB ? 'ADVANCED ' : ''}LIBRARY</span>
      <span class="disp" style="background:rgba(0,0,0,.3);padding:.07in .2in;border-radius:999px;font-size:12.5pt">Vol. ${vol.n}</span>
    </div>
    <div style="position:relative;text-align:center">
      ${avatar(vol.av, '1.7in')}
      <h1 style="font-size:44pt;line-height:1.02;margin:.14in 0 .1in;text-shadow:0 3px 0 rgba(0,0,0,.2)">${esc(vol.title)}</h1>
      <p style="font-family:'Fredoka';font-size:13.5pt;max-width:5.8in;margin:0 auto">${esc(vol.tag)}</p>
      <p style="font-family:'Fredoka';font-size:10pt;margin-top:.12in;opacity:.9">with ${esc(NAMES[vol.av])}, your guide</p>
    </div>
    <div style="position:relative;display:flex;gap:.14in;justify-content:center">
      ${[[nCh, advB ? 'expert chapters' : 'chapters'], [nWords, 'practice words'], ['🎲', 'puzzles & games']].map(([a, b]) =>
        `<div style="background:rgba(0,0,0,.24);border-radius:14px;padding:.12in .28in;text-align:center"><div class="disp" style="font-size:17pt">${a}</div><div style="font-family:'Fredoka';font-size:9pt">${b}</div></div>`).join('')}
    </div></div>`;
}
function howTo(vol, advB) {
  const steps = [
    ['Read the Big Idea', 'One idea per chapter, and it explains a whole family of words. Read it out loud. Twice is better.'],
    ['Steal the pro move', 'The dark box is how a champion thinks on stage. It works on words you have never met.'],
    ['Spell in the boxes', 'Say it, spell it OUT LOUD, then write it. Hand and mouth together beat eyes alone.'],
    ['Play the puzzle', 'Every chapter ends in a game — crossword, word search or scramble. Sneaky practice is still practice.'],
    ['Hunt the Big List', 'The back of the book holds every word. Circle the bubbles you own. Come back for the empty ones.'],
  ];
  return `<div class="pg">
    <div class="kicker">How this book works</div>
    <h1 style="font-size:24pt;margin:.06in 0 .16in">Five moves, no fluff.</h1>
    <div style="display:flex;gap:.16in;align-items:flex-start;margin-bottom:.2in">
      ${avatar(vol.av, '1in')}
      <div class="bubble">Hi! I'm <b>${esc(NAMES[vol.av])}</b>. ${esc(vol.tag)} — that's our whole mission. Bring a pencil; I'll bring the words. Deal?</div>
    </div>
    ${steps.map(([t, b], i) => `<div style="display:flex;gap:.16in;margin-bottom:.16in;align-items:flex-start">
      <span class="badge">${i + 1}</span>
      <div class="panel" style="flex:1;padding:.1in .15in"><h3 style="font-size:12.5pt;color:var(--c2)">${t}</h3><p style="font-size:10pt;line-height:1.5">${b}</p></div></div>`).join('')}
    <div class="concept" style="margin-top:.15in"><b>Grown-ups:</b> this book pairs with the Bizzing Bee app — the same chapters are narrated there, and every word has real recorded audio in the Word Coach.</div>
    ${foot(vol, advB ? 'Advanced Pack material' : 'Part of the 122-chapter course')}</div>`;
}
function chapterPages(vol, ch, ci, advB, rnd, keys) {
  const cards = (ch.cards || []).slice(0, 6);
  const words = (ch.words || []).filter(w => w && w.w);
  const tl = String(ch.concept || '').length + String(ch.method || '').length + cards.reduce((a, cd) => a + String(cd.title).length + String(cd.body).length, 0);
  const out = [];
  const bb = tl < 1000 ? breakBox(beeBreak(rnd, (vol.n + ci) % 3)) : '';
  out.push(`<div class="pg${tl > 1500 ? ' dense' : ''}">
    <div style="display:flex;align-items:center;gap:.14in">
      <span class="badge">${ci + 1}</span>
      <div><div class="kicker">${esc(ch.category)}</div>
      <h2 style="font-size:19pt;line-height:1.08">${esc(ch.title)}</h2></div></div>
    <div class="kicker" style="margin-top:.16in">The big idea</div>
    <div class="concept">${esc(ch.concept)}</div>
    ${ch.method ? `<div class="kicker" style="margin-top:.08in">The pro move</div><div class="method">${String(ch.method)}</div>` : ''}
    ${cards.length ? `<div class="cards">${cards.map(cd => `<div class="card"><h3>${esc(cd.title)}</h3><p>${esc(cd.body)}</p></div>`).join('')}</div>` : ''}
    ${bb}
    ${foot(vol, 'Chapter ' + (ci + 1))}</div>`);
  const FULLN = advB ? 16 : 8;
  const fullAll = words.slice(0, FULLN);
  for (let f = 0; f < fullAll.length; f += 8) {
    const full = fullAll.slice(f, f + 8);
    out.push(`<div class="pg">
    <div class="kicker">Practice hive · ${esc(ch.title)}${fullAll.length > 8 ? ' · ' + (f / 8 + 1) : ''}</div>
    <h2 style="font-size:16pt;margin:.04in 0 .14in">Say it. Spell it out loud. Then write it.</h2>
    <div class="wgrid">${full.map(w => { const dd = String(w.def || ''); const hh = String(w.hook || '');
      return `<div class="wd"><span class="w">${esc(w.w)}</span>${w.say ? `<span class="say">/ ${esc(w.say)} /</span>` : ''}
      <div class="d">${esc(dd.length > 95 ? dd.slice(0, 93) + '…' : dd)}</div>${hh ? `<div class="h">💡 ${esc(hh.length > 115 ? hh.slice(0, 113) + '…' : hh)}</div>` : ''}<div class="line"></div></div>`; }).join('')}</div>
    ${foot(vol, 'Chapter ' + (ci + 1) + ' practice')}</div>`);
  }
  const rest = words.slice(FULLN);
  for (let i = 0; i < rest.length; i += 20) {
    const seg = rest.slice(i, i + 20);
    out.push(`<div class="pg">
      <div class="kicker">Rapid round · ${esc(ch.title)}</div>
      <h2 style="font-size:16pt;margin:.04in 0 .14in">More ammo — one line each.</h2>
      <div class="rr">${seg.map(w => `<div><b>${esc(w.w)}</b>${w.say ? ` <span style="color:var(--muted);font-size:8.2pt">/ ${esc(w.say)} /</span>` : ''}<br>${esc((w.def || '').slice(0, 70))}</div>`).join('')}</div>
      ${foot(vol, 'Chapter ' + (ci + 1) + ' extras')}</div>`);
  }
  // ---- game page: rotate crossword / word search / scramble+missing ----
  const kind = ci % 3;
  let gameBody = '', gameTitle = '', keyLine = '';
  if (kind === 0) { const cw = crossword(words, rnd);
    if (cw) { gameTitle = 'Crossword'; gameBody = cwHTML(cw);
      keyLine = `<div><b>Ch. ${ci + 1} crossword</b> — Across: ${cw.across.map(p => p.n + ' ' + p.w).join(', ')} · Down: ${cw.down.map(p => p.n + ' ' + p.w).join(', ')}</div>`; } }
  if (!gameBody && kind !== 2) { const ws = wordSearch(words, rnd);
    if (ws) { gameTitle = 'Word search'; gameBody = wsHTML(ws) + `<p style="text-align:center;font-size:8.6pt;color:var(--muted);margin-top:.08in">Words run in every direction — even backwards.</p>`; } }
  if (!gameBody) { const sp = scramblePage(words, rnd);
    gameTitle = 'Scramble & rescue';
    gameBody = `<div class="gtwo"><div><div class="kicker" style="margin-bottom:.08in">Unscramble</div>
      ${sp.sc.map(x => `<div class="g1" style="margin-bottom:.09in"><span class="gw">${esc(x.s)}</span><div class="gl"></div></div>`).join('')}</div>
      <div><div class="kicker" style="margin-bottom:.08in">Rescue the vowels</div>
      ${sp.ml.map(x => `<div class="g1" style="margin-bottom:.09in"><span class="gw">${esc(x.m)}</span><div class="gl"></div></div>`).join('')}</div></div>`;
    keyLine = `<div><b>Ch. ${ci + 1} scramble</b> — ${sp.sc.map(x => x.s + '=' + x.w).join(', ')} · vowels: ${sp.ml.map(x => x.w).join(', ')}</div>`;
  }
  if (gameBody) {
    const bb2 = breakBox(beeBreak(rnd, (vol.n + ci + 1) % 3));
    out.push(`<div class="pg">
      <div style="display:flex;align-items:center;gap:.12in;margin-bottom:.1in">${avatar(vol.av, '.62in')}
        <div><div class="kicker">${esc(NAMES[vol.av])}'s puzzle page · ${esc(ch.title)}</div>
        <h2 style="font-size:16pt">${gameTitle}</h2></div></div>
      ${gameBody}${bb2}
      ${foot(vol, 'Chapter ' + (ci + 1) + ' game')}</div>`);
    if (keyLine) keys.push(keyLine);
  }
  return out;
}
function bigList(vol, allWords) {
  const uniq = [...new Map(allWords.map(w => [w.w.toLowerCase(), w])).values()].sort((a, b) => a.w.localeCompare(b.w));
  const out = []; const PER = 100;
  for (let i = 0; i < uniq.length; i += PER) {
    const seg = uniq.slice(i, i + PER);
    out.push(`<div class="pg">
      <div class="kicker">The big list ${uniq.length > PER ? (Math.floor(i / PER) + 1) + ' of ' + Math.ceil(uniq.length / PER) : ''}</div>
      <h2 style="font-size:16pt;margin:.04in 0 .16in">Every word in this book. Circle what you own.</h2>
      <div class="biglist">${seg.map(w => `<div><span></span>${esc(w.w)}</div>`).join('')}</div>
      ${foot(vol, uniq.length + ' words')}</div>`);
  }
  return out;
}
function keyPages(vol, keys) {
  const out = []; const PER = 14;
  for (let i = 0; i < keys.length; i += PER) {
    out.push(`<div class="pg"><div class="kicker">No peeking until you've tried</div>
      <h2 style="font-size:16pt;margin:.04in 0 .14in">Answer key${keys.length > PER ? ' · ' + (Math.floor(i / PER) + 1) : ''}</h2>
      <div class="key">${keys.slice(i, i + PER).join('')}</div>${foot(vol, 'Answers')}</div>`);
  }
  return out;
}
function colophon(vol) {
  return `<div class="pg" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${avatar(vol.av, '1.4in')}
    <h2 style="font-size:18pt;margin:.12in 0">${esc(NAMES[vol.av])} says: that's a whole book. Respect.</h2>
    <p style="font-size:10.5pt;max-width:5.4in;margin:0 auto .28in;line-height:1.6">Every word in here also lives in the Bizzing Bee app, with real audio, games and a coach that remembers what you miss. Paper for the muscles, app for the ears.</p>
    <p style="font-size:8.4pt;color:var(--muted);max-width:5.8in;margin:0 auto;line-height:1.6">Bizzing Bee · an independent study project. Not affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Competition names appear only to describe which bees the practice material relates to. Definitions, sentences and hints are written for this project. Typefaces are open-licensed (SIL OFL).</p></div>`;
}

function buildBook(vol, chapters, advB) {
  const rnd = mulberry(vol.n * 7919 + 17);
  const allWords = chapters.flatMap(ch => (ch.words || []).filter(w => w && w.w));
  const keys = [];
  let pages = [cover(vol, chapters.length, allWords.length, advB), howTo(vol, advB)];
  chapters.forEach((ch, i) => { pages = pages.concat(chapterPages(vol, ch, i, advB, rnd, keys)); });
  pages = pages.concat(bigList(vol, allWords));
  pages = pages.concat(keyPages(vol, keys));
  pages.push(colophon(vol));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(vol.title)} — Bizzing Bee ${advB ? 'Advanced ' : ''}Library Vol. ${vol.n}</title>
<style>${css(vol)}</style></head><body>${pages.join('\n')}</body></html>`;
  fs.writeFileSync(`books/book-${String(vol.n).padStart(2, '0')}.html`, html);
  return { pages: pages.length, words: allWords.length, chapters: chapters.length };
}

fs.mkdirSync('books', { recursive: true });
const made = []; const used = new Set();
for (const vol of VOLS) { const chs = GEN.filter(ch => vol.pick(ch)); chs.forEach(ch => used.add(ch.title)); made.push({ vol, ...buildBook(vol, chs, false) }); }
const leftover = GEN.filter(ch => !used.has(ch.title));
if (leftover.length) { console.error('UNASSIGNED:', leftover.map(c => c.title)); process.exit(1); }
const advUsed = new Set();
for (const vol of AVOLS) { vol.chapters.forEach(ch => advUsed.add(ch.title)); made.push({ vol, ...buildBook(vol, vol.chapters, true) }); }
if (advUsed.size !== ADV.length) { console.error('ADV coverage', advUsed.size, '/', ADV.length); process.exit(1); }

const hub = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bizzing Bee Library — 15 graphic study books</title><style>
@font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
@font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Hanken Grotesk',sans-serif;background:#f3efff;color:#241E33;padding:34px 20px 60px}
main{max-width:1000px;margin:0 auto}h1{font-family:'Baloo 2';font-size:34px}p.lead{color:#6b6482;margin:8px 0 26px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:16px}
.bk{border-radius:16px;padding:18px 15px;color:#fff;display:flex;flex-direction:column;gap:6px;min-height:190px}
.bk svg{width:52px;height:52px}.bk b{font-family:'Baloo 2';font-size:17px;line-height:1.15}.bk span{font-size:12px;opacity:.92}
.bk .links{margin-top:auto;display:flex;gap:8px}
.bk .links a{background:rgba(0,0,0,.28);color:#fff;text-decoration:none;font-weight:700;font-size:12px;padding:5px 10px;border-radius:999px}
.canva{background:#fff;border:1px solid #ddd4f2;border-radius:14px;padding:18px 20px;margin:28px 0;line-height:1.6;font-size:14.5px}
.canva b{font-family:'Baloo 2'}</style></head><body><main>
<h1>The Bizzing Bee Library</h1>
<p class="lead">Fifteen graphic study books — ten across the full 122-chapter course, five bigger volumes for the Advanced Pack.
Concepts, practice words, puzzles and games on letter-size pages, in the app's own design language.</p>
<div class="canva"><b>Getting a book into Canva:</b> download the PDF, then in Canva choose <b>Create a design → Import file</b>
(or drag the PDF onto Canva's home page). Every page becomes an editable design. The HTML is the print master.</div>
<div class="grid">
${made.map(m => `<div class="bk" style="background:linear-gradient(160deg,${m.vol.c},${m.vol.c2})">
  <svg viewBox="0 0 120 120">${AV[m.vol.av] || ''}</svg>
  <b>Vol. ${m.vol.n} — ${esc(m.vol.title)}</b><span>${esc(m.vol.tag)}</span>
  <span>${m.chapters} chapters · ${m.words} words · ${m.pages} pages</span>
  <div class="links"><a href="book-${String(m.vol.n).padStart(2, '0')}.html">Read</a><a href="pdf/book-${String(m.vol.n).padStart(2, '0')}.pdf">PDF</a></div></div>`).join('')}
</div>
<p style="font-size:12px;color:#8b83a3;margin-top:26px">Bizzing Bee · independent study material · not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</p>
</main></body></html>`;
fs.writeFileSync('books/index.html', hub);
made.forEach(m => console.log(`Vol.${String(m.vol.n).padStart(2)} ${m.vol.title.padEnd(24)} ${String(m.chapters).padStart(3)} ch  ${String(m.words).padStart(5)} words  ${String(m.pages).padStart(3)} pages`));
console.log('total pages:', made.reduce((a, m) => a + m.pages, 0));
