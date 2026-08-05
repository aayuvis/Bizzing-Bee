/* Bizzing Bee Library v5 — the anime edition.
   Built on the Claude Design system handover PLUS the BB ANIME module
   (design-system/bb-anime.js): every avatar in the 211-strong collection can
   now walk on stage as a rim-lit, backlit anime figure inside painterly
   keyframe scenes. The register dial (1→3) matures the books as the reader
   grows: bright chibi daylight in Vol. 1, golden-hour grounding mid-series,
   letterboxed dusk cinema in the advanced volumes — and the voice matures with
   it. Type is sized for kids (14.5pt body in the general band). Content grew:
   checkpoint quizzes lifted from the Word Map curriculum, sound-trap boxes,
   a cast page up front and a full-cast poster at the back of every volume.
   Outputs books/book-01..17.html + books/index.html. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('concepts-data.js', 'utf8'));
eval(fs.readFileSync('adv-concepts-data.js', 'utf8'));
eval(fs.readFileSync('concept-scripts.js', 'utf8'));
eval(fs.readFileSync('avatars-art.js', 'utf8'));
eval(fs.readFileSync('avatars.js', 'utf8'));
eval(fs.readFileSync('avatar-cards.js', 'utf8'));
eval(fs.readFileSync('quotes-lib.js', 'utf8'));
eval(fs.readFileSync('figurative-data.js', 'utf8'));
eval(fs.readFileSync('sounds-data.js', 'utf8'));
eval(fs.readFileSync('trail-data.js', 'utf8'));
eval(fs.readFileSync('books/design-system/bb-anime.js', 'utf8'));
let ADVS = {};
try { const src = fs.readFileSync('adv-concepts-data.js', 'utf8'); ADVS = window.SB_ADV_CSCRIPT || {}; } catch (e) {}
const GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
const CS = window.SB_CSCRIPT || {}, AV = window.SB_AVATAR_ART;
const QUOTES = window.SB_QUOTES, FIG = window.SB_FIG, IPA = window.SB_IPA || {};
const ANIME = window.BB_ANIME;
const CAST_DB = window.SB_AVATARS;

/* Word Map curriculum quizzes: chapter index (gi / ai) → the unit's authored
   concept questions. c[0] is always the correct answer (shuffled at render). */
const QS_GEN = {}, QS_ADV = {};
try { for (const u of SB_TRAIL.honey.units) if (u.gi >= 0 && u.qs && u.qs.length) QS_GEN[u.gi] = u.qs; } catch (e) {}
try { for (const u of SB_TRAIL.expedition.units) if (u.ai >= 0 && u.qs && u.qs.length) QS_ADV[u.ai] = u.qs; } catch (e) {}

/* Homophone partners for the sound-trap box: word → its sound-twins */
const HOMX = (() => { const m = Object.create(null);
  try { for (const grp of window.SB_HOM) for (const w of grp) { const k = String(w).toLowerCase();
    (m[k] = m[k] || []).push(...grp.filter(x => x !== w)); } } catch (e) {}
  return m; })();

/* ---------------- the cast: the whole collection reports for duty ----------------
   Each volume drafts a crew of nine from the packs that suit its world, spreading
   picks across the 200+ avatars with art so the series uses (nearly) everyone. */
const WORLD_PACKS = {
  meadow: ['hive', 'critter', 'enchanted', 'wildhearts'], library: ['legends', 'worldchangers', 'origami'],
  forum: ['legends', 'gods', 'worldchangers'], elements: ['elements', 'cosmos', 'gods'],
  stage: ['stage', 'vibe', 'arcade'], engine: ['lab', 'turbo', 'arcade'],
  origami: ['origami', 'dojo', 'elements'], strait: ['serpent', 'bigbeasts', 'critter', 'wildhearts'],
  junkyard: ['villains', 'arcade', 'turbo'], vibe: ['vibe', 'stage', 'cosmos'],
  warfield: ['dojo', 'turbo', 'villains', 'legends'], greysea: ['cosmos', 'serpent', 'enchanted'],
};
const castUsed = new Set();
function draftCast(vol) {
  const rnd = mulberry(vol.n * 271 + 11);
  const packs = WORLD_PACKS[vol.world] || ['hive'];
  const pool = (CAST_DB.list || []).filter(a => AV[a.id] && a.id !== vol.av && packs.includes(a.pack));
  const fresh = pool.filter(a => !castUsed.has(a.id));
  const picks = shuf(fresh.slice(), rnd).slice(0, 9);
  for (const a of shuf(pool.slice(), rnd)) { if (picks.length >= 9) break; if (!picks.includes(a)) picks.push(a); }
  picks.forEach(a => castUsed.add(a.id));
  return picks;
}
const castName = id => { try { return (CAST_DB.byId[id] || {}).name || (NAMES[id] || id); } catch (e) { return NAMES[id] || id; } };

/* ---- generated-art drop zone (Nano Banana pipeline) ----
   Drop a PNG into books/art/ with the right slug and the next build swaps that
   slot's SVG for the image; slots without art keep the BB ANIME engine.
   Slugs: b01-cover · b01-divider · b01-poster · b01-ch01-opener ·
   strip-<world>-r<register> (e.g. strip-meadow-r1). */
const ART_DIR = 'books/art';
const artAt = slug => { try { for (const ext of ['jpg', 'png']) if (fs.existsSync(`${ART_DIR}/${slug}.${ext}`)) return `art/${slug}.${ext}`; } catch (e) {} return null; };
const artImg = (src, extra) => `<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover${extra || ''}" alt="">`;

/* Register: how grown-up this volume looks and sounds. */
const REG = vol => vol.band === 'advanced' || vol.n === 17 ? 3 : vol.n <= 4 ? 1 : 2;

/* The app's avatar cards: real titles, lore, powers and facts — the cast's voices. */
const CARD = id => { try { return SB_AV_CARD(id); } catch (e) { return null; } };

/* Bizzy is the hero of every book; the volume guide co-stars. */
const HERO = 'bizzy';

/* Chapters travel: each chapter of a volume visits the next world on the ring,
   starting from the volume's home world. */
const WORLD_CYCLE = ['meadow', 'library', 'forum', 'elements', 'engine', 'origami', 'strait', 'junkyard', 'vibe', 'stage', 'warfield', 'greysea'];
const chWorldOf = (vol, ci) => WORLD_CYCLE[(Math.max(0, WORLD_CYCLE.indexOf(vol.world)) + ci) % WORLD_CYCLE.length];
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
const NAMES = { bizzy: 'Bizzy', honeypot: 'Honeypot', waggle: 'Waggle', bumble: 'Bumble', star: 'Star', diva: 'Diva', drone: 'Drone', clover: 'Clover', nectar: 'Nectar', lumen: 'Lumen', jester: 'Jester', queenhive: 'Queen Hive', blossom: 'Blossom', propolis: 'Propolis', mic: 'Mic', maestro: 'Maestro', popcorn: 'Popcorn', melody: 'Melody' };
/* Inline characters use the app's painted avatar art (avatars/<id>.png) framed in
   a soft bokeh disc tinted from that character's own palette; anything not yet
   painted falls back to the drawn SVG portrait. Books sit one level down, hence
   ../avatars/. Vex keeps his own book design — the drawn moth. */
let _pk = 0;
const avaPng = id => { try { return fs.existsSync(`avatars/${id}.png`) ? `../avatars/${id}.png` : null; } catch (e) { return null; } };
function paintedPortrait(id, size, extra) {
  const src = avaPng(id);
  if (!src) return ANIME.portrait(id, size, { style: extra || '', k: 'a' + (_pk++) });
  let pal = { a: '#F0B429', b: '#6C4FE0', glow: '#FFE9AE' };
  try { pal = ANIME.palette(id); } catch (e) {}
  return `<span style="display:inline-grid;place-items:center;width:${size};height:${size};flex-shrink:0;border-radius:50%;
      background:radial-gradient(circle at 34% 28%, ${ANIME.mix(pal.glow || pal.a, '#FFFFFF', .45)}, ${ANIME.rgba(pal.a, .55)} 62%, ${ANIME.mix(pal.b, '#241E33', .3)});
      box-shadow:inset 0 0 0 1.5pt rgba(255,255,255,.5), 0 2pt 6pt rgba(26,18,54,.22);overflow:hidden${extra || ''}">
      <img src="${src}" alt="" style="width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 2px 3px rgba(20,14,44,.3))"></span>`;
}
const avatar = (id, size, extra) => paintedPortrait(id, size, extra);
const VEX = (size, extra) => ANIME.vex(size, { style: extra || '', k: 'v' + (_pk++) });
function texture(tex) {
  const S = 'stroke="rgba(255,255,255,.16)" stroke-width="2" fill="none"';
  if (tex === 'rings') return `<circle cx="82%" cy="18%" r="70" ${S}/><circle cx="82%" cy="18%" r="110" ${S}/><circle cx="82%" cy="18%" r="150" ${S}/><circle cx="10%" cy="92%" r="60" ${S}/><circle cx="10%" cy="92%" r="95" ${S}/>`;
  if (tex === 'stripes') return [0, 1, 2, 3, 4, 5].map(i => `<path d="M${-80 + i * 90} 620 L${240 + i * 90} -40" stroke="rgba(255,255,255,.08)" stroke-width="14" fill="none"/>`).join('');
  if (tex === 'dots') { let d2 = ''; for (let y = 0; y < 8; y++) for (let x = 0; x < 6; x++) d2 += `<circle cx="${8 + x * 18}%" cy="${5 + y * 13}%" r="4" fill="rgba(255,255,255,.13)"/>`; return d2; }
  if (tex === 'grid') { let d2 = ''; for (let i = 1; i < 8; i++) d2 += `<path d="M${i * 12.5}% 0 V100%" ${S}/><path d="M0 ${i * 12.5}% H100%" ${S}/>`; return d2; }
  if (tex === 'diag') return [0, 1, 2, 3, 4, 5, 6].map(i => `<path d="M${-60 + i * 80} -40 L${140 + i * 80} 640" ${S}/>`).join('');
  return `<path d="M50% 0 V100% M0 50% H100%" stroke="rgba(255,255,255,.07)" stroke-width="30" fill="none"/>`;
}


/* ---------------- world scenery: one drawn scene per world, tied to the content ----------------
   Layered SVG over the volume gradient: far layer in translucent white, ground in deep accent,
   props in a small fixed palette that reads on any accent. Used full-bleed on covers and
   divider pages, and as a silhouette strip elsewhere. */
