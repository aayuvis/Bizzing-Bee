/* Build 15 graphic study books (US-Letter pages, print-true HTML) from the concept
   course + Advanced Pack: 10 volumes over the general 122 chapters, 5 larger advanced
   volumes over the 43 expert chapters. Each book: cover, how-to page, per-chapter
   concept spread + practice pages, an alphabetical Big List, and a colophon carrying
   the non-affiliation note. Output: spellbound-app/books/*.html + books/index.html.
   PDFs are rendered separately with Playwright and imported into Canva (PDF import). */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('concepts-data.js', 'utf8'));
eval(fs.readFileSync('adv-concepts-data.js', 'utf8'));
const GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* ---------------- volume plan ---------------- */
const VOLS = [
  { n: 1,  title: 'Lift-Off!', tag: 'Bee basics from first buzz to first trophy', c: '#F59E0B', c2: '#B45309',
    pick: ch => ch.category === 'Spelling Bee Basics' },
  { n: 2,  title: 'The Rulebook', tag: 'Spelling rules that actually hold up', c: '#13A892', c2: '#0B6E5F',
    pick: ch => /Spelling Rules|Word Formation/.test(ch.category) },
  { n: 3,  title: 'Latin Launchers', tag: 'Fifteen prefix families that unlock thousands of words', c: '#7C5CFF', c2: '#4F2FC8',
    pick: ch => ch.category === 'Latin Prefixes' },
  { n: 4,  title: 'Greek Lightning', tag: 'Greek and number prefixes, endings included', c: '#3D7DF0', c2: '#1E4FB8',
    pick: ch => /Greek Prefixes|Number Prefixes|Greek Suffixes|Greek Medical/.test(ch.category) },
  { n: 5,  title: 'Endings That Win', tag: 'Suffixes, strategy and championship-level closers', c: '#E8458C', c2: '#B01F60',
    pick: ch => /Latin Suffixes|Latin & Old English Suffixes|Agent Suffixes|Advanced Vocabulary|Advanced Spelling Strategy|Championship Level/.test(ch.category) },
  { n: 6,  title: 'Root Camp: Latin', tag: 'Eleven Latin root families, drilled', c: '#C4453C', c2: '#8F2B24',
    pick: ch => ch.category === 'Latin Root Families' },
  { n: 7,  title: 'Root Camp: Greek', tag: 'Ten Greek root families, drilled', c: '#0E8A78', c2: '#075E51',
    pick: ch => ch.category === 'Greek Root Families' },
  { n: 8,  title: 'The World Tour', tag: 'French, Italian, Celtic and the words that immigrated', c: '#E0922E', c2: '#A8641A',
    pick: ch => /French Loanword|Italian Loanword|Loanword Language Groups/.test(ch.category) },
  { n: 9,  title: 'Subject Sprints', tag: 'Science, music, law, food — the vocabulary of everything', c: '#5B3DD6', c2: '#3A22A0',
    pick: ch => ch.category === 'Subject-Area Vocabulary' },
  { n: 10, title: 'Word Personalities', tag: 'Every word has a character. Meet them.', c: '#B14FC4', c2: '#7E2F92',
    pick: ch => ch.category === 'Personality Themes' },
];
const orth = ADV.filter(ch => ch.category === 'Advanced Orthography');
const AVOLS = [
  { n: 11, title: 'The Playbook', tag: 'Bee-day procedure and the first deep-orthography drills', c: '#1F2A44', c2: '#0E1526',
    chapters: ADV.filter(ch => ch.category === 'Championship Procedure').concat(orth.slice(0, 5)) },
  { n: 12, title: 'Schwa Country', tag: 'The vanishing vowel and its many disguises', c: '#5B3FA6', c2: '#37246B',
    chapters: orth.slice(5, 12) },
  { n: 13, title: 'Letters Behaving Badly', tag: 'Doubles, silents and sounds that lie', c: '#B8322A', c2: '#7E1E18',
    chapters: orth.slice(12) },
  { n: 14, title: 'Far-Flung Words', tag: 'Origins beyond the big four', c: '#0B6E8F', c2: '#064457',
    chapters: ADV.filter(ch => ch.category === 'Origins Beyond the Big Four') },
  { n: 15, title: 'The Word Factory', tag: 'How English builds, borrows and bolts words together', c: '#3C8455', c2: '#245236',
    chapters: ADV.filter(ch => ch.category === 'How Words Are Built') },
];

