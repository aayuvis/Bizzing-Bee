/* scenes.js — the film, as data.
 *
 * THE AUDIO IS THE CLOCK (brief Rule 4). Every shot's duration is derived from the
 * narration section it sits under, never typed. `at` is an offset INSIDE its section, and
 * the last shot of a section runs to that section's end — so re-recording a line re-times
 * the film for free and a shot can never be cut away from a sentence.
 *
 * Motion discipline: one move per shot, never reversing. `push` is the fraction of scale
 * gained across the whole shot (0.06 = 6%). Slowest move on the longest shot.
 */
const SECTIONS = require('../timing.json');   // [{n,label,in,out,len}]

/* type:
 *   plate  — a still, Ken Burns
 *   spell  — the signature letter-drop (A1), optional wrong letter (A2)
 *   title  — the 1925→1908 title card (A4)
 *   cards  — a row of word cards (A6)
 *   hold   — flat colour / black beat
 */
const SHOTS = [
  // ── §01 COLD OPEN ────────────────────────────────────────────────────────────
  { s:1, at:0.0,  type:'plate', src:'plate-theatre-stage.png',  push:0.05, from:'center' },
  { s:1, at:6.5,  type:'plate', src:'plate-theatre-spot.png',   push:0.07, from:'center' },
  { s:1, at:11.0, type:'card',  kicker:'Cleveland, Ohio', line:'Marie C. Bolden', sub:'thirteen years old' },
  { s:1, at:17.5, type:'plate', src:'plate-schoolroom-interior.png', push:0.04, from:'left' },
  { s:1, at:22.0, type:'plate', src:'plate-theatre-spot.png',   push:0.0 },   // motion stops

  // ── §02 TITLE ────────────────────────────────────────────────────────────────
  { s:2, at:0.0,  type:'title' },

  // ── §03 WHERE BEES COME FROM ─────────────────────────────────────────────────
  { s:3, at:0.0,  type:'plate', src:'noah-webster-portrait-1833-herring-npg.jpg', push:0.05, fit:'contain' },
  { s:3, at:9.0,  type:'plate', src:'webster-american-spelling-book-1821-cover-nmah.jpg', push:0.06, fit:'contain' },
  { s:3, at:16.0, type:'plate', src:'webster-american-spelling-book-1821-pages-nmah.jpg', push:0.05, fit:'contain' },
  { s:3, at:22.0, type:'swap',  a:'colour', b:'color' },        // the U falls out
  { s:3, at:31.0, type:'swap',  a:'centre', b:'center' },
  { s:3, at:38.0, type:'plate', src:'plate-schoolhouse-night.png', push:0.05 },
  { s:3, at:46.0, type:'plate', src:'plate-schoolroom-interior.png', push:0.04, from:'right' },

  // ── §04 1908 ─────────────────────────────────────────────────────────────────
  { s:4, at:0.0,  type:'plate', src:'plate-theatre-stage.png',  push:0.05, from:'right' },
  { s:4, at:9.0,  type:'plate', src:'the-village-school-lithograph-c1870-nmah.jpg', push:0.05, fit:'contain' },
  { s:4, at:18.0, type:'plate', src:'plate-schoolroom-interior.png', push:0.05 },
  { s:4, at:28.0, type:'card',  kicker:'Cleveland', line:'no errors at all', sub:'not one' },
  { s:4, at:38.0, type:'card',  kicker:'individual champion, 1908', line:'Marie C. Bolden' },
  { s:4, at:52.0, type:'medal' },                                // struck, then fades to outline
  { s:4, at:67.0, type:'card',  kicker:'Guinness World Records', line:'the first nationwide spelling bee' },

  // ── §05 WHY 1925 STILL MATTERS ───────────────────────────────────────────────
  { s:5, at:0.0,  type:'plate', src:'plate-pressroom.png', push:0.06 },
  { s:5, at:14.0, type:'plate', src:'plate-pressroom.png', push:0.04, from:'right' },
  { s:5, at:26.0, type:'count', to:2000000, label:'children entered' },
  { s:5, at:40.0, type:'count', to:9, label:'reached Washington' },

  // ── §06 THE 1925 FINAL — the hero sequence ───────────────────────────────────
  { s:6, at:0.0,  type:'plate', src:'us-national-museum-exterior-1880s-sia.jpg', push:0.05, fit:'cover' },
  { s:6, at:8.0,  type:'plate', src:'calvin-coolidge-photo-c1924-ulmann-npg.jpg', push:0.04, fit:'contain' },
  { s:6, at:18.0, type:'plate', src:'us-national-museum-interior-inventions-exhibit-c1920-sia.jpg', push:0.05 },
  { s:6, at:28.0, type:'plate', src:'spelling-bee-1925-finalists-coolidge-loc.jpg', push:0.05, fit:'contain' },
  { s:6, at:36.5, type:'spell', word:'GLADIOLUS' },              // A1
  { s:6, at:49.5, type:'spell', word:'GLADIOLUS', wrong:{ i:7, ch:'Y' } },  // A2 — the Y falls
  { s:6, at:56.5, type:'hold',  ms:3500 },                       // black. silence in the mix.
  { s:6, at:60.0, type:'spell', word:'GLADIOLUS', fix:{ i:7 } }, // U lands gold
  { s:6, at:67.0, type:'plate', src:'gladiolus-imbricatus-herbarium-specimen-nmnh.jpg', push:0.06, fit:'contain' },

  // ── §07 WHAT HAPPENED TO FRANK ───────────────────────────────────────────────
  { s:7, at:0.0,  type:'plate', src:'plate-pressroom.png', push:0.04, from:'left' },
  { s:7, at:9.0,  type:'card',  kicker:'1934 engineering · 1940 law', line:'patent attorney', sub:'fifty years on the exact meaning of exact words' },
  { s:7, at:22.0, type:'card',  kicker:'Frank Neuhauser', line:'1913 – 2011', sub:'ninety-seven' },
  { s:7, at:32.0, type:'plate', src:'gladiolus-imbricatus-herbarium-specimen-nmnh.jpg', push:0.03, fit:'contain' },

  // ── §08 1926 ─────────────────────────────────────────────────────────────────
  { s:8, at:0.0,  type:'count', to:1000, label:'first prize', prefix:'$' },
  { s:8, at:11.0, type:'card',  kicker:'Clarkson, Kentucky', line:'Pauline Bell', sub:'thirteen' },
  { s:8, at:22.0, type:'spell', word:'CERISE' },
  { s:8, at:32.0, type:'plate', src:'plate-shopwindow-1920s.png', push:0.05 },
  { s:8, at:41.0, type:'card',  kicker:'second place, 1926', line:'Betty Robinson' },

  // ── §09 1927 ─────────────────────────────────────────────────────────────────
  { s:9, at:0.0,  type:'card',  kicker:'West Salem, Ohio', line:'Dean Lucas', sub:'thirteen' },
  { s:9, at:8.0,  type:'spell', word:'ABROGATE' },

  // ── §10 1928 ─────────────────────────────────────────────────────────────────
  { s:10, at:0.0,  type:'card', kicker:'South Bend, Indiana', line:'Betty Robinson', sub:'she came back' },
  { s:10, at:9.0,  type:'spell', word:'KNACK' },
  { s:10, at:16.0, type:'spell', word:'ALBUMEN' },
  { s:10, at:23.0, type:'plate', src:'spelling-bee-1928-winners-coolidge-loc.jpg', push:0.03, fit:'contain' },

  // ── §11 WHAT HAPPENED TO THEM — no motion anywhere ───────────────────────────
  { s:11, at:0.0,  type:'card', line:'Pauline Bell',   fade:true },
  { s:11, at:7.0,  type:'card', line:'Dean Lucas',     fade:true },
  { s:11, at:13.0, type:'card', line:'Betty Robinson', fade:true },
  { s:11, at:19.0, type:'card', line:'Marie C. Bolden', sub:'her medal has never been found', fade:true },
  { s:11, at:26.0, type:'medal', ghost:true },

  // ── §12 CLOSE ────────────────────────────────────────────────────────────────
  { s:12, at:0.0,  type:'cards', words:['gladiolus','cerise','abrogate','albumen'] },
  { s:12, at:14.0, type:'cards', words:['knack','guetapens'], compare:true },
  { s:12, at:24.0, type:'plate', src:'plate-empty-stage-dawn.png', push:0.04 },
  { s:12, at:31.0, type:'outro' },
];

/* Derive absolute in/out. A shot runs until the next shot in its section, or that
 * section's end — which is what makes the audio the clock rather than a suggestion. */
function build() {
  const bySec = {};
  SECTIONS.forEach(s => bySec[s.n] = s);
  const out = [];
  SHOTS.forEach((sh, i) => {
    const sec = bySec[sh.s];
    if (!sec) throw new Error('shot ' + i + ' references missing section ' + sh.s);
    const next = SHOTS[i + 1];
    const endAt = (next && next.s === sh.s) ? next.at : sec.len;
    const dur = +(endAt - sh.at).toFixed(3);
    if (dur <= 0) throw new Error(`shot ${i} (§${sh.s} @${sh.at}) has non-positive duration`);
    out.push(Object.assign({}, sh, {
      idx: out.length, sec: sh.s, secLabel: sec.label,
      in: +(sec.in + sh.at).toFixed(3), out: +(sec.in + endAt).toFixed(3), dur,
    }));
  });
  return out;
}

module.exports = { SHOTS, SECTIONS, build };
