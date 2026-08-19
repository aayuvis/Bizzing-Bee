/* scenes.js — the film, as data.
 *
 * THE AUDIO IS THE CLOCK, and in this cut it is the clock to the WORD.
 *
 * v1 positioned every shot by a hand-typed offset inside its narration section — `at: 36.5`,
 * meaning "about thirty-six seconds into this eighty-second block". Those numbers were
 * guesses. They were also wrong: the GLADIOLUS letter-drop, the shot this whole film exists
 * for, was typed at 258.3s when the narrator does not begin spelling until 285.1s. Twenty-
 * seven seconds. Smaller versions of the same error ran through the rest, which is why
 * pictures kept arriving before the sentences that explain them.
 *
 * So no shot here carries a time. Each carries a CUE — a phrase the narrator actually says —
 * which align.py has already located in the recording. Re-record a line and the film re-times
 * itself; mistype a cue and the render refuses to start.
 *
 * Motion discipline is unchanged: one move per shot, never reversing, slowest move on the
 * longest shot. `push` is the fraction of scale gained across the whole shot.
 */
const SECTIONS = require('../timing.json');   // [{n,label,in,out,len}]
const WORDS    = require('../words.json');    // [{w,sec,s,t}] — every spoken word, timed

/* Seconds of picture after the narration ends, for the sign-off. The mix is padded to
 * match in assemble.sh; a film that stops dead on its last syllable has no landing. */
const TAIL = 9.0;

/* Normalise PER WORD and identically on both sides, so that "thirteen-year-old" is one
 * token in a cue exactly as it is one token in the transcript. Splitting on punctuation
 * instead would turn it into three, and no hyphenated cue would ever match. */
const toks = s => String(s).split(/\s+/)
  .map(x => x.toLowerCase().replace(/[^a-z0-9]/g, ''))
  .filter(Boolean);

/* Find where a phrase is spoken. Scoped to its section so that repeated phrases —
 * "Betty Robinson", "gladioli", "nineteen twenty-eight" — resolve to the right one. */
function cue(sec, phrase) {
  const want = toks(phrase);
  const mine = WORDS.filter(w => w.sec === sec);
  const said = mine.map(w => toks(w.w).join(''));
  for (let i = 0; i + want.length <= said.length; i++) {
    let ok = true;
    for (let j = 0; j < want.length; j++) {
      if (said[i + j] !== want[j]) { ok = false; break; }
    }
    if (ok) return mine[i].t;
  }
  throw new Error(`cue not found in §${sec}: "${phrase}"`);
}

/* type:
 *   plate      — a still, Ken Burns
 *   spell      — the letter-drop; `sync` lands each letter on its spoken letter
 *   title      — the 1925→1908 card
 *   card       — type
 *   cards      — a row of word cards
 *   swap       — colour → color
 *   count      — a number counting up
 *   medal      — the drawn medal (SVG, struck / ghosted)
 *   gladiolus  — growing, opening, swaying flowers
 *   sword      — a gladiolus leaf resolving into a blade
 *   colourfill — the frame floods with a colour
 *   coins      — gold coins falling into a pile
 *   elim       — nine lights going out until two remain
 *   papers     — newspaper sheets fanning across the country
 *   cities     — points of light, one per city, connecting
 *   beeword    — BEE, and the insect that leaves
 *   fourwords  — the four winning words, each with its picture
 *   outro      — the sign-off
 *   hold       — a beat
 */
