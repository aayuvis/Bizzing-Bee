/* ============================================================
   MOCK SPELLING BEE — the flagship of Compete (games spec §4.1, 4 Oct 2026).

   A bee is a field of spellers on a stage, one word each, miss and you sit down.
   The rivals are real competitors rather than difficulty numbers — an age, a skill,
   a temperament and a speciality — and an announcer calls it like a final.

   WHAT THE SPEC CHANGED, and the rule each change keeps:
   - EIGHT MINUTES. The field and the rounds are sized by the child's age band
     (6–7: four rivals, three rounds · 8–10: six, four · 11–15: eight, five) and then
     it is sudden death, where every round costs the rivals more. A perfect speller's
     bee used to run past 704 s; tests/mockbee-sim.cjs plays perfect spellers on a
     simulated clock and holds the median under the cap. Past 60% of the cap the
     write-along windows close, and at the cap the bee ends with co-champions — the
     old Scripps rule — so no bee can run long.
   - WHEN YOU ARE OUT you choose: Finish now (the rivals are resolved at once from
     their own profiles) or Watch the rest (2×, write-alongs off). Nobody waits
     through a spell-off they are not in.
   - THE PRONOUNCER'S CHAIR, in every turn: Definition · Part of speech · Origin ·
     Sentence · Say it again · Alternate pronunciation, in that order, one size. Each
     question costs 3 s of the 30 s turn clock; a question with no answer on file is
     not drawn at all. Every answer is masked so it can never show the spelling. On
     Hard and Champ a thinking strip says what an answer implies, in the words of the
     Coach's own rulebook (coach-rules.js), matched to the word.
   - MODES: Bee (the chosen level, SB_LEVEL key 'mockbee'), Champ (the old Advanced
     Mock Rounds — a written list, a meaning round, a lightning round — and the only
     place Finals words are served) and Family Bee night (2–4 players on one device,
     each with a band; the names live in memory for the evening and are never
     written anywhere; only the profile child is paid).
   - PAY: payG per word spelt right; the contest event for the podium at a 70% pass
     mark; nothing for finishing. The rivals are drawn from a SEEDED generator, so the
     placing — and the contest coin that rides on it — never touches Math.random().

   Uses app3 globals: state, render, active, save, addCoins, payG, sfx, burstConfetti,
   esc, escA, iconSVG, SB_AVATAR, logBand, markMastered, mastEvidence, addMiss, nkey,
   fmtN, sameSpelling, maskTxt, missFeedbackHTML, logGameWord, recentGameKeys,
   wordClip, altPron, trickAnal, vocBuildCheck, gameWordsD, nextWords. Registers
   actions on `app` (a top-level const in app3's scope, NOT window.app).
   ============================================================ */
