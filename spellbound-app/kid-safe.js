/* kid-safe.js — THE KID-SAFE LIST (games spec §1.2, 4 Oct 2026). Data, not code: one list a person can read.

   WHAT IT IS FOR. Every word a game puts in front of a child comes through one door, nextWords()
   in app3.js, and that door asks kidSafe(word) first; so does corpusSlice. The audit saw Bee Grand
   Prix serve "doping" and "stupid" at Medium to a nine-year-old. Both are words a dictionary may
   hold and a children's game should not ask for: one is a drug word, the other an insult. This file
   is the record of what a game may not serve, and why, so the list is reviewed as data.

   It does NOT delete anything from the library: a struck word goes in app3's CORE_STRIKE (see
   tests/struck-words.cjs). Search, the Library and the Word Finder still find these words; games do
   not drill them. A word can be good to look up and wrong to be told to type, against the clock, as
   your reward for winning a race.

   Four things block a word (SB_KID_SAFE.check):
     1. its HEADWORD is in one of the families below (every age);
     2. its DEFINITION matches `defs` below — a gloss that says the word itself is an insult, a slur
        or hurtful, a drug or sexual sense, killing a person (every age);
     3. app3's SB_UNSAFE_RE (slurs, the Nazi family), CORE_STRIKE and words-patch's SB_WORDS_HELD,
        when they are on the page;
     4. for a child under eleven, the `young` lists: alcohol and liquor (minBand '11-15').
   Theme gating lives with the themes (themes-data.js `minBand`): Drugs & Pharmacy, War & Weaponry and
   Diseases & Symptoms are not offered to a child under eleven.

   The v4 brief's own list is here by name (idiot · moron · cretin · retard · mongolism · negro ·
   negroid · gypsy · heathen, and the old autism gloss "an abnormal absorption with the self"), so it
   holds even if a library regeneration brings one back.
   Guard: tests/word-door.cjs (node, @check) — doping and stupid fail, the v4 list fails, and 1,000
   words a band drawn the way corpusSlice draws them all pass. */
