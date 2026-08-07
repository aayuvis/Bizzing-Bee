/* ============================================================
   MOCK SPELLING BEE — the Arcade's competition game.

   Spelling Quest was fifteen seasons of story with a boss at the end of each.
   It was a story mode wearing a spelling bee's clothes. This is the thing the
   child is actually training for: eleven spellers on a stage, one word each,
   miss and you sit down.

   Ten rivals, each a real competitor rather than a difficulty number — an age,
   a skill, a temperament and a speciality. Pip is eight and fast and reckless.
   Theo asks for every legal question and takes forever. Vesper is fifteen, has
   won this before, and does not get nervous. They spell in draw order, they
   misspell in plausible ways, and they go out when they miss.

   And an announcer who calls it like a final: introduces the round, names the
   speller, holds the pause, rings the bell, and gets louder as the field thins.

   Uses app3 globals: state, render, active, save, addCoins, sfx, burstConfetti,
   flash, say, deviceSpeak, corpusSlice, esc, escA, iconSVG, SB_AVATAR, logBand,
   markMastered, nkey, fmtN. Registers actions on `app` (a top-level const in
   app3's scope, NOT window.app) and renders via the nav hook.
   ============================================================ */
(function () {
  'use strict';
  const app2 = app;                       /* app3's top-level const */
  const LS = 'sb_mockbee';

  /* ---------------- the field ----------------
     Ten rivals. skill is the base chance of getting a word of their own level
     right; nerve is how much late-round pressure moves that number (high nerve =
     barely at all, low nerve = a lot); spec is an origin they are unusually good
     at; pace is how long they take at the microphone, which is characterisation
     as much as timing. */
  const BOTS = [
    { id: 'pixel', lvl: .18, name: 'Pip', age: 8, skill: .52, nerve: .74, voc: 0.40, vtell: 'spells at a sprint and has never once asked what it means', spec: null, pace: 620,
      note: 'Eight, and spells at a sprint. Brilliant or gone.', vary: .22,
      tell: 'starts before the pronouncer finishes' },
    { id: 'koi', lvl: .24, name: 'Nova', age: 9, skill: .58, nerve: .70, voc: 0.56, vtell: 'reads more than she lets on', spec: /old english|germanic/i, pace: 1150,
      note: 'Steady. Short words are hers and she knows it.', vary: .08,
      tell: 'says the word twice, always' },
    { id: 'beaker', lvl: .32, name: 'Rafi', age: 10, skill: .63, nerve: .58, voc: 0.74, vtell: 'takes the Latin root apart, so the meaning falls out of it', spec: /latin/i, pace: 1300,
      note: 'Takes every Latin root apart before he writes it.', vary: .10,
      tell: 'traces the letters on his palm' },
    { id: 'panda', lvl: .38, name: 'Suki', age: 11, skill: .66, nerve: .93, voc: 0.62, vtell: 'steady here too', spec: null, pace: 1400,
      note: 'Unshakeable. The lights do nothing to her.', vary: .07,
      tell: 'breathes out, then spells' },
    { id: 'comet', lvl: .42, name: 'Dax', age: 11, skill: .71, nerve: .34, voc: 0.50, vtell: 'can spell words he could not define at gunpoint', spec: null, pace: 700,
      note: 'Fastest here in round one. Watch him in round six.', vary: .16,
      tell: 'rocks on his heels' },
    { id: 'astro', lvl: .44, name: 'Mira', age: 12, skill: .70, nerve: .66, voc: 0.79, vtell: 'Greek gives her the meaning before the spelling', spec: /greek/i, pace: 1250,
      note: 'Greek is her language. Ask her for the origin and smile.', vary: .09,
      tell: 'asks for the language of origin every time' },
    { id: 'scopey', lvl: .43, name: 'Theo', age: 12, skill: .69, nerve: .80, voc: 0.85, vtell: 'asks for the definition every time — and remembers it', spec: null, pace: 2100,
      note: 'Asks all four questions. Every word. No exceptions.', vary: .06,
      tell: 'asks all four questions, every single word' },
    { id: 'melody', lvl: .52, name: 'Ines', age: 13, skill: .74, nerve: .72, voc: 0.71, vtell: 'French roots, French meanings', spec: /french/i, pace: 1200,
      note: 'French endings hold no silence she has not heard.', vary: .08,
      tell: 'mouths the word in French first' },
    { id: 'samurai', lvl: .62, name: 'Kwame', age: 14, skill: .80, nerve: .78, voc: 0.81, vtell: 'no weakness here either', spec: /latin|greek/i, pace: 1100,
      note: 'No weakness anybody has found yet.', vary: .06,
      tell: 'hands behind his back, dead still' },
    { id: 'goldlegend', lvl: .72, name: 'Vesper', age: 15, skill: .87, nerve: .95, voc: 0.88, vtell: 'knows the list the way other people know a song', spec: null, pace: 900,
      note: 'Won this last year. Has not looked at anyone since.', vary: .05,
      tell: 'does not ask for anything' },
  ];

  /* ---------------- the rounds, in the Scripps shape ----------------
     A national bee is not a single ladder of spelling rounds. It runs in
     SEGMENTS, and every segment is the same three things: you spell, then you
     answer for meaning, then — when the field is small enough to need deciding
     rather than thinning — you go to the spell-off. Scripps stages that as
     Preliminaries, Quarterfinals, Semifinals and Finals, and this does the same,
     except the stage advances when the field thins rather than when a calendar
     day ends, because this is one sitting with eleven spellers.

     `pct` is the slice of the ranked bee list a round draws from — a percentile
     window rather than a library y-band, because the library's y only reaches 7
     with any depth and a band of [8,9] has almost nothing in it. Windows overlap
     the way a real list does. `press` is the pressure multiplier: what turns a
     nervous speller's fifth round into a coin toss.
     The opening round does not eliminate — the announcer says so, so it is true. */
  const STAGES = [
    { name: 'Preliminaries', pct: [0, .30], press: .25,
      open: 'Eleven spellers. The preliminaries decide who is still here at lunch.' },
    { name: 'Quarterfinals', pct: [.26, .58], press: .55,
      open: 'Quarterfinals. The list gets longer and the room gets quieter.' },
    { name: 'Semifinals', pct: [.54, .82], press: .8,
      open: 'Semifinals. Everything from here is a word that has ended somebody’s bee.' },
    { name: 'Finals', pct: [.78, 1], press: 1,
      open: 'The finals. Championship words, and one microphone left.' },
  ];
  /* The three parts of a segment, in the order a bee actually runs them. Spelling
     opens because that is what a bee is; the vocabulary round is second, the way
     Scripps puts the meaning segment after the spelling one; the spell-off closes
     because it decides rather than thins, and a decider makes no sense as an
     opener. */
  const SEGMENT = [
    { kind: 'spell', sub: 'oral spelling',
      line: 'Spell it as you hear it. Miss it and you sit down.' },
    { kind: 'vocab', sub: 'word meanings',
      line: 'Now the meanings. Four choices, one right, and no second guess.' },
    { kind: 'lightning', sub: 'the spell-off',
      line: 'Ninety seconds. Spell as many as you can. The lowest score goes out.' },
  ];
  const SEG_LEN = SEGMENT.length;
  /* The stage a round belongs to. It climbs with the segment, but it also jumps
     when the field collapses — with eleven spellers a run of bad luck can leave
     three standing in the second segment, and calling that "Quarterfinals" while
     three people fight for a title reads as a bug. */
  function stageFor(seg, liveN) {
    let i = Math.min(seg, STAGES.length - 1);
    if (liveN <= 2) i = STAGES.length - 1;
    else if (liveN <= 4) i = Math.max(i, STAGES.length - 2);
    else if (liveN <= 6) i = Math.max(i, 1);
    return i;
  }
  const NUMERAL = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen'];
  /* Two spellers trading championship words under the two-word rule can go on all
     night — the simulator once found a bee that reached round fifty-three. So the
     hall escalates: past the last stage the list climbs to its very top, and after
     three further segments the championship rule is suspended and the next miss
     ends it. Sudden death is how real bees close, and it guarantees this one does. */
  const SUDDEN_AT = 3;
  function roundAt(n, liveN) {
    const seg = Math.floor(n / SEG_LEN);
    const part = SEGMENT[n % SEG_LEN];
    const si = stageFor(seg, liveN == null ? 99 : liveN);
    const st = STAGES[si];
    const over = Math.max(0, seg - (STAGES.length - 1));
    const sudden = over >= SUDDEN_AT && part.kind === 'spell';
    return {
      kind: part.kind, sub: part.sub, stage: st.name, stageI: si, seg: seg,
      name: st.name + ' · ' + (part.kind === 'spell' ? 'Round ' + (NUMERAL[seg] || (seg + 1))
        : part.kind === 'vocab' ? 'Vocabulary' : 'Spell-off'),
      pct: [Math.min(.94, st.pct[0] + over * .03), Math.min(1, st.pct[1] + over * .01)],
      press: st.press + over * .2,
      safe: n === 0 ? 1 : 0,
      sudden: sudden ? 1 : 0,
      line: n === 0 ? 'Everybody gets one, and nobody goes out. Find your feet.'
        : sudden ? 'Sudden death. The championship rule is suspended — the next miss ends this bee.'
        : (n % SEG_LEN === 0 && seg <= STAGES.length - 1) ? st.open : part.line,
    };
  }

  /* ---------------- the announcer ----------------
     Authored pools rather than one line per event, because the child will hear
     these many times and a bee announcer who repeats himself is a robot. */
  const SAY = {
    open: ['Ladies and gentlemen — eleven spellers, one microphone. Only one of you walks out with it.',
      'Welcome to the hall. Eleven spellers. The rules are the old rules: you miss, you sit down.',
      'The lights are up. Somewhere in this room is a champion who does not know it yet.'],
    draw: ['You have drawn number {n}. Remember it — it is your place in every round tonight.',
      'Number {n}. That is where you stand, and that is when you spell.',
      'Draw number {n}. Look at the faces beside you; some will not be there long.'],
    roundIn: ['{round}. {line}', 'We move to {round}. {line}', '{round} — {sub}. {line}'],
    callMe: ['Speller number {n}. Your word, please.', 'To the microphone, number {n}.',
      'Number {n} — this is yours.', 'Our own speller, number {n}. Take your time.'],
    callBot: ['{name}, {age}. {name} {tell}.', '{name} steps up — {age}, and {tell}.',
      'Number {n}, {name}. {age}, and {tell}.', '{name} to the microphone. {age}.'],
    /* the meaning round has its own calls — a bee announcer does not ask you to
       spell a word and then read you four definitions in the same breath */
    callVocMe: ['Speller number {n}. Your word, and its meaning, please.',
      'Number {n} — not the spelling this time. The meaning.',
      'To the microphone, number {n}. Which of these is it?',
      'Number {n}. Four meanings on the board. One of them is yours.'],
    callVocBot: ['{name}, number {n}. {name} {vtell}.',
      'Number {n}, {name}, for the meaning.',
      '{name} steps up — {vtell}.',
      '{name} to the microphone. The meaning, please.'],
    boltIn: ['Ninety seconds on the clock. Spell everything you can.',
      'This is the spell-off. No turns, no order — just the clock.',
      'Ninety seconds. Whoever spells the fewest is finished.'],
    boltEnd: ['Time. Pencils down.', 'That is ninety seconds.', 'Time is called.'],
    botRight: ['Correct.', 'That is correct.', 'Correct — and quickly.', 'Right. {name} stays.',
      'Clean. Not a hesitation in it.', 'Correct. {name} sits down still in this.'],
    botWrong: ['No. I am sorry — that is not it.', 'That is incorrect. The bell, please.',
      'No. The word was {word}.', 'Not this time. {word} was the word.',
      'Oh — no. And that is {name} done.'],
    meRight: ['CORRECT! Nicely handled.', 'That is correct! You are still in.',
      'Correct — and that is one more round you have survived.', 'Right! Sit down, number {n}, you are fine.'],
    meWrong: ['No — I am sorry. The word was {word}.', 'That is not it. {word}. Take a seat, and take it proudly.',
      'Incorrect. The word was {word}. That is a hard one to go out on.'],
    /* round one takes nobody, so a miss there gets a different bell */
    botSafe: ['Not quite — but this is round one, and round one forgives. {name} stays.',
      'No. The word was {word}. Lucky for {name}, nobody goes out in the warm-up.',
      'Incorrect — and it costs {name} nothing tonight. Not yet.'],
    meSafe: ['Not quite. The word was {word} — but this is the warm-up, and the warm-up forgives. You are still in.',
      'No. {word}. Round one takes nobody, so shake it off and stay standing.'],
    thin: ['Five left.', 'We are down to four.', 'Three spellers. Three.',
      'And then there were two. Championship rules from here.'],
    finalTwo: ['Championship rules now. Miss, and your rival can end this with two correct words.',
      'Two left. From here, one miss can lose it — if the other takes that word and the next.'],
    c2First: ['{name} — spell that word correctly, and one more, and this bee is over.',
      'Championship rules. {name}, the missed word first. Then one more.',
      'This is it. {name}, take the word that was just missed.'],
    c2Champ: ['And now the championship word. Get this one, {name}, and you are the champion.',
      'One word between {name} and the trophy. The championship word.',
      'The hall is silent. {name} — the championship word, please.'],
    c2Miss: ['No! {name} misses, and under championship rules {back} back on their feet. This bee is not over.',
      'That is incorrect — and it hands the bee back. {back} still in it. We go again.'],
    winMe: ['THAT IS IT! Ladies and gentlemen — your champion!',
      'Correct! And that is the bee! Champion!', 'That is the championship word — spelled correctly! It is over!'],
    winBot: ['{name} takes it. {name} is your champion.',
      'And that is the bee. {name}, {age} years old, champion.',
      '{name} spells the championship word. It is over.'],
    outMe: ['You finish {place}. Out of eleven — that is a real result.',
      '{place} place. The hall applauds; they know how far that is.'],
    allMiss: ['Nobody spelled it. Under the rules, everybody stays. We go again.',
      'A clean sweep of misses — so nobody goes out. Back to the top of the order.'],
  };
  const fill = (t, v) => String(t).replace(/\{(\w+)\}/g, (m, k) => (v && v[k] != null) ? v[k] : m);
  const pick = (arr, seed) => arr[Math.abs(seed | 0) % arr.length];

  /* ---------------- state ---------------- */
  const mb = () => state.mb;
  function prog() { try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { return {}; } }
  function saveProg(p) { try { localStorage.setItem(LS, JSON.stringify(p)); } catch (e) {} }

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };

  /* How hard is this word, 0..1. Words drawn from the ranked bee list carry
     their own percentile in `_h`, which is the honest answer; anything that
     arrives from elsewhere falls back to the library's y plus a length tax,
     because a nine-letter y-5 word beats a five-letter y-5 word at the mic. */
  function hardness(w) {
    if (typeof w._h === 'number') return w._h;
    const y = clamp((w.y || 3), 1, 9);
    return clamp((y - 1) / 8 * .82 + clamp(((w.w || '').length - 6) / 12, 0, 1) * .18, 0, 1);
  }

  /* Does this bot get it? Everyone starts from the same steady hand (BASE) and
     the answer turns on the gap between the word and the level they are
     comfortable at: inside their range they are near-certain, above it they
     fall away fast. Pressure is always a cost, and nerve is what buys it off —
     which is why Dax leads round one and loses round six. Vary is the
     day-to-day wobble that stops a bot being a lookup table. */
  const BASE = .84, SPREAD = 1.5, PRESS = .55;
  function botSpells(bot, w, press) {
    const spec = (bot.spec && bot.spec.test(w.o || '')) ? .10 : 0;
    const fit = ((bot.lvl != null ? bot.lvl : .4) - hardness(w)) * SPREAD;
    const nerve = -press * (1 - bot.nerve) * PRESS;
    const wobble = (Math.random() - .5) * bot.vary * 2;
    return Math.random() < clamp(BASE + spec + fit + nerve + wobble, .04, .97);
  }

  /* A wrong answer should look like something a child would actually write, not
     like noise: the doubles, the schwa endings, the silent letters and the ie/ei
     flip are where bees are lost. */
  const SLIPS = [
    [/([bcdfglmnprst])\1/, m => m[0]],                 // doubled -> single
    [/ie/, 'ei'], [/ei/, 'ie'],
    [/ance$/, 'ence'], [/ence$/, 'ance'],
    [/ible$/, 'able'], [/able$/, 'ible'],
    [/ph/, 'f'], [/ough/, 'uff'],
    [/([aeiou])r([aeiou])/, '$1rr$2'],                 // single -> doubled
    [/^(k)(n)/, '$2'], [/^(w)(r)/, '$2'],              // drop a silent head
    [/e$/, ''], [/([^aeiou])y$/, '$1ie'],
    [/tion$/, 'sion'], [/sion$/, 'tion'],
    [/c([ei])/, 's$1'], [/s([ei])/, 'c$1'],
  ];
  function misspell(word) {
    const w = String(word || '');
    const cands = SLIPS.filter(([re]) => re.test(w));
    if (cands.length) {
      const [re, to] = cands[Math.floor(Math.random() * cands.length)];
      const out = typeof to === 'function' ? w.replace(re, to) : w.replace(re, to);
      if (out && out.toLowerCase() !== w.toLowerCase()) return out;
    }
    /* nothing bit — drop a middle vowel, which is the schwa mistake */
    const i = w.slice(1, -1).search(/[aeiou]/);
    return i >= 0 ? w.slice(0, i + 1) + w.slice(i + 2) : w + 'e';
  }

  /* ---------------- word supply ----------------
     A bee is only as good as its list. Drawing on the whole 40k library by y-band
     puts dictionary tail on the stage — `abidingness` is a y-5 word and no bee has
     ever asked for it. So the hall keeps its own list: the ~4,650 words the library
     has actually tagged as competition words (`nt` — the finals lists and the
     Primary / Junior / Advanced / Senior tiers), ranked once by difficulty. Each
     round takes a percentile window of that ranking, which is how the ladder runs
     pie → hobbit → dogma → oregano → melee → dhole → harmattan → benthamite. */
  const BEE_TIER = /North South Finals|Senior|Advanced|Junior|Primary|NWFinal/i;
  let _beeList = null, _beeFrom = 0;
  function beeList() {
    const src = (window.SB_DATA && SB_DATA.nsf) || [];
    /* the library arrives in shards, so a list built at boot would be the first
       shard only — rebuild whenever the corpus has grown underneath us */
    if (_beeList && src.length === _beeFrom) return _beeList;
    _beeFrom = src.length;
    const out = [];
    for (const w of src) {
      if (!w || !w.w || !w.d || w.d.length < 5) continue;
      if (!/^[a-z]{3,}$/i.test(w.w)) continue;
      if (!w.nt || !BEE_TIER.test(w.nt)) continue;
      out.push(w);
    }
    /* rank: the library's own difficulty first, length as the tie-break */
    const sc = w => clamp(w.y || 3, 1, 9) * 10 + Math.min(20, (w.w.length - 4) * 1.6);
    out.sort((a, b) => sc(a) - sc(b) || a.w.length - b.w.length);
    /* every word carries its own percentile, which is what the bots are judged on */
    _beeList = out.map((w, i) => ({ ...w, _h: out.length > 1 ? i / (out.length - 1) : .5 }));
    return _beeList;
  }

  function roundWords(R, n) {
    const list = beeList();
    let pool = [];
    if (list.length > 60 && R.pct) {
      const a = Math.floor(R.pct[0] * list.length);
      const b = Math.max(a + n * 4, Math.ceil(R.pct[1] * list.length));
      pool = list.slice(a, Math.min(b, list.length));
    }
    /* the tagged list has not loaded yet (or a build stripped it) — fall back to
       the y-bands so the bee still runs rather than dying on an empty stage */
    if (pool.length < n) {
      const band = R.band || [Math.max(1, Math.round(1 + (R.pct ? R.pct[0] : 0) * 8)),
        Math.min(9, Math.round(2 + (R.pct ? R.pct[1] : 1) * 8))];
      try { pool = pool.concat(corpusSlice(band[0], band[1], 600) || []); } catch (e) {}
      pool = pool.filter(w => w && w.w && w.d && /^[a-z][a-z-]{2,}$/i.test(w.w));
    }
    const seen = new Set(), out = [];
    for (const w of shuffle(pool.slice())) {
      if (!w || !w.w) continue;
      const k = nkey(w.w); if (seen.has(k)) continue; seen.add(k); out.push(w);
      if (out.length >= n) break;
    }
    /* last resort: a bee with no list is not a bee, so take anything spellable */
    if (!out.length && list.length) out.push(list[Math.floor(Math.random() * list.length)]);
    return out;
  }

  /* ---------------- the vocabulary round ----------------
     The app already has a meaning question: vocBuildCheck() in app3, which is
     what the Vocabulary section asks. Reusing it means the child meets exactly
     the question they have been practising, and there is one implementation
     rather than two drifting apart.

     The one thing it cannot do unchanged is the late rounds. Its distractors
     come from gameWordsD(), which is scoped to THIS CHILD's difficulty band —
     about 180 words for a level-four speller. Put a championship word against
     three level-four definitions and the right answer is obvious from its
     register alone, without knowing anything. So the bee widens the pool itself
     rather than touching the shared function, whose behaviour the Vocabulary
     section's headless test pins down.

     SB_VOCAB26 is the natural source: 997 words, every one carrying a
     definition, and it is the actual national vocabulary list. */
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
  /* EVERY CHOICE IS PUNCTUATED THE SAME WAY, and this is not cosmetic.
     The answer comes from the round's word and the distractors from wherever the
     pool found them, and the two banks are written differently: SB_VOCAB26
     definitions are sentence-cased and end in a full stop, the library's are
     lowercase fragments that do not. Printed side by side, the right answer was
     the only tidy one — a child could learn to pick it without knowing the word,
     which is a quiz that tests nothing. Normalising all four identically is what
     makes the question honest. */
  function defText(d) {
    let t = String(d || '').trim().replace(/\s+/g, ' ');
    t = t.replace(/[.;,]+$/, '');
    /* only the first sentence: some definitions run to three, and a long one is
       another tell as surely as a full stop is */
    const cut = t.search(/\.\s+[A-Z]/);
    if (cut > 24) t = t.slice(0, cut);
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  /* One meaning question. Falls back to the app's own builder when the wide pool
     is unavailable, so a missing data file costs a good question, not the round. */
  function vocQuestion(w) {
    const pool = vocPool();
    /* LENGTH IS THE OTHER TELL. "Pick the longest one" is the oldest trick a
       child brings to a multiple-choice paper, and it works whenever the right
       answer is a careful full definition and the wrong ones are three-word
       stubs. So the distractors are chosen for being CLOSE IN LENGTH to the
       answer — from a wider candidate list, sorted by how near they land, with
       enough slack left that the three are not identical in shape. */
    const mk = (ans, others) => {
      const A = defText(ans);
      if (!A) return null;
      const O = others.map(defText)
        .filter(x => x && x.toLowerCase() !== A.toLowerCase())
        .filter((x, i, a) => a.indexOf(x) === i)
        .sort((x, y) => Math.abs(x.length - A.length) - Math.abs(y.length - A.length));
      if (O.length < 3) return null;
      /* take from the nearest six rather than the nearest three, so the set is
         well-matched without being mechanically so */
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
  /* A round's worth of questions, one per speller. Words come from the round's
     own difficulty window, and only ones that carry a usable definition. */
  function vocWordsFor(R, n) {
    const from = roundWords(R, n * 4).filter(w => w && String(w.d || '').trim().length > 8);
    const qs = [];
    for (const w of from) { const q = vocQuestion(w); if (q) qs.push(q); if (qs.length >= n) break; }
    if (qs.length < n) {           /* the round list was thin on definitions */
      for (const w of shuffle(vocPool().slice())) {
        if (qs.some(q => nkey(q.w.w) === nkey(w.w))) continue;
        const q = vocQuestion(w); if (q) qs.push(q);
        if (qs.length >= n) break;
      }
    }
    return qs;
  }
  /* Does a rival know this one? Their `voc` rather than their `skill`, nudged by
     the round's pressure and by whether the word sits in their speciality — a
     Latin specialist has the root, and the root is most of the meaning. */
  function botKnows(bot, w, press) {
    let p = bot.voc == null ? bot.skill : bot.voc;
    if (bot.spec && bot.spec.test(String(w.o || '') + ' ' + String(w.r || ''))) p += .10;
    p -= (1 - bot.nerve) * .12 * (press || 0);
    p -= Math.max(0, ((w.y || 3) - 4)) * .05;
    p += (Math.random() - .5) * (bot.vary || .1) * 1.4;
    return Math.random() < clamp(p, .05, .97);
  }

  /* ---------------- the run ---------------- */
  app2.mbOpen = () => {
    state.nav = 'mockbee'; state.screen = 'app';
    state.mb = { view: 'lobby', field: null, round: 0, seed: (Date.now() / 1000) | 0 };
    try { window.scrollTo(0, 0); } catch (e) {}
    render();
  };

  app2.mbStart = () => {
    const c = active();
    /* the draw: eleven numbers in a hat, and one of them is yours */
    const order = shuffle(BOTS.map((b, i) => ({ kind: 'bot', bot: b, i })).concat([{ kind: 'me' }]));
    order.forEach((s, i) => { s.n = i + 1; s.in = true; s.hist = []; });
    const me = order.find(s => s.kind === 'me');
    state.mb = {
      view: 'stage', field: order, round: 0, turn: 0, myN: me.n,
      phase: 'roundIn', word: null, typed: '', asked: {}, log: [],
      announce: '', busy: false, place: 0, seed: (Date.now() / 1000) | 0,
      avatar: (c && c.avatar) || 'bizzy', name: (c && c.name) || 'You',
    };
    announce(fill(pick(SAY.open, state.mb.seed), {}));
    after(1400, () => { announce(fill(pick(SAY.draw, state.mb.seed + 1), { n: me.n })); beginRound(); });
    render();
  };

  /* ---------------- the announcer's voice ----------------
     Two faults lived here. The hall spoke at a flat .98 while the whole rest of
     the app speaks at 0.95 x the child's rate, so the announcer ran faster than
     everything else and ignored Settings -> Slow entirely. And deviceSpeak
     cancels whatever is mid-sentence, so every beat scheduled sooner than the
     line takes to read chopped it — a stream of half-sentences, which is what a
     glitch sounds like.

     So: the hall speaks at the app's rate, a shade slower because an announcer
     should be unhurried, and NOTHING is scheduled inside a line that is still
     being read. `after()` is the only timer this file uses from here on. */
  const rateOf = () => { try { return 0.90 * (state.voiceRate || 1); } catch (e) { return 0.90; } };
  /* about 2.8 words a second at that rate, plus a breath at each end */
  function speakMs(text) {
    const w = String(text || '').trim().split(/\s+/).filter(Boolean).length;
    let r = 1; try { r = state.voiceRate || 1; } catch (e) {}
    return Math.min(8000, 320 + w * 330 / r);
  }
  /* wait at least ms, and always long enough for the line in the air to land */
  function after(ms, fn) {
    const g = mb();
    const left = g && g.spokeAt ? Math.max(0, (g.spokeAt + g.spokeMs) - Date.now()) : 0;
    return setTimeout(fn, Math.max(ms, left));
  }

  /* announce(shown, spoken)
       shown   what the card on the stage reads
       spoken  what the announcer actually says — '' to say nothing

     Reading every line in full is correct and unplayable: a bee where the hall
     reads a sentence about each of ten rivals before each of them spells takes
     five minutes to reach round four. So the voice is spent where it earns its
     keep — the open, the draw, every round, YOUR call and YOUR verdict, the
     field thinning, championship rules, the finish — and the routine rival
     chatter is shown on the card and given a two-word call instead, the way a
     real pronouncer says "Correct." and moves on. */
  function announce(text, spoken) {
    const g = mb(); if (!g) return;
    const say2 = spoken === undefined ? text : spoken;
    g.announce = text;
    g.log = (g.log || []).concat([text]).slice(-40);
    g.spokeAt = Date.now(); g.spokeMs = say2 ? speakMs(say2) : 0;
    if (say2) { try { deviceSpeak(say2, rateOf()); } catch (e) {} }
    render();
  }

  const alive = () => (mb().field || []).filter(s => s.in);

  /* Going out is recorded in the order it happened, because that order IS the
     final placing — the last speller to sit down finished second. Round one is
     a warm-up and takes nobody. */
  function sitDown(s) {
    const g = mb();
    if (roundAt(g.round, alive().length).safe) return false;
    s.in = false;
    g.outSeq = (g.outSeq || []).concat([s]);
    g.roundOut = (g.roundOut || []).concat([s]);
    return true;
  }

  /* ---------------- championship rules ----------------
     The announcer states them at the final two, so the hall has to honour them:
     with two spellers left, a miss does NOT end the bee. The rival must spell the
     missed word AND then one more — the championship word — to take it. Miss
     either and the speller who sat down is back on their feet and it goes on.
     This is the single most dramatic rule in the sport and it was the announcer
     making a promise the engine did not keep. */
  function champTry(misser, missedWord) {
    const g = mb();
    if (roundAt(g.round, alive().length).sudden) return false;     /* sudden death: a miss is the end */
    const rival = g.field.find(s => s.in && s !== misser);
    if (!rival || !missedWord || !missedWord.w) return false;
    const extra = (g.words || []).find(w => w && nkey(w.w) !== nkey(missedWord.w))
      || roundWords(roundAt(g.round, alive().length), 1)[0] || missedWord;
    g.c2 = { rival, misser, words: [missedWord, extra], step: 0 };
    after(900, champRun);
    return true;
  }

  function champRun() {
    const g = mb(); if (!g || g.view !== 'stage' || !g.c2) return;
    const c2 = g.c2, s = c2.rival;
    g.word = c2.words[c2.step];
    if (!g.word || !g.word.w) { g.c2 = null; return finish(); }
    g.typed = ''; g.asked = {}; g.atMic = s; g.lastPractice = null;
    const name = s.kind === 'me' ? 'You' : s.bot.name;
    announce(fill(pick(c2.step === 0 ? SAY.c2First : SAY.c2Champ, g.seed + c2.step * 3), { name }));
    if (s.kind === 'me') {
      g.phase = 'me';
      after(700, () => { try { say(g.word.w); } catch (e) {} });
      render();
    } else {
      g.phase = 'bot'; g.botStep = 0; g.botOut = '';
      callBotToMic(s, clamp(s.bot.pace * .5, 600, 1200));
    }
  }

  function champAfter(ok) {
    const g = mb(); const c2 = g.c2; if (!c2) return;
    if (!ok) {
      g.c2 = null;
      const m = c2.misser; m.in = true;
      g.outSeq = (g.outSeq || []).filter(s => s !== m);
      announce(fill(pick(SAY.c2Miss, g.seed + g.round), {
        name: c2.rival.kind === 'me' ? 'You' : c2.rival.bot.name,
        back: m.kind === 'me' ? 'You are' : (m.bot.name + ' is') }));
      g.round++; g.redo = 0;
      after(1200, beginRound); return;
    }
    if (c2.step === 0) { c2.step = 1; after(800, champRun); return; }
    g.c2 = null;
    after(800, finish);
  }

  function beginRound() {
    const g = mb(); if (!g) return;
    const live = alive();
    const R = roundAt(g.round, live.length);
    g.turn = 0; g.roundMissed = 0; g.roundTook = 0; g.roundOut = [];
    g.kind = R.kind;
    /* The spell-off is the one round that is not taken in turn: everybody spells
       at once against the same clock, so it needs no per-speller word list and it
       opens straight into the timer rather than calling a name. */
    if (R.kind === 'lightning') {
      g.words = roundWords(R, 40);
      g.phase = 'boltIn';
      announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
      render();
      after(1400, startBolt); return;
    }
    if (R.kind === 'vocab') {
      g.vqs = vocWordsFor(R, live.length + 2);
      /* No usable meaning questions — skip rather than stall the bee on a round
         it cannot ask. A thin definition set is a data problem, not a bee. */
      if (!g.vqs.length) { g.round++; return after(200, beginRound); }
      g.words = g.vqs.map(q => q.w);
    } else {
      g.words = roundWords(R, live.length + 2);
    }
    g.phase = 'call';
    announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
    if (live.length === 2 && !g.saidFinal) { g.saidFinal = true;
      after(600, () => announce(pick(SAY.finalTwo, g.seed))); }
    after(900, nextTurn);
  }

  function nextTurn() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    const live = alive();
    if (!live.length) { return finish(); }
    if (g.turn >= live.length) {
      /* round over. Real bee rule: if every speller in a round missed, nobody
         goes out and the round runs again. */
      if (!roundAt(g.round, live.length).safe && g.roundMissed && g.roundTook
          && g.roundMissed >= g.roundTook && (g.redo = (g.redo || 0) + 1) <= 2) {
        (g.roundOut || []).forEach(s => { s.in = true; });
        g.outSeq = (g.outSeq || []).filter(s => s.in === false);
        g.roundOut = [];
        announce(pick(SAY.allMiss, g.seed + g.round));
        after(900, () => { beginRound(); }); return;
      }
      const left = alive();
      if (left.length <= 1) return finish();
      /* the field-thinning call lands once per threshold, not every round the
         count happens to sit there */
      if (left.length <= 5) {
        const li = left.length === 5 ? 0 : left.length === 4 ? 1 : left.length === 3 ? 2 : 3;
        g.saidThin = g.saidThin || {};
        if (!g.saidThin[li]) { g.saidThin[li] = 1; announce(SAY.thin[li] || ''); }
      }
      g.round++; g.redo = 0;
      after(700, beginRound); return;
    }
    const s = live[g.turn];
    g.atMic = s;                     /* who is actually at the microphone, which
                                        is NOT live[turn] once turn advances */
    const R = roundAt(g.round, live.length);
    g.typed = ''; g.asked = {}; g.lastPractice = null;

    /* ---- the vocabulary round takes its turns the same way, but the question
            is a meaning rather than a spelling, so it branches here rather than
            duplicating the whole turn machinery. ---- */
    if (R.kind === 'vocab') {
      g.vq = (g.vqs && g.vqs.length) ? g.vqs[g.turn % g.vqs.length] : null;
      if (!g.vq) return finish();
      g.word = g.vq.w; g.vPick = null;
      if (s.kind === 'me') {
        g.phase = 'vme';
        announce(fill(pick(SAY.callVocMe, g.seed + g.turn), { n: s.n }));
        after(500, () => { try { say(g.vq.w.w); } catch (e) {} });
        render();
      } else {
        g.phase = 'vbot';
        announce(fill(pick(SAY.callVocBot, g.seed + g.turn * 3 + g.round),
          { name: s.bot.name, n: s.n, vtell: s.bot.vtell || 'thinks about it' }),
          s.bot.name + ', number ' + s.n + '. Define it.');
        render();
        after(clamp(s.bot.pace * .8, 900, 2400), () => {
          const gg = mb(); if (!gg || gg.phase !== 'vbot') return;
          const ok = botKnows(s.bot, g.vq.w, R.press);
          gg.vPick = ok ? gg.vq.answer : shuffle(gg.vq.choices.filter(c => c !== gg.vq.answer))[0];
          render();
          after(700, () => verdict(s, ok));
        });
      }
      return;
    }

    g.word = (g.words && g.words.length) ? g.words[g.turn % g.words.length] : null;
    /* the list came back empty — end the bee on the spellers still standing
       rather than putting a speller in front of a word that does not exist */
    if (!g.word || !g.word.w) return finish();
    if (s.kind === 'me') {
      g.phase = 'me';
      announce(fill(pick(SAY.callMe, g.seed + g.turn), { n: s.n }));
      after(600, () => { try { say(g.word.w); } catch (e) {} });
      render();
    } else {
      g.phase = 'bot'; g.botStep = 0; g.botOut = '';
      announce(fill(pick(SAY.callBot, g.seed + g.turn * 3 + g.round), { name: s.bot.name, age: s.bot.age + ' years old', tell: s.bot.tell, n: s.n }),
        s.bot.name + ', number ' + s.n + '.');
      callBotToMic(s, clamp(s.bot.pace * .45, 420, 1000));
    }
  }

  /* ---------------- the spell-off ----------------
     The one round that is not taken in turn. Scripps runs it when a traditional
     finish is needed: every remaining speller gets the same ninety seconds and
     spells as many as they can off a prepared list, and the count decides it.
     Here it closes every segment, which is what gives the bee its rhythm —
     spell, define, then race — and it is the only round that ranks rather than
     merely eliminating, so it is the one that can break a tie between two
     spellers who never miss.
     The rivals are simulated rather than animated: eleven progress bars ticking
     at once is noise, and the child has ninety seconds of their own to spend. */
  const BOLT_MS = 90000;
  function startBolt() {
    const g = mb(); if (!g) return;
    const live = alive();
    const R = roundAt(g.round, live.length);
    g.phase = 'bolt';
    g.bolt = { i: 0, typed: '', got: 0, miss: 0, deadline: Date.now() + BOLT_MS, done: [], tick: 1 };
    announce(pick(SAY.boltIn, g.seed + g.round));
    render();
    try { say((g.words[0] || {}).w || ''); } catch (e) {}
    boltTick(1);
  }
  /* One clock, not one per submitted word. mbBoltGo used to restart the tick,
     so by the fifteenth word fifteen loops were racing the same deadline and
     each one would have called endBolt(). The token means only the newest loop
     survives, and submitting a word does not need to touch the clock at all. */
  function boltTick(token) {
    const g = mb(); if (!g || g.phase !== 'bolt' || !g.bolt) return;
    if (token !== g.bolt.tick) return;
    if (Date.now() >= g.bolt.deadline) return endBolt();
    try {
      const el = document.getElementById('mb-bolt-clock');
      if (el) el.textContent = Math.ceil((g.bolt.deadline - Date.now()) / 1000) + 's';
    } catch (e) {}
    setTimeout(() => boltTick(token), 250);
  }
  app2.mbBoltType = v => { const g = mb(); if (g && g.bolt) g.bolt.typed = String(v || ''); };
  /* Submit one word: score it, move to the next, and speak it. The input is
     patched rather than re-rendered so the caret does not jump mid-race. */
  app2.mbBoltGo = () => {
    const g = mb(); if (!g || g.phase !== 'bolt' || !g.bolt) return;
    const b = g.bolt;
    const w = g.words[b.i % g.words.length];
    if (!w) return endBolt();
    const ok = nkey(b.typed || '') === nkey(w.w);
    if (ok) b.got++; else b.miss++;
    b.done.push({ w: w.w, typed: b.typed, ok });
    b.typed = ''; b.i++;
    try { sfx(ok ? 'right' : 'wrong'); } catch (e) {}
    const next = g.words[b.i % g.words.length];
    render();
    if (next) { try { say(next.w); } catch (e) {} }
  };
  /* A rival's ninety seconds, in one number. Their spelling skill sets the rate
     and their nerve sets how much the clock costs them, so the ordering is the
     same ordering the spelling rounds would give — just resolved faster. */
  function botBolt(bot, press) {
    const rate = 6 + bot.skill * 16;                      /* words attempted */
    const n = Math.max(3, Math.round(rate * (.85 + Math.random() * .3)));
    let got = 0;
    for (let i = 0; i < n; i++) {
      let p = bot.skill - (1 - bot.nerve) * .18 * (press || 0) + (Math.random() - .5) * (bot.vary || .1);
      if (Math.random() < clamp(p, .05, .97)) got++;
    }
    return got;
  }
  function endBolt() {
    const g = mb(); if (!g || !g.bolt) return;
    const live = alive();
    const R = roundAt(g.round, live.length);
    g.phase = 'boltDone';
    announce(pick(SAY.boltEnd, g.seed + g.round));
    /* score everybody, then sit down the lowest — the spell-off ranks, so it
       takes exactly one speller regardless of how many missed */
    const board = live.map(s => ({ s, score: s.kind === 'me' ? g.bolt.got : botBolt(s.bot, R.press) }));
    board.forEach(r => { r.s.boltScore = r.score; });
    board.sort((a, b) => a.score - b.score || Math.random() - .5);
    g.boltBoard = board.map(r => ({ name: nameOf(r.s), me: r.s.kind === 'me', score: r.score }))
      .slice().sort((a, b) => b.score - a.score);
    /* nobody goes out if that would end the bee early — the last two are decided
       by spelling, not by a race */
    const loser = live.length > 2 ? board[0].s : null;
    render();
    after(2200, () => {
      const gg = mb(); if (!gg) return;
      if (loser) {
        loser.hist.push(false);
        sitDown(loser);
        announce(nameOf(loser) + ' spelled the fewest. Thank you, speller.');
      } else {
        announce('Both of you held. We go back to the words.');
      }
      gg.boltBoard = null; gg.bolt = null;
      const left = alive();
      if (left.length <= 1) return finish();
      gg.round++; gg.redo = 0;
      after(1200, beginRound);
    });
  }

  /* the child's answer in a meaning round */
  app2.mbVocPick = i => {
    const g = mb(); if (!g || g.phase !== 'vme' || g.vPick != null || !g.vq) return;
    const me = alive().find(s => s.kind === 'me'); if (!me) return;
    g.vPick = g.vq.choices[+i];
    const ok = g.vPick === g.vq.answer;
    g.phase = 'vmeDone'; g.meOk = ok;
    try { sfx(ok ? 'right' : 'wrong'); if (ok) burstConfetti(18); } catch (e) {}
    /* DELIBERATELY no logBand and no markMastered here. Those move spelling
       progress, and a meaning answered right is not a word spelt right — the
       same separation the Vocabulary section keeps, and there is a headless test
       over there that asserts it. */
    render();
    after(1100, () => {
      const gg = mb(); if (!gg) return;
      /* your shot at the title runs on its own rails, exactly as in mbSpell */
      if (gg.c2) {
        announce(ok ? 'Correct — and that is the title.' : 'That is not the meaning.');
        me.hist.push(ok);
        after(900, () => champAfter(ok));
        return;
      }
      gg.roundTook++;
      if (ok) { announce('Correct.'); }
      else {
        const out = sitDown(me); gg.roundMissed++;
        announce(out ? 'That is not the meaning. Thank you, speller.'
          : 'Not that one — but nobody goes out this round.');
        /* the championship rule: if your miss leaves one speller standing, they
           still have to win it on a word of their own */
        if (out && alive().length === 1 && champTry(me, gg.vq.w)) {
          me.hist.push(ok); render(); return;
        }
      }
      me.hist.push(ok);
      gg.turn++; gg.phase = 'call';
      after(900, nextTurn);
    });
  };

  /* ---------------- a rival's word, pronounced ----------------
     The pronouncer used to only NAME the rival ("Vesper, number four.") and
     never actually said the word — the child heard who was spelling but never
     what they were spelling, which is a spelling bee with the one useful part
     missing. Now the word is spoken the same way it is for the child's own
     turn, and there is a 30-second window to write it down before the rival
     spells it: practice, whether or not it is your turn. */
  function callBotToMic(s, delay) {
    after(delay, () => {
      const g = mb(); if (!g || g.view !== 'stage') return;
      try { say(g.word.w); } catch (e) {}
      startPractice(s);
    });
  }
  function startPractice(s) {
    const g = mb(); if (!g) return;
    g.phase = 'practice';
    g.practice = { typed: '', deadline: Date.now() + 30000, forBot: s };
    render();
    practiceTick();
  }
  /* Ticks the countdown by writing straight to the DOM, not by calling render():
     a full re-render every 400ms would rebuild the input the child is typing
     into and throw away their cursor (and half-typed word) five times over the
     30 seconds. Only the number moves; the input is left alone. */
  function practiceTick() {
    const g = mb(); if (!g || g.phase !== 'practice' || !g.practice) return;
    const left = g.practice.deadline - Date.now();
    if (left <= 0) { endPractice(); return; }
    try { const el = document.getElementById('mb-countdown'); if (el) el.textContent = Math.ceil(left / 1000) + 's'; } catch (e) {}
    setTimeout(practiceTick, 400);
  }
  function endPractice() {
    const g = mb(); if (!g || !g.practice) return;
    const s = g.practice.forBot, typed = g.practice.typed;
    g.lastPractice = typed ? { typed, correct: nkey(typed) === nkey(g.word.w) } : null;
    g.practice = null;
    g.phase = 'bot';
    botTurn(s);
  }
  app2.mbPracType = v => { const g = mb(); if (g && g.practice) g.practice.typed = String(v || ''); };
  app2.mbPracSkip = () => { if (mb() && mb().practice) endPractice(); };

  function botTurn(s) {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (!g.word || !g.word.w) return finish();
    const R = roundAt(g.round, alive().length);
    const ok = botSpells(s.bot, g.word, R.press);
    const shown = ok ? g.word.w : misspell(g.word.w);
    g.botOut = ''; g.botOk = ok; g.phase = 'botSpell';
    g.botLen = shown.length; g.botStep = 0;
    /* Letters one at a time, because that is how it feels in the hall — but
       PATCHED IN PLACE, not re-rendered.
       This used to call render() per letter, which rebuilds the whole view: the
       podium node is replaced ten to twenty times a second, so its
       `animation:sb-rise` restarts every time and the box visibly jitters. The
       announcement line and the practice-feedback line are rebuilt in the same
       pass, and any change in their height shoves the podium up or down. Writing
       one text node leaves every other box exactly where it is.
       render() still runs once at the end, so the correct/wrong colour lands. */
    let i = 0;
    const step = () => {
      const gg = mb(); if (!gg || gg.view !== 'stage' || gg.phase !== 'botSpell') return;
      gg.botStep = ++i;
      gg.botOut = shown.slice(0, i).toUpperCase().split('').join(' ');
      let live = null;
      try { live = document.getElementById('mb-live'); } catch (e) {}
      if (live) live.textContent = gg.botOut; else render();
      if (i < shown.length) setTimeout(step, clamp(s.bot.pace / shown.length, 55, 150));
      else { render(); setTimeout(() => verdict(s, ok), 460); }
    };
    step();
  }

  function verdict(s, ok) {
    const g = mb(); if (!g) return;
    /* the rival's shot at the title runs on its own rails */
    if (g.c2) {
      try { sfx(ok ? 'right' : 'wrong'); } catch (e) {}
      announce(ok ? fill(pick(SAY.botRight, g.seed + g.round * 5), { name: s.bot.name })
        : fill(pick(SAY.botWrong, g.seed + g.round * 5), { name: s.bot.name, word: g.word.w }));   /* spoken in full: this is the title */
      s.hist.push(ok); g.phase = 'call';
      after(800, () => champAfter(ok)); return;
    }
    g.roundTook++;
    /* "The word was {word}" is the right bell for a spelling miss and the wrong
       one for a meaning miss — the word was on the board the whole time. */
    const isVoc = g.kind === 'vocab';
    if (ok) { try { sfx('right'); } catch (e) {}
      announce(fill(pick(SAY.botRight, g.seed + g.turn * 5), { name: s.bot.name }), 'Correct.');
    } else {
      const out = sitDown(s); g.roundMissed++;
      try { sfx('wrong'); } catch (e) {}
      announce(isVoc
        ? (out ? 'No — that is not what it means. Thank you, ' + s.bot.name + '.'
               : 'Not the meaning — but nobody goes out this round.')
        : out ? fill(pick(SAY.botWrong, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w })
        : fill(pick(SAY.botSafe, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w }),
        isVoc ? (out ? 'No.' : 'No — but this round forgives.')
        : out ? 'No. ' + g.word.w + '.' : 'No — but round one forgives.');
      /* that miss left one speller standing — championship rules, not a win */
      if (out && alive().length === 1 && champTry(s, g.word)) {
        s.hist.push(ok); g.phase = 'call'; return;
      }
    }
    s.hist.push(ok);
    g.turn++; g.phase = 'call';
    after(700, nextTurn);
  }

  /* ---------------- the speller's turn ---------------- */
  /* "Hear it again" has to know which word is in front of the speller. In the
     spell-off that is the one the race has reached, not g.word — which is the
     last word of the previous round and would pronounce the wrong thing. */
  app2.mbSay = () => {
    const g = mb(); if (!g) return;
    let w = g.word;
    if (g.phase === 'bolt' && g.bolt && g.words && g.words.length) w = g.words[g.bolt.i % g.words.length];
    else if ((g.phase === 'vme' || g.phase === 'vmeDone') && g.vq) w = g.vq.w;
    if (w && w.w) { try { say(w.w); } catch (e) {} }
  };
  app2.mbAsk = k => { const g = mb(); if (!g) return; g.asked = { ...(g.asked || {}), [k]: 1 };
    const w = g.word || {};
    const txt = k === 'def' ? (w.d || 'No definition on file for that one.')
      : k === 'org' ? ('From ' + (w.o || 'an origin not recorded'))
      : k === 'sent' ? (w.s || 'No sentence on file.')
      : (w.ps || 'Part of speech not recorded');
    try { deviceSpeak(txt, rateOf()); } catch (e) {}
    /* the answer is being read; do not let the next beat cut it */
    try { const gg = mb(); if (gg) { gg.spokeAt = Date.now(); gg.spokeMs = speakMs(txt); } } catch (e) {}
    render(); keepCaret(); };
  /* asking the pronouncer a question re-renders the hall, which throws away the
     caret. Put it back where it was, or the speller loses their place mid-word. */
  function keepCaret() {
    setTimeout(() => {
      const el = document.getElementById('mb-in'); if (!el) return;
      const g = mb(); if (!g || g.phase !== 'me') return;
      el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) {}
    }, 0);
  }
  app2.mbType = v => { const g = mb(); if (g) { g.typed = String(v || ''); } };
  app2.mbSpell = () => {
    const g = mb(); if (!g || g.phase !== 'me') return;
    const me = alive().find(s => s.kind === 'me'); if (!me) return;
    const ok = nkey(g.typed || '') === nkey(g.word.w);
    g.phase = 'meDone'; g.meOk = ok;
    try { logBand(g.word, ok, 1); } catch (e) {}
    if (ok) { try { markMastered(nkey(g.word.w)); } catch (e) {} }
    /* your shot at the title */
    if (g.c2) {
      try { sfx(ok ? 'right' : 'wrong'); if (ok) burstConfetti(24); } catch (e) {}
      announce(fill(pick(ok ? SAY.meRight : SAY.meWrong, g.seed + g.round), { n: me.n, word: g.word.w }));
      me.hist.push(ok);
      after(900, () => champAfter(ok));
      render(); return;
    }
    g.roundTook++;
    if (ok) { try { sfx('right'); burstConfetti(24); } catch (e) {}
      announce(fill(pick(SAY.meRight, g.seed + g.turn), { n: me.n }));
    } else {
      const out = sitDown(me); g.roundMissed++;
      try { sfx('wrong'); } catch (e) {}
      announce(fill(pick(out ? SAY.meWrong : SAY.meSafe, g.seed + g.turn), { word: g.word.w }));
      if (out && alive().length === 1 && champTry(me, g.word)) {
        me.hist.push(ok); render(); return;
      }
    }
    me.hist.push(ok);
    g.turn++;
    after(900, () => { const gg = mb(); if (!gg) return; gg.phase = 'call'; nextTurn(); });
    render();
  };

  /* ---------------- the finish ---------------- */
  function finish() {
    const g = mb(); if (!g) return;
    const left = alive();
    const champ = left[0] || null;
    const meIn = !!left.find(s => s.kind === 'me');
    /* placing: everyone still standing is 1st; otherwise you placed at the size
       of the field when you went out */
    g.view = 'result'; g.champ = champ; g.meWon = meIn;
    g.atMic = champ;                 /* the row of chairs marks the champion now */
    /* placing comes from the order spellers sat down, not from where they stood
       in the draw: the last one out finished second, the first one out eleventh */
    const seq = g.outSeq || [];
    const i = seq.findIndex(s => s.kind === 'me');
    const place = meIn ? 1 : i < 0 ? 11 : Math.max(2, g.field.length - i);
    g.place = place;
    /* coins: reaching the last few is worth something even without the trophy */
    const pay = meIn ? 250 : place <= 3 ? 120 : place <= 5 ? 70 : place <= 8 ? 35 : 15;
    try { addCoins(pay); } catch (e) {}
    g.pay = pay;
    const p = prog();
    p.played = (p.played || 0) + 1;
    p.best = p.best ? Math.min(p.best, place) : place;
    if (meIn) p.wins = (p.wins || 0) + 1;
    saveProg(p);
    if (meIn) { try { burstConfetti(120); sfx('win'); } catch (e) {}
      announce(pick(SAY.winMe, g.seed));
    } else { try { sfx('lose'); } catch (e) {}
      announce(fill(pick(SAY.winBot, g.seed), { name: champ ? champ.bot.name : 'Nobody', age: champ ? champ.bot.age : '' }));
      after(1200, () => announce(fill(pick(SAY.outMe, g.seed), { place: ordinal(place) })));
    }
    render();
  }
  const ordinal = n => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

  app2.mbQuit = () => { state.mb = null; state.nav = 'games'; render(); };
  app2.mbAgain = () => { app2.mbStart(); };

  /* ================= rendering ================= */
  const face = (s, size) => s.kind === 'me'
    ? (window.SB_AVATAR ? SB_AVATAR(mb().avatar, size) : '')
    : (window.SB_AVATAR ? SB_AVATAR(s.bot.id, size) : '');
  const nameOf = s => s.kind === 'me' ? (mb().name || 'You') : s.bot.name;

  function fieldRow() {
    const g = mb();
    const now = g.atMic;
    return `<div class="mb-field">${g.field.map(s => {
      const on = s === now && g.view === 'stage';
      return `<span class="mb-chip${s.in ? '' : ' out'}${on ? ' now' : ''}" title="${escA(nameOf(s) + (s.kind === 'bot' ? ' · ' + s.bot.age : '') + (s.in ? '' : ' — out'))}">
        <span class="mb-face">${face(s, 34)}</span>
        <b>${esc(nameOf(s))}</b><i>${s.n}</i></span>`;
    }).join('')}</div>`;
  }

  function viewLobby() {
    const p = prog(); const c = active();
    return `<div class="mb-wrap" style="animation:sb-rise .35s ease both">
      <div class="mb-top">
        <button data-act="mbQuit" class="mb-back">← Arcade</button>
        <span class="mb-title">Mock Spelling Bee</span>
        ${p.played ? `<span class="mb-rec">${p.wins ? p.wins + (p.wins === 1 ? ' win' : ' wins') + ' · ' : ''}best ${ordinal(p.best || 11)} of 11</span>` : ''}
      </div>
      <div class="mb-hero">
        <span class="mb-hero-art">${window.SB_AVATAR ? SB_AVATAR(c.avatar || 'bizzy', 96) : ''}</span>
        <span>
          <span class="mb-kick">Eleven spellers · one microphone</span>
          <h2>Ten rivals, and a number in a hat</h2>
          <p>You draw a number and take your turn in that order. It runs the way the national
             bee runs — three parts, over and over, and it gets harder every time round.</p>
          <div class="mb-format">
            ${[['Spell', 'One word each, out loud. Miss it and you sit down.'],
               ['Meaning', 'Four definitions, one right. Knowing how to spell it is not the same as knowing what it is.'],
               ['Spell-off', 'Ninety seconds, everybody at once. The lowest score goes out.']]
              .map(([t, d], i) => `<div class="mb-fstep"><span class="mb-fnum">${i + 1}</span>
                <span><b>${t}</b>${esc(d)}</span></div>`).join('')}
          </div>
          <p class="mb-stages">Preliminaries &rarr; Quarterfinals &rarr; Semifinals &rarr; Finals.
             The last speller standing takes it.</p>
          <button data-act="mbStart" class="mb-go">${iconSVG('crown', 17)} Take the stage</button>
        </span>
      </div>
      <div class="mb-sech">The field</div>
      <div class="mb-cards">${BOTS.map(b => `<div class="mb-card">
        <span class="mb-card-face">${window.SB_AVATAR ? SB_AVATAR(b.id, 54) : ''}</span>
        <span class="mb-card-in">
          <b>${esc(b.name)}<i>${b.age}</i></b>
          <span class="mb-note">${esc(b.note)}</span>
          <span class="mb-bars">
            <span title="Skill — spelling">${bar('skill', b.skill)}</span>
            <span title="Vocab — how well they know what a word MEANS, which is not the same thing">${bar('vocab', b.voc == null ? b.skill : b.voc)}</span>
            <span title="Nerve — how little the late rounds move them">${bar('nerve', b.nerve)}</span>
          </span>
          <!-- the vocab tell earns its place on the card: it is the only thing that
               tells a reader why Theo is dangerous in a round Dax will lose -->
          ${b.vtell ? `<span class="mb-vnote">Meanings: ${esc(b.vtell)}</span>` : ''}
        </span></div>`).join('')}</div>
    </div>`;
  }
  const bar = (label, v) => `<span class="mb-bar"><i>${label}</i><b><s style="width:${Math.round(v * 100)}%"></s></b></span>`;

  /* The write-along window: a rival's word has just been said aloud, and the
     child has 30 seconds to write it down before the rival spells it — good
     practice whether or not it is their turn. Skippable with Enter or the
     button, because a hall where every rival takes 30 forced seconds is not
     a game anyone finishes. */
  /* ---- the meaning round, the child's turn ----
     Four choices, one shot. The word is shown as well as spoken: this round is
     about what it means, so hiding the spelling would be testing the wrong
     thing — and the child has just heard it pronounced. */
  function vocMeUI() {
    const g = mb(); const q = g.vq; if (!q) return '';
    const done = g.phase === 'vmeDone';
    return `<div class="mb-mic me${done ? (g.meOk ? ' ok' : ' no') : ''}">
      <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(g.avatar, 74) : ''}</span>
      <div class="mb-mic-in">
        <span class="mb-mic-name">${esc(g.name)} · number ${g.myN}</span>
        <div class="mb-vword">${esc(q.w.w)}
          <button data-act="mbSay" class="mb-hear mb-vhear">${iconSVG('volume', 16)} Hear it</button></div>
        <div class="mb-vq">What does it mean?</div>
        <div class="mb-vopts">
          ${q.choices.map((c, i) => {
            const chosen = done && g.vPick === c, right = done && c === q.answer;
            return `<button class="mb-vopt${right ? ' right' : chosen ? ' wrong' : ''}"
              ${done ? '' : `data-act="mbVocPick" data-arg="${i}"`}>
              <span class="mb-vletter">${String.fromCharCode(65 + i)}</span>
              <span>${esc(c)}</span></button>`;
          }).join('')}
        </div>
      </div></div>`;
  }
  /* ---- the meaning round, a rival's turn ----
     Their pick appears as a letter, the way a bee answers aloud: "B, please." */
  function vocBotUI() {
    const g = mb(); const s = g.atMic, q = g.vq;
    if (!s || !q || s.kind === 'me') return '';
    const i = g.vPick == null ? -1 : q.choices.indexOf(g.vPick);
    return `<div class="mb-mic">
      <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(s.bot.id, 74) : ''}</span>
      <div class="mb-mic-in">
        <span class="mb-mic-name">${esc(s.bot.name)} · ${s.bot.age} · number ${s.n}</span>
        <div class="mb-vword">${esc(q.w.w)}</div>
        <div class="mb-letters">
          <span class="mb-l-ghost" aria-hidden="true">X</span>
          <span class="mb-l-live">${i < 0 ? '' : String.fromCharCode(65 + i)}</span>
          ${i < 0 ? '<span class="mb-thinking">thinking…</span>' : ''}
        </div>
      </div></div>`;
  }
  /* ---- the spell-off ----
     One input, one clock, and a running count. The rivals are not shown racing:
     their scores land at the bell, because eleven bars ticking at once is noise
     and the child has ninety seconds of their own to spend. */
  function boltUI() {
    const g = mb();
    if (g.phase === 'boltIn') return `<div class="mb-mic mb-bolt">
      <div class="mb-mic-in" style="align-items:center;text-align:center">
        <div class="mb-bolt-big">90</div>
        <div class="mb-mic-name">The spell-off — get ready</div></div></div>`;
    if (g.phase === 'boltDone') {
      const b = g.boltBoard || [];
      return `<div class="mb-mic mb-bolt">
        <div class="mb-mic-in">
          <span class="mb-mic-name">Time. The spell-off board.</span>
          <div class="mb-boltboard">${b.map((r, i) => `<div class="mb-brow${r.me ? ' me' : ''}${i === b.length - 1 ? ' last' : ''}">
            <span class="mb-brank">${i + 1}</span><span class="mb-bname">${esc(r.name)}</span>
            <span class="mb-bscore">${r.score}</span></div>`).join('')}</div>
        </div></div>`;
    }
    const b = g.bolt || {}; const w = (g.words || [])[(b.i || 0) % Math.max(1, (g.words || []).length)] || {};
    return `<div class="mb-mic mb-bolt">
      <div class="mb-mic-in">
        <div class="mb-bolt-top">
          <span class="mb-bolt-clock" id="mb-bolt-clock">90s</span>
          <span class="mb-bolt-score">${b.got || 0} spelled</span>
        </div>
        <div class="mb-controls"><button data-act="mbSay" class="mb-hear">${iconSVG('volume', 18)} Hear it again</button></div>
        <div class="mb-spellrow">
          <input class="mb-input" id="mb-in" autocomplete="off" autocapitalize="off" spellcheck="false"
            placeholder="spell it — Enter for the next" value="${escA(b.typed || '')}" oninput="callAct('mbBoltType',this.value)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbBoltGo');}">
          <button data-act="mbBoltGo" class="mb-submit">Next →</button>
        </div>
        <div class="mb-bolt-trail">${(b.done || []).slice(-7).map(d =>
          `<span class="mb-bt ${d.ok ? 'ok' : 'no'}">${esc(d.w)}</span>`).join('')}</div>
      </div></div>`;
  }

  function practiceUI() {
    const g = mb(); const pr = g.practice; if (!pr) return '';
    const s = pr.forBot;
    const left = Math.max(0, Math.ceil((pr.deadline - Date.now()) / 1000));
    return `<div class="mb-mic practice">
      <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(s.bot.id, 74) : ''}</span>
      <div class="mb-mic-in">
        <span class="mb-mic-name">${esc(s.bot.name)} is up next · number ${s.n}</span>
        <div class="mb-prac-row">
          <span class="mb-prac-note">Write it down before ${esc(s.bot.name)} spells it — good practice, no pressure.</span>
          <span class="mb-countdown" id="mb-countdown">${left}s</span>
        </div>
        <div class="mb-controls">
          <button data-act="mbSay" class="mb-hear">${iconSVG('volume', 18)} Hear it again</button>
        </div>
        <div class="mb-spellrow">
          <input class="mb-input" id="mb-prac-in" autocomplete="off" autocapitalize="off" spellcheck="false"
            placeholder="write it here" value="${escA(pr.typed || '')}" oninput="callAct('mbPracType',this.value)"
            onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbPracSkip');}">
          <button data-act="mbPracSkip" class="mb-submit">${esc(s.bot.name)}, spell it →</button>
        </div>
      </div></div>`;
  }

  function viewStage() {
    const g = mb(); const R = roundAt(g.round, alive().length); const live = alive();
    const meTurn = g.phase === 'me';
    const w = g.word || {};
    const asked = g.asked || {};
    const askBtn = (k, label, ic) => `<button data-act="mbAsk" data-arg="${k}" class="mb-ask${asked[k] ? ' on' : ''}">${iconSVG(ic, 14)} ${label}</button>`;
    const answer = asked.def || asked.org || asked.sent || asked.ps ? `<div class="mb-answers">
      ${asked.def ? `<div><b>Definition.</b> ${esc(w.d || '—')}</div>` : ''}
      ${asked.org ? `<div><b>Origin.</b> ${esc(w.o || 'not recorded')}</div>` : ''}
      ${asked.sent ? `<div><b>Sentence.</b> ${esc(maskWord(w.s || '—', w.w))}</div>` : ''}
      ${asked.ps ? `<div><b>Part of speech.</b> ${esc(w.ps || 'not recorded')}</div>` : ''}</div>` : '';

    const podium = meTurn ? `<div class="mb-mic me">
        <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(g.avatar, 74) : ''}</span>
        <div class="mb-mic-in">
          <span class="mb-mic-name">${esc(g.name)} · number ${g.myN}</span>
          <div class="mb-controls">
            <button data-act="mbSay" class="mb-hear">${iconSVG('volume', 18)} Hear it again</button>
            ${askBtn('def', 'Definition', 'book')}${askBtn('org', 'Origin', 'sprout')}
            ${askBtn('sent', 'Sentence', 'quote')}${askBtn('ps', 'Part of speech', 'grid')}
          </div>
          ${answer}
          <div class="mb-spellrow">
            <input class="mb-input" id="mb-in" autocomplete="off" autocapitalize="off" spellcheck="false"
              placeholder="spell it" value="${escA(g.typed || '')}" oninput="callAct('mbType',this.value)"
              onkeydown="if(event.key==='Enter'){event.preventDefault();callAct('mbSpell');}">
            <button data-act="mbSpell" class="mb-submit">Spell it →</button>
          </div>
        </div></div>`
      : g.phase === 'meDone' ? `<div class="mb-mic ${g.meOk ? 'ok' : 'no'}">
        <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(g.avatar, 74) : ''}</span>
        <div class="mb-mic-in"><span class="mb-mic-name">${esc(g.name)}</span>
          <div class="mb-letters">${(g.typed || '—').toUpperCase().split('').join(' ')}</div>
          <div class="mb-truth">${g.meOk ? 'Correct' : 'The word was <b>' + esc(w.w) + '</b>'}</div></div></div>`
      : (g.phase === 'vme' || g.phase === 'vmeDone') ? vocMeUI()
      : g.phase === 'vbot' ? vocBotUI()
      : (g.phase === 'bolt' || g.phase === 'boltIn' || g.phase === 'boltDone') ? boltUI()
      : g.phase === 'practice' ? practiceUI()
      : (function () {
        const s = g.atMic;
        if (!s || s.kind === 'me') return `<div class="mb-mic idle"><div class="mb-mic-in"><span class="mb-mic-name">…</span></div></div>`;
        const lp = g.lastPractice;
        /* The box is sized by a hidden ghost the full length of what is being
           spelled, and the live letters sit on top of it. Without that, the box
           grows a letter at a time and a long word rewraps onto a second line
           halfway through, so it changes height mid-spell.
           The ghost is a row of X's, not the word: it is the same width in a
           monospace face, and it keeps the answer out of the DOM where a curious
           reader could find it before the speller gets there.
           The done-state used to be `botOut.length >= w.w.length`, which compares
           a string carrying a space between every letter against a plain word —
           so it went green about halfway, and on a misspelling of a different
           length it could go green on the wrong letter entirely. */
        const done = g.phase === 'botSpell' && g.botStep >= g.botLen;
        const ghost = new Array(Math.max(1, g.botLen || (w.w || '').length || 1)).fill('X').join(' ');
        return `<div class="mb-mic ${done ? (g.botOk ? 'ok' : 'no') : ''}">
          <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(s.bot.id, 74) : ''}</span>
          <div class="mb-mic-in">
            <span class="mb-mic-name">${esc(s.bot.name)} · ${s.bot.age} · number ${s.n}</span>
            <div class="mb-letters">
              <span class="mb-l-ghost" aria-hidden="true">${ghost}</span>
              <span class="mb-l-live" id="mb-live">${g.botOut || ''}</span>
              ${g.botOut ? '' : '<span class="mb-thinking">thinking…</span>'}
            </div>
            ${lp ? `<div class="mb-prac-fb ${lp.correct ? 'ok' : 'no'}">You wrote <b>${esc(lp.typed.toUpperCase())}</b> — ${lp.correct ? 'you had it too.' : 'not quite that time.'}</div>` : ''}
          </div></div>`;
      })();

    /* The entrance plays ONCE, on the first paint of the hall.
       render() rebuilds this wrapper, so leaving the animation on it replayed a
       twelve-pixel slide on every repaint — and during a rival's spelling that is
       several times a second. Everything inside inherits the movement, which is
       why the staging box appeared to drift even after its own animation went. */
    const rise = g.rose ? '' : 'animation:sb-rise .35s ease both';
    g.rose = 1;
    return `<div class="mb-wrap" style="${rise}">
      <div class="mb-top">
        <button data-act="mbQuit" class="mb-back">← Leave the hall</button>
        <span class="mb-round">${esc(R.name)}<i>${esc(R.sub)}</i></span>
        <span class="mb-rec">${live.length} of 11 still in</span>
      </div>
      <div class="mb-stage">
        <div class="mb-spot"></div>
        <div class="mb-ann"><span class="mb-ann-ic">${iconSVG('volume', 16)}</span><p>${esc(g.announce || '')}</p></div>
        ${podium}
      </div>
      ${fieldRow()}
    </div>`;
  }
  const maskWord = (s, w) => String(s || '').replace(new RegExp(String(w || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[a-z]*', 'ig'), '▁▁▁');

  function viewResult() {
    const g = mb(); const p = prog();
    const champ = g.champ;
    return `<div class="mb-wrap" style="animation:sb-rise .35s ease both">
      <div class="mb-top"><button data-act="mbQuit" class="mb-back">← Arcade</button>
        <span class="mb-title">${g.meWon ? 'Champion' : 'The bee is over'}</span></div>
      <div class="mb-result ${g.meWon ? 'won' : ''}">
        <span class="mb-result-face">${g.meWon ? (window.SB_AVATAR ? SB_AVATAR(g.avatar, 108) : '')
          : (champ && window.SB_AVATAR ? SB_AVATAR(champ.kind === 'me' ? g.avatar : champ.bot.id, 108) : '')}</span>
        <h2>${g.meWon ? 'You won the bee.' : esc((champ && champ.kind === 'bot' ? champ.bot.name : 'Nobody')) + ' takes it.'}</h2>
        <p>${g.meWon ? 'Eleven spellers, and the microphone is yours.'
          : 'You finished <b>' + ordinal(g.place) + '</b> of eleven.'}</p>
        <div class="mb-pay">${iconSVG('coin', 16)} ${fmtN(g.pay)} coins</div>
        <div class="mb-again">
          <button data-act="mbAgain" class="mb-go">${iconSVG('crown', 17)} Another bee</button>
          <button data-act="mbQuit" class="mb-back2">Back to the Arcade</button>
        </div>
        ${p.played ? `<div class="mb-hist">${p.played} ${p.played === 1 ? 'bee' : 'bees'} · ${p.wins || 0} won · best ${ordinal(p.best || 11)}</div>` : ''}
      </div>
      ${fieldRow()}
    </div>`;
  }

  window.MOCKBEE = {
    open: () => app2.mbOpen(),
    view: () => { const g = mb(); if (!g) return viewLobby();
      return g.view === 'stage' ? viewStage() : g.view === 'result' ? viewResult() : viewLobby(); },
    stats: () => prog(),
  };

  /* keyboard: Enter submits from anywhere on the speller's turn, and moves
     the rival on from anywhere during the 30-second write-along window */
  window.addEventListener('keydown', e => { try {
    const g = mb(); if (!g || state.nav !== 'mockbee') return;
    if (e.key !== 'Enter') return;
    if (g.phase === 'me') { e.preventDefault(); app2.mbSpell(); }
    else if (g.phase === 'practice') { e.preventDefault(); app2.mbPracSkip(); }
  } catch (_) {} });
})();