/* ---------------- shared page chrome ---------------- */
const BEE = `<svg viewBox="0 0 120 100" class="bee" aria-hidden="true">
  <ellipse cx="44" cy="34" rx="17" ry="26" fill="#DCEFFF" opacity=".85" transform="rotate(-28 44 34)"/>
  <ellipse cx="76" cy="34" rx="17" ry="26" fill="#EAF5FF" opacity=".85" transform="rotate(28 76 34)"/>
  <ellipse cx="60" cy="60" rx="34" ry="27" fill="#FFC93C"/>
  <path d="M44 37 a34 27 0 0 0 -6 14 l14 0 a1 1 0 0 1 0 -14 z M64 34 l0 53 a34 27 0 0 0 14 -5 l0 -43 a34 27 0 0 0 -14 -5 z" fill="#241E33"/>
  <circle cx="49" cy="56" r="3.6" fill="#241E33"/>
  <path d="M45 68 q8 7 16 1" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M52 34 q-4 -12 -12 -14 M68 34 q4 -12 12 -14" stroke="#241E33" stroke-width="3" fill="none" stroke-linecap="round"/>
  <circle cx="40" cy="19" r="4" fill="#241E33"/><circle cx="80" cy="19" r="4" fill="#241E33"/>
</svg>`;
const HEX = (c) => `<svg class="hexes" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
  <defs><pattern id="hx" width="56" height="97" patternUnits="userSpaceOnUse">
    <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L56 80 L56 97 M28 64 L0 80 L0 97" fill="none" stroke="${c}" stroke-width="2"/>
  </pattern></defs><rect width="400" height="400" fill="url(#hx)"/></svg>`;

