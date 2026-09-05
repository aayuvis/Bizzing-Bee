/* words-patch.js — QC content patch (2026-07-25)
   Loads AFTER words-data.js + words-extra.js and edits SB_DATA.nsf in place:
   • removes non-word sexual-slang neologisms and malformed prefix fragments,
   • rewrites graphic/adult example sentences to kid-safe ones,
   • rewrites definitions that leaked the target spelling.
   Reviewable, additive, and non-destructive to the generated core file. */
/* Exposed as SB_WORDS_PATCH so it can be re-applied to a later shard: the core
   library boots as an easy first tier and words-data-2.js appends the rest, and
   those records need the same QC pass. Idempotent by construction. */
window.SB_WORDS_PATCH = function () {
  var D = window.SB_DATA;
  if (!D || !Array.isArray(D.nsf)) return;
  var nk = function (s) { return String(s == null ? '' : s).toLowerCase().trim(); };

  /* EVERY LOOKUP HERE IS PROTOTYPE-SAFE, and it was not: with a plain {} the
     test `REMOVE[w]` answers TRUE for "constructor", because that is a key on
     Object.prototype. `constructor` is a real library word — app3's CORE_FIX
     even ships it a kid-safe gloss, "a person or company that builds
     something" — and this file has been quietly splicing it out of the served
     corpus on every boot. SENT and DEF carry the same flaw: SENT["constructor"]
     would have assigned the Object constructor FUNCTION as an example
     sentence. Same trap CLAUDE.md documents for homIndex. */
  // 1) Remove: coined sexual-slang neologisms, malformed prefix fragments, a broken self-referential entry.
  var REMOVE = Object.create(null);
  ['sexhibition', 'sex-texting', 'sexualizable', 'unsexualized', 'fauxmosexual',
   'nymphomaniacs', 'encephalize-', 'triskaideka-', 'committeth'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1a) Ethnic slurs and dated exonyms, signed off 5 Sep 2026. These MUST be
  // listed here as well as in app3's CORE_STRIKE: fixCore() guards the 130k
  // library, but a child practises out of SB_DATA.nsf, and every one of these
  // was live in the served shards. They are glossed innocently — kaffir as a
  // cereal crop, hottentot as a Khoisan language, negress as "a Black woman or
  // girl" — so the SLUR_DEF pattern cannot see them. Keep the two lists in step.
  ['kaffir', 'kaffirs', 'kafir', 'kafirs', 'hottentot', 'hottentots',
   'negress', 'negresses', 'pickaninny', 'pickaninnies', 'coolie', 'coolies',
   'redskin', 'redskins', 'chinaman', 'chinamen', 'halfcaste', 'half-caste',
   'eskimo', 'eskimos', 'bushman', 'bushmen', 'gypsy', 'gypsies'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1c) Sexual-violence and pornography glosses, signed off 5 Sep 2026. Same
  // reason as 1a: the gloss is a plain description, so SLUR_DEF never fires.
  // `rape` is struck although the bank serves only the plant sense — the app
  // says every word aloud. `ravishing` is NOT here; app3's CORE_FIX repairs it.
  ['ravish', 'ravished', 'ravisher', 'ravishment', 'ravishes',
   'porn', 'porno', 'porns', 'pornos', 'pornography', 'pornographic',
   'rape', 'raped', 'rapes', 'rapist', 'rapists',
   'molest', 'molested', 'molester', 'molesting'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  /* 1d) THE TWENTY-REVIEWER SWEEP, 5 Sep 2026. Twenty reviewers read all 19,810
     word/stop pairings in the free journey one at a time and returned 5,000-odd
     findings. The content ones are here, because they are NOT a journey fault:
     every word below is in the served corpus, so ordinary Practice served them
     too. A pattern scan over all 56,260 served words found only 315 of these —
     0.6% — because the glosses read innocently. `dicks` is "someone who is a
     detective"; `midget` is "a person who is markedly small"; `knockout` is "a
     very attractive or seductive looking woman". Rules cannot see them. Only
     reading finds them, which is the same lesson block 1a records for kaffir
     and hottentot, learned again at twenty times the scale.

     Each one was read out of the bank and confirmed by hand before it was
     listed — the reviewers were accurate, but a strike list built on trust is
     not a strike list. Words with a good sense and a bad gloss are NOT struck;
     they are repaired in DEF below, so `brownie` stays and stops being a junior
     Girl Scout. */
  // racial, ethnic and disability slurs, and dated exonyms
  [
   'caucasoid', 'coonskin', 'coontie', 'cripple', 'dike', 'epicanthi', 'gamin', 'gipsy',
   'hausa', 'hebe', 'kluxer', 'limey', 'mahound', 'midget', 'mongolism', 'negro',
   'negroes', 'negroid', 'negros', 'octoroon', 'ponce', 'puke', 'quadroon', 
   'sonsy', 'wuss', 'zulu'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // sexual content — the gloss is what the word card puts on screen
  [
   'aphrodisiac', 'bacchanalia', 'bosomy', 'casanova', 'castration', 'circumcision',
   'codpiece', 'come', 'coquette', 'cum', 'debauch', 'dicks', 'doxy', 'erotism',
   'estrus', 'harpy', 'hermaphrodite', 'lothario', 'lubricity', 'lulu', 'masochism',
   'minx', 'naturism', 'nudists', 'odalisque', 'oedipal', 'phallic', 'promiscuity',
   'promiscuous', 'prurience', 'pruriency', 'randy', 'risque', 'sadism', 'saturnalia',
   'satyr', 'satyrs', 'serail', 'sext', 'sexual', 'sexually', 'toying', 'transvestite',
   'transvestites', 'vasectomy', 'wittol'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // drugs of abuse, and alcohol carried under a brand
  [
   'blotto', 'hollands', 'khat', 'quaalude', 'quaaludes'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // torture, weapons, nerve agents and killing
  [
   'abacinate', 'autoloader', 'balisong', 'dumdum', 'emasculate', 'feticide', 'filicide',
   'gestapo', 'lynch', 'lynching', 'nazify', 'poleax', 'poleaxe', 'sarin', 'seel',
   'suttee'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // clinical material no spelling bee has ever asked a child
  [
   'chancrous', 'defecator', 'katharsis', 'mioses', 'miosis', 'myosis', 'proctitis',
   'proctoscope', 'trepanation', 'turp'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // WRONG SPELLINGS, drilled in a spelling app
  [
   'abhominable', 'calfs', 'capibara', 'carotin', 'iodin', 'moder', 'xis'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // people and organisations wearing an ordinary word as a headword
  [
   'audubon', 'chico', 'chicos', 'disney', 'evert', 'goodmen', 'goring', 'guinness',
   'ira', 'kluxer', 'mermen', 'saki', 'semite', 'sills', 'sitters', 'sully', 'tawney',
   'yogi', 'yogin', 'yogis', 'zulus'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // playground obscenity and words whose only sense is an insult
  [
   'booger', 'boogers', 'crappy', 'cretin', 'douche', 'git', 'idiot', 'imbecile',
   'jackass', 'moron', 'morons', 'nipple', 'nipples', 'piss', 'pissing', 'shitty',
   'snot', 'tits', 'twit', 'twits'
  ].forEach(function (w) { REMOVE[nk(w)] = 1; });

  // 1b) Remove: Roman numerals carried as headwords — xiv, xxii, lxx and 13 more,
  // each glossed "the cardinal number that is the sum of thirteen and one". They
  // are two to five letters and rated band 1, so they surfaced near the FRONT of
  // easy word lists, and "x-i-v" teaches a speller nothing. The test is the SHAPE
  // *and* that definition, never the shape alone: `mix` reads as M-IX, `dix` as
  // D-IX (the reformer Dorothea Dix) and `cli` as C-L-I (the command-line
  // interface) — all three are real headwords a shape-only rule would delete.
  var ROMAN = /^(?=[mdclxvi]{2,})m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/;
  var isNumeral = function (w, d) {
    var g = String(d || '');
    // two glosses in the bank, both unmistakable: the cardinal noun form
    // ("the cardinal number that is the sum of thirteen and one") and the
    // adjective form liv carries ("being four more than fifty").
    return ROMAN.test(w) && (/^the cardinal number that is\b/i.test(g)
                          || /^being\s+\w+\s+more than\s+\w+/i.test(g));
  };

  // 2) Rewrite graphic/adult example sentences (word kept so the fill-in-the-blank masker still works).
  var SENT = Object.assign(Object.create(null), {
    grotesquely: 'The old oak was grotesquely twisted into strange, gnarled shapes.',
    heinously:  'In the story the villain schemed so heinously that the whole town cheered when the hero stopped him.',
    viscerally: 'The fans reacted viscerally, gasping all at once at the last-second goal.',
    sensitively:'The teacher sensitively helped the nervous new student feel welcome.',
    allegedly:  'The puppy allegedly buried the missing sock somewhere in the garden.'
  });

  // 3) Rewrite spelling-leak definitions (target word must NOT appear in the definition text).
  var DEF = Object.assign(Object.create(null), {
    retard: "to slow something down or hold back its progress",
    ass: "a donkey; a patient hoofed animal like a small, long-eared horse",
    butt: "the thicker or blunter end of a tool or weapon; also, the target of a joke",
    bloody: "covered or stained with blood",
  /* The 1d repairs: a real word carrying a wrong, adult or simply someone
     else's definition. These teach falsehoods rather than offend — `hedgehog`
     carried the porcupine's gloss ("large rodents with sharp erectile
     bristles"), `chilly` was defined as a hot pepper, `badger` as a resident of
     Wisconsin, and `pallet` and `broach` wore palette's and brooch's meanings
     INSIDE the homophones stop, where telling those pairs apart is the lesson.
     Several still carried raw WordNet attribution debris ("- Winston
     Churchill"). */
    knockout: "a blow in boxing that ends the fight; also, something outstandingly impressive",
    technical: "to do with the particular skills, methods or equipment of a subject or craft",
    tenderloin: "a long, very tender cut of beef or pork taken from along the backbone",
    brownie: "a small square of rich, chewy chocolate cake, usually baked in a tray",
    canisters: "round containers with lids, used for storing tea, flour, sugar and the like",
    vats: "very large tanks or tubs used for holding or mixing liquids",
    tells: "gives information to someone in speech or writing",
    eddy: "a small whirlpool; water or air moving in a circle against the main current",
    chilly: "unpleasantly cold; cold enough to make you shiver",
    gamer: "a person who plays games, especially video games, keenly and often",
    roomy: "having plenty of space inside; comfortably large",
    thrift: "the habit of using money and resources carefully and without waste",
    hedgehog: "a small night-roaming mammal with a coat of sharp spines, which rolls into a ball when alarmed",
    badger: "a strong burrowing animal with a black-and-white striped face; also, to pester someone with questions",
    weasel: "a small, slender, quick-moving meat-eating animal with a long body and short legs",
    urchin: "a spiny round sea creature; also, an old word for a ragged, mischievous child",
    dolphin: "a clever, friendly sea mammal with a long snout, which breathes air and lives in groups",
    herders: "people who look after and drive a group of animals such as cattle, sheep or goats",
    barbers: "people whose trade is cutting hair and trimming beards",
    forger: "a person who makes a false copy of writing, money or a work of art in order to deceive",
    glide: "to move along smoothly, quietly and without apparent effort",
    scuttle: "to run somewhere with quick, short, hurried steps",
    automatic: "working by itself, without a person needing to control it each time",
    automatics: "machines or devices that work by themselves without step-by-step control",
    pallet: "a straw mattress or hard, narrow bed; also, a wooden platform goods are stacked on",
    broach: "to raise a subject for discussion for the first time; also, to pierce a cask to draw liquid",
    sooner: "earlier than the time expected or than something else",
    phoenixes: "mythical birds that burn to ashes and rise from them young again",
    drakes: "male ducks",
    syringes: "narrow tubes with plungers, used to draw in or push out liquid",
    apprehensive: "worried or uneasy that something bad may be about to happen",
    misdirect: "to send someone or something the wrong way, or to aim it at the wrong target",
    whites: "clothes, linen or laundry that are white; also, the white parts of eggs or eyes",
    off: "away from a place, or no longer working, switched on, or attached",
    aboriginal: "belonging to the earliest known people of a country or region",
    cutest: "most charmingly pretty or endearing",
    foil: "a very thin sheet of metal; also, a person or thing that contrasts with another and shows it up",
    protagonist: "the leading character in a story, play or film",
    tercet: "a group of three lines of verse, usually rhyming together",
    quintain: "a post or target set up to be charged at with a lance in jousting practice",
    anaphora: "repeating the same word or phrase at the start of several lines or sentences for effect",
    holdup: "a delay that stops something going ahead as planned",
    humus: "dark, rich, crumbly soil made from rotted leaves and other plant matter",
    equipping: "supplying a person or place with the tools and gear needed for a task",
    homosexual: "attracted to people of the same sex",
    gay: "light-hearted and full of cheerful high spirits; also, attracted to people of the same sex",
    bondage: "the condition of being held as a slave or kept under another's harsh control",
    jezebel: "a shameless or scheming woman, from a queen in an old story",
    stripper: "a chemical used to remove old paint or varnish from a surface",
    strippers: "chemicals used to remove old paint or varnish from surfaces",
    straight: "going in one direction without a bend, curve or turn",
    hunks: "large, thick, roughly cut pieces of something",
    nag: "to keep finding fault with someone, or to pester them again and again",
    loggerheads: "at loggerheads means in stubborn disagreement with someone",
    crippled: "badly damaged so that something can no longer work properly",
    tomahawks: "light throwing axes once used as tools and weapons by some Native American peoples",
    muggers: "people who rob someone by threatening them in a public place",
    fondling: "stroking or handling something gently and affectionately",
    kissing: "touching someone with the lips as a sign of love, greeting or respect",
    cuddling: "holding someone close in your arms in a warm, affectionate way",
    max: "the greatest amount or the highest point something reaches",
    chromatic: "to do with colour; in music, using notes outside the ordinary scale",
    grassed: "covered over with growing grass",
    naughty: "behaving badly or disobediently, especially of a child",
    slough: "to shed or cast off an outer layer, as a snake sheds its skin",
    idolatry: "the worship of idols; also, admiring someone far too much",
    liturgy: "the set form of words and actions used in a public religious service",
    ontology: "the branch of philosophy that studies what it means for something to exist",
    tabernacle: "a tent or hut used as a place of worship; also, a container for sacred objects",
    existential: "to do with existence and with what it means to be alive",
    frightful: "very unpleasant, shocking or alarming",
    spicer: "a person who deals in or prepares spices",
    quiches: "open pastry tarts filled with a savoury mixture of eggs, cream and cheese",
    acumen: "sharpness of judgement; the ability to make good decisions quickly",
    pragmatic: "dealing with things in a practical way rather than by fixed theory",
    doubtful: "uncertain, or unlikely to be true or to happen",
    tractable: "easy to control, manage or persuade",
    manipulable: "able to be handled, shaped or controlled",
    amiable: "friendly, good-natured and pleasant to be with",
    committees: "groups of people appointed to meet, discuss and decide on a matter",
    immaculate: "perfectly clean, tidy and without a single mark or fault",
    audible: "loud enough to be heard",
    audibles: "sounds or calls loud enough to be heard",
    burgers: "flat round cakes of minced meat or vegetables, usually served in a bun",
    wieners: "long thin smoked sausages, often eaten in a soft roll",
    syndicate: "a group of people or firms who join together to run a business or project",
    halcyon:       'calm, peaceful and happy; often used of a golden, carefree time.',
    cuckoo:        'a grey European bird known for its two-note call and for laying eggs in other birds’ nests.',
    graham:        'a coarsely ground whole-wheat flour, or the slightly sweet cracker made from it.',
    maiden:        'a young unmarried woman; also means the very first of its kind, as in a first voyage.',
    insulate:      'to cover or surround something so heat, cold, sound or electricity cannot pass through easily.',
    cranberry:     'a small, round, sour red berry that grows on a low shrub in wet, boggy ground.',
    idle:          'not active or in use; resting, or running slowly without doing real work.',
    domino:        'a small flat tile marked with dots, used in a tile-matching game; also a knock-on chain reaction.',
    contradictory: 'saying the opposite; describing two statements that cannot both be true at once.',
    demonstrable:  'able to be clearly shown or proven to be true.',
    agglutinate:   'to firmly stick or fuse separate parts together into a single mass.',
    sufficience:   'the state of having as much as is needed; enough of something.',
    conjecture:    'an opinion or guess formed on little or no proof; to guess from scanty evidence.',
    lubricate:     'to apply oil or grease so parts slide and move smoothly with less friction.',
    empty:         'holding nothing inside; containing no contents at all.'
  });

  var removed = 0, sPatched = 0, dPatched = 0;
  for (var i = D.nsf.length - 1; i >= 0; i--) {
    var e = D.nsf[i]; if (!e || !e.w) continue; var w = nk(e.w);
    if (REMOVE[w] || isNumeral(w, e.d)) { D.nsf.splice(i, 1); removed++; continue; }
    if (SENT[w]) { e.s = SENT[w]; sPatched++; }
    if (DEF[w])  { e.d = DEF[w];  dPatched++; }
  }
  // (debug) window.__wordsPatch = {removed:removed, sPatched:sPatched, dPatched:dPatched};
};
window.SB_WORDS_PATCH();
