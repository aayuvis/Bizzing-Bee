/* Bizzing Bee Library v3 — built to the Claude Design system handover
   (templates/book-library/HANDOFF-CLAUDE-CODE.md): app tokens + print roles, the
   8-size type scale with Sono tiles, .page geometry with verso gutter mirroring,
   .bb-* class contracts with content budgets, comic chapter openers storyboarded
   from the six-scene scripts (oops = Vex panel), the seven furniture boxes, seeded
   puzzles, per-volume Bee Break cursors, running head/foot with folios, and the
   banned-word copy lint. Outputs books/book-01..17.html + books/index.html. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('concepts-data.js', 'utf8'));
eval(fs.readFileSync('adv-concepts-data.js', 'utf8'));
eval(fs.readFileSync('concept-scripts.js', 'utf8'));
eval(fs.readFileSync('avatars-art.js', 'utf8'));
eval(fs.readFileSync('quotes-lib.js', 'utf8'));
eval(fs.readFileSync('figurative-data.js', 'utf8'));
eval(fs.readFileSync('sounds-data.js', 'utf8'));
let ADVS = {};
try { const src = fs.readFileSync('adv-concepts-data.js', 'utf8'); ADVS = window.SB_ADV_CSCRIPT || {}; } catch (e) {}
const GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
const CS = window.SB_CSCRIPT || {}, AV = window.SB_AVATAR_ART;
const QUOTES = window.SB_QUOTES, FIG = window.SB_FIG, IPA = window.SB_IPA || {};
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clamp = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
const wordsClamp = (s, n) => { const w = String(s || '').replace(/\s+/g, ' ').trim().split(' '); return w.length <= n ? w.join(' ') : w.slice(0, n).join(' ') + '…'; };
const mulberry = seed => () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const shuf = (a, rnd) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const maskDef = (d, w) => String(d || '').replace(new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig'), '▁▁▁');

/* IPA: exact where known, else derived from the friendly respelling (mirrors app3) */
const P2IPA = [['eye', 'aɪ'], ['yoo', 'ju'], ['air', 'ɛr'], ['ay', 'eɪ'], ['aw', 'ɔ'], ['ow', 'aʊ'], ['oy', 'ɔɪ'], ['oh', 'oʊ'], ['ah', 'ɑ'], ['eh', 'ɛ'], ['ih', 'ɪ'], ['uh', 'ə'], ['ee', 'i'], ['oo', 'u'], ['uu', 'ʊ'], ['er', 'ər'], ['ar', 'ɑr'], ['or', 'ɔr'], ['ch', 'tʃ'], ['sh', 'ʃ'], ['zh', 'ʒ'], ['th', 'θ'], ['ng', 'ŋ'], ['wh', 'w'], ['a', 'æ'], ['e', 'ɛ'], ['i', 'ɪ'], ['o', 'ɑ'], ['u', 'ʌ'], ['j', 'dʒ'], ['y', 'j'], ['c', 'k'], ['q', 'k'], ['x', 'ks'], ['g', 'ɡ']];
function pToIPA(p) { if (!p) return ''; let n = 0;
  const chunks = String(p).trim().split(/[-·\s]+/).map(ch => ({ raw: ch, low: ch.toLowerCase().replace(/[^a-z']/g, '') }));
  return chunks.map((ch, ci) => { const stressed = /[A-Z]/.test(ch.raw); const low = ch.low;
    const nextFirst = (chunks[ci + 1] && chunks[ci + 1].low[0]) || ''; let i = 0, s = '';
    while (i < low.length) { let hit = null;
      for (const t of P2IPA) { if (low.startsWith(t[0], i)) { hit = t; break; } }
      if (hit && hit[0] === 'y') { const after = low[i + 1] || nextFirst; if (!/[aeiou]/.test(after)) hit = ['y', 'aɪ']; }
      if (hit) { s += (hit[0] === 'uh' && stressed) ? 'ʌ' : hit[1]; i += hit[0].length; }
      else { const c2 = low[i]; s += (c2 === "'" ? '' : c2); i++; } }
    return (stressed ? (n++ ? 'ˌ' : 'ˈ') : '') + s; }).join(''); }
const ipaOf = (w, say) => { const k = String(w || '').toLowerCase(); return Object.prototype.hasOwnProperty.call(IPA, k) ? IPA[k] : pToIPA(say); };

/* ---------------- volume plan (handover §1 accents) ---------------- */
const VOLS = [
  { n: 1,  title: 'Lift-Off!', tag: 'Bee basics from first buzz to first trophy', a: '#FFC23D', d: '#C8791B', tex: 'rings', av: 'honeypot', world: 'meadow', band: 'general', pick: ch => ch.category === 'Spelling Bee Basics' },
  { n: 2,  title: 'The Rulebook', tag: 'Spelling rules that hold up on stage', a: '#6C4FE0', d: '#4A3AA0', tex: 'grid', av: 'waggle', world: 'library', band: 'general', pick: ch => /Spelling Rules|Word Formation/.test(ch.category) },
  { n: 3,  title: 'Latin Launchers', tag: 'Fifteen prefix families, thousands of words', a: '#E06A3C', d: '#A8431F', tex: 'stripes', av: 'bumble', world: 'forum', band: 'general', pick: ch => ch.category === 'Latin Prefixes' },
  { n: 4,  title: 'Greek Lightning', tag: 'Greek and number prefixes, endings included', a: '#2E8FB8', d: '#1C6486', tex: 'cross', av: 'star', world: 'elements', band: 'general', pick: ch => /Greek Prefixes|Number Prefixes|Greek Suffixes|Greek Medical/.test(ch.category) },
  { n: 5,  title: 'Endings That Win', tag: 'Suffixes, strategy and championship closers', a: '#E8458C', d: '#A82563', tex: 'dots', av: 'diva', world: 'stage', band: 'general', pick: ch => /Latin Suffixes|Latin & Old English Suffixes|Agent Suffixes|Advanced Vocabulary|Advanced Spelling Strategy|Championship Level/.test(ch.category) },
  { n: 6,  title: 'Root Camp: Latin', tag: 'Eleven Latin root families, drilled', a: '#C08A3E', d: '#8A5B00', tex: 'diag', av: 'drone', world: 'engine', band: 'general', pick: ch => ch.category === 'Latin Root Families' },
  { n: 7,  title: 'Root Camp: Greek', tag: 'Ten Greek root families, drilled', a: '#13A892', d: '#0A6B5D', tex: 'rings', av: 'clover', world: 'origami', band: 'general', pick: ch => ch.category === 'Greek Root Families' },
  { n: 8,  title: 'The World Tour', tag: 'French, Italian, Celtic — words that immigrated', a: '#3E63D6', d: '#26409A', tex: 'stripes', av: 'nectar', world: 'strait', band: 'general', pick: ch => /French Loanword|Italian Loanword|Loanword Language Groups/.test(ch.category) },
  { n: 9,  title: 'Subject Sprints', tag: 'Science, music, law, food — words of everything', a: '#F0A93C', d: '#B4711A', tex: 'grid', av: 'lumen', world: 'junkyard', band: 'general', pick: ch => ch.category === 'Subject-Area Vocabulary' },
  { n: 10, title: 'Word Personalities', tag: 'Every word has a character. Meet them.', a: '#B14FC4', d: '#7A2F8C', tex: 'dots', av: 'jester', world: 'vibe', band: 'general', pick: ch => ch.category === 'Personality Themes' },
];
const orth = ADV.filter(ch => ch.category === 'Advanced Orthography');
const AVOLS = [
  { n: 11, title: 'The Playbook', tag: 'Bee-day procedure and deep orthography', a: '#D6353F', d: '#8E1D26', tex: 'grid', av: 'queenhive', world: 'warfield', band: 'advanced', chapters: ADV.filter(ch => ch.category === 'Championship Procedure').concat(orth.slice(0, 5)) },
  { n: 12, title: 'Schwa Country', tag: 'The vanishing vowel and its disguises', a: '#7E8AA0', d: '#4C566B', tex: 'rings', av: 'blossom', world: 'greysea', band: 'advanced', chapters: orth.slice(5, 12) },
  { n: 13, title: 'Letters Behaving Badly', tag: 'Doubles, silents and sounds that lie', a: '#B8562F', d: '#7A3418', tex: 'diag', av: 'propolis', world: 'junkyard', band: 'advanced', chapters: orth.slice(12) },
  { n: 14, title: 'Far-Flung Words', tag: 'Origins beyond the big four', a: '#0E8A78', d: '#075C50', tex: 'cross', av: 'mic', world: 'strait', band: 'advanced', chapters: ADV.filter(ch => ch.category === 'Origins Beyond the Big Four') },
  { n: 15, title: 'The Word Factory', tag: 'How English bolts words together', a: '#5B6BA8', d: '#364475', tex: 'stripes', av: 'maestro', world: 'engine', band: 'advanced', chapters: ADV.filter(ch => ch.category === 'How Words Are Built') },
];
const NAMES = { honeypot: 'Honeypot', waggle: 'Waggle', bumble: 'Bumble', star: 'Star', diva: 'Diva', drone: 'Drone', clover: 'Clover', nectar: 'Nectar', lumen: 'Lumen', jester: 'Jester', queenhive: 'Queen Hive', blossom: 'Blossom', propolis: 'Propolis', mic: 'Mic', maestro: 'Maestro', popcorn: 'Popcorn', melody: 'Melody' };
const avatar = (id, size, extra) => `<svg viewBox="0 0 120 120" style="width:${size};height:${size};flex-shrink:0${extra || ''}" aria-hidden="true">${AV[id] || ''}</svg>`;
const VEX = (size) => `<svg viewBox="0 0 120 120" style="width:${size};height:${size};flex-shrink:0" aria-hidden="true">
  <path d="M60 26 L30 62 L48 58 L42 92 L60 72 L78 92 L72 58 L90 62 Z" fill="#3A2A55" stroke="#241E33" stroke-width="4" stroke-linejoin="round"/>
  <path d="M30 62 Q12 48 16 30 Q34 34 42 50 Z M90 62 Q108 48 104 30 Q86 34 78 50 Z" fill="#5B3FA6" stroke="#241E33" stroke-width="4" stroke-linejoin="round"/>
  <path d="M48 48 l10 4 M72 48 l-10 4" stroke="#E8546A" stroke-width="5" stroke-linecap="round"/>
  <path d="M52 62 q8 -5 16 0" stroke="#E8546A" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M52 18 q4 8 8 10 M68 18 q-4 8 -8 10" stroke="#241E33" stroke-width="4" fill="none" stroke-linecap="round"/></svg>`;
function texture(tex) {
  const S = 'stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none"';
  if (tex === 'rings') return `<circle cx="82%" cy="18%" r="70" ${S}/><circle cx="82%" cy="18%" r="110" ${S}/><circle cx="82%" cy="18%" r="150" ${S}/><circle cx="10%" cy="92%" r="60" ${S}/><circle cx="10%" cy="92%" r="95" ${S}/>`;
  if (tex === 'stripes') return [0, 1, 2, 3, 4, 5].map(i => `<path d="M${-80 + i * 90} 620 L${240 + i * 90} -40" stroke="rgba(255,255,255,.08)" stroke-width="14" fill="none"/>`).join('');
  if (tex === 'dots') { let d2 = ''; for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) d2 += `<circle cx="${8 + x * 18}%" cy="${5 + y * 13}%" r="4" fill="rgba(255,255,255,.13)"/>`; return d2; }
  if (tex === 'grid') { let d2 = ''; for (let i = 1; i < 8; i++) d2 += `<path d="M${i * 12.5}% 0 V100%" ${S}/><path d="M0 ${i * 12.5}% H100%" ${S}/>`; return d2; }
  if (tex === 'diag') return [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-60 + i * 80} -40 L${140 + i * 80} 640" ${S}/>`).join('');
  return `<path d="M50% 0 V100% M0 50% H100%" stroke="rgba(255,255,255,.07)" stroke-width="30" fill="none"/>`;
}

/* ---------------- CSS: tokens-book + type scale + class contracts ---------------- */
function css(vol) {
  const bodyPt = vol.band === 'advanced' ? '11.5pt' : '13pt';
  const bodyLh = vol.band === 'advanced' ? '17pt' : '19.5pt';
  const lineH = vol.band === 'advanced' ? '.32in' : '.4in';
  return `
  @font-face{font-family:'BB Display';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:800}
  @font-face{font-family:'BB Kicker';src:url('../fonts/fredoka-600.woff2') format('woff2');font-weight:600}
  @font-face{font-family:'BB Body';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
  @font-face{font-family:'BB Tile';src:url('../fonts/sono-600.woff2') format('woff2');font-weight:600}
  *{box-sizing:border-box;margin:0;padding:0}
  :root{--paper:#f3efff;--card:#fff;--hairline:#ddd4f2;--chip:#e6defc;--chip-ink:#4a3aa0;
    --ink:#241E33;--muted:#6b6482;--treasure:#F0B429;--treasure-tint:#FFF3D6;--treasure-deep:#8A5B00;
    --right:#3DA85C;--right-deep:#1F6B39;--tricky:#E8546A;--tricky-deep:#C43D5A;
    --listen:#2E8FB8;--listen-deep:#1C6486;--listen-tint:#E4F1F8;
    --accent:${vol.a};--accent-deep:${vol.d};--tint:color-mix(in srgb,${vol.a} 10%,white);
    --r-card:8pt;--r-panel:14pt;--sh-screen:0 3px 10px rgba(108,79,224,.07)}
  html{background:#DED6F0}
  body{font-family:'BB Body',sans-serif;color:var(--ink);font-size:${bodyPt};line-height:${bodyLh};
    -webkit-print-color-adjust:exact;print-color-adjust:exact}
  @page{size:8.5in 11in;margin:0}
  .page{width:8.5in;height:11in;background:var(--paper);position:relative;overflow:hidden;
    padding:.62in .5in .58in .75in;break-after:page;page-break-after:always}
  .page[data-verso]{padding-left:.5in;padding-right:.75in}
  .page[data-cover]{padding:.55in}
  @media screen{.page{margin:24px auto;box-shadow:0 10px 34px rgba(36,30,51,.18);border-radius:4px}}
  h1,h2,h3,.disp{font-family:'BB Display';font-weight:800}
  .kick{font-family:'BB Kicker';font-weight:600;font-size:10pt;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-deep)}
  .tile{font-family:'BB Tile';font-weight:600;color:var(--muted)}
  .bb-head{position:absolute;top:.3in;left:.75in;right:.5in;display:flex;justify-content:space-between;align-items:baseline;
    font-family:'BB Kicker';font-size:10pt;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--hairline);padding-bottom:4pt}
  .page[data-verso] .bb-head{left:.5in;right:.75in}
  .bb-foot{position:absolute;bottom:.28in;left:.75in;right:.5in;display:flex;justify-content:space-between;
    font-family:'BB Kicker';font-size:10pt;color:var(--muted)}
  .page[data-verso] .bb-foot{left:.5in;right:.75in}
  .bb-panelbox{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-panel);padding:.12in .15in;box-shadow:var(--sh-screen)}
  .bb-bigidea{background:var(--tint);border:1px solid color-mix(in srgb,var(--accent) 30%,white);border-left:6px solid var(--accent);
    border-radius:var(--r-panel);padding:.12in .16in;max-height:1.5in;overflow:hidden}
  .bb-promove{background:var(--ink);color:#F4EFFF;border-radius:var(--r-panel);padding:.13in .16in;max-height:1.6in;overflow:hidden;
    font-size:9.4pt;line-height:1.45}
  .bb-promove b{color:var(--treasure)} .bb-promove div{margin:2px 0}
  .bb-promove .trick,.bb-promove [class]{font-family:'BB Display';font-size:11.5pt;letter-spacing:.04em}
  .bb-sticky{display:grid;grid-template-columns:1fr 1fr;gap:.1in;margin-top:.1in}
  .bb-sticky .card{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-card);padding:.09in .11in;box-shadow:var(--sh-screen)}
  .bb-sticky h3{font-size:9.6pt;color:var(--accent-deep);margin-bottom:2px}
  .bb-sticky p{font-size:8.4pt;line-height:1.35}
  .bb-strip{display:grid;gap:.12in;margin-top:.12in}
  .bb-panel{border:2.5pt solid var(--ink);border-radius:11pt;background:var(--card);position:relative;overflow:hidden;padding:.1in .12in;min-height:2.1in}
  .bb-panel.think{background:radial-gradient(circle at 30% 25%,#EFEAFB,#fff 70%)}
  .bb-panel.oops{background:#FFF1F3}
  .bb-panel.excited{background:radial-gradient(circle at 60% 30%,#E9FBEF,#fff 70%)}
  .bb-panel.love{background:radial-gradient(circle at 40% 30%,#FDEDF4,#fff 70%)}
  .bb-bubble{position:relative;background:var(--card);border:1.6pt solid var(--ink);border-radius:12pt;padding:6pt 9pt;
    font-family:'BB Display';font-size:${vol.band === 'advanced' ? '9.6pt' : '10.4pt'};line-height:1.28;margin-bottom:6pt}
  .bb-sfx{font-family:'BB Display';font-size:15pt;letter-spacing:.04em;position:absolute;right:8pt;bottom:6pt;color:var(--tricky-deep);transform:rotate(-4deg)}
  .bb-sfx.win{color:var(--right-deep)}
  .bb-prop{display:inline-block;background:var(--chip);color:var(--chip-ink);border-radius:8pt;padding:3pt 8pt;font-family:'BB Tile';font-size:10pt}
  .bb-hive{display:grid;grid-template-columns:1fr 1fr;gap:.11in}
  .bb-card{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-panel);padding:.1in .12in;box-shadow:var(--sh-screen);max-height:1.35in;overflow:hidden}
  .bb-card .w{font-family:'BB Body';font-weight:800;font-size:20pt;line-height:1.05;font-variant-numeric:tabular-nums;color:var(--accent-deep)}
  .bb-card .say{font-family:'BB Tile';font-size:8.6pt;color:var(--muted);margin-top:1px}
  .bb-card .d{font-size:8.6pt;line-height:1.3;margin-top:2px}
  .bb-card .hook{font-size:8.2pt;line-height:1.28;margin-top:2px;color:var(--chip-ink)}
  .bb-writeline{border-bottom:1pt solid var(--ink);height:${lineH};margin-top:4pt}
  .bb-rapid{display:grid;grid-template-columns:1fr 1fr;gap:.08in .16in}
  .bb-row{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-card);padding:4pt 8pt;max-height:.42in;overflow:hidden;font-size:8.8pt;line-height:1.3}
  .bb-row b{font-family:'BB Kicker';color:var(--accent-deep)}
  .bb-break{display:flex;gap:.1in;align-items:flex-start;background:var(--treasure-tint);border:1px solid var(--treasure);border-radius:var(--r-panel);padding:.1in .13in;max-height:2.2in;overflow:hidden}
  .bb-break .l{font-family:'BB Kicker';font-size:8.2pt;letter-spacing:.1em;text-transform:uppercase;color:var(--treasure-deep)}
  .bb-break .b{font-size:9.6pt;line-height:1.35;margin-top:2px}
  .bb-break .t{font-size:8.4pt;color:var(--muted);margin-top:2px}
  .bb-check{background:var(--card);border:1px solid var(--right);border-radius:var(--r-panel);padding:.09in .13in;max-height:1.2in;overflow:hidden}
  .bb-check .l{font-family:'BB Kicker';font-size:8.2pt;letter-spacing:.1em;text-transform:uppercase;color:var(--right-deep)}
  .bb-vex{background:#FFF1F3;border:1px solid var(--tricky);border-radius:var(--r-panel);padding:.09in .13in;max-height:1.2in;overflow:hidden;display:flex;gap:.09in;align-items:flex-start}
  .bb-vex .l{font-family:'BB Kicker';font-size:8.2pt;letter-spacing:.1em;text-transform:uppercase;color:var(--tricky-deep)}
  .bb-audio{display:inline-flex;align-items:center;gap:5pt;background:var(--listen-tint);border:1px solid var(--listen);color:var(--listen-deep);
    border-radius:999px;padding:3pt 10pt;font-family:'BB Kicker';font-size:8.6pt;max-height:.3in}
  .bb-xword{border-collapse:collapse;margin:0 auto}
  .bb-xword td{width:.32in;height:.32in;position:relative}
  .bb-xword .c{background:var(--card);border:1.4px solid var(--chip-ink)}
  .bb-xword .c i{position:absolute;top:1px;left:2px;font-style:normal;font-size:5.4pt;color:var(--muted)}
  .bb-clues{display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:8.6pt;line-height:1.4}
  .bb-clues h3{font-size:10.5pt;color:var(--accent-deep);margin-bottom:2pt}
  .bb-clues b{color:var(--chip-ink)}
  .bb-search{border-collapse:collapse;margin:0 auto}
  .bb-search td{width:.38in;height:.38in;text-align:center;font-family:'BB Tile';font-size:11pt;background:var(--card);border:1px solid var(--hairline)}
  .bb-scramble{display:grid;grid-template-columns:1fr 1fr;gap:.16in;max-height:none}
  .bb-scramble .g1{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-card);padding:.09in .12in;margin-bottom:.08in}
  .bb-scramble .gw{font-family:'BB Tile';font-size:11pt;letter-spacing:.14em;color:var(--accent-deep)}
  .bb-biglist{columns:4;column-gap:.18in;font-size:8.6pt;line-height:.28in}
  .bb-biglist div{break-inside:avoid}
  .bb-biglist span{display:inline-block;width:.12in;height:.12in;border:1.4px solid var(--accent);border-radius:50%;margin-right:4pt;vertical-align:-1.5pt;background:var(--card)}
  .bb-key{columns:3;column-gap:.18in;font-size:10pt;line-height:1.45;color:var(--ink)}
  .bb-badge{display:flex;gap:.08in;align-items:center;max-height:.7in}
  .bb-badge .b1{width:.5in;height:.5in;border-radius:12pt;border:1.6pt dashed var(--accent);display:grid;place-items:center;font-family:'BB Display';font-size:9pt;color:var(--accent-deep);background:var(--card)}
  .chip{display:inline-block;background:var(--chip);color:var(--chip-ink);font-weight:700;font-size:9pt;border-radius:999px;padding:2pt 9pt}
  `;
}

/* running head/foot; folio counts every page after the cover */
const head = (vol, ch, ci, ptype) => ch ? `<div class="bb-head"><span>Chapter ${ci + 1} · ${esc(clamp(ch.title, 46))}</span><span>${esc(ptype)} · ${'★'.repeat(vol.band === 'advanced' ? 3 : (/hard/i.test(ch.difficulty || '') ? 3 : /medium/i.test(ch.difficulty || '') ? 2 : 1))}${'☆'.repeat(3 - (vol.band === 'advanced' ? 3 : (/hard/i.test(ch.difficulty || '') ? 3 : /medium/i.test(ch.difficulty || '') ? 2 : 1)))}</span></div>`
  : `<div class="bb-head"><span>${esc(vol.title)}</span><span>${esc(ptype)}</span></div>`;
const foot = (vol, folio) => `<div class="bb-foot"><span>Bizzing Bee · ${esc(vol.title)}</span><span>${folio}</span></div>`;

/* Bee Break: per-volume cursors, no repeats inside a book */
function makeBreaks(vol) {
  const rq = mulberry(vol.n * 131 + 7), rs = mulberry(vol.n * 131 + 8), ri = mulberry(vol.n * 131 + 9);
  const q = shuf(QUOTES.filter(x => x.q.length < 120).slice(), rq);
  const s = shuf(FIG.similes.filter(x => (x.p + x.m).length < 140).slice(), rs);
  const i = shuf(FIG.idioms.filter(x => (x.p + x.m).length < 140).slice(), ri);
  let qi = 0, si = 0, ii = 0, k = 0;
  return () => {
    const kind = (k++) % 3;
    if (kind === 0) { const x = q[qi++ % q.length]; return `<div class="bb-break"><span style="font-size:13pt">💬</span><div><div class="l">Bee Break · someone said it better</div><div class="b">“${esc(x.q)}”</div><div class="t">— ${esc(x.a)}${x.who ? ', ' + esc(x.who) : ''}</div></div></div>`; }
    if (kind === 1) { const x = s[si++ % s.length]; return `<div class="bb-break"><span style="font-size:13pt">✨</span><div><div class="l">Bee Break · simile of the page</div><div class="b"><b>${esc(x.p)}</b></div><div class="t">${esc(x.m)}</div></div></div>`; }
    const x = i[ii++ % i.length]; return `<div class="bb-break"><span style="font-size:13pt">🎈</span><div><div class="l">Bee Break · idiom to drop at dinner</div><div class="b"><b>${esc(x.p)}</b></div><div class="t">${esc(x.m)}</div></div></div>`;
  };
}

/* ---------------- comic opener from the six-scene script ---------------- */
function sceneProp(sc) {
  try { const sh = sc.show; if (!sh) return '';
    if (sh.word) return `<span class="bb-prop">${esc(String(sh.word).toUpperCase())}</span>`;
    if (sh.parts) return `<span class="bb-prop">${esc([].concat(sh.parts).slice(0, 4).join(' · '))}</span>`;
    if (sh.list) return [].concat(sh.list).slice(0, 3).map(x => `<span class="bb-prop" style="margin-right:4pt">${esc(clamp(typeof x === 'object' ? (x.w || x.t || '') : x, 16))}</span>`).join('');
    if (sh.glyph) return `<span class="bb-prop" style="font-size:13pt">${esc(String(sh.glyph).slice(0, 8))}</span>`;
    if (sh.big) return `<span class="bb-prop">${esc(clamp(sh.big, 20))}</span>`;
  } catch (e) {} return '';
}
function comicOpener(vol, ch, ci, script, folio) {
  const scenes = (script && script.scenes) || [];
  if (!scenes.length) return null;
  const pick = [];
  const byMood = m => scenes.find(s => s.mood === m && !pick.includes(s));
  pick.push(scenes[0]);
  for (const m of ['think', 'oops', 'excited']) { const s = byMood(m); if (s && pick.length < 4) pick.push(s); }
  for (const s of scenes) { if (pick.length >= 4) break; if (!pick.includes(s)) pick.push(s); }
  const maxW = vol.band === 'advanced' ? 20 : 14;
  const panels = pick.map(sc => {
    const mood = sc.mood || 'happy';
    const isVex = mood === 'oops';
    const who = isVex ? VEX('0.85in') : avatar(vol.av, '0.85in');
    const sfx = isVex ? '<span class="bb-sfx">UH-OH!</span>' : (mood === 'excited' ? '<span class="bb-sfx win">GOT IT!</span>' : '');
    return `<div class="bb-panel ${esc(mood)}">
      <div class="bb-bubble">${esc(wordsClamp(sc.say, maxW))}</div>
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:.08in">
        ${who}<div style="text-align:right">${sceneProp(sc)}</div></div>${sfx}</div>`;
  });
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'Story')}
    <div style="margin-top:.4in;display:flex;align-items:center;gap:.14in">
      <span style="display:inline-grid;place-items:center;width:.58in;height:.58in;border-radius:15px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:16pt">${ci + 1}</span>
      <div><div class="kick">${esc(ch.category)}</div><h1 style="font-size:26pt;line-height:1.05">${esc(ch.title)}</h1></div></div>
    <div class="bb-strip" style="grid-template-columns:1fr 1fr">${panels.slice(0, 4).join('')}</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:.14in">
      <span class="bb-audio">🔊 Hear this chapter narrated in the app</span>
      <span class="kick" style="font-size:8.6pt">turn the page — the whole trick, explained →</span></div>
    ${foot(vol, folio)}</div>`;
}

/* ---------------- chapter pages ---------------- */
function teachPage(vol, ch, ci, folio, nextBreak) {
  const cards = (ch.cards || []).slice(0, 4);
  const words = (ch.words || []).filter(w => w && w.w);
  const oops = null; // vex alert content: the sneakiest hook among the chapter's words
  const vexW = words.find(w => w.hook && /not|never|don’t|don't|watch|careful|trap/i.test(w.hook)) || words[0];
  const three = words.slice(0, 3).map(w => w.w);
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'The idea')}
    <div style="margin-top:.4in" class="kick">The big idea</div>
    <div class="bb-bigidea">${esc(clamp(ch.concept, 460))}</div>
    ${ch.method ? `<div class="kick" style="margin-top:.08in">The pro move</div><div class="bb-promove">${String(ch.method)}</div>` : ''}
    ${cards.length ? `<div class="bb-sticky">${cards.map(cd => `<div class="card"><h3>${esc(cd.title)}</h3><p>${esc(clamp(cd.body, 300))}</p></div>`).join('')}</div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.1in;margin-top:.1in">
      ${vexW && vexW.hook ? `<div class="bb-vex">${VEX('0.42in')}<div><div class="l">Vex alert</div><div style="font-size:8.8pt;line-height:1.35">${esc(clamp(vexW.hook, 130))}</div></div></div>` : ''}
      <div class="bb-check"><div class="l">Check yourself</div><div style="font-size:8.8pt;line-height:1.35">Cover the page. Spell these three out loud: <b>${three.map(esc).join('</b> · <b>')}</b>. Even Vex missed that last one.</div></div></div>
    ${nextBreak()}
    ${foot(vol, folio)}</div>`;
}
function hivePages(vol, ch, ci, folioRef) {
  const words = (ch.words || []).filter(w => w && w.w);
  const FULLN = vol.band === 'advanced' ? 16 : 8;
  const out = [];
  const fullAll = words.slice(0, FULLN);
  for (let f = 0; f < fullAll.length; f += 8) {
    const seg = fullAll.slice(f, f + 8);
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, ch, ci, 'Practice')}
      <div style="margin-top:.4in;display:flex;justify-content:space-between;align-items:baseline">
        <h2 style="font-size:20pt">Say it. Spell it out loud. Write it.</h2>
        <span class="bb-audio">🔊 every word has real audio in the app</span></div>
      <div class="bb-hive" style="margin-top:.12in">${seg.map(w => { const say = w.say || ''; const ipa = ipaOf(w.w, say);
        return `<div><div class="bb-card"><div class="w">${esc(w.w)}</div>
        <div class="say">${say ? '/ ' + esc(say) + ' /' : ''}${ipa ? '  ·  /' + esc(ipa) + '/' : ''}</div>
        <div class="d">${esc(clamp(w.def, 92))}</div>${w.hook ? `<div class="hook">hook: ${esc(clamp(w.hook, 92))}</div>` : ''}</div>
        <div class="bb-writeline"></div></div>`; }).join('')}</div>
      ${foot(vol, folioRef.n++)}</div>`);
  }
  const rest = words.slice(FULLN);
  for (let i = 0; i < rest.length; i += 28) {
    const seg = rest.slice(i, i + 28);
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, ch, ci, 'Rapid round')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">More ammo — one line each.</h2></div>
      <div class="bb-rapid" style="margin-top:.12in">${seg.map(w => `<div class="bb-row"><b>${esc(w.w)}</b> <span class="tile" style="font-size:7.8pt">${w.say ? '/' + esc(w.say) + '/' : ''}</span><br>${esc(clamp(w.def, 64))}</div>`).join('')}</div>
      ${foot(vol, folioRef.n++)}</div>`);
  }
  return out;
}
/* puzzles (seeded; unchanged logic, restyled) */
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
      else { if (dr === 0) { if ((rr > 0 && g[rr - 1][cc]) || (rr < N - 1 && g[rr + 1][cc])) return false; }
        else { if ((cc > 0 && g[rr][cc - 1]) || (cc < N - 1 && g[rr][cc + 1])) return false; } } }
    return true; };
  const put = (w, r, c, dr, dc) => { for (let i = 0; i < w.u.length; i++) g[r + dr * i][c + dc * i] = w.u[i]; placed.push({ ...w, r, c, dr, dc }); };
  put(W[0], Math.floor(N / 2), Math.floor((N - W[0].u.length) / 2), 0, 1);
  for (const w of W.slice(1)) { const opts = [];
    for (const p of placed) for (let i = 0; i < p.u.length; i++) for (let j = 0; j < w.u.length; j++) {
      if (p.u[i] !== w.u[j]) continue;
      const dr = p.dr === 0 ? 1 : 0, dc = p.dr === 0 ? 0 : 1;
      const r = p.r + p.dr * i - dr * j, c = p.c + p.dc * i - dc * j;
      if (fits(w.u, r, c, dr, dc)) opts.push([r, c, dr, dc]); }
    if (opts.length) { const o = opts[Math.floor(rnd() * opts.length)]; put(w, o[0], o[1], o[2], o[3]); } }
  if (placed.length < 4) return null;
  let r0 = N, r1 = 0, c0 = N, c1 = 0;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (g[r][c]) { r0 = Math.min(r0, r); r1 = Math.max(r1, r); c0 = Math.min(c0, c); c1 = Math.max(c1, c); }
  const nums = {}; let n = 0; const across = [], down = [];
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) { if (!g[r][c]) continue;
    const sA = (c === c0 || !g[r][c - 1]) && c + 1 <= c1 && g[r][c + 1];
    const sD = (r === r0 || !g[r - 1][c]) && r + 1 <= r1 && g[r + 1][c];
    if (sA || sD) { n++; nums[r + ',' + c] = n;
      const f2 = (dr, dc) => placed.find(p => p.r === r && p.c === c && p.dr === dr && p.dc === dc);
      if (sA) { const p = f2(0, 1); if (p) across.push({ n, ...p }); }
      if (sD) { const p = f2(1, 0); if (p) down.push({ n, ...p }); } } }
  return { g, r0, r1, c0, c1, nums, across, down, placed };
}
function wordSearch(words, rnd) {
  const W = words.filter(w => /^[a-z]{4,12}$/i.test(w.w)).slice(0, 10).map(w => w.w.toUpperCase());
  if (W.length < 5) return null;
  const N = 13, g = Array.from({ length: N }, () => Array(N).fill(''));
  const DIRS = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
  const placedW = [];
  for (const u of W) { for (let t = 0; t < 220; t++) {
      const [dr, dc] = DIRS[Math.floor(rnd() * 8)];
      const r = Math.floor(rnd() * N), c = Math.floor(rnd() * N);
      const er = r + dr * (u.length - 1), ec = c + dc * (u.length - 1);
      if (er < 0 || ec < 0 || er >= N || ec >= N) continue;
      let clash = false;
      for (let i = 0; i < u.length; i++) { const cur = g[r + dr * i][c + dc * i]; if (cur && cur !== u[i]) { clash = true; break; } }
      if (clash) continue;
      for (let i = 0; i < u.length; i++) g[r + dr * i][c + dc * i] = u[i];
      placedW.push(u); break; } }
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (!g[r][c]) g[r][c] = AZ[Math.floor(rnd() * 26)];
  return { g, words: placedW };
}
function gamePage(vol, ch, ci, rnd, keys, folio, nextBreak) {
  const words = (ch.words || []).filter(w => w && w.w);
  const kind = ci % 3;
  let body = '', title = '';
  if (kind === 0) { const cw = crossword(words, rnd);
    if (cw) { title = 'Crossword';
      let rows = '';
      for (let r = cw.r0; r <= cw.r1; r++) { rows += '<tr>';
        for (let c = cw.c0; c <= cw.c1; c++) { const chx = cw.g[r][c]; const num = cw.nums[r + ',' + c];
          rows += chx ? `<td class="c">${num ? `<i>${num}</i>` : ''}</td>` : '<td></td>'; }
        rows += '</tr>'; }
      const clue = p => `<div><b>${p.n}.</b> ${esc(maskDef(clamp(p.def, 76), p.w))}</div>`;
      body = `<div class="bb-xword-wrap" style="display:flex;justify-content:center"><table class="bb-xword">${rows}</table></div>
        <div class="bb-clues"><div><h3>Across</h3>${cw.across.map(clue).join('')}</div><div><h3>Down</h3>${cw.down.map(clue).join('')}</div></div>`;
      keys.push(`<div><b>Ch. ${ci + 1} crossword</b> — Across: ${cw.across.map(p => p.n + ' ' + p.w).join(', ')} · Down: ${cw.down.map(p => p.n + ' ' + p.w).join(', ')}</div>`); } }
  if (!body && kind !== 2) { const ws = wordSearch(words, rnd);
    if (ws) { title = 'Word search';
      body = `<table class="bb-search">${ws.g.map(row => '<tr>' + row.map(c => `<td>${c}</td>`).join('') + '</tr>').join('')}</table>
      <div style="display:flex;flex-wrap:wrap;gap:5pt;justify-content:center;margin-top:.1in">${ws.words.map(w => `<span class="chip">${esc(w.toLowerCase())}</span>`).join('')}</div>
      <p style="text-align:center;font-size:8.6pt;color:var(--muted);margin-top:.06in">Words run in every direction — even backwards.</p>`; } }
  if (!body) { title = 'Scramble & rescue';
    const pool = words.filter(w => /^[a-z]{4,12}$/i.test(w.w));
    const sc = shuf(pool.slice(), rnd).slice(0, 6).map(w => { let s = w.w;
      for (let t = 0; t < 20 && s === w.w; t++) s = shuf(w.w.split(''), rnd).join(''); return { w: w.w, s }; });
    const ml = shuf(pool.slice(), rnd).slice(0, 6).map(w => ({ w: w.w, m: w.w.replace(/[aeiou]/g, '_') }));
    body = `<div class="bb-scramble"><div><div class="kick" style="margin-bottom:.06in">Unscramble</div>
      ${sc.map(x => `<div class="g1"><span class="gw">${esc(x.s)}</span><div class="bb-writeline"></div></div>`).join('')}</div>
      <div><div class="kick" style="margin-bottom:.06in">Rescue the vowels</div>
      ${ml.map(x => `<div class="g1"><span class="gw">${esc(x.m)}</span><div class="bb-writeline"></div></div>`).join('')}</div></div>`;
    keys.push(`<div><b>Ch. ${ci + 1} scramble</b> — ${sc.map(x => x.s + '=' + x.w).join(', ')} · vowels: ${ml.map(x => x.w).join(', ')}</div>`); }
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'Game')}
    <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(vol.av, '.6in')}
      <div><div class="kick">${esc(NAMES[vol.av])}'s puzzle page</div><h2 style="font-size:20pt">${title}</h2></div>
      <div style="margin-left:auto" class="bb-badge"><div class="b1">I own<br>this</div></div></div>
    <div style="margin-top:.1in">${body}</div>
    ${nextBreak()}
    ${foot(vol, folio)}</div>`;
}