function css(vol) {
  return `
  @font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
  @font-face{font-family:'Fredoka';src:url('../fonts/fredoka-600.woff2') format('woff2');font-weight:600}
  @font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--ink:#241E33;--paper:#FFFDF6;--c:${vol.c};--c2:${vol.c2};--tint:color-mix(in srgb,${vol.c} 12%,white)}
  html{background:#e9e4f5}
  body{font-family:'Hanken Grotesk',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{size:8.5in 11in;margin:0}
  .pg{width:8.5in;height:11in;background:var(--paper);position:relative;overflow:hidden;padding:.62in .66in;page-break-after:always;break-after:page}
  @media screen{.pg{margin:24px auto;box-shadow:0 10px 40px rgba(30,20,60,.18)}}
  .bee{width:1.1in;height:auto}
  .hexes{position:absolute;inset:0;width:100%;height:100%;opacity:.5}
  h1,h2,h3,.disp{font-family:'Baloo 2';font-weight:800}
  .kicker{font-family:'Fredoka';font-weight:600;font-size:10.5pt;letter-spacing:.14em;text-transform:uppercase;color:var(--c2)}
  .foot{position:absolute;bottom:.35in;left:.66in;right:.66in;display:flex;justify-content:space-between;font-size:8.5pt;color:#8b83a3;font-weight:600}
  .badge{display:inline-grid;place-items:center;width:.62in;height:.62in;border-radius:16px;background:var(--c);color:#fff;font-family:'Baloo 2';font-size:17pt}
  .concept{background:var(--tint);border-left:6px solid var(--c);border-radius:12px;padding:.14in .18in;font-size:10.6pt;line-height:1.5;margin:.12in 0}
  .method{background:#241E33;color:#FFF7E0;border-radius:14px;padding:.15in .19in;font-size:9.7pt;line-height:1.52;margin:.1in 0}
  .method b{color:#FFC93C}
  .method div{margin:3px 0}
  .method .trick,.method [class]{font-family:'Baloo 2';font-size:12pt;letter-spacing:.05em}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:.11in;margin-top:.12in}
  .card{background:#fff;border:2px solid var(--c);border-radius:12px;padding:.1in .12in;box-shadow:3px 3px 0 var(--c)}
  .card:nth-child(even){transform:rotate(.5deg)} .card:nth-child(odd){transform:rotate(-.5deg)}
  .card h3{font-size:10pt;color:var(--c2);margin-bottom:3px}
  .card p{font-size:8.7pt;line-height:1.4}
  .wgrid{display:grid;grid-template-columns:1fr 1fr;gap:.14in}
  .wd{border:1.5px solid #E4DDF2;border-radius:12px;padding:.12in .14in;background:#fff}
  .wd .w{font-family:'Baloo 2';font-size:14.5pt;color:var(--c2)}
  .wd .say{font-family:'Fredoka';font-size:9pt;color:#8b83a3;margin-left:6px}
  .wd .d{font-size:9pt;line-height:1.4;margin-top:2px}
  .wd .h{font-size:8.6pt;line-height:1.35;margin-top:4px;color:#5a4d84;background:var(--tint);border-radius:7px;padding:4px 7px}
  .wd .line{border-bottom:2px dashed #C9BFE6;height:.24in;margin-top:6px}
  .rr{columns:2;column-gap:.3in;font-size:9.2pt;line-height:1.45}
  .dense .concept{font-size:9.6pt;line-height:1.42}
  .dense .method{font-size:8.9pt;line-height:1.45}
  .dense .card p{font-size:8pt;line-height:1.34} .dense .card h3{font-size:9.2pt}
  .rr div{break-inside:avoid;padding:3px 0;border-bottom:1px dotted #DDD4F2}
  .rr b{font-family:'Fredoka';color:var(--c2)}
  .biglist{columns:4;column-gap:.22in;font-size:8.7pt;line-height:1.62}
  .biglist div{break-inside:avoid}
  .biglist span{display:inline-block;width:.14in;height:.14in;border:1.6px solid var(--c);border-radius:50%;margin-right:5px;vertical-align:-2px}
  `;
}
const foot = (vol, txt) => `<div class="foot"><span>${esc(vol.title)} · Bizzing Bee Press</span><span>${txt}</span></div>`;

