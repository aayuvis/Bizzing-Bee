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
eval(fs.readFileSync('books/southasia-chapters.js', 'utf8'));
eval(fs.readFileSync('books/eponym-chapters.js', 'utf8'));
eval(fs.readFileSync('books/ultra-chapters.js', 'utf8'));
eval(fs.readFileSync('books/poem-chapters.js', 'utf8'));
eval(fs.readFileSync('books/trivia-rounds.js', 'utf8'));
eval(fs.readFileSync('books/design-system/bb-anime.js', 'utf8'));
let ADVS = {};
try { const src = fs.readFileSync('adv-concepts-data.js', 'utf8'); ADVS = window.SB_ADV_CSCRIPT || {}; } catch (e) {}
const GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
/* Volume 14 is authored for the books rather than lifted from the app course:
   South Asian words in English, with its own storyboard scripts on each chapter. */
const SA = window.SB_SOUTHASIA || [];
const SA_SCRIPT = {}; SA.forEach((ch, i) => { if (ch.sc) SA_SCRIPT[String(i)] = ch.sc; });
/* Volume 19 is authored the same way: the eponyms of English, with every word
   pulled from the app's eponym-tagged library so no word data is invented. No
   storyboard scripts yet, so its chapter openers use the drawn montage. */
const EP = window.SB_EPONYMS || [];
/* Volumes 18 and 19: the last continent's own two books, generated from the 36
   champion techniques by voice/pipeline/ultra-build.js. */
const UL = window.SB_ULTRA || { mind: [], method: [] };
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
  grandtrunk: ['serpent', 'gods', 'bigbeasts', 'wildhearts'],
};
const castUsed = new Set();
function draftCast(vol) {
  /* A volume may pin its own crew (vol.cast). Pinned crews deliberately do NOT
     claim names in castUsed, so inserting a volume never reshuffles the casts —
     and the painted art of the volumes after it keeps matching their cast page. */
  if (vol.cast) return vol.cast.map(id => (CAST_DB.byId || {})[id] || { id, pack: '' });
  /* seedN pins the draft seed a volume shipped with, so renumbering the series
     does not reshuffle a crew whose painted cast page is already drawn. */
  const rnd = mulberry((vol.seedN || vol.n) * 271 + 11);
  const packs = WORLD_PACKS[vol.world] || ['hive'];
  const pool = (CAST_DB.list || []).filter(a => AV[a.id] && a.id !== vol.av && packs.includes(a.pack));
  const fresh = pool.filter(a => !castUsed.has(a.id));
  const picks = shuf(fresh.slice(), rnd).slice(0, 9);
  for (const a of shuf(pool.slice(), rnd)) { if (picks.length >= 9) break; if (!picks.includes(a)) picks.push(a); }
  picks.forEach(a => castUsed.add(a.id));
  if (process.env.BB_CAST) console.error('cast', vol.n, picks.map(x => x.id).join(' '));
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
/* Three identities per volume, because they stopped agreeing:
     vol.n     the SERIES number printed on the cover (absent on a companion)
     slugOf    the file name — book-07.html, or book-similes.html for a companion
     artOf     which art set it wears; the eponym volume was generated as b19
               before it was renumbered to 17, and the art keeps its old prefix. */
/* Which covers take ink type instead of white, measured from the art itself by
   voice/pipeline/cover-ink.py. The composition was written for dark saturated
   illustrations; the advanced volumes are light three-ink drawings now, and a
   white title over a darkening scrim both greys out the art and disappears. */
let COVER_INK = {};
try { COVER_INK = JSON.parse(fs.readFileSync('books/art/cover-ink.json', 'utf8')); } catch (e) {}
const slugOf = vol => vol.slug || ('book-' + String(vol.n).padStart(2, '0'));
const artOf = vol => vol.art || ('b' + String(vol.n).padStart(2, '0'));
const onLight = vol => ((COVER_INK[artOf(vol)] || {}).ink === 'dark');
/* the four values the cover masthead needs, flipped as one */
const inkKit = vol => onLight(vol)
  ? { fg: '#241E33', soft: 'rgba(36,30,51,.78)', shadow: '0 1px 3px rgba(255,255,255,.75)',
      top: 'linear-gradient(180deg,rgba(255,255,255,.72),rgba(255,255,255,.18) 60%,rgba(255,255,255,0))',
      foot: 'linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.78))' }
  : { fg: '#fff', soft: 'rgba(255,255,255,.92)', shadow: '0 2px 8px rgba(0,0,0,.6)',
      top: 'linear-gradient(180deg,rgba(12,9,28,.52),rgba(12,9,28,.16) 62%,rgba(12,9,28,0))',
      foot: 'linear-gradient(180deg,rgba(12,9,28,0),rgba(12,9,28,.78))' };
const REG = vol => vol.ultra ? 4 : vol.band === 'advanced' || vol.companion ? 3 : vol.n <= 4 ? 1 : 2;

/* The app's avatar cards: real titles, lore, powers and facts — the cast's voices. */
const CARD = id => { try { return SB_AV_CARD(id); } catch (e) { return null; } };

/* Bizzy is the hero of every book; the volume guide co-stars. */
const HERO = 'bizzy';

/* Chapters travel: each chapter of a volume visits the next world on the ring,
   starting from the volume's home world. */
const WORLD_CYCLE = ['meadow', 'library', 'forum', 'elements', 'engine', 'origami', 'strait', 'junkyard', 'vibe', 'stage', 'warfield', 'greysea'];
const chWorldOf = (vol, ci) => vol.cyc ? vol.cyc[ci % vol.cyc.length]
  : WORLD_CYCLE[(Math.max(0, WORLD_CYCLE.indexOf(vol.world)) + ci) % WORLD_CYCLE.length];
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clamp = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n - 1) + '…' : s; };
/* fit() is clamp's honest sibling: it keeps WHOLE SENTENCES up to the budget and
   never leaves an ellipsis on the page. A definition, a memory hook and a concept
   summary are all several sentences long in the data and only the first one or two
   ever fit a box — clamp used to cut the second one mid-word ("carrying the wo…"),
   which is the single most common complaint about these books. Where not even the
   first sentence fits, it falls back to the first clause, and only after that to a
   hard cut. */