const WP = { sun:'#FFD66B', glow:'rgba(255,255,255,.85)', far:'rgba(255,255,255,.22)', mid:'rgba(255,255,255,.38)', dark:'rgba(20,12,40,.30)', ink:'rgba(20,12,40,.45)' };
function worldScene(world, W, H) {
  const gy = H * 0.8;
  const ground = `<path d="M0 ${gy} Q ${W*.22} ${gy-26} ${W*.5} ${gy} T ${W} ${gy} L ${W} ${H} L 0 ${H} Z" fill="${WP.dark}"/>`;
  const sun = (x,y,r)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${WP.sun}" opacity=".9"/><circle cx="${x}" cy="${y}" r="${r*1.7}" fill="${WP.sun}" opacity=".18"/>`;
  const cloud=(x,y,k)=>`<g fill="${WP.mid}"><ellipse cx="${x}" cy="${y}" rx="${44*k}" ry="${15*k}"/><ellipse cx="${x-26*k}" cy="${y+6*k}" rx="${26*k}" ry="${11*k}"/><ellipse cx="${x+30*k}" cy="${y+7*k}" rx="${30*k}" ry="${12*k}"/></g>`;
  const hill=(x,w,h,o)=>`<path d="M${x-w} ${gy} Q ${x} ${gy-h} ${x+w} ${gy} Z" fill="rgba(255,255,255,${o})"/>`;
  const path55=`<path d="M${W*.1} ${gy+34} Q ${W*.4} ${gy-70} ${W*.62} ${gy-140} T ${W*.95} ${gy-260}" stroke="${WP.glow}" stroke-width="3.5" stroke-dasharray="1 12" stroke-linecap="round" fill="none"/>`;
  const S = {
    meadow: ()=> sun(W*.82,H*.16,44)+cloud(W*.2,H*.14,1)+cloud(W*.55,H*.24,.7)+hill(W*.2,W*.4,120,.16)+hill(W*.8,W*.5,170,.1)
      +`<g>${[ .12,.3,.52,.7,.9 ].map((f,i)=>`<g transform="translate(${W*f} ${gy-4})"><line x1="0" y1="0" x2="0" y2="-26" stroke="${WP.glow}" stroke-width="3"/><circle cx="0" cy="-32" r="9" fill="${['#FF9EBB','#FFD66B','#B9A6FF','#9FE7D6','#FF9EBB'][i]}"/><circle cx="0" cy="-32" r="3.5" fill="#7A4C10"/></g>`).join('')}</g>`
      +`<g transform="translate(${W*.78} ${gy-58})"><rect x="-3" y="30" width="6" height="30" fill="${WP.ink}"/><ellipse cx="0" cy="6" rx="26" ry="10" fill="#F3B33C"/><ellipse cx="0" cy="18" rx="30" ry="11" fill="#E8A32B"/><ellipse cx="0" cy="30" rx="26" ry="10" fill="#D6931F"/><circle cx="0" cy="20" r="5" fill="#7A4C10"/></g>`+path55,
    library: ()=>`<g fill="${WP.far}">${[0,1,2].map(i=>`<rect x="${W*(.06+i*.34)}" y="${H*.1}" width="${W*.24}" height="${gy-H*.1}" rx="8"/>`).join('')}</g>`
      +`<g>${[0,1,2].map(i=>[0,1,2,3].map(j=>`<g transform="translate(${W*(.08+i*.34)} ${H*.16+j*(gy-H*.28)/4})">${[0,1,2,3,4].map(k=>`<rect x="${k*W*.042}" y="${Math.sin(i+j+k)*3}" width="${W*.03}" height="34" rx="3" fill="rgba(255,255,255,${.3+((i+j+k)%3)*.12})"/>`).join('')}<rect x="0" y="40" width="${W*.2}" height="5" rx="2" fill="${WP.mid}"/></g>`).join('')).join('')}</g>`
      +`<g transform="translate(${W*.5} ${H*.12}) rotate(8)"><rect x="-20" y="-14" width="40" height="28" rx="4" fill="${WP.glow}"/><line x1="0" y1="-14" x2="0" y2="14" stroke="${WP.dark}" stroke-width="2"/></g>`+path55,
    forum: ()=> sun(W*.16,H*.14,38)+`<g>${[.14,.32,.5,.68,.86].map(f=>`<g transform="translate(${W*f} 0)"><rect x="-16" y="${H*.24}" width="32" height="${gy-H*.24}" fill="${WP.far}"/><rect x="-24" y="${H*.22}" width="48" height="14" rx="4" fill="${WP.mid}"/><rect x="-24" y="${gy-12}" width="48" height="12" rx="3" fill="${WP.mid}"/>${[0,1,2].map(k=>`<line x1="${-8+k*8}" y1="${H*.26}" x2="${-8+k*8}" y2="${gy-16}" stroke="rgba(255,255,255,.14)" stroke-width="3"/>`).join('')}</g>`).join('')}</g>`
      +`<path d="M${W*.28} ${H*.2} Q ${W*.5} ${H*.1} ${W*.72} ${H*.2}" stroke="${WP.mid}" stroke-width="12" fill="none"/>`
      +`<g transform="translate(${W*.5} ${gy-26})"><path d="M-34 0 Q 0 -22 34 0" stroke="${WP.glow}" stroke-width="4" fill="none"/><path d="M-30 -2 l-6 -10 M30 -2 l6 -10" stroke="${WP.glow}" stroke-width="4" stroke-linecap="round"/></g>`+path55,
    elements: ()=>`<g fill="${WP.far}">${[[.15,.2,30],[.8,.14,24],[.62,.3,18],[.3,.4,14]].map(([f,g2,r])=>`<circle cx="${W*f}" cy="${H*g2}" r="${r}"/>`).join('')}</g>`
      +cloud(W*.7,H*.16,1.2)+`<path d="M${W*.7} ${H*.22} L ${W*.64} ${H*.38} L ${W*.7} ${H*.38} L ${W*.6} ${H*.56}" stroke="${WP.sun}" stroke-width="9" fill="none" stroke-linejoin="round" stroke-linecap="round"/>`
      +`<g>${[[.14,.5],[.32,.62],[.52,.5],[.86,.44]].map(([f,g2],i)=>`<g transform="translate(${W*f} ${H*g2}) rotate(${i*14-20})"><path d="M0 -22 L19 -11 L19 11 L0 22 L-19 11 L-19 -11 Z" fill="rgba(255,255,255,${.2+i*.07})"/></g>`).join('')}</g>`+path55,
    stage: ()=>`<path d="M0 0 L${W*.2} 0 Q ${W*.13} ${H*.3} ${W*.18} ${gy} L0 ${gy} Z" fill="${WP.dark}"/><path d="M${W} 0 L${W*.8} 0 Q ${W*.87} ${H*.3} ${W*.82} ${gy} L${W} ${gy} Z" fill="${WP.dark}"/>`
      +`<path d="M${W*.35} 0 L${W*.22} ${gy} L${W*.48} ${gy} Z" fill="rgba(255,246,214,.30)"/><path d="M${W*.65} 0 L${W*.52} ${gy} L${W*.78} ${gy} Z" fill="rgba(255,246,214,.30)"/>`
      +`<g transform="translate(${W*.5} ${gy-40})"><line x1="0" y1="0" x2="0" y2="40" stroke="${WP.glow}" stroke-width="5"/><circle cx="0" cy="-8" r="12" fill="${WP.glow}"/><rect x="-16" y="36" width="32" height="6" rx="3" fill="${WP.glow}"/></g>`
      +`<g fill="${WP.sun}">${[[.3,.2],[.72,.12],[.6,.3],[.24,.42],[.8,.4]].map(([f,g2])=>`<path transform="translate(${W*f} ${H*g2}) scale(.8)" d="M0 -10 L2.8 -3 L10 -3 L4.4 1.6 L6.6 9 L0 4.6 L-6.6 9 L-4.4 1.6 L-10 -3 L-2.8 -3 Z"/>`).join('')}</g>`,
    engine: ()=>{ const gear=(x,y,r,o)=>`<g transform="translate(${x} ${y})" fill="rgba(255,255,255,${o})">${[0,45,90,135].map(a2=>`<rect x="${-r-6}" y="-5" width="${2*r+12}" height="10" rx="3" transform="rotate(${a2})"/>`).join('')}<circle r="${r}"/><circle r="${r*.4}" fill="${WP.dark}"/></g>`;
      return gear(W*.2,H*.3,34,.3)+gear(W*.34,H*.42,22,.22)+gear(W*.78,H*.2,42,.26)+gear(W*.64,H*.5,18,.3)
      +`<path d="M0 ${H*.62} H ${W*.42} V ${H*.5}" stroke="${WP.far}" stroke-width="14" fill="none"/><path d="M${W} ${H*.66} H ${W*.6}" stroke="${WP.far}" stroke-width="14" fill="none"/>`
      +cloud(W*.48,H*.14,.7)+cloud(W*.6,H*.08,.5)+path55; },
    origami: ()=> sun(W*.84,H*.12,34)+`<g>${[[.18,190,.34],[.42,260,.22],[.68,210,.3],[.9,150,.24]].map(([f,h2,o])=>`<g transform="translate(${W*f} ${gy})"><path d="M${-h2*.7} 0 L0 ${-h2} L${h2*.7} 0 Z" fill="rgba(255,255,255,${o})"/><path d="M0 ${-h2} L${h2*.18} ${-h2*.55} L${-h2*.12} ${-h2*.4} Z" fill="${WP.glow}"/></g>`).join('')}</g>`
      +`<g transform="translate(${W*.3} ${H*.24}) rotate(-8)" fill="${WP.glow}"><path d="M0 0 L34 -12 L14 4 L44 14 L8 10 L-6 26 Z"/></g>`+path55,
    strait: ()=>{ const wave=(y,o)=>`<path d="M0 ${y} ${Array.from({length:8},(_,i)=>`Q ${W*(i+.5)/8} ${y-12} ${W*(i+1)/8} ${y}`).join(' ')}" stroke="rgba(255,255,255,${o})" stroke-width="4" fill="none"/>`;
      return sun(W*.2,H*.14,40)+cloud(W*.6,H*.12,.9)+wave(gy-40,.5)+wave(gy-16,.35)+wave(gy+14,.25)
      +`<g transform="translate(${W*.66} ${gy-52})"><path d="M0 40 L0 -34" stroke="${WP.glow}" stroke-width="5"/><path d="M0 -34 L46 6 L0 6 Z" fill="${WP.glow}"/><path d="M0 -20 L-30 4 L0 4 Z" fill="${WP.mid}"/><path d="M-22 40 Q 0 58 22 40 Z" fill="${WP.ink}"/></g>`
      +`<g transform="translate(${W*.12} ${gy-70})"><rect x="-8" y="0" width="16" height="70" fill="${WP.glow}"/><rect x="-8" y="14" width="16" height="12" fill="${WP.dark}"/><rect x="-8" y="40" width="16" height="12" fill="${WP.dark}"/><circle cx="0" cy="-6" r="9" fill="${WP.sun}"/></g>`
      +`<g stroke="${WP.glow}" stroke-width="3" fill="none">${[[.4,.3],[.48,.26],[.55,.32]].map(([f,g2])=>`<path d="M${W*f-10} ${H*g2} q 10 -8 20 0 M${W*f+10} ${H*g2} q 10 -8 20 0"/>`).join('')}</g>`; },
    junkyard: ()=>{ const mound=(x,w,h)=>`<path d="M${x-w} ${gy} Q ${x} ${gy-h} ${x+w} ${gy} Z" fill="${WP.far}"/>`;
      return mound(W*.2,W*.24,150)+mound(W*.6,W*.3,210)+mound(W*.9,W*.2,120)
      +`<circle cx="${W*.22}" cy="${gy-40}" r="26" fill="none" stroke="${WP.glow}" stroke-width="9"/>`
      +`<path d="M${W*.55} ${gy-140} q 14 -18 28 0 q 14 18 28 0" stroke="${WP.glow}" stroke-width="6" fill="none"/>`
      +`<rect x="${W*.66}" y="${gy-90}" width="52" height="40" rx="6" fill="${WP.mid}" transform="rotate(-8 ${W*.66} ${gy-90})"/>`
      +`<g transform="translate(${W*.84} ${H*.18})"><line x1="0" y1="0" x2="0" y2="70" stroke="${WP.glow}" stroke-width="5"/><path d="M-24 70 Q 0 96 24 70 Z" fill="#E8546A"/></g>`+path55; },
    vibe: ()=>`<g fill="none">${[[.2,.24],[.75,.2],[.5,.5],[.14,.6]].map(([f,g2],i)=>`<g transform="translate(${W*f} ${H*g2})">${[26,17,8].map(r=>`<circle r="${r}" stroke="rgba(255,255,255,${.24+i*.05})" stroke-width="5"/>`).join('')}</g>`).join('')}</g>`
      +`<path d="M0 ${H*.36} Q ${W*.25} ${H*.28} ${W*.5} ${H*.38} T ${W} ${H*.3}" stroke="${WP.mid}" stroke-width="10" fill="none"/>`
      +`<path d="M0 ${H*.52} Q ${W*.3} ${H*.6} ${W*.6} ${H*.5} T ${W} ${H*.56}" stroke="${WP.far}" stroke-width="16" fill="none"/>`
      +`<g fill="${WP.sun}">${[[.3,.16],[.62,.4],[.85,.6],[.4,.66]].map(([f,g2])=>`<circle cx="${W*f}" cy="${H*g2}" r="6"/>`).join('')}</g>`+path55,
    warfield: ()=>`<g>${[.18,.5,.82].map((f,i)=>`<g transform="translate(${W*f} ${gy-8})"><line x1="0" y1="0" x2="0" y2="-${120+i*30}" stroke="${WP.glow}" stroke-width="5"/><path d="M0 -${120+i*30} L54 -${104+i*30} L0 -${88+i*30} Z" fill="${i===1?'#F0B429':'rgba(255,255,255,.5)'}"/></g>`).join('')}</g>`
      +`<path d="M${W*.35} ${gy} L${W*.5} ${gy-70} L${W*.65} ${gy} Z" fill="${WP.far}"/>`
      +`<path d="M${W*.5} 0 L${W*.38} ${gy-70} L${W*.62} ${gy-70} Z" fill="rgba(255,246,214,.25)"/>`+path55,
    greysea: ()=>{ const fog=(y,o)=>`<ellipse cx="${W*.5}" cy="${y}" rx="${W*.62}" ry="26" fill="rgba(255,255,255,${o})"/>`;
      return fog(H*.3,.18)+fog(H*.44,.24)+fog(H*.58,.3)+fog(gy-16,.36)
      +`<g transform="translate(${W*.8} ${gy-90}) "><rect x="-9" y="0" width="18" height="90" fill="${WP.mid}"/><circle cx="0" cy="-8" r="10" fill="${WP.sun}" opacity=".65"/><path d="M0 -8 L-70 -34 L-70 18 Z" fill="rgba(255,214,107,.14)"/></g>`
      +`<path d="M0 ${gy-30} ${Array.from({length:6},(_,i)=>`Q ${W*(i+.5)/6} ${gy-42} ${W*(i+1)/6} ${gy-30}`).join(' ')}" stroke="rgba(255,255,255,.3)" stroke-width="4" fill="none"/>`
      +`<text x="${W*.24}" y="${H*.4}" font-size="60" fill="rgba(255,255,255,.28)" font-family="Georgia" font-style="italic">ə</text><text x="${W*.5}" y="${H*.26}" font-size="38" fill="rgba(255,255,255,.2)" font-family="Georgia" font-style="italic">ə</text>`; },
  };
  const fn = S[world] || S.meadow;
  return `<g>${fn()}</g>${ground}`;
}
function letterTiles(word, W, H, seed) {
  const rnd = mulberry(seed); const letters = String(word).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 6).split('');
  return letters.map((L, i) => { const x = W * (.1 + .8 * (i / Math.max(1, letters.length - 1)) + (rnd() - .5) * .06);
    const y = H * (.3 + (rnd() - .5) * .16); const r = (rnd() - .5) * 26;
    return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-17" y="-17" width="34" height="34" rx="8" fill="rgba(255,255,255,.9)"/><text x="0" y="8" text-anchor="middle" font-family="'BB Display'" font-size="22" fill="#241E33">${L}</text></g>`; }).join('');
}
const WORLD_NAME = { meadow: 'the Meadow', library: 'the Great Library', forum: 'the Roman Forum', elements: 'the Storm of Elements', stage: 'the Big Stage', engine: 'the Engine Room', origami: 'the Paper Mountains', strait: 'the Wide Strait', junkyard: 'the Word Junkyard', vibe: 'the Vibe', warfield: 'the Proving Ground', greysea: 'the Grey Sea' };
const WORLD_BLURB = {
  1: 'Every champion started in the Meadow — first words, first stings, first wins.',
  2: 'The Great Library holds every rule English ever wrote down. Waggle has the keys.',
  3: 'Every column in the Forum holds up a prefix. Learn one, and a hundred words stand.',
  4: 'Greek blows in like weather — catch the bolts and the words light up.',
  5: 'Endings decide everything under the spotlight. This is where words take a bow.',
  6: 'Roots are machine parts. In the Engine Room, Drone shows you how they fit.',
  7: 'Greek roots fold together like paper — crease by crease, a word takes shape.',
  8: 'Words sailed here from everywhere. The Strait is where they came ashore.',
  9: 'Everything ever made ends up in the Junkyard — and every pile has a name.',
  10: 'Some words have moods. The Vibe is where they let it show.',
  11: 'The Proving Ground: where bee-day plans are drilled until they hold.',
  12: 'The Grey Sea is fog as far as you can hear. The schwa hides in it. Blossom does not get lost.',
  13: 'Back to the Junkyard — this time for the letters that lie, double and vanish.',
  14: 'Past the lighthouse lies every language the big four forgot. Mic has the map.',
  15: 'The Engine Room again, belts humming — this is where English bolts words together.',
  16: 'A picnic in the Meadow with every simile we own. Bring an appetite.',
  17: 'The Big Stage, house lights down. Two hundred and forty voices worth hearing.',
};

/* ---------------- CSS: tokens-book + KID-SIZED type scale + class contracts ----------------
   v5: body text grew a full size band (kids were squinting), and the comic ink-box
   panels became .an-panel anime scene cards — full-bleed keyframe art with a
   subtitle caption, no hard borders. Register 3 squares the corners and dims the
   palette; register 1 keeps everything round and bright. */
/* One display face per world — the app's own WORLD_HERO font schema, carried
   into print. Headings and cover titles wear the volume's world face; body,
   kicker and tile faces never move (Hanken / Fredoka / Sono). */
const WORLD_FACE = {
  meadow: ['Fredoka', 'fredoka-600'], library: ['Fraunces', 'fraunces-800'], forum: ['Fraunces', 'fraunces-800'],
  elements: ['Comfortaa', 'comfortaa-700'], engine: ['Quicksand', 'quicksand-700'], origami: ['Fredoka', 'fredoka-600'],
  strait: ['Baloo 2', 'baloo2-800'], junkyard: ['Bungee', 'bungee-400'], vibe: ['Righteous', 'righteous-400'],
  stage: ['Righteous', 'righteous-400'], warfield: ['Bangers', 'bangers-400'], greysea: ['Fraunces', 'fraunces-800'],
};
function css(vol) {
  const reg = REG(vol);
  const bodyPt = vol.band === 'advanced' ? '13pt' : '15pt';
  const bodyLh = vol.band === 'advanced' ? '19.5pt' : '22.5pt';
  const lineH = vol.band === 'advanced' ? '.34in' : '.42in';
  const panelR = reg >= 3 ? '6pt' : '16pt';
  const [wf, wfFile] = WORLD_FACE[vol.world] || WORLD_FACE.meadow;
  return `
  @font-face{font-family:'BB Display';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:400 900}
  @font-face{font-family:'BB World';src:url('../fonts/${wfFile}.woff2') format('woff2');font-weight:400 900}
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
  h1,h2,.coverTitle{font-family:'BB World','BB Display';font-weight:800}
  h3,.disp{font-family:'BB Display';font-weight:800}
  .kick{font-family:'BB Kicker';font-weight:600;font-size:10pt;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-deep)}
  .worldchip{display:inline-flex;align-items:center;gap:5pt;background:rgba(255,255,255,.75);border:1px solid var(--hairline);border-radius:999px;padding:2.5pt 10pt;font-family:'BB Kicker';font-size:8.6pt;color:var(--accent-deep)}
  .coverTitle{font-family:'BB World','BB Display';font-weight:800;color:#fff;letter-spacing:.01em;
    -webkit-text-stroke:2.6pt var(--accent-deep);paint-order:stroke fill;
    text-shadow:0 5px 0 rgba(20,12,40,.45),0 12px 28px rgba(0,0,0,.4)}
  .coverTitle .ln2{display:block;color:#FFE9AE}
  .worldband{position:absolute;left:.5in;right:.5in;bottom:.52in;height:1.25in;opacity:.97;border-radius:12pt;overflow:hidden;box-shadow:0 4pt 14pt rgba(26,18,54,.22)}
  .worldband svg{position:absolute;inset:0;width:100%;height:100%}
  .worldband .wl{position:absolute;left:10pt;bottom:6pt;font-family:'BB Kicker';font-size:8.6pt;letter-spacing:.1em;text-transform:uppercase;color:rgba(255,255,255,.95);text-shadow:0 1px 4px rgba(0,0,0,.5)}
  .peek{position:absolute;pointer-events:none}
  .tile{font-family:'BB Tile';font-weight:600;color:var(--muted)}
  .bb-head{position:absolute;top:.3in;left:.75in;right:.5in;display:flex;justify-content:space-between;align-items:baseline;
    font-family:'BB Kicker';font-size:10pt;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--hairline);padding-bottom:4pt}
  .page[data-verso] .bb-head{left:.5in;right:.75in}
  .bb-foot{position:absolute;bottom:.28in;left:.75in;right:.5in;display:flex;justify-content:space-between;
    font-family:'BB Kicker';font-size:10pt;color:var(--muted)}
  .page[data-verso] .bb-foot{left:.5in;right:.75in}
  .bb-panelbox{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-panel);padding:.12in .15in;box-shadow:var(--sh-screen)}
  .bb-bigidea{padding:.06in .85in .06in .44in;max-height:1.9in;overflow:hidden;position:relative;font-size:13.5pt;line-height:1.56}
  .bb-bigidea:before{content:'“';position:absolute;left:0;top:-.12in;font-family:'BB Display';font-size:44pt;color:var(--accent)}
  .bb-bigidea .cameo{position:absolute;right:.06in;top:50%;transform:translateY(-50%) rotate(4deg)}
  .bb-promove{background:var(--ink);color:#F4EFFF;border-radius:var(--r-panel);padding:.16in .18in;max-height:2.9in;overflow:hidden;
    font-size:10.8pt;line-height:1.5}
  .bb-promove b{color:var(--treasure)}
  .bb-promove .ln{margin:0 0 5.5pt;padding-left:.14in;text-indent:-.14in}
  .bb-promove .ln:last-child{margin-bottom:0}
  .bb-promove .trick{margin:0 0 7pt;padding:0;text-indent:0}
  .bb-promove .trick,.bb-promove [class]{font-family:'BB Display';font-size:12pt;letter-spacing:.04em}
  .bb-sticky{display:grid;grid-template-columns:1fr 1fr;gap:.14in;margin-top:.16in}
  .bb-sticky .card{background:var(--tint);border-radius:3pt 3pt 12pt 3pt;padding:.12in .14in;box-shadow:2pt 3pt 6pt rgba(36,30,51,.10)}
  .bb-sticky .card:nth-child(odd){transform:rotate(-.5deg)} .bb-sticky .card:nth-child(even){transform:rotate(.4deg);background:color-mix(in srgb,var(--treasure) 12%,white)}
  .bb-sticky h3{font-size:11.2pt;color:var(--accent-deep);margin-bottom:4.5pt}
  .bb-sticky p{font-size:10pt;line-height:1.46}
  /* v5 anime storyboard: full-bleed keyframe scenes with a subtitle caption —
     no ink boxes. Register 1 keeps a slight playful tilt; register 3 is level. */
  .an-strip{display:grid;gap:.12in;margin-top:.12in}
  .an-panel{position:relative;border-radius:${panelR};overflow:hidden;min-height:3.05in;box-shadow:0 5pt 16pt rgba(26,18,54,.28);background:#241E33}
  ${reg === 1 ? '.an-strip .an-panel:nth-child(odd){transform:rotate(-.5deg)} .an-strip .an-panel:nth-child(even){transform:rotate(.4deg)}' : ''}
  .an-panel svg.scene{position:absolute;inset:0;width:100%;height:100%}
  .an-cap{position:absolute;left:.09in;right:.09in;bottom:.09in;background:rgba(255,255,255,.93);border-radius:${reg >= 3 ? '4pt' : '10pt'};
    padding:5pt 9pt;font-family:'BB Display';font-size:${vol.band === 'advanced' ? '10.6pt' : '11.5pt'};line-height:1.3;box-shadow:0 2pt 8pt rgba(26,18,54,.3)}
  .an-cap .nm{display:block;font-family:'BB Kicker';font-size:8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--accent-deep);margin-bottom:1pt}
  /* comic speech balloons: sit BESIDE the speaker, with a tail pointing at them */
  .an-bub{position:absolute;background:#fff;border:1.6pt solid var(--ink);border-radius:16pt;padding:7pt 11pt;
    font-family:'BB Display';font-size:${vol.band === 'advanced' ? '10.4pt' : '11.4pt'};line-height:1.34;
    box-shadow:0 3pt 10pt rgba(26,18,54,.28);transform:translateY(-50%)}
  .an-bub .nm{display:block;font-family:'BB Kicker';font-size:8pt;letter-spacing:.09em;text-transform:uppercase;
    color:var(--accent-deep);margin-bottom:2.5pt}
  .an-bub .tail,.an-bub .tail i{position:absolute;top:50%;width:0;height:0;border-style:solid}
  .an-bub.r .tail{right:-11pt;margin-top:-8pt;border-width:8pt 0 8pt 11pt;border-color:transparent transparent transparent var(--ink)}
  .an-bub.r .tail i{right:2.4pt;margin-top:-6.2pt;border-width:6.2pt 0 6.2pt 8.5pt;border-color:transparent transparent transparent #fff}
  .an-bub.l .tail{left:-11pt;margin-top:-8pt;border-width:8pt 11pt 8pt 0;border-color:transparent var(--ink) transparent transparent}
  .an-bub.l .tail i{left:2.4pt;margin-top:-6.2pt;border-width:6.2pt 8.5pt 6.2pt 0;border-color:transparent #fff transparent transparent}
  .an-sfx{position:absolute;top:.08in;right:.1in;font-family:'BB Display';font-size:${reg >= 3 ? '10pt' : '14pt'};letter-spacing:.05em;
    color:#fff;text-shadow:0 2px 0 rgba(0,0,0,.35),0 5px 12px rgba(0,0,0,.4);transform:rotate(-3deg)}
  .an-prop{position:absolute;top:.08in;left:.1in;background:rgba(20,14,44,.66);color:#FFE9AE;border-radius:8pt;padding:2.5pt 8pt;font-family:'BB Tile';font-size:9.6pt}
  .bb-prop{display:inline-block;background:var(--chip);color:var(--chip-ink);border-radius:8pt;padding:3pt 8pt;font-family:'BB Tile';font-size:10pt}
  .bb-bubble{background:var(--card);border:1px solid var(--hairline);border-radius:12pt;padding:6pt 10pt;font-family:'BB Display';font-size:11.5pt;line-height:1.35;box-shadow:var(--sh-screen)}
  .bb-hive{display:grid;grid-template-columns:1fr 1fr;gap:.12in}
  .bb-card{padding:0 .04in;max-height:1.95in;overflow:hidden}
  .bb-card .ex{font-size:9.6pt;line-height:1.32;margin-top:2px;color:var(--ink);opacity:.85}
  .bb-card .w{font-family:'BB Body';font-weight:800;font-size:23pt;line-height:1.05;font-variant-numeric:tabular-nums;color:var(--accent-deep)}
  .bb-card .say{font-family:'BB Tile';font-size:10pt;color:var(--muted);margin-top:1px}
  .bb-card .d{font-size:10.6pt;line-height:1.38;margin-top:2px}
  .bb-card .hook{font-size:9.8pt;line-height:1.32;margin-top:2px;color:var(--chip-ink);font-style:italic}
  .bb-writeline{border-bottom:1pt solid var(--ink);height:${lineH};margin-top:4pt}
  .bb-rapid{display:grid;grid-template-columns:1fr 1fr;gap:.08in .16in}
  .bb-row{padding:3.5pt 0;min-height:.5in;max-height:.6in;overflow:hidden;font-size:10.8pt;line-height:1.34;border-bottom:1px dotted var(--hairline)}
  .bb-row b{font-family:'BB Kicker';color:var(--accent-deep)}
  .bb-break{margin-top:.18in;display:flex;gap:.13in;align-items:flex-start;background:linear-gradient(90deg,var(--treasure-tint),transparent 85%);border-left:4pt solid var(--treasure);border-radius:2pt 14pt 14pt 2pt;padding:.08in .13in;max-height:2.3in;overflow:hidden}
  .bb-break .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--treasure-deep)}
  .bb-break .b{font-size:11.2pt;line-height:1.4;margin-top:2px}
  .bb-break .t{font-size:10pt;color:var(--muted);margin-top:2px}
  .bb-check{border-left:4pt solid var(--right);padding:.07in .12in .07in .14in;max-height:1.4in;overflow:hidden}
  .bb-check .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--right-deep);margin-bottom:3.5pt}
  .bb-vex{background:linear-gradient(90deg,#FFF1F3,transparent 88%);border-left:4pt solid var(--tricky);border-radius:2pt 12pt 12pt 2pt;padding:.07in .12in .07in .14in;max-height:1.4in;overflow:hidden;display:flex;gap:.12in;align-items:flex-start}
  .bb-vex .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--tricky-deep);margin-bottom:3.5pt}
  .bb-trap{background:var(--listen-tint);border-left:4pt solid var(--listen);border-radius:2pt 12pt 12pt 2pt;padding:.07in .12in .07in .14in;max-height:1.4in;overflow:hidden}
  .bb-trap .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--listen-deep);margin-bottom:3.5pt}
  .bb-quiz{counter-reset:q}
  .bb-quiz .q{margin-bottom:.16in;break-inside:avoid}
  .bb-quiz .q .qq{font-family:'BB Display';font-size:12pt;line-height:1.34;margin-bottom:3pt}
  .bb-quiz .q .opt{display:flex;gap:6pt;align-items:baseline;font-size:10.6pt;line-height:1.42;padding:1.5pt 0}
  .bb-quiz .q .opt i{font-style:normal;font-family:'BB Kicker';color:var(--accent-deep);width:.18in;flex-shrink:0}
  .bb-audio{display:inline-flex;align-items:center;gap:5pt;background:var(--listen-tint);border:1px solid var(--listen);color:var(--listen-deep);
    border-radius:999px;padding:3pt 10pt;font-family:'BB Kicker';font-size:9.2pt;max-height:.3in}
  .bb-xword{border-collapse:collapse;margin:0 auto}
  .bb-xword td{width:.32in;height:.32in;position:relative}
  .bb-xword .c{background:var(--card);border:1.4px solid var(--chip-ink)}
  .bb-xword .c i{position:absolute;top:1px;left:2px;font-style:normal;font-size:5.4pt;color:var(--muted)}
  .bb-clues{display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:10.2pt;line-height:1.44}
  .bb-clues h3{font-size:11.5pt;color:var(--accent-deep);margin-bottom:2pt}
  .bb-clues b{color:var(--chip-ink)}
  .bb-search{border-collapse:collapse;margin:0 auto}
  .bb-search td{width:.38in;height:.38in;text-align:center;font-family:'BB Tile';font-size:11pt;background:var(--card);border:1px solid var(--hairline)}
  .bb-scramble{display:grid;grid-template-columns:1fr 1fr;gap:.16in;max-height:none}
  .bb-scramble .g1{padding:.05in .02in;margin-bottom:.08in}
  .bb-scramble .gw{font-family:'BB Tile';font-size:11pt;letter-spacing:.14em;color:var(--accent-deep)}
  .bb-biglist{columns:3;column-gap:.2in;font-size:10.8pt;line-height:.33in}
  .bb-biglist div{break-inside:avoid}
  .bb-biglist span{display:inline-block;width:.13in;height:.13in;border:1.4px solid var(--accent);border-radius:50%;margin-right:4pt;vertical-align:-1.5pt;background:var(--card)}
  .bb-key{columns:2;column-gap:.24in;font-size:11pt;line-height:1.5;color:var(--ink)}
  .bb-badge{display:flex;gap:.08in;align-items:center;max-height:.7in}
  .bb-badge .b1{width:.5in;height:.5in;border-radius:12pt;border:1.6pt dashed var(--accent);display:grid;place-items:center;font-family:'BB Display';font-size:9pt;color:var(--accent-deep);background:var(--card)}
  .chip{display:inline-block;background:var(--chip);color:var(--chip-ink);font-weight:700;font-size:9pt;border-radius:999px;padding:2pt 9pt}
  `;
}

/* running head/foot; folio counts every page after the cover */
const head = (vol, ch, ci, ptype) => ch ? `<div class="bb-head"><span>Chapter ${ci + 1} · ${esc(clamp(ch.title, 46))}</span><span>${esc(ptype)} · ${'★'.repeat(vol.band === 'advanced' ? 3 : (/hard/i.test(ch.difficulty || '') ? 3 : /medium/i.test(ch.difficulty || '') ? 2 : 1))}${'☆'.repeat(3 - (vol.band === 'advanced' ? 3 : (/hard/i.test(ch.difficulty || '') ? 3 : /medium/i.test(ch.difficulty || '') ? 2 : 1)))}</span></div>`
  : `<div class="bb-head"><span>${esc(vol.title)}</span><span>${esc(ptype)}</span></div>`;
const foot = (vol, folio) => `<div class="bb-foot"><span>Bizzing Bee · ${esc(vol.title)}</span><span>${folio}</span></div>`;

/* Bee Break: per-volume cursors, no repeats inside a book.
   Four kinds now — the fourth hands the margin to a cast member's true fact,
   pulled from the app's avatar cards. */
function makeBreaks(vol, cast) {
  const rq = mulberry(vol.n * 131 + 7), rs = mulberry(vol.n * 131 + 8), ri = mulberry(vol.n * 131 + 9);
  const q = shuf(QUOTES.filter(x => x.q.length < 120).slice(), rq);
  const s = shuf(FIG.similes.filter(x => (x.p + x.m).length < 140).slice(), rs);
  const i = shuf(FIG.idioms.filter(x => (x.p + x.m).length < 140).slice(), ri);
  const facts = (cast || []).map(a => ({ a, cd: CARD(a.id) })).filter(x => x.cd && x.cd.fact && x.cd.fact.length < 220);
  let qi = 0, si = 0, ii = 0, fi = 0, k = 0;
  return () => {
    const kind = (k++) % (facts.length ? 4 : 3);
    if (kind === 0) { const x = q[qi++ % q.length]; return `<div class="bb-break"><span style="font-size:13pt">💬</span><div><div class="l">Bee Break · someone said it better</div><div class="b">“${esc(x.q)}”</div><div class="t">— ${esc(x.a)}${x.who ? ', ' + esc(x.who) : ''}</div></div></div>`; }
    if (kind === 1) { const x = s[si++ % s.length]; return `<div class="bb-break"><span style="font-size:13pt">✨</span><div><div class="l">Bee Break · simile of the page</div><div class="b"><b>${esc(x.p)}</b></div><div class="t">${esc(x.m)}</div></div></div>`; }
    if (kind === 3) { const x = facts[fi++ % facts.length];
      return `<div class="bb-break">${avatar(x.a.id, '.55in')}<div><div class="l">Bee Break · ${esc(x.a.name)}'s true fact</div><div class="b">${esc(x.cd.fact)}</div></div></div>`; }
    const x = i[ii++ % i.length]; return `<div class="bb-break"><span style="font-size:13pt">🎈</span><div><div class="l">Bee Break · idiom to drop at dinner</div><div class="b"><b>${esc(x.p)}</b></div><div class="t">${esc(x.m)}</div></div></div>`;
  };
}

/* ---------------- anime storyboard opener from the six-scene script ----------------
   v5: each panel is a full keyframe — painterly sky by mood, the world's own
   silhouette landscape, particle weather, a rim-lit character staged in frame —
   with the line as a subtitle caption. The speaking role rotates through the
   volume's drafted cast, so a book's ensemble carries the story together. */
function propText(sc) {
  try { const sh = sc.show; if (!sh) return '';
    if (sh.word) return String(sh.word).toUpperCase();
    if (sh.parts) return [].concat(sh.parts).slice(0, 4).join(' · ');
    if (sh.list) return [].concat(sh.list).slice(0, 3).map(x => clamp(typeof x === 'object' ? (x.w || x.t || '') : x, 16)).join(' · ');
    if (sh.glyph) return String(sh.glyph).slice(0, 8);
    if (sh.big) return clamp(sh.big, 22);
  } catch (e) {} return '';
}
function comicOpener(vol, ch, ci, script, folio, cast) {
  const reg = REG(vol);
  const scenes = (script && script.scenes) || [];
  if (!scenes.length) return null;
  const pick = [];
  const byMood = m => scenes.find(s => s.mood === m && !pick.includes(s));
  pick.push(scenes[0]);
  for (const m of ['think', 'oops', 'excited']) { const s = byMood(m); if (s && pick.length < 4) pick.push(s); }
  for (const s of scenes) { if (pick.length >= 4) break; if (!pick.includes(s)) pick.push(s); }
  const maxW = reg >= 3 ? 17 : 13;   // balloons stay small so the art breathes
  const world = chWorldOf(vol, ci);
  const co1 = cast[ci % cast.length], co2 = cast[(ci + 4) % cast.length];
  /* one continuous canvas, no boxes: Bizzy opens, the guide and crew carry it,
     Vex lurks in the storm stretch. Captions float in the clear sky OPPOSITE
     each figure, never on top of it. */
  const sceneList = pick.slice(0, 4).map((sc, k) => {
    const isVex = (sc.mood || '') === 'oops';
    const avId = k === 0 ? HERO : k === 1 ? vol.av : k === 3 ? co2.id : co1.id;
    return { avId: isVex ? null : avId, vex: isVex, mood: sc.mood || 'happy',
      name: isVex ? (NAMES[vol.av] || castName(vol.av)) : (NAMES[avId] || castName(avId)),
      line: wordsClamp(sc.say, maxW), prop: propText(sc) };
  });
  const uid = `op${vol.n}x${ci}`;
  const svg = ANIME.storyboard(sceneList.map(s => ({ avId: s.avId, mood: s.mood, vex: s.vex })),
    { W: 725, H: 830, world, reg, uid, seed: vol.n * 1009 + ci * 13 });
  /* storyboard() places figures at x=78% on even beats and x=20% on odd ones.
     Each balloon sits on the free side of its own speaker with a tail pointing
     back at them — so the words are next to the mouth that said them, and the
     character stays uncovered. */
  const caps = sceneList.map((s, i) => {
    const t = i / Math.max(1, sceneList.length - 1);
    const topPct = (.1 + t * .74) * 100;
    const figRight = i % 2 === 0;
    const side = figRight ? 'left:5%;width:52%' : 'right:5%;width:52%';
    const tailCls = figRight ? 'r' : 'l';   // tail points toward the figure
    const sfx = reg >= 3 ? '' : s.vex ? `<span class="an-sfx" style="position:absolute;top:${topPct - 7}%;${figRight ? 'right:8%' : 'left:8%'}">UH-OH!</span>`
      : s.mood === 'excited' ? `<span class="an-sfx" style="position:absolute;top:${topPct - 7}%;${figRight ? 'right:8%' : 'left:8%'}">GOT IT!</span>` : '';
    return `${sfx}<div class="an-bub ${tailCls}" style="top:${topPct}%;${side}">
      <span class="nm">${esc(s.name)}${s.vex ? ' · Vex is circling' : ''}</span>${esc(s.line)}
      <span class="tail"><i></i></span></div>`;
  }).join('');
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'Story')}
    <div style="margin-top:.34in;display:flex;align-items:center;gap:.14in">
      <span style="display:inline-grid;place-items:center;width:.56in;height:.56in;border-radius:15px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:16pt;flex-shrink:0">${ci + 1}</span>
      <div style="min-width:0"><div class="kick">${esc(ch.category)}</div><h1 style="font-size:22pt;line-height:1.04">${esc(clamp(ch.title, 58))}</h1></div>
      <span class="worldchip" style="margin-left:auto;flex-shrink:0">📍 ${esc(WORLD_NAME[world] || world)}</span></div>
    <div style="position:relative;margin-top:.1in;height:8.35in;border-radius:${reg >= 3 ? '6pt' : '14pt'};overflow:hidden;box-shadow:0 6pt 20pt rgba(26,18,54,.3)">
      ${(() => { const a = artAt(`b${String(vol.n).padStart(2, '0')}-ch${String(ci + 1).padStart(2, '0')}-opener`);
        return a ? artImg(a) : `<svg viewBox="0 0 725 830" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${svg}</svg>`; })()}
      ${caps}
      <span style="position:absolute;left:0;right:0;bottom:0;height:.5in;background:linear-gradient(180deg,rgba(12,9,28,0),rgba(12,9,28,.55));pointer-events:none"></span>
      <span style="position:absolute;left:8pt;bottom:6pt" class="bb-audio">🔊 narrated in the app</span>
      <span style="position:absolute;right:10pt;bottom:8pt;font-family:'BB Kicker';font-size:9.2pt;color:rgba(255,255,255,.95);text-shadow:0 1px 4px rgba(0,0,0,.6)">turn the page — the whole trick, explained →</span>
    </div>
    ${foot(vol, folio)}</div>`;
}

/* ---------------- chapter pages ---------------- */
function teachPage(vol, ch, ci, folio, nextBreak) {
  const reg = REG(vol);
  const cards = (ch.cards || []).slice(0, 4);
  const words = (ch.words || []).filter(w => w && w.w);
  const vexW = words.find(w => w.hook && /not|never|don’t|don't|watch|careful|trap/i.test(w.hook)) || words[0];
  const three = words.slice(0, 3).map(w => w.w);
  /* sound-trap box: the chapter's own homophones, if it has any */
  const traps = words.map(w => ({ w: w.w, twins: HOMX[String(w.w).toLowerCase()] })).filter(x => x.twins && x.twins.length).slice(0, 2);
  const checkLine = reg === 1
    ? `Cover the page. Spell these three out loud: <b>${three.map(esc).join('</b> · <b>')}</b>. Say each letter like you mean it.`
    : reg === 2
      ? `Cover the page and spell <b>${three.map(esc).join('</b> · <b>')}</b> out loud. Miss one? Read the idea again — it's faster than guessing twice.`
      : `Book closed: <b>${three.map(esc).join('</b> · <b>')}</b>, out loud, full words. At this level, almost right is still an elimination.`;
  const alerts = [
    vexW && vexW.hook ? `<div class="bb-vex">${VEX('0.42in')}<div><div class="l">Vex alert</div><div style="font-size:9.8pt;line-height:1.35">${esc(clamp(vexW.hook, 120))}</div></div></div>` : '',
    traps.length ? `<div class="bb-trap"><div class="l">Sound trap</div><div style="font-size:9.8pt;line-height:1.35">${traps.map(t => `<b>${esc(t.w)}</b> sounds like <i>${esc(t.twins.slice(0, 2).join(', '))}</i>`).join(' · ')} — at the mic, always ask for the meaning.</div></div>` : '',
    `<div class="bb-check"><div class="l">Check yourself</div><div style="font-size:9.8pt;line-height:1.35">${checkLine}</div></div>`,
  ].filter(Boolean);
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'The idea')}
    <div style="margin-top:.4in" class="kick">The big idea</div>
    <div class="bb-bigidea">${esc(clamp(ch.concept, 430))}<span class="cameo">${avatar(vol.av, '.62in')}</span></div>
    ${ch.method ? `<div class="kick" style="margin-top:.14in">The pro move</div><div class="bb-promove">${String(ch.method).split('\n').map(l => l.trim()).filter(Boolean).map(l => `<div class="ln">${l}</div>`).join('')}</div>` : ''}
    ${cards.length ? `<div class="bb-sticky">${cards.map(cd => `<div class="card"><h3>${esc(cd.title)}</h3><p>${esc(clamp(cd.body, 244))}</p></div>`).join('')}</div>` : ''}
    <div style="display:grid;grid-template-columns:repeat(${alerts.length},1fr);gap:.16in;margin-top:.18in">${alerts.join('')}</div>
    ${cards.length >= 4 && String(ch.method || '').length > 380 ? '' : nextBreak()}
    ${foot(vol, folio)}</div>`;
}
/* checkpoint quiz page — the Word Map's own concept questions, on paper */
function quizPage(vol, ch, ci, qs, cast, rnd, keys, folio) {
  if (!qs || !qs.length) return null;
  const reg = REG(vol);
  const host = cast[(ci + 2) % cast.length];
  const totLen = qs.slice(0, 5).reduce((a, q) => a + q.q.length + q.c.join('').length, 0);
  const picked = qs.slice(0, totLen > 900 ? 4 : 5);
  const letters = 'ABCD';
  const ans = [];
  const qHtml = picked.map((q, i) => {
    const opts = q.c.map((c, k) => ({ c, ok: k === 0 })); shuf(opts, rnd);
    ans.push(letters[opts.findIndex(o => o.ok)]);
    return `<div class="q"><div class="qq">${i + 1}. ${esc(q.q)}</div>
      ${opts.map((o, k) => `<div class="opt"><i>${letters[k]}</i><span>${esc(clamp(String(o.c), 96))}</span></div>`).join('')}</div>`;
  }).join('');
  keys.push(`<div><b>Ch. ${ci + 1} checkpoint</b> — ${ans.map((a, i) => (i + 1) + ':' + a).join('  ')}</div>`);
  const intro = reg === 1 ? 'Circle your answer, then check the back. No pressure — wrong answers are how the right ones stick.'
    : reg === 2 ? 'Same questions the app asks at this stop on the Word Map. Circle, then check the back.'
    : 'The Word Map gates this stop at 90%. That is five of six, minimum. Circle and verify.';
  /* dictation bonus fills the page and adds real practice: three chapter words,
     read aloud by anyone nearby, written here; answers ride the back key */
  const dictN = totLen > 700 ? 2 : 3;
  const dict = shuf(((ch.words || []).filter(w => w && w.w)).slice(), rnd).slice(0, dictN);
  keys.push(`<div><b>Ch. ${ci + 1} dictation</b> — ${dict.map(w => w.w).join(', ')}</div>`);
  const hostCd = CARD(host.id) || {};
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'Checkpoint')}
    <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(host.id, '.62in')}
      <div><div class="kick">${esc(host.name)}${hostCd.title ? ' · ' + esc(hostCd.title) : ''} runs the checkpoint</div><h2 style="font-size:20pt">Do you own the idea?</h2></div></div>
    <p style="font-size:10.4pt;color:var(--muted);margin:.06in 0 .1in">${intro}${hostCd.power ? ` <i>${esc(host.name)}'s power is ${esc(hostCd.power)} — borrow it.</i>` : ''}</p>
    <div class="bb-quiz" style="columns:2;column-gap:.3in">${qHtml}</div>
    <div class="kick" style="margin-top:.18in">Dictation round</div>
    <p style="font-size:10.2pt;color:var(--muted);margin:.02in 0 .06in">Hand this page to anyone nearby. They read the words from the answer key (Ch. ${ci + 1} dictation, at the back) — you write, no peeking.</p>
    ${dict.map((_, i) => `<div style="display:flex;gap:.12in;align-items:baseline"><span style="font-family:'BB Kicker';font-size:10pt;color:var(--accent-deep)">${i + 1}.</span><div class="bb-writeline" style="flex:1"></div></div>`).join('')}
    ${picked.length <= 3 ? worldStrip(chWorldOf(vol, ci), vol, ci * 3 + 1) : ''}
    ${foot(vol, folio)}</div>`;
}
function hivePages(vol, ch, ci, folioRef) {
  const words = (ch.words || []).filter(w => w && w.w);
  const FULLN = vol.band === 'advanced' ? 12 : 6;
  const out = [];
  const fullAll = words.slice(0, FULLN);
  for (let f = 0; f < fullAll.length; f += 6) {
    const seg = fullAll.slice(f, f + 6);
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, ch, ci, 'Practice')}
      <div style="margin-top:.4in;display:flex;justify-content:space-between;align-items:baseline">
        <h2 style="font-size:20pt">Say it. Spell it out loud. Write it.</h2>
        <span class="bb-audio">🔊 every word has real audio in the app</span></div>
      <div class="bb-hive" style="margin-top:.12in">${seg.map(w => { const say = w.say || ''; const ipa = ipaOf(w.w, say);
        return `<div><div class="bb-card"><div class="w">${esc(w.w)}</div>
        <div class="say">${say ? '/ ' + esc(say) + ' /' : ''}${ipa ? '  ·  /' + esc(ipa) + '/' : ''}</div>
        <div class="d">${esc(clamp(w.def, 92))}</div>${w.hook ? `<div class="hook">hook: ${esc(clamp(w.hook, 92))}</div>` : ''}
        ${w.ex ? `<div class="ex">${esc(maskDef(clamp(w.ex, 110), w.w))}</div>` : ''}</div>
        <div class="bb-writeline"></div>${w.ex ? '' : '<div class="bb-writeline"></div><div class="bb-writeline"></div>'}</div>`; }).join('')}</div>
      ${worldStrip(chWorldOf(vol, ci), vol, ci * 13 + f + 3)}
      ${foot(vol, folioRef.n++)}</div>`);
  }
  const rest = words.slice(FULLN);
  for (let i = 0; i < rest.length; i += 14) {
    const seg = rest.slice(i, i + 14);
    /* a short final segment would leave the page mostly empty — fill it with a
       lock-in writing drill and the travelling world band */
    const short = true;
    const lockIn = short ? `<div class="kick" style="margin-top:.24in">Lock them in</div>
      <p style="font-size:10.4pt;color:var(--muted);margin:.03in 0 .08in">Pick ${Math.min(4, seg.length)} words from above. Say each one as you write it — three times, no shortcuts. The third copy is the one your hand remembers.</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.06in .3in">${Array.from({ length: Math.min(4, seg.length) * 3 }, () => '<div class="bb-writeline"></div>').join('')}</div>
      ${worldStrip(chWorldOf(vol, ci), vol, ci * 7 + i + 2)}` : '';
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, ch, ci, 'Rapid round')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">More ammo — one line each.</h2></div>
      <div class="bb-rapid" style="margin-top:.12in">${seg.map(w => `<div class="bb-row"><b>${esc(w.w)}</b> <span class="tile" style="font-size:8.8pt">${w.say ? '/' + esc(w.say) + '/' : ''}</span><br>${esc(clamp(w.def, 64))}</div>`).join('')}</div>
      ${lockIn}
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
  const host = (gamePage._cast && gamePage._cast[(ci + 1) % gamePage._cast.length]) || { id: vol.av, name: NAMES[vol.av] || vol.av };
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'Game')}
    <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(host.id, '.6in')}
      <div><div class="kick">${esc(host.name)}'s puzzle page</div><h2 style="font-size:20pt">${title}</h2></div>
      <div style="margin-left:auto" class="bb-badge"><div class="b1">I own<br>this</div></div></div>
    <div style="margin-top:.1in">${body}</div>
    ${nextBreak()}
    ${title === 'Scramble & rescue' ? worldStrip(chWorldOf(vol, ci), vol, ci * 11 + 5) : ''}
    ${foot(vol, folio)}</div>`;
}

/* shared front/back matter — v6 covers are dense ensemble keyframes:
   Bizzy front and centre in motion, the guide and crew around, letter tiles
   raining through the scene, the world's own props on the ground. */
function cover(vol, nCh, nWords, label, cast) {
  const W = 816, H = 1056;
  const reg = REG(vol);
  const crew = [vol.av].concat((cast || []).slice(0, 3).map(a => a.id));
  const coverArt = artAt(`b${String(vol.n).padStart(2, '0')}-cover`);
  return `<div class="page" data-cover data-vol="${vol.n}" style="color:#fff;padding:0;background:#241E33">
    ${coverArt ? artImg(coverArt) : `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      ${ANIME.ensemble({ W, H, world: vol.world, reg, seed: vol.n * 977, uid: 'cov' + vol.n,
        hero: HERO, crew, title: vol.title, vex: vol.band === 'advanced',
        skyKey: reg >= 3 ? 'dusk' : vol.n % 2 ? 'gold' : 'day' })}
    </svg>`}
    <div style="position:absolute;top:.42in;left:.55in;right:.55in;display:flex;justify-content:space-between;align-items:center">
      <span style="font-family:'BB Kicker';letter-spacing:.16em;font-size:10.5pt;text-shadow:0 2px 6px rgba(0,0,0,.55)">BIZZING BEE ${label}</span>
      <span class="disp" style="background:rgba(12,9,28,.55);padding:.07in .2in;border-radius:999px;font-size:12.5pt;transform:rotate(${reg >= 3 ? 0 : 2}deg)">Vol. ${vol.n}</span></div>
    <div style="position:absolute;top:.95in;left:.4in;right:.4in;text-align:center;transform:rotate(${reg >= 3 ? 0 : -1.4}deg)">
      <h1 class="coverTitle" style="font-size:58pt;line-height:.94">${esc(vol.title)}</h1>
      <p style="font-family:'BB Kicker';font-size:14pt;max-width:5.8in;margin:.14in auto 0;text-shadow:0 2px 10px rgba(0,0,0,.65)">${esc(vol.tag)}</p></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:1.5in;background:linear-gradient(180deg,rgba(12,9,28,0),rgba(12,9,28,.72))"></div>
    <div style="position:absolute;right:.5in;bottom:.55in;display:flex;flex-direction:column;gap:.08in;align-items:flex-end">
      ${[[nCh + ' chapters'], [nWords + ' practice words'], ['quizzes & puzzles throughout']].map(([t]) =>
        `<span style="background:rgba(12,9,28,.55);border-radius:999px;padding:.05in .18in;font-family:'BB Kicker';font-size:10pt">${t}</span>`).join('')}</div>
    <div style="position:absolute;left:.55in;bottom:.55in;max-width:4in;font-family:'BB Kicker';font-size:9.6pt;text-shadow:0 2px 6px rgba(0,0,0,.7)">
      Bizzy &amp; ${esc(NAMES[vol.av] || castName(vol.av))} in ${esc(WORLD_NAME[vol.world] || vol.world)}<br>
      <span style="opacity:.9">${esc(WORLD_BLURB[vol.n] || '')}</span></div>
  </div>`;
}
/* a slim world band that carries the journey's scenery onto working pages */
function worldStrip(world, vol, seedK) {
  const uid = 'ws' + vol.n + 'x' + seedK;
  const reg = REG(vol);
  const stripArt = artAt(`strip-${world}-r${reg}`);
  if (stripArt) return `<div class="worldband" aria-hidden="true">${artImg(stripArt)}
    <span class="wl">${esc((WORLD_NAME[world] || world).replace(/^the /, 'the '))}</span></div>`;
  return `<div class="worldband" aria-hidden="true">
    <svg viewBox="0 0 725 120" preserveAspectRatio="xMidYMax slice">
      <defs>${ANIME.filters(uid)}</defs>
      ${ANIME.sky(world, reg >= 3 ? 'think' : 'happy', 725, 120, reg, uid)}
      ${ANIME.ground(world, 725, 120, reg)}
      ${ANIME.env(world, 725, 120, 96, reg, uid, seedK)}
      ${ANIME.particles(world, 725, 120, seedK * 3 + 1, reg, uid)}</svg>
    <span class="wl">${esc((WORLD_NAME[world] || world).replace(/^the /, 'the '))}</span></div>`;
}
function dividerPage(vol, folio) {
  const W = 816, H = 1056;
  const reg = REG(vol);
  const divArt = artAt(`b${String(vol.n).padStart(2, '0')}-divider`);
  return `<div class="page" data-vol="${vol.n}" style="color:#fff;padding:0;background:#241E33">
    ${divArt ? artImg(divArt) : `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      ${ANIME.plate(vol.av, { W, H, world: vol.world, mood: reg >= 3 ? 'think' : 'excited', reg, seed: vol.n * 431 + 5,
        uid: 'div' + vol.n, figX: W * .62, figY: H * .66, figS: 300, flip: true, letterbox: reg >= 3 })}</svg>`}
    <div style="position:absolute;top:1.7in;left:.7in;right:.7in;text-align:center">
      <div style="font-family:'BB Kicker';letter-spacing:.14em;font-size:11pt;text-shadow:0 2px 6px rgba(0,0,0,.4)">WELCOME TO</div>
      <h1 class="coverTitle" style="font-size:40pt;transform:rotate(${reg >= 3 ? 0 : -1.2}deg)">${esc((WORLD_NAME[vol.world] || vol.world).replace(/^the /, 'The '))}</h1>
      <p style="font-family:'BB Kicker';font-size:12.5pt;max-width:5.4in;margin:.16in auto 0;text-shadow:0 2px 8px rgba(0,0,0,.5);line-height:1.5">${esc(WORLD_BLURB[vol.n] || '')}</p></div>
    <div class="bb-foot" style="color:rgba(255,255,255,.85)"><span>Bizzing Bee · ${esc(vol.title)}</span><span>${folio}</span></div>
  </div>`;
}
/* the cast page: who walks through this book with you */
const PACK_ROLE = {
  hive: 'born in the Hive — spelling is the family business', stage: 'lives for the spotlight and the final round',
  cosmos: 'navigates by the stars; never loses a syllable', dojo: 'trains daily — discipline beats talent',
  lab: 'tests every rule twice before trusting it', arcade: 'turns every drill into a high score',
  origami: 'folds long words into small, foldable steps', elements: 'reads the weather inside a word',
  critter: 'sniffs out silent letters from a mile away', vibe: 'hears the rhythm a word wants to be spelled in',
  dino: 'remembers words older than most languages', enchanted: 'keeps the words with a little magic in them',
  wildhearts: 'loyal to the speller, fierce with the list', legends: 'has seen every trick a word can pull',
  turbo: 'fast — but never faster than the routine', villains: 'reformed. Mostly. Knows every trap personally',
  serpent: 'patient — waits a whole round for one perfect word', bigbeasts: 'carries the heavyweight vocabulary',
  worldchangers: 'proof that one voice can move a room', gods: 'ancient management. Rarely wrong about roots',
};
function castPage(vol, cast, folio) {
  const reg = REG(vol);
  const lead = reg === 1 ? 'Nobody spells alone. Meet the crew walking this world with you — they will hand you puzzles, run your checkpoints and cheer from the margins.'
    : reg === 2 ? 'Every book travels with a crew. These nine hand you puzzles, host the checkpoints and occasionally get a line right before you do.'
    : 'The ensemble for this volume. They host the drills and checkpoints; the work is still yours.';
  const gCard = CARD(vol.av); const hCard = CARD(HERO);
  const entry = a => { const cd = CARD(a.id) || {};
    return `<div style="display:flex;gap:.12in;align-items:center">
      ${avatar(a.id, '.92in')}
      <div style="min-width:0"><div style="font-family:'BB Display';font-size:13pt;line-height:1.15">${esc(a.name)}
        ${cd.overall ? `<span style="font-family:'BB Tile';font-size:8.6pt;color:var(--muted)"> OVR ${cd.overall}</span>` : ''}</div>
      <div style="font-family:'BB Kicker';font-size:8.2pt;color:var(--accent-deep);text-transform:uppercase;letter-spacing:.05em;margin:3pt 0 4pt;line-height:1.35">${esc(clamp(cd.title || (a.rarity + ' · ' + a.pack + ' pack'), 30))}</div>
      <div style="font-size:9.6pt;color:var(--muted);line-height:1.42">${esc(clamp(cd.lore || PACK_ROLE[a.pack] || 'reports for spelling duty', 84))}</div></div></div>`; };
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, null, 0, 'The cast')}
    <div style="margin-top:.36in;display:flex;align-items:center;gap:.16in">
      ${avatar(HERO, '1.1in')}${avatar(vol.av, '.9in')}
      <div><div class="kick">Bizzy — and this book's guide, ${esc(NAMES[vol.av] || castName(vol.av))}</div>
      <h1 style="font-size:23pt">The crew of Vol. ${vol.n}</h1>
      <p style="font-size:10.4pt;color:var(--muted);margin-top:2pt;max-width:5.2in;line-height:1.42">${lead}</p></div></div>
    ${hCard && hCard.lore ? `<div class="bb-panelbox" style="margin-top:.16in;font-size:10.2pt;line-height:1.5"><b style="color:var(--accent-deep)">Bizzy</b> — ${esc(hCard.lore)}${gCard && gCard.lore ? ` &nbsp;·&nbsp; <b style="color:var(--accent-deep)">${esc(NAMES[vol.av] || '')}</b> — ${esc(gCard.lore)}` : ''}</div>` : ''}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.2in .3in;margin-top:.2in">
      ${cast.slice(0, 8).map(entry).join('')}</div>
    <div style="display:flex;gap:.14in;align-items:center;margin-top:.18in" class="bb-panelbox">
      ${VEX('.85in')}
      <div><div class="kick" style="color:var(--tricky-deep)">And the other one</div>
      <p style="font-size:10.4pt;line-height:1.42">${reg >= 3 ? 'Vex, the word-moth. Every trap in this book is one it has watched a speller fall into on a real stage.' : 'Vex the word-moth sneaks through every chapter, planting the exact mistakes real spellers make. Spot the trap before you step in it.'}</p></div></div>
    ${foot(vol, folio)}</div>`;
}
/* back-of-book poster: the crew, staged in their world at golden hour */
function posterPage(vol, cast, folio) {
  const W = 816, H = 1056;
  const reg = REG(vol);
  const uid = 'po' + vol.n;
  const figs = [HERO, vol.av].concat(cast.slice(0, 3).map(a => a.id));
  const spots = [[.5, .56, 300], [.16, .66, 190], [.82, .64, 185], [.32, .72, 160], [.68, .73, 165]];
  const inner = figs.map((id, i) => { const [fx, fy, s] = spots[i];
    return ANIME.figure(id, W * fx, H * fy, s, { uid, flip: fx > .5 }); }).join('');
  const poArt = artAt(`b${String(vol.n).padStart(2, '0')}-poster`);
  return `<div class="page" data-vol="${vol.n}" style="color:#fff;padding:0;background:#241E33">
    ${poArt ? artImg(poArt) : `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      <defs>${ANIME.filters(uid)}</defs>
      ${ANIME.sky(vol.world, reg >= 3 ? 'think' : 'excited', W, H, Math.max(2, reg), uid)}
      ${ANIME.clouds(W, H, reg, vol.n * 17 + 3, uid)}
      ${ANIME.ground(vol.world, W, H, reg)}
      ${inner}
      ${ANIME.particles(vol.world, W, H, vol.n * 29 + 7, reg, uid)}</svg>`}
    <div style="position:absolute;top:.8in;left:.6in;right:.6in;text-align:center">
      <h1 class="coverTitle" style="font-size:34pt">${esc(vol.title)}</h1>
      <p style="font-family:'BB Kicker';font-size:11pt;text-shadow:0 2px 6px rgba(0,0,0,.5)">the ${esc((WORLD_NAME[vol.world] || vol.world).replace(/^the /, ''))} crew · Bizzing Bee</p></div>
    <div class="bb-foot" style="color:rgba(255,255,255,.85)"><span>Bizzing Bee · ${esc(vol.title)}</span><span>${folio}</span></div>
  </div>`;
}
function howTo(vol, folio) {
  const reg = REG(vol);
  const steps = [
    ['Read the story', reg === 1 ? 'Each chapter opens like a film. Vex sets the trap; your guide walks you out of it.' : 'Each chapter opens as a storyboard. Vex sets the trap; the crew talks you out of it.'],
    ['Steal the pro move', 'The dark box is how a champion thinks on stage. It works on brand-new words too.'],
    ['Spell out loud, then write', reg === 1 ? 'Say it, spell it OUT LOUD, then write it in the box. Mouth and hand together beat eyes alone.' : 'Say it, spell it aloud, write it. The order matters — it is how the stage will ask for it.'],
    ['Pass the checkpoint', reg >= 3 ? 'The same questions the app gates this chapter with — at 90%. Circle, then verify at the back.' : 'A short quiz straight from the Word Map. Circle your answers; the back of the book keeps the truth.'],
    ['Play the puzzle, hunt the Big List', 'Every chapter ends in a game built from its own words, and the back holds every word in the book. Circle what you own.'],
  ];
  const hello = reg === 1
    ? `Hi — I'm <b>${esc(NAMES[vol.av])}</b>. ${esc(vol.tag)} — that's where we're going, one chapter at a time. Bring a pencil. I'll bring the words.`
    : reg === 2
      ? `<b>${esc(NAMES[vol.av])}</b> here. ${esc(vol.tag)} — that's the route. The crew and I will keep it moving; you keep the pencil moving.`
      : `I'm <b>${esc(NAMES[vol.av] || castName(vol.av))}</b>. ${esc(vol.tag)}. Nothing in this book is filler — if a page is here, a real speller lost a real word without it.`;
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:25pt">Five moves. That's the whole system.</h1></div>
    <div style="display:flex;gap:.14in;align-items:center;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-panelbox" style="flex:1;font-size:11.5pt;line-height:1.5">${hello}</div></div>
    ${steps.map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12.5pt;color:var(--accent-deep)">${t}</h3><p style="font-size:10.6pt;line-height:1.45">${b}</p></div></div>`).join('')}
    <div class="bb-audio" style="margin-top:.05in">🔊 Grown-ups: every chapter is narrated, and every word recorded, in the Bizzing Bee app</div>
    ${worldStrip(vol.world, vol, 7)}
    ${foot(vol, folio)}</div>`;
}
function bigListPages(vol, allWords, folioRef) {
  const uniq = [...new Map(allWords.map(w => [w.w.toLowerCase(), w])).values()].sort((a, b) => a.w.localeCompare(b.w));
  const out = []; const PER = 66;
  for (let i = 0; i < uniq.length; i += PER) {
    const seg = uniq.slice(i, i + PER);
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, null, 0, 'The Big List')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Every word in this book. Circle what you own.</h2></div>
      <div class="bb-biglist" style="margin-top:.14in">${seg.map(w => `<div><span></span>${esc(w.w)}</div>`).join('')}</div>
      ${seg.length < PER * .82 ? worldStrip(vol.world, vol, 400 + i) : ''}
      ${foot(vol, folioRef.n++)}</div>`);
  }
  return out;
}
function keyPages(vol, keys, folioRef) {
  const reg = REG(vol);
  const out = [];
  out.push(`<div class="page" data-vol="${vol.n}" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${VEX('1.2in', ';margin:0 auto')}
    <h1 style="font-size:32pt;margin:.14in 0 .06in">${reg >= 3 ? 'Answers. Earn them first.' : "No peeking until you've tried."}</h1>
    <p style="color:var(--muted);font-size:11.5pt;margin-bottom:1.6in">${reg >= 3 ? 'Checking before trying teaches you nothing twice.' : 'Vex would peek. Be better than Vex.'}</p>
    ${worldStrip(vol.world, vol, 91)}
    ${foot(vol, folioRef.n++)}</div>`);
  for (let i = 0; i < keys.length; i += 14) {
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, null, 0, 'Answer key')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Answer key</h2></div>
      <div class="bb-key" style="margin-top:.12in">${keys.slice(i, i + 14).join('')}</div>
      ${worldStrip(WORLD_CYCLE[(i / 14 + vol.n) % 12], vol, 300 + i)}
      ${foot(vol, folioRef.n++)}</div>`);
  }
  return out;
}
function colophon(vol, folio) {
  const reg = REG(vol);
  const line = reg === 1 ? `${esc(NAMES[vol.av] || castName(vol.av))} says: you just finished a whole book. That happened.`
    : reg === 2 ? `That's the volume. ${esc(NAMES[vol.av] || castName(vol.av))} signs off — the words are yours now.`
    : `End of volume. What you keep from it shows up at the microphone, not on this page.`;
  return `<div class="page" data-vol="${vol.n}" style="display:flex;flex-direction:column;justify-content:center;text-align:center">
    ${avatar(vol.av, '1.4in', ';margin:0 auto')}
    <h2 style="font-size:20pt;margin:.12in 0">${line}</h2>
    <div style="margin:0 auto .2in" class="bb-badge"><div class="b1">DONE</div><div class="b1" style="border-style:solid">★</div><div class="b1">+1</div></div>
    <p style="font-size:10.5pt;max-width:5.4in;margin:0 auto .26in;line-height:1.55">Every word in here also lives in the Bizzing Bee app, with real audio, games and a coach that remembers what you miss. Paper for the muscles, app for the ears.</p>
    <p style="font-size:8.4pt;color:var(--muted);max-width:5.9in;margin:0 auto 1.55in;line-height:1.55">Bizzing Bee is an independent study project — not affiliated with, sponsored by, or endorsed by the Scripps National Spelling Bee, the North South Foundation, or Merriam-Webster. Competition names appear only to describe what the practice material relates to. Definitions, sentences, hints and stories are written for this project. Typefaces are open-licensed (SIL OFL).</p>
    ${worldStrip(vol.world, vol, 97)}
    ${foot(vol, folio)}</div>`;
}