const SHOTS = [
  // ── §01 COLD OPEN ────────────────────────────────────────────────────────────
  { s:1, cue:'Cleveland, Ohio',            type:'plate', src:'plate-theatre-exterior-1908.png', push:0.05 },
  { s:1, cue:'A thirteen-year-old girl',   type:'plate', src:'plate-theatre-stage.png', push:0.06, from:'center' },
  { s:1, cue:'Her name is Marie',          type:'card',  kicker:'Cleveland, Ohio', line:'Marie C. Bolden', sub:'thirteen years old' },
  { s:1, cue:'Her father is a mail',       type:'plate', src:'plate-mail-carrier.png', push:0.05, from:'left' },
  { s:1, cue:'She is Black',               type:'plate', src:'plate-two-doors.png', push:0.04 },
  { s:1, cue:'have already said',             type:'card',  line:'“…that they do not want to compete against her.”' },
  { s:1, cue:'Cleveland\'s answer was simple', type:'card', kicker:'Cleveland’s answer', line:'She earned her place.' },
  { s:1, cue:'If you don\'t like it',      type:'card',  line:'If you don’t like it, go home.' },

  // ── §02 TITLE ────────────────────────────────────────────────────────────────
  { s:2, cue:'Everybody will tell you',    type:'title' },

  // ── §03 WHERE BEES COME FROM ─────────────────────────────────────────────────
  { s:3, cue:'Quick, because you need it', type:'plate', src:'plate-schoolroom-interior.png', push:0.04, from:'left' },
  { s:3, cue:'Two things made this',       type:'card',  kicker:'before there was a bee', line:'Two things' },
  { s:3, cue:'First, a book',              type:'plate', src:'noah-webster-portrait-1833-herring-npg.jpg', push:0.05, fit:'contain' },
  { s:3, cue:'seventeen eighty-three',     type:'plate', src:'webster-american-spelling-book-1821-cover-nmah.jpg', push:0.06, fit:'contain' },
  { s:3, cue:'Kids called it the blue-backed', type:'plate', src:'webster-american-spelling-book-1821-pages-nmah.jpg', push:0.05, fit:'contain' },
  { s:3, cue:'sold tens of millions',      type:'count', to:60000000, label:'copies sold' },
  { s:3, cue:'Webster wanted American',    type:'plate', src:'noah-webster-schoolmaster-of-the-republic-print-nmah.jpg', push:0.05, fit:'contain' },
  { s:3, cue:'Colour loses its U',         type:'swap',  a:'colour', b:'color' },
  { s:3, cue:'American spelling was',      type:'card',  line:'a deliberate act' },
  { s:3, cue:'Second, the word bee',       type:'beeword' },
  { s:3, cue:'In early America',           type:'plate', src:'plate-quilting-bee.png', push:0.05 },
  { s:3, cue:'to do something',              type:'plate', src:'plate-husking-bee.png', push:0.05, from:'right' },
  { s:3, cue:'A spelling bee was a night out', type:'plate', src:'plate-schoolhouse-night.png', push:0.05 },
  { s:3, cue:'You packed the schoolhouse', type:'plate', src:'plate-schoolroom-interior.png', push:0.04, from:'right' },
  { s:3, cue:'There was betting',          type:'plate', src:'plate-betting-desk.png', push:0.06 },
  { s:3, cue:'What nobody had done',       type:'cities', lit:0 },

  // ── §04 1908 ─────────────────────────────────────────────────────────────────
  { s:4, cue:'Until the summer',           type:'plate', src:'plate-theatre-exterior-1908.png', push:0.05, from:'right' },
  { s:4, cue:'The National Education',     type:'cities', lit:1 },
  { s:4, cue:'The venue is the Hippodrome', type:'plate', src:'plate-theatre-stage.png', push:0.05, from:'left' },
  { s:4, cue:'The date is the twenty-ninth', type:'card', kicker:'Hippodrome Theater · Cleveland', line:'29 June 1908' },
  { s:4, cue:'It is a team competition',   type:'plate', src:'plate-schoolroom-interior.png', push:0.05 },
  { s:4, cue:'And when the spelling is finished', type:'plate', src:'plate-theatre-spot.png', push:0.04 },
  { s:4, cue:'Marie Bolden',               type:'card',  kicker:'individual champion, 1908', line:'Marie C. Bolden', sub:'thirteen years old' },
  { s:4, cue:'Cleveland takes the team',   type:'card',  kicker:'team title', line:'Cleveland' },
  { s:4, cue:'Marie is named individual',  type:'medal' },
  { s:4, cue:'Now understand what that meant', type:'plate', src:'plate-two-doors.png', push:0.05, from:'left' },
  { s:4, cue:'A Black teenager',           type:'plate', src:'plate-theatre-stage.png', push:0.05, from:'right' },
  { s:4, cue:'Newspapers carried it',      type:'plate', src:'plate-newsboys.png', push:0.06 },
  { s:4, cue:'For a lot of Black families', type:'plate', src:'plate-family-reading.png', push:0.04 },
  { s:4, cue:'Guinness World Records',     type:'card',  kicker:'Guinness World Records', line:'the first nationwide spelling bee' },
  { s:4, cue:'And her gold medal',         type:'medal' },
  { s:4, cue:'It was lost somewhere',      type:'plate', src:'plate-attic-record.png', push:0.05 },
  { s:4, cue:'People have gone looking',   type:'plate', src:'plate-attic-record.png', push:0.04, from:'right' },
  { s:4, cue:'It has never been found',    type:'medal', ghost:true },

  // ── §05 WHY 1925 STILL MATTERS ───────────────────────────────────────────────
  { s:5, cue:'So why does everyone say',   type:'card',  kicker:'the year everyone names', line:'1925' },
  { s:5, cue:'Because nineteen oh eight didn\'t', type:'plate', src:'plate-theatre-spot.png', push:0.03 },
  { s:5, cue:'It was a one-off',           type:'plate', src:'plate-schoolroom-interior.png', push:0.04, from:'left' },
  { s:5, cue:'What began in nineteen twenty-five', type:'card', line:'never stopped' },
  { s:5, cue:'And it started, of all things', type:'plate', src:'plate-pressroom.png', push:0.06 },
  { s:5, cue:'The Louisville Courier-Journal', type:'plate', src:'plate-newsroom-desks.png', push:0.05 },
  { s:5, cue:'someone there had an idea',  type:'papers' },
  { s:5, cue:'Every paper that joins',     type:'plate', src:'plate-newsroom-desks.png', push:0.04, from:'right' },
  { s:5, cue:'That\'s weeks of stories',   type:'plate', src:'plate-newsboys.png', push:0.05, from:'left' },
  { s:5, cue:'radio had just arrived',     type:'plate', src:'plate-radio-1920s.png', push:0.05 },
  { s:5, cue:'Nine newspapers said yes',   type:'count', to:9, label:'newspapers said yes' },
  { s:5, cue:'More than two million',      type:'count', to:2000000, label:'children entered' },
  { s:5, cue:'Nine made it to Washington', type:'count', to:9, label:'reached Washington' },

  // ── §06 THE 1925 FINAL — the hero sequence ───────────────────────────────────
  { s:6, cue:'The seventeenth of June',    type:'plate', src:'us-national-museum-exterior-1880s-sia.jpg', push:0.05, fit:'cover' },
  { s:6, cue:'The National Museum',        type:'plate', src:'plate-museum-hall-chairs.png', push:0.05 },
  { s:6, cue:'Six girls, three boys',      type:'card',  kicker:'Washington, D.C. · 17 June 1925', line:'nine finalists', sub:'six girls, three boys' },
  { s:6, cue:'Before it starts',           type:'plate', src:'calvin-coolidge-photo-c1924-ulmann-npg.jpg', push:0.04, fit:'contain' },
  { s:6, cue:'Calvin Coolidge shakes',     type:'plate', src:'calvin-coolidge-print-1925-sturges-npg.jpg', push:0.05, fit:'contain' },
  { s:6, cue:'Then they\'re walked back in', type:'plate', src:'us-national-museum-interior-inventions-exhibit-c1920-sia.jpg', push:0.05 },
  { s:6, cue:'It runs an hour and a half', type:'elim',  from:9, to:9 },
  { s:6, cue:'One by one, they go out',    type:'elim',  from:9, to:2 },
  { s:6, cue:'Until two eleven-year-olds', type:'card',  kicker:'the last two', line:'Edna Stover · Frank Neuhauser', sub:'both eleven years old' },
  { s:6, cue:'The word is gladiolus',      type:'spell', word:'GLADIOLUS' },
  { s:6, cue:'little sword',               type:'sword' },
  // The narration says "a Y where the second I belongs"; the misspelling shown is
  // GLADIOLYS, the Y in the U's place. Script and picture disagree by one letter and the
  // recording is locked, so the picture follows the historical spelling, not the sentence.
  { s:6, cue:'And she puts a Y',           type:'spell', word:'GLADIOLUS', wrong:{ i:7, ch:'Y' } },
  { s:6, cue:'She sits down',              type:'card',  kicker:'second in the country', line:'$250', sub:'and one letter' },
  { s:6, cue:'And now the same word',      type:'plate', src:'plate-museum-hall-chairs.png', push:0.04, from:'right' },
  { s:6, cue:'Frank grew gladioli',        type:'gladiolus' },
  { s:6, cue:'Of all nine children',       type:'gladiolus', sway:true },
  { s:6, cue:'G',                          type:'spell', word:'GLADIOLUS', fix:{ i:7 }, sync:true },
  { s:6, cue:'Champion of the United States', type:'card', line:'Champion of the United States' },
  { s:6, cue:'Five hundred dollars',       type:'coins' },
  { s:6, cue:'And when he got home',       type:'plate', src:'plate-parade.png', push:0.05 },

  // ── §07 WHAT HAPPENED TO FRANK ───────────────────────────────────────────────
  { s:7, cue:'Engineering degree',         type:'card',  kicker:'1934 engineering · 1940 law', line:'then patent law' },
  { s:7, cue:'And then he became a patent', type:'plate', src:'plate-drafting-desk.png', push:0.05, from:'right' },
  { s:7, cue:'Get one wrong',              type:'card',  line:'the exact meaning of exact words' },
  { s:7, cue:'He did it for nearly fifty', type:'count', to:50, label:'years of it' },
  { s:7, cue:'He kept coming back',        type:'plate', src:'plate-old-man-hall.png', push:0.04 },
  { s:7, cue:'Frank Neuhauser died',       type:'card',  kicker:'Frank Neuhauser', line:'1913 – 2011', sub:'ninety-seven' },
  { s:7, cue:'And into his nineties',      type:'plate', src:'plate-gladiolus-garden.png', push:0.04, from:'right' },
  { s:7, cue:'He was still growing',       type:'gladiolus', sway:true },

  // ── §08 1926 ─────────────────────────────────────────────────────────────────
  { s:8, cue:'Watch how fast it grows',    type:'card',  line:'year two' },
  { s:8, cue:'nine children becomes',      type:'count', to:25, label:'contestants' },
  { s:8, cue:'the prize doubles',          type:'count', to:1000, label:'first prize', prefix:'$' },
  { s:8, cue:'That is serious money',      type:'plate', src:'ford-model-t-roadster-1926-nmah.jpg', push:0.05, fit:'contain' },
  { s:8, cue:'The winner is Pauline Bell', type:'card',  kicker:'Clarkson, Kentucky', line:'Pauline Bell', sub:'thirteen' },
  { s:8, cue:'Her word',                   type:'spell', word:'CERISE' },
  { s:8, cue:'A thirteen-year-old is expected', type:'plate', src:'plate-fashion-plate-cerise.png', push:0.05, fit:'contain' },
  { s:8, cue:'Gladiolus came from the garden', type:'plate', src:'plate-gladiolus-garden.png', push:0.04, from:'left' },
  { s:8, cue:'Cerise came from a shop window', type:'plate', src:'plate-shopwindow-1920s.png', push:0.04, from:'right' },
  { s:8, cue:'And hold on to one name',    type:'hold' },
  { s:8, cue:'Second place that year',     type:'plate', src:'spelling-bee-1926-finalists-coolidge-loc.jpg', push:0.04, fit:'contain' },
  { s:8, cue:'Betty Robinson',             type:'card',  kicker:'second place, 1926', line:'Betty Robinson' },

  // ── §09 1927 ─────────────────────────────────────────────────────────────────
  { s:9, cue:'Seventeen contestants',      type:'count', to:17, label:'contestants' },
  { s:9, cue:'Dean Lucas',                 type:'card',  kicker:'West Salem, Ohio', line:'Dean Lucas', sub:'thirteen' },
  { s:9, cue:'His word',                   type:'spell', word:'ABROGATE' },
  { s:9, cue:'Not a flower',               type:'card',  line:'not a flower, not a colour' },
  { s:9, cue:'And this is America',        type:'plate', src:'plate-prohibition.png', push:0.04, from:'right' },

  // ── §10 1928 ─────────────────────────────────────────────────────────────────
  { s:10, cue:'nineteen twenty-eight',     type:'plate', src:'spelling-bee-1928-winners-coolidge-loc.jpg', push:0.04, fit:'contain' },
  { s:10, cue:'Betty Robinson',            type:'card',  kicker:'South Bend, Indiana', line:'Betty Robinson', sub:'she came back' },
  { s:10, cue:'Ask three sources',         type:'spell', word:'KNACK' },
  { s:10, cue:'the champion had to spell', type:'card',  line:'one more word' },
  { s:10, cue:'Then albumen',              type:'spell', word:'ALBUMEN' },
  { s:10, cue:'The oldest kind of English', type:'plate', src:'plate-egg-albumen.png', push:0.05 },

  // ── §11 WHAT HAPPENED TO THEM — no motion anywhere ───────────────────────────
  { s:11, cue:'So what became of them all', type:'plate', src:'plate-four-chairs.png', push:0.0 },
  { s:11, cue:'Frank we know',             type:'card',  line:'Frank we know.', fade:true },
  { s:11, cue:'Marie Bolden, Pauline Bell', type:'card', line:'Marie Bolden · Pauline Bell<br>Dean Lucas · Betty Robinson', fade:true },
  { s:11, cue:'They won the biggest thing', type:'plate', src:'plate-attic-record.png', push:0.03 },
  { s:11, cue:'And then they went home',   type:'plate', src:'plate-attic-record.png', push:0.03, from:'right' },
  { s:11, cue:'Marie\'s medal is still missing', type:'medal', ghost:true },
  { s:11, cue:'They weren\'t professional', type:'card', line:'no coaches, no study plans', fade:true },
  { s:11, cue:'They were ordinary kids',   type:'plate', src:'plate-four-chairs.png', push:0.0 },

  // ── §12 CLOSE ────────────────────────────────────────────────────────────────
  { s:12, cue:'Four words',                type:'fourwords' },
  { s:12, cue:'That\'s not a random list', type:'card',  line:'a portrait of what a child was expected to know' },
  { s:12, cue:'Which is why they look easy', type:'cards', words:['gladiolus','cerise','abrogate','albumen'] },
  { s:12, cue:'Today you need words',      type:'cards', words:['knack','guetapens'], compare:true },
  { s:12, cue:'The bee didn\'t get harder', type:'plate', src:'plate-museum-hall-chairs.png', push:0.04, from:'left' },
  { s:12, cue:'It got harder because',     type:'card',  line:'the moment the word list went public,<br>everybody studied it' },
  { s:12, cue:'And it all starts',         type:'plate', src:'plate-empty-stage-dawn.png', push:0.04 },

  // ── TAIL — after the narration stops ─────────────────────────────────────────
  { s:12, tail:true,                       type:'outro' },
];