(function () {
  'use strict';
  const app2 = app;                       /* app3's top-level const */
  const LS = 'sb_mockbee';                /* store.js names this key; only SB_STORE touches it */
  const CAP_MS = 8 * 60 * 1000;           /* §4.1: the length cap */
  const TURN_MS = 30000, CALM_TURN_MS = 45000, Q_COST = 3000;
  const PLATE = 'app-art/sgw-stage.jpg';  /* the painted stage the arcade already ships: curtains, lamps, empty seats */

  /* ---------------- the field ---------------- */
  /* `alt` is a rival's stand-in face. A rival must never wear the child's own avatar — "Suki" in
     the panda the child picked read as the child spelling against themselves — so when the two
     collide the rival wears `alt` (faceOf). Each alt is a live avatar no rival and no other alt
     uses, so the swap is deterministic and can never land on another face in the hall. */
  const BOTS = [
    { id: 'pixel', alt: 'germy', lvl: .18, name: 'Pip', age: 8, skill: .52, nerve: .74, voc: 0.40, vtell: 'spells at a sprint and has never once asked what it means', spec: null, pace: 620,
      note: 'Eight, and spells at a sprint. Brilliant or gone.', vary: .22,
      tell: 'starts before the pronouncer finishes' },
    { id: 'koi', alt: 'luna', lvl: .24, name: 'Nova', age: 9, skill: .58, nerve: .70, voc: 0.56, vtell: 'reads more than she lets on', spec: /old english|germanic/i, pace: 1150,
      note: 'Steady. Short words are hers and she knows it.', vary: .08,
      tell: 'says the word twice, always' },
    { id: 'beaker', alt: 'atom', lvl: .32, name: 'Rafi', age: 10, skill: .63, nerve: .58, voc: 0.74, vtell: 'takes the Latin root apart, so the meaning falls out of it', spec: /latin/i, pace: 1300,
      note: 'Takes every Latin root apart before he writes it.', vary: .10,
      tell: 'traces the letters on his palm' },
    { id: 'panda', alt: 'neko', lvl: .38, name: 'Suki', age: 11, skill: .66, nerve: .93, voc: 0.62, vtell: 'steady here too', spec: null, pace: 1400,
      note: 'Unshakeable. The lights do nothing to her.', vary: .07,
      tell: 'breathes out, then spells' },
    { id: 'comet', alt: 'rocket', lvl: .42, name: 'Dax', age: 11, skill: .71, nerve: .34, voc: 0.50, vtell: 'can spell words he could not define at gunpoint', spec: null, pace: 700,
      note: 'Fastest here in round one. Watch him late on.', vary: .16,
      tell: 'rocks on his heels' },
    { id: 'astro', alt: 'saturn', lvl: .44, name: 'Mira', age: 12, skill: .70, nerve: .66, voc: 0.79, vtell: 'Greek gives her the meaning before the spelling', spec: /greek/i, pace: 1250,
      note: 'Greek is her language. Ask her for the origin and smile.', vary: .09,
      tell: 'asks for the language of origin every time' },
    { id: 'scopey', alt: 'robo', lvl: .43, name: 'Theo', age: 12, skill: .69, nerve: .80, voc: 0.85, vtell: 'asks for the definition every time — and remembers it', spec: null, pace: 2100,
      note: 'Asks every question. Every word. No exceptions.', vary: .06,
      tell: 'asks every question, every single word' },
    { id: 'melody', alt: 'fae', lvl: .52, name: 'Ines', age: 13, skill: .74, nerve: .72, voc: 0.71, vtell: 'French roots, French meanings', spec: /french/i, pace: 1200,
      note: 'French endings hold no silence she has not heard.', vary: .08,
      tell: 'mouths the word in French first' },
    { id: 'samurai', alt: 'ninja', lvl: .62, name: 'Kwame', age: 14, skill: .80, nerve: .78, voc: 0.81, vtell: 'no weakness here either', spec: /latin|greek/i, pace: 1100,
      note: 'No weakness anybody has found yet.', vary: .06,
      tell: 'hands behind his back, dead still' },
    { id: 'goldlegend', alt: 'crystal', lvl: .72, name: 'Vesper', age: 15, skill: .87, nerve: .95, voc: 0.88, vtell: 'knows the list the way other people know a song', spec: null, pace: 900,
      note: 'Won this last year. Has not looked at anyone since.', vary: .05,
      tell: 'does not ask for anything' },
  ];
  /* the face a rival wears in this hall: their own, unless it is the child's (see `alt`) */
  function myFace() { try { const g = state.mb; return (g && g.avatar) || (active() || {}).avatar || 'bizzy'; } catch (e) { return 'bizzy'; } }
  /* `mine` names the face to avoid when the caller knows it better than the hall does (Mock Analogy Bee seats the same
     cast for the child on screen, whatever bee state.mb last held) */
  function faceOf(b, mine) { return b && b.id === (mine || myFace()) ? b.alt : (b && b.id); }
  const botById = id => BOTS.find(b => b.id === id);

  /* ---------------- the size of a bee: by age band (§4.1) ----------------
     The app's age bands are 5–7 / 8–10 / 11–13 / 14–18; the bee's are the spec's three.
     `win` is the write-along window on a rival's word: shorter for older spellers, who
     type faster, so the field and the clock come out about the same length. */
  const BANDS = {
    '6-7':   { label: '6–7',   rivals: 4, rounds: 3, win: 12000, ids: ['pixel', 'koi', 'beaker', 'panda'] },
    '8-10':  { label: '8–10',  rivals: 6, rounds: 4, win: 10000, ids: ['pixel', 'koi', 'beaker', 'panda', 'comet', 'astro'] },
    '11-15': { label: '11–15', rivals: 8, rounds: 5, win: 7000, ids: ['beaker', 'panda', 'comet', 'astro', 'scopey', 'melody', 'samurai', 'goldlegend'] },
  };
  /* Family Bee night: each player picks one. Grown-ups get grown-up words — but never the
     Finals words, which belong to Champ alone. */
  const FAM_BANDS = [['6-7', '6–7'], ['8-10', '8–10'], ['11-15', '11–15'], ['adult', 'Grown-up']];
  const FAM_ROUNDS = 3;
  function bandKey(c) {
    c = c || (typeof active === 'function' ? active() : null);
    const k = c && c.ageBand;
    if (k === '5-7') return '6-7';
    if (k === '8-10') return '8-10';
    if (k === '11-13' || k === '14-18') return '11-15';
    const a = +(c && c.age) || 9;
    return a <= 7 ? '6-7' : a <= 10 ? '8-10' : '11-15';
  }
  const MODES = ['bee', 'champ', 'family'];

  /* ---------------- the level (§1.7, SB_LEVEL) ----------------
     The child chooses it on the chip; SB_LEVEL.after() re-checks it at the end of every Bee.
     Until that contract is in the build, a tiny local fallback keeps the old chip's choice. */
  const LEVELS = ['easy', 'medium', 'hard', 'champ'];
  function lvlGet() {
    try { if (window.SB_LEVEL && typeof SB_LEVEL.get === 'function') return SB_LEVEL.get('mockbee') || 'auto'; } catch (e) {}
    try { return (active() && active().mbDiff) || 'auto'; } catch (e) { return 'auto'; }
  }
  const lvlConcrete = (lv, band) => LEVELS.indexOf(lv) >= 0 ? lv : band === '6-7' ? 'easy' : band === '8-10' ? 'medium' : 'hard';
  const LVL_NAME = { auto: 'Auto', easy: 'Easy', medium: 'Medium', hard: 'Hard', champ: 'Champ' };

  /* ---------------- one seeded generator per bee ----------------
     The rivals' words, slips and bells all come from it. A bee is reproducible from its seed,
     and nothing the child can be paid for depends on Math.random() (FAMILY-STANDARD, T5). */
  function mkRng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  let _idleRng = mkRng(20261004);
  const rnd = () => { const g = state.mb; return (g && typeof g.rnd === 'function') ? g.rnd() : _idleRng(); };
  const shuffle = (a, r) => { r = r || rnd; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------------- the rounds ----------------
     Bee and Family: oral rounds, the first one forgiving (nobody goes out — the announcer says
     so, so it is true), then the band's count of rounds, then sudden death. Champ runs the old
     Advanced Mock Rounds inside the same count: a written list, a meaning round, oral rounds on
     Finals words and a lightning round, then sudden death. */
  const STAGE_NAMES = ['Preliminaries', 'Quarterfinals', 'Semifinals', 'Finals'];
  const STAGE_OPEN = ['The preliminaries decide who is still here at the end.',
    'Quarterfinals. The list gets longer and the room gets quieter.',
    'Semifinals. Everything from here is a word that has ended somebody’s bee.',
    'The finals. Championship words, and one microphone left.'];
  const NUMERAL = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
  function roundsFor(g) { return g && g.mode === 'family' ? FAM_ROUNDS : (BANDS[(g && g.band) || '8-10'] || BANDS['8-10']).rounds; }
  function champSeq(K) {
    return K <= 3 ? ['written', 'vocab', 'spell'] : K === 4 ? ['written', 'vocab', 'spell', 'lightning']
      : ['written', 'vocab', 'spell', 'spell', 'lightning'];
  }
  function roundAt(n, g) {
    g = g || state.mb || {};
    const K = roundsFor(g);
    const sudden = n >= K;
    const kind = (g.mode === 'champ' && !sudden) ? champSeq(K)[n] : 'spell';
    const frac = K > 1 ? Math.min(1, n / (K - 1)) : 1;
    const si = Math.min(3, Math.round(frac * 3));
    const sdN = sudden ? n - K : -1;
    const name = sudden ? 'Sudden death' : kind === 'written' ? 'Written round' : kind === 'vocab' ? 'Vocabulary'
      : kind === 'lightning' ? 'Lightning round' : STAGE_NAMES[si] + ' · Round ' + (NUMERAL[n] || (n + 1));
    const sub = kind === 'written' ? 'a list, written down' : kind === 'vocab' ? 'word meanings'
      : kind === 'lightning' ? 'the spell-off' : sudden ? 'the next miss ends it' : 'oral spelling';
    const safe = n === 0 && kind === 'spell';
    const line = safe ? 'Everybody gets one, and nobody goes out. Find your feet.'
      : sudden ? (sdN === 0 ? 'Sudden death. The championship rule is suspended — the next miss ends this bee.' : 'Sudden death, and the words keep climbing.')
      : kind === 'written' ? 'A written list first. The lowest scores sit down.'
      : kind === 'vocab' ? 'Now the meanings. Four choices, one right, and no second guess.'
      : kind === 'lightning' ? 'One minute. Spell as many as you can. The lowest score goes out.'
      : STAGE_OPEN[si];
    return { n, kind, sub, name, stageI: sudden ? 3 : si, sudden: sudden ? 1 : 0, sdN, safe: safe ? 1 : 0,
      press: sudden ? 1 : frac, tier: n === 0 ? -1 : (n >= K - 1 ? 1 : 0), line, K };
  }

  /* ---------------- the announcer ----------------
     Authored pools rather than one line per event, because the child will hear these many
     times. {name} sits at a sentence boundary so it can be spoken live by the device while
     the rest of the line stays fixed. Lines that are RECORDED (ANN_HAVE) keep their exact
     words: the clip says them. */
  const SAY = {
    /* open-0's recording says "eleven spellers". No field is eleven any more, so the bee opens
       on open-1 (see mbStart) and open-0 is kept only because its clip is on disk. */
    open: ['Ladies and gentlemen — eleven spellers, one microphone. Only one of you walks out with it.',
      'The lights are up. Somewhere in this room is a champion who does not know it yet.'],
    draw: ['You have drawn number {n}. Remember it — it is your place in every round tonight.',
      'Number {n}. That is where you stand, and that is when you spell.'],
    roundIn: ['{round}. {line}', '{round} — {sub}. {line}'],
    callMe: ['Speller number {n}. Your word, please.', 'Number {n} — this one is yours.'],
    callBot: ['{name} — {age}, and {tell}.', '{name}, number {n}, to the microphone.'],
    callVocMe: ['Speller number {n}. Not the spelling this time — the meaning.',
      'Number {n}. Four meanings on the board. One of them is yours.'],
    callVocBot: ['{name}, for the meaning.', '{name} — {vtell}.'],
    /* boltIn-0's recording says "ninety seconds"; the lightning round is one minute, so it
       always opens on boltIn-1 */
    boltIn: ['Ninety seconds on the clock. Spell everything you can.',
      'This is the spell-off. No turns, no order — just the clock.'],
    boltEnd: ['Time. Pencils down.', 'Time is called.'],
    botRight: ['Correct.', 'Clean. Not a hesitation in it.'],
    botWrong: ['No. The word was {word}.', 'That is incorrect. The bell, please.'],
    meRight: ['Correct! You are still in.', 'Right — one more round survived.'],
    meWrong: ['No — I am sorry. The word was {word}.',
      'That is not it. {word}. Take a seat, and take it proudly.'],
    botSafe: ['Not quite — but this is the warm-up, and the warm-up forgives.',
      'Incorrect, and it costs nothing tonight. Not yet.'],
    meSafe: ['Not quite. The word was {word} — but the warm-up forgives. You are still in.',
      'No. {word}. Round one takes nobody, so shake it off and stay standing.'],
    thin: ['Five left.', 'We are down to four.', 'Three spellers. Three.',
      'And then there were two. Championship rules from here.'],
    finalTwo: ['Championship rules now. Miss, and your rival can end this with two correct words.',
      'Two left. From here, one miss can lose it — if the other takes that word and the next.'],
    c2First: ['{name} — the missed word first. Then one more, and this bee is over.',
      '{name}, take the word that was just missed.'],
    c2Champ: ['{name} — the championship word, please.',
      '{name}: get this one, and you are the champion.'],
    c2Miss: ['No — that hands the bee back. {back} still in it. We go again.',
      'Incorrect, and the bee is not over. {back} back on their feet.'],
    winMe: ['THAT IS IT! Ladies and gentlemen — your champion!',
      'That is the championship word, spelled correctly. It is over!'],
    winBot: ['{name} is your champion.', '{name} spells the championship word. It is over.'],
    outMe: ['You finish {place}. Out of {count} — that is a real result.',
      '{place} place. The hall applauds; they know how far that is.'],
    allMiss: ['Nobody spelled it. Under the rules, everybody stays. We go again.',
      'A clean sweep of misses — so nobody goes out. Back to the top of the order.'],
  };
  const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null) ? v[k] : m);
  /* pick() remembers WHICH line it chose, so announce() can find the matching recording */
  const POOL_OF = new Map();
  let _pick = null;
  const pick = (arr, seed) => {
    const i = Math.abs(seed | 0) % arr.length;
    if (!POOL_OF.size) { try { Object.keys(SAY).forEach(k => POOL_OF.set(SAY[k], k)); } catch (e) {} }
    const pool = POOL_OF.get(arr);
    _pick = pool ? { pool: pool, i: i, raw: arr[i] } : null;
    return arr[i];
  };

  /* ---------------- state ---------------- */
  const mb = () => state.mb;
  function prog() { try { return SB_STORE.getJSON('mockbee', {}) || {}; } catch (e) { return {}; } }
  function saveProg(p) { try { SB_STORE.setJSON('mockbee', p); } catch (e) {} }
  const isHuman = s => !!s && (s.kind === 'me' || s.kind === 'player');
  /* the profile child — the only speller whose words are paid and whose progress moves */
  const isProfile = s => !!s && (s.kind === 'me' || (s.kind === 'player' && s.profile));
  const alive = () => ((mb() && mb().field) || []).filter(s => s.in);
  const profileIn = () => alive().some(isProfile);

  /* How hard is this word, 0..1: the library's y plus a length tax (a word that carries its
     own percentile in `_h` is judged on that). */
  function hardness(w) {
    if (!w) return .5;
    if (typeof w._h === 'number') return w._h;
    const y = clamp((w.y || 3), 1, 9);
    return clamp((y - 1) / 8 * .82 + clamp(((w.w || '').length - 6) / 12, 0, 1) * .18, 0, 1);
  }
  /* Finals words (skeuomorph, ballabile…) are Champ's alone */
  const isFinals = w => !!w && (typeof w._h === 'number' ? w._h >= .78 : (w.y || 0) >= 8);

  /* Does a rival get it? A steady hand set by their skill, a cost for every round the bee has
     run, nerve against the pressure, a nudge for their speciality and for how hard this word
     is against the round's own words — and in sudden death every round costs more, which is
     what ends a bee a perfect speller is still standing in. */
  function botSpells(bot, w, R) {
    R = R || {};
    const base = .80 + (bot.skill - .52) * .4;
    const spec = (bot.spec && bot.spec.test((w && w.o) || '')) ? .05 : 0;
    const g = mb();
    const mid = g && typeof g.mid === 'number' ? g.mid : hardness(w);
    const word = -(hardness(w) - mid) * .5;
    const nerve = -(R.press || 0) * (1 - bot.nerve) * .35;
    const drop = -.045 * Math.min(R.n || 0, 6);
    const sd = R.sdN >= 0 ? -.14 * (R.sdN + 1) : 0;
    const wobble = (rnd() - .5) * bot.vary * 2;
    return rnd() < clamp(base + spec + word + nerve + drop + sd + wobble, .04, .97);
  }

  /* A wrong answer should look like something a child would actually write */
  const SLIPS = [
    [/([bcdfglmnprst])\1/, m => m[0]],
    [/ie/, 'ei'], [/ei/, 'ie'],
    [/ance$/, 'ence'], [/ence$/, 'ance'],
    [/ible$/, 'able'], [/able$/, 'ible'],
    [/ph/, 'f'], [/ough/, 'uff'],
    [/([aeiou])r([aeiou])/, '$1rr$2'],
    [/^(k)(n)/, '$2'], [/^(w)(r)/, '$2'],
    [/e$/, ''], [/([^aeiou])y$/, '$1ie'],
    [/tion$/, 'sion'], [/sion$/, 'tion'],
    [/c([ei])/, 's$1'], [/s([ei])/, 'c$1'],
  ];
  function misspell(word) {
    const w = String(word || '');
    const cands = SLIPS.filter(([re]) => re.test(w));
    if (cands.length) {
      const [re, to] = cands[Math.floor(rnd() * cands.length)];
      const out = w.replace(re, to);
      if (out && out.toLowerCase() !== w.toLowerCase()) return out;
    }
    const i = w.slice(1, -1).search(/[aeiou]/);
    return i >= 0 ? w.slice(0, i + 1) + w.slice(i + 2) : w + 'e';
  }

  /* ---------------- word supply ----------------
     ONE DOOR: nextWords(child, n, {purpose:'contest'}) (games spec §1.1) — kid-safe for this
     child, inside the level window, none of their last 150 game words, competition-tagged words
     first. The bee asks for the round's tier (−1 for the forgiving first round, +1 for the last
     round and sudden death) at the level being played (SB_LEVEL key 'mockbee'). Finals words —
     the top of the list, skeuomorph and its kind — are Champ's alone: Champ asks for the Champ
     level a tier up and keeps only those; every other bee keeps everything but them. A Family
     Bee night guest's words come through the same door at the level their band stands for. */
  const BAND_LEVEL = { '6-7': 'easy', '8-10': 'medium', '11-15': 'hard', adult: 'champ' };
  function nw(n, o) {
    try { if (typeof window.nextWords === 'function') return window.nextWords(active(), n, o) || []; } catch (e) {}
    try { return (typeof gameWordsD === 'function' ? gameWordsD() : []).filter(w => !o.filter || o.filter(w)); } catch (e) { return []; }
  }
  /* n words for this round and this speller, never one already given in this bee */
  function drawWords(n, R, who) {
    const g = mb(); const out = [];
    const used = g.used || (g.used = new Set());
    const champ = g.mode === 'champ';
    const take = (arr, loose) => {
      for (const w of arr || []) {
        if (out.length >= n) break;
        if (!w || !w.w || !w.d || !/^[a-z][a-z-]{2,}$/i.test(w.w)) continue;
        const k = nkey(w.w); if ((used.has(k) && !loose) || out.some(x => nkey(x.w) === k)) continue;
        used.add(k); out.push(w);
      }
    };
    const guest = g.mode === 'family' && who && !who.profile;
    const level = champ ? 'champ' : guest ? (BAND_LEVEL[who.band] || 'medium') : (g.mode === 'family' && who ? (BAND_LEVEL[who.band] || g.lvl) : g.lvl);
    const tier = champ ? 1 : (R.sdN >= 0 ? 1 : (R.tier || 0));
    const fin = champ && R.kind !== 'vocab' ? isFinals : (champ ? null : w => !isFinals(w));
    const o = { purpose: 'contest', key: 'mockbee', level, tier, needDef: true, filter: fin || undefined };
    take(nw(n + 6, o));
    if (out.length < n) take(nw(n + 6, { ...o, tier: 0 }));
    if (out.length < n) take(nw(n + 6, { purpose: 'contest', key: 'mockbee', level, needDef: true, filter: fin || undefined }), true);
    if (out.length < n) take(nw(n + 6, { purpose: 'contest', needDef: true }), true);
    return out;
  }

  /* ---------------- the vocabulary round (Champ) ----------------
     The app already has a meaning question: vocBuildCheck() — the Vocabulary section's. The bee
     widens the distractor pool (SB_VOCAB26, the national list) so a championship word is not
     given away by the register of three easy definitions. Every choice is punctuated and cut
     the same way, and distractors are chosen CLOSE IN LENGTH, so neither tidiness nor length
     is a tell. A meaning answered right never calls logBand or markMastered. */
  let _vocPool = null;
  function vocPool() {
    if (_vocPool) return _vocPool;
    const out = [];
    const push = arr => { for (const w of (arr || [])) if (w && w.w && String(w.d || '').trim().length > 8) out.push(w); };
    try { push((window.SB_VOCAB26 || {}).words); } catch (e) {}
    try { push(gameWordsD({ needDef: true })); } catch (e) {}
    const seen = new Set(); _vocPool = [];
    for (const w of out) { const k = nkey(w.w); if (seen.has(k)) continue; seen.add(k); _vocPool.push(w); }
    return _vocPool;
  }
  const DEF_MAX = 92;
  function defText(d) {
    let t = String(d || '').trim().replace(/\s+/g, ' ');
    const bare = t.replace(/\s*\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
    if (bare.length >= 12) t = bare;
    t = t.replace(/[.;,]+$/, '');
    const cut = t.search(/\.\s+[A-Z]/);
    if (cut > 24) t = t.slice(0, cut);
    if (t.length > DEF_MAX) {
      const clause = t.slice(0, DEF_MAX).lastIndexOf(';');
      const comma = t.slice(0, DEF_MAX).lastIndexOf(',');
      const at = clause > 34 ? clause : comma > 40 ? comma : -1;
      if (at > 0) t = t.slice(0, at);
      else { const sp = t.lastIndexOf(' ', DEF_MAX); t = t.slice(0, sp > 30 ? sp : DEF_MAX).replace(/[,;]$/, '') + '…'; }
    }
    t = t.replace(/[.;,]+$/, '');
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function vocQuestion(w) {
    const pool = vocPool();
    const mk = (ans, others) => {
      const A = defText(ans);
      if (!A) return null;
      const O = others.map(defText)
        .filter(x => x && x.toLowerCase() !== A.toLowerCase())
        .filter((x, i, a) => a.indexOf(x) === i)
        .sort((x, y) => Math.abs(x.length - A.length) - Math.abs(y.length - A.length));
      if (O.length < 3) return null;
      return { w, answer: A, choices: shuffle([A].concat(shuffle(O.slice(0, 6)).slice(0, 3))) };
    };
    if (pool.length >= 8) {
      const y = w.y || 3;
      let near = pool.filter(x => nkey(x.w) !== nkey(w.w) && Math.abs((x.y || 3) - y) <= 1);
      if (near.length < 6) near = pool.filter(x => nkey(x.w) !== nkey(w.w));
      const q = mk(w.d, shuffle(near.slice()).slice(0, 40).map(x => x.d));
      if (q) return q;
    }
    try {
      const b = vocBuildCheck([w]);
      if (b && b[0]) return mk(b[0].answer, b[0].choices.filter(c => c !== b[0].answer));
    } catch (e) {}
    return null;
  }
  function vocWordsFor(R, n) {
    const from = drawWords(n * 3, R).filter(w => String(w.d || '').trim().length > 8);
    const qs = [];
    for (const w of from) { const q = vocQuestion(w); if (q) qs.push(q); if (qs.length >= n) break; }
    if (qs.length < n) {
      for (const w of shuffle(vocPool().slice())) {
        if (qs.some(q => nkey(q.w.w) === nkey(w.w))) continue;
        const q = vocQuestion(w); if (q) qs.push(q);
        if (qs.length >= n) break;
      }
    }
    return qs;
  }
  function botKnows(bot, w, R) {
    let p = bot.voc == null ? bot.skill : bot.voc;
    if (bot.spec && bot.spec.test(String((w && w.o) || '') + ' ' + String((w && w.r) || ''))) p += .10;
    p -= (1 - bot.nerve) * .12 * ((R && R.press) || 0);
    p += .10;                                  /* Finals words: the meaning is easier than the spelling */
    p += (rnd() - .5) * (bot.vary || .1) * 1.4;
    return rnd() < clamp(p, .05, .97);
  }

  /* ---------------- the clock ----------------
     after() is the only timer the turn machinery uses. A timer belongs to the bee that set
     it and runs only while the hall is on screen: quit, start another, or leave by the tab
     bar, and it does nothing (tests/mockbee-faces.cjs). It always waits long enough for the
     line on the card to be read, and Watch the rest runs it at double speed. */
  const speedOf = g => (g && g.speed) || 1;
  function after(ms, fn) {
    const g = mb();
    const left = g && g.spokeAt ? Math.max(0, (g.spokeAt + g.spokeMs) - Date.now()) : 0;
    return setTimeout(() => { if (mb() === g && state.nav === 'mockbee') fn(); }, Math.max(ms, left) / speedOf(g));
  }
  const elapsed = g => Date.now() - ((g && g.t0) || Date.now());
  /* past 60% of the cap the write-along windows close; at the cap time is called */
  const late = g => elapsed(g) > CAP_MS * .6;
  function speakMs(text) {
    const w = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    let r = 1; try { r = state.voiceRate || 1; } catch (e) {}
    return Math.min(8000, 320 + w * 330 / r);
  }

  /* ================= ONE VOICE AT A TIME =================
     Everything the bee says goes through ONE queue, in order, each item waiting for the last
     to finish (onended / onend, with a duration-derived safety timer). `token` invalidates
     everything in flight when the bee is left or restarted. The only audio here is the word
     (its recorded clip, or the device voice), a recorded announcer line, a name, and the
     alternate pronunciation read by the device voice — no new recordings. */
  const AQ = { q: [], busy: false, token: 0, cur: null };
  function aqStop() {
    AQ.token++; AQ.q.length = 0; AQ.busy = false;
    try { if (AQ.cur && AQ.cur.pause) AQ.cur.pause(); } catch (e) {}
    AQ.cur = null;
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
  }
  function aqPush(item) { AQ.q.push(item); aqPump(); }
  function aqPump() {
    /* the hall is only heard IN the hall */
    if (state.nav !== 'mockbee') { if (AQ.q.length || AQ.busy) aqStop(); return; }
    if (AQ.busy) return;
    const it = AQ.q.shift(); if (!it) return;
    AQ.busy = true;
    const tok = AQ.token;
    let fired = false;
    const done = () => {
      if (fired) return; fired = true;
      if (tok !== AQ.token) return;
      AQ.cur = null; AQ.busy = false;
      setTimeout(aqPump, it.gap == null ? 140 : it.gap);
    };
    const missed = () => { if (it.miss) { try { it.miss(); } catch (e) {} } done(); };
    try {
      if (it.kind === 'cb') { try { it.fn(); } catch (e) {} return done(); }
      if (it.kind === 'tts') {
        if (!window.speechSynthesis) return done();
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(it.text);
        u.rate = (it.rate || 0.95) * (Number(state.voiceRate) || 1);
        u.onend = done; u.onerror = done;
        window.speechSynthesis.speak(u);
        const syl = Math.max(1, (String(it.text).match(/[aeiouy]+/gi) || [1]).length);
        setTimeout(done, Math.min(2600, 420 + syl * 320));
      } else {
        const a = new Audio(it.src);
        AQ.cur = a;
        a.onended = done; a.onerror = missed;
        a.play().catch(missed);
        setTimeout(done, it.max || 9000);
      }
    } catch (e) { done(); }
  }
  function aqWord(w) {
    const t = String(w || '').trim(); if (!t) return;
    let clip = null; try { clip = wordClip(t); } catch (e) {}
    aqPush(clip ? { kind: 'clip', src: clip, gap: 220 } : { kind: 'tts', text: t, gap: 220 });
  }
  /* the recorded announcer lines are exactly the files in voice/ann/ (tests/console-clean.cjs
     holds this list to the folder). An unrecorded line is shown and never asked for. */
  const _annGone = new Set();
  const ANN_HAVE = new Set(('allMiss-0 allMiss-1 boltEnd-0 boltEnd-1 boltIn-0 boltIn-1 botRight-0 botRight-1 botSafe-0 botSafe-1 '
    + 'botWrong-0 botWrong-1 c2Champ-0 c2Champ-1 c2First-0 c2First-1 callVocBot-0 finalTwo-0 finalTwo-1 meRight-0 meRight-1 '
    + 'meWrong-0 open-0 open-1 outMe-1 thin-0 thin-1 thin-2 thin-3 winBot-0 winBot-1 winMe-0 winMe-1').split(' '));
  function playAnn(p) {
    if (!p || !p.pool) return;
    const g = mb(); if (g && g.speed > 1) return;        /* watching at 2×: the card, not the voice */
    const key = p.pool + '-' + p.i;
    if (!ANN_HAVE.has(key) || _annGone.has(key)) return;
    aqPush({ kind: 'clip', src: 'voice/ann/' + key + '.mp3', gap: 160, miss: () => _annGone.add(key) });
  }
  function speakName(n, then) {
    const t = String(n || '').trim();
    if (t) aqPush({ kind: 'tts', text: t, gap: 170 });
    if (then) aqPush({ kind: 'cb', fn: then, gap: 0 });
  }
  /* announce(shown, spoken): the card reads `shown`; `spoken` is only a LENGTH hint — the
     time the line takes to read is the bee's pacing (after() waits for it). */
  function announce(text, spoken) {
    const g = mb(); if (!g) return;
    const beat = spoken === undefined ? text : spoken;
    g.announce = text;
    g.spokeAt = Date.now();
    g.spokeMs = beat ? Math.max(900, speakMs(beat)) : 0;
    const p = _pick; _pick = null;
    playAnn(p);
    if (p && /\{word\}\s*\.?\s*$/.test(p.raw || '')) { const w = g.word && g.word.w; if (w && g.speed === 1) aqWord(w); }
    render();
  }

  /* ---------------- going out ----------------
     Out is recorded in the order it happened, because that order IS the final placing.
     The first round forgives. */
  function sitDown(s) {
    const g = mb();
    if (roundAt(g.round).safe) return false;
    s.in = false;
    g.outSeq = (g.outSeq || []).concat([s]);
    g.roundOut = (g.roundOut || []).concat([s]);
    return true;
  }

  /* ---------------- championship rules ----------------
     With two left, a miss does NOT end it: the rival must spell the missed word AND one more.
     Miss either and the speller who sat down is back on their feet. Suspended in sudden death. */
  function champTry(misser, missedWord) {
    const g = mb();
    if (roundAt(g.round).sudden) return false;
    const rival = g.field.find(s => s.in && s !== misser);
    if (!rival || !missedWord || !missedWord.w) return false;
    const extra = drawWords(1, roundAt(g.round), rival)[0] || missedWord;
    g.c2 = { rival, misser, words: [missedWord, extra], step: 0 };
    after(900, champRun);
    return true;
  }
  function champRun() {
    const g = mb(); if (!g || g.view !== 'stage' || !g.c2) return;
    const c2 = g.c2, s = c2.rival;
    g.word = c2.words[c2.step];
    if (!g.word || !g.word.w) { g.c2 = null; return finish(); }
    g.typed = ''; g.asked = {}; g.atMic = s; g.lastPractice = null; g.turnAsks = [];
    announce(fill(pick(c2.step === 0 ? SAY.c2First : SAY.c2Champ, g.seed + c2.step * 3), { name: nameOf(s) }));
    if (isHuman(s)) return humanTurn(s, true);
    g.phase = 'bot'; g.botOut = '';
    callBotToMic(s, clamp(s.bot.pace * .5, 600, 1200));
  }
  function champAfter(ok) {
    const g = mb(); const c2 = g.c2; if (!c2) return;
    if (!ok) {
      g.c2 = null;
      const m = c2.misser; m.in = true;
      g.outSeq = (g.outSeq || []).filter(s => s !== m);
      announce(fill(pick(SAY.c2Miss, g.seed + g.round), { back: isProfile(m) && g.mode !== 'family' ? 'You are' : (nameOf(m) + ' is') }));
      if (isProfile(m)) { g.outAsk = false; g.speed = 1; }
      g.round++; g.redo = 0;
      after(1200, beginRound); return;
    }
    if (c2.step === 0) { c2.step = 1; after(800, champRun); return; }
    g.c2 = null;
    after(800, finish);
  }

  /* ================= the run ================= */
  /* Family names are for the evening: they live in this closure and in state.mb, never in the
     household, a device key, a backup or a request. Player 1 is always the profile child. */
  let _fam = null;
  function famPlayers() {
    const c = active() || {};
    if (!_fam) _fam = [{ profile: true, band: bandKey(c) }, { name: '', band: 'adult' }];
    _fam[0].profile = true;
    return _fam;
  }

  app2.mbOpen = (mode) => {
    aqStop(); dropMiss(state.mb);
    const m = MODES.indexOf(mode) >= 0 ? mode : ((state.mb && state.mb.mode) || 'bee');
    state.nav = 'mockbee'; state.screen = 'app';
    state.mb = { view: m === 'family' ? 'family' : 'lobby', mode: m, field: null, round: 0 };
    /* what the Chair reads: sentences, alternate pronunciations, the Coach's rulebook — and
       the arcade kit, which carries the shared stage */
    try { if (window.SB_LAZY) {
      SB_LAZY.need('arcade', () => { if (state.nav === 'mockbee' && state.mb) render(); });   /* the stage, the miss card, the keys */
      SB_LAZY.need(['sents', 'sounds', 'coachRules', 'vocab26'], () => { if (state.nav === 'mockbee' && state.mb && state.mb.view !== 'stage') render(); }); } } catch (e) {}
    try { window.scrollTo(0, 0); } catch (e) {}
    render();
  };
  app2.mbMode = (m) => {
    const g = mb(); if (!g || g.view === 'stage' || MODES.indexOf(m) < 0) return;
    g.mode = m; g.view = m === 'family' ? 'family' : 'lobby'; render();
  };
  /* Family setup: up to four players, each with a band */
  app2.mbFamAdd = () => { const P = famPlayers(); if (P.length < 4) P.push({ name: '', band: 'adult' }); render(); };
  app2.mbFamDel = (i) => { const P = famPlayers(); i = +i; if (i > 0 && i < P.length && P.length > 2) P.splice(i, 1); render(); };
  app2.mbFamName = (arg) => { const s = String(arg || ''); const k = s.indexOf('|'); const i = +s.slice(0, k);
    const P = famPlayers(); if (P[i] && !P[i].profile) P[i].name = s.slice(k + 1).slice(0, 18); };
  app2.mbFamBand = (arg) => { const [i, b] = String(arg || '').split('|'); const P = famPlayers();
    if (P[+i] && FAM_BANDS.some(x => x[0] === b)) P[+i].band = b; render(); };

  app2.mbStart = () => {
    aqStop(); dropMiss(state.mb);
    const c = active();
    const prev = mb();
    const mode = (prev && MODES.indexOf(prev.mode) >= 0) ? prev.mode : 'bee';
    const band = bandKey(c);
    const t0 = Date.now();
    const seed = (((t0 / 1000) | 0) ^ (t0 % 1000) * 2654435761) >>> 0;
    const g = {
      view: 'stage', mode, band, lvl: lvlGet(), seed, rnd: mkRng(seed), t0, speed: 1,
      field: null, round: 0, turn: 0, phase: 'roundIn', word: null, typed: '', asked: {},
      announce: '', place: 0, bonus: 0, mine: [], log: [],
      avatar: (c && c.avatar) || 'bizzy', name: (c && c.name) || 'You',
    };
    let order;
    if (mode === 'family') {
      const P = famPlayers().slice(0, 4);
      order = P.map((p, i) => ({ kind: 'player', profile: !!p.profile, band: p.band || 'adult',
        name: p.profile ? g.name : (String(p.name || '').trim() || 'Player ' + (i + 1)), pid: i }));
    } else {
      const B = BANDS[band] || BANDS['8-10'];
      order = B.ids.map(id => ({ kind: 'bot', bot: botById(id) })).concat([{ kind: 'me' }]);
    }
    shuffle(order, g.rnd);
    order.forEach((s, i) => { s.n = i + 1; s.in = true; s.hist = []; });
    g.field = order;
    g.myN = (order.find(isProfile) || {}).n || 1;
    state.mb = g;
    /* open-1: open-0's recording names a field of eleven (see SAY.open) */
    announce(pick(SAY.open, 1));
    after(1400, () => {
      if (mode === 'family') announce('Family Bee night. ' + order.length + ' spellers, one device — pass it to whoever is called.');
      else announce(fill(pick(SAY.draw, g.seed + 1), { n: g.myN }));
      beginRound();
    });
    render();
  };

  function beginRound() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    const live = alive();
    /* THE CAP. A bee still running at eight minutes ends: everyone standing shares the title,
       the way Scripps crowned co-champions when it ran out of words. */
    if (elapsed(g) >= CAP_MS - 20000 && live.length > 1) return timeCalled();
    const R = roundAt(g.round);
    g.turn = 0; g.roundMissed = 0; g.roundTook = 0; g.roundOut = [];
    g.kind = R.kind;
    g.roster = live.slice();
    if (R.kind === 'lightning') {
      if (live.length <= 2) { g.round++; return beginRound(); }   /* the last two are decided on words */
      g.words = drawWords(40, R);
      g.mid = avgHard(g.words);
      g.phase = 'boltIn';
      announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
      if (!profileIn()) { after(900, endBolt); return; }          /* no clock for a speller who is out */
      after(1400, startBolt); return;
    }
    if (R.kind === 'written') {
      g.words = drawWords(WRITTEN_N, R);
      g.mid = avgHard(g.words);
      g.phase = 'writtenIn';
      announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
      after(1400, startWritten); return;
    }
    if (R.kind === 'vocab') {
      g.vqs = vocWordsFor(R, live.length + 2);
      if (!g.vqs.length) { g.round++; return after(200, beginRound); }
      g.words = g.vqs.map(q => q.w);
    } else if (g.mode === 'family') {
      /* each player's word from their own band, dealt in draw order */
      g.words = g.roster.map(s => drawWords(1, R, s)[0]).concat(drawWords(2, R, g.roster[0]));
    } else {
      g.words = drawWords(live.length + 2, R);
    }
    g.mid = avgHard(g.words);
    g.phase = 'call';
    announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
    if (live.length === 2 && !g.saidFinal && !R.sudden) { g.saidFinal = true; after(600, () => announce(pick(SAY.finalTwo, g.seed))); }
    after(900, nextTurn);
  }
  const avgHard = ws => { const a = (ws || []).filter(Boolean); return a.length ? a.reduce((t, w) => t + hardness(w), 0) / a.length : .5; };

  function nextTurn() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (g.outAsk) return;                                   /* waiting on Finish now / Watch the rest */
    const live = alive();
    if (!live.length) return finish();
    /* the round runs over a ROSTER fixed when it began, so a speller who sits down does not
       shift the order and skip the one after them */
    while (g.turn < g.roster.length && !g.roster[g.turn].in) g.turn++;
    if (g.turn >= g.roster.length) return endRound();
    const s = g.roster[g.turn];
    /* THE CAP, strictly: a turn that could not finish inside eight minutes is not started */
    if (live.length > 1 && !g.c2 && elapsed(g) + (isHuman(s) ? turnMs() + 6000 : 9000) / speedOf(g) > CAP_MS) return timeCalled();
    const R = roundAt(g.round);
    g.atMic = s; g.typed = ''; g.asked = {}; g.lastPractice = null; g.turnAsks = [];
    if (R.kind === 'vocab') return vocTurn(s, R);
    g.word = (g.words && g.words.length) ? g.words[g.turn % g.words.length] : null;
    if (!g.word || !g.word.w) return finish();
    try { if (isProfile(s)) logGameWord(nkey(g.word.w)); } catch (e) {}
    if (isHuman(s)) return humanTurn(s);
    g.phase = 'bot'; g.botOut = '';
    if (g.speed > 1) {                                        /* watching: the card, the word, the letters */
      announce(s.bot.name + ', number ' + s.n + '.', 'Go.');
      aqWord(g.word.w);
      after(500, () => botTurn(s));
      return;
    }
    announce(fill(pick(SAY.callBot, g.seed + g.turn * 3 + g.round), { name: s.bot.name, age: s.bot.age + ' years old', tell: s.bot.tell, n: s.n }),
      s.bot.name + ', number ' + s.n + '.');
    speakName(s.bot.name, () => callBotToMic(s, clamp(s.bot.pace * .3, 300, 700)));
  }

  function endRound() {
    const g = mb(); const live = alive();
    const R = roundAt(g.round);
    /* real bee rule: if every speller in a round missed, nobody goes out and it runs again */
    if (!R.safe && g.roundMissed && g.roundTook && g.roundMissed >= g.roundTook && (g.redo = (g.redo || 0) + 1) <= 2) {
      (g.roundOut || []).forEach(s => { s.in = true; if (isProfile(s)) { g.outAsk = false; g.speed = 1; g.watch = false; } });
      g.outSeq = (g.outSeq || []).filter(s => s.in === false);
      g.roundOut = [];
      announce(pick(SAY.allMiss, g.seed + g.round));
      after(900, beginRound); return;
    }
    if (live.length <= 1) return finish();
    if (live.length <= 5) {
      const li = live.length === 5 ? 0 : live.length === 4 ? 1 : live.length === 3 ? 2 : 3;
      g.saidThin = g.saidThin || {};
      if (!g.saidThin[li]) { g.saidThin[li] = 1; announce(SAY.thin[li] || ''); }
    }
    g.round++; g.redo = 0;
    after(700, beginRound);
  }

  /* ---------------- a human at the microphone ---------------- */
  function humanTurn(s, c2) {
    const g = mb();
    g.atMic = s;
    /* Family night: the device goes round the table. Whoever is called taps Ready, so the
       last player's word is never in front of the next one. */
    if (g.mode === 'family' && g.lastHuman !== s) {
      g.phase = 'pass';
      announce('Pass the device to ' + nameOf(s) + '.', 'Pass.');
      return;
    }
    startMeTurn(s);
  }
  app2.mbReady = () => { const g = mb(); if (!g || g.phase !== 'pass' || !g.atMic) return; startMeTurn(g.atMic); };
  function turnMs() { try { return state.calmMode ? CALM_TURN_MS : TURN_MS; } catch (e) { return TURN_MS; } }
  function startMeTurn(s) {
    const g = mb();
    g.lastHuman = s;
    g.phase = 'me'; g.typed = ''; g.asked = {}; g.turnAsks = [];
    const tok = (g.clockTok = (g.clockTok || 0) + 1);
    g.clock = { tok, ms: turnMs(), deadline: Date.now() + turnMs(), cost: 0 };
    announce(fill(pick(SAY.callMe, g.seed + g.turn), { n: s.n }), 'Number ' + s.n + '.');
    speakName(nameOf(s), () => aqWord(g.word.w));
    meTick(tok);
  }
  /* The turn clock is patched in place, never re-rendered (a render every second drops a phone
     keyboard's focus). Running out grades whatever is typed — an empty box is a miss. */
  function meTick(tok) {
    const g = mb(); if (!g || g.phase !== 'me' || !g.clock || g.clock.tok !== tok) return;
    if (state.nav !== 'mockbee') return;
    const left = g.clock.deadline - Date.now();
    if (left <= 0) { g.timeUp = true; return app2.mbSpell(); }
    try {
      const el = document.getElementById('mb-clock');
      if (el) { el.textContent = Math.ceil(left / 1000) + 's'; el.classList.toggle('low', left <= 5000); }
      const ring = document.getElementById('mb-ring');
      if (ring) ring.style.strokeDashoffset = String(RING_C * (1 - clamp(left / g.clock.ms, 0, 1)));
    } catch (e) {}
    setTimeout(() => meTick(tok), 250);
  }

  /* ---------------- THE PRONOUNCER'S CHAIR (owner decision 7) ----------------
     Six requests a speller may make at a real bee, in a fixed order and one size. A request
     the word has no answer for is not drawn — never an empty button. Each one costs 3 s of
     the turn clock. Every answer is MASKED: about one definition in nine contains its own
     headword, and an origin can quote it ("French bouquet"). */
  const CHAIR = [['def', 'Definition', 'book'], ['ps', 'Part of speech', 'grid'], ['org', 'Origin', 'sprout'],
    ['sent', 'Sentence', 'quote'], ['say', 'Say it again', 'volume'], ['alt', 'Alternate pronunciation', 'volume']];
  const CHAIR_NAME = { def: 'Definition', ps: 'Part of speech', org: 'Origin', sent: 'Sentence', say: 'Say it again', alt: 'Alternate pronunciation' };
  function altOf(w) {
    try { if (typeof altPron === 'function') return altPron(w.w); } catch (e) {}
    try { const o = window.SB_ALT_PRON; const k = nkey(w.w); return (o && Object.prototype.hasOwnProperty.call(o, k)) ? o[k] : null; } catch (e) { return null; }
  }
  const txt = v => String(v == null ? '' : v).trim();
  function mask(t, word) {
    let s = txt(t); if (!s) return '';
    try { if (typeof maskTxt === 'function') s = maskTxt(s, word); } catch (e) {}
    s = maskWord(s, word);
    /* a plural or a past form quotes its stem: blank that too */
    const st = String(word || '').toLowerCase().replace(/(ies|es|s|ed|ing)$/, '');
    if (st.length >= 4 && st !== String(word).toLowerCase()) s = s.replace(new RegExp('\\b' + st.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig'), '▁▁▁');
    return s;
  }
  const maskWord = (s, w) => String(s || '').replace(new RegExp(String(w || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig'), '▁▁▁');
  /* The answer to one request, already masked — '' when there is none (the button hides). */
  function chairAnswer(w, k) {
    if (!w || !w.w) return '';
    if (k === 'def') { const t = mask(w.d, w.w); return /[a-z]{3}/i.test(t) ? t : ''; }
    if (k === 'ps') return mask(w.ps, w.w);
    if (k === 'org') return mask(w.o, w.w);
    if (k === 'sent') { const t = mask(w.s, w.w); return /[a-z]{3}/i.test(t) ? t : ''; }
    if (k === 'say') return 'said';
    if (k === 'alt') { const a = altOf(w); if (!a) return '';
      return mask([a.a, a.b].filter(Boolean).join(' · or · ') + (a.n ? ' — ' + a.n : ''), w.w) || 'said'; }
    return '';
  }
  const chairKeys = w => CHAIR.map(c => c[0]).filter(k => !!chairAnswer(w, k));
  app2.mbAsk = (k) => {
    const g = mb(); if (!g || g.phase !== 'me' || !g.clock || !CHAIR_NAME[k]) return;
    const w = g.word || {};
    if (!chairAnswer(w, k)) return;
    const repeat = k === 'say' || k === 'alt';
    if (g.asked && g.asked[k] && !repeat) { keepCaret(); return; }   /* already on the card */
    g.asked = { ...(g.asked || {}), [k]: ((g.asked && g.asked[k]) || 0) + 1 };
    (g.turnAsks = g.turnAsks || []).push(k);
    g.clock.deadline -= Q_COST; g.clock.cost += Q_COST;
    if (k === 'say') { aqStop(); aqWord(w.w); }
    if (k === 'alt') { const a = altOf(w); aqStop(); aqPush({ kind: 'tts', text: (a && a.s) || w.w, rate: .88 }); }
    render(); keepCaret();
  };
  function keepCaret() {
    setTimeout(() => {
      const el = document.getElementById('mb-in'); if (!el) return;
      const g = mb(); if (!g || g.phase !== 'me') return;
      try { el.focus(); const n = el.value.length; el.setSelectionRange(n, n); } catch (e) {}
    }, 0);
  }
  /* THE THINKING STRIP (Hard and Champ only): what an answer implies, in the Coach's words.
     Matched to the word — its origin row (Greek, French, Latin, a name) for Origin, the
     suffix-endings row for a part of speech on a word that ends that way, the sound-alike row
     for a definition or sentence on a homophone. Text from coach-rules.js, never invented. */
  const STRIP_FROM = {
    greek: r => (String(r.check).split(':')[1] || r.check).trim(),
    french: r => String(r.rule).split('. ').slice(1).join('. '),
    latin: r => r.check, epon: r => String(r.check).split('. ').slice(1).join('. ') || r.check,
    endings: r => r.check, hom: r => String(r.rule).split('. ').slice(1, 2).join('') || r.check,
  };
  function originKey(w) {
    const o = String(w.o || '').toLowerCase();
    if ((w.t || []).indexOf('eponyms') >= 0) return 'epon';
    if (/greek/.test(o)) return 'greek';
    if (/french/.test(o)) return 'french';
    if (/latin/.test(o)) return 'latin';
    return null;
  }
  function isHom(w) { try { return typeof homPartners === 'function' && homPartners(w.w).length > 0; } catch (e) { return false; } }
  function stripFor(w, k) {
    const R = window.SB_COACH_RULES; if (!R || !w) return '';
    let key = null, lead = '';
    if (k === 'org') { key = originKey(w); lead = 'Origin: ' + txt(w.o).split(/[ ,;(]/)[0]; }
    else if (k === 'ps') { if (/(able|ible|ance|ence|ant|ent)$/i.test(w.w)) { key = 'endings'; lead = 'Part of speech: ' + txt(w.ps); } }
    else if (k === 'def' || k === 'sent') { if (isHom(w)) { key = 'hom'; lead = 'A sound-alike'; } }
    const r = key && R[key]; if (!r) return '';
    let body = txt((STRIP_FROM[key] || (x => x.check))(r));
    /* one line: the first sentence, cut at a clause if it runs long */
    body = body.split(/(?<=\.)\s+/)[0];
    if (body.length > 84) { const c = Math.max(body.lastIndexOf(', ', 84), body.lastIndexOf(' — ', 84)); if (c > 30) body = body.slice(0, c) + '.'; }
    return body ? mask(lead + ' → ' + body, w.w) : '';
  }
  const stripOn = (g, s) => g.mode === 'champ' || (g.mode === 'family' ? (s && (s.band === '11-15' || s.band === 'adult'))
    : /^(hard|champ)$/.test(lvlConcrete(g.lvl, g.band)));

  app2.mbType = v => { const g = mb(); if (g) g.typed = String(v || ''); };
  app2.mbSpell = () => {
    const g = mb(); if (!g || g.phase !== 'me') return;
    const s = g.atMic && isHuman(g.atMic) ? g.atMic : alive().find(isProfile);
    if (!s || !g.word) return;
    const ok = sameSpelling(g.typed || '', g.word.w);
    g.phase = 'meDone'; g.meOk = ok; g.meTry = g.typed || ''; g.clock = null;
    record(s, g.word, ok, g.meTry, 'oral', g.turnAsks || []);
    /* A MISS HOLDS (FIX-BEE D3): the letters and the why stay at the microphone until
       Continue (or Enter). */
    if (!ok) { g.hold = () => { const gg = mb(); if (gg !== g || !g.hold) return; g.hold = null;
        const mc = g.missCard; g.missCard = null; try { if (mc && mc.held) mc.close(); } catch (e) {}
        humanVerdict(g, s, ok); };
      try { sfx('wrong'); } catch (e) {} render(); mountMiss(g); return; }
    humanVerdict(g, s, ok);
  };
  app2.mbGoOn = () => { const g = mb(); if (g && g.hold) g.hold(); };
  /* The ledger of the profile child's words: what they were given, what they wrote, what they
     asked — the recap, the level and the pay all read it. Only the profile child is paid, and
     only the profile child's progress moves; a guest's word touches nothing. */
  function record(s, w, ok, typed, kind, asks) {
    const g = mb();
    if (!isProfile(s)) { (g.guests = g.guests || []).push({ pid: s.pid, w: w.w, ok }); return; }
    g.mine.push({ w: w.w, ok, typed: typed || '', kind, asks: (asks || []).slice(), rec: w });
    try { logBand(w, ok, 1); } catch (e) {}
    if (ok) { try { markMastered(nkey(w.w)); } catch (e) {} try { payG(g); } catch (e) {} }
    else { try { mastEvidence(w.w, false); } catch (e) {} }
  }
  function humanVerdict(g, s, ok) {
    if (g.c2) {
      try { if (ok) { sfx('correct'); burstConfetti(24); } } catch (e) {}
      announce(fill(pick(ok ? SAY.meRight : SAY.meWrong, g.seed + g.round), { n: s.n, word: g.word.w }));
      s.hist.push(ok);
      after(900, () => champAfter(ok));
      return;
    }
    g.roundTook++;
    let out = false;
    if (ok) { try { sfx('correct'); burstConfetti(24); } catch (e) {}
      announce(g.mode === 'family' ? 'Correct, ' + nameOf(s) + '.' : fill(pick(SAY.meRight, g.seed + g.turn), { n: s.n }));
    } else {
      out = sitDown(s); g.roundMissed++;
      if (g.mode === 'family') announce(out ? 'No — the word was ' + g.word.w + '. Thank you, ' + nameOf(s) + '.' : 'No — ' + g.word.w + '. Round one forgives.');
      else announce(fill(pick(out ? SAY.meWrong : SAY.meSafe, g.seed + g.turn), { word: g.word.w }));
      if (out && alive().length === 1 && champTry(s, g.word)) { s.hist.push(ok); return; }
    }
    s.hist.push(ok);
    g.turn++;
    g.phase = 'call';
    /* out, with rivals still standing: the child chooses how the rest goes */
    if (out && isProfile(s) && g.mode !== 'family' && alive().length > 1) { g.outAsk = true; g.phase = 'outChoice'; render(); return; }
    after(900, nextTurn);
  }

  /* ---------------- when the child is out ---------------- */
  app2.mbWatch = () => {
    const g = mb(); if (!g || !g.outAsk) return;
    g.outAsk = false; g.watch = true; g.speed = 2; g.phase = 'call';
    announce('Watching the rest — at double speed.', 'Go.');
    after(400, resume);
  };
  app2.mbFinishNow = () => {
    const g = mb(); if (!g || (!g.outAsk && !g.watch)) return;
    g.outAsk = false; aqStop();
    resolveRest();
  };
  /* Finish now: the rest of the bee in one go, from each rival's own profile — the same
     botSpells, the same rules (the forgiving round, all-miss, two-word championship, sudden
     death) and the same seeded generator. If everybody misses the round the child went out
     in, the rules put the child back on their feet, and the bee resumes with them in it. */
  function resolveRest() {
    const g = mb(); let guard = 0;
    while (alive().length > 1 && guard++ < 400) {
      const R = roundAt(g.round);
      if (!g.roster || !g.roster.length || g.turn >= g.roster.length) {
        /* a round that has just been played out ends here; an empty or missing roster means the
           round counter already stands on the next round */
        if (g.roster && g.roster.length) {
          if (!R.safe && g.roundMissed && g.roundTook && g.roundMissed >= g.roundTook && (g.redo = (g.redo || 0) + 1) <= 2) {
            (g.roundOut || []).forEach(s => { s.in = true; });
            g.outSeq = (g.outSeq || []).filter(s => s.in === false);
            if (profileIn()) {
              g.speed = 1; g.watch = false; g.roster = [];
              announce(pick(SAY.allMiss, g.seed + g.round) + ' You are back in.');
              after(1200, beginRound); return;
            }
          } else { g.round++; g.redo = 0; }
        }
        g.roster = alive().slice(); g.turn = 0; g.roundMissed = 0; g.roundTook = 0; g.roundOut = [];
        g.mid = .5;
        const RL = roundAt(g.round);
        if (RL.kind === 'lightning' && g.roster.length > 2) {
          const board = g.roster.filter(s => !isHuman(s)).map(s => ({ s, score: botBolt(s.bot, RL) })).sort((a, b) => a.score - b.score);
          if (board.length) { board[0].s.hist.push(false); sitDown(board[0].s); }
          g.turn = g.roster.length;
        }
        continue;
      }
      const s = g.roster[g.turn];
      if (!s.in || isHuman(s)) { g.turn++; continue; }
      const synth = { _h: clamp(.5 + R.press * .2, 0, 1), o: '' };
      const ok = R.kind === 'vocab' ? botKnows(s.bot, synth, R) : botSpells(s.bot, synth, R);
      g.roundTook++;
      s.hist.push(ok);
      if (!ok) {
        const out = sitDown(s); g.roundMissed++;
        if (out && alive().length === 1 && !R.sudden) {
          const rival = alive()[0];
          const two = isHuman(rival) ? false : (botSpells(rival.bot, synth, R) && botSpells(rival.bot, synth, R));
          if (!two) { s.in = true; g.outSeq = g.outSeq.filter(x => x !== s); g.round++; g.roster = null; continue; }
        }
      }
      g.turn++;
    }
    if (alive().length > 1) {        /* the guard: the steadiest hand takes it */
      const best = alive().slice().sort((a, b) => ((b.bot && b.bot.skill) || 0) - ((a.bot && a.bot.skill) || 0));
      best.slice(1).forEach(s => { s.in = false; g.outSeq = (g.outSeq || []).concat([s]); });
    }
    finish();
  }

  /* ---------------- a rival's word ----------------
     The word is spoken and the child has a window to write it down before the rival spells
     it — practice, unpaid, whether or not it is their turn. The window is the band's, it
     closes as soon as the child presses Enter, and it is off when the child is out (Watch the
     rest) and in the last 30% of the cap. */
  function callBotToMic(s, delay) {
    after(delay, () => {
      const g = mb(); if (!g || g.view !== 'stage') return;
      aqWord(g.word.w);
      if (profileIn() && !g.watch && !late(g)) startPractice(s);
      else after(1200, () => botTurn(s));
    });
  }
  function startPractice(s) {
    const g = mb(); if (!g) return;
    g.phase = 'practice';
    const W = (BANDS[g.band] || BANDS['8-10']).win;
    g.practice = { typed: '', deadline: Date.now() + W, forBot: s };
    render();
    practiceTick();
  }
  function practiceTick() {
    const g = mb(); if (!g || g.phase !== 'practice' || !g.practice) return;
    if (state.nav !== 'mockbee') return;
    const left = g.practice.deadline - Date.now();
    if (left <= 0) { endPractice(); return; }
    try { const el = document.getElementById('mb-countdown'); if (el) el.textContent = Math.ceil(left / 1000) + 's'; } catch (e) {}
    setTimeout(practiceTick, 400);
  }
  function endPractice() {
    const g = mb(); if (!g || !g.practice) return;
    const s = g.practice.forBot, typed = g.practice.typed;
    g.lastPractice = typed ? { typed, correct: sameSpelling(typed, g.word.w) } : null;
    g.practice = null;
    g.phase = 'bot';
    botTurn(s);
  }
  app2.mbPracType = v => { const g = mb(); if (g && g.practice) g.practice.typed = String(v || ''); };
  app2.mbPracSkip = () => { if (mb() && mb().practice) endPractice(); };

  function botTurn(s) {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (!g.word || !g.word.w) return finish();
    const R = roundAt(g.round);
    const ok = botSpells(s.bot, g.word, R);
    const shown = ok ? g.word.w : misspell(g.word.w);
    g.botOut = ''; g.botOk = ok; g.phase = 'botSpell';
    g.botLen = shown.length; g.botStep = 0;
    /* letters one at a time, PATCHED IN PLACE — a render per letter made the podium jitter */
    let i = 0;
    const sp = speedOf(g);
    const step = () => {
      const gg = mb(); if (gg !== g || gg.view !== 'stage' || gg.phase !== 'botSpell' || state.nav !== 'mockbee') return;
      gg.botStep = ++i;
      gg.botOut = shown.slice(0, i).toUpperCase().split('').join(' ');
      let live = null;
      try { live = document.getElementById('mb-live'); } catch (e) {}
      if (live) live.textContent = gg.botOut; else render();
      if (i < shown.length) setTimeout(step, clamp(s.bot.pace / shown.length, 55, 150) / sp);
      else { render(); setTimeout(() => { if (mb() === g) verdict(s, ok); }, 460 / sp); }
    };
    step();
  }

  function verdict(s, ok) {
    const g = mb(); if (!g) return;
    if (g.c2) {
      try { sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
      announce(ok ? fill(pick(SAY.botRight, g.seed + g.round * 5), { name: s.bot.name })
        : fill(pick(SAY.botWrong, g.seed + g.round * 5), { name: s.bot.name, word: g.word.w }));
      s.hist.push(ok); g.phase = 'call';
      after(800, () => champAfter(ok)); return;
    }
    g.roundTook++;
    const isVoc = g.kind === 'vocab';
    if (ok) { try { sfx('correct'); } catch (e) {}
      announce(fill(pick(SAY.botRight, g.seed + g.turn * 5), { name: s.bot.name }), 'Correct.');
    } else {
      const out = sitDown(s); g.roundMissed++;
      try { sfx('wrong'); } catch (e) {}
      announce(isVoc
        ? (out ? 'No — that is not what it means. Thank you, ' + s.bot.name + '.' : 'Not the meaning — but nobody goes out this round.')
        : out ? fill(pick(SAY.botWrong, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w })
        : fill(pick(SAY.botSafe, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w }),
        isVoc ? (out ? 'No.' : 'No — but this round forgives.')
        : out ? 'No. ' + g.word.w + '.' : 'No — but round one forgives.');
      if (out && alive().length === 1 && champTry(s, g.word)) { s.hist.push(ok); g.phase = 'call'; return; }
    }
    s.hist.push(ok);
    g.turn++; g.phase = 'call';
    after(700, nextTurn);
  }

  /* ---------------- Champ: the written round ----------------
     The old Advanced Mock Rounds' written list, inside the bee: the words are spoken one at a
     time, the child writes each, and the rivals' papers are marked from their profiles. The
     lowest third sit down (never the last two). Paid per word right, like every word here. */
  const WRITTEN_N = 6, WRITTEN_MS = 75000;
  function startWritten() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (!profileIn()) return endWritten();
    g.phase = 'written';
    g.wr = { i: 0, typed: '', got: 0, done: [], deadline: Date.now() + WRITTEN_MS, tick: (g.wrTick = (g.wrTick || 0) + 1) };
    g.word = g.words[0];
    render();
    aqWord(g.word.w);
    writtenTick(g.wr.tick);
  }
  function writtenTick(tok) {
    const g = mb(); if (!g || g.phase !== 'written' || !g.wr || g.wr.tick !== tok || state.nav !== 'mockbee') return;
    const left = g.wr.deadline - Date.now();
    if (left <= 0) return endWritten();
    try { const el = document.getElementById('mb-wr-clock'); if (el) el.textContent = Math.ceil(left / 1000) + 's'; } catch (e) {}
    setTimeout(() => writtenTick(tok), 300);
  }
  app2.mbWrType = v => { const g = mb(); if (g && g.wr) g.wr.typed = String(v || ''); };
  app2.mbWrGo = () => {
    const g = mb(); if (!g || g.phase !== 'written' || !g.wr) return;
    const w = g.words[g.wr.i]; if (!w) return endWritten();
    const ok = sameSpelling(g.wr.typed || '', w.w);
    if (ok) g.wr.got++;
    g.wr.done.push({ w: w.w, ok });
    record(alive().find(isProfile), w, ok, g.wr.typed, 'written', []);
    try { logGameWord(nkey(w.w)); sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
    g.wr.typed = ''; g.wr.i++;
    if (g.wr.i >= g.words.length) return endWritten();
    g.word = g.words[g.wr.i];
    render();
    aqStop(); aqWord(g.word.w);
  };
  function endWritten() {
    const g = mb(); if (!g) return;
    const R = roundAt(g.round);
    const live = alive();
    const n = (g.words || []).length || WRITTEN_N;
    /* a paper not finished in time is marked on what was written */
    const board = live.map(s => ({ s, score: isProfile(s) ? ((g.wr && g.wr.got) || 0)
      : Array.from({ length: n }, (_, i) => botSpells(s.bot, g.words[i] || {}, R)).filter(Boolean).length }));
    board.forEach(r => { r.tb = rnd(); });
    board.sort((a, b) => a.score - b.score || a.tb - b.tb);
    const cut = Math.max(0, Math.min(Math.floor(live.length / 3), live.length - 2));
    g.phase = 'writtenDone'; g.wr = null;
    g.board = board.map(r => ({ name: nameOf(r.s), me: isProfile(r.s), score: r.score, of: n })).reverse();
    board.slice(0, cut).forEach(r => { r.s.hist.push(false); r.s.in = false; g.outSeq = (g.outSeq || []).concat([r.s]); });
    const meOut = board.slice(0, cut).some(r => isProfile(r.s));
    announce(cut ? 'The papers are marked. ' + board.slice(0, cut).map(r => nameOf(r.s)).join(', ') + (cut > 1 ? ' sit down.' : ' sits down.') : 'The papers are marked. Everybody stays.');
    after(2600, () => {
      const gg = mb(); if (!gg) return;
      gg.board = null;
      if (alive().length <= 1) return finish();
      gg.round++; gg.redo = 0;
      if (meOut && alive().length > 1) { gg.outAsk = true; gg.phase = 'outChoice'; gg.roster = []; gg.turn = 0; render(); return; }
      beginRound();
    });
  }
  /* after the out-choice: mid-round the next turn is called (nextTurn ends the round itself);
     at a round boundary — the written paper, the lightning board — the next round opens */
  const resume = () => { const g = mb(); if (!g) return; if (!g.roster || !g.roster.length) beginRound(); else nextTurn(); };

  /* ---------------- Champ: the meaning round ---------------- */
  function vocTurn(s, R) {
    const g = mb();
    g.vq = (g.vqs && g.vqs.length) ? g.vqs[g.turn % g.vqs.length] : null;
    if (!g.vq) return finish();
    g.word = g.vq.w; g.vPick = null; g.vprac = null; g.lastVPrac = null;
    if (isHuman(s)) {
      g.phase = 'vme';
      announce(fill(pick(SAY.callVocMe, g.seed + g.turn), { n: s.n }));
      speakName(nameOf(s), () => aqWord(g.vq.w.w));
      return;
    }
    if (!profileIn() || g.watch || late(g)) {               /* nobody to practise: straight to the answer */
      g.phase = 'vbot';
      announce(fill(pick(SAY.callVocBot, g.seed + g.turn * 3 + g.round), { name: s.bot.name, n: s.n, vtell: s.bot.vtell || 'thinks about it' }));
      return vocBotAnswer(s, R);
    }
    g.phase = 'vprac';
    g.vprac = { pick: null, deadline: Date.now() + 8000, forBot: s };
    announce(fill(pick(SAY.callVocBot, g.seed + g.turn * 3 + g.round), { name: s.bot.name, n: s.n, vtell: s.bot.vtell || 'thinks about it' }));
    speakName(s.bot.name, () => aqWord(g.vq.w.w));
    vpracTick();
  }
  function vpracTick() {
    const g = mb(); if (!g || g.phase !== 'vprac' || !g.vprac || state.nav !== 'mockbee') return;
    const left = g.vprac.deadline - Date.now();
    if (left <= 0) return endVprac();
    try { const el = document.getElementById('mb-vcount'); if (el) el.textContent = Math.ceil(left / 1000) + 's'; } catch (e) {}
    setTimeout(vpracTick, 400);
  }
  app2.mbVPracPick = i => {
    const g = mb(); if (!g || g.phase !== 'vprac' || !g.vprac || g.vprac.pick != null || !g.vq) return;
    g.vprac.pick = g.vq.choices[+i];
    render();
  };
  app2.mbVPracSkip = () => { if (mb() && mb().phase === 'vprac') endVprac(); };
  function endVprac() {
    const g = mb(); if (!g || !g.vprac) return;
    const s = g.vprac.forBot, mine = g.vprac.pick;
    g.lastVPrac = mine ? { pick: mine, correct: mine === g.vq.answer } : null;
    g.vprac = null; g.phase = 'vbot'; g.vPick = null;
    render();
    vocBotAnswer(s, roundAt(g.round));
  }
  function vocBotAnswer(s, R) {
    const g = mb();
    after(clamp(s.bot.pace * .7, 800, 2000), () => {
      const gg = mb(); if (!gg || gg.phase !== 'vbot') return;
      const ok = botKnows(s.bot, gg.vq.w, R);
      gg.vPick = ok ? gg.vq.answer : shuffle(gg.vq.choices.filter(c => c !== gg.vq.answer))[0];
      render();
      after(900, () => verdict(s, ok));
    });
  }
  app2.mbVocPick = i => {
    const g = mb(); if (!g || g.phase !== 'vme' || g.vPick != null || !g.vq) return;
    const me = g.atMic && isHuman(g.atMic) ? g.atMic : alive().find(isProfile); if (!me) return;
    g.vPick = g.vq.choices[+i];
    const ok = g.vPick === g.vq.answer;
    g.phase = 'vmeDone'; g.meOk = ok;
    try { sfx(ok ? 'correct' : 'wrong'); if (ok) burstConfetti(18); } catch (e) {}
    /* DELIBERATELY no logBand, no markMastered and no pay: a meaning is not a word spelt */
    const goOn = () => {
      const gg = mb(); if (!gg) return;
      if (gg.c2) { announce(ok ? 'Correct — and that is the title.' : 'That is not the meaning.'); me.hist.push(ok); after(900, () => champAfter(ok)); return; }
      gg.roundTook++;
      let out = false;
      if (ok) announce('Correct.');
      else {
        out = sitDown(me); gg.roundMissed++;
        announce(out ? 'That is not the meaning. Thank you, speller.' : 'Not that one — but nobody goes out this round.');
        if (out && alive().length === 1 && champTry(me, gg.vq.w)) { me.hist.push(ok); render(); return; }
      }
      me.hist.push(ok);
      gg.turn++; gg.phase = 'call';
      if (out && isProfile(me) && alive().length > 1) { gg.outAsk = true; gg.phase = 'outChoice'; render(); return; }
      after(900, nextTurn);
    };
    if (ok) { render(); after(1100, goOn); }
    else { g.hold = () => { if (mb() !== g || !g.hold) return; g.hold = null; render(); after(300, goOn); }; render(); }
  };

  /* ---------------- Champ: the lightning round ----------------
     One minute, everybody at once, lowest score out. The rivals are simulated at the bell. A
     speller who is out never sits through it: it resolves at once (§4.1). */
  const BOLT_MS = 60000;
  function startBolt() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (!profileIn()) return endBolt();
    g.phase = 'bolt';
    g.bolt = { i: 0, typed: '', got: 0, miss: 0, deadline: Date.now() + BOLT_MS, done: [], tick: (g.boltTok = (g.boltTok || 0) + 1) };
    announce(pick(SAY.boltIn, 1));
    aqWord((g.words[0] || {}).w || '');
    boltTick(g.bolt.tick);
  }
  function boltTick(token) {
    const g = mb(); if (!g || g.phase !== 'bolt' || !g.bolt || state.nav !== 'mockbee') return;
    if (token !== g.bolt.tick) return;
    if (Date.now() >= g.bolt.deadline) return endBolt();
    try { const el = document.getElementById('mb-bolt-clock'); if (el) el.textContent = Math.ceil((g.bolt.deadline - Date.now()) / 1000) + 's'; } catch (e) {}
    setTimeout(() => boltTick(token), 250);
  }
  app2.mbBoltType = v => { const g = mb(); if (g && g.bolt) g.bolt.typed = String(v || ''); };
  app2.mbBoltGo = () => {
    const g = mb(); if (!g || g.phase !== 'bolt' || !g.bolt) return;
    const b = g.bolt;
    const w = g.words[b.i % g.words.length];
    if (!w) return endBolt();
    const ok = sameSpelling(b.typed || '', w.w);
    if (ok) b.got++; else b.miss++;
    b.done.push({ w: w.w, typed: b.typed, ok });
    record(alive().find(isProfile), w, ok, b.typed, 'lightning', []);
    try { logGameWord(nkey(w.w)); } catch (e) {}
    b.typed = ''; b.i++;
    try { sfx(ok ? 'correct' : 'wrong'); } catch (e) {}
    const next = g.words[b.i % g.words.length];
    render();
    if (next) { aqStop(); aqWord(next.w); }
  };
  function botBolt(bot, R) {
    const rate = 5 + bot.skill * 11;
    const n = Math.max(3, Math.round(rate * (.85 + rnd() * .3)));
    let got = 0;
    for (let i = 0; i < n; i++) {
      const p = bot.skill - (1 - bot.nerve) * .18 * ((R && R.press) || 0) + (rnd() - .5) * (bot.vary || .1);
      if (rnd() < clamp(p, .05, .97)) got++;
    }
    return got;
  }
  function endBolt() {
    const g = mb(); if (!g) return;
    const live = alive();
    const R = roundAt(g.round);
    g.phase = 'boltDone';
    announce(pick(SAY.boltEnd, g.seed + g.round));
    const board = live.map(s => ({ s, score: isHuman(s) ? ((g.bolt && g.bolt.got) || 0) : botBolt(s.bot, R), tb: rnd() }));
    board.sort((a, b) => a.score - b.score || a.tb - b.tb);
    g.boltBoard = board.map(r => ({ name: nameOf(r.s), me: isProfile(r.s), score: r.score })).reverse();
    const loser = live.length > 2 ? board[0].s : null;
    render();
    after(2200, () => {
      const gg = mb(); if (!gg) return;
      if (loser) { loser.hist.push(false); sitDown(loser); announce(nameOf(loser) + ' spelled the fewest. Thank you, speller.'); }
      else announce('Both of you held. We go back to the words.');
      gg.boltBoard = null; gg.bolt = null;
      if (alive().length <= 1) return finish();
      gg.round++; gg.redo = 0;
      if (loser && isProfile(loser) && alive().length > 1) { gg.outAsk = true; gg.phase = 'outChoice'; gg.turn = 0; gg.roster = []; render(); return; }
      after(1200, beginRound);
    });
  }

  /* ---------------- the finish ---------------- */
  function timeCalled() {
    const g = mb();
    g.coChamps = alive().slice();
    announce('Time is called. Everyone still standing shares the title.', 'Time.');
    after(1200, () => finish(true));
  }
  function finish(co) {
    const g = mb(); if (!g || g.view === 'result') return;
    const left = alive();
    const champ = left[0] || null;
    const meIn = left.some(isProfile);
    g.view = 'result'; g.phase = 'over'; g.champ = champ; g.meWon = meIn; g.co = co && left.length > 1 ? left.slice() : null;
    g.atMic = champ; g.clock = null; g.practice = null; g.outAsk = false;
    g.ms = elapsed(g);
    const seq = g.outSeq || [];
    const size = g.field.length;
    const placeOf = s => s.in ? 1 : Math.max(2, size - seq.indexOf(s));
    g.places = g.field.map(s => ({ s, place: placeOf(s) })).sort((a, b) => a.place - b.place);
    const me = g.field.find(isProfile);
    const place = me ? placeOf(me) : size;
    g.place = place;
    /* PAY (§6): the words were paid as they were spelt (payG, into g.bonus). The contest event
       is the podium at a pass mark — 70% of the profile child's words right, and a top-three
       place that is not last. Nothing is paid for finishing. */
    const given = g.mine.length, right = g.mine.filter(m => m.ok).length;
    g.pct = given ? right / given : 0;
    let contest = 0;
    const podium = !!me && given > 0 && g.pct >= .7 && place <= 3 && place < size;
    if (podium) contest = addCoins('contest') || 0;
    g.contest = contest;
    g.pay = (g.bonus || 0) + contest;
    /* the level rule (§1.7): one Bee is one round; words right ÷ words given */
    g.lvlNote = '';
    if (g.mode === 'bee' && given) {
      try {
        if (window.SB_LEVEL && typeof SB_LEVEL.after === 'function') {
          const r = SB_LEVEL.after('mockbee', g.pct) || {};
          if (r.dropped) g.lvlNote = 'Let’s warm up on ' + (LVL_NAME[r.level] || r.level) + '. You can move back up any time.';
          else if (r.offerUp) {             /* two rounds at 80%: a step up is offered, never taken for the child */
            const cur = LEVELS.indexOf(lvlConcrete(r.level || g.lvl, g.band));
            g.lvlUp = typeof r.offerUp === 'string' ? r.offerUp : (cur >= 0 && cur < LEVELS.length - 1 ? LEVELS[cur + 1] : null);
          }
        }
      } catch (e) {}
    }
    if (g.mode !== 'family') {
      const p = prog();
      p.played = (p.played || 0) + 1;
      p.best = p.best ? Math.min(p.best, place) : place;
      if (meIn) p.wins = (p.wins || 0) + 1;
      saveProg(p);
    }
    try { save(); } catch (e) {}
    if (meIn) { try { burstConfetti(120); sfx('win'); } catch (e) {}
      announce(g.co ? 'Time is called — and you are one of the champions.' : pick(SAY.winMe, g.seed));
    } else {
      try { sfx('lose'); } catch (e) {}
      announce(g.co ? 'Time is called. ' + g.co.map(nameOf).join(', ') + ' share the title.'
        : fill(pick(SAY.winBot, g.seed), { name: champ ? nameOf(champ) : 'Nobody' }));
    }
    render();
  }
  const ordinal = n => n + (n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th');

  app2.mbQuit = () => { aqStop(); dropMiss(state.mb); if (_kb) { try { _kb.destroy(); } catch (e) {} _kb = null; } state.mb = null; state.nav = 'games'; render(); };
  app2.mbAgain = () => { app2.mbStart(); };
  app2.mbLobby = () => { const g = mb(); app2.mbOpen(g && g.mode); };
  /* the old chip, kept only for a build without SB_LEVEL */
  app2.mbSetDiff = (k) => { const c = active(); if (!c) return; c.mbDiff = k; try { save(); } catch (e) {} render(); };
  app2.mbLevelUp = (lv) => { try { if (window.SB_LEVEL && LEVELS.indexOf(lv) >= 0) SB_LEVEL.set('mockbee', lv); } catch (e) {} const g = mb(); if (g) { g.lvlUp = null; g.lvlNote = 'Moved up to ' + (LVL_NAME[lv] || lv) + '.'; } render(); };
  /* the recap's one action: the words missed go on the revision pile, marked as the child's
     own filing (the miss itself was already recorded as evidence when it happened) */
  app2.mbAddMissed = () => {
    const g = mb(); if (!g || g.addedMissed) return;
    const seen = new Set();
    g.mine.filter(m => !m.ok).forEach(m => { const k = nkey(m.w); if (seen.has(k)) return; seen.add(k); try { addMiss(m.rec || { w: m.w }, 'mark'); } catch (e) {} });
    g.addedMissed = seen.size || -1;
    try { save(); } catch (e) {}
    render();
  };

  /* ================= rendering ================= */
  const nameOf = s => !s ? '' : s.kind === 'me' ? ((mb() && mb().name) || 'You') : s.kind === 'player' ? s.name : s.bot.name;
  const initials = n => String(n || '?').trim().split(/\s+/).map(x => x[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  function face(s, size) {
    if (!s) return '';
    if (s.kind === 'me' || (s.kind === 'player' && s.profile)) return window.SB_AVATAR ? SB_AVATAR(mb().avatar, size) : '';
    if (s.kind === 'player') return `<span class="mb-init" style="width:${size}px;height:${size}px;font-size:${Math.round(size * .38)}px">${esc(initials(s.name))}</span>`;
    return window.SB_AVATAR ? SB_AVATAR(faceOf(s.bot), size) : '';
  }
  /* THE SHARED STAGE (§5.0): SGUI.stage, from the engine kit in saga2.js (lazy, group 'arcade' —
     mbOpen asks for it). The hall uses the whole play area (region:false) because its benches
     flank the microphone; the hall's own dark ink rides in .mb-in, since the stage's is the
     theme's. Until the kit has landed, a local stage of the same three bands stands in. */
  const kitStage = () => !!(window.SGUI && typeof SGUI.stage === 'function');
  function stageHTML(o) {
    const play = '<div class="mb-in mb-playin">' + (o.play || '') + '</div>';
    const controls = o.controls ? '<div class="mb-in mb-ctlin">' + o.controls + '</div>' : '';
    if (kitStage()) {
      try { return SGUI.stage({ plate: o.plate, name: 'mockbee', cls: 'mb-stage', region: false, label: 'Mock Spelling Bee', hud: o.hud, play, controls }); } catch (e) {}
    }
    setTimeout(fitStage, 0);
    return `<div class="mb-st" style="--mb-plate:url('${o.plate}')">
      <div class="mb-st-hud"><div class="mb-st-l">${o.hud.left || ''}</div><div class="mb-st-c">${o.hud.center || ''}</div><div class="mb-st-r">${o.hud.right || ''}</div></div>
      <div class="mb-st-play">${play}</div>
      <div class="mb-st-ctrl">${controls}</div></div>`;
  }
  /* THE MISS CARD (§1.5): SGUI.miss on the stage — the letters, the why, the word said again,
     Continue or Enter. The hall re-renders around it (an announcement, a lazy file landing), so
     a card whose stage was rebuilt is put back on the new one; and a card left behind when the
     child leaves the hall is closed without moving the bee, so the kit's hold never sticks. */
  const kitMiss = () => !!(window.SGUI && typeof SGUI.miss === 'function' && kitStage());
  function mountMiss(g) {
    if (!kitMiss() || mb() !== g || g.phase !== 'meDone' || !g.hold || state.nav !== 'mockbee') return;
    const host = document.querySelector('.sb-stage') || document.body;
    /* app3 hides any toast while a miss panel is on screen, checking after each render — which ran
       before this card was (re)mounted, so the check runs again here */
    const quiet = () => { try { if (typeof _toastVsMiss === 'function') _toastVsMiss(); } catch (e) {} };
    if (g.missCard && g.missCard.held) { if (!document.body.contains(g.missCard.el)) host.appendChild(g.missCard.el); quiet(); return; }
    g.missCard = SGUI.miss(host, g.word, g.meTry || '', { onContinue: () => { if (mb() === g && g.hold) g.hold(); } });
    quiet();
    const iv = setInterval(() => { if (!g.missCard) return clearInterval(iv); if (mb() !== g || state.nav !== 'mockbee') { clearInterval(iv); dropMiss(g); } }, 400);
  }
  function dropMiss(g) {
    if (!g || !g.missCard) return;
    const mc = g.missCard; g.missCard = null; g.hold = null;
    try { if (mc.held) mc.close(); } catch (e) {}
  }
  /* THE ON-SCREEN KEYBOARD (§1.6): SGUI.keys on a touch screen, typing into the bee's own field
     (the box shows the letters and keeps the phone's keyboard down); a desktop types into the
     input with the real keyboard. Re-mounted after every render, which rebuilds its host. */
  let _kb = null;
  const coarse = () => { try { return matchMedia('(pointer:coarse)').matches; } catch (e) { return false; } };
  const kitKeys = () => !!(window.SGUI && typeof SGUI.keys === 'function') && coarse();
  function typing(g) {
    if (!g) return null;
    if (g.phase === 'me') return { id: 'mb-in', get: () => g.typed || '', set: v => { g.typed = v; }, go: () => app2.mbSpell() };
    if (g.phase === 'practice' && g.practice) return { id: 'mb-prac-in', get: () => g.practice.typed || '', set: v => { g.practice.typed = v; }, go: () => app2.mbPracSkip() };
    if (g.phase === 'written' && g.wr) return { id: 'mb-in', get: () => g.wr.typed || '', set: v => { g.wr.typed = v; }, go: () => app2.mbWrGo() };
    if (g.phase === 'bolt' && g.bolt) return { id: 'mb-in', get: () => g.bolt.typed || '', set: v => { g.bolt.typed = v; }, go: () => app2.mbBoltGo() };
    return null;
  }
  function mountKeys() {
    if (_kb) { try { _kb.destroy(); } catch (e) {} _kb = null; }
    const g = mb(); if (!g || state.nav !== 'mockbee' || g.view !== 'stage' || !kitKeys()) return;
    const f = typing(g); const host = document.getElementById('mb-keys'); if (!f || !host) return;
    const show = () => { try { const el = document.getElementById(f.id); if (el) el.value = f.get(); } catch (e) {} };
    _kb = SGUI.keys(host, { touch: true, physical: false,
      onKey: ch => { if (typing(mb()) && f.get().length < 40) { f.set(f.get() + ch); show(); } },
      onBack: () => { f.set(f.get().slice(0, -1)); show(); },
      onEnter: () => f.go() });
  }
  /* the input a typing phase draws: on a touch screen it only shows the letters */
  const inputAttrs = () => kitKeys() ? ' readonly inputmode="none"' : '';
  const keysHost = () => kitKeys() ? '<div id="mb-keys" class="mb-keys"></div>' : '';
  const plate = () => { try { return PLATE; } catch (e) { return ''; } };
  /* The local stage fills the window between the shell's bar and its foot (the tab bar on a
     phone) and never makes the page scroll (§5.0 rule 1): measured, because #root is zoomed
     and the shell's bars differ by width. If the hall is ever taller than that, the play area
     scrolls inside the stage rather than the page. */
  function fitStage() {
    try {
      const st = document.querySelector('.mb-st'); if (!st || state.nav !== 'mockbee') return;
      st.style.height = '';
      const r = st.getBoundingClientRect(); const z = (r.height / (st.offsetHeight || r.height)) || 1;
      const top = r.top + window.scrollY;
      /* the foot: the phone's fixed tab bar when it is showing, else the window's bottom edge */
      let foot = 0; const tb = document.querySelector('.sb-tabbar');
      if (tb && getComputedStyle(tb).display !== 'none') foot = tb.getBoundingClientRect().height;
      const avail = window.innerHeight - top - foot - 10;
      st.style.height = Math.max(420, avail / z) + 'px';
    } catch (e) {}
  }
  try { window.addEventListener('resize', () => setTimeout(fitStage, 60)); } catch (e) {}
  const lvlChip = () => {
    try { if (window.SB_LEVEL && typeof SB_LEVEL.chip === 'function') return SB_LEVEL.chip('mockbee', 'Level'); } catch (e) {}
    const c = active() || {}; const cur = c.mbDiff || 'auto';
    const nxt = ['auto', 'easy', 'medium', 'hard', 'champ'];
    return `<button class="mb-lvl" data-act="mbSetDiff" data-arg="${nxt[(nxt.indexOf(cur) + 1) % nxt.length]}" aria-label="Word level: ${LVL_NAME[cur]}. Tap to change.">${LVL_NAME[cur]} ▾</button>`;
  };

  /* ---------- the lobby: three modes, the field, one button ---------- */
  function viewLobby() {
    const g = mb() || {}; const p = prog(); const c = active() || {};
    const band = bandKey(c), B = BANDS[band];
    const mode = g.mode || 'bee';
    const tiles = [['bee', 'Bee', B.rivals + ' rivals at your level. Sudden death after round ' + NUMERAL[B.rounds - 1].toLowerCase() + '.'],
      ['champ', 'Champ', 'A written list, the meanings, a lightning round — and Finals words.'],
      ['family', 'Family Bee night', '2–4 players on one device. Pass it round.']];
    const rivals = B.ids.map(botById);
    const play = `<div class="mb-lobby">
        <div class="mb-modes" role="radiogroup" aria-label="Kind of bee">${tiles.map(([k, t, d]) =>
          `<button class="mb-mode${mode === k ? ' on' : ''}" role="radio" aria-checked="${mode === k}" data-act="mbMode" data-arg="${k}">
            <b>${t}</b><span>${esc(d)}</span></button>`).join('')}</div>
        ${mode === 'bee' ? `<div class="mb-lvlrow mb-narrow">Word level ${lvlChip()}</div>` : ''}
        <div class="mb-field-h">${mode === 'champ' ? 'The field — Finals words tonight' : 'The field'}</div>
        <div class="mb-cards">${rivals.map(b => `<div class="mb-card">
          <span class="mb-card-face">${window.SB_AVATAR ? SB_AVATAR(faceOf(b), 48) : ''}</span>
          <span class="mb-card-in"><b>${esc(b.name)}<i>${b.age}</i></b><span class="mb-note">${esc(b.note)}</span></span></div>`).join('')}</div>
      </div>`;
    const controls = `<div class="mb-go-row"><button data-act="mbStart" class="mb-go">${iconSVG('crown', 17)} Take the stage</button></div>`;
    return `<div class="mb-wrap">${stageHTML({ plate: plate(),
      hud: { left: `<button data-act="mbQuit" class="mb-back">← Play</button>`,
        center: `<span class="sg-st-title mb-ttl"><span class="mb-title">Mock <span class="mb-wide">Spelling </span>Bee</span>${mode === 'bee' ? '<span class="mb-wide"> ' + lvlChip() + '</span>' : ''}</span>`,
        right: `<span class="mb-rec">${p.played ? (p.wins || 0) + ' won · best ' + ordinal(p.best || (B.rivals + 1)) : (B.rivals + 1) + ' spellers'}</span>` },
      play, controls })}</div>`;
  }

  /* ---------- Family Bee night: who is playing ---------- */
  function viewFamily() {
    const P = famPlayers();
    const c = active() || {};
    const row = (p, i) => `<div class="mb-prow">
        <span class="mb-pface">${p.profile ? (window.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 40) : '') : `<span class="mb-init" style="width:40px;height:40px;font-size:15px">${esc(initials(p.name || ('P' + (i + 1))))}</span>`}</span>
        ${p.profile ? `<span class="mb-pname"><b>${esc(c.name || 'You')}</b><i>the one whose words count</i></span>`
          : `<input class="mb-pin" data-fkey="mbFam${i}" maxlength="18" autocomplete="off" spellcheck="false" aria-label="Player ${i + 1}'s name"
              placeholder="Player ${i + 1}" value="${escA(p.name || '')}" oninput="callAct('mbFamName','${i}|'+this.value)">`}
        <span class="mb-pbands" role="group" aria-label="Word band">${FAM_BANDS.map(([k, l]) =>
          `<button class="${p.band === k ? 'on' : ''}" data-act="mbFamBand" data-arg="${i}|${k}">${l}</button>`).join('')}</span>
        ${p.profile || P.length <= 2 ? '<span class="mb-pdel"></span>' : `<button class="mb-pdel" data-act="mbFamDel" data-arg="${i}" aria-label="Remove player ${i + 1}">${iconSVG('close', 14)}</button>`}
      </div>`;
    const play = `<div class="mb-lobby">
        <div class="mb-modes slimrow" role="radiogroup" aria-label="Kind of bee">${[['bee', 'Bee'], ['champ', 'Champ'], ['family', 'Family Bee night']].map(([k, t]) =>
          `<button class="mb-mode slim${k === 'family' ? ' on' : ''}" role="radio" aria-checked="${k === 'family'}" data-act="mbMode" data-arg="${k}"><b>${t}</b></button>`).join('')}</div>
        <p class="mb-fam-note">Everyone spells on this device, in turn. Names are just for tonight — the app does not keep them.
          Grown-ups get grown-up words. Only ${esc(c.name || 'the speller')}’s words earn coins.</p>
        <div class="mb-players">${P.map(row).join('')}</div>
      </div>`;
    const controls = `<div class="mb-go-row">${P.length < 4 ? `<button data-act="mbFamAdd" class="mb-back2">+ Add a player</button>` : ''}
      <button data-act="mbStart" class="mb-go">${iconSVG('users', 17)} Start the bee</button></div>`;
    return `<div class="mb-wrap">${stageHTML({ plate: plate(),
      hud: { left: `<button data-act="mbQuit" class="mb-back">← Play</button>`, center: `<span class="sg-st-title mb-ttl"><span class="mb-title">Family Bee night</span></span>`,
        right: `<span class="mb-rec">${P.length} players</span>` }, play, controls })}</div>`;
  }

  /* ---------- the stage ---------- */
  const RING_C = 2 * Math.PI * 21;
  function clockHTML(g) {
    const ms = (g.clock && g.clock.ms) || turnMs();
    const left = g.clock ? Math.max(0, g.clock.deadline - Date.now()) : ms;
    return `<span class="mb-clockw" aria-label="Time left on this turn"><svg viewBox="0 0 50 50" width="50" height="50" aria-hidden="true">
      <circle cx="25" cy="25" r="21" class="mb-ring-bg"/><circle id="mb-ring" cx="25" cy="25" r="21" class="mb-ring"
        style="stroke-dasharray:${RING_C.toFixed(2)};stroke-dashoffset:${(RING_C * (1 - clamp(left / ms, 0, 1))).toFixed(2)}"/></svg>
      <b id="mb-clock" class="${left <= 5000 ? 'low' : ''}">${Math.ceil(left / 1000)}s</b></span>`;
  }
  function benchChip(s, g) {
    const on = s === g.atMic && g.view === 'stage';
    return `<span class="mb-chip${s.in ? '' : ' out'}${on ? ' now' : ''}${isProfile(s) ? ' mine' : ''}" title="${escA(nameOf(s) + (s.in ? '' : ' — out'))}">
      <span class="mb-face">${face(s, 34)}</span><b>${esc(nameOf(s))}</b><i>${s.n}</i></span>`;
  }
  /* symmetric benches: the profile child's chair in the middle, everyone else split evenly */
  function benches(g) {
    const others = g.field.filter(s => !(isProfile(s) && g.mode !== 'family'));
    const half = Math.ceil(others.length / 2);
    return [others.slice(0, half), others.slice(half)];
  }
  const MIC_SVG = `<svg class="mb-micsvg" viewBox="0 0 40 92" width="34" height="78" aria-hidden="true"><rect x="13" y="2" width="14" height="24" rx="7" fill="#3a3346" stroke="#cdb98a" stroke-width="2"/>
    <path d="M9 18v4a11 11 0 0 0 22 0v-4" fill="none" stroke="#cdb98a" stroke-width="2.4" stroke-linecap="round"/><path d="M20 33v50" stroke="#8a7a58" stroke-width="3"/><path d="M8 88h24" stroke="#8a7a58" stroke-width="4" stroke-linecap="round"/></svg>`;

  function podiumHTML(g) {
    const w = g.word || {};
    const s = g.atMic;
    const meNow = g.phase === 'me';
    if (meNow || g.phase === 'pass') {
      const who = (s && isHuman(s)) ? s : g.field.find(isProfile);
      return `<div class="mb-mic me">
        <span class="mb-mic-face">${face(who, 64)}</span>
        <div class="mb-mic-in"><span class="mb-mic-name">${esc(nameOf(who))} · number ${who ? who.n : g.myN}</span>
          ${g.phase === 'pass' ? `<div class="mb-truth">Your turn is next — take the device.</div>` : `<div class="mb-truth">Listen, ask, then spell it.</div>`}</div>
        ${meNow ? clockHTML(g) : ''}</div>`;
    }
    if (g.phase === 'meDone') {
      const who = (s && isHuman(s)) ? s : g.field.find(isProfile);
      return `<div class="mb-mic ${g.meOk ? 'ok' : 'no'}">
        <span class="mb-mic-face">${face(who, 64)}</span>
        <div class="mb-mic-in"><span class="mb-mic-name">${esc(nameOf(who))}</span>
          <div class="mb-letters">${esc((g.meTry || '—').toUpperCase().split('').join(' '))}</div>
          <div class="mb-truth">${g.meOk ? 'Correct' : (g.timeUp && !g.meTry ? 'Time ran out. ' : '') + 'The word was <b>' + esc(w.w || '') + '</b>'}</div>
          ${!g.meOk && g.hold && !kitMiss() && window.missFeedbackHTML ? `<div class="mb-why">${missFeedbackHTML(w, g.meTry || '')}</div>` : ''}</div></div>`;
    }
    if (g.phase === 'vme' || g.phase === 'vmeDone') return vocMeUI();
    if (g.phase === 'vprac') return vocPracUI();
    if (g.phase === 'vbot') return vocBotUI();
    if (/^bolt/.test(g.phase || '')) return boltUI();
    if (/^written/.test(g.phase || '')) return writtenUI();
    if (g.phase === 'practice') {
      const pr = g.practice || {}; const b = pr.forBot;
      return `<div class="mb-mic practice">
        <span class="mb-mic-face">${b ? face(b, 64) : ''}</span>
        <div class="mb-mic-in"><span class="mb-mic-name">${esc(nameOf(b))} is up · number ${b ? b.n : ''}</span>
          <div class="mb-prac-row"><span class="mb-prac-note">Write it down before ${esc(nameOf(b))} spells it — practice, nothing counts.</span>
          <span class="mb-countdown" id="mb-countdown">${Math.max(0, Math.ceil((pr.deadline - Date.now()) / 1000))}s</span></div></div></div>`;
    }
    if (g.phase === 'outChoice') {
      return `<div class="mb-mic out-card"><div class="mb-mic-in" style="align-items:center;text-align:center">
        <span class="mb-mic-name">You finish ${ordinal(alive().length + 1)} of ${g.field.length} — so far.</span>
        <div class="mb-truth">The others are still standing. Finish the bee now, or watch the rest at double speed.</div></div></div>`;
    }
    if (!s || isHuman(s)) return `<div class="mb-mic idle"><div class="mb-mic-in"><span class="mb-mic-name">${g.phase === 'roundIn' ? 'The hall settles…' : '…'}</span></div></div>`;
    const lp = g.lastPractice;
    /* the box is sized by a hidden ghost of X's (never the word, which would sit in the DOM) */
    const done = g.phase === 'botSpell' && g.botStep >= g.botLen;
    const ghost = new Array(Math.max(1, g.botLen || (w.w || '').length || 1)).fill('X').join(' ');
    return `<div class="mb-mic ${done ? (g.botOk ? 'ok' : 'no') : ''}">
      <span class="mb-mic-face">${face(s, 64)}</span>
      <div class="mb-mic-in"><span class="mb-mic-name">${esc(s.bot.name)} · ${s.bot.age} · number ${s.n}</span>
        <div class="mb-letters"><span class="mb-l-ghost" aria-hidden="true">${ghost}</span>
          <span class="mb-l-live" id="mb-live">${g.botOut || ''}</span>${g.botOut ? '' : '<span class="mb-thinking">thinking…</span>'}</div>
        ${lp ? `<div class="mb-prac-fb ${lp.correct ? 'ok' : 'no'}">You wrote <b>${esc(lp.typed.toUpperCase())}</b> — ${lp.correct ? 'you had it too.' : 'not quite that time.'}</div>` : ''}
      </div></div>`;
  }

  /* the controls band: the Chair and the input on a turn; the write-along; the choices */
  function controlsHTML(g) {
    const w = g.word || {};
    if (g.phase === 'me') {
      if (kitKeys()) return keysHost();          /* the box and the Chair sit in the play area; the keys own the controls */
      return chairHTML(g) + spellRow(g);
    }
    return controlsRest(g);
  }
  function spellRow(g) {
    return `<div class="mb-spellrow">
          <input class="mb-input" id="mb-in" data-fkey="mbIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Spell the word"${inputAttrs()}
            placeholder="spell it" value="${escA(g.typed || '')}" oninput="callAct('mbType',this.value)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbSpell');}">
          <button data-act="mbSpell" class="mb-submit">Spell it →</button></div>`;
  }
  function chairHTML(g) {
    const w = g.word || {};
    {
      const asked = g.asked || {};
      const keys = chairKeys(w);
      const who = g.atMic && isHuman(g.atMic) ? g.atMic : g.field.find(isProfile);
      const answers = ['def', 'ps', 'org', 'sent', 'alt'].filter(k => asked[k] && keys.indexOf(k) >= 0).map(k =>
        `<div><b>${CHAIR_NAME[k]}.</b> ${esc(k === 'alt' ? chairAnswer(w, k).replace(/^said$/, 'said aloud') : chairAnswer(w, k))}</div>`).join('');
      const strip = stripOn(g, who) ? ['org', 'ps', 'def', 'sent'].filter(k => asked[k]).map(k => stripFor(w, k)).filter(Boolean)
        .filter((x, i, a) => a.indexOf(x) === i) : [];
      return `<div class="mb-chair" role="group" aria-label="The pronouncer's chair — each question uses 3 seconds">${CHAIR.filter(c => keys.indexOf(c[0]) >= 0).map(([k, l, ic]) =>
          `<button data-act="mbAsk" data-arg="${k}" class="mb-ask${asked[k] ? ' on' : ''}" data-q="${k}">${iconSVG(ic, 15)}<span>${l}</span></button>`).join('')}</div>
        ${answers ? `<div class="mb-answers">${answers}</div>` : ''}
        ${strip.length ? `<div class="mb-strip">${strip.map(t => `<span>${esc(t)}</span>`).join('')}</div>` : ''}`;
    }
  }
  /* the typing row of the phase on screen: in the controls with a real keyboard, in the play
     area over the on-screen keys on a touch screen */
  const rowFor = g => g.phase === 'me' ? spellRow(g) : controlsRest(g, true);
  function controlsRest(g, rowOnly) {
    const w = g.word || {};
    if (!rowOnly && kitKeys() && typing(g)) return keysHost();
    if (g.phase === 'meDone' && !g.meOk && g.hold) return kitMiss() ? '' : `<div class="mb-go-row"><button data-act="mbGoOn" class="mb-submit">Continue →</button></div>`;
    if (g.phase === 'vmeDone' && !g.meOk && g.hold) return `<div class="mb-go-row"><button data-act="mbGoOn" class="mb-submit">Continue →</button></div>`;
    if (g.phase === 'pass') return `<div class="mb-go-row"><button data-act="mbReady" class="mb-go">${iconSVG('play', 16)} ${esc(nameOf(g.atMic))} — ready</button></div>`;
    if (g.phase === 'outChoice') return `<div class="mb-go-row">
        <button data-act="mbFinishNow" class="mb-go">${iconSVG('flag', 16)} Finish now</button>
        <button data-act="mbWatch" class="mb-back2">${iconSVG('play', 15)} Watch the rest (2×)</button></div>`;
    if (g.watch && g.view === 'stage') return `<div class="mb-go-row"><span class="mb-watching">Watching at 2×</span><button data-act="mbFinishNow" class="mb-back2">${iconSVG('flag', 15)} Finish now</button></div>`;
    if (g.phase === 'practice') {
      const pr = g.practice || {}; const b = pr.forBot;
      return `<div class="mb-spellrow">
          <button data-act="mbSay" class="mb-hear">${iconSVG('volume', 16)} Again</button>
          <input class="mb-input" id="mb-prac-in" data-fkey="mbPrac" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Write the rival's word"${inputAttrs()}
            placeholder="write it here" value="${escA(pr.typed || '')}" oninput="callAct('mbPracType',this.value)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbPracSkip');}">
          <button data-act="mbPracSkip" class="mb-submit">${esc(nameOf(b))}, spell it →</button></div>`;
    }
    if (g.phase === 'written') {
      const r = g.wr || {};
      return `<div class="mb-spellrow">
          <button data-act="mbSay" class="mb-hear">${iconSVG('volume', 16)} Again</button>
          <input class="mb-input" id="mb-in" data-fkey="mbIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Write the word"
            placeholder="write it — Enter for the next" value="${escA(r.typed || '')}" oninput="callAct('mbWrType',this.value)"${inputAttrs()}
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbWrGo');}">
          <button data-act="mbWrGo" class="mb-submit">Next →</button></div>`;
    }
    if (g.phase === 'bolt') {
      const b = g.bolt || {};
      return `<div class="mb-spellrow">
          <button data-act="mbSay" class="mb-hear">${iconSVG('volume', 16)} Again</button>
          <input class="mb-input" id="mb-in" data-fkey="mbIn" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Spell the word"
            placeholder="spell it — Enter for the next" value="${escA(b.typed || '')}" oninput="callAct('mbBoltType',this.value)"${inputAttrs()}
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbBoltGo');}">
          <button data-act="mbBoltGo" class="mb-submit">Next →</button></div>`;
    }
    if (g.phase === 'vprac') return `<div class="mb-go-row"><button data-act="mbVPracSkip" class="mb-submit">${esc(nameOf(g.vprac && g.vprac.forBot))}, answer it →</button></div>`;
    return `<div class="mb-go-row"><span class="mb-watching">${esc(roundAt(g.round).sub)}</span></div>`;
  }

  function viewStage() {
    const g = mb(); const R = roundAt(g.round); const live = alive();
    const [L, Rb] = benches(g);
    const mine = g.mode !== 'family' ? g.field.find(isProfile) : null;
    /* the entrance plays ONCE: render() rebuilds this wrapper, and a replayed slide on every
       repaint made the whole hall drift while a rival spelled */
    /* (no entrance slide on the kit's stage: a transform on its wrapper would unfix it) */
    const rise = g.rose || kitStage() ? '' : ' rise';
    g.rose = 1;
    setTimeout(() => { mountKeys(); if (g.phase === 'meDone' && g.hold) mountMiss(g); }, 0);
    const atmic = /^(me|meDone)$/.test(g.phase || '');   /* a phone folds the benches away while the child spells */
    const touchChair = kitKeys() && typing(g) ? `<div class="mb-touchchair">${g.phase === 'me' ? chairHTML(g) : ''}${rowFor(g)}</div>` : '';
    const play = `<div class="mb-hall${g.mode === 'family' ? ' fam' : ''}${atmic ? ' atmic' : ''}">
        <div class="mb-bench l">${L.map(s => benchChip(s, g)).join('')}</div>
        <div class="mb-centre${/^(me|meDone|pass)$/.test(g.phase || '') ? ' atmic' : ''}">
          <div class="mb-ann"><span class="mb-ann-ic">${iconSVG('volume', 15)}</span><p>${esc(g.announce || '')}</p></div>
          <div class="mb-podium">${podiumHTML(g)}${MIC_SVG}</div>${touchChair}
          ${mine ? `<div class="mb-mychair">${benchChip(mine, g)}</div>` : ''}
        </div>
        <div class="mb-bench r">${Rb.map(s => benchChip(s, g)).join('')}</div>
      </div>`;
    return `<div class="mb-wrap${rise}">${stageHTML({ plate: plate(),
      hud: { left: `<button data-act="mbQuit" class="mb-back">← Leave</button>`,
        center: `<span class="sg-st-title mb-ttl"><span class="mb-round">${R.name.indexOf(' · ') > 0 ? `<span class="mb-wide">${esc(R.name.split(' · ')[0])} · </span>${esc(R.name.split(' · ')[1])}` : esc(R.name)}<i>${esc(R.sub)}</i></span></span>`,
        right: `<span class="mb-rec">${live.length} of ${g.field.length}<span class="mb-wide"> standing</span></span>` },
      play, controls: controlsHTML(g) })}</div>`;
  }

  /* ---------- Champ's three rounds, drawn in the centre ---------- */
  function writtenUI() {
    const g = mb();
    if (g.phase === 'writtenIn') return `<div class="mb-mic mb-bolt"><div class="mb-mic-in" style="align-items:center;text-align:center">
      <div class="mb-bolt-big">${(g.words || []).length || WRITTEN_N}</div><div class="mb-mic-name">words to write — listen for each one</div></div></div>`;
    if (g.phase === 'writtenDone') return boardUI('The papers are marked.', g.board || [], true);
    const r = g.wr || {};
    return `<div class="mb-mic mb-bolt"><div class="mb-mic-in">
      <div class="mb-bolt-top"><span class="mb-bolt-clock" id="mb-wr-clock">${Math.max(0, Math.ceil((r.deadline - Date.now()) / 1000))}s</span>
        <span class="mb-bolt-score">Word ${Math.min((r.i || 0) + 1, (g.words || []).length)} of ${(g.words || []).length}</span></div>
      <div class="mb-bolt-trail">${(r.done || []).map(d => `<span class="mb-bt ${d.ok ? 'ok' : 'no'}">${esc(d.w)}</span>`).join('')}</div></div></div>`;
  }
  function boardUI(title, rows, of) {
    return `<div class="mb-mic mb-bolt"><div class="mb-mic-in"><span class="mb-mic-name">${esc(title)}</span>
      <div class="mb-boltboard">${rows.map((r, i) => `<div class="mb-brow${r.me ? ' me' : ''}${i === rows.length - 1 ? ' last' : ''}">
        <span class="mb-brank">${i + 1}</span><span class="mb-bname">${esc(r.name)}</span>
        <span class="mb-bscore">${r.score}${of && r.of ? '/' + r.of : ''}</span></div>`).join('')}</div></div></div>`;
  }
  function boltUI() {
    const g = mb();
    if (g.phase === 'boltIn') return `<div class="mb-mic mb-bolt"><div class="mb-mic-in" style="align-items:center;text-align:center">
      <div class="mb-bolt-big">60</div><div class="mb-mic-name">The lightning round — get ready</div></div></div>`;
    if (g.phase === 'boltDone') return boardUI('Time. The lightning board.', g.boltBoard || []);
    const b = g.bolt || {};
    return `<div class="mb-mic mb-bolt"><div class="mb-mic-in">
      <div class="mb-bolt-top"><span class="mb-bolt-clock" id="mb-bolt-clock">${Math.max(0, Math.ceil((b.deadline - Date.now()) / 1000))}s</span>
        <span class="mb-bolt-score">${b.got || 0} spelled</span></div>
      <div class="mb-bolt-trail">${(b.done || []).slice(-7).map(d => `<span class="mb-bt ${d.ok ? 'ok' : 'no'}">${esc(d.w)}</span>`).join('')}</div></div></div>`;
  }
  /* the meaning round shows the WORD — it is about what it means, and it has been said aloud.
     The choices are masked all the same. */
  function vocMeUI() {
    const g = mb(); const q = g.vq; if (!q) return '';
    const done = g.phase === 'vmeDone';
    return `<div class="mb-mic me${done ? (g.meOk ? ' ok' : ' no') : ''}">
      <div class="mb-mic-in">
        <span class="mb-mic-name">${esc(g.name)} · number ${g.myN}</span>
        <div class="mb-vword">${esc(q.w.w)} <button data-act="mbSay" class="mb-hear mb-vhear">${iconSVG('volume', 15)} Hear it</button></div>
        <div class="mb-vq">What does it mean?</div>
        <div class="mb-vopts">${q.choices.map((c, i) => {
          const chosen = done && g.vPick === c, right = done && c === q.answer;
          return `<button class="mb-vopt${right ? ' right' : chosen ? ' wrong' : ''}" ${done ? '' : `data-act="mbVocPick" data-arg="${i}"`}>
            <span class="mb-vletter">${String.fromCharCode(65 + i)}</span><span>${esc(maskTxt(c, q.w.w))}</span></button>`; }).join('')}</div>
        ${done && !g.meOk && g.hold ? `<p class="mb-truth">Not this time — the green one is what it means.</p>` : ''}
      </div></div>`;
  }
  function vocPracUI() {
    const g = mb(); const pr = g.vprac, q = g.vq; if (!pr || !q) return '';
    const s = pr.forBot;
    return `<div class="mb-mic practice"><div class="mb-mic-in">
      <span class="mb-mic-name">${esc(s.bot.name)} is up · number ${s.n}</span>
      <div class="mb-vword">${esc(q.w.w)} <button data-act="mbSay" class="mb-hear mb-vhear">${iconSVG('volume', 15)} Hear it</button></div>
      <div class="mb-prac-row"><span class="mb-prac-note">Pick one before ${esc(s.bot.name)} answers — nothing counts.</span>
        <span class="mb-countdown" id="mb-vcount">${Math.max(0, Math.ceil((pr.deadline - Date.now()) / 1000))}s</span></div>
      <div class="mb-vopts">${q.choices.map((c, i) => `<button class="mb-vopt${pr.pick === c ? ' picked' : ''}" ${pr.pick == null ? `data-act="mbVPracPick" data-arg="${i}"` : ''}>
        <span class="mb-vletter">${String.fromCharCode(65 + i)}</span><span>${esc(maskTxt(c, q.w.w))}</span></button>`).join('')}</div>
    </div></div>`;
  }
  function vocBotUI() {
    const g = mb(); const s = g.atMic, q = g.vq;
    if (!s || !q || isHuman(s)) return '';
    const i = g.vPick == null ? -1 : q.choices.indexOf(g.vPick);
    const done = i >= 0; const lp = g.lastVPrac;
    return `<div class="mb-mic${done ? (g.vPick === q.answer ? ' ok' : ' no') : ''}"><div class="mb-mic-in">
      <span class="mb-mic-name">${esc(s.bot.name)} · ${s.bot.age} · number ${s.n}</span>
      <div class="mb-vword">${esc(q.w.w)}</div>
      <div class="mb-letters"><span class="mb-l-ghost" aria-hidden="true">X</span><span class="mb-l-live">${done ? String.fromCharCode(65 + i) : ''}</span>${done ? '' : '<span class="mb-thinking">thinking…</span>'}</div>
      <div class="mb-vopts">${q.choices.map((c, k) => {
        const right = done && c === q.answer, theirs = done && c === g.vPick && c !== q.answer;
        return `<button class="mb-vopt small${right ? ' right' : theirs ? ' wrong' : ''}${lp && lp.pick === c ? ' mine' : ''}">
          <span class="mb-vletter">${String.fromCharCode(65 + k)}</span><span>${esc(maskTxt(c, q.w.w))}</span></button>`; }).join('')}</div>
      ${lp ? `<div class="mb-prac-fb ${lp.correct ? 'ok' : 'no'}">${lp.correct ? 'You had it too.' : 'Not the one you picked.'}</div>` : ''}
    </div></div>`;
  }
  /* "Hear it again" knows which word is in front of the speller */
  app2.mbSay = () => {
    const g = mb(); if (!g) return;
    let w = g.word;
    if (g.phase === 'bolt' && g.bolt && g.words && g.words.length) w = g.words[g.bolt.i % g.words.length];
    else if (g.phase === 'written' && g.wr && g.words) w = g.words[g.wr.i];
    else if (g.vq && /^v(me|meDone|prac|bot)$/.test(g.phase)) w = g.vq.w;
    if (g.phase === 'me') return app2.mbAsk('say');            /* on a turn it is a Chair question, and costs its 3 s */
    if (w && w.w) { aqStop(); aqWord(w.w); }
  };

  /* ---------- the result and the recap ---------- */
  /* which questions helped: the Chair's requests on each word, and the letters the answer
     pointed at when the word was spelt right ("You asked Origin on chimera — Greek — and spelt
     the ch right"). Nothing is scored for asking; the reward is the word. */
  const POINTS = { greek: /ph|ch|rh|y/, french: /eau|ette|esque|oir|que$|et$|ille/, endings: /(able|ible|ance|ence|ant|ent)$/ };
  function helpedLine(m) {
    const qs = (m.asks || []).filter((k, i, a) => a.indexOf(k) === i && k !== 'say');
    if (!qs.length) return '';
    const w = m.rec || { w: m.w };
    let point = '';
    if (qs.indexOf('org') >= 0) { const k = originKey(w); const re = k && POINTS[k]; const mm = re && String(m.w).match(re); if (mm) point = mm[0]; }
    if (!point && qs.indexOf('ps') >= 0) { const mm = String(m.w).match(POINTS.endings); if (mm) point = mm[0]; }
    const names = qs.map(k => CHAIR_NAME[k]).join(' and ');
    const org = qs.indexOf('org') >= 0 && w.o ? ' — ' + esc(txt(w.o).split(/[ ,;(]/)[0]) : '';
    return `You asked ${names} on <b>${esc(m.w)}</b>${org}${m.ok ? (point ? ` — and spelt the <b>${esc(point)}</b> right.` : ' — and spelt it right.') : ' — one to practise.'}`;
  }
  function viewResult() {
    const g = mb(); const p = prog();
    const champ = g.champ;
    const right = g.mine.filter(m => m.ok), miss = g.mine.filter(m => !m.ok);
    const helped = g.mine.map(helpedLine).filter(Boolean).slice(0, 5);
    const title = g.meWon ? (g.co ? 'Co-champion' : 'Champion') : 'The bee is over';
    const head = g.meWon ? (g.co ? 'You share the title.' : 'You won the bee.')
      : g.co ? esc(g.co.map(nameOf).join(', ')) + ' share the title.' : esc(nameOf(champ) || 'Nobody') + ' takes it.';
    const sub = g.mode === 'family' ? 'Family Bee night · ' + g.field.length + ' spellers'
      : g.meWon ? g.field.length + ' spellers, and the microphone is yours.' : 'You finished <b>' + ordinal(g.place) + '</b> of ' + g.field.length + '.';
    const chip = m => `<span class="mb-wchip ${m.ok ? 'ok' : 'no'}">${esc(m.w)}</span>`;
    const play = `<div class="mb-result${g.meWon ? ' won' : ''}">
        <span class="mb-result-face">${champ ? face(g.meWon ? g.field.find(isProfile) : champ, 92) : ''}</span>
        <h2>${head}</h2><p>${sub}</p>
        ${g.mode === 'family' ? `<div class="mb-boltboard fam">${g.places.map((r, i) => `<div class="mb-brow${isProfile(r.s) ? ' me' : ''}"><span class="mb-brank">${ordinal(r.place)}</span><span class="mb-bname">${esc(nameOf(r.s))}</span></div>`).join('')}</div>` : ''}
        <div class="mb-recap">
          <div class="mb-rc-h">${right.length} of ${g.mine.length} spelt right</div>
          ${g.mine.length ? `<div class="mb-wchips">${g.mine.map(chip).join('')}</div>` : ''}
          ${helped.length ? `<div class="mb-helped"><div class="mb-rc-h">What the Chair did</div>${helped.map(h => `<p>${h}</p>`).join('')}</div>` : ''}
          ${g.lvlNote ? `<p class="mb-lvlnote">${esc(g.lvlNote)}</p>` : ''}
          ${g.lvlUp ? `<p class="mb-lvlnote">Ready for ${LVL_NAME[g.lvlUp]}? <button data-act="mbLevelUp" data-arg="${g.lvlUp}" class="mb-lvl">Move up to ${LVL_NAME[g.lvlUp]}</button></p>` : ''}
        </div>
        <div class="mb-pay">${iconSVG('coin', 16)} ${fmtN(g.pay || 0)} ${g.pay === 1 ? 'coin' : 'coins'}${g.contest ? ' · podium' : ''}</div>
      </div>`;
    const controls = `<div class="mb-go-row">
        ${miss.length ? (g.addedMissed ? `<span class="mb-watching">${iconSVG('check', 15)} On your revision list</span>` : `<button data-act="mbAddMissed" class="mb-back2">${iconSVG('plus', 15)} Add missed words to revision</button>`) : ''}
        <button data-act="mbAgain" class="mb-go">${iconSVG('crown', 17)} Another bee</button>
        <button data-act="mbLobby" class="mb-back2">Change the bee</button></div>`;
    return `<div class="mb-wrap">${stageHTML({ plate: plate(),
      hud: { left: `<button data-act="mbQuit" class="mb-back">← Play</button>`, center: `<span class="sg-st-title mb-ttl"><span class="mb-title">${title}</span></span>`,
        right: `<span class="mb-rec">${p.played ? p.played + (p.played === 1 ? ' bee' : ' bees') + ' · ' + (p.wins || 0) + ' won' : g.field.length + ' spellers'}</span>` },
      play, controls })}</div>`;
  }

  window.MOCKBEE = {
    open: (m) => app2.mbOpen(m),
    view: () => { const g = mb(); if (!g) return viewLobby();
      return g.view === 'stage' ? viewStage() : g.view === 'result' ? viewResult() : g.view === 'family' ? viewFamily() : viewLobby(); },
    stats: () => prog(),
    /* THE CAST — one table of rivals, not a copy (games spec §2.5/§4.7): the Atlas duel (trail.js) and Mock Analogy Bee
       (analogy.js — owner, 10 Oct 2026, P0.9/P0.10: "same faces, same names everywhere") both seat it. `face` is never
       the child's own avatar (faceOf/alt); pass `mine` to say whose face that is. `voc` is how well a rival knows what
       words MEAN, which is what an analogy asks. */
    rivals: (mine) => BOTS.map(b => ({ id: b.id, name: b.name, age: b.age, lvl: b.lvl, nerve: b.nerve, voc: b.voc, spec: b.spec, vary: b.vary, face: faceOf(b, mine) })),
    /* the Play card's words, from the bee as it is now (the card itself is the lineup's) */
    card: () => { const c = active() || {}; const B = BANDS[bandKey(c)]; const p = prog();
      return { title: 'Mock Spelling Bee', promise: B.rivals + ' rivals, one microphone, eight minutes. Ask the pronouncer anything.',
        best: p.played ? (p.wins || 0) + ' won · best ' + ordinal(p.best || (B.rivals + 1)) : '', route: '#/mockbee' }; },
    /* for the tests: the rivals' faces, the recorded lines, the meaning question, the Chair, the
       size of a bee and the cap */
    faces: () => BOTS.map(b => ({ id: b.id, name: b.name, face: faceOf(b) })),
    annHave: () => [...ANN_HAVE],
    vocQ: w => vocQuestion(w),
    chair: w => chairKeys(w).map(k => ({ k, label: CHAIR_NAME[k], answer: chairAnswer(w, k) })),
    strip: (w, k) => stripFor(w, k),
    bands: () => JSON.parse(JSON.stringify(BANDS)),
    roundAt: (n, g) => roundAt(n, g),
    /* the words a round of the bee on stage would deal, n of them */
    draw: (n, r) => (state.mb && state.mb.field ? drawWords(n, roundAt(r)) : []),
    cap: CAP_MS, qCost: Q_COST, turnMs: TURN_MS,
  };

  /* keyboard: Enter spells on a turn, continues after a miss, moves a rival on during the
     write-along, takes Ready on Family night */
  window.addEventListener('keydown', e => { try {
    const g = mb(); if (!g || state.nav !== 'mockbee') return;
    if (e.key !== 'Enter') return;
    if (g.phase === 'me') { e.preventDefault(); app2.mbSpell(); }
    else if ((g.phase === 'meDone' || g.phase === 'vmeDone') && g.hold) { e.preventDefault(); app2.mbGoOn(); }
    else if (g.phase === 'practice') { e.preventDefault(); app2.mbPracSkip(); }
    else if (g.phase === 'pass') { e.preventDefault(); app2.mbReady(); }
  } catch (_) {} });
})();