/* ---------------- course book builder ---------------- */
function buildCourse(vol, chapters, scripts, idxOf) {
  const rnd = mulberry(vol.n * 7919 + 17);
  const cast = draftCast(vol);
  const nextBreak = makeBreaks(vol, cast);
  gamePage._cast = cast;
  const allWords = chapters.flatMap(ch => (ch.words || []).filter(w => w && w.w));
  const QSRC = vol.band === 'advanced' ? QS_ADV : QS_GEN;
  const keys = [];
  const folio = { n: 1 };
  let pages = [cover(vol, chapters.length, allWords.length, vol.band === 'advanced' ? 'ADVANCED LIBRARY' : 'LIBRARY', cast)];
  pages.push(howTo(vol, folio.n++));
  pages.push(castPage(vol, cast, folio.n++));
  pages.push(dividerPage(vol, folio.n++));
  chapters.forEach((ch, i) => {
    const sc = scripts[String(idxOf(ch))];
    const op = comicOpener(vol, ch, i, sc, folio.n, cast); if (op) { pages.push(op); folio.n++; }
    pages.push(teachPage(vol, ch, i, folio.n++, nextBreak));
    pages = pages.concat(hivePages(vol, ch, i, folio));
    const qp = quizPage(vol, ch, i, QSRC[idxOf(ch)], cast, rnd, keys, folio.n); if (qp) { pages.push(qp); folio.n++; }
    pages.push(gamePage(vol, ch, i, rnd, keys, folio.n++, nextBreak));
  });
  pages = pages.concat(bigListPages(vol, allWords, folio));
  pages = pages.concat(keyPages(vol, keys, folio));
  pages.push(posterPage(vol, cast, folio.n++));
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
  pages.push(dividerPage(vol, folio.n++));
  let pageNo = 0;
  for (let i = 0; i < sims.length; i += 14) {
    const seg = sims.slice(i, i + 14); pageNo++;
    pages.push(`<div class="page" data-vol="16">
      ${head(vol, null, 0, 'The simile shelf')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Say one thing is like another. Boom — a picture.</h2></div>
      <div style="columns:2;column-gap:.34in;margin-top:.14in">${seg.map((x, k) => `<div style="break-inside:avoid;margin-bottom:.15in;transform:rotate(${k % 2 ? .3 : -.3}deg)">
        <div style="font-family:'BB Display';font-size:13.5pt;color:var(--accent-deep);line-height:1.14">⬡ ${esc(x.p)}</div>
        <div style="font-size:10pt;line-height:1.36;margin-top:2pt;padding-left:.18in">${esc(clamp(x.m, 100))}</div>
        ${x.os ? `<div style="font-size:9pt;line-height:1.33;margin-top:2pt;padding-left:.18in;color:var(--muted);font-style:italic">${esc(clamp(x.os, 150))}</div>` : ''}</div>`).join('')}</div>
      ${worldStrip(WORLD_CYCLE[(pageNo + 2) % 12], vol, 500 + pageNo)}
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
  for (let i = 0; i < idioms.length; i += 18) {
    pages.push(`<div class="page" data-vol="16">
      ${head(vol, null, 0, 'Idiom hall of fame')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Phrases that stopped meaning what they say.</h2></div>
      <div style="columns:2;column-gap:.3in;margin-top:.14in">${idioms.slice(i, i + 18).map(x => `<div style="margin-bottom:.12in;break-inside:avoid;font-size:9.8pt;line-height:1.36"><b style="font-family:'BB Display';font-size:11pt;color:var(--accent-deep)">${esc(x.p)}</b> — ${esc(clamp(x.m, 80))}<br><span style="color:var(--muted);font-size:8.8pt;font-style:italic">${esc(clamp(x.os, 110))}</span></div>`).join('')}</div>
      ${worldStrip(WORLD_CYCLE[(i / 18 + 4) % 12], vol, 600 + i)}
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
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:10.6pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${worldStrip(vol.world, vol, 8)}
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
  pages.push(dividerPage(vol, folio.n++));
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
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:10.6pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${worldStrip(vol.world, vol, 9)}
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
      ${worldStrip(WORLD_CYCLE[(chNo + 8) % 12], vol, 700 + chNo)}
      ${foot(vol, folio.n++)}</div>`);
    const rest = picked.slice(1);
    for (let i = 0; i < rest.length; i += 6) {
      pages.push(`<div class="page" data-vol="17">
        ${head(vol, null, 0, esc(title))}
        <div style="margin-top:.4in"></div>
        ${rest.slice(i, i + 6).map((q, k) => `<div style="margin-bottom:.17in;padding-left:.34in;position:relative;transform:rotate(${k % 2 ? .25 : -.25}deg)">
          <span style="position:absolute;left:0;top:-.1in;font-family:'BB Display';font-size:30pt;color:var(--accent)">“</span>
          <div style="font-family:'BB Display';font-size:13pt;line-height:1.3">${esc(q.q)}</div>
          <div style="font-family:'BB Kicker';font-size:9.6pt;color:var(--accent-deep);margin-top:2pt">— ${esc(q.a)}${q.who ? ', ' + esc(q.who) : ''}</div>
          <div style="font-size:9.4pt;line-height:1.34;margin-top:2pt;color:var(--muted);font-style:italic">🐝 ${esc(clamp(q.m, 150))}</div></div>`).join('')}
        ${worldStrip(WORLD_CYCLE[(chNo + i) % 12], vol, 800 + chNo * 9 + i)}
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
<p class="lead">Seventeen graphic study books, anime edition — cinematic storyboard openers with the full avatar cast,
checkpoint quizzes straight from the Word Map, practice hives with real write-in drills, puzzles made of each
chapter's own words, and two collections. The books grow up as the reader does: bright daylight in Vol. 1,
letterboxed night cinema by Vol. 12.</p>
<div class="canva"><b>Getting a book into Canva:</b> download the PDF, then in Canva choose <b>Create a design → Import file</b>
(or drag the PDF onto Canva's home page). Every page becomes an editable design. The HTML is the print master.</div>
<div class="grid">${cards}</div>
<p style="font-size:12px;color:#8b83a3;margin-top:26px">Bizzing Bee · independent study material · not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</p>
</main></body></html>`;
fs.writeFileSync('books/index.html', hub);
made.forEach(m => console.log(`Vol.${String(m.vol.n).padStart(2)} ${m.vol.title.padEnd(24)} ${String(m.pages).padStart(4)} pages`));
console.log('total pages:', made.reduce((a, m) => a + m.pages, 0));