/* shared front/back matter */
function cover(vol, nCh, nWords, label) {
  return `<div class="page" data-cover data-vol="${vol.n}" style="background:linear-gradient(160deg,var(--accent),var(--accent-deep));color:#fff;display:flex;flex-direction:column;justify-content:space-between">
    <svg style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${texture(vol.tex)}</svg>
    <div style="position:relative;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'BB Kicker';letter-spacing:.16em;font-size:10.5pt">BIZZING BEE ${label}</span>
      <span class="disp" style="background:rgba(0,0,0,.3);padding:.07in .2in;border-radius:999px;font-size:12.5pt">Vol. ${vol.n}</span></div>
    <div style="position:relative;text-align:center">
      ${avatar(vol.av, '1.7in')}
      <h1 style="font-size:44pt;line-height:1.02;margin:.14in 0 .1in;text-shadow:0 3px 0 rgba(0,0,0,.2)">${esc(vol.title)}</h1>
      <p style="font-family:'BB Kicker';font-size:13pt;max-width:5.8in;margin:0 auto">${esc(vol.tag)}</p>
      <p style="font-family:'BB Kicker';font-size:9.5pt;margin-top:.1in;opacity:.9">with ${esc(NAMES[vol.av])}, your guide · the ${esc(vol.world)} world</p></div>
    <div style="position:relative;display:flex;gap:.14in;justify-content:center">
      ${[[nCh, 'chapters'], [nWords, 'practice words'], ['🎲', 'puzzles & games']].map(([a2, b2]) =>
        `<div style="background:rgba(0,0,0,.24);border-radius:14px;padding:.12in .28in;text-align:center"><div class="disp" style="font-size:17pt">${a2}</div><div style="font-family:'BB Kicker';font-size:9pt">${b2}</div></div>`).join('')}</div></div>`;
}
function howTo(vol, folio) {
  const steps = [
    ['Read the story strip', 'Each chapter opens as a comic. Vex sets the trap; your guide walks you out of it.'],
    ['Steal the pro move', 'The dark box is how a champion thinks on stage. It works on brand-new words.'],
    ['Spell in the boxes', 'Say it, spell it OUT LOUD, then write it. Hand and mouth together beat eyes alone.'],
    ['Play the puzzle', 'Every chapter ends in a game made of its own words. Sneaky practice still counts.'],
    ['Hunt the Big List', 'The back holds every word. Circle the bubbles you own. Come back for the rest.'],
  ];
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:26pt">Five moves. That's the whole system.</h1></div>
    <div style="display:flex;gap:.14in;align-items:flex-start;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-bubble" style="font-size:11pt">Hi — <b>${esc(NAMES[vol.av])}</b> here. ${esc(vol.tag)}. That's our mission. Bring a pencil; I'll bring the words. Watch out for Vex.</div></div>
    ${steps.map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:9.8pt;line-height:1.45">${b}</p></div></div>`).join('')}
    <div class="bb-audio" style="margin-top:.05in">🔊 Grown-ups: every chapter is narrated, and every word recorded, in the Bizzing Bee app</div>
    ${foot(vol, folio)}</div>`;
}
function bigListPages(vol, allWords, folioRef) {
  const uniq = [...new Map(allWords.map(w => [w.w.toLowerCase(), w])).values()].sort((a, b) => a.w.localeCompare(b.w));
  const out = []; const PER = 104;
  for (let i = 0; i < uniq.length; i += PER) {
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, null, 0, 'The Big List')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Every word in this book. Circle what you own.</h2></div>
      <div class="bb-biglist" style="margin-top:.14in">${uniq.slice(i, i + PER).map(w => `<div><span></span>${esc(w.w)}</div>`).join('')}</div>
      ${foot(vol, folioRef.n++)}</div>`);
  }
  return out;
}
function keyPages(vol, keys, folioRef) {
  const out = [];
  out.push(`<div class="page" data-vol="${vol.n}" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${VEX('1.2in')}
    <h1 style="font-size:32pt;margin:.14in 0 .06in">No peeking until you've tried.</h1>
    <p style="color:var(--muted);font-size:11pt">Vex would peek. Be better than Vex.</p>
    ${foot(vol, folioRef.n++)}</div>`);
  for (let i = 0; i < keys.length; i += 14) {
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, null, 0, 'Answer key')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Answer key</h2></div>
      <div class="bb-key" style="margin-top:.12in">${keys.slice(i, i + 14).join('')}</div>
      ${foot(vol, folioRef.n++)}</div>`);
  }
  return out;
}
function colophon(vol, folio) {
  return `<div class="page" data-vol="${vol.n}" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${avatar(vol.av, '1.4in')}
    <h2 style="font-size:20pt;margin:.12in 0">${esc(NAMES[vol.av])} says: that's a whole book. Respect.</h2>
    <div style="margin:0 auto .2in" class="bb-badge"><div class="b1">DONE</div><div class="b1" style="border-style:solid">★</div><div class="b1">+1</div></div>
    <p style="font-size:10.5pt;max-width:5.4in;margin:0 auto .26in;line-height:1.55">Every word in here also lives in the Bizzing Bee app, with real audio, games and a coach that remembers what you miss. Paper for the muscles, app for the ears.</p>
    <p style="font-size:8.4pt;color:var(--muted);max-width:5.9in;margin:0 auto;line-height:1.55">Bizzing Bee is an independent study project — not affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Competition names appear only to describe what the practice material relates to. Definitions, sentences, hints and stories are written for this project. Typefaces are open-licensed (SIL OFL).</p>
    ${foot(vol, folio)}</div>`;
}

/* ---------------- course book builder ---------------- */
function buildCourse(vol, chapters, scripts, idxOf) {
  const rnd = mulberry(vol.n * 7919 + 17);
  const nextBreak = makeBreaks(vol);
  const allWords = chapters.flatMap(ch => (ch.words || []).filter(w => w && w.w));
  const keys = [];
  const folio = { n: 1 };
  let pages = [cover(vol, chapters.length, allWords.length, vol.band === 'advanced' ? 'ADVANCED LIBRARY' : 'LIBRARY')];
  pages.push(howTo(vol, folio.n++));
  chapters.forEach((ch, i) => {
    const sc = scripts[String(idxOf(ch))];
    const op = comicOpener(vol, ch, i, sc, folio.n); if (op) { pages.push(op); folio.n++; }
    pages.push(teachPage(vol, ch, i, folio.n++, nextBreak));
    pages = pages.concat(hivePages(vol, ch, i, folio));
    pages.push(gamePage(vol, ch, i, rnd, keys, folio.n++, nextBreak));
  });
  pages = pages.concat(bigListPages(vol, allWords, folio));
  pages = pages.concat(keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  return finish(vol, pages, { chapters: chapters.length, words: allWords.length });
}
/* verso marking + emit */
function finish(vol, pages, meta) {
  const html = pages.map((p, i) => i > 0 && i % 2 === 0 ? p.replace('<div class="page"', '<div class="page" data-verso') : p).join('\n');
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(vol.title)} — Bizzing Bee Library Vol. ${vol.n}</title>
<style>${css(vol)}</style></head><body data-vol="${vol.n}" data-band="${vol.band}">${html}</body></html>`;
  fs.writeFileSync(`books/book-${String(vol.n).padStart(2, '0')}.html`, doc);
  return { vol, pages: pages.length, ...meta };
}