function fit(t, n) {
  t = String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);
  let out = '';
  for (const sen of sentences) {
    if (!out) { if (sen.length <= n) out = sen; else break; continue; }
    if ((out + ' ' + sen).length > n) break;
    out += ' ' + sen;
  }
  if (out) return out.trim();
  const first = sentences[0] || t;
  for (const cl of first.split(/,\s+|\s+—\s+|;\s+/)) {
    if (cl && cl.length <= n) return cl.replace(/[,;.\s]+$/, '');
  }
  return first.slice(0, n - 1).replace(/\s+\S*$/, '') + '…';
}
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
  { n: 14, title: 'The Grand Trunk Road', tag: 'South Asian words that became English', a: '#D97A1E', d: '#8F4409', tex: 'rings', av: 'cobra', world: 'grandtrunk', band: 'advanced', authored: true,
    cyc: ['grandtrunk', 'strait', 'grandtrunk', 'meadow', 'grandtrunk', 'junkyard', 'grandtrunk', 'library', 'grandtrunk', 'stage', 'grandtrunk'],
    /* No worshipped figure appears as a cartoon character in this volume. The
       cast is a king cobra, a python, a butterfly, a paper lotus and Aryabhatta
       — a mathematician, not a god. */
    cast: ['cobra', 'python', 'aryabhatta', 'monarch', 'lotusfold', 'vasuki'],
    chapters: SA },
  { n: 15, seedN: 14, title: 'Far-Flung Words', tag: 'Origins beyond the big four', a: '#0E8A78', d: '#075C50', tex: 'cross', av: 'mic', world: 'strait', band: 'advanced', chapters: ADV.filter(ch => ch.category === 'Origins Beyond the Big Four') },
  { n: 16, seedN: 15, title: 'The Word Factory', tag: 'How English bolts words together', a: '#5B6BA8', d: '#364475', tex: 'stripes', av: 'maestro', world: 'engine', band: 'advanced', chapters: ADV.filter(ch => ch.category === 'How Words Are Built') },
  { n: 17, seedN: 17, art: 'b19', title: 'Named After Someone', tag: 'Every word here was a person first', a: '#C2586B', d: '#8A2F45', tex: 'cross', av: 'goldlegend', world: 'forum', band: 'advanced', authored: true, src: 'EP',
    cyc: ['forum', 'forum', 'engine', 'forum', 'stage', 'meadow', 'junkyard', 'meadow', 'strait', 'warfield'],
    cast: ['goldlegend', 'volt', 'phoenix', 'atom'],
    chapters: EP },
  /* The last continent. Register 4: night, letterboxed, near-monochrome with gold. */
  { n: 18, seedN: 18, art: 'b20', title: "The Champion's Mind", tag: 'Getting words in, and getting them back fast', a: '#7C5CFF', d: '#3E2A8C', tex: 'grid', av: 'encore', world: 'library', band: 'advanced', ultra: true, authored: true, src: 'UL_MIND',
    cyc: ['library', 'engine', 'library', 'greysea', 'library', 'stage', 'library', 'warfield', 'library', 'engine', 'library', 'greysea'],
    cast: ['encore', 'goldlegend', 'volt', 'atom'],
    chapters: UL.mind },
  { n: 19, seedN: 19, art: 'b21', title: "The Champion's Method", tag: 'Origin first, then the microphone', a: '#C8901B', d: '#7A5000', tex: 'diag', av: 'goldlegend', world: 'warfield', band: 'advanced', ultra: true, authored: true, src: 'UL_METHOD',
    cyc: ['warfield', 'forum', 'warfield', 'engine', 'warfield', 'strait', 'warfield', 'stage', 'warfield', 'forum', 'warfield', 'engine'],
    cast: ['goldlegend', 'phoenix', 'encore', 'volt'],
    chapters: UL.method },
];
const NAMES = { bizzy: 'Bizzy', honeypot: 'Honeypot', waggle: 'Waggle', bumble: 'Bumble', star: 'Star', diva: 'Diva', drone: 'Drone', clover: 'Clover', nectar: 'Nectar', lumen: 'Lumen', jester: 'Jester', queenhive: 'Queen Hive', blossom: 'Blossom', propolis: 'Propolis', mic: 'Mic', maestro: 'Maestro', popcorn: 'Popcorn', melody: 'Melody', naga: 'Naga' };
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
    /* The Grand Trunk Road: a dusty highway under a banyan, milestones counting
       down, kites over a distant temple and minaret — the route the words walked. */
    grandtrunk: ()=>{ const banyan=(x,k)=>`<g transform="translate(${x} ${gy}) scale(${k})">
        ${[0,1,2,3,4].map(i=>`<rect x="${-46+i*22}" y="-104" width="${7-Math.abs(2-i)}" height="104" fill="${WP.ink}"/>`).join('')}
        <ellipse cx="0" cy="-128" rx="96" ry="46" fill="rgba(255,255,255,.30)"/><ellipse cx="-52" cy="-108" rx="52" ry="28" fill="rgba(255,255,255,.24)"/><ellipse cx="54" cy="-112" rx="56" ry="30" fill="rgba(255,255,255,.24)"/>
        <ellipse cx="0" cy="-150" rx="58" ry="30" fill="rgba(255,255,255,.22)"/></g>`;
      const milestone=(x,y,k)=>`<g transform="translate(${x} ${y}) scale(${k})"><path d="M-13 0 L-13 -26 Q 0 -38 13 -26 L13 0 Z" fill="${WP.glow}"/><rect x="-13" y="-26" width="26" height="9" fill="#D97A1E"/></g>`;
      const kite=(x,y,r)=>`<g transform="translate(${x} ${y}) rotate(${r})"><path d="M0 -15 L13 0 L0 17 L-13 0 Z" fill="${WP.sun}"/><path d="M0 17 q 10 16 -4 30" stroke="${WP.glow}" stroke-width="2" fill="none"/></g>`;
      return sun(W*.18,H*.13,42)+cloud(W*.62,H*.1,.9)+cloud(W*.34,H*.2,.6)
      +hill(W*.86,W*.44,150,.13)+hill(W*.1,W*.34,104,.1)
      /* the road itself, running from the bottom edge into the haze */
      +`<path d="M${W*.28} ${H} L${W*.46} ${gy-8} L${W*.6} ${gy-8} L${W*.72} ${H} Z" fill="rgba(255,255,255,.26)"/>`
      +`<path d="M${W*.5} ${H} L${W*.53} ${gy-10}" stroke="${WP.glow}" stroke-width="4" stroke-dasharray="16 20" fill="none"/>`
      /* temple sikhara and a minaret on the skyline */
      +`<g transform="translate(${W*.7} ${gy-8})"><path d="M-34 0 L-24 -66 Q 0 -104 24 -66 L34 0 Z" fill="${WP.far}"/><circle cx="0" cy="-108" r="8" fill="${WP.sun}"/><rect x="-40" y="-8" width="80" height="10" fill="${WP.mid}"/></g>`
      +`<g transform="translate(${W*.87} ${gy-8})"><rect x="-9" y="-88" width="18" height="88" fill="${WP.far}"/><path d="M-14 -88 Q 0 -118 14 -88 Z" fill="${WP.mid}"/><circle cx="0" cy="-122" r="5" fill="${WP.sun}"/></g>`
      +banyan(W*.16,1)+milestone(W*.4,gy+6,1.1)+milestone(W*.56,gy-26,.7)+milestone(W*.6,gy-52,.5)
      +kite(W*.44,H*.16,-16)+kite(W*.58,H*.24,14)+kite(W*.3,H*.3,-8); },
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
const WORLD_NAME = { meadow: 'the Meadow', library: 'the Great Library', forum: 'the Roman Forum', elements: 'the Storm of Elements', stage: 'the Big Stage', engine: 'the Engine Room', origami: 'the Paper Mountains', strait: 'the Wide Strait', junkyard: 'the Word Junkyard', vibe: 'the Vibe', warfield: 'the Proving Ground', greysea: 'the Grey Sea', grandtrunk: 'the Grand Trunk Road' };
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
  14: 'Fifteen hundred miles of road, and a word waiting at every milestone. Naga knows them all.',
  15: 'Past the lighthouse lies every language the big four forgot. Mic has the map.',
  16: 'The Engine Room again, belts humming — this is where English bolts words together.',
  17: 'A picnic in the Meadow with every simile we own. Bring an appetite.',
  18: 'The Big Stage, house lights down. Two hundred and forty voices worth hearing.',
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
  grandtrunk: ['Baloo 2', 'baloo2-800'],
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
  .page[data-cover] .coverTitle{color:inherit}
  /* travelling world scenery: bleeds off both page edges and dissolves upward into
     the paper, so it reads as part of the page rather than a pasted-in picture */
  .worldband{position:absolute;left:0;right:0;bottom:0;height:2.2in;overflow:hidden;pointer-events:none}
  .worldband img,.worldband svg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .worldband:after{content:'';position:absolute;inset:0;
    background:linear-gradient(180deg,var(--paper) 0%,color-mix(in srgb,var(--paper) 55%,transparent) 30%,transparent 66%)}
  .peek{position:absolute;pointer-events:none}
  .tile{font-family:'BB Tile';font-weight:600;color:var(--muted)}
  .bb-head{position:absolute;top:.3in;left:.75in;right:.5in;display:flex;justify-content:space-between;align-items:baseline;
    font-family:'BB Kicker';font-size:10pt;letter-spacing:.08em;color:var(--muted);border-bottom:1px solid var(--hairline);padding-bottom:4pt}
  .page[data-verso] .bb-head{left:.5in;right:.75in}
  .bb-foot{position:absolute;bottom:.28in;left:.75in;right:.5in;display:flex;justify-content:space-between;
    font-family:'BB Kicker';font-size:10pt;color:var(--muted);z-index:3;
    text-shadow:0 1px 2px rgba(255,255,255,.95),0 0 6px rgba(255,255,255,.85)}
  .page[data-verso] .bb-foot{left:.5in;right:.75in}
  .bb-panelbox{background:var(--card);border:1px solid var(--hairline);border-radius:var(--r-panel);padding:.12in .15in;box-shadow:var(--sh-screen)}
  /* min-height so the .cameo avatar (.62in, vertically centred) always fits inside
     the box — a short concept used to make a box shorter than its own portrait,
     which is what the audit was reading as clipped content. */
  .bb-bigidea{padding:.06in .85in .06in .44in;position:relative;font-size:13pt;line-height:1.52;min-height:.78in;display:flex;align-items:center}
  .bb-bigidea:before{content:'“';position:absolute;left:0;top:-.12in;font-family:'BB Display';font-size:44pt;color:var(--accent)}
  .bb-bigidea .cameo{position:absolute;right:.06in;top:50%;transform:translateY(-50%) rotate(4deg)}
  .bb-promove{background:var(--ink);color:#F4EFFF;border-radius:var(--r-panel);padding:.16in .18in;max-height:none;
    font-size:10.6pt;line-height:1.46}
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
  /* full-bleed story page: no padding, art to every edge */
  .page.an-full{padding:0;background:#241E33}
  .page.an-full > img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
  .an-title{position:absolute;left:0;right:0;top:0;padding:.4in .5in .75in;
    background:linear-gradient(180deg,rgba(12,9,28,.7) 0%,rgba(12,9,28,.46) 52%,rgba(12,9,28,0) 100%)}
  .an-title-in{display:flex;align-items:center;gap:.16in}
  .an-title .n{display:inline-grid;place-items:center;width:.52in;height:.52in;flex-shrink:0;border-radius:14pt;
    background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:17pt;
    box-shadow:0 2pt 8pt rgba(0,0,0,.45)}
  .an-title .k{display:block;font-family:'BB Kicker';font-size:9pt;letter-spacing:.09em;text-transform:uppercase;
    color:rgba(255,255,255,.92);text-shadow:0 1px 4px rgba(0,0,0,.6)}
  .an-title .t{display:block;font-family:'BB World','BB Display';font-weight:800;font-size:24pt;line-height:1.06;color:#fff;
    -webkit-text-stroke:1.6pt rgba(20,14,44,.5);paint-order:stroke fill;text-shadow:0 3px 10px rgba(0,0,0,.5)}
  .an-foot{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;
    gap:.14in;padding:.5in .32in .2in;background:linear-gradient(180deg,rgba(12,9,28,0),rgba(12,9,28,.62))}
  .an-folio{position:absolute;right:.28in;bottom:.05in;font-family:'BB Kicker';font-size:10pt;color:rgba(255,255,255,.9)}
  /* comic speech balloons: sit BESIDE the speaker, with a tail pointing at them */
  .an-bub{position:absolute;background:#fff;border:2pt solid var(--ink);border-radius:20pt;padding:11pt 12pt 9pt;
    font-family:'BB Display';font-size:${vol.band === 'advanced' ? '10.2pt' : '11pt'};line-height:1.36;
    box-shadow:0 4pt 12pt rgba(26,18,54,.35);transform:translateY(-50%)}
  /* the speaker is announced on a comic name-plate pinned to the balloon's rim */
  .an-bub .nm{display:inline-block;font-family:'BB Kicker';font-size:8.4pt;letter-spacing:.09em;text-transform:uppercase;
    color:#fff;background:var(--accent-deep);border:1.6pt solid var(--ink);border-radius:999px;padding:1.5pt 9pt;
    position:absolute;top:-8.5pt;left:11pt;white-space:nowrap;box-shadow:0 2pt 5pt rgba(26,18,54,.32)}
  .an-bub .say{display:block}
  /* Open lines: no box at all. Short lines ride the art as heavy white type with a
     dark halo, exactly the way UH-OH! does, so they cover almost nothing. */
  .an-open{position:absolute;transform:translateY(-50%);font-family:'BB Display';
    font-size:${vol.band === 'advanced' ? '12.4pt' : '13.6pt'};line-height:1.22;color:#fff;
    text-shadow:0 0 2pt rgba(14,9,32,.95),0 2pt 0 rgba(14,9,32,.75),0 3pt 14pt rgba(14,9,32,.85),0 0 22pt rgba(14,9,32,.6)}
  .an-open .nm{display:block;font-family:'BB Kicker';font-size:8.6pt;letter-spacing:.12em;text-transform:uppercase;
    color:#FFE9AE;margin-bottom:1.5pt;text-shadow:0 1pt 4pt rgba(14,9,32,.95)}
  .an-open.vex{color:#FFD9E1}
  .an-open.vex .nm{color:#FF9DB4}
  /* Vex shouts from a jagged balloon — classic comic villain treatment */
  .an-bub.shout{background:#FFF1F4;border-color:var(--tricky-deep);border-radius:6pt}
  .an-bub.shout .nm{background:var(--tricky-deep)}
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
  /* ---- the poems companion: one poem to a page, painted the whole way through ----
     One full-bleed plate sits under every page, like "The Road Not Taken" — the
     painting stays present through the leaf instead of getting boxed into a
     rectangle that reads as pasted on. --pm-tint, set per page from the
     piece's subject, washes the paper itself, so the page's own colour carries
     the mood as far as the painting does. The picture runs DARKER through its
     open passages (sky, water, empty ground) and a soft tinted pool sits behind
     the poem itself, so the words are never fighting the art for a reader's eye. */
  .pm-page{position:relative;overflow:hidden;display:flex;flex-direction:column;
    background-color:color-mix(in srgb,var(--paper) 66%,var(--pm-tint,var(--paper)) 34%)}
  .pm-ground{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.42;z-index:0;filter:saturate(.88)}
  .pm-page > .pm-head,.pm-page > .pm-body,.pm-page > .pm-gloss{position:relative;z-index:1}
  /* the poem rides the middle of whatever room the page gives it — a haiku
     reads as centred on the painting, not stranded up against the running head */
  .pm-page .pm-gloss{margin-top:auto;margin-bottom:.30in}
  .bb-head + .pm-head{margin-top:.15in}
  .pm-head{margin-bottom:.13in}
  .pm-head h2{margin:.02in 0 .01in;line-height:1.12;color:var(--ink)}
  .pm-by{font-family:'BB Kicker';font-size:9.6pt;color:var(--accent-deep)}
  .pm-body{display:flex;gap:.20in;align-items:stretch;margin-bottom:.10in;flex:1 1 auto}
  .pm-col{flex:1;min-width:0;position:relative;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
  /* the lighter pool behind the text — a soft radial wash of the page's own
     tint, so the words sit on calm colour while the painting stays full
     strength everywhere the pool fades out. It used to bleed sideways past
     its own column on a negative inset and cut a hard seam straight through
     the tile box next door — contained to the column's own width now (only
     the vertical reach is generous), and overflow:hidden on .pm-col is the
     backstop so it can never again paint outside its own box. */
  .pm-col:before{content:'';position:absolute;inset:-.34in 0;z-index:0;pointer-events:none;
    background:radial-gradient(ellipse at center,
      color-mix(in srgb,var(--pm-tint,var(--paper)) 88%,var(--paper) 12%) 0%,
      color-mix(in srgb,var(--pm-tint,var(--paper)) 55%,transparent) 60%, transparent 86%)}
  /* the poem itself is set in the light, variable body face, not the display
     face the rest of the book uses — a whole soliloquy at display weight reads
     as shouting. Mood is carried by weight and tracking within that one family,
     never past 520 (a firm read, not a bold one). */
  .pm-text{position:relative;z-index:1;font-family:'BB Body';font-weight:430;color:var(--ink);overflow-wrap:break-word}
  .pm-text.pm-mood-bold{font-weight:520;letter-spacing:.012em}
  .pm-text.pm-mood-serif{font-weight:460}
  .pm-text.pm-mood-soft{font-weight:400;letter-spacing:.01em}
  .pm-tiles{flex:0 0 2.15in;display:flex;flex-direction:column;gap:.11in;justify-content:center}
  .pm-tile{background:color-mix(in srgb,var(--pm-tint,var(--accent)) 22%,var(--card) 78%);
    border-left:2.5pt solid var(--accent);border-radius:0 8px 8px 0;padding:.09in .11in;
    box-shadow:0 2px 8px rgba(20,14,40,.06)}
  .pm-tile p{margin:2pt 0 0;font-size:9.2pt;line-height:1.38;color:var(--ink)}
  .pm-tk{font-family:'BB Kicker';font-size:7.6pt;letter-spacing:.10em;text-transform:uppercase;color:var(--accent-deep)}
  .pm-gloss{position:relative;z-index:1;margin-top:.16in;padding:.10in .12in;border-radius:10px;
    background:color-mix(in srgb,var(--pm-tint,var(--paper)) 78%,var(--paper) 22%);
    border-top:1pt solid color-mix(in srgb,var(--accent) 30%,transparent);
    display:grid;grid-template-columns:1fr 1fr 1fr;gap:.05in .16in}
  .pm-g{font-size:8.2pt;line-height:1.3;break-inside:avoid}
  .pm-g b{font-family:'BB Display';font-size:9.4pt;display:block;color:var(--ink)}
  .pm-g i{font-family:'BB Mono';font-size:7.4pt;font-style:normal;color:var(--accent-deep);display:block}
  .pm-g span{color:var(--muted);display:block}
  .bb-hive{display:grid;grid-template-columns:1fr 1fr;gap:.12in}
  .bb-card{padding:0 .04in;min-width:0;overflow-wrap:anywhere}
  .bb-card .ex{font-size:9.6pt;line-height:1.32;margin-top:2px;color:var(--ink);opacity:.85}
  /* --wsz is set per word from its own length: a 45-letter headword at 23pt is
     four inches of type in a three-inch column, and it took the whole spread
     with it. Wrapping is allowed as a last resort for the true monsters. */
  .bb-card .w{font-family:'BB Body';font-weight:800;font-size:var(--wsz,23pt);line-height:1.06;
    font-variant-numeric:tabular-nums;color:var(--accent-deep);overflow-wrap:anywhere;hyphens:auto}
  .bb-card .say{overflow-wrap:anywhere}
  .bb-card .say{font-family:'BB Tile';font-size:10pt;color:var(--muted);margin-top:1px}
  .bb-card .d{font-size:10.6pt;line-height:1.38;margin-top:2px}
  .bb-card .hook{font-size:9.8pt;line-height:1.32;margin-top:2px;color:var(--chip-ink);font-style:italic}
  /* An eponym's provenance is the fact a speller actually uses at the microphone:
     "named after a French chemist" decides more letters than the definition does. */
  .bb-card .after{font-size:9.4pt;line-height:1.34;margin-top:3px;padding-left:.09in;
    border-left:2.2pt solid var(--accent);color:var(--ink)}
  .bb-card .after b{font-variant:small-caps;letter-spacing:.04em;font-size:8.4pt;color:var(--muted)}
  .bb-writeline{border-bottom:1pt solid var(--ink);height:${lineH};margin-top:4pt}
  .bb-rapid{display:grid;grid-template-columns:1fr 1fr;gap:.08in .16in}
  .bb-row{padding:4pt 0;min-height:.52in;font-size:10.4pt;line-height:1.36;border-bottom:1px dotted var(--hairline);
    min-width:0;overflow-wrap:anywhere}
  .bb-row b{font-family:'BB Kicker';color:var(--accent-deep)}
  .bb-row b.long{font-size:8.6pt}.bb-row b.xlong{font-size:7.4pt}
  .bb-break{margin-top:.18in;display:flex;gap:.13in;align-items:flex-start;background:linear-gradient(90deg,var(--treasure-tint),transparent 85%);border-left:4pt solid var(--treasure);border-radius:2pt 14pt 14pt 2pt;padding:.09in .14in}
  .bb-break .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--treasure-deep)}
  .bb-break .b{font-size:11.2pt;line-height:1.4;margin-top:2px}
  .bb-break .t{font-size:10pt;color:var(--muted);margin-top:2px}
  .bb-check{border-left:4pt solid var(--right);padding:.07in .12in .07in .14in}
  .bb-check .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--right-deep);margin-bottom:3.5pt}
  .bb-vex{background:linear-gradient(90deg,#FFF1F3,transparent 88%);border-left:4pt solid var(--tricky);border-radius:2pt 12pt 12pt 2pt;padding:.07in .12in .07in .14in;display:flex;gap:.12in;align-items:flex-start}
  .bb-vex .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--tricky-deep);margin-bottom:3.5pt}
  .bb-trap{background:var(--listen-tint);border-left:4pt solid var(--listen);border-radius:2pt 12pt 12pt 2pt;padding:.07in .12in .07in .14in}
  .bb-trap .l{font-family:'BB Kicker';font-size:8.8pt;letter-spacing:.1em;text-transform:uppercase;color:var(--listen-deep);margin-bottom:3.5pt}
  .bb-quiz{counter-reset:q}
  .bb-quiz .q{margin-bottom:.16in;break-inside:avoid}
  .bb-quiz .q .qq{font-family:'BB Display';font-size:12pt;line-height:1.34;margin-bottom:3pt}
  .bb-quiz .q .opt{display:flex;gap:6pt;align-items:baseline;font-size:10.6pt;line-height:1.42;padding:1.5pt 0}
  .bb-quiz .q .opt i{font-style:normal;font-family:'BB Kicker';color:var(--accent-deep);width:.18in;flex-shrink:0}
  .bb-audio{display:inline-flex;align-items:center;gap:5pt;background:var(--listen-tint);border:1px solid var(--listen);color:var(--listen-deep);
    border-radius:999px;padding:3pt 10pt;font-family:'BB Kicker';font-size:9.2pt;max-height:.3in}
  .bb-xword{border-collapse:collapse;margin:0 auto}
  .bb-xword td{width:var(--xw,.44in);height:var(--xw,.44in);position:relative}
  .bb-xword .c{background:var(--card);border:1.4px solid var(--chip-ink)}
  .bb-xword .c i{position:absolute;top:1.5px;left:3px;font-style:normal;font-size:7pt;color:var(--muted)}
  .bb-clues{display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:10.2pt;line-height:1.44}
  .bb-clues h3{font-size:11.5pt;color:var(--accent-deep);margin-bottom:2pt}
  .bb-clues b{color:var(--chip-ink)}
  .bb-search{border-collapse:collapse;margin:0 auto}
  .bb-search td{width:.42in;height:.42in;text-align:center;font-family:'BB Tile';font-size:12.5pt;background:var(--card);border:1px solid var(--hairline)}
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
  const q = shuf(QUOTES.filter(x => x.q.length < 88).slice(), rq);
  const s = shuf(FIG.similes.filter(x => (x.p + x.m).length < 104).slice(), rs);
  const i = shuf(FIG.idioms.filter(x => (x.p + x.m).length < 104).slice(), ri);
  const facts = (cast || []).map(a => ({ a, cd: CARD(a.id) })).filter(x => x.cd && x.cd.fact && x.cd.fact.length < 150);
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
/* A balloon has room for about a dozen words. The narration paragraph does not fit,
   and clamping it mid-clause is what left "First you say the word. Then…" on the
   page. So take the scene's own short caption when there is one, else the first
   whole sentence of the narration, else its first clause — a complete thought that
   fits, rather than a truncated one that does not. */
function comicLine(sc, maxW) {
  const words = t => String(t || '').trim().split(/\s+/).filter(Boolean).length;
  const cap = String((sc && sc.cap) || '').trim();
  if (cap && words(cap) <= maxW) return cap.replace(/[.\s]+$/, '');
  const say = String((sc && sc.say) || '').replace(/\s+/g, ' ').trim();
  const sentences = say.split(/(?<=[.!?])\s+/).filter(Boolean);
  for (const sen of sentences) if (words(sen) <= maxW) return sen.trim();
  /* no whole sentence fits: take the first clause of the first sentence */
  const first = sentences[0] || say;
  const clauses = first.split(/,\s+|\s+—\s+|;\s+/).filter(Boolean);
  for (const cl of clauses) if (words(cl) <= maxW) return cl.replace(/[,;.\s]+$/, '');
  if (cap) return wordsClamp(cap, maxW);
  return wordsClamp(first, maxW);
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
  const maxW = reg >= 3 ? 15 : 12;   // balloons stay small so the art breathes
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
      line: comicLine(sc, maxW), prop: propText(sc) };
  });
  const uid = `op${vol.n}x${ci}`;
  const svg = ANIME.storyboard(sceneList.map(s => ({ avId: s.avId, mood: s.mood, vex: s.vex })),
    { W: 725, H: 830, world, reg, uid, seed: vol.n * 1009 + ci * 13 });
  /* storyboard() places figures at x=78% on even beats and x=20% on odd ones.
     Each balloon sits on the free side of its own speaker with a tail pointing
     back at them — so the words are next to the mouth that said them, and the
     character stays uncovered. */
  /* Balloons hug the outer edge on the side AWAY from their speaker and take a
     third of the width, not half — the figures in the painted art are large, and a
     half-width balloon starting at 5% inevitably crossed them. Anything short
     enough goes out with no box at all, which covers nothing but a little sky. */
  const OPEN_W = 10;                       // words that fit on an open line
  const caps = sceneList.map((s, i) => {
    const t = i / Math.max(1, sceneList.length - 1);
    const topPct = (.235 + t * .62) * 100;   // starts below the title banner, ends above the footer
    /* Every painted opener puts the moth in the storm stretch on the right — the
       prompt asked for it there — so Vex's line always goes left, whatever beat it
       falls on. The rest alternate with their figures. */
    const figRight = s.vex ? true : (i % 2 === 0);
    /* a bare dash is not a word */
    const wordN = String(s.line).trim().split(/\s+/).filter(w => w && !/^[—–-]+$/.test(w)).length;
    const open = wordN <= OPEN_W;
    const sfx = reg >= 3 ? '' : s.vex ? `<span class="an-sfx" style="position:absolute;top:${topPct - 9}%;${figRight ? 'right:6%' : 'left:6%'}">UH-OH!</span>`
      : s.mood === 'excited' ? `<span class="an-sfx" style="position:absolute;top:${topPct - 9}%;${figRight ? 'right:6%' : 'left:6%'}">GOT IT!</span>` : '';
    if (open) {
      const side = figRight ? 'left:4.5%;width:36%' : 'right:4.5%;width:36%;text-align:right';
      return `${sfx}<div class="an-open${s.vex ? ' vex' : ''}" style="top:${topPct}%;${side}">
        <span class="nm">${esc(s.vex ? 'Vex' : s.name)}</span>${esc(s.line)}</div>`;
    }
    const side = figRight ? 'left:4.5%;width:37%' : 'right:4.5%;width:37%';
    const tailCls = figRight ? 'r' : 'l';   // tail points toward the figure
    return `${sfx}<div class="an-bub ${tailCls}${s.vex ? ' shout' : ''}" style="top:${topPct}%;${side}">
      <span class="nm">${esc(s.vex ? 'Vex' : s.name)}</span>
      <span class="say">${esc(s.line)}</span>
      <span class="tail"><i></i></span></div>`;
  }).join('');
  /* The opener IS the page: art bleeds to every edge, the chapter title rides a
     scrim that dissolves into the sky, and the balloons sit over the art. */
  const artSrc = artAt(`b${String(vol.n).padStart(2, '0')}-ch${String(ci + 1).padStart(2, '0')}-opener`);
  return `<div class="page an-full" data-vol="${vol.n}">
    ${artSrc ? artImg(artSrc) : `<svg viewBox="0 0 725 830" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">${svg}</svg>`}
    <div class="an-title"><div class="an-title-in">
      <span class="n">${ci + 1}</span>
      <span style="min-width:0">
        <span class="k">${esc(ch.category)} · ${esc(WORLD_NAME[world] || world)}</span>
        <span class="t">${esc(clamp(ch.title, 54))}</span></span>
    </div></div>
    ${caps}
    <div class="an-foot">
      <span class="bb-audio" style="background:rgba(255,255,255,.9)">&#9835; narrated</span>
      <span style="font-family:'BB Kicker';font-size:9.6pt;color:#fff;text-shadow:0 1px 5px rgba(0,0,0,.7)">turn the page — the whole trick, explained →</span>
    </div>
    <div class="an-folio">${folio}</div></div>`;
}

/* ---------------- chapter pages ---------------- */
function teachPage(vol, ch, ci, folio, nextBreak) {
  const reg = REG(vol);
  /* a tall pro-move plus four cards plus three alerts cannot share one page —
     when the method runs long, show fewer cards so nothing gets pushed off */
  const methodLines = String(ch.method || '').split('\n').filter(l => l.trim()).length;
  const cards = (ch.cards || []).slice(0, methodLines >= 6 ? 2 : methodLines >= 4 ? 3 : 4);
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
    vexW && vexW.hook ? `<div class="bb-vex">${VEX('0.42in')}<div><div class="l">Vex alert</div><div style="font-size:9.8pt;line-height:1.35">${esc(fit(vexW.hook, 96))}</div></div></div>` : '',
    traps.length ? `<div class="bb-trap"><div class="l">Sound trap</div><div style="font-size:9.8pt;line-height:1.35">${traps.map(t => `<b>${esc(t.w)}</b> sounds like <i>${esc(t.twins.slice(0, 2).join(', '))}</i>`).join(' · ')} — at the mic, always ask for the meaning.</div></div>` : '',
    `<div class="bb-check"><div class="l">Check yourself</div><div style="font-size:9.8pt;line-height:1.35">${checkLine}</div></div>`,
  ].filter(Boolean);
  return `<div class="page" data-vol="${vol.n}">
    ${head(vol, ch, ci, 'The idea')}
    <div style="margin-top:.4in" class="kick">The big idea</div>
    <div class="bb-bigidea">${esc(fit(ch.concept, 300))}<span class="cameo">${avatar(vol.av, '.62in')}</span></div>
    ${ch.method ? `<div class="kick" style="margin-top:.14in">The pro move</div><div class="bb-promove">${String(ch.method).split('\n').map(l => l.trim()).filter(Boolean).slice(0, 6).map(l => `<div class="ln">${l}</div>`).join('')}</div>` : ''}
    ${cards.length ? `<div class="bb-sticky">${cards.map(cd => `<div class="card"><h3>${esc(cd.title)}</h3><p>${esc(fit(cd.body, 200))}</p></div>`).join('')}</div>` : ''}
    <div style="display:grid;grid-template-columns:repeat(${alerts.length},1fr);gap:.16in;margin-top:.18in">${alerts.join('')}</div>
    ${(cards.length >= 4 || String(ch.method || '').split('\n').filter(Boolean).length >= 6 || (alerts.length >= 3 && cards.length >= 3)) ? '' : nextBreak()}
    ${foot(vol, folio)}</div>`;
}
/* ---------------- the checkpoint quiz, built from the chapter itself ----------------
   The quiz used to reuse the Word Atlas unit's own MCQs, whose decoys are drawn from
   OTHER chapters — so "what is the big idea of The Champion's Routine?" offered the
   summaries of un-, -tion and com- as the wrong answers. On a screen, inside a
   sequence, that is survivable; on paper it reads as nonsense.

   These questions are built from the chapter's own ten words, so every option is a
   sibling of the right one: a definition against three definitions from the same
   chapter, a spelling against three near-misses of itself, a memory hook against
   three words that share the page. Each option is a word, an origin or one short
   definition, so nothing needs truncating either. */
const NEAR_MISS = w => {
  /* plausible misspellings of a word: double a doubled-able letter, drop a double,
     swap the classic vowel confusions, flip ie/ei. */
  const out = [];
  const push = x => { if (x && x !== w && !out.includes(x) && /^[a-z' -]+$/i.test(x)) out.push(x); };
  push(w.replace(/([bcdfglmnprst])\1/, '$1'));                       // accommodate -> acomodate
  if (!/([bcdfglmnprst])\1/.test(w)) {
    const i = w.slice(1).search(/[bcdfglmnprst]/);
    if (i >= 0) push(w.slice(0, i + 1) + w[i + 1] + w.slice(i + 1));  // practice -> pracctice
  }
  push(w.replace(/ie/, 'ei')); push(w.replace(/ei/, 'ie'));
  push(w.replace(/ance$/, 'ence')); push(w.replace(/ence$/, 'ance'));
  push(w.replace(/able$/, 'ible')); push(w.replace(/ible$/, 'able'));
  push(w.replace(/ar$/, 'er')); push(w.replace(/er$/, 'ar')); push(w.replace(/or$/, 'er'));
  push(w.replace(/([aeiou])\1/, '$1'));                              // committee -> commitee
  push(w.replace(/tion$/, 'sion')); push(w.replace(/sion$/, 'tion'));
  push(w.replace(/^([a-z])([aeiou])/, (x, a, b) => a + (b === 'e' ? 'i' : b === 'i' ? 'e' : b === 'a' ? 'e' : b)));
  return out;
};
function chapterQuiz(vol, ch, rnd) {
  const words = (ch.words || []).filter(w => w && w.w && String(w.w).length > 2);
  if (words.length < 4) return [];
  const short = t => String(t || '').replace(/\s+/g, ' ').trim();
  const fits = t => short(t).length <= 140;
  const qs = [];
  const pool = shuf(words.slice(), rnd);

  /* 1-2 — meaning, decoys from the same chapter */
  const defWords = pool.filter(w => fits(w.def));
  for (const w of defWords.slice(0, 2)) {
    const others = shuf(defWords.filter(x => x !== w), rnd).slice(0, 3).map(x => short(x.def));
    if (others.length < 3) break;
    qs.push({ q: 'What does <b>' + esc(w.w) + '</b> mean?', c: [short(w.def)].concat(others) });
  }
  /* 3 — spelling, decoys are near-misses of the word itself */
  const spell = pool.find(w => NEAR_MISS(String(w.w).toLowerCase()).length >= 3);
  if (spell) {
    const w = String(spell.w).toLowerCase();
    qs.push({ q: 'Which spelling is correct?', c: [spell.w].concat(shuf(NEAR_MISS(w), rnd).slice(0, 3)) });
  }
  /* 4 — the memory hook, decoys are words off the same page */
  const hookW = pool.find(w => w.hook && fits(w.hook));
  if (hookW) {
    const others = shuf(pool.filter(x => x !== hookW), rnd).slice(0, 3).map(x => x.w);
    qs.push({ q: '&ldquo;' + esc(short(hookW.hook)) + '&rdquo; &mdash; which word is that about?', c: [hookW.w].concat(others) });
  }
  /* 5 — the example sentence with the word cut out */
  const exW = pool.find(w => w.ex && String(w.ex).toLowerCase().includes(String(w.w).toLowerCase()) && fits(w.ex));
  if (exW) {
    const re = new RegExp(String(exW.w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig');
    const gap = short(exW.ex).replace(re, '▁▁▁');
    const others = shuf(pool.filter(x => x !== exW), rnd).slice(0, 3).map(x => x.w);
    qs.push({ q: 'Which word fills the gap? &ldquo;' + esc(gap) + '&rdquo;', c: [exW.w].concat(others) });
  }
  /* 6 — which of these belongs to this chapter (the only cross-chapter question,
     and the one place a foreign word is the POINT rather than a distraction) */
  const mine = pool[0];
  const strangers = shuf((GEN.filter(x => x !== ch).flatMap(x => (x.words || []).slice(0, 2))), rnd)
    .filter(x => x && x.w && !words.some(y => y.w === x.w)).slice(0, 3).map(x => x.w);
  if (mine && strangers.length === 3) {
    qs.push({ q: 'Which word belongs to this chapter&rsquo;s family?', c: [mine.w].concat(strangers) });
  }
  return qs;
}
/* checkpoint quiz page — built from the chapter's own words (see chapterQuiz) */
function quizPage(vol, ch, ci, qs, cast, rnd, keys, folio) {
  const built = chapterQuiz(vol, ch, rnd);
  if (!built.length) return null;
  const reg = REG(vol);
  const host = cast[(ci + 2) % cast.length];
  const totLen = built.reduce((a, q) => a + q.q.length + q.c.join('').length, 0);
  const picked = built.slice(0, totLen > 1000 ? 4 : built.length);
  const letters = 'ABCD';
  const ans = [];
  /* Questions carry a little markup (the word in bold, curly quotes), so they are
     pre-escaped by chapterQuiz; options are plain text and escaped here. Neither is
     truncated — chapterQuiz only ever picks material that already fits. */
  const qHtml = picked.map((q, i) => {
    const opts = q.c.map((c, k) => ({ c, ok: k === 0 })); shuf(opts, rnd);
    ans.push(letters[opts.findIndex(o => o.ok)]);
    return `<div class="q"><div class="qq">${i + 1}. ${q.q}</div>
      ${opts.map((o, k) => `<div class="opt"><i>${letters[k]}</i><span>${esc(String(o.c))}</span></div>`).join('')}</div>`;
  }).join('');
  keys.push(`<div><b>Ch. ${ci + 1} checkpoint</b> — ${ans.map((a, i) => (i + 1) + ':' + a).join('  ')}</div>`);
  const intro = reg === 1 ? 'Circle your answer, then check the back. No pressure — wrong answers are how the right ones stick.'
    : reg === 2 ? 'Six questions on the chapter you just read. Circle your answers, then check the back.'
    : 'This checkpoint is gated at 90% — five of six, minimum. Circle, then verify at the back.';
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
     </div>
      <div class="bb-hive" style="margin-top:.12in">${seg.map(w => { const say = w.say || ''; const ipa = ipaOf(w.w, say);
        const L = w.w.length;
        const wsz = L > 34 ? 10 : L > 26 ? 12.5 : L > 20 ? 15 : L > 16 ? 18 : L > 13 ? 20.5 : 23;
        const ssz = L > 26 ? 7.6 : L > 20 ? 8.4 : L > 16 ? 9.2 : 10;
        return `<div><div class="bb-card" style="--wsz:${wsz}pt"><div class="w">${esc(w.w)}</div>
        <div class="say" style="font-size:${ssz}pt">${say ? '/ ' + esc(say) + ' /' : ''}${ipa ? '  ·  /' + esc(ipa) + '/' : ''}</div>
        <div class="d">${esc(fit(w.def, 210))}</div>${w.hook ? `<div class="hook">hook: ${esc(fit(w.hook, 130))}</div>` : ''}
        ${w.after ? `<div class="after"><b>named after</b> ${esc(fit(w.after, 150))}</div>` : ''}
        ${w.ex ? `<div class="ex">${esc(maskDef(fit(w.ex, 240), w.w))}</div>` : ''}</div>
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
      <div class="bb-rapid" style="margin-top:.12in">${seg.map(w => `<div class="bb-row"><b class="${w.w.length > 26 ? 'xlong' : w.w.length > 18 ? 'long' : ''}">${esc(w.w)}</b> <span class="tile" style="font-size:${w.w.length > 22 ? '7.2' : '8.8'}pt">${w.say ? '/' + esc(w.say) + '/' : ''}</span><br>${esc(fit(w.def, 230))}${w.after ? `<br><span style="color:var(--muted);font-size:8.6pt">after ${esc(fit(w.after.split(/,| — |, the /)[0], 40))}</span>` : ''}</div>`).join('')}</div>
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
      const clue = p => `<div><b>${p.n}.</b> ${esc(maskDef(fit(p.def, 84), p.w))}</div>`;
      /* Big cells for small hands, but the grid has to leave room for the clue list
         underneath it: cap by the width budget AND by the height budget, so a tall
         puzzle shrinks its cells instead of pushing the clues off the page. */
      const cols = cw.c1 - cw.c0 + 1, gridRows = cw.r1 - cw.r0 + 1;
      const cell = Math.min(0.44, 6.6 / Math.max(1, cols), 4.0 / Math.max(1, gridRows)).toFixed(3);
      body = `<div class="bb-xword-wrap" style="display:flex;justify-content:center"><table class="bb-xword" style="--xw:${cell}in">${rows}</table></div>
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
      <div><div class="kick">${esc(host.name)}'s puzzle page</div><h2 style="font-size:20pt">${title}</h2></div></div>
    <div style="margin-top:.1in">${body}</div>
    <!-- The puzzle page carries a grid, a clue list and a painted band; a Bee Break
         on top of that is what put a yellow box underneath the world strip. The
         break it does not consume simply goes to the next page that has room. -->
    ${worldStrip(chWorldOf(vol, ci), vol, ci * 11 + 5)}
    ${foot(vol, folio)}</div>`;
}

