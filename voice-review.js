/* ============================================================
   VOICE-REVIEW.js — the human-in-the-loop voice QA queue.
   Powers Settings → "Word Voice Tester".

   • SB_VOICE_PRIORITY : words to test first, highest-value first
     (common + tricky-to-pronounce + previously-flagged). The tester
     appends the child's own study words after these.
   • SB_VOICE_REVIEW   : words Claude has just REBUILT and that need a
     fresh listen. They surface in the tester's "Re-review" tab.
     Claude edits this array (and regenerates voice/w/<word>.mp3) each
     time it processes a batch of flags exported from the app.

   Round-trip: tester exports flagged words (voice-flags.json) → Claude
   rebuilds the clips + moves those words into SB_VOICE_REVIEW → the app
   shows them under Re-review for the parent to confirm.
   ============================================================ */
(function () {
  // Bumped every voice rebuild round — voice-cdn.js appends this to clip URLs so
  // browsers and the raw CDN can never serve a stale clip after a deploy.
  window.SB_VOICE_VER = 'g2-20260725';
  // Words Claude has processed since the last round — re-listen to confirm.
  // (Claude appends {w, note} entries here as it processes flag batches.)
  // Batch 3 (2026-07-22, overnight): FULL Kokoro rebuild — the model is now hosted on
  // this repo's "kokoro-model-v1" release, so everything queued was re-synthesized in
  // the library voice (af_heart) and WV_BAD is empty again:
  //   • the 33 flagged words — rebuilt fresh. The 14 short ones whose re-synth came out
  //     byte-identical to the bad clip (Kokoro is deterministic) were re-run with a
  //     changed input ("word" without the trailing dot) and verified to differ.
  //   • ~840 scan-detected truncated/garbled clips (e.g. "hotel" was 0.09s) — rebuilt;
  //     every clip re-verified acoustically (speech span sane, no stray segments).
  //   • the 451-word legacy 0.92× short-word batch (cat, dog, sun…) — re-synthesized at
  //     current params so the whole library is one consistent voice and speed.
  // Batch 5 (2026-07-22, round 4): the 15 words that kept their artifact through three
  // different af_heart inputs were rebuilt with VOICE-VECTOR BLENDS — Kokoro style
  // interpolation, 70% af_heart + 30% of a sibling voice (bella/sarah/nova), chosen per
  // word by automatic scoring against never-flagged rhyme siblings. They may sound very
  // slightly different in timbre from the rest of the library; that is the trade for
  // killing the artifact. The 12 newly flagged garbled words (enchantment "click click",
  // moisture "ture"…) were re-synthesized normally, plus a library-wide garble scan
  // rebuilt 97 more (mostly French-origin — see the new 🇫🇷 French tab to audit that
  // whole cohort).
  // === GOOGLE TTS MIGRATION (2026-07-23) ===
  // The ENTIRE word library (all 41,136 clips) was regenerated with Google Cloud
  // Text-to-Speech (voice en-US-Neural2-F, 0.95 rate). Kokoro is retired for word
  // clips; WV_BAD is empty (no word needs the device fallback anymore). The saga
  // dialogue / concept clips stay on Kokoro (voice/pipeline/ scripts kept).
  // Below: the 45 words that ever gave Kokoro trouble — all now Google, listed for a
  // victory-lap listen. Flag anything that still sounds off and it's a one-word
  // Google re-gen with SSML phoneme control (deterministic, no more roulette).
  window.SB_VOICE_REVIEW = (window.SB_VOICE_REVIEW || []).concat(
    ["peach","pole","dub","eve","onion","won","who","tub","tip","spa","six","sip","saw",
     "paw","pub","rub","olive","cog","tomb","vegetable","yacht","umbrella","glue","grand",
     "blank","brave","hotel","proof","raisin","forage","cuckoo","lionize","emperor",
     "blemish","chowder","furtive","pedigree","pilferer","moisture","companion",
     "enchantment","dauntlessly","loyal","verve","gabled"]
    .map(function(w){ return {w:w, note:"now Google TTS (Neural2-F)"}; })
  );

  // === QUOTES ENRICHMENT VOICING (2026-07-25) ===
  // 831 difficult words tapped in quote popups + new rare words (visagiste,
  // petrichor, saudade…) were voiced with Google TTS (Neural2-F, 0.95). Listed here so a
  // parent can victory-lap them under Re-review; flag any for a one-word SSML re-gen.
  window.SB_VOICE_REVIEW = (window.SB_VOICE_REVIEW || []).concat(
    [
     "ablaze", "abound", "abroad", "absent", "absorb", "aching", "adapt", "adieu", "admire", "afoot", "agendas",
     "aghast", "agony", "alderman", "algebraic", "algorithms", "alloy", "amber", "anchored", "anthill", "aplomb",
     "apparelled", "apply", "apricity", "ardor", "arena", "arise", "ashes", "ashore", "aspect", "assault", "asset",
     "assume", "athwart", "auld", "awake", "awareness", "azure", "babble", "balm", "bangle", "bankruptcy",
     "banner", "bark", "barley", "barter", "beamish", "beams", "bears", "beast", "beehive", "befalls", "belittle",
     "bell", "bend", "beset", "beside", "betray", "beware", "bield", "bill", "billow", "billows", "binds",
     "birches", "bitter", "blanched", "blast", "blaw", "bleak", "blesseth", "blessing", "blessings", "blest",
     "bliss", "blossoms", "bluebell", "blushes", "boards", "boisterous", "boldness", "bond", "bonny",
     "bookkeepers", "borogoves", "bosom", "boughs", "bound", "boundless", "bower", "bowers", "bows", "breast",
     "breeds", "brief", "brier", "brillig", "brine", "brocades", "broth", "brow", "bruxism", "buckles", "bugle",
     "bund", "burdens", "burthen", "butting", "cabbages", "cackle", "camerado", "canoe", "canst", "canvas",
     "careless", "carols", "carriage", "carven", "carves", "cast", "caution", "caverns", "cease", "ceasing",
     "chaliced", "chamber", "charging", "cherish", "chervil", "chide", "chill", "chirping", "chortled",
     "christened", "clasps", "climes", "cling", "clings", "cloak", "coaster", "cock", "cocked", "cocksure", "coco",
     "cohorts", "collywobbles", "commence", "comrade", "conceive", "confine", "conflict", "conquer", "conserve",
     "console", "constant", "consummation", "content", "conviction", "coral", "cornerstone", "coromandel", "couch",
     "counselled", "counterpane", "coursers", "coward", "cowrin", "cowslip", "cradle", "cradles", "crag",
     "crannied", "crannies", "creatures", "crept", "crimson", "critic", "crown", "crucial", "cunningly", "curl",
     "curlew", "curtsied", "customs", "cypress", "dainties", "dale", "dales", "dame", "damsel", "dare", "dares",
     "daring", "darkling", "dawn", "debates", "decay", "deck", "decree", "deeds", "defeats", "deferred",
     "definiteness", "delight", "delights", "depth", "deride", "desire", "despise", "destined", "destiny",
     "device", "dignity", "disguise", "disown", "distilled", "distort", "ditches", "diverge", "diverged",
     "doleful", "doomed", "doozy", "dost", "doth", "downy", "dread", "dreary", "droppeth", "dumpling", "dwell",
     "dwelling", "dwells", "dwelt", "ease", "echoes", "eddying", "eldritch", "emerald", "empower", "endure",
     "endured", "engraved", "engraving", "ensnares", "entire", "envy", "enwrought", "err", "eternal", "ethical",
     "eureka", "exacts", "exhausts", "exits", "faery", "fahrvergnugen", "fair", "false", "fancy", "fatal",
     "fathom", "favor", "fell", "fernweh", "ferny", "ferry", "fervour", "festers", "fetch", "fetching", "fiddle",
     "fiddlers", "fireflies", "flagons", "flake", "fleece", "fleeing", "fleets", "flibbertigibbet", "flight",
     "flint", "flits", "flourish", "fluttering", "foam", "fold", "folds", "ford", "foretells", "forge", "forged",
     "forlorn", "forsaking", "foster", "frabjous", "fragments", "frail", "frame", "frankness", "friction",
     "fright", "frittered", "frontier", "frontiers", "frosty", "frothing", "froward", "frumious", "fulfilment",
     "furry", "gate", "gatekeepers", "gay", "gazing", "gesundheit", "glaciers", "glade", "glee", "glens",
     "glittering", "glitters", "glory", "goads", "gobblefunk", "goodly", "gouache", "graces", "grain", "granite",
     "granted", "greed", "greenwood", "grief", "grit", "grumble", "gyre", "harbor", "hardly", "hardships", "hares",
     "hark", "harness", "harvest", "hastens", "hath", "haunches", "heather", "hedges", "heed", "hemlock",
     "heralds", "hindsight", "hiraeth", "hold", "homage", "honour", "hooked", "horn", "horrid", "host",
     "hullabaloo", "humble", "humbly", "hump", "hush", "icicle", "ideals", "idleness", "impact", "impulse",
     "inclined", "indulge", "inflate", "ingratitude", "inherit", "inspire", "intrudes", "isles", "jade", "jolted",
     "jostling", "ken", "kerfuffle", "kindle", "kindled", "kindling", "kola", "kummerspeck", "labor", "ladles",
     "ladybird", "lame", "lament", "lane", "lark", "larks", "lavish", "lea", "lease", "leave", "leerie", "legends",
     "lengthen", "liberty", "lighthouse", "lilacs", "limbs", "limp", "limpid", "limping", "lo", "loaf", "loafe",
     "loitering", "lollapalooza", "longing", "lore", "loveliness", "loveth", "lower", "lullaby", "luve", "maid",
     "main", "majesty", "mare", "margin", "mariner", "marks", "marveled", "mastery", "mead", "meadow", "meanest",
     "measureless", "mechanics", "melilot", "melodie", "mercies", "merely", "merrily", "merriment", "merry",
     "mickle", "midnight", "milestones", "mimics", "mimsy", "mingle", "mingled", "mint", "mists", "misty", "moan",
     "moccasins", "moisty", "moor", "morn", "mortals", "moss", "mossy", "motionless", "moulds", "mournfully",
     "muckle", "mulberry", "muses", "musket", "muster", "mute", "nail", "native", "niche", "nightgown",
     "nightingale", "nile", "nobler", "nonsense", "noonday", "norwich", "numberless", "numbers", "numinous",
     "nursling", "nutmeg", "oaks", "obscures", "oft", "onward", "optimist", "ornithologist", "outgrabe",
     "overalls", "overmatch", "overtops", "owlet", "pace", "pack", "pail", "pale", "palely", "pangs", "passion",
     "passions", "pasture", "pastures", "pathless", "pause", "pawn", "pebble", "peered", "pent", "perch",
     "perchance", "perches", "peril", "petrichor", "phoebus", "pied", "pieman", "piety", "pillars", "pine",
     "pitcher", "placid", "players", "playfellows", "pleasanter", "pleasantest", "plods", "plum", "pobble",
     "policy", "pondered", "poppy", "pouring", "prairies", "prancing", "prayeth", "precedes", "prest", "presume",
     "prevails", "prick", "prized", "profoundness", "profuse", "proofs", "prosper", "protege", "purse", "pursue",
     "pursuit", "quarrel", "quicken", "quince", "rack", "radical", "rage", "rages", "ranged", "rapping", "reap",
     "reaping", "reaps", "reckoned", "reddens", "reed", "refrains", "regrets", "rehearsal", "reigns", "rejoice",
     "rejoiced", "rejoices", "relief", "relished", "remedy", "rendered", "renders", "repay", "resolve", "restless",
     "restore", "retired", "revels", "revery", "ripe", "ripening", "ripens", "ripples", "risque", "rites", "roam",
     "rosy", "rounded", "roving", "rubles", "ruby", "rued", "rumpus", "runcible", "rural", "rusts", "rut", "sadhu",
     "sages", "saudade", "save", "scale", "scan", "scarce", "scatter", "scattered", "scorn", "secretaire", "sedge",
     "seeker", "seeketh", "sessions", "shackles", "shade", "shades", "shalt", "shattered", "sheath", "sheen",
     "shell", "sheltered", "sheltering", "shimmering", "shoot", "shrink", "shun", "sift", "silk", "sinewy",
     "sixpence", "skims", "slander", "sledges", "sleekit", "sling", "slings", "slithy", "slumbers", "smith",
     "smorgasbord", "snaw", "snoring", "soaring", "solely", "solitude", "solitudes", "soothed", "sorrow", "sought",
     "soul", "soundly", "source", "sparrow", "spears", "spied", "splendid", "splendour", "sport", "sprachgefuhl",
     "spread", "sprightly", "springest", "sprite", "spur", "stalactite", "startling", "stately", "staunch",
     "stedfast", "steeples", "steer", "steersmen", "still", "stingy", "stirring", "stockings", "stoop", "stray",
     "strewn", "stricken", "strive", "striving", "struggle", "struggles", "stump", "subdued", "subject", "sublime",
     "summits", "suppose", "surf", "surpass", "swallows", "swarm", "sways", "swift", "swiftly", "tact", "tadpole",
     "tamed", "tangled", "tattered", "temperate", "tender", "thee", "thickset", "thine", "thirsting", "thistles",
     "thorn", "thorns", "thou", "thoughtless", "threshold", "thrives", "thrust", "tidings", "tiller", "titania",
     "toil", "token", "tolls", "torment", "toss", "touche", "trackless", "trade", "trailing", "traitors",
     "traversed", "tread", "trembler", "trial", "trials", "triumph", "triumphs", "trunkless", "tumult", "tureen",
     "twilight", "twinkle", "uffish", "unaware", "unconquerable", "underrate", "undertake", "undone", "unfurled",
     "unheard", "union", "united", "unjust", "unmasked", "unpremeditated", "unraveling", "unruly", "unto",
     "untrodden", "upright", "urgent", "usher", "utter", "uttered", "vacant", "vain", "vale", "vales", "vapours",
     "varied", "vastness", "vats", "velleity", "venture", "ventures", "vernal", "verse", "vexes", "vibrates",
     "vices", "vigor", "violet", "virtue", "virtues", "visagiste", "vital", "voila", "volumes", "wacky", "wafted",
     "wagging", "wand", "waned", "ware", "wattles", "weave", "weeping", "wert", "whence", "whist", "whiting",
     "wholesome", "whoso", "widdershins", "wigwam", "wilderness", "willpower", "wind", "winna", "wise", "woeful",
     "wonder", "wondrous", "wood", "woods", "wool", "worth", "woven", "yawp", "ye", "yearnings", "yield", "yon",
    ].map(function(w){ return {w:w, note:"quotes enrichment — Google TTS"}; })
  );

  // Highest-priority QA queue. Short/plosive-initial/final-vowel words are the
  // most prone to truncation, so they lead; then common tricky pronunciations.
  window.SB_VOICE_PRIORITY = (
    // recently reported as wrong — verify first
    "soda stubble cricket january olive robin feats peach pole " +
    // short words (truncation-prone)
    "pole ole ace age ago aid aim air ale ant ape arc ark arm art ash ask " +
    "bad bag ban bat bay bed bee beg bet bid big bin bit boa bog bow box boy bud bug bun bus but buy " +
    "cab cap car cat cob cod cog cop cot cow cry cub cup cut dad dam day den dew did dig dim din dip " +
    "doe dog dot dry dub dug dye ear eat eel egg elf elk elm end eve ewe eye fan far fat fax fed fee " +
    "few fig fin fir fit fix flu fly foe fog for fox fry fun fur gap gas gem get gig gum gun gut guy " +
    "ham hat hay hen hid him hip hit hoe hog hop hot how hub hue hug hum hut ice icy ill ink inn ivy " +
    "jab jam jar jaw jay jet jig job jog jot joy jug keg key kid kin kit lab lad lap law lay led leg " +
    "let lid lip lit log lot low mad man map mat may mob mod mom mop mud mug nap net new nib nil nip " +
    "nod nor not now nun nut oak oar oat odd off oil old one orb our out owl own pad pal pan pat paw " +
    "pea peg pen pet pie pig pin pit pod pot pox pry pub pug pun pup rag ram ran rap rat raw ray red " +
    "rib rid rig rim rip rob rod rot row rub rug rum run rye sad sag sap sat saw say sea see set sew " +
    "she shy sip sir sit six ski sky sly sob sod son sow soy spa spy sty sub sue sum sun tab tag tan " +
    "tap tar tax tea ten the thy tie tin tip toe ton too top tow toy try tub tug two use van vat vet " +
    "vex via vie vow wad wag war was wax way web wed wet who why wig win wit woe wok won wow yak yam " +
    "yap yaw yes yet you zap zip zoo " +
    // common tricky-pronunciation words
    "answer autumn beauty biscuit business castle colonel comfortable debt dessert " +
    "doubt eight enough favourite february flavour foreign gauge ghost giraffe guard " +
    "height honest island jewel knead knee knife knock know knuckle lamb listen " +
    "muscle nephew ocean often onion parliament pizza plumber pneumonia queue " +
    "receipt rhyme rhythm salmon scent science scissors sign special stomach subtle " +
    "sword thorough thumb tomb tongue tortoise vegetable weird wednesday wrist wrong yacht " +
    "bicycle calendar caterpillar chocolate cinnamon crocodile dinosaur elephant " +
    "envelope hospital library necessary October opposite restaurant sandwich " +
    "square strawberry telephone temperature umbrella universe volcano watermelon"
  ).split(/\s+/).filter(function (w, i, a) { return w && a.indexOf(w) === i; });
})();
