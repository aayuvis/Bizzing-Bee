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
      /* medical and mental-health stigma: the word is the hurt, whatever its gloss says. The second line
         (10 Oct 2026, P0.11–P0.13) is the stigma scan's headwords: every word below that the library holds
         as a record a game could draw. `invalid` and `handicapped` are here because the served gloss IS the
         person sense ("someone who is incapacitated…", "people who have a physical condition…"); `lame`
         because its gloss is the disability sense and the word is the playground insult. */
      stigma: ['lunatic', 'lunatics', 'lunacy', 'insane', 'insanely', 'insanity', 'madman', 'madmen', 'madwoman', 'maniac', 'maniacs',
        'psycho', 'psychos', 'schizo', 'spastic', 'spastics', 'spaz', 'cripple', 'cripples', 'crippled', 'midget', 'midgets',
        'leper', 'lepers', 'lazar', 'mongolism', 'mongoloid', 'mongoloids', 'bedlamite',
        'crippling', 'maniacal', 'madwomen', 'nutter', 'nutters', 'nutcase', 'nutcases', 'loony', 'loonies', 'looney', 'freak', 'freaks',
        'freakish', 'handicapped', 'invalid', 'invalids', 'lame', 'lamely', 'lameness', 'harelip', 'hunchback', 'fatso', 'gyp', 'gypped'],
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
    /* a child under eleven: alcohol and liquor (minBand '11-15'), and the two words the 4.5 brief named */
    young: {
      minAge: 11,
      words: ['alcohol', 'alcoholic', 'alcoholics', 'alcoholism', 'beer', 'beers', 'liquor', 'liquors', 'whisky', 'whiskey',
        'whiskies', 'whiskeys', 'vodka', 'tequila', 'brandy', 'drunk', 'drunks', 'drunken', 'drunkenly',
        'drunkenness', 'drunkard', 'drunkards', 'tipsy', 'hangover', 'booze', 'boozer', 'tobacco', 'cigarette', 'cigarettes', 'cigar', 'cigars',
        /* the 4.5 brief (P0.7, 10 Oct 2026): ordinary words the audit saw a game hand a young child — kept in the
           library and in games from eleven, never struck. `racially` is a word about race a child should meet
           with a grown-up's context; `maggots` (and its singular) the audit flagged as unpleasant for the youngest. */
        'racially', 'maggot', 'maggots'],
      /* a gloss that SAYS the word is an alcoholic drink ("strong highly flavored sweet liquor…"), not one
         that merely mentions drink — chocolate is "usually drunk hot", a tavern sells drinks */
      defs: ['^(an? |any )?((?!(of|where|that|which|for|to|with|from|or|and)\\b)[a-z-]+,? ){0,4}(alcoholic (beverage|drink)|liquor)s?\\b', '\\bintoxicat', '\\bdrunkenness\\b']
    },
    /* STIGMA IN TEXT (the 4.5 brief, P0.11–P0.13, 10 Oct 2026). Words and phrases that hurt someone for a
       disability, their mental health, their ethnicity or their body — read against TEXT: every example
       sentence the app serves, the chapters' `ex`, the trivia questions and facts, every My Feed card, and
       here against a game word's own headword and gloss. ONE list: the page reads it here (kidSafe), and node
       reads it through tools/stigma.cjs, its only door (tools/build-feed.cjs drops a matching card;
       tests/stigma.cjs fails on a match left in any served store). A served sentence that matches loses its
       sentence — never gets a new one written (qc-stigma-fixes.json is the ledger).
       Ordinary words are here only in the sense that hurts, by phrase: `crazy` said OF a person, not "drives
       me crazy"; `invalid` the person, not the argument; `lame` the insult, not the horse that came up lame;
       `suffers from` a disability or a mental illness, not indigestion. `mad` is not here at all (it means
       angry), nor `blind`/`deaf`, `dwarf` (a star, a planet, a medical word) or `mute` (a button, a swan).
       Whole words, case-insensitive unless listed under `cased`. */
    stigma: {
      /* every sense: the word itself is the hurt */
      words: ['cripple', 'cripples', 'crippled', 'crippling', 'cripplingly', 'spastic', 'spastics', 'spaz', 'spazz', 'spazzes',
        'retarded', 'retardate', 'retardates', 'handicapped', 'wheelchair-bound',
        'lunatic', 'lunatics', 'lunacy', 'maniac', 'maniacs', 'maniacal', 'maniacally', 'madman', 'madmen', 'madwoman', 'madwomen',
        'nutter', 'nutters', 'nutcase', 'nutcases', 'nutjob', 'nutjobs', 'nuthouse', 'loony', 'loonies', 'looney', 'looneys', 'schizo', 'schizos',
        'dumb', 'dumber', 'dumbest', 'dumbly', 'dumbness', 'deaf-mute', 'deaf-mutes',
        'freak', 'freaks', 'freakish', 'freakishly', 'midget', 'midgets', 'harelip', 'harelipped', 'hunchback', 'hunchbacked',
        'leper', 'lepers', 'lazar', 'lazars', 'bedlamite', 'bedlamites', 'fatso', 'fatsos', 'invalids',
        'gyp', 'gypped', 'gypping', 'gypsy', 'gypsies', 'gipsy', 'gipsies', 'eskimo', 'eskimos', 'redskin', 'redskins',
        'half-breed', 'half-breeds', 'half-caste', 'half-castes', 'squaw', 'squaws', 'negroid', 'negroids', 'mongoloid', 'mongoloids',
        'mongolism', 'orientals', 'pickaninny', 'pickaninnies'],
      /* only in the sense that hurts (regular expressions, case-insensitive) */
      phrases: [
        /* invalid, the person — never the argument, the ticket or the password */
        '(an|the|her|his|their|my|our|your) invalid(?=[\'’]s\\b|\\s*[,.;:!?)]|\\s*$|\\s+(who|and|in|for|was|is|had|has|lay|lies|lying|could|would)\\b)',
        'invalid (mother|father|aunt|uncle|husband|wife|son|daughter|sister|brother|grandmother|grandfather|grandma|grandpa|child|children|parent|parents|patient|patients|chair|chairs|carriage|carriages|soldier|soldiers)\\b',
        /* retard the noun (the verb "retards your fall" is a word for slowing down) */
        '(a|an|the|you|you[\'’]re|those|these|such a|some|bunch of|total|complete|stupid|little|like a|what a|are|were) retards?\\b',
        'mentally (deficient|defective|subnormal|handicapped|retarded)',
        'confined to (a|his|her|their) wheelchairs?', 'wheelchair bound',
        /* a label for a person, a place for people */
        '(crazy|insane|demented|deranged|mental|psycho) (person|people|man|men|woman|women|lady|ladies|guy|guys|kid|kids|boy|boys|girl|girls|patient|patients|case|cases)\\b',
        '(insane|mental) asylums?', 'mental (hospital|hospitals|institution|institutions|home|homes|ward|wards)\\b', 'criminally insane',
        'the (insane|mentally ill|lame)(?=\\s*[,.;:!?)]|\\s*$|\\s+(and|or|who|were|was|are|is|in|of|from|with|to)\\b)',
        /* said OF a person */
        '(he|she|you|they|we|i)([\'’](s|re|m)|\\s+(is|are|was|were|am|must be|seems?|seemed|looks?|looked|went|goes|go|gone|has gone|had gone|behaved|behaves|acted|acts|acting|behaving))(\\s+(completely|totally|absolutely|clearly|simply|just|so|utterly|quite|a bit|a little|slightly|stark raving))?\\s+(crazy|crazily|insane|insanely|mental|nuts|bonkers|deranged|demented|unhinged|psycho)\\b',
        /* lame, the insult */
        'lame (excuse|excuses|joke|jokes|attempt|attempts|idea|ideas|movie|movies|party|parties|story|stories|game|games|kid|kids|guy|guys|person|people|answer|answers|reason|reasons)\\b',
        '(so|totally|really|that[\'’]s|that is|sounds|sounded|seemed|seems) lame\\b', 'lamely', 'lameness of',
        /* a disability or a mental illness as suffering */
        'suffer(s|ed|ing)?(\\s+from)?\\s+(a\\s+|an\\s+)?((mild|severe|chronic|acute|terrible|serious)\\s+)?(case of\\s+)?COND\\b',
        '(afflicted|stricken) (with|by) COND\\b', 'COND sufferers?\\b'
      ],
      /* the conditions the last three phrases name */
      cond: '(autism|autistic|dyslexia|dyspraxia|depression|anxiety|schizophrenia|bipolar|psychos[ie]s|neuros[ie]s|neurasthenia|mental illness(es)?|mental disorders?|dementia|epilepsy|cerebral palsy|down[\'’]?s? syndrome|paralysis|paraplegia|quadriplegia|blindness|deafness|disabilit(y|ies)|leprosy|anomia|aphasia|stammering|stuttering|a stammer|a stutter|ocd|adhd|ptsd|insanity|madness|lunacy|dwarfism)',
      /* with case: the lowercase word is the slur, the capitalised one a people or a name (the Mongol Empire) */
      cased: ['mongols?', '[Pp]sychos?(?![-‐])', 'dumbos?'],
      /* blanked before the scan — names and titles that carry a listed word without the hurt, each with why */
      spare: [
        'Looney Tunes',                                  // the cartoon series' name
        'Hunchback of Notre[- ]Dame',                    // Hugo's novel
        'Imaginary Invalid',                             // Molière's play, Le Malade imaginaire
        'Gypsy,? (Roma,? )?and Traveller',               // the name those communities use for themselves in UK law and the census
        'Sleeping Gypsy',                                // Henri Rousseau's painting
        'gypsy jazz',                                    // the music's own name (jazz manouche)
        'dumbo octopus(es)?',                            // a deep-sea animal's common name
        'Bacup [\'‘]?Nutters',                           // the Britannia Coco-nut Dancers' own name (the coconut halves they wear)
        'psycho ?[+=]',                                  // the Greek root written as a word sum: "psycho + pathy"
        'freak (accident|accidents|wave|waves|storm|storms|weather|occurrence|occurrences|snowstorm|hailstorm|flood|floods|tide|tides)'   // a rare event
      ]
    }
  };
  var BLOCK = Object.create(null), YOUNG = Object.create(null);   // 'constructor' is a library word
  Object.keys(L.words).forEach(function (k) { L.words[k].forEach(function (w) { BLOCK[w] = k; }); });
  L.young.words.forEach(function (w) { YOUNG[w] = 1; });
  var DEF = new RegExp(L.defs.join('|'), 'i'), YDEF = new RegExp(L.young.defs.join('|'), 'i');

  /* the stigma scan: SPARE is blanked first (same length, so an offset still points into the text), then
     the case-insensitive words and phrases, then the cased forms. stigmaHits(text) → every hit, in order. */
  var SG = L.stigma, ALT = function (a) { return a.join('|'); };
  var SG_I = new RegExp('\\b(' + ALT(SG.words.map(function (w) { return w.replace(/-/g, '[- ]'); })) + '|' +
    ALT(SG.phrases.map(function (p) { return '(?:' + p.split('COND').join(SG.cond) + ')'; })) + ')\\b', 'gi');
  var SG_C = new RegExp('\\b(' + ALT(SG.cased) + ')\\b', 'g'), SG_SPARE = new RegExp(ALT(SG.spare), 'gi');
  /* `head`: the text is a lowercase HEADWORD, where case says nothing — the cased forms (lowercase `mongol` the
     slur, `Mongol` the people) cannot be told apart there, so a headword is read against the rest of the list */
  L.stigmaHits = function (text, head) {
    var t = String(text == null ? '' : text); if (!t) return [];
    t = t.replace(SG_SPARE, function (m) { return Array(m.length + 1).join(' '); });
    var out = [], m;
    (head ? [SG_I] : [SG_I, SG_C]).forEach(function (re) { re.lastIndex = 0; while ((m = re.exec(t))) { out.push({ at: m.index, hit: m[0] }); if (!m[0]) re.lastIndex++; } });
    return out.sort(function (a, b) { return a.at - b.at; });
  };
  /* the common case first: a text with no candidate at all skips the spare pass (fixCore asks this of the
     whole 130,000-word library as it loads) */
  L.stigmaHit = function (text, head) {
    var t = String(text == null ? '' : text); if (!t) return null;
    SG_I.lastIndex = 0; SG_C.lastIndex = 0; if (!SG_I.test(t) && (head || !SG_C.test(t))) return null;
    var h = L.stigmaHits(t, head); return h.length ? h[0].hit : null; };

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
    /* the stigma scan, on the headword and on the gloss a game would put on screen */
    if (L.stigmaHit(k, true) || (d && L.stigmaHit(d))) return 'stigma';
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