(function () {
  var L = window.SB_KID_SAFE = {
    purpose: 'Words a GAME may not serve a child (games spec §1.2). Not a deletion list: see CORE_STRIKE for that.',
    /* headword families: exact words, every age. Inflections are listed, not guessed. */
    words: {
      insult: ['stupid', 'stupider', 'stupidest', 'stupidly', 'stupidity', 'stupidities', 'stupidness',
        'idiot', 'idiots', 'idiotic', 'idiotically', 'idiocy', 'idiocies', 'moron', 'morons', 'moronic', 'moronity',
        'cretin', 'cretins', 'cretinous', 'cretinism', 'imbecile', 'imbeciles', 'imbecilic', 'imbecility',
        'retard', 'retards', 'retarded', 'dimwit', 'dimwits', 'dimwitted', 'halfwit', 'halfwits', 'halfwitted',
        'nitwit', 'nitwits', 'numskull', 'numskulls', 'numbskull', 'numbskulls', 'nincompoop', 'nincompoops',
        'bonehead', 'boneheads', 'boneheaded', 'blockhead', 'blockheads', 'fathead', 'fatheads', 'lunkhead', 'lunkheads',
        'dumb', 'dumber', 'dumbest', 'dumbly', 'dumbness', 'dumbo', 'dopey', 'dopy', 'bastard', 'bastards'],
      drugs: ['dope', 'dopes', 'doped', 'doping', 'doper', 'dopers', 'dopehead', 'cocaine', 'heroin', 'opium', 'opiate', 'opiates',
        'marijuana', 'cannabis', 'hashish', 'narcotic', 'narcotics', 'junkie', 'junkies', 'pothead', 'potheads', 'stoner', 'stoners',
        'amphetamine', 'amphetamines', 'methamphetamine'],
      sexual: ['sexy', 'sexier', 'sexiest', 'sexual', 'sexually', 'sexuality', 'erotic', 'erotica', 'erotically', 'eroticism',
        'porn', 'porno', 'pornography', 'pornographic', 'orgy', 'orgies', 'orgasm', 'orgasms', 'aphrodisiac', 'aphrodisiacs',
        'prostitute', 'prostitutes', 'prostitution', 'harlot', 'harlots', 'brothel', 'brothels', 'strumpet', 'strumpets',
        'trollop', 'trollops', 'hussy', 'lewd', 'lewdly', 'lewdness', 'lecher', 'lechers', 'lecherous', 'lechery', 'condom', 'condoms'],
      violence: ['murder', 'murders', 'murdered', 'murdering', 'murderer', 'murderers', 'murderess', 'murderous',
        'massacre', 'massacres', 'massacred', 'genocide', 'genocides', 'genocidal', 'torture', 'tortures', 'tortured',
        'torturer', 'torturers', 'torturing', 'torturous', 'suicide', 'suicides', 'suicidal', 'slaughter', 'slaughters',
        'slaughtered', 'slaughtering', 'slaughterhouse', 'behead', 'beheads', 'beheaded', 'beheading', 'decapitate',
        'decapitated', 'decapitation', 'assassinate', 'assassinated', 'assassination', 'mutilate', 'mutilated', 'mutilation',
        'disembowel', 'disemboweled', 'bloodbath', 'terrorism', 'terrorist', 'terrorists'],
      /* medical and mental-health stigma: the word is the hurt, whatever its gloss says */
      stigma: ['lunatic', 'lunatics', 'lunacy', 'insane', 'insanely', 'insanity', 'madman', 'madmen', 'madwoman', 'maniac', 'maniacs',
        'psycho', 'psychos', 'schizo', 'spastic', 'spastics', 'spaz', 'cripple', 'cripples', 'crippled', 'midget', 'midgets',
        'leper', 'lepers', 'lazar', 'mongolism', 'mongoloid', 'mongoloids', 'bedlamite'],
      /* identity words the v4 brief named: old names for a people or a faith, used as labels */
      identity: ['negro', 'negroes', 'negroid', 'negroids', 'gypsy', 'gypsies', 'gipsy', 'heathen', 'heathens', 'heathenish',
        'infidel', 'infidels', 'squaw', 'squaws']
    },
    /* definitions, every age (case-insensitive) */
    defs: [
      /* the gloss says the word itself is an insult or hurtful */
      '\\b(offensive|derogatory|disparaging|hurtful|insulting|unkind) (term|word|name|slang|terms|words|names)',
      '\\bnow considered (offensive|hurtful|derogatory|insulting|rude)', '\\bused unkindly|often unkindly|\\bunkind word',
      '(ethnic|racial|religious) slur', '\\bterm of abuse', 'express a low opinion of someone',
      '\\ba stupid (person|man|woman|fool)|\\bstupid (incompetent )?(person|fool)',
      /* the v4 brief's old glosses, by their words */
      'subnormal intelligence', 'mentally (deficient|retarded|defective)', 'feeble-?minded', 'abnormal absorption with the self',
      /* drugs, sex, killing a person */
      '\\b(take|taking|took) drugs\\b', '\\b(illegal|recreational|street) drugs?\\b', '\\bnarcotics?\\b', '\\bhallucinogen',
      '\\bdrug addict', '\\bget(ting)? high\\b',
      '\\bsexual (excitement|intercourse|arousal|desire|activity|act|acts|partner|partners|abuse|assault|pleasure|relations)\\b',
      '\\berotic', '\\bpornograph', '\\bprostitut', '\\bbrothel', '\\borgasm', '\\baphrodisiac', '\\bgenitals\\b', '\\bcoitus',
      '\\bmurder', '\\bmassacre', '\\bgenocide', '\\btortur', '\\bsuicide\\b', '\\bbehead', '\\bdecapitat', '\\bdisembowel', '\\bmutilat'
    ],
    /* a child under eleven: alcohol and liquor (minBand '11-15') */
    young: {
      minAge: 11,
      words: ['alcohol', 'alcoholic', 'alcoholics', 'alcoholism', 'beer', 'beers', 'liquor', 'liquors', 'whisky', 'whiskey',
        'whiskies', 'whiskeys', 'vodka', 'tequila', 'brandy', 'drunk', 'drunks', 'drunken', 'drunkenly',
        'drunkenness', 'drunkard', 'drunkards', 'tipsy', 'hangover', 'booze', 'boozer', 'tobacco', 'cigarette', 'cigarettes', 'cigar', 'cigars'],
      /* a gloss that SAYS the word is an alcoholic drink ("strong highly flavored sweet liquor…"), not one
         that merely mentions drink — chocolate is "usually drunk hot", a tavern sells drinks */
      defs: ['^(an? |any )?((?!(of|where|that|which|for|to|with|from|or|and)\\b)[a-z-]+,? ){0,4}(alcoholic (beverage|drink)|liquor)s?\\b', '\\bintoxicat', '\\bdrunkenness\\b']
    }
  };
  var BLOCK = Object.create(null), YOUNG = Object.create(null);   // 'constructor' is a library word
  Object.keys(L.words).forEach(function (k) { L.words[k].forEach(function (w) { BLOCK[w] = k; }); });
  L.young.words.forEach(function (w) { YOUNG[w] = 1; });
  var DEF = new RegExp(L.defs.join('|'), 'i'), YDEF = new RegExp(L.young.defs.join('|'), 'i');

  /* why(word, age) → null when a game may serve it, else the reason (a family name). Pure: it reads
     only the record, the age, and the three page lists when they are on the page. A record's verdict
     is cached on the record (a WeakMap, re-made if its word or gloss is rewritten), because the
     picker asks it of thousands of words a draw. */
  function whyAll(w) {
    var k = String(w.w).toLowerCase().trim(), d = String(w.d || '');
    if (BLOCK[k]) return BLOCK[k];
    var U = window.SB_UNSAFE_RE; if (U && (U.test(k) || (d && U.test(d)))) return 'unsafe';
    var S = window.SB_CORE_STRIKE; if (S && S.has && S.has(k)) return 'struck';
    var H = window.SB_WORDS_HELD; if (H && H.indexOf && H.indexOf(k) >= 0) return 'held';
    if (d && DEF.test(d)) return 'definition';
    return null;
  }
  function young(w) { var k = String(w.w).toLowerCase().trim(), d = String(w.d || ''); return !!(YOUNG[k] || (d && YDEF.test(d))); }
  var CACHE = (typeof WeakMap === 'function') ? new WeakMap() : null;
  L.why = function (w, age) {
    if (!w || !w.w) return 'empty';
    var a = +age; if (!(a > 0)) a = 9;   // no age known: treat as the youngest band a game serves by default
    var e = CACHE && typeof w === 'object' ? CACHE.get(w) : null;
    if (!e || e.w !== w.w || e.d !== w.d) { e = { w: w.w, d: w.d, all: whyAll(w), young: young(w) }; if (CACHE && typeof w === 'object') CACHE.set(w, e); }
    if (e.all) return e.all;
    if (a < L.young.minAge && e.young) return 'young';
    return null;
  };
  L.check = function (w, age) { return L.why(w, age) === null; };
  /* the age-independent half — what corpusSlice can cache once for everyone */
  L.checkAll = function (w) { var y = L.why(w, 99); return y === null; };
})();