/* shared front/back matter — v6 covers are dense ensemble keyframes:
   Bizzy front and centre in motion, the guide and crew around, letter tiles
   raining through the scene, the world's own props on the ground. */
function cover(vol, nCh, nWords, label, cast) {
  const W = 816, H = 1056;
  const reg = REG(vol);
  const crew = [vol.av].concat((cast || []).slice(0, 3).map(a => a.id));
  const coverArt = artAt(`${artOf(vol)}-cover`);
  const K = inkKit(vol);
  return `<div class="page" data-cover data-vol="${vol.n}" style="color:${K.fg};padding:0;background:${onLight(vol) ? '#F6F3EC' : '#241E33'}">
    ${coverArt ? artImg(coverArt) : `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true">
      ${ANIME.ensemble({ W, H, world: vol.world, reg, seed: vol.n * 977, uid: 'cov' + vol.n,
        hero: HERO, crew, title: vol.title, vex: vol.band === 'advanced',
        skyKey: reg >= 3 ? 'dusk' : vol.n % 2 ? 'gold' : 'day' })}
    </svg>`}
    <!-- One centred masthead: Bizzy, then the series name, then the volume line,
         then the title. The old cover put the series name top-left, the volume in a
         top-right pill and the title floating at a jaunty angle, which read as three
         unrelated labels rather than one book. -->
    <span style="position:absolute;left:0;right:0;top:0;height:46%;background:${K.top}"></span>
    <div style="position:absolute;top:.46in;left:.4in;right:.4in;text-align:center">
      <div style="display:flex;align-items:center;justify-content:center;gap:.11in">
        ${bizzyMark('.34in')}
        <span class="disp" style="font-size:19pt;letter-spacing:.01em;text-shadow:${K.shadow}">The Bizzing Bee</span>
      </div>
      <div style="font-family:'BB Kicker';letter-spacing:.2em;font-size:10.5pt;margin-top:.06in;color:${K.soft};text-shadow:${K.shadow}">${esc(label)}${vol.companion ? '' : ' &middot; BOOK ' + vol.n}</div>
      <h1 class="coverTitle" style="font-size:54pt;line-height:.96;margin-top:.2in;color:${K.fg};text-shadow:${K.shadow}">${esc(vol.title)}</h1>
      <p style="font-family:'BB Kicker';font-size:14pt;max-width:5.8in;margin:.14in auto 0;color:${K.soft};${onLight(vol)
        ? 'background:rgba(255,255,255,.76);border-radius:.09in;padding:.05in .14in;display:inline-block'
        : 'text-shadow:' + K.shadow}">${esc(vol.tag)}</p></div>
    <div style="position:absolute;left:0;right:0;bottom:0;height:1.7in;background:${K.foot}"></div>
    <!-- The three facts are the only thing at the foot now, centred and big enough
         to read across a room. The cast-and-world line that used to sit beside them
         said nothing a reader could use. -->
    <div style="position:absolute;left:.5in;right:.5in;bottom:.6in;display:flex;justify-content:center;gap:.14in;flex-wrap:wrap">
      ${[nCh + ' chapters', nWords + ' practice words', 'quizzes &amp; puzzles'].map(t => coverPill(t, vol)).join('')}</div>
  </div>`;
}
/* The masthead bee. Painted art when the avatar PNG is there, the drawn anime
   Bizzy otherwise, so a cover never ships without her. */