function cover(vol, nCh, nWords, adv) {
  return `<div class="pg" style="background:linear-gradient(160deg,var(--c),var(--c2));color:#fff;display:flex;flex-direction:column;justify-content:space-between">
    ${HEX('rgba(255,255,255,.14)')}
    <div style="position:relative;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'Fredoka';font-weight:600;letter-spacing:.16em;font-size:11pt">BIZZING BEE ${adv ? 'ADVANCED ' : ''}LIBRARY</span>
      <span class="disp" style="background:#241E33;padding:.08in .22in;border-radius:999px;font-size:13pt">Vol. ${vol.n}</span>
    </div>
    <div style="position:relative;text-align:center">
      ${BEE}
      <h1 style="font-size:46pt;line-height:1.02;margin:.2in 0 .12in;text-shadow:0 3px 0 rgba(0,0,0,.18)">${esc(vol.title)}</h1>
      <p style="font-family:'Fredoka';font-size:14pt;max-width:5.6in;margin:0 auto">${esc(vol.tag)}</p>
    </div>
    <div style="position:relative;display:flex;gap:.16in;justify-content:center">
      ${[[nCh, adv ? 'expert chapters' : 'chapters'], [nWords, 'practice words'], ['✏️', 'write-in pages']].map(([a, b]) =>
        `<div style="background:rgba(0,0,0,.22);border-radius:14px;padding:.14in .3in;text-align:center"><div class="disp" style="font-size:19pt">${a}</div><div style="font-family:'Fredoka';font-size:9.5pt">${b}</div></div>`).join('')}
    </div></div>`;
}
function howTo(vol, adv) {
  const steps = [
    ['Read the Big Idea', 'Every chapter starts with one idea that explains a whole family of words. Read it out loud. Twice is better.'],
    ['Steal the pro move', 'The dark box is how a champion actually thinks on stage. It works on words you have never seen.'],
    ['Flip the sticky notes', 'The note cards are the chapter in tiny pieces. Cover one, say it from memory, check yourself.'],
    ['Spell in the boxes', 'Every practice word has a write-in line. Say it, spell it OUT LOUD, then write it. Hand and mouth together beat eyes alone.'],
    ['Hunt the Big List', 'The back of the book has every word in one place. Circle the bubbles you own. Come back for the empty ones.'],
  ];
  return `<div class="pg">
    <div class="kicker">How this book works</div>
    <h1 style="font-size:26pt;margin:.08in 0 .2in">Five moves, no fluff.</h1>
    ${steps.map(([t, b], i) => `<div style="display:flex;gap:.18in;margin-bottom:.22in;align-items:flex-start">
      <span class="badge">${i + 1}</span>
      <div><h3 style="font-size:13.5pt;color:var(--c2)">${t}</h3><p style="font-size:11pt;line-height:1.55;max-width:5.6in">${b}</p></div></div>`).join('')}
    <div class="concept" style="margin-top:.25in"><b>Grown-ups:</b> this book pairs with the Bizzing Bee app — the same chapters are narrated there, and every word here has real recorded audio in the app's Word Coach.</div>
    ${foot(vol, adv ? 'Advanced Pack material' : 'Part of the 122-chapter course')}</div>`;
}
function chapterPages(vol, ch, ci, adv) {
  const cards = (ch.cards || []).slice(0, 6);
  const words = (ch.words || []).filter(w => w && w.w);
  const tl = String(ch.concept || '').length + String(ch.method || '').length +
    cards.reduce((a, cd) => a + String(cd.title).length + String(cd.body).length, 0);
  const out = [];
  out.push(`<div class="pg${tl > 1500 ? ' dense' : ''}">
    <div style="display:flex;align-items:center;gap:.16in">
      <span class="badge">${ci + 1}</span>
      <div><div class="kicker">${esc(ch.category)}</div>
      <h2 style="font-size:20pt;line-height:1.08">${esc(ch.title)}</h2></div></div>
    <div class="kicker" style="margin-top:.2in">The big idea</div>
    <div class="concept">${esc(ch.concept)}</div>
    ${ch.method ? `<div class="kicker" style="margin-top:.1in">The pro move</div><div class="method">${String(ch.method)}</div>` : ''}
    ${cards.length ? `<div class="cards">${cards.map(cd => `<div class="card"><h3>${esc(cd.title)}</h3><p>${esc(cd.body)}</p></div>`).join('')}</div>` : ''}
    ${foot(vol, 'Chapter ' + (ci + 1))}</div>`);
  // practice: full write-in cards — advanced books get twice the bench
  const FULLN = adv ? 16 : 8;
  const fullAll = words.slice(0, FULLN);
  for (let f = 0; f < fullAll.length; f += 8) {
    const full = fullAll.slice(f, f + 8);
    out.push(`<div class="pg">
    <div class="kicker">Practice hive · ${esc(ch.title)}${fullAll.length > 10 ? ' · ' + (f / 8 + 1) : ''}</div>
    <h2 style="font-size:16.5pt;margin:.04in 0 .16in">Say it. Spell it out loud. Then write it.</h2>
    <div class="wgrid">${full.map(w => { const dd = String(w.def || ''); const hh = String(w.hook || '');
      return `<div class="wd"><span class="w">${esc(w.w)}</span>${w.say ? `<span class="say">/ ${esc(w.say)} /</span>` : ''}
      <div class="d">${esc(dd.length > 95 ? dd.slice(0, 93) + '…' : dd)}</div>${hh ? `<div class="h">💡 ${esc(hh.length > 115 ? hh.slice(0, 113) + '…' : hh)}</div>` : ''}<div class="line"></div></div>`; }).join('')}</div>
    ${foot(vol, 'Chapter ' + (ci + 1) + ' practice')}</div>`);
  }
  // rapid round for whatever remains (Celtic's 100, anything past the write-in bench)
  const rest = words.slice(FULLN);
  for (let i = 0; i < rest.length; i += 20) {
    const seg = rest.slice(i, i + 20);
    out.push(`<div class="pg">
      <div class="kicker">Rapid round · ${esc(ch.title)}</div>
      <h2 style="font-size:16.5pt;margin:.04in 0 .16in">More ammo — one line each.</h2>
      <div class="rr">${seg.map(w => `<div><b>${esc(w.w)}</b>${w.say ? ` <span style="color:#8b83a3;font-size:8.4pt">/ ${esc(w.say)} /</span>` : ''}<br>${esc((w.def || '').slice(0, 70))}</div>`).join('')}</div>
      ${foot(vol, 'Chapter ' + (ci + 1) + ' extras')}</div>`);
  }
  return out;
}
function bigList(vol, allWords) {
  const uniq = [...new Map(allWords.map(w => [w.w.toLowerCase(), w])).values()]
    .sort((a, b) => a.w.localeCompare(b.w));
  const out = []; const PER = 100;
  for (let i = 0; i < uniq.length; i += PER) {
    const seg = uniq.slice(i, i + PER);
    out.push(`<div class="pg">
      <div class="kicker">The big list ${uniq.length > PER ? (Math.floor(i / PER) + 1) + ' of ' + Math.ceil(uniq.length / PER) : ''}</div>
      <h2 style="font-size:16.5pt;margin:.04in 0 .18in">Every word in this book. Circle what you own.</h2>
      <div class="biglist">${seg.map(w => `<div><span></span>${esc(w.w)}</div>`).join('')}</div>
      ${foot(vol, uniq.length + ' words')}</div>`);
  }
  return out;
}
function colophon(vol) {
  return `<div class="pg" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--paper),var(--tint))">
    ${BEE}
    <h2 style="font-size:18pt;margin:.14in 0">You finished a whole book. Bees everywhere are impressed.</h2>
    <p style="font-size:11pt;max-width:5.4in;margin:0 auto .3in;line-height:1.6">Every word in here is also inside the Bizzing Bee app, with real audio, games and a coach that remembers what you miss. Paper for the muscles, app for the ears.</p>
    <p style="font-size:8.6pt;color:#8b83a3;max-width:5.8in;margin:0 auto;line-height:1.6">Bizzing Bee Press · an independent study project. Bizzing Bee is not affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Competition names appear only to describe which bees the practice material relates to. Definitions, sentences and hints are written for this project. Typefaces are open-licensed (SIL OFL).</p></div>`;
}

