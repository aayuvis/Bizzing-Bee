/* Books 16 & 17 — the collections. Same design system as mkbooks2 (app tokens, guide
   avatars, textures, Bee-style furniture). Book 16 "As Busy as a Bee": all 350 similes +
   240 hall-of-fame idioms with origin stories, match-the-halves games, draw-it pages.
   Book 17 "Say It Like a Champion": 12 themed chapters of 20 curated quotes with
   kid-meanings, who-said-it games. Also regenerates books/index.html for all 17. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('avatars-art.js', 'utf8'));
eval(fs.readFileSync('quotes-lib.js', 'utf8'));
eval(fs.readFileSync('figurative-data.js', 'utf8'));
const AV = window.SB_AVATAR_ART, QUOTES = window.SB_QUOTES, FIG = window.SB_FIG;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clamp = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shuf = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const avatar = (id, size) => `<svg viewBox="0 0 120 120" style="width:${size};height:${size};flex-shrink:0" aria-hidden="true">${AV[id] || ''}</svg>`;
function texture(tex) {
  const S = 'stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none"';
  if (tex === 'rings') return `<circle cx="82%" cy="18%" r="70" ${S}/><circle cx="82%" cy="18%" r="110" ${S}/><circle cx="82%" cy="18%" r="150" ${S}/><circle cx="10%" cy="92%" r="60" ${S}/><circle cx="10%" cy="92%" r="95" ${S}/>`;
  if (tex === 'dots') { let d = ''; for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) d += `<circle cx="${8 + x * 18}%" cy="${5 + y * 13}%" r="4" fill="rgba(255,255,255,.13)"/>`; return d; }
  return [0, 1, 2, 3, 4, 5].map(i => `<path d="M${-80 + i * 90} 620 L${240 + i * 90} -40" ${S} stroke-width="14" stroke="rgba(255,255,255,.08)"/>`).join('');
}
function css(vol) {
  return `
  @font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
  @font-face{font-family:'Fredoka';src:url('../fonts/fredoka-600.woff2') format('woff2');font-weight:600}
  @font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--bg1:#f3efff;--bg2:#fff;--line:#ddd4f2;--chip:#e6defc;--chipInk:#4a3aa0;--text:#241E33;--muted:#6b6482;
    --treasure:#F0B429;--treasure-tint:#FFF3D6;--treasure-deep:#8A5B00;--c:${vol.c};--c2:${vol.c2};
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
  .chip{display:inline-block;background:var(--chip);color:var(--chipInk);font-weight:700;font-size:9pt;border-radius:999px;padding:3px 11px}
  .bubble{position:relative;background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:.13in .17in;font-size:10.5pt;line-height:1.5;box-shadow:0 4px 14px rgba(108,79,224,.08)}
  .bubble:after{content:'';position:absolute;left:-9px;top:24px;width:16px;height:16px;background:var(--bg2);border-left:1px solid var(--line);border-bottom:1px solid var(--line);transform:rotate(45deg)}
  .sim{background:var(--bg2);border:1px solid var(--line);border-radius:14px;padding:.11in .14in;box-shadow:0 3px 10px rgba(108,79,224,.06)}
  .sim .p{font-family:'Baloo 2';font-size:12.5pt;color:var(--c2);line-height:1.15}
  .sim .m{font-size:9pt;line-height:1.38;margin-top:3px}
  .sim .os{font-size:8.2pt;line-height:1.35;margin-top:4px;color:var(--chipInk);background:var(--chip);border-radius:8px;padding:4px 7px}
  .simgrid{display:grid;grid-template-columns:1fr 1fr;gap:.12in}
  .idm{padding:5px 8px;background:var(--bg2);border:1px solid var(--line);border-radius:10px;margin-bottom:5px;break-inside:avoid;font-size:8.8pt;line-height:1.35}
  .idm b{font-family:'Fredoka';color:var(--c2)}
  .idcols{columns:2;column-gap:.24in}
  .qt{background:var(--bg2);border:1px solid var(--line);border-radius:16px;padding:.13in .17in;margin-bottom:.12in;box-shadow:0 3px 10px rgba(108,79,224,.06)}
  .qt .q{font-family:'Baloo 2';font-size:12pt;line-height:1.3;color:var(--text)}
  .qt .q:before{content:'“';color:var(--c);font-size:16pt}
  .qt .a{font-family:'Fredoka';font-size:9pt;color:var(--c2);margin-top:4px}
  .qt .m{font-size:8.6pt;line-height:1.35;margin-top:5px;color:var(--chipInk);background:var(--chip);border-radius:8px;padding:4px 8px}
  .match{display:grid;grid-template-columns:1fr 1fr;gap:.2in;font-size:9.2pt;line-height:1.45}
  .match .mh{font-family:'Baloo 2';font-size:11pt;color:var(--c2);margin-bottom:4px}
  .match div.row{padding:5px 8px;background:var(--bg2);border:1px solid var(--line);border-radius:10px;margin-bottom:5px}
  .match b{color:var(--chipInk)}
  .drawbox{background:var(--bg2);border:2px dashed var(--line);border-radius:16px;height:3.1in;display:grid;place-items:center;color:var(--muted);font-family:'Fredoka';font-size:10pt}
  .lines div{border-bottom:2px dashed #C9BFE6;height:.34in}
  .key{columns:3;column-gap:.2in;font-size:8.4pt;line-height:1.55}
  .badge{display:inline-grid;place-items:center;width:.58in;height:.58in;border-radius:15px;background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;font-family:'Baloo 2';font-size:16pt}
  `;
}
const foot = (vol, txt) => `<div class="foot"><span>${esc(vol.title)} · Bizzing Bee</span><span>${txt}</span></div>`;
function cover(vol, stats) {
  return `<div class="pg" style="background:linear-gradient(160deg,var(--c),var(--c2));color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:.55in">
    <svg style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${texture(vol.tex)}</svg>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'Fredoka';font-weight:600;letter-spacing:.16em;font-size:10.5pt">BIZZING BEE COLLECTIONS</span>
      <span class="disp" style="background:rgba(0,0,0,.3);padding:.07in .2in;border-radius:999px;font-size:12.5pt">Vol. ${vol.n}</span>
    </div>
    <div style="position:relative;text-align:center">
      ${avatar(vol.av, '1.7in')}
      <h1 style="font-size:42pt;line-height:1.02;margin:.14in 0 .1in;text-shadow:0 3px 0 rgba(0,0,0,.2)">${esc(vol.title)}</h1>
      <p style="font-family:'Fredoka';font-size:13.5pt;max-width:5.8in;margin:0 auto">${esc(vol.tag)}</p>
      <p style="font-family:'Fredoka';font-size:10pt;margin-top:.12in;opacity:.9">with ${esc(vol.guide)}, your guide</p>
    </div>
    <div style="position:relative;display:flex;gap:.14in;justify-content:center">
      ${stats.map(([a, b]) => `<div style="background:rgba(0,0,0,.24);border-radius:14px;padding:.12in .28in;text-align:center"><div class="disp" style="font-size:17pt">${a}</div><div style="font-family:'Fredoka';font-size:9pt">${b}</div></div>`).join('')}
    </div></div>`;
}
function colophon(vol, msg) {
  return `<div class="pg" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${avatar(vol.av, '1.4in')}
    <h2 style="font-size:18pt;margin:.12in 0">${esc(msg)}</h2>
    <p style="font-size:10.5pt;max-width:5.4in;margin:0 auto .28in;line-height:1.6">There's more where this came from — the Bizzing Bee app carries the full collection, with audio, games and a coach that remembers what you love.</p>
    <p style="font-size:8.4pt;color:var(--muted);max-width:5.8in;margin:0 auto;line-height:1.6">Bizzing Bee · an independent study project. Not affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Meanings and commentary are written for this project. Typefaces are open-licensed (SIL OFL).</p></div>`;
}

/* ================= Book 16 — As Busy as a Bee ================= */
function book16() {
  const vol = { n: 16, title: 'As Busy as a Bee', tag: 'Every simile we know, and the idiom hall of fame — with the true stories behind them', c: '#F0703C', c2: '#D85A29', tex: 'dots', av: 'popcorn', guide: 'Popcorn' };
  const rnd = mulberry(16 * 7919 + 17);
  const sims = FIG.similes.slice().sort((a, b) => a.p.localeCompare(b.p));
  const idioms = FIG.idioms.filter(x => x.os && x.p.length <= 26 && (x.m || '').length <= 90)
    .sort((a, b) => a.p.localeCompare(b.p)).slice(0, 240);
  const pages = [];
  pages.push(cover(vol, [[sims.length, 'similes'], [idioms.length, 'hall-of-fame idioms'], ['🎨', 'draw-it pages']]));
  pages.push(`<div class="pg">
    <div class="kicker">How this book works</div>
    <h1 style="font-size:24pt;margin:.06in 0 .16in">Talk like a storyteller.</h1>
    <div style="display:flex;gap:.16in;align-items:flex-start;margin-bottom:.2in">
      ${avatar(vol.av, '1in')}
      <div class="bubble">I'm <b>Popcorn</b>. A simile says one thing is LIKE another — and suddenly people listen. This book is every simile we know, plus the idioms with the best backstories. Steal freely; that's what they're for.</div>
    </div>
    ${[['Read it out loud', 'Similes are built for the ear. Say them and they stick.'],
       ['Read the backstory', 'The purple box under each one is the true origin — one-breath campfire facts.'],
       ['Use one today', 'Drop one at dinner. Watch what happens.'],
       ['Play the match pages', 'Cover the meanings, test yourself, then check the key at the back.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.16in;margin-bottom:.16in;align-items:flex-start"><span class="badge">${i + 1}</span>
      <div class="panel" style="flex:1;padding:.1in .15in"><h3 style="font-size:12.5pt;color:var(--c2)">${t}</h3><p style="font-size:10pt;line-height:1.5">${b}</p></div></div>`).join('')}
    ${foot(vol, 'The figurative collection')}</div>`);
  const keys = [];
  // similes, 6 per page; a match page every 6 pages; a draw-it page every 12
  let pageNo = 0;
  for (let i = 0; i < sims.length; i += 6) {
    const seg = sims.slice(i, i + 6); pageNo++;
    pages.push(`<div class="pg">
      <div class="kicker">The simile shelf · ${esc(seg[0].p[3] ? seg[0].p.replace(/^as /, '')[0].toUpperCase() : 'A')} and friends</div>
      <h2 style="font-size:15pt;margin:.04in 0 .14in">Say one thing is like another. Boom — a picture.</h2>
      <div class="simgrid">${seg.map(x => `<div class="sim"><div class="p">${esc(x.p)}</div>
        <div class="m">${esc(clamp(x.m, 100))}</div>${x.os ? `<div class="os">📜 ${esc(clamp(x.os, 150))}</div>` : ''}</div>`).join('')}</div>
      ${foot(vol, 'Similes ' + (i + 1) + '–' + (i + seg.length) + ' of ' + sims.length)}</div>`);
    if (pageNo % 6 === 0) {
      const pool = shuf(sims.slice(Math.max(0, i - 34), i + 6).slice(), rnd).slice(0, 10);
      const right = shuf(pool.map((x, k) => ({ k, m: x.m })), rnd);
      keys.push(`<div><b>Match p.${pages.length + 1}</b> — ${pool.map((x, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="pg">
        <div style="display:flex;align-items:center;gap:.12in;margin-bottom:.1in">${avatar(vol.av, '.62in')}
          <div><div class="kicker">Popcorn's match round</div><h2 style="font-size:15pt">Draw the line: simile → meaning</h2></div></div>
        <div class="match">
          <div><div class="mh">The similes</div>${pool.map((x, k) => `<div class="row"><b>${k + 1}.</b> ${esc(x.p)}</div>`).join('')}</div>
          <div><div class="mh">The meanings</div>${right.map((r, k) => `<div class="row"><b>${String.fromCharCode(65 + k)}.</b> ${esc(clamp(r.m, 70))}</div>`).join('')}</div></div>
        <p style="font-size:9pt;color:var(--muted);margin-top:.12in">Write your answers: ${pool.map((_, k) => (k + 1) + '—__').join('  ')}</p>
        ${foot(vol, 'No peeking — key at the back')}</div>`);
    }
    if (pageNo % 12 === 0) {
      const two = shuf(seg.slice(), rnd).slice(0, 2);
      pages.push(`<div class="pg">
        <div class="kicker">Draw it literally</div>
        <h2 style="font-size:15pt;margin:.04in 0 .16in">Similes are funny when you take them at their word. Prove it.</h2>
        ${two.map(x => `<div style="margin-bottom:.2in"><div style="font-family:'Baloo 2';font-size:13pt;color:var(--c2);margin-bottom:.06in">${esc(x.p)}</div><div class="drawbox">your masterpiece here</div></div>`).join('')}
        ${foot(vol, 'Art supplies not included')}</div>`);
    }
  }
  // idiom hall of fame, 10 per page in two columns
  for (let i = 0; i < idioms.length; i += 10) {
    const seg = idioms.slice(i, i + 10);
    pages.push(`<div class="pg">
      <div class="kicker">Idiom hall of fame</div>
      <h2 style="font-size:15pt;margin:.04in 0 .14in">Phrases that stopped meaning what they say.</h2>
      <div class="idcols">${seg.map(x => `<div class="idm"><b>${esc(x.p)}</b> — ${esc(clamp(x.m, 80))}<br><span style="color:var(--chipInk);font-size:8pt">📜 ${esc(clamp(x.os, 110))}</span></div>`).join('')}</div>
      ${foot(vol, 'Idioms ' + (i + 1) + '–' + (i + seg.length) + ' of ' + idioms.length)}</div>`);
  }
  // answer key
  for (let i = 0; i < keys.length; i += 16) {
    pages.push(`<div class="pg"><div class="kicker">No peeking until you've tried</div>
      <h2 style="font-size:16pt;margin:.04in 0 .14in">Answer key</h2>
      <div class="key">${keys.slice(i, i + 16).join('')}</div>${foot(vol, 'Answers')}</div>`);
  }
  pages.push(colophon(vol, 'Popcorn says: you now talk in pictures. Use it wisely.'));
  return { vol, pages };
}

/* ================= Book 17 — Say It Like a Champion ================= */
function book17() {
  const vol = { n: 17, title: 'Say It Like a Champion', tag: 'Two hundred and forty lines worth keeping — and what they mean for spellers', c: '#0EA5A0', c2: '#0B7E7A', tex: 'rings', av: 'melody', guide: 'Melody' };
  const rnd = mulberry(17 * 7919 + 17);
  const CHAPTERS = [
    ['perseverance', 'Keep Going', 'For the round after the round you almost lost.'],
    ['courage', 'Be Brave', 'For the walk to the microphone.'],
    ['hardwork', 'Do the Work', 'For the days the list looks too long.'],
    ['believe', 'Back Yourself', 'For the voice that says you can’t.'],
    ['dreams', 'Dream Big', 'For the trophy you can already see.'],
    ['curiosity', 'Stay Curious', 'For the words you’ve never met yet.'],
    ['learning', 'Love Learning', 'For every list that made you better.'],
    ['imagination', 'Imagine It', 'For seeing the word before you spell it.'],
    ['creativity', 'Make Things', 'For building your own way to remember.'],
    ['kindness', 'Be Kind', 'For the speller who just went out.'],
    ['friendship', 'Bring Friends', 'For the people cheering in row three.'],
    ['humor', 'Laugh a Little', 'For when the nerves need popping.'],
  ];
  const pages = []; const keys = [];
  pages.push(cover(vol, [[CHAPTERS.length, 'themes'], [240, 'quotes worth keeping'], ['✍️', 'your-turn pages']]));
  pages.push(`<div class="pg">
    <div class="kicker">How this book works</div>
    <h1 style="font-size:24pt;margin:.06in 0 .16in">Borrow a giant's voice.</h1>
    <div style="display:flex;gap:.16in;align-items:flex-start;margin-bottom:.2in">
      ${avatar(vol.av, '1in')}
      <div class="bubble">I'm <b>Melody</b>. Some sentences are so good they outlive the person who said them. Here are two hundred and forty of those — and under each one, what it means when YOU'RE the one at the microphone.</div>
    </div>
    ${[['Read one theme at a time', 'Twelve themes, twenty lines each. Courage before a bee. Humor after a hard one.'],
       ['Find your line', 'One of these will feel like it was written for you. Mark it. That’s your line now.'],
       ['Play who-said-it', 'The match pages test whether you were really listening.'],
       ['Write your own', 'Every theme ends with blank lines. Champions get quoted too, eventually.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.16in;margin-bottom:.16in;align-items:flex-start"><span class="badge">${i + 1}</span>
      <div class="panel" style="flex:1;padding:.1in .15in"><h3 style="font-size:12.5pt;color:var(--c2)">${t}</h3><p style="font-size:10pt;line-height:1.5">${b}</p></div></div>`).join('')}
    ${foot(vol, 'The quotable collection')}</div>`);
  let chNo = 0;
  for (const [cat, title, sub] of CHAPTERS) {
    chNo++;
    const pool = QUOTES.filter(q => q.c === cat && q.q.length <= 120 && q.q.length >= 25);
    const seen = new Set(); const picked = [];
    for (const q of pool.slice().sort((a, b) => a.q.length - b.q.length)) {
      if (seen.has(q.a)) continue; seen.add(q.a); picked.push(q); if (picked.length >= 20) break;
    }
    for (const q of pool) { if (picked.length >= 20) break; if (!picked.includes(q)) picked.push(q); }
    const hero = picked[0];
    pages.push(`<div class="pg" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--bg1),var(--tint))">
      <div class="kicker">Theme ${chNo} of ${CHAPTERS.length}</div>
      <h1 style="font-size:34pt;margin:.08in 0">${esc(title)}</h1>
      <p style="font-family:'Fredoka';font-size:11.5pt;color:var(--muted)">${esc(sub)}</p>
      <div style="margin:.3in auto 0;max-width:5.6in">${avatar(vol.av, '1.1in')}
        <div class="qt" style="text-align:left;margin-top:.14in"><div class="q">${esc(hero.q)}</div>
        <div class="a">— ${esc(hero.a)}${hero.who ? ', ' + esc(hero.who) : ''}</div></div></div>
      ${foot(vol, esc(title))}</div>`);
    const rest = picked.slice(1);
    for (let i = 0; i < rest.length; i += 5) {
      const seg = rest.slice(i, i + 5);
      pages.push(`<div class="pg">
        <div class="kicker">${esc(title)} · lines worth keeping</div>
        <div style="height:.08in"></div>
        ${seg.map(q => `<div class="qt"><div class="q">${esc(q.q)}</div>
          <div class="a">— ${esc(q.a)}${q.who ? ', ' + esc(q.who) : ''}</div>
          <div class="m">🐝 For spellers: ${esc(clamp(q.m, 150))}</div></div>`).join('')}
        ${foot(vol, esc(title) + ' · ' + (i + 2) + '–' + (i + 1 + seg.length) + ' of 20')}</div>`);
    }
    // your turn + who-said-it every 3rd chapter
    if (chNo % 3 === 0) {
      const mixPool = shuf(QUOTES.filter(q => CHAPTERS.slice(chNo - 3, chNo).some(c2 => c2[0] === q.c) && q.q.length <= 90).slice(), rnd).slice(0, 8);
      const right = shuf(mixPool.map((q, k) => ({ k, a: q.a })), rnd);
      keys.push(`<div><b>Who said it, p.${pages.length + 1}</b> — ${mixPool.map((q, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="pg">
        <div style="display:flex;align-items:center;gap:.12in;margin-bottom:.1in">${avatar(vol.av, '.62in')}
          <div><div class="kicker">Melody's match round</div><h2 style="font-size:15pt">Who said it?</h2></div></div>
        <div class="match">
          <div><div class="mh">The lines</div>${mixPool.map((q, k) => `<div class="row"><b>${k + 1}.</b> “${esc(clamp(q.q, 72))}”</div>`).join('')}</div>
          <div><div class="mh">The voices</div>${right.map((r, k) => `<div class="row"><b>${String.fromCharCode(65 + k)}.</b> ${esc(r.a)}</div>`).join('')}</div></div>
        <div class="kicker" style="margin-top:.18in">Your turn</div>
        <p style="font-size:9.5pt;color:var(--muted);margin:.04in 0 .1in">Write a line of your own about ${esc(title.toLowerCase())}. Sign it. Date it. Future-you will want proof.</p>
        <div class="lines"><div></div><div></div><div></div></div>
        ${foot(vol, 'No peeking — key at the back')}</div>`);
    }
  }
  for (let i = 0; i < keys.length; i += 16) {
    pages.push(`<div class="pg"><div class="kicker">No peeking until you've tried</div>
      <h2 style="font-size:16pt;margin:.04in 0 .14in">Answer key</h2>
      <div class="key">${keys.slice(i, i + 16).join('')}</div>${foot(vol, 'Answers')}</div>`);
  }
  pages.push(colophon(vol, 'Melody says: now go be quotable.'));
  return { vol, pages };
}

/* ================= write books + regenerate hub for all 17 ================= */
for (const build of [book16, book17]) {
  const { vol, pages } = build();
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(vol.title)} — Bizzing Bee Collections Vol. ${vol.n}</title>
<style>${css(vol)}</style></head><body>${pages.join('\n')}</body></html>`;
  fs.writeFileSync(`books/book-${vol.n}.html`, html);
  console.log(`Vol.${vol.n} ${vol.title} — ${pages.length} pages`);
}

const META = [
  [1, 'Lift-Off!', 'Bee basics from first buzz to first trophy', '#F0B429', '#C8791B', 'honeypot'],
  [2, 'The Rulebook', 'Spelling rules that actually hold up', '#13A892', '#0E8A78', 'waggle'],
  [3, 'Latin Launchers', 'Fifteen prefix families that unlock thousands of words', '#7C5CFF', '#4F2FC8', 'bumble'],
  [4, 'Greek Lightning', 'Greek and number prefixes, endings included', '#3D7DF0', '#2A63D6', 'star'],
  [5, 'Endings That Win', 'Suffixes, strategy and championship-level closers', '#E8458C', '#CC2E72', 'diva'],
  [6, 'Root Camp: Latin', 'Eleven Latin root families, drilled', '#C4453C', '#B8322A', 'drone'],
  [7, 'Root Camp: Greek', 'Ten Greek root families, drilled', '#0E8A78', '#075E51', 'clover'],
  [8, 'The World Tour', 'French, Italian, Celtic and the words that immigrated', '#E0922E', '#B26E12', 'nectar'],
  [9, 'Subject Sprints', 'Science, music, law, food — the vocabulary of everything', '#5B3DD6', '#3A22A0', 'lumen'],
  [10, 'Word Personalities', 'Every word has a character. Meet them.', '#B14FC4', '#7E2F92', 'jester'],
  [11, 'The Playbook', 'Bee-day procedure and the first deep-orthography drills', '#4A6B8A', '#37506E', 'queenhive'],
  [12, 'Schwa Country', 'The vanishing vowel and its many disguises', '#5B3FA6', '#3A2A72', 'blossom'],
  [13, 'Letters Behaving Badly', 'Doubles, silents and sounds that lie', '#B8322A', '#8F2B24', 'propolis'],
  [14, 'Far-Flung Words', 'Origins beyond the big four', '#2E8FB8', '#1E6A8C', 'mic'],
  [15, 'The Word Factory', 'How English builds, borrows and bolts words together, piece by piece', '#4F9E6A', '#3C8455', 'maestro'],
  [16, 'As Busy as a Bee', 'Every simile we know, and the idiom hall of fame', '#F0703C', '#D85A29', 'popcorn'],
  [17, 'Say It Like a Champion', '240 lines worth keeping — and what they mean for spellers', '#0EA5A0', '#0B7E7A', 'melody'],
];
const cards = META.map(([n, title, tag, c, c2, av]) => {
  const id = String(n).padStart(2, '0');
  const pgs = (fs.readFileSync(`books/book-${id}.html`, 'utf8').match(/<div class="pg/g) || []).length;
  return `<div class="bk" style="background:linear-gradient(160deg,${c},${c2})">
  <svg viewBox="0 0 120 120">${AV[av] || ''}</svg>
  <b>Vol. ${n} — ${esc(title)}</b><span>${esc(tag)}</span><span>${pgs} pages</span>
  <div class="links"><a href="book-${id}.html">Read</a><a href="pdf/book-${id}.pdf">PDF</a></div></div>`;
}).join('');
const hub = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bizzing Bee Library — 17 graphic study books</title><style>
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
<p class="lead">Seventeen graphic study books — ten across the full 122-chapter course, five bigger Advanced volumes,
and two collections: the similes & idioms treasury and the quotable-quotes book.</p>
<div class="canva"><b>Getting a book into Canva:</b> download the PDF, then in Canva choose <b>Create a design → Import file</b>
(or drag the PDF onto Canva's home page). Every page becomes an editable design. The HTML is the print master.</div>
<div class="grid">${cards}</div>
<p style="font-size:12px;color:#8b83a3;margin-top:26px">Bizzing Bee · independent study material · not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</p>
</main></body></html>`;
fs.writeFileSync('books/index.html', hub);
console.log('hub regenerated for 17 books');