function bizzyMark(size) {
  const src = avaPng(HERO);
  if (src) return `<img src="${src}" alt="" style="width:${size};height:${size};object-fit:contain;filter:drop-shadow(0 2px 5px rgba(0,0,0,.5))">`;
  return `<span style="display:inline-block;width:${size};height:${size}">${VEX ? '' : ''}${ANIME.portrait(HERO, size, { k: 'mk' + (_pk++) })}</span>`;
}
/* The cover fact pill: warm honey glass rather than a grey scrim, and sized to be
   read rather than squinted at. */
function coverPill(t, vol) {
  return `<span style="display:inline-block;background:linear-gradient(160deg,rgba(255,210,77,.94),rgba(240,169,60,.94));
    color:#3E2708;border-radius:999px;padding:.085in .26in;font-family:'BB Display';font-weight:800;font-size:12.5pt;
    letter-spacing:.01em;box-shadow:0 3pt 10pt rgba(12,9,28,.4), inset 0 -2pt 0 rgba(140,86,10,.28)">${t}</span>`;
}
/* a slim world band that carries the journey's scenery onto working pages */
function worldStrip(world, vol, seedK) {
  const uid = 'ws' + vol.n + 'x' + seedK;
  const reg = REG(vol);
  const stripArt = artAt(`strip-${world}-r${reg}`);
  if (stripArt) return `<div class="worldband" aria-hidden="true">${artImg(stripArt)}</div>`;
  return `<div class="worldband" aria-hidden="true">
    <svg viewBox="0 0 725 120" preserveAspectRatio="xMidYMax slice">
      <defs>${ANIME.filters(uid)}</defs>
      ${ANIME.sky(world, reg >= 3 ? 'think' : 'happy', 725, 120, reg, uid)}
      ${ANIME.ground(world, 725, 120, reg)}
      ${ANIME.env(world, 725, 120, 96, reg, uid, seedK)}
      ${ANIME.particles(world, 725, 120, seedK * 3 + 1, reg, uid)}</svg></div>`;
}
function dividerPage(vol, folio) {
  const W = 816, H = 1056;
  const reg = REG(vol);
  const divArt = artAt(`${artOf(vol)}-divider`);
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
      <div style="font-size:9.6pt;color:var(--muted);line-height:1.42">${esc(fit(cd.lore || PACK_ROLE[a.pack] || 'reports for spelling duty', 78))}</div></div></div>`; };
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
    ['Pass the checkpoint', reg >= 3 ? 'A short quiz on the chapter, gated at 90%. Circle your answers, then verify at the back.' : 'A short quiz on the chapter you just read. Circle your answers; the back of the book keeps the truth.'],
    ['Play the game, then revise', 'Every chapter ends with a fun game, answer key at the back. Revise all words at the end and circle the ones you can spell and define.'],
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
  /* Pack by weight, not by count. Fourteen entries a page left the last key page
     two-thirds empty, because a checkpoint line is twenty characters and a crossword
     line is two hundred. The budget is what actually fits the two-column body. */
  const WEIGHT = 2500;                                 // characters per key page
  const pages = [];
  let bucket = [], w = 0;
  for (const k of keys) {
    const kw = String(k).replace(/<[^>]*>/g, '').length + 26;   // + the label's own line
    if (bucket.length && w + kw > WEIGHT) { pages.push(bucket); bucket = []; w = 0; }
    bucket.push(k); w += kw;
  }
  if (bucket.length) pages.push(bucket);
  pages.forEach((chunk, pi) => {
    out.push(`<div class="page" data-vol="${vol.n}">
      ${head(vol, null, 0, 'Answer key')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Answer key${pages.length > 1 ? ' · ' + (pi + 1) + ' of ' + pages.length : ''}</h2></div>
      <div class="bb-key" style="margin-top:.12in">${chunk.join('')}</div>
      ${worldStrip(WORLD_CYCLE[(pi + vol.n) % 12], vol, 300 + pi * 14)}
      ${foot(vol, folioRef.n++)}</div>`);
  });
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

/* ---------------- review panel (screen only) ----------------
   A margin note-taker for the HTML edition: every page gets a numbered marker,
   comments save to localStorage per book, and Export copies/downloads a plain
   list of book · page · comment to paste straight back into a prompt. Hidden
   entirely in print. */
const REVIEW_CSS = `
  @media print{.rv,.rv-tab,.rv-mark{display:none !important}}
  @media screen{
    body.rv-open{padding-right:330px}
    .rv{position:fixed;top:0;right:0;width:330px;height:100vh;background:#fff;border-left:1px solid #ddd4f2;
      box-shadow:-4px 0 20px rgba(36,30,51,.12);display:none;flex-direction:column;z-index:9999;font-family:'BB Body',sans-serif}
    body.rv-open .rv{display:flex}
    .rv h4{font-family:'BB Display';font-size:16px;padding:14px 16px 10px;border-bottom:1px solid #eee6fb;margin:0}
    .rv h4 span{display:block;font-family:'BB Body';font-weight:600;font-size:11.5px;color:#6b6482;margin-top:3px}
    .rv-list{flex:1;overflow:auto;padding:10px 12px}
    .rv-row{border:1px solid #eee6fb;border-radius:10px;padding:8px 10px;margin-bottom:8px;background:#fbf9ff}
    .rv-row b{font-family:'BB Kicker';font-size:11px;color:#4a3aa0;display:block;margin-bottom:4px;cursor:pointer}
    .rv-row b:hover{text-decoration:underline}
    .rv-row textarea{width:100%;min-height:52px;resize:vertical;border:1px solid #ddd4f2;border-radius:7px;
      padding:6px 7px;font:inherit;font-size:12.5px;color:#241E33;background:#fff}
    .rv-row.has b{color:#C25A2E}
    .rv-foot{padding:11px 12px;border-top:1px solid #eee6fb;display:flex;gap:7px;flex-wrap:wrap}
    .rv-foot button{flex:1;padding:9px 10px;border-radius:9px;border:0;cursor:pointer;font-weight:800;font-size:12.5px;
      font-family:'BB Body',sans-serif;background:#6C4FE0;color:#fff}
    .rv-foot button.alt{background:#eee6fb;color:#4a3aa0}
    .rv-tab{position:fixed;right:14px;bottom:14px;z-index:10000;background:#6C4FE0;color:#fff;border:0;cursor:pointer;
      border-radius:999px;padding:12px 18px;font-weight:800;font-size:13.5px;font-family:'BB Body',sans-serif;
      box-shadow:0 6px 18px rgba(108,79,224,.4)}
    body.rv-open .rv-tab{right:344px}
    .rv-mark{position:absolute;top:6px;left:6px;z-index:5;background:rgba(108,79,224,.9);color:#fff;
      font-family:'BB Kicker';font-size:10px;border-radius:999px;padding:2px 9px}
    .page.rv-flag{outline:3px solid #E0922E;outline-offset:-3px}
  }`;
function reviewPanel(vol) {
  return `<button class="rv-tab" onclick="RV.toggle()">📝 Review this book</button>
<aside class="rv"><h4>Page notes<span>${esc(vol.title)} · Vol. ${vol.n} — notes save in this browser</span></h4>
  <div class="rv-list" id="rv-list"></div>
  <div class="rv-foot">
    <button onclick="RV.exportNotes()">Export notes</button>
    <button class="alt" onclick="RV.copyNotes()">Copy</button>
    <button class="alt" onclick="RV.clearNotes()">Clear</button>
  </div></aside>
<script>
window.RV = (function(){
  var BOOK = ${JSON.stringify('Vol. ' + vol.n + ' — ' + vol.title)};
  var KEY = 'bbrev-v${vol.n}';
  var notes = {};
  try { notes = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch(e){}
  var pages = [];
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(notes)); } catch(e){} }
  function build(){
    pages = [].slice.call(document.querySelectorAll('.page'));
    pages.forEach(function(p, i){
      var n = i + 1;
      p.id = 'pg' + n;
      var m = document.createElement('span');
      m.className = 'rv-mark'; m.textContent = 'p' + n;
      p.appendChild(m);
    });
    var list = document.getElementById('rv-list');
    list.innerHTML = pages.map(function(p, i){
      var n = i + 1, v = notes[n] || '';
      return '<div class="rv-row' + (v ? ' has' : '') + '" data-n="' + n + '">' +
        '<b onclick="RV.go(' + n + ')">Page ' + n + ' ›</b>' +
        '<textarea placeholder="what should change on this page?" oninput="RV.set(' + n + ',this.value)">' +
        v.replace(/</g,'&lt;') + '</textarea></div>';
    }).join('');
    Object.keys(notes).forEach(flag);
  }
  function flag(n){
    var p = document.getElementById('pg' + n); if(!p) return;
    if (notes[n]) p.classList.add('rv-flag'); else p.classList.remove('rv-flag');
    var row = document.querySelector('.rv-row[data-n="' + n + '"]');
    if (row) row.className = 'rv-row' + (notes[n] ? ' has' : '');
  }
  function text(){
    var out = ['Page notes — ' + BOOK, ''];
    Object.keys(notes).sort(function(a,b){ return a-b; }).forEach(function(n){
      if (notes[n] && notes[n].trim()) out.push(BOOK + ' · page ' + n + ': ' + notes[n].trim());
    });
    return out.length > 2 ? out.join('\\n') : 'No notes yet — type in the panel, then export.';
  }
  return {
    toggle: function(){ document.body.classList.toggle('rv-open'); },
    set: function(n, v){ notes[n] = v; if(!v) delete notes[n]; save(); flag(n); },
    go: function(n){ var p = document.getElementById('pg' + n); if(p) p.scrollIntoView({behavior:'smooth', block:'start'}); },
    clearNotes: function(){ if(!confirm('Clear all notes for this book?')) return; notes = {}; save(); build(); document.querySelectorAll('.page').forEach(function(p){ p.classList.remove('rv-flag'); }); },
    copyNotes: function(){ var t = text(); navigator.clipboard.writeText(t).then(function(){ alert('Notes copied — paste them into your next prompt.'); }, function(){ alert(t); }); },
    exportNotes: function(){
      var blob = new Blob([text()], {type:'text/plain'});
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bizzing-bee-notes-vol${vol.n}.txt';
      a.click();
    },
    _build: build
  };
})();
document.addEventListener('DOMContentLoaded', function(){ RV._build(); });
if (document.readyState !== 'loading') RV._build();
<\/script>`;
}

/* Let the browser do the last inch of the fitting.
   The generator can only ESTIMATE how tall a poem sets — it does not know where
   the lines wrap, how the glossary stacked, or what the title block came to once
   the display face loaded. Estimating left white paper under the short pieces and
   ran the long ones off the bottom. So the generator picks a sensible ceiling per
   piece (`data-max`) and this steps the type down from it until the leaf holds the
   whole poem. It runs after fonts and plates have landed, and the printer runs it
   too — printing to PDF is a browser rendering the page. */
const POEM_FIT = `<script>
(function(){
  function fit(){
    var pages = document.querySelectorAll('.pm-page');
    for (var i=0;i<pages.length;i++){
      var p=pages[i], t=p.querySelector('.pm-text'); if(!t) continue;
      var s=parseFloat(t.getAttribute('data-max'))||14, min=parseFloat(t.getAttribute('data-min'))||8.4;
      var lh=parseFloat(t.getAttribute('data-lh'))||1.5, lhMax=lh+0.5;
      t.style.fontSize=s+'pt';
      var guard=0;
      while(s>min && p.scrollHeight>p.clientHeight+1 && guard++<80){ s-=0.25; t.style.fontSize=s+'pt'; }
      /* the type now fits at its smallest necessary size — if the leaf still has
         slack, spend it on breathing room between lines rather than leaving the
         paper bare, so a short piece reads as spacious, not just small */
      guard=0;
      while(lh<lhMax && p.scrollHeight<=p.clientHeight-6 && guard++<40){ lh+=0.02; t.style.lineHeight=lh; }
      if (p.scrollHeight>p.clientHeight+1) { lh-=0.02; t.style.lineHeight=lh; }
    }
  }
  function go(){ if(document.fonts&&document.fonts.ready) document.fonts.ready.then(fit); else fit(); }
  if(document.readyState==='complete') go(); else window.addEventListener('load',go);
})();
<\/script>`;

/* verso marking + emit */
function finish(vol, pages, meta) {
  const html = pages.map((p, i) => i > 0 && i % 2 === 0 ? p.replace('<div class="page"', '<div class="page" data-verso') : p).join('\n');
  const doc = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(vol.title)} — Bizzing Bee Library Vol. ${vol.n}</title>
<style>${css(vol)}${REVIEW_CSS}</style></head><body data-vol="${vol.n}" data-band="${vol.band}">${html}
${reviewPanel(vol)}${html.indexOf('pm-text') > -1 ? POEM_FIT : ''}</body></html>`;
  fs.writeFileSync(`books/${slugOf(vol)}.html`, doc);
  return { vol, pages: pages.length, ...meta };
}

/* ---------------- collections (17, 18) ---------------- */
function book17() {
  /* Not part of the series: a standalone companion, no volume number, its own
     file name, and it keeps the b17 art it was generated with. */
  const vol = { n: 17, seedN: 16, art: 'b17', slug: 'book-similes', companion: true, title: 'As Busy as a Bee', tag: 'Every simile we know, and the idiom hall of fame', a: '#3DA85C', d: '#1F6B39', tex: 'dots', av: 'popcorn', world: 'meadow', band: 'general' };
  const rnd = mulberry(17 * 7919 + 17);
  /* 49 raw themes is too many shelves and some hold two entries; they fold into
     eleven families, each big enough to be a section and narrow enough to mean
     something. A simile lands in the first family its themes match. */
  const SIM_FAM = [
    ['Birds of every feather', 'Wings, songs and a surprising amount of scorn.', /^(birds)$/],
    ['Small things that bite and swim', 'Insects and sea creatures — tiny vehicles carrying heavy meanings.', /^(insects|marine)$/],
    ['Creatures great and small', 'Animals do most of the work in English — and the comparison is usually older than the fact.', /^(animals)$/],
    ['How you feel', 'The comparisons we reach for when a plain adjective will not do.', /^(emotions|personality)$/],
    ['Round the house', "Doors, nails, pins, kettles: the things always within arm's reach became the things always within reach of a sentence.", /^(household|tools|textiles|architecture)$/],
    ['At the table', 'Food similes travel further than food does.', /^(cuisine|culinary|produce|agriculture|plants|trees)$/],
    ['Weather and the world', 'Rain, rock, river and sky — the oldest comparisons of all.', /^(weather|geology|water|astronomy|ecology|geography|places|navigation|seafaring)$/],
    ['Body and health', 'From head to toe, and what goes wrong along the way.', /^(body|disease)$/],
    ['Books, faith and story', 'Similes that came out of scripture, myth and print.', /^(religion|literature|mythology|philosophy|ancient|linguistics|theater|visualarts|music)$/],
    ['Work, war and money', 'The trades, the battlefield and the ledger.', /^(occupations|war|economics|law|politics|royalty|sports)$/],
    ['Science and number', 'Comparisons the laboratory lent to the language.', /^(physics|chemistry|math)$/],
    ['Everything else', 'The strays, and none of them worse for it.', /./],
  ];
  const simFam = x => { const th = x.th || [];
    for (let i = 0; i < SIM_FAM.length; i++) if (th.some(t => SIM_FAM[i][2].test(t))) return i;
    return SIM_FAM.length - 1; };
  const simGroups = SIM_FAM.map(([name, blurb]) => ({ name, blurb, items: [] }));
  FIG.similes.forEach(x => simGroups[simFam(x)].items.push(x));
  simGroups.forEach(g => g.items.sort((a, b) => a.p.localeCompare(b.p)));
  /* the flat run is still what the match rounds and the puzzles draw from */
  const sims = simGroups.filter(g => g.items.length).flatMap(g => g.items.map(x => ({ ...x, _fam: g.name })));
  const idioms = FIG.idioms.filter(x => x.os && x.p.length <= 26 && (x.m || '').length <= 90).sort((a, b) => a.p.localeCompare(b.p)).slice(0, 240);
  const keys = []; const folio = { n: 1 };
  const pages = [cover(vol, sims.length, idioms.length, 'A BIZZING BEE COMPANION')];
  pages.push(howTo17(vol, folio.n++));
  pages.push(dividerPage(vol, folio.n++));
  let pageNo = 0;
  /* Ten to a page now, not fourteen: each entry carries a sentence as well as a
     meaning and an origin, and four lines of type need the room. */
  const simEntry = x => `<div style="break-inside:avoid;margin-bottom:.15in">
    <div style="font-family:'BB Display';font-size:13pt;color:var(--accent-deep);line-height:1.14">⬡ ${esc(x.p)}</div>
    <div style="font-size:10pt;line-height:1.36;margin-top:2pt;padding-left:.18in">${esc(fit(x.m, 150))}</div>
    ${x.ex ? `<div style="font-size:9.6pt;line-height:1.36;margin-top:2.5pt;padding-left:.18in;border-left:2pt solid color-mix(in srgb,var(--accent) 55%,transparent);color:var(--ink)">${esc(fit(x.ex, 150))}</div>` : ''}
    ${x.os ? `<div style="font-size:8.8pt;line-height:1.33;margin-top:2.5pt;padding-left:.18in;color:var(--muted);font-style:italic">${esc(fit(x.os, 200))}</div>` : ''}</div>`;
  const simPages = [];
  for (const g of simGroups) {
    if (!g.items.length) continue;
    for (let i = 0; i < g.items.length; i += 10)
      simPages.push({ g, seg: g.items.slice(i, i + 10), first: i === 0,
        part: Math.floor(i / 10) + 1, parts: Math.ceil(g.items.length / 10) });
  }
  let seen = 0;
  for (const sp of simPages) {
    const seg = sp.seg; pageNo++;
    pages.push(`<div class="page" data-vol="17">
      ${head(vol, null, 0, sp.g.name)}
      <div style="margin-top:.4in">
        <h2 style="font-size:20pt">${esc(sp.g.name)}${sp.parts > 1 ? ` <span style="font-size:12pt;color:var(--muted);font-weight:600">${sp.part} of ${sp.parts}</span>` : ''}</h2>
        ${sp.first ? `<p style="font-size:10.4pt;color:var(--muted);line-height:1.45;margin:.05in 0 0;max-width:5.6in">${esc(sp.g.blurb)}</p>` : ''}
      </div>
      <div style="columns:2;column-gap:.34in;margin-top:.14in">${seg.map(simEntry).join('')}</div>
      ${worldStrip(WORLD_CYCLE[(pageNo + 2) % 12], vol, 500 + pageNo)}
      ${foot(vol, folio.n++)}</div>`);
    seen += seg.length;
    const i = seen;
    if (pageNo % 6 === 0) {
      const pool = shuf(sims.slice(Math.max(0, i - 34), i + 6).slice(), rnd).slice(0, 10);
      const right = shuf(pool.map((x, k) => ({ k, m: x.m })), rnd);
      keys.push(`<div><b>Match, folio ${folio.n}</b> — ${pool.map((x, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="page" data-vol="17">
        ${head(vol, null, 0, 'Match round')}
        <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(vol.av, '.6in')}<h2 style="font-size:20pt">Draw the line: simile → meaning</h2></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:.18in;margin-top:.12in;font-size:9.2pt;line-height:1.4">
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The similes</h3>${pool.map((x, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${k + 1}.</b> ${esc(x.p)}</div>`).join('')}</div>
          <div><h3 style="font-size:11pt;color:var(--accent-deep);margin-bottom:3pt">The meanings</h3>${right.map((r, k) => `<div class="bb-row" style="max-height:none;margin-bottom:4pt"><b>${String.fromCharCode(65 + k)}.</b> ${esc(fit(r.m, 74))}</div>`).join('')}</div></div>
        <p style="font-size:9pt;color:var(--muted);margin-top:.1in">Your answers: ${pool.map((_, k) => (k + 1) + '—__').join('  ')}</p>
        ${foot(vol, folio.n++)}</div>`);
    }
    if (pageNo % 12 === 0) {
      const two = shuf(seg.slice(), rnd).slice(0, 2);
      pages.push(`<div class="page" data-vol="17">
        ${head(vol, null, 0, 'Draw it literally')}
        <div style="margin-top:.4in"><h2 style="font-size:20pt">Take a simile at its word. Draw the chaos.</h2></div>
        ${two.map(x => `<div style="margin-top:.14in"><div style="font-family:'BB Display';font-size:13pt;color:var(--accent-deep);margin-bottom:.05in">${esc(x.p)}</div>
        <div style="background:var(--card);border:2.5pt solid var(--ink);border-radius:11pt;height:3in;display:grid;place-items:center;color:var(--muted);font-family:'BB Kicker';font-size:10pt">your masterpiece here</div></div>`).join('')}
        ${foot(vol, folio.n++)}</div>`);
    }
  }
  for (let i = 0; i < idioms.length; i += 18) {
    pages.push(`<div class="page" data-vol="17">
      ${head(vol, null, 0, 'Idiom hall of fame')}
      <div style="margin-top:.4in"><h2 style="font-size:20pt">Phrases that stopped meaning what they say.</h2></div>
      <div style="columns:2;column-gap:.3in;margin-top:.14in">${idioms.slice(i, i + 18).map(x => `<div style="margin-bottom:.12in;break-inside:avoid;font-size:9.8pt;line-height:1.36"><b style="font-family:'BB Display';font-size:11pt;color:var(--accent-deep)">${esc(x.p)}</b> — ${esc(fit(x.m, 84))}<br><span style="color:var(--muted);font-size:8.8pt;font-style:italic">${esc(fit(x.os, 114))}</span></div>`).join('')}</div>
      ${worldStrip(WORLD_CYCLE[(i / 18 + 4) % 12], vol, 600 + i)}
      ${foot(vol, folio.n++)}</div>`);
  }
  pages.push(...keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  return finish(vol, pages, { chapters: 0, words: sims.length + idioms.length });
}
function howTo17(vol, folio) {
  return `<div class="page" data-vol="17">
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
function book18() {
  /* The second standalone companion — quotations, not curriculum. */
  const vol = { n: 18, seedN: 17, art: 'b18', slug: 'book-champion', companion: true, title: 'Say It Like a Champion', tag: '240 lines worth keeping — and what they mean for spellers', a: '#7C3F9E', d: '#4E2166', tex: 'rings', av: 'melody', world: 'stage', band: 'general' };
  const rnd = mulberry(18 * 7919 + 17);
  const CH18 = [
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
  const pages = [cover(vol, CH18.length, 240, 'A BIZZING BEE COMPANION')];
  pages.push(dividerPage(vol, folio.n++));
  pages.push(`<div class="page" data-vol="18">
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
  for (const [cat, title, sub] of CH18) {
    chNo++;
    const pool = QUOTES.filter(q => q.c === cat && q.q.length <= 120 && q.q.length >= 25);
    const seen = new Set(); const picked = [];
    for (const q of pool.slice().sort((a, b) => a.q.length - b.q.length)) { if (seen.has(q.a)) continue; seen.add(q.a); picked.push(q); if (picked.length >= 20) break; }
    for (const q of pool) { if (picked.length >= 20) break; if (!picked.includes(q)) picked.push(q); }
    const hero = picked[0];
    pages.push(`<div class="page" data-vol="18" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--paper),var(--tint))">
      <div class="kick">Theme ${chNo} of ${CH18.length}</div>
      <h1 style="font-size:32pt;margin:.06in 0">${esc(title)}</h1>
      <p style="font-family:'BB Kicker';font-size:11pt;color:var(--muted)">${esc(sub)}</p>
      <div style="margin:.26in auto 0;max-width:5.6in">${avatar(vol.av, '1.05in')}
        <div class="bb-panelbox" style="text-align:left;margin-top:.12in"><div style="font-family:'BB Display';font-size:13pt;line-height:1.3">“${esc(hero.q)}”</div>
        <div style="font-family:'BB Kicker';font-size:9pt;color:var(--accent-deep);margin-top:3pt">— ${esc(hero.a)}${hero.who ? ', ' + esc(hero.who) : ''}</div></div></div>
      ${worldStrip(WORLD_CYCLE[(chNo + 8) % 12], vol, 700 + chNo)}
      ${foot(vol, folio.n++)}</div>`);
    const rest = picked.slice(1);
    for (let i = 0; i < rest.length; i += 6) {
      pages.push(`<div class="page" data-vol="18">
        ${head(vol, null, 0, esc(title))}
        <div style="margin-top:.4in"></div>
        ${rest.slice(i, i + 6).map((q, k) => `<div style="margin-bottom:.17in;padding-left:.34in;position:relative;transform:rotate(${k % 2 ? .25 : -.25}deg)">
          <span style="position:absolute;left:0;top:-.1in;font-family:'BB Display';font-size:30pt;color:var(--accent)">“</span>
          <div style="font-family:'BB Display';font-size:13pt;line-height:1.3">${esc(q.q)}</div>
          <div style="font-family:'BB Kicker';font-size:9.6pt;color:var(--accent-deep);margin-top:2pt">— ${esc(q.a)}${q.who ? ', ' + esc(q.who) : ''}</div>
          <div style="font-size:9.4pt;line-height:1.34;margin-top:2pt;color:var(--muted);font-style:italic">🐝 ${esc(fit(q.m, 154))}</div></div>`).join('')}
        ${worldStrip(WORLD_CYCLE[(chNo + i) % 12], vol, 800 + chNo * 9 + i)}
        ${foot(vol, folio.n++)}</div>`);
    }
    if (chNo % 3 === 0) {
      const mixPool = shuf(QUOTES.filter(q => CH18.slice(chNo - 3, chNo).some(c2 => c2[0] === q.c) && q.q.length <= 90).slice(), rnd).slice(0, 8);
      const right = shuf(mixPool.map((q, k) => ({ k, a: q.a })), rnd);
      keys.push(`<div><b>Who said it, folio ${folio.n}</b> — ${mixPool.map((q, k) => (k + 1) + '→' + String.fromCharCode(65 + right.findIndex(r => r.k === k))).join(', ')}</div>`);
      pages.push(`<div class="page" data-vol="18">
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
  return finish(vol, pages, { chapters: CH18.length, words: 240 });
}


/* ================= COMPANION 3 — LINES WORTH KEEPING =================
   Poems, sonnets, haiku and the long quotes, whole. A poetry anthology has no
   business in a spelling library unless it earns its place, so every piece here
   carries the bee-worthy words inside it: learn the Tempest speech and you have
   met `insubstantial` and `pageant` in the only place they are unforgettable.
   The app's own quote library supplies the connective tissue — 623 lines by
   poets, which is where the book's margins come from. */
/* ---- one poem, one page ----
   The first cut gave every piece two pages — the text on one, the note and the
   words on the next — and both were half empty. A poem is a shape; it wants the
   page it is printed on, with everything about it in reach.

   So: the text on the left, the gist in tiles down the right, the hard words
   UNDERLINED where they actually occur in the poem and glossed in a strip along
   the foot, and the whole thing on one leaf wherever it fits.

   And it changes, but the plate never leaves the page — one full-bleed painting
   sits under every piece, the way it does under "The Road Not Taken": present
   through the whole leaf, not boxed into a rectangle that reads as pasted on.
   What moves is which part of the painting shows (`pos`, the sky, the middle
   distance, the near ground) and which side the tile column stands, so the
   book keeps rereading its sixteen plates without ever repeating a page. */
const POEM_LAY = [
  { tiles: 'right', pos: '50% 18%' },
  { tiles: 'left', pos: '50% 82%' },
  { tiles: 'right', pos: '22% 50%' },
  { tiles: 'left', pos: '78% 45%' },
  { tiles: 'right', pos: '50% 50%' },
  { tiles: 'left', pos: '50% 30%' },
  { tiles: 'right', pos: '30% 72%' },
  { tiles: 'left', pos: '72% 28%' },
];

/* A soft tint per subject, so the page's own colour carries the mood a step
   further than the painting does — a war piece sits on ash, a sea piece on
   cool water-blue — mixed at low strength into the book's lavender paper so
   it reads as a wash, not a swatch. */
const THEME_TINT = {
  sea: '#cfe3f0', water: '#d2e6e6', night: '#cdc8e6', forest: '#d9e6cf',
  mountain: '#dbe0d6', snow: '#dfeaf5', fire: '#f2d5c4', war: '#e3d3c2',
  ruin: '#e0d3c0', stage: '#ecd7c8', city: '#d6d8e2', road: '#e3ddc7',
  bird: '#e8ddc9', flower: '#f0d3e2', library: '#ded0bb', dawn: '#f2ddc0',
};

/* Fit the poem to the leaf — the generator's half of the job.
   It sets the CEILING and the floor; POEM_FIT (in the browser, after the display
   face and the plates have landed) walks the type down from the ceiling until the
   leaf holds the whole poem. The ceiling is what the piece can carry as a matter
   of taste — a haiku wants to be big, a twenty-eight-line ode does not — and the
   first estimate is only there so the page does not visibly jump on load. */
function fitPoem(p, hard) {
  const isHaiku = p.kind === 'haiku';
  /* 8.5in less the two margins, less the gap, less the tile column — the plate
     no longer takes a bite out of this: it lives full-bleed behind everything */
  const colW = 7.25 - 0.20 - 2.15;
  const glossH = hard.length ? 0.16 + Math.ceil(hard.length / 3) * 0.70 + 0.30 : 0.30;
  const textH = 9.80 - 0.93 - glossH - 0.30;
  /* smaller and airier than a display ceiling would suggest — the light body
     face carries a page just fine well under its old size, and the room that
     frees up goes straight to line-height instead */
  const lh = isHaiku ? 1.85 : 1.58;
  const nl = p.lines.filter(x => x !== '').length;
  const max = isHaiku ? 20 : nl <= 6 ? 15.5 : nl <= 10 ? 14 : nl <= 16 ? 13 : 12;
  const min = isHaiku ? 10 : 8.2;
  let sz = max;
  for (; sz > min; sz -= 0.25) {
    const cpl = Math.max(8, Math.floor(colW * 144 / sz));  // ~0.5em average glyph
    let rows = 0;
    for (const l of p.lines) rows += l === '' ? 0.55 : Math.max(1, Math.ceil(l.length / cpl));
    if (rows * sz * lh / 72 <= textH) break;
  }
  return { sz: Math.round(sz * 100) / 100, lh, max, min };
}

/* The mood picks a register, not a face — every poem sets in the same light
   variable body font (see .pm-text), because a soliloquy at display weight
   reads as shouting. Four registers, chosen from fields every piece already
   carries (kind, th) so nothing had to be re-authored: a war or ruin subject
   reads a shade firmer whatever its form (Ozymandias gets the same touch as
   Henry V); a sonnet, a speech or a prose oration is the book's most literary
   matter and sets a step heavier than the rest; a haiku stays lightest and
   widest-tracked; everything else — the poems people keep by heart — is the
   plain, most comfortable read in the book. */
function moodFont(p) {
  if (p.th === 'war' || p.th === 'ruin') return 'bold';
  if (p.kind === 'sonnet' || p.kind === 'speech' || p.kind === 'prose') return 'serif';
  if (p.kind === 'haiku') return 'soft';
  return '';
}

/* A stable art key for one piece: derived from its title, so it survives any
   reordering of the sections. Kept in sync with voice/pipeline/poem-art.py. */
const pieceSlug = p => 'pp-' + String(p.t || '').toLowerCase()
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 44);

function poemPage(vol, sec, p, n, folio, keys) {
  const L = POEM_LAY[(n - 1) % POEM_LAY.length];
  /* Art is keyed on the PIECE, falling back to its subject.
     It used to be the subject alone, so with only sixteen plates across ninety
     pieces the same painting turned up five or six times. Each piece now looks
     for its own plate first — keyed on a slug of its title, NOT on its position,
     because position shifts every time a poem is added and index-keyed art
     silently re-attaches itself to the wrong poem. Any piece without a bespoke
     plate quietly falls back to the themed one, so the art can be filled in a
     few at a time without ever leaving a page blank. */
  const plate = artAt(pieceSlug(p)) || artAt('pt-' + (p.th || 'library')) || artAt('pt-library');
  const tint = THEME_TINT[p.th] || THEME_TINT.library;
  const hard = p.hard || [];
  const isHaiku = p.kind === 'haiku';
  const { sz, lh, max, min } = fitPoem(p, hard);
  const mood = moodFont(p);

  const poemHtml = `<div class="pm-text${mood ? ' pm-mood-' + mood : ''}" data-max="${max}" data-min="${min}" data-lh="${lh}" style="font-size:${sz}pt;line-height:${lh};${isHaiku ? 'text-align:center' : ''}">`
    + p.lines.map(l => l === '' ? '<div style="height:.09in"></div>' : `<div>${esc(l)}</div>`).join('') + '</div>';

  const tilesCol = `<div class="pm-tiles">
    <div class="pm-tile pm-gist"><span class="pm-tk">What to listen for</span><p>${esc(p.note)}</p></div>
  </div>`;

  const gloss = hard.length ? `<div class="pm-gloss">
    ${hard.map(h => `<div class="pm-g"><b>${esc(h.w)}</b><i>/ ${esc(h.say)} /</i><span>${esc(fit(h.def, 96))}</span></div>`).join('')}
  </div>` : '';

  const head2 = `<div class="pm-head">
    <div class="kick">${esc(p.src)}</div>
    <h2 style="font-size:${p.t.length > 36 ? 16 : p.t.length > 26 ? 19 : 22}pt">${esc(p.t)}</h2>
    <div class="pm-by">${esc(p.a)}</div></div>`;

  const col = `<div class="pm-col">${poemHtml}</div>`;
  const body = `<div class="pm-body">${L.tiles === 'left' ? tilesCol + col : col + tilesCol}</div>`;

  keys.push(`<div><b>${esc(p.t)}</b> — words to take: ${hard.map(h => esc(h.w)).join(', ') || '—'}</div>`);
  return `<div class="page pm-page" data-vol="22" style="--pm-tint:${tint}">
    ${plate ? `<img class="pm-ground" src="${plate}" alt="" style="object-position:${L.pos}">` : ''}
    ${head(vol, null, 0, esc(sec.title))}
    ${head2}
    ${body}
    ${gloss}
    ${foot(vol, folio.n++)}</div>`;
}

function book19() {
  const vol = { n: 22, seedN: 20, art: 'b22', slug: 'book-lines', companion: true,
    title: 'Lines Worth Keeping', tag: 'Poems, speeches and the long quotes — with the words inside them',
    a: '#4A6FA5', d: '#243C63', tex: 'diag', av: 'encore', world: 'library', band: 'advanced' };
  const P = window.SB_POEMS || {};
  /* The running order is an arc: grand, then formal, then tiny, then funny,
     then the ones you keep, then prose. Limericks sit beside the haiku because
     they are the other short form — and because a reader needs the joke after
     seventeen syllables of snow. `filter` keeps a missing section harmless. */
  const SEC = ['speeches', 'sonnets', 'haiku', 'limericks', 'byheart', 'prose']
    .map(k => [k, P[k]]).filter(x => x[1]);
  const allHard = [];
  SEC.forEach(([, sec]) => sec.pieces.forEach(p => (p.hard || []).forEach(h => allHard.push({ w: h.w, def: h.def, say: h.say }))));
  const rnd = mulberry(vol.n * 7919 + 17);
  const keys = []; const folio = { n: 1 };
  const nPieces = SEC.reduce((n, [, sec]) => n + sec.pieces.length, 0);
  const pages = [cover(vol, SEC.length, allHard.length, 'A BIZZING BEE COMPANION')];
  pages.push(dividerPage(vol, folio.n++));

  /* how it works */
  pages.push(`<div class="page" data-vol="22">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:26pt">Learn one by heart.</h1></div>
    <div style="display:flex;gap:.14in;align-items:flex-start;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-bubble" style="font-size:11pt">Knowing a poem by heart is not showing off. It is the only way to own one — to have it at three in the morning when there is no book. Every piece in here is short enough to learn in a week.</div></div>
    ${[['Read it out loud, once', 'Poetry is a sound before it is a meaning. You will hear the shape before you can explain it.'],
       ['Find the turn', 'Nearly every piece here changes direction somewhere. The note under it tells you where — but look first.'],
       ['Take the words', 'The hard words in each piece are listed after it, with how to say them. That is the spelling half of this book.'],
       ['Copy one out by hand', 'Slowly, with the punctuation exactly as it is. You will notice things reading cannot show you.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:10.6pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${worldStrip(vol.world, vol, 11)}
    ${foot(vol, folio.n++)}</div>`);

  let sn = 0, pieceN = 0;
  for (const [, sec] of SEC) {
    sn++;
    /* section opener */
    pages.push(`<div class="page" data-vol="22" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--paper),var(--tint))">
      <div class="kick">Part ${['I', 'II', 'III', 'IV', 'V'][sn - 1] || sn} of ${SEC.length}</div>
      <h1 style="font-size:30pt;margin:.06in 0">${esc(sec.title)}</h1>
      <p style="font-family:'BB Kicker';font-size:11pt;color:var(--muted);max-width:5in;margin:.1in auto 0;line-height:1.5">${esc(sec.blurb)}</p>
      <div style="margin:.24in auto 0">${avatar(vol.av, '1.05in')}</div>
      ${worldStrip(WORLD_CYCLE[(sn + 1) % 12], vol, 900 + sn)}
      ${foot(vol, folio.n++)}</div>`);

    for (const p of sec.pieces) {
      pieceN++;
      pages.push(poemPage(vol, sec, p, pieceN, folio, keys));
    }

    /* a margin page of the app's own poet lines, one per section */
    const poets = /shakespeare|frost|dickinson|keats|blake|poe|kipling|tennyson|wordsworth|whitman|shelley|henley|hughes|yeats|donne|browning|coleridge|byron|rossetti|longfellow/i;
    const marg = shuf(QUOTES.filter(q => poets.test(q.a || '') && q.q.length >= 30 && q.q.length <= 120).slice(), rnd).slice(0, 7);
    if (marg.length) pages.push(`<div class="page" data-vol="22">
      ${head(vol, null, 0, 'In the margins')}
      <div style="margin-top:.4in;display:flex;align-items:center;gap:.12in">${avatar(vol.av, '.6in')}<h2 style="font-size:19pt">Lines from the same hands</h2></div>
      <p style="font-size:9.6pt;color:var(--muted);margin:.04in 0 .14in">Single lines by the poets in this part — the ones that broke off from their poems and went out into the language on their own.</p>
      ${marg.map((q, k) => `<div style="margin-bottom:.15in;padding-left:.32in;position:relative;transform:rotate(${k % 2 ? .25 : -.25}deg)">
        <span style="position:absolute;left:0;top:-.1in;font-family:'BB Display';font-size:28pt;color:var(--accent)">&ldquo;</span>
        <div style="font-family:'BB Display';font-size:12.4pt;line-height:1.3">${esc(q.q)}</div>
        <div style="font-family:'BB Kicker';font-size:9.4pt;color:var(--accent-deep);margin-top:2pt">&mdash; ${esc(q.a)}</div></div>`).join('')}
      ${worldStrip(WORLD_CYCLE[(sn + 5) % 12], vol, 950 + sn)}
      ${foot(vol, folio.n++)}</div>`);
  }

  /* every word the book taught, in one list */
  const uniq = []; const seenW = new Set();
  for (const h of allHard) { const k = h.w.toLowerCase(); if (seenW.has(k)) continue; seenW.add(k); uniq.push(h); }
  pages.push(...bigListPages(vol, uniq, folio));
  pages.push(...keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  return finish(vol, pages, { chapters: SEC.length, words: uniq.length, pieces: nPieces });
}

/* ================= COMPANION 4 — THE LONG QUIZ =================
   A generic round, then a hyper-speciality round, and repeat. The generic
   rounds are drawn from the app's own bank at levels 3-5; the speciality rounds
   are authored, because no general bank goes that deep on Norse mythology or
   minerals named after people. Formats rotate — multiple choice, short answer
   with the key at the back, a crossword and a letter square — because thirty
   rounds of A/B/C/D is a worksheet, not a book. */
function book20() {
  const vol = { n: 23, seedN: 21, art: 'b23', slug: 'book-quiz', companion: true,
    title: 'The Long Quiz', tag: 'A general round, then a deep one, twenty-five times over',
    a: '#B5893C', d: '#6E4E18', tex: 'grid', av: 'scopey', world: 'forum', band: 'advanced' };
  const SPEC = window.SB_TRIVIA_ROUNDS || [];
  const rnd = mulberry(vol.n * 7919 + 17);
  const keys = []; const folio = { n: 1 };

  /* ---- the general rounds, out of the app's bank ---- */
  /* The shards do not export an array — each one calls SB_TRIVIA._add(lv, [...]).
     So the loader supplies that one method and collects what the file hands it. */
  const bank = [];
  for (let lv = 3; lv <= 5; lv++) {
    const f = `trivia-q${lv}.js`;
    if (!fs.existsSync(f)) continue;
    try {
      const SB_TRIVIA = { _add: (n, arr) => { for (const q of (arr || [])) if (q && q.q && q.c && q.c.length >= 2) bank.push(q); } };
      eval(fs.readFileSync(f, 'utf8'));
    } catch (e) { console.error('  quiz book: could not read ' + f + ' — ' + e.message); }
  }
  if (!bank.length) console.error('  quiz book: the app bank is empty; general rounds will be skipped');
  const THEMES = (window.SB_TRIVIA && SB_TRIVIA.themes) || [];
  const label = id => (THEMES.find(t => t.id === id) || {}).label || id;
  const byTheme = {}; bank.forEach(q => { (byTheme[q.th] = byTheme[q.th] || []).push(q); });
  const genThemes = Object.keys(byTheme).filter(t => byTheme[t].length >= 24);
  shuf(genThemes, rnd);

  const N = SPEC.length;
  let qTotal = 0;
  const pages = [cover(vol, N * 2, SPEC.reduce((n, r) => n + r.qs.length, 0) + N * 30, 'A BIZZING BEE COMPANION')];
  pages.push(dividerPage(vol, folio.n++));
  pages.push(`<div class="page" data-vol="23">
    ${head(vol, null, 0, 'How this book works')}
    <div style="margin-top:.4in"><h1 style="font-size:26pt">General, then deep. Then again.</h1></div>
    <div style="display:flex;gap:.14in;align-items:flex-start;margin:.16in 0">
      ${avatar(vol.av, '1in')}
      <div class="bb-bubble" style="font-size:11pt">Every general round is followed by a speciality round that goes straight down one narrow hole — Norse gods, obscure rivers, minerals named after people. Nobody knows all of them. That is the point.</div></div>
    ${[['Rounds come in pairs', 'A general round to warm up, a speciality round to find out what you actually know.'],
       ['The format keeps moving', 'Multiple choice, written answers, a crossword, a letter square. Never two the same in a row.'],
       ['The key is at the back', 'Written answers are graded from the key. No peeking — Vex is guarding it.'],
       ['The footnotes are the prize', 'Under every answer is the thing worth remembering. Read those even when you got it right.']]
      .map(([t, b], i) => `<div style="display:flex;gap:.14in;margin-bottom:.13in;align-items:flex-start">
      <span style="display:inline-grid;place-items:center;width:.52in;height:.52in;border-radius:13px;background:linear-gradient(135deg,var(--accent),var(--accent-deep));color:#fff;font-family:'BB Display';font-size:14pt;flex-shrink:0">${i + 1}</span>
      <div class="bb-panelbox" style="flex:1"><h3 style="font-size:12pt;color:var(--accent-deep)">${t}</h3><p style="font-size:10.6pt;line-height:1.45">${b}</p></div></div>`).join('')}
    ${worldStrip(vol.world, vol, 13)}
    ${foot(vol, folio.n++)}</div>`);

  /* ---- page renderers, shared by both kinds of round ---- */
  const roundOpener = (n, title, blurb, kind, seedK) => `<div class="page" data-vol="23" style="display:flex;flex-direction:column;justify-content:center;text-align:center;background:linear-gradient(180deg,var(--paper),var(--tint))">
    <div class="kick">Round ${n} &middot; ${kind}</div>
    <h1 style="font-size:30pt;margin:.06in 0">${esc(title)}</h1>
    <p style="font-family:'BB Kicker';font-size:11pt;color:var(--muted);max-width:5in;margin:.1in auto 0;line-height:1.5">${esc(blurb)}</p>
    <div style="margin:.24in auto 0">${avatar(vol.av, '1.05in')}</div>
    ${worldStrip(WORLD_CYCLE[seedK % 12], vol, 1200 + seedK)}
    ${foot(vol, folio.n++)}</div>`;

  const mcPages = (rn, title, qs) => {
    const out = [];
    for (let i = 0; i < qs.length; i += 5) {
      const slice = qs.slice(i, i + 5);
      const body = slice.map((q, k) => {
        const opts = shuf(q.c.slice(0, 4).map((t, oi) => ({ t, ok: oi === 0 })), rnd);
        keys.push(`<div><b>R${rn} Q${i + k + 1}</b> — ${String.fromCharCode(65 + opts.findIndex(o => o.ok))}. ${esc(clamp(q.c[0], 60))}${q.f ? ' <i>' + esc(fit(q.f, 130)) + '</i>' : ''}</div>`);
        return `<div class="q" style="margin-bottom:.13in">
          <div class="qq" style="font-size:10.6pt;line-height:1.36"><b>${i + k + 1}.</b> ${esc(q.q)}</div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:2pt 10pt;margin-top:3pt">
            ${opts.map((o, oi) => `<div class="opt" style="font-size:9.6pt"><b>${String.fromCharCode(65 + oi)}</b> ${esc(o.t)}</div>`).join('')}
          </div></div>`;
      }).join('');
      out.push(`<div class="page" data-vol="23">${head(vol, null, 0, esc(title))}
        <div class="bb-quiz" style="margin-top:.38in">${body}</div>
        ${foot(vol, folio.n++)}</div>`);
    }
    return out;
  };

  const shortPages = (rn, title, qs) => {
    const out = [];
    for (let i = 0; i < qs.length; i += 7) {
      const slice = qs.slice(i, i + 7);
      const body = slice.map((q, k) => {
        keys.push(`<div><b>R${rn} Q${i + k + 1}</b> — ${esc(q.c[0])}${q.f ? ' <i>' + esc(fit(q.f, 130)) + '</i>' : ''}</div>`);
        return `<div style="margin-bottom:.15in">
          <div style="font-size:10.6pt;line-height:1.36"><b>${i + k + 1}.</b> ${esc(q.q)}</div>
          <div class="bb-writeline" style="margin-top:5pt"></div></div>`;
      }).join('');
      out.push(`<div class="page" data-vol="23">${head(vol, null, 0, esc(title))}
        <div style="margin-top:.38in"><div class="kick">Write your answers. The key is at the back.</div></div>
        <div style="margin-top:.1in">${body}</div>
        ${foot(vol, folio.n++)}</div>`);
    }
    return out;
  };

  const xwordPage = (rn, title, qs) => {
    const words = qs.map(q => ({ w: String(q.c[0] || '').replace(/[^a-z]/gi, ''), def: q.q }))
      .filter(x => x.w.length >= 4 && x.w.length <= 13);
    if (words.length < 4) return mcPages(rn, title, qs);
    const cw = crossword(words, rnd);
    if (!cw || !cw.across || (!cw.across.length && !cw.down.length)) return shortPages(rn, title, qs);
    keys.push(`<div><b>R${rn} crossword</b> — ${cw.across.concat(cw.down).map(p => p.n + (p.dir || '') + ' ' + esc(p.w)).join(', ')}</div>`);
    const cols = cw.g[0].length, gridRows = cw.g.length;
    const cell = Math.min(0.44, 6.6 / Math.max(1, cols), 4.0 / Math.max(1, gridRows)).toFixed(3);
    return [`<div class="page" data-vol="23">${head(vol, null, 0, esc(title))}
      <div style="margin-top:.36in"><div class="kick">The clue is the meaning. The answer is the word.</div></div>
      <div class="bb-xword" style="margin:.1in auto;display:grid;grid-template-columns:repeat(${cols},${cell}in);justify-content:center">
        ${cw.g.map(row => row.map(c => c && c.ch
          ? `<span style="width:${cell}in;height:${cell}in;border:1px solid var(--ink);position:relative;display:block">${c.n ? `<i style="position:absolute;top:0;left:1pt;font-size:5.4pt;font-style:normal">${c.n}</i>` : ''}</span>`
          : `<span style="width:${cell}in;height:${cell}in;display:block"></span>`).join('')).join('')}
      </div>
      <div class="bb-clues" style="display:grid;grid-template-columns:1fr 1fr;gap:.14in;font-size:8.6pt;line-height:1.32">
        <div><h3 style="font-size:10.5pt;color:var(--accent-deep)">Across</h3>${cw.across.map(p => `<div><b>${p.n}.</b> ${esc(fit(p.def, 84))}</div>`).join('')}</div>
        <div><h3 style="font-size:10.5pt;color:var(--accent-deep)">Down</h3>${cw.down.map(p => `<div><b>${p.n}.</b> ${esc(fit(p.def, 84))}</div>`).join('')}</div>
      </div>
      ${foot(vol, folio.n++)}</div>`];
  };

  const squarePage = (rn, title, qs) => {
    const words = qs.map(q => String(q.c[0] || '').replace(/[^a-z]/gi, '')).filter(w => w.length >= 4 && w.length <= 11);
    if (words.length < 5) return shortPages(rn, title, qs);
    const ws = wordSearch(words.map(w => ({ w })), rnd);
    if (!ws || !ws.g) return shortPages(rn, title, qs);
    keys.push(`<div><b>R${rn} square</b> — hidden: ${ws.words.map(w => esc(w)).join(', ')}</div>`);
    return [`<div class="page" data-vol="23">${head(vol, null, 0, esc(title))}
      <div style="margin-top:.36in"><div class="kick">Answer each clue, then find the answer in the square.</div></div>
      <div class="bb-search" style="margin:.1in auto;display:grid;grid-template-columns:repeat(${ws.g[0].length},.26in);justify-content:center;font-family:'BB Mono';font-size:10pt">
        ${ws.g.map(r => r.map(ch => `<span style="width:.26in;height:.26in;display:grid;place-items:center">${ch}</span>`).join('')).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.1in;font-size:8.8pt;line-height:1.34;margin-top:.08in">
        ${qs.slice(0, 12).map((q, k) => `<div><b>${k + 1}.</b> ${esc(fit(q.q, 92))}</div>`).join('')}
      </div>
      ${foot(vol, folio.n++)}</div>`];
  };

  const render = (fmt, rn, title, qs) =>
    fmt === 'short' ? shortPages(rn, title, qs)
      : fmt === 'xword' ? xwordPage(rn, title, qs)
        : fmt === 'square' ? squarePage(rn, title, qs)
          : mcPages(rn, title, qs);

  /* ---- alternate: general, speciality, general, speciality ---- */
  const GEN_FMT = ['mc', 'short', 'mc', 'xword', 'mc', 'short', 'mc', 'square'];
  let rn = 0;
  for (let i = 0; i < N; i++) {
    /* the general round */
    const th = genThemes[i % Math.max(1, genThemes.length)];
    const pool = shuf((byTheme[th] || []).slice(), rnd).slice(0, 30);
    if (pool.length >= 12) {
      rn++;
      pages.push(roundOpener(rn, label(th), 'A general round, drawn from the app’s own bank at its three hardest levels. Warm up here.', 'General', i * 2));
      qTotal += pool.length;
      pages.push(...render(GEN_FMT[i % GEN_FMT.length], rn, label(th), pool));
    }
    /* the speciality round */
    const sp = SPEC[i];
    rn++;
    pages.push(roundOpener(rn, sp.title, sp.blurb, 'Speciality', i * 2 + 1));
    qTotal += sp.qs.length;
    pages.push(...render(sp.fmt, rn, sp.title, sp.qs));
  }

  pages.push(...keyPages(vol, keys, folio));
  pages.push(colophon(vol, folio.n++));
  /* the shelf's fact pills read `chapters` and `words`; on a quiz book those
     are rounds and questions, which is what these numbers actually count */
  return finish(vol, pages, { chapters: rn, words: qTotal });
}

/* ---------------- build all + copy lint + hub ---------------- */
fs.mkdirSync('books', { recursive: true });
const made = []; const used = new Set();
for (const vol of VOLS) { const chs = GEN.filter(ch => vol.pick(ch)); chs.forEach(ch => used.add(ch.title));
  made.push(buildCourse(vol, chs, CS, ch => GEN.indexOf(ch))); }
if (GEN.filter(ch => !used.has(ch.title)).length) { console.error('UNASSIGNED GENERAL CHAPTERS'); process.exit(1); }
const advUsed = new Set();
for (const vol of AVOLS) {
  /* An authored volume indexes into its OWN chapter source, not the advanced
     course — vol.src names which one, so adding a third is one line. */
  if (vol.authored) {
    const SRC = { EP: EP, UL_MIND: UL.mind, UL_METHOD: UL.method, SA: SA };
    const src = SRC[vol.src] || SA, sc = vol.src === 'SA' || !vol.src ? SA_SCRIPT : {};
    made.push(buildCourse(vol, vol.chapters, sc, ch => src.indexOf(ch))); continue; }
  vol.chapters.forEach(ch => advUsed.add(ch.title));
  made.push(buildCourse(vol, vol.chapters, window.SB_ADV_CSCRIPT || {}, ch => ADV.indexOf(ch))); }
if (advUsed.size !== ADV.length) { console.error('ADV coverage', advUsed.size, '/', ADV.length); process.exit(1); }
made.push(book17()); made.push(book18()); made.push(book19()); made.push(book20());

/* copy lint (handover §7) over authored copy — scan all output, report data-source hits */
const BANNED = /\b(delve|unleash|leverage|utilize|furthermore|robust|seamless|elevate)\b|in today.s world/i;
let lintHits = 0;
for (const m of made) { const html = fs.readFileSync(`books/${slugOf(m.vol)}.html`, 'utf8');
  const found = html.match(new RegExp(BANNED.source, 'gi')) || [];
  if (found.length) { lintHits += found.length; console.log(`lint: ${slugOf(m.vol)}:`, [...new Set(found.map(x => x.toLowerCase()))].join(', ')); } }
console.log('copy-lint total hits (incl. data text):', lintHits);

/* The shelf used to show the naked cover ILLUSTRATION: no title, no series line,
   no facts — so eighteen books read as eighteen unrelated pictures, and the one
   thing a reader picks a book by was missing. It shows the real cover now, the
   same masthead-kicker-title-tag-pills composition the book's own cover page
   carries, laid over the same art. Type is sized in cqw against the card, so it
   holds together at 228px on a phone and at 300px on a desktop. */
/* The PDF column is gone from the shelf. Twenty-one PDFs came to 214MB — the
   larger part of a 555MB Pages site — and GitHub's deploy step began timing out
   on it, so three shipped builds in a row never reached the live app. The books
   are complete and readable as HTML, which is what the shelf opens. The files
   remain in the gh-pages history and can be regenerated from the HTML at any
   time; if they should be downloadable again they belong on main behind the same
   raw.githubusercontent redirect the voice clips use, not on the Pages site. */
const shelfCover = m => {
  const cov = artAt(`${artOf(m.vol)}-cover`);
  const bee = avaPng(HERO);
  const label = m.vol.companion ? 'A BIZZING BEE COMPANION'
    : m.vol.ultra ? 'THE LAST CONTINENT'
    : m.vol.band === 'advanced' ? 'ADVANCED LIBRARY' : 'LIBRARY';
  const facts = [m.chapters ? m.chapters + ' chapters' : m.pages + ' pages',
    fmt(m.words) + ' words', 'quizzes'];
  return (cov ? `<img src="${cov}" alt="" loading="lazy">`
    : `<span class="bk-fallback" style="background:linear-gradient(160deg,${m.vol.a},${m.vol.d})"><svg viewBox="0 0 120 120">${AV[m.vol.av] || ''}</svg></span>`)
  + `<span class="bkc${onLight(m.vol) ? ' on-light' : ''}">
      <span class="bkc-top"></span>
      <span class="mast">${bee ? `<img src="${bee}" alt="">` : ''}<i>The Bizzing Bee</i></span>
      <span class="kick2">${label}${m.vol.companion ? '' : ' &middot; BOOK ' + m.vol.n}</span>
      <span class="bkt">${esc(m.vol.title)}</span>
      <span class="sub">${esc(m.vol.tag)}</span>
      <span class="scrim"></span>
      <span class="pills">${facts.map(t => `<i class="pill">${t}</i>`).join('')}</span>
    </span>`; };
const fmt = n => Number(n || 0).toLocaleString('en-US');
/* The shelf reads in volume order; the build order does not. And the two
   collections are NOT volumes — they are standalone companions, so they come off
   the numbered shelf entirely and sit under their own heading with no Vol. badge. */
const series = made.filter(m => !m.vol.companion).sort((x, y) => x.vol.n - y.vol.n);
const companions = made.filter(m => m.vol.companion).sort((x, y) => x.vol.n - y.vol.n);
const cardOf = m => { const slug = slugOf(m.vol);
  return `<a class="bk" href="${slug}.html" style="--a:${m.vol.a};--d:${m.vol.d}">
    <span class="bk-cov">${shelfCover(m)}<span class="bk-spine"></span>
      <span class="bk-vol${m.vol.companion ? ' comp' : ''}">${m.vol.companion ? 'Companion' : 'Vol. ' + m.vol.n}</span></span>
    <span class="bk-meta"><b>${esc(m.vol.title)}</b><span class="tag">${esc(m.vol.tag)}</span>
      <span class="foot"><span class="pg">${m.pages} pages</span>
      <span class="pdf">Read &rarr;</span></span>
    </span></a>`; };
const cards = series.map(cardOf).join('');
const compCards = companions.map(cardOf).join('');
const hub = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Bizzing Bee Library — ${series.length} volumes and ${companions.length} companions</title><style>
@font-face{font-family:'Baloo 2';src:url('../fonts/baloo2-800.woff2') format('woff2');font-weight:400 900}
@font-face{font-family:'Fredoka';src:url('../fonts/fredoka-600.woff2') format('woff2');font-weight:600}
@font-face{font-family:'Hanken Grotesk';src:url('../fonts/hanken-var.woff2') format('woff2');font-weight:100 900}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Hanken Grotesk',sans-serif;color:#241E33;padding:0 0 70px;
  background:radial-gradient(1200px 600px at 12% -8%,#EDE7FF,transparent 60%),radial-gradient(900px 500px at 92% 4%,#FFE9C9,transparent 58%),#F6F3FF}
main{max-width:1180px;margin:0 auto;padding:0 22px}
header.hero{padding:52px 0 30px;text-align:center}
header.hero .kick{font-family:'Fredoka';font-size:12.5px;letter-spacing:.2em;text-transform:uppercase;color:#7C5CFF}
h1{font-family:'Baloo 2';font-size:clamp(34px,5.2vw,54px);line-height:1.04;margin:8px 0 12px;
  background:linear-gradient(100deg,#6C4FE0,#E8458C 55%,#F0A93C);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
p.lead{color:#59527a;max-width:62ch;margin:0 auto;font-size:15.5px;line-height:1.65}
.canva{background:#fff;border:1px solid #E4DBFA;border-radius:16px;padding:15px 20px;margin:26px auto 0;max-width:760px;
  line-height:1.6;font-size:14px;color:#463c66;box-shadow:0 6px 20px rgba(108,79,224,.09)}
.canva b{font-family:'Baloo 2'}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(228px,1fr));gap:28px 22px;margin-top:34px}
.bk{display:flex;flex-direction:column;text-decoration:none;color:inherit;transition:transform .22s ease}
.bk:hover{transform:translateY(-7px)}
.bk-cov{position:relative;display:block;aspect-ratio:3/4;border-radius:5px 12px 12px 5px;overflow:hidden;background:#241E33;
  container-type:inline-size;
  box-shadow:0 14px 30px rgba(36,24,80,.28),0 2px 5px rgba(36,24,80,.22),inset 0 0 0 1px rgba(255,255,255,.14)}
/* the ART fills the card; the masthead bee inside .bkc must NOT be caught by this */
.bk-cov > img,.bk-fallback{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:grid;place-items:center}
.bk-fallback svg{width:44%;height:44%}
.bk-spine{position:absolute;left:0;top:0;bottom:0;width:13px;z-index:3;background:linear-gradient(90deg,rgba(0,0,0,.42),rgba(255,255,255,.22) 62%,rgba(0,0,0,.14))}
/* the cover text, composed over the art exactly as the book's own cover page does */
.bkc{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;text-align:center;
  color:#fff;padding:5.6cqw 5.4cqw 0}
.bkc .bkc-top{position:absolute;left:0;right:0;top:0;height:46%;
  background:linear-gradient(180deg,rgba(12,9,28,.52),rgba(12,9,28,.16) 62%,rgba(12,9,28,0))}
.bkc > *{position:relative;z-index:1}
.bkc .mast{display:flex;align-items:center;justify-content:center;gap:1.7cqw}
.bkc .mast i{font-family:'Baloo 2';font-weight:800;font-style:normal;font-size:5.6cqw;letter-spacing:.005em;
  text-shadow:0 1px 5px rgba(0,0,0,.7)}
.bkc .mast img{position:static;width:7.4cqw;height:7.4cqw;object-fit:contain;filter:drop-shadow(0 1px 3px rgba(0,0,0,.5))}
.bkc .kick2{font-family:'Fredoka';font-size:3.15cqw;letter-spacing:.17em;margin-top:1.1cqw;opacity:.95;
  text-shadow:0 1px 4px rgba(0,0,0,.8)}
.bkc .bkt{font-family:'Baloo 2';font-weight:800;font-size:13cqw;line-height:.97;margin-top:3.2cqw;
  text-shadow:0 2px 10px rgba(0,0,0,.78),0 1px 2px rgba(0,0,0,.6)}
.bkc .sub{font-family:'Fredoka';font-size:4.1cqw;line-height:1.28;margin-top:2.6cqw;max-width:19ch;
  text-shadow:0 1px 6px rgba(0,0,0,.82)}
.bkc .scrim{position:absolute;left:0;right:0;bottom:0;height:36%;z-index:0;
  background:linear-gradient(180deg,rgba(12,9,28,0),rgba(12,9,28,.86))}
/* A light cover takes ink type and a white veil. White type over a darkening
   scrim both greys out a pale three-ink drawing and disappears into it. */
.bkc.on-light{color:#241E33}
.bkc.on-light .mast i,.bkc.on-light .bkt{text-shadow:0 1px 3px rgba(255,255,255,.8)}
.bkc.on-light .kick2{color:rgba(36,30,51,.82);text-shadow:0 1px 3px rgba(255,255,255,.85)}
.bkc.on-light .sub{color:rgba(36,30,51,.92);text-shadow:none;background:rgba(255,255,255,.74);
  border-radius:2.4cqw;padding:1.2cqw 2.4cqw;backdrop-filter:blur(2px)}
.bkc.on-light .bkc-top{background:linear-gradient(180deg,rgba(255,255,255,.74),rgba(255,255,255,.2) 60%,rgba(255,255,255,0))}
.bkc.on-light .scrim{background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.82))}
.bkc .pills{position:absolute;left:3.5cqw;right:3.5cqw;bottom:5cqw;display:flex;justify-content:center;
  gap:1.8cqw;flex-wrap:wrap}
.bkc .pill{font-family:'Baloo 2';font-weight:800;font-style:normal;font-size:3.3cqw;
  background:linear-gradient(160deg,rgba(255,210,77,.96),rgba(240,169,60,.96));color:#3E2708;
  border-radius:999px;padding:.9cqw 2.5cqw;box-shadow:0 .5cqw 1.6cqw rgba(12,9,28,.45)}
.bk-vol{position:absolute;top:9px;right:9px;font-family:'Fredoka';font-size:11px;color:#fff;background:rgba(16,10,36,.62);border-radius:999px;padding:3px 10px}
.bk:hover .bk-cov{box-shadow:0 20px 44px rgba(36,24,80,.36),0 3px 8px rgba(36,24,80,.26),inset 0 0 0 1px rgba(255,255,255,.2)}
.bk-meta{padding:13px 3px 0;display:flex;flex-direction:column;flex:1}
.bk-meta b{display:block;font-family:'Baloo 2';font-size:17.5px;line-height:1.18}
.bk-meta .tag{display:block;font-size:13px;color:#645c86;line-height:1.45;margin-top:4px}
.bk-meta .foot{display:flex;align-items:center;gap:9px;margin-top:auto;padding-top:10px}
.bk-meta .pg{font-family:'Fredoka';font-size:11.5px;color:#8b83a3}
.bk-meta .pdf{margin-left:auto;font-family:'Fredoka';font-size:11.5px;color:var(--d);
  border:1.4px solid color-mix(in srgb,var(--a) 45%,#fff);background:color-mix(in srgb,var(--a) 12%,#fff);border-radius:999px;padding:4px 11px;cursor:pointer}
.bk-meta .pdf:hover{background:var(--a);color:#fff;border-color:var(--a)}
/* the companions sit apart from the numbered shelf, behind their own rule */
.shelf2{margin-top:58px;padding-top:34px;border-top:1px solid #E4DBFA}
.shelf2 h2{font-family:'Baloo 2';font-size:clamp(24px,3.2vw,32px);color:#4A3AA0;line-height:1.1}
.shelf2 p{color:#59527a;max-width:60ch;font-size:14.5px;line-height:1.6;margin-top:8px}
.shelf2 .grid{grid-template-columns:repeat(auto-fill,minmax(228px,1fr));max-width:720px;margin-top:24px}
.bk-vol.comp{background:rgba(60,132,85,.72);font-size:10px}
footer{max-width:1180px;margin:38px auto 0;padding:0 22px;font-size:12px;color:#8b83a3;line-height:1.6}
</style></head><body><main>
<header class="hero">
  <div class="kick">Bizzing Bee Library</div>
  <h1>${series.length} volumes, from first buzz to the last continent</h1>
  <p class="lead">Cinematic storyboard openers with the full avatar cast, checkpoint quizzes straight from the Word Map,
  practice hives with real write-in drills, and puzzles built from each chapter&rsquo;s own words.
  The books grow up as the reader does &mdash; bright daylight in Vol.&nbsp;1, letterboxed dusk in the advanced volumes,
  night and gold in the two Ultra books at the end.</p>
  <div class="canva"><b>Getting a book into Canva:</b> download the PDF, then in Canva choose <b>Create a design &rarr; Import file</b>
  (or drag the PDF onto Canva&rsquo;s home page). Every page becomes an editable design. The HTML is the print master.</div>
</header>
<div class="grid">${cards}</div>
<section class="shelf2">
  <h2>Companions</h2>
  <p>Four standalone books, not part of the numbered series. Collections rather than curriculum &mdash;
  read them in any order, at any level.</p>
  <div class="grid comp">${compCards}</div>
</section>
</main>
<footer>Bizzing Bee &middot; independent study material &middot; not affiliated with Scripps, the North South Foundation, or Merriam-Webster.</footer>
</body></html>`;
fs.writeFileSync('books/index.html', hub);
series.forEach(m => console.log(`Vol.${String(m.vol.n).padStart(2)} ${m.vol.title.padEnd(24)} ${String(m.pages).padStart(4)} pages`));
companions.forEach(m => console.log(`  comp. ${m.vol.title.padEnd(24)} ${String(m.pages).padStart(4)} pages  (${slugOf(m.vol)}.html)`));
console.log('total pages:', made.reduce((a, m) => a + m.pages, 0));