/* Resolve cues to absolute times and derive every duration from the next shot.
 * Nothing here is typed; a shot ends where the next one starts, and the last one runs to
 * the end of the mix plus the tail. */
function build() {
  const bySec = {};
  SECTIONS.forEach(s => bySec[s.n] = s);
  const END = SECTIONS[SECTIONS.length - 1].out;

  const at = SHOTS.map((sh, i) => {
    if (sh.tail) return END;
    if (!bySec[sh.s]) throw new Error(`shot ${i} references missing section ${sh.s}`);
    return cue(sh.s, sh.cue);
  });

  const out = [];
  SHOTS.forEach((sh, i) => {
    const start = at[i];
    const stop  = sh.tail ? END + TAIL : (i + 1 < SHOTS.length ? at[i + 1] : END);
    const dur   = +(stop - start).toFixed(3);
    if (dur <= 0) throw new Error(`shot ${i} (§${sh.s} "${sh.cue}") has non-positive duration ${dur}`);

    const rec = Object.assign({}, sh, {
      idx: out.length, sec: sh.s, secLabel: bySec[sh.s].label,
      in: +start.toFixed(3), out: +stop.toFixed(3), dur,
    });

    /* A spelling channel spelling a word on screen should land each letter as the narrator
     * says it. The letter times are already in words.json — "G." "L." "A." are ordinary
     * tokens — so the stagger is measured, not eased. */
    if (sh.sync && sh.word) {
      const mine = WORDS.filter(w => w.sec === sh.s && w.t >= start - 0.01);
      const hits = [];
      for (const w of mine) {
        const t = w.w.replace(/[^A-Za-z]/g, '');
        if (t.length === 1 && t.toUpperCase() === sh.word[hits.length]) hits.push(w.t);
        if (hits.length === sh.word.length) break;
      }
      if (hits.length === sh.word.length) {
        rec.letterAt = hits.map(t => +(t - start).toFixed(3));
      }
    }
    out.push(rec);
  });
  return out;
}

/* Picture length must equal voiceover length plus the tail. */
function drift() {
  const picture = build().reduce((a, s) => a + s.dur, 0);
  return +((SECTIONS[SECTIONS.length - 1].out + TAIL) - picture).toFixed(3);
}

module.exports = { SHOTS, SECTIONS, WORDS, TAIL, cue, build, drift };