function buildBook(vol, chapters, adv) {
  const allWords = chapters.flatMap(ch => (ch.words || []).filter(w => w && w.w));
  let pages = [cover(vol, chapters.length, allWords.length, adv), howTo(vol, adv)];
  chapters.forEach((ch, i) => { pages = pages.concat(chapterPages(vol, ch, i, adv)); });
  pages = pages.concat(bigList(vol, allWords));
  pages.push(colophon(vol));
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(vol.title)} — Bizzing Bee ${adv ? 'Advanced ' : ''}Library Vol. ${vol.n}</title>
<style>${css(vol)}</style></head><body>${pages.join('\n')}</body></html>`;
  const file = `books/book-${String(vol.n).padStart(2, '0')}.html`;
  fs.writeFileSync(file, html);
  return { file, pages: pages.length, words: allWords.length, chapters: chapters.length };
}

fs.mkdirSync('books', { recursive: true });
const made = [];
const used = new Set();
for (const vol of VOLS) {
  const chs = GEN.filter(ch => vol.pick(ch));
  chs.forEach(ch => used.add(ch.title));
  made.push({ vol, ...buildBook(vol, chs, false) });
}
const leftover = GEN.filter(ch => !used.has(ch.title));
if (leftover.length) { console.error('UNASSIGNED CHAPTERS:', leftover.map(c => c.category + ' / ' + c.title)); process.exit(1); }
const advUsed = new Set();
for (const vol of AVOLS) { vol.chapters.forEach(ch => advUsed.add(ch.title)); made.push({ vol, ...buildBook(vol, vol.chapters, true) }); }
if (advUsed.size !== ADV.length) { console.error('ADV coverage', advUsed.size, 'of', ADV.length); process.exit(1); }

/* hub page */
const hub = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bizzing Bee Library — 15 graphic study books</title><style>
@font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
@font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Hanken Grotesk',sans-serif;background:#f3efff;color:#241E33;padding:34px 20px 60px}
main{max-width:1000px;margin:0 auto}h1{font-family:'Baloo 2';font-size:34px}p.lead{color:#6b6482;margin:8px 0 26px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px}
.bk{border-radius:14px;padding:18px 15px;color:#fff;display:flex;flex-direction:column;gap:6px;min-height:170px;text-decoration:none}
.bk b{font-family:'Baloo 2';font-size:17px;line-height:1.15}.bk span{font-size:12px;opacity:.9}.bk .links{margin-top:auto;display:flex;gap:8px}
.bk .links a{background:rgba(0,0,0,.25);color:#fff;text-decoration:none;font-weight:700;font-size:12px;padding:5px 10px;border-radius:999px}
.canva{background:#fff;border:1px solid #ddd4f2;border-radius:14px;padding:18px 20px;margin:28px 0;line-height:1.6;font-size:14.5px}
.canva b{font-family:'Baloo 2'}</style></head><body><main>
<h1>The Bizzing Bee Library</h1>
<p class="lead">Fifteen graphic study books — ten across the full 122-chapter course, five bigger volumes for the Advanced Pack. Letter-size pages, print-ready.</p>
<div class="canva"><b>Getting a book into Canva:</b> download the PDF (button on each book), then in Canva choose
<b>Create a design → Import file</b> (or drag the PDF onto the Canva home page). Canva converts every page into an
editable design — text stays editable in most blocks. The HTML version is the print master; export it to PDF from
the browser with margins set to None and background graphics on, or use the pre-rendered PDF next to it.</div>
<div class="grid">
${made.map(m => `<div class="bk" style="background:linear-gradient(160deg,${m.vol.c},${m.vol.c2})">
  <b>Vol. ${m.vol.n} — ${esc(m.vol.title)}</b><span>${esc(m.vol.tag)}</span>
  <span>${m.chapters} chapters · ${m.words} words · ${m.pages} pages</span>
  <div class="links"><a href="book-${String(m.vol.n).padStart(2, '0')}.html">Read</a><a href="pdf/book-${String(m.vol.n).padStart(2, '0')}.pdf">PDF</a></div></div>`).join('')}
</div>
<p style="font-size:12px;color:#8b83a3;margin-top:26px">Bizzing Bee Press · independent study material · not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</p>
</main></body></html>`;
fs.writeFileSync('books/index.html', hub);
made.forEach(m => console.log(`Vol.${String(m.vol.n).padStart(2)} ${m.vol.title.padEnd(24)} ${String(m.chapters).padStart(3)} ch  ${String(m.words).padStart(5)} words  ${String(m.pages).padStart(3)} pages`));
console.log('total pages:', made.reduce((a, m) => a + m.pages, 0));