/* ---------------- collections (16, 17) ---------------- */
function book16() {
  const vol = { n: 16, title: 'As Busy as a Bee', tag: 'Every simile we know, and the idiom hall of fame', a: '#3DA85C', d: '#1F6B39', tex: 'dots', av: 'popcorn', world: 'meadow', band: 'general' };
  const rnd = mulberry(16 * 7919 + 17);
  const sims = FIG.similes.slice().sort((a, b) => a.p.localeCompare(b.p));
  const idioms = FIG.idioms.filter(x => x.os && x.p.length <= 26 && (x.m || '').length <= 90).sort((a, b) => a.p.localeCompare(b.p)).slice(0, 240);
  const keys = []; const folio = { n: 1 };
  const pages = [cover(vol, sims.length, idioms.length, 'COLLECTIONS')];
  pages.push(howTo16(vol, folio.n++));
  let pageNo = 0;
  for (let i = 0; i < sims.length; i += 6) {
    const seg = sims.slice(i, i + 6); pageNo++;
    pages.push(`<div class="page" data-vol="16">
      ${head(vol, null, 0, 'The simile shelf')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Say one thing is like another. Boom — a picture.</h2></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.11in;margin-top:.12in">${seg.map(x => `<div class="bb-panelbox">
        <div style="font-family:'BB Display';font-size:12.5pt;color:var(--accent-deep);line-height:1.15">${esc(x.p)}</div>
        <div style="font-size:9pt;line-height:1.35;margin-top:2pt">${esc(clamp(x.m, 100))}</div>
        ${x.os ? `<div style="font-size:8.2pt;line-height:1.3;margin-top:3pt;color:var(--chip-ink);background:var(--chip);border-radius:8px;padding:3pt 6pt">📜 ${esc(clamp(x.os, 150))}</div>` : ''}</div>`).join('')}</div>
      ${foot(vol, folio.n++)}</div>`);
    if (pageNo % 6 === 0) {
      const pool = shuf(sims.slice(Math.max(0, i - 34), i + 6).slice(), rnd).slice(0, 10);
      const right = shuf(pool.map((x, k) => ({ k, m: x.m })), rnd);
      keys.push(`<div><b>Match, folio ${folio.n}</b> — ${pool.map((x, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="page" data-vol="16">
        ${head(vol, null, 0, 'Match round')}
        <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(vol.av, '.6in')}<h2 style="font-size:20pt">Draw the line: simile → meaning</h2></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:9.2pt;line-height:1.4">
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The similes</h3>${pool.map((x, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${k + 1}.</b> ${esc(x.p)}</div>`).join('')}</div>
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The meanings</h3>${right.map((r, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${String.fromCharCode(65 + k)}.</b> ${esc(clamp(r.m, 70))}</div>`).join('')}</div></div>
        <p style="font-size:9pt;color:var(--muted);margin-top:.1in">Your answers: ${pool.map((_, k) => (k + 1) + '—__').join('  ')}</p>
        ${foot(vol, folio.n++)}</div>`);
    }
    if (pageNo % 12 === 0) {
      const two = shuf(seg.slice(), rnd).slice(0, 2);
      pages.push(`<div class="page" data-vol="16">
        ${head(vol, null, 0, 'Draw it literally')}
        <div style="margin-top:.4in"><h2 style="font-size:20pt">Take a simile at its word. Draw the chaos.</h2></div>
        ${two.map(x => `<div style="margin-top:.14in"><div style="font-family:'BB Display';font-size:13pt;color:var(--accent-deep);margin-bottom:.05in">${esc(x.p)}</div>
        <div style="background:var(--card);border:2.5pt solid var(--ink);border-radius:11pt;height:3in;display:grid;place-items:center;color:var(--muted);font-family:'BB Kicker';font-size:10pt">your masterpiece here</div></div>`).join('')}
        ${foot(vol, folio.n++)}</div>`);
    }
  }
  for (let i = 0; i < idioms.length; i += 10) {
    pages.push(`<div class="page" data-vol="16">
      ${head(vol, null, 0, 'Idiom hall of fame')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Phrases that stopped meaning what they say.</h2></div>
      <div style="columns:2;column-gap:.2in;margin-top:.12in">${idioms.slice(i, i + 10).map(x => `<div class="bb-row" style="max-height:none;margin-bottom:5pt;break-inside:avoid"><b>${esc(x.p)}</b> — ${esc(clamp(x.m, 80))}<br><span style="color:var(--chip-ink);font-size:8pt">📜 ${esc(clamp(x.os, 110))}</span></div>`).join('')}</div>
      ${foot(vol, folio.n++)}</div>`);
  }
  pages.push(...keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  return finish(vol, pages, { chapters: 0, words: sims.length + idioms.length });
}
function howTo16(vol, folio) {
  return `<div class="page" data-vol="16">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:26pt">Talk like a storyteller.</h1></div>
    <div style="display:flex;gap:.14in;align-items:flex-start;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-bubble" style="font-size:11pt">I'm <b>Popcorn</b>. A simile says one thing is LIKE another — and suddenly people listen. Steal freely; that's what these are for.</div></div>
    ${[['Read it out loud', 'Similes are built for the ear. Say them and they stick.'],
       ['Read the backstory', 'The purple box is the true origin — one-breath campfire facts.'],
       ['Use one today', 'Drop one at dinner. Watch what happens.'],
       ['Play the match rounds', 'Cover the meanings, test yourself, check the key at the back.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:9.8pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${foot(vol, folio)}</div>`;
}
function book17() {
  const vol = { n: 17, title: 'Say It Like a Champion', tag: '240 lines worth keeping — and what they mean for spellers', a: '#7C3F9E', d: '#4E2166', tex: 'rings', av: 'melody', world: 'stage', band: 'general' };
  const rnd = mulberry(17 * 7919 + 17);
  const CH17 = [
    ['perseverance', 'Keep Going', 'For the round after the round you almost lost.'],
    ['courage', 'Be Brave', 'For the walk to the microphone.'],
    ['hardwork', 'Do the Work', 'For the days the list looks too long.'],
    ['believe', 'Back Yourself', 'For the voice that says you can’t.'],
    ['dreams', 'Dream Big', 'For the trophy you can already see.'],
    ['curiosity', 'Stay Curious', 'For the words you haven’t met yet.'],
    ['learning', 'Love Learning', 'For every list that made you better.'],
    ['imagination', 'Imagine It', 'For seeing the word before you spell it.'],
    ['creativity', 'Make Things', 'For building your own way to remember.'],
    ['kindness', 'Be Kind', 'For the speller who just went out.'],
    ['friendship', 'Bring Friends', 'For the people cheering in row three.'],
    ['humor', 'Laugh a Little', 'For when the nerves need popping.'],
  ];
  const keys = []; const folio = { n: 1 };
  const pages = [cover(vol, CH17.length, 240, 'COLLECTIONS')];
  pages.push(`<div class="page" data-vol="17">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:26pt">Borrow a giant's voice.</h1></div>
    <div style="display:flex;gap:.14in;align-items:flex-start;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-bubble" style="font-size:11pt">I'm <b>Melody</b>. Some sentences outlive the person who said them. Here are two hundred and forty — and under each, what it means when YOU'RE at the microphone.</div></div>
    ${[['One theme at a time', 'Twelve themes, twenty lines each. Courage before a bee. Humor after a hard one.'],
       ['Find your line', 'One of these will feel written for you. Mark it. It’s yours now.'],
       ['Play who-said-it', 'The match rounds test whether you were really listening.'],
       ['Write your own', 'Every third theme ends with blank lines. Champions get quoted too, eventually.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:9.8pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${foot(vol, folio.n++)}</div>`);
  let chNo = 0;
  for (const [cat, title, sub] of CH17) {
    chNo++;
    const pool = QUOTES.filter(q => q.c === cat && q.q.length <= 120 && q.q.length >= 25);
    const seen = new Set(); const picked = [];
    for (const q of pool.slice().sort((a, b) => a.q.length - b.q.length)) { if (seen.has(q.a)) continue; seen.add(q.a); picked.push(q); if (picked.length >= 20) break; }
    for (const q of pool) { if (picked.length >= 20) break; if (!picked.includes(q)) picked.push(q); }
    const hero = picked[0];
    pages.push(`<div class="page" data-vol="17" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--paper),var(--tint))">
      <div class="kick">Theme ${chNo} of ${CH17.length}</div>
      <h1 style="font-size:32pt;margin:.06in 0">${esc(title)}</h1>
      <p style="font-family:'BB Kicker';font-size:11pt;color:var(--muted)">${esc(sub)}</p>
      <div style="margin:.26in auto 0;max-width:5.6in">${avatar(vol.av, '1.05in')}
        <div class="bb-panelbox" style="text-align:left;margin-top:.12in"><div style="font-family:'BB Display';font-size:13pt;line-height:1.3">“${esc(hero.q)}”</div>
        <div style="font-family:'BB Kicker';font-size:9pt;color:var(--accent-deep);margin-top:3pt">— ${esc(hero.a)}${hero.who ? ', ' + esc(hero.who) : ''}</div></div></div>
      ${foot(vol, folio.n++)}</div>`);
    const rest = picked.slice(1);
    for (let i = 0; i < rest.length; i += 5) {
      pages.push(`<div class="page" data-vol="17">
        ${head(vol, null, 0, esc(title))}
        <div style="margin-top:.4in"></div>
        ${rest.slice(i, i + 5).map(q => `<div class="bb-panelbox" style="margin-bottom:.11in">
          <div style="font-family:'BB Display';font-size:12pt;line-height:1.28">“${esc(q.q)}”</div>
          <div style="font-family:'BB Kicker';font-size:9pt;color:var(--accent-deep);margin-top:3pt">— ${esc(q.a)}${q.who ? ', ' + esc(q.who) : ''}</div>
          <div style="font-size:8.6pt;line-height:1.32;margin-top:4pt;color:var(--chip-ink);background:var(--chip);border-radius:8px;padding:3pt 8pt">🐝 For spellers: ${esc(clamp(q.m, 150))}</div></div>`).join('')}
        ${foot(vol, folio.n++)}</div>`);
    }
    if (chNo % 3 === 0) {
      const mixPool = shuf(QUOTES.filter(q => CH17.slice(chNo - 3, chNo).some(c2 => c2[0] === q.c) && q.q.length <= 90).slice(), rnd).slice(0, 8);
      const right = shuf(mixPool.map((q, k) => ({ k, a: q.a })), rnd);
      keys.push(`<div><b>Who said it, folio ${folio.n}</b> — ${mixPool.map((q, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="page" data-vol="17">
        ${head(vol, null, 0, 'Match round')}
        <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(vol.av, '.6in')}<h2 style="font-size:20pt">Who said it?</h2></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:9.2pt;line-height:1.4">
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The lines</h3>${mixPool.map((q, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${k + 1}.</b> “${esc(clamp(q.q, 72))}”</div>`).join('')}</div>
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The voices</h3>${right.map((r, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${String.fromCharCode(65 + k)}.</b> ${esc(r.a)}</div>`).join('')}</div></div>
        <div class="kick" style="margin-top:.16in">Your turn</div>
        <p style="font-size:9.4pt;color:var(--muted);margin:.03in 0 .08in">Write a line of your own. Sign it. Date it. Future-you will want proof.</p>
        <div><div class="bb-writeline"></div><div class="bb-writeline"></div><div class="bb-writeline"></div></div>
        ${foot(vol, folio.n++)}</div>`);
    }
  }
  pages.push(...keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  return finish(vol, pages, { chapters: CH17.length, words: 240 });
}

/* ---------------- build all + copy lint + hub ---------------- */
fs.mkdirSync('books', { recursive: true });
const made = []; const used = new Set();
for (const vol of VOLS) { const chs = GEN.filter(ch => vol.pick(ch)); chs.forEach(ch => used.add(ch.title));
  made.push(buildCourse(vol, chs, CS, ch => GEN.indexOf(ch))); }
if (GEN.filter(ch => !used.has(ch.title)).length) { console.error('UNASSIGNED GENERAL CHAPTERS'); process.exit(1); }
const advUsed = new Set();
for (const vol of AVOLS) { vol.chapters.forEach(ch => advUsed.add(ch.title));
  made.push(buildCourse(vol, vol.chapters, window.SB_ADV_CSCRIPT || {}, ch => ADV.indexOf(ch))); }
if (advUsed.size !== ADV.length) { console.error('ADV coverage', advUsed.size, '/', ADV.length); process.exit(1); }
made.push(book16()); made.push(book17());

/* copy lint (handover §7) over authored copy — scan all output, report data-source hits */
const BANNED = /\b(delve|unleash|leverage|utilize|furthermore|robust|seamless|elevate)\b|in today.s world/i;
let lintHits = 0;
for (const m of made) { const html = fs.readFileSync(`books/book-${String(m.vol.n).padStart(2, '0')}.html`, 'utf8');
  const found = html.match(new RegExp(BANNED.source, 'gi')) || [];
  if (found.length) { lintHits += found.length; console.log(`lint: book-${m.vol.n}:`, [...new Set(found.map(x => x.toLowerCase()))].join(', ')); } }
console.log('copy-lint total hits (incl. data text):', lintHits);

const cards = made.map(m => { const id = String(m.vol.n).padStart(2, '0');
  return `<div class="bk" style="background:linear-gradient(160deg,${m.vol.a},${m.vol.d})">
  <svg viewBox="0 0 120 120">${AV[m.vol.av] || ''}</svg>
  <b>Vol. ${m.vol.n} — ${esc(m.vol.title)}</b><span>${esc(m.vol.tag)}</span><span>${m.pages} pages</span>
  <div class="links"><a href="book-${id}.html">Read</a><a href="pdf/book-${id}.pdf">PDF</a></div></div>`; }).join('');
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
<p class="lead">Seventeen graphic study books on the Claude Design system — comic chapter openers, Vex the villain,
practice hives with real write-in drills, puzzles made of each chapter's own words, and two collections.</p>
<div class="canva"><b>Getting a book into Canva:</b> download the PDF, then in Canva choose <b>Create a design → Import file</b>
(or drag the PDF onto Canva's home page). Every page becomes an editable design. The HTML is the print master.</div>
<div class="grid">${cards}</div>
<p style="font-size:12px;color:#8b83a3;margin-top:26px">Bizzing Bee · independent study material · not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</p>
</main></body></html>`;
fs.writeFileSync('books/index.html', hub);
made.forEach(m => console.log(`Vol.${String(m.vol.n).padStart(2)} ${m.vol.title.padEnd(24)} ${String(m.pages).padStart(4)} pages`));
console.log('total pages:', made.reduce((a, m) => a + m.pages, 0));
