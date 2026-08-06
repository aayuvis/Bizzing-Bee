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
    { id: 'pixel', lvl: .18, name: 'Pip', age: 8, skill: .52, nerve: .74, spec: null, pace: 620,
      note: 'Eight, and spells at a sprint. Brilliant or gone.', vary: .22,
      tell: 'starts before the pronouncer finishes' },
    { id: 'koi', lvl: .24, name: 'Nova', age: 9, skill: .58, nerve: .70, spec: /old english|germanic/i, pace: 1150,
      note: 'Steady. Short words are hers and she knows it.', vary: .08,
      tell: 'says the word twice, always' },
    { id: 'beaker', lvl: .32, name: 'Rafi', age: 10, skill: .63, nerve: .58, spec: /latin/i, pace: 1300,
      note: 'Takes every Latin root apart before he writes it.', vary: .10,
      tell: 'traces the letters on his palm' },
    { id: 'panda', lvl: .38, name: 'Suki', age: 11, skill: .66, nerve: .93, spec: null, pace: 1400,
      note: 'Unshakeable. The lights do nothing to her.', vary: .07,
      tell: 'breathes out, then spells' },
    { id: 'comet', lvl: .42, name: 'Dax', age: 11, skill: .71, nerve: .34, spec: null, pace: 700,
      note: 'Fastest here in round one. Watch him in round six.', vary: .16,
      tell: 'rocks on his heels' },
    { id: 'astro', lvl: .44, name: 'Mira', age: 12, skill: .70, nerve: .66, spec: /greek/i, pace: 1250,
      note: 'Greek is her language. Ask her for the origin and smile.', vary: .09,
      tell: 'asks for the language of origin every time' },
    { id: 'scopey', lvl: .43, name: 'Theo', age: 12, skill: .69, nerve: .80, spec: null, pace: 2100,
      note: 'Asks all four questions. Every word. No exceptions.', vary: .06,
      tell: 'asks all four questions, every single word' },
    { id: 'melody', lvl: .52, name: 'Ines', age: 13, skill: .74, nerve: .72, spec: /french/i, pace: 1200,
      note: 'French endings hold no silence she has not heard.', vary: .08,
      tell: 'mouths the word in French first' },
    { id: 'samurai', lvl: .62, name: 'Kwame', age: 14, skill: .80, nerve: .78, spec: /latin|greek/i, pace: 1100,
      note: 'No weakness anybody has found yet.', vary: .06,
      tell: 'hands behind his back, dead still' },
    { id: 'goldlegend', lvl: .72, name: 'Vesper', age: 15, skill: .87, nerve: .95, spec: null, pace: 900,
      note: 'Won this last year. Has not looked at anyone since.', vary: .05,
      tell: 'does not ask for anything' },
  ];

  /* ---------------- the rounds ----------------
     A real bee gets harder every round and the room gets quieter. `pct` is the
     slice of the ranked bee list the round draws from — a percentile window
     rather than a library y-band, because the library's y only reaches 7 with
     any depth and a round-eight band of [8,9] has almost nothing in it. The
     windows overlap, the way a real list does. `press` is the pressure
     multiplier: what turns a nervous speller's round six into a coin toss.
     Round one does not eliminate — the announcer says so, so it must be true. */
  const ROUNDS = [
    { name: 'Round One', sub: 'the warm-up', pct: [0, .14], press: .1, safe: 1, line: 'Everybody gets one, and nobody goes out. Find your feet.' },
    { name: 'Round Two', sub: 'finding the level', pct: [.10, .26], press: .2, line: 'From here it counts. Miss it and you sit down.' },
    { name: 'Round Three', sub: 'the roots round', pct: [.22, .40], press: .35, line: 'From here on, know where the word came from.' },
    { name: 'Round Four', sub: 'the long words', pct: [.36, .55], press: .5, line: 'Longer now. Take the syllables one at a time.' },
    { name: 'Round Five', sub: 'the origins round', pct: [.50, .68], press: .65, line: 'Four languages on this list. Ask which one.' },
    { name: 'Round Six', sub: 'the thinning', pct: [.63, .80], press: .8, line: 'Look around. There were eleven of you.' },
    { name: 'Round Seven', sub: 'the deep end', pct: [.76, .92], press: .92, line: 'These are the words that end bees.' },
    { name: 'Round Eight', sub: 'championship words', pct: [.86, 1], press: 1, line: 'Championship words. Every one of them can finish this.' },
  ];
  /* A real bee does not stop at eight. If two spellers are trading championship
     words all night the rounds keep counting up, so the round keeps its own name
     rather than announcing Round Eight four times. */
  const NUMERAL = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen'];
  const EXTRA_LINE = ['Still standing. Still championship words.',
    'Neither of you will give. Another one, then.',
    'This is the longest this hall has run in years. Again.'];
  /* Two spellers trading championship words under the two-word rule can go on
     all night — the simulator found a bee that reached round fifty-three. So the
     hall escalates: the list climbs to its very top, and after three extra rounds
     the championship rule is suspended and the next miss ends it. Sudden death is
     how real bees close, and it guarantees this one closes too. */
  const SUDDEN_AT = 3;
  function roundAt(n) {
    if (n < ROUNDS.length) return ROUNDS[n];
    const last = ROUNDS[ROUNDS.length - 1], k = n - ROUNDS.length;
    const sudden = k >= SUDDEN_AT;
    return { name: 'Round ' + (NUMERAL[n] || (n + 1)), sub: sudden ? 'sudden death' : 'championship words',
      pct: [Math.min(.94, last.pct[0] + k * .02), 1], press: 1 + k * .25, sudden: sudden ? 1 : 0,
      line: sudden ? 'Sudden death. The championship rule is suspended — the next miss ends this bee.'
        : EXTRA_LINE[k % EXTRA_LINE.length] };
  }

  /* ---------------- the announcer ----------------
     Authored pools rather than one line per event, because the child will hear
     these many times and a bee announcer who repeats himself is a robot. */
  const SAY = {
    open: ['Ladies and gentlemen — eleven spellers, one microphone, and only one of them is walking out of here with it.',
      'Welcome to the hall. Eleven spellers. The rules are the old rules: you miss, you sit down.',
      'The lights are up, the field is set, and somewhere in this room is a champion who does not know it yet.'],
    draw: ['You have drawn number {n}. Remember it — it is your place in every round tonight.',
      'Number {n}. That is where you stand, and that is when you spell.',
      'Draw number {n}. Learn the faces on either side of you; some of them will not be there long.'],
    roundIn: ['{round}. {line}', 'We move to {round}. {line}', '{round} — {sub}. {line}'],
    callMe: ['Speller number {n}. Your word, please.', 'To the microphone, number {n}.',
      'Number {n} — this is yours.', 'Our own speller, number {n}. Take your time.'],
    callBot: ['{name}, {age}. {name} {tell}.', '{name} steps up — {age}, and {tell}.',
      'Number {n}, {name}. {age}, and {tell}.', '{name} to the microphone. {age}.'],
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
    finalTwo: ['Two spellers left, so listen closely: if one of you misses and the other spells that word AND the next word, that speller is the champion.',
      'Championship rules. Miss, and your rival can end this with two correct words.'],
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
    setTimeout(() => { announce(fill(pick(SAY.draw, state.mb.seed + 1), { n: me.n })); beginRound(); }, 2100);
    render();
  };

  function announce(text, quiet) {
    const g = mb(); if (!g) return;
    g.announce = text;
    g.log = (g.log || []).concat([text]).slice(-40);
    if (!quiet) { try { deviceSpeak(text, .98); } catch (e) {} }
    render();
  }

  const alive = () => (mb().field || []).filter(s => s.in);

  /* Going out is recorded in the order it happened, because that order IS the
     final placing — the last speller to sit down finished second. Round one is
     a warm-up and takes nobody. */
  function sitDown(s) {
    const g = mb();
    if (roundAt(g.round).safe) return false;
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
    if (roundAt(g.round).sudden) return false;     /* sudden death: a miss is the end */
    const rival = g.field.find(s => s.in && s !== misser);
    if (!rival || !missedWord || !missedWord.w) return false;
    const extra = (g.words || []).find(w => w && nkey(w.w) !== nkey(missedWord.w))
      || roundWords(roundAt(g.round), 1)[0] || missedWord;
    g.c2 = { rival, misser, words: [missedWord, extra], step: 0 };
    setTimeout(champRun, 1700);
    return true;
  }

  function champRun() {
    const g = mb(); if (!g || g.view !== 'stage' || !g.c2) return;
    const c2 = g.c2, s = c2.rival;
    g.word = c2.words[c2.step];
    if (!g.word || !g.word.w) { g.c2 = null; return finish(); }
    g.typed = ''; g.asked = {}; g.atMic = s;
    const name = s.kind === 'me' ? 'You' : s.bot.name;
    announce(fill(pick(c2.step === 0 ? SAY.c2First : SAY.c2Champ, g.seed + c2.step * 3), { name }));
    if (s.kind === 'me') {
      g.phase = 'me';
      setTimeout(() => { try { say(g.word.w); } catch (e) {} }, 1600);
      render();
    } else {
      g.phase = 'bot'; g.botStep = 0; g.botOut = '';
      setTimeout(() => botTurn(s), clamp(s.bot.pace * .5, 600, 1200));
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
      setTimeout(beginRound, 2900); return;
    }
    if (c2.step === 0) { c2.step = 1; setTimeout(champRun, 1800); return; }
    g.c2 = null;
    setTimeout(finish, 1300);
  }

  function beginRound() {
    const g = mb(); if (!g) return;
    const R = roundAt(g.round);
    const live = alive();
    g.words = roundWords(R, live.length + 2);
    g.turn = 0; g.phase = 'call'; g.roundMissed = 0; g.roundTook = 0; g.roundOut = [];
    announce(fill(pick(SAY.roundIn, g.seed + g.round * 7), { round: R.name, sub: R.sub, line: R.line }));
    if (live.length === 2 && !g.saidFinal) { g.saidFinal = true;
      setTimeout(() => announce(pick(SAY.finalTwo, g.seed)), 2600); }
    setTimeout(nextTurn, live.length === 2 && g.saidFinal ? 4600 : 2100);
  }

  function nextTurn() {
    const g = mb(); if (!g || g.view !== 'stage') return;
    const live = alive();
    if (!live.length) { return finish(); }
    if (g.turn >= live.length) {
      /* round over. Real bee rule: if every speller in a round missed, nobody
         goes out and the round runs again. */
      if (!roundAt(g.round).safe && g.roundMissed && g.roundTook
          && g.roundMissed >= g.roundTook && (g.redo = (g.redo || 0) + 1) <= 2) {
        (g.roundOut || []).forEach(s => { s.in = true; });
        g.outSeq = (g.outSeq || []).filter(s => s.in === false);
        g.roundOut = [];
        announce(pick(SAY.allMiss, g.seed + g.round));
        setTimeout(() => { beginRound(); }, 2600); return;
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
      setTimeout(beginRound, 1300); return;
    }
    const s = live[g.turn];
    g.atMic = s;                     /* who is actually at the microphone, which
                                        is NOT live[turn] once turn advances */
    g.word = (g.words && g.words.length) ? g.words[g.turn % g.words.length] : null;
    /* the list came back empty — end the bee on the spellers still standing
       rather than putting a speller in front of a word that does not exist */
    if (!g.word || !g.word.w) return finish();
    g.typed = ''; g.asked = {};
    if (s.kind === 'me') {
      g.phase = 'me';
      announce(fill(pick(SAY.callMe, g.seed + g.turn), { n: s.n }));
      setTimeout(() => { try { say(g.word.w); } catch (e) {} }, 1500);
      render();
    } else {
      g.phase = 'bot'; g.botStep = 0; g.botOut = '';
      announce(fill(pick(SAY.callBot, g.seed + g.turn * 3 + g.round), { name: s.bot.name, age: s.bot.age + ' years old', tell: s.bot.tell, n: s.n }));
      setTimeout(() => botTurn(s), clamp(s.bot.pace * .45, 420, 1000));
    }
  }

  function botTurn(s) {
    const g = mb(); if (!g || g.view !== 'stage') return;
    if (!g.word || !g.word.w) return finish();
    const R = roundAt(g.round);
    const ok = botSpells(s.bot, g.word, R.press);
    const shown = ok ? g.word.w : misspell(g.word.w);
    g.botOut = ''; g.botOk = ok; g.phase = 'botSpell';
    /* letters one at a time, because that is how it feels in the hall */
    let i = 0;
    const step = () => {
      const gg = mb(); if (!gg || gg.view !== 'stage' || gg.phase !== 'botSpell') return;
      gg.botOut = shown.slice(0, ++i).toUpperCase().split('').join(' ');
      render();
      if (i < shown.length) setTimeout(step, clamp(s.bot.pace / shown.length, 55, 150));
      else setTimeout(() => verdict(s, ok), 460);
    };
    step();
  }

  function verdict(s, ok) {
    const g = mb(); if (!g) return;
    /* the rival's shot at the title runs on its own rails */
    if (g.c2) {
      try { sfx(ok ? 'right' : 'wrong'); } catch (e) {}
      announce(ok ? fill(pick(SAY.botRight, g.seed + g.round * 5), { name: s.bot.name })
        : fill(pick(SAY.botWrong, g.seed + g.round * 5), { name: s.bot.name, word: g.word.w }));
      s.hist.push(ok); g.phase = 'call';
      setTimeout(() => champAfter(ok), 1500); return;
    }
    g.roundTook++;
    if (ok) { try { sfx('right'); } catch (e) {}
      announce(fill(pick(SAY.botRight, g.seed + g.turn * 5), { name: s.bot.name }));
    } else {
      const out = sitDown(s); g.roundMissed++;
      try { sfx('wrong'); } catch (e) {}
      announce(out ? fill(pick(SAY.botWrong, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w })
        : fill(pick(SAY.botSafe, g.seed + g.turn * 5), { name: s.bot.name, word: g.word.w }));
      /* that miss left one speller standing — championship rules, not a win */
      if (out && alive().length === 1 && champTry(s, g.word)) {
        s.hist.push(ok); g.phase = 'call'; return;
      }
    }
    s.hist.push(ok);
    g.turn++; g.phase = 'call';
    setTimeout(nextTurn, 1150);
  }

  /* ---------------- the speller's turn ---------------- */
  app2.mbSay = () => { const g = mb(); if (g && g.word) { try { say(g.word.w); } catch (e) {} } };
  app2.mbAsk = k => { const g = mb(); if (!g) return; g.asked = { ...(g.asked || {}), [k]: 1 };
    const w = g.word || {};
    const txt = k === 'def' ? (w.d || 'No definition on file for that one.')
      : k === 'org' ? ('From ' + (w.o || 'an origin not recorded'))
      : k === 'sent' ? (w.s || 'No sentence on file.')
      : (w.ps || 'Part of speech not recorded');
    try { deviceSpeak(txt, .98); } catch (e) {}
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
      setTimeout(() => champAfter(ok), 2000);
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
    setTimeout(() => { const gg = mb(); if (!gg) return; gg.phase = 'call'; nextTurn(); }, 1900);
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
      setTimeout(() => announce(fill(pick(SAY.outMe, g.seed), { place: ordinal(place) }), true), 2600);
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
          <p>You draw a number, you take your turn in that order, and you spell one word a round.
             Miss it and you sit down. The last speller standing takes it.</p>
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
            <span title="Skill">${bar('skill', b.skill)}</span>
            <span title="Nerve — how little the late rounds move them">${bar('nerve', b.nerve)}</span>
          </span>
        </span></div>`).join('')}</div>
    </div>`;
  }
  const bar = (label, v) => `<span class="mb-bar"><i>${label}</i><b><s style="width:${Math.round(v * 100)}%"></s></b></span>`;

  function viewStage() {
    const g = mb(); const R = roundAt(g.round); const live = alive();
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
      : (function () {
        const s = g.atMic;
        if (!s || s.kind === 'me') return `<div class="mb-mic idle"><div class="mb-mic-in"><span class="mb-mic-name">…</span></div></div>`;
        return `<div class="mb-mic ${g.phase === 'botSpell' && g.botOut.length >= (w.w || '').length ? (g.botOk ? 'ok' : 'no') : ''}">
          <span class="mb-mic-face">${window.SB_AVATAR ? SB_AVATAR(s.bot.id, 74) : ''}</span>
          <div class="mb-mic-in">
            <span class="mb-mic-name">${esc(s.bot.name)} · ${s.bot.age} · number ${s.n}</span>
            <div class="mb-letters">${g.botOut || '<span class="mb-thinking">thinking…</span>'}</div>
          </div></div>`;
      })();

    return `<div class="mb-wrap" style="animation:sb-rise .35s ease both">
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

  /* keyboard: Enter submits from anywhere on the speller's turn */
  window.addEventListener('keydown', e => { try {
    const g = mb(); if (!g || state.nav !== 'mockbee' || g.phase !== 'me') return;
    if (e.key === 'Enter') { e.preventDefault(); app2.mbSpell(); }
  } catch (_) {} });
})();
