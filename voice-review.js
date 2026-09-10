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
  window.SB_VOICE_VER = 'g4-20260905';
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

  /* Batch 6 (2026-09-05): the 2,055 words that had no recording at all.
     They are not rebuilds — nothing was wrong with them. Recalibrating the
     difficulty bands grew the SERVED corpus from 40,944 words to 55,000, and
     these are the ones promoted into it out of the wider library, where a clip
     had never been cut. Synthesized with the library's own settings
     (en-US-Neural2-F, speakingRate 0.95, MP3 24kHz mono) and verified to carry
     the identical MPEG2 Layer 3 / 112kbps / 24000Hz / mono frame header as the
     clips already shipping, so there is no audible seam mid-drill.
     They skew hard: 977 are band 9, 643 band 8, 320 band 7 — the champion end,
     which is exactly where a parent should listen first. */
  window.SB_VOICE_REVIEW = (window.SB_VOICE_REVIEW || []).concat(
    ["abhisheka","aboulomania","abreaction","abyssopelagic","acanthopterygian","acatalepsy",
     "accelerando","acciaccatura","accompagnato","achondrite","acroterion","actinograph",
     "actinolite","actinopterygian","acupressure","adaptogen","adenohypophysis","aebleskiver",
     "aerenchyma","aerography","aethalium","affettuoso","agar-agar","aggiornamento",
     "agglutinative","agistment","agnotology","agrammatism","agroforestry","agrometeorology",
     "agrostology","ailuranthropy","albarello","alchemical","alchemilla","alexandrite",
     "alexithymia","algorismic","alienability","alkekengi","allantoin","allargando",
     "allochromatic","allochthonous","allomorphy","allosterism","almacantar","alpenglow",
     "alpenstock","altimetry","altiplano","aluminosilicate","amakudari","ambergris",
     "amblygonite","amigurumi","ampelography","amphibolite","amphidromic","amphimacer",
     "amphisbaenian","amygdaloidal","amyloplast","anamorphosis","anandamide","anastrophe",
     "anchoritic","anemochorous","anemograph","anemography","anemometry","anemophilous",
     "anemoscope","angiosperm","angiospermous","angklung","angwantibo","anisochronous",
     "anisodactyl","anisotropy","ankylosaur","anomalistic","anomalocaridid","anopisthographic",
     "anorthosite","anosognosia","anschauung","antahkarana","anthemion","antheridium",
     "anthimeria","anthropocentrism","anthropometry","anthropomorphization","anthroponymy",
     "anticyclonic","antiemetic","antimacassar","antimension","antinomianism","antiphonary",
     "antitussive","antonomasia","apabhramsha","apeirogon","aphaeresis","aphantasia",
     "apheresis","apiculture","apocatastasis","apocynthion","apogalacticon","aponeurosis",
     "apophenia","apophyllite","aposematism","apothecium","appassionato","appendicular",
     "apperception","appressorium","aquamanile","aquarellist","arachnological","arachnology",
     "arachnophobia","arboriculture","archaeopteryx","archegonium","archibenthic",
     "architectonic","archivolt","argentiferous","argillaceous","aristophanean","arlecchino",
     "arpeggiation","arpeggiato","arsenopyrite","artoklasia","ascomycete","ascomycetous",
     "ashwagandha","associativity","asteroseismology","asthenosphere","astrochemistry",
     "athalassic","auriferous","autocatalytic","aventurine","averroism","aviculture",
     "axiological","axiomatization","ayacahuite","ayurvedic","azeotropic","backwardation",
     "baitcaster","baitcasting","balangay","balchatri","baldacchino","baleboste","balebosteh",
     "balikbayan","balisong","ballotade","bambara","bancassurance","banderole","bandoline",
     "bandurist","bangsawan","bantingism","barbotine","baroclinic","barometrograph",
     "barotropic","barquentine","barracouta","barratrous","barycentric","baryogenesis",
     "basidiocarp","basidiomycete","basilectal","bathymeter","bathyscaphe","bathysphere",
     "batiushka","batrachology","bayanihan","behemothic","belomorite","beltane","benthopelagic",
     "bergamasca","bharatanatyam","bhujangasana","bianchetto","bibliomania","bibliopegy",
     "bibliotheca","bibliotherapy","bilgewater","bintangor","biquaternion","birefringence",
     "bivouacking","bizcochito","blacksmithing","bocconcini","bodhisattva","boerenkaas",
     "boerewors","bogatyr","bogolanfini","bohereens","bolection","bopomofo","borosilicate",
     "bosthoon","botryoidal","bourdaloue","brachiation","brachistochrone","brachycatalectic",
     "brachydactylous","brachylogy","brahmacharin","brahmanda","brahminical","bramantesque",
     "branchiopod","branchiostegal","brassicaceous","bretessed","brigadeiro","brilliantine",
     "brisingamen","broadcloth","bronchiole","brontometer","brontothere","bubinga","bucranium",
     "bullionism","bushmaster","cabotinage","cacciatore","caciocavallo","cacographical",
     "cacography","cacomistle","cailleach","cajeput","cajuputol","calamansi","calcedonio",
     "caliology","calorimetry","calyptrogen","camanachd","cambistry","cameralism","camouflet",
     "campanelle","campanulate","campesino","camphorate","camphorwood","campilan","cancellans",
     "canchalagua","candareen","candombe","candomble","cangiante","cantilena","cantilever",
     "cantiniere","capercaillie","capodimonte","capoeirista","caponniere","capriccioso",
     "carabineer","caravanserai","carburization","carpophore","carrageenan","cartelization",
     "cartisane","cartogram","cartonnage","casehardening","cassimere","cassiterite",
     "cassolette","cassoulet","castellation","castoreum","castrametation","catacaustic",
     "cataclasite","cataclastic","catadioptric","catadromous","catalectic","catallactics",
     "cataphract","cataplexy","catechumen","cathemeral","cathetometer","catoblepas","caubeen",
     "cauliflorous","cavaletti","cavalletti","ceilometer","centaurian","centerboard",
     "centrepin","centrifugation","cephalothorax","ceratopsian","cerography","certiorari",
     "certosina","chachalaca","chaetognath","chakalaka","chakravartin","chalcography",
     "chalcophile","chalcopyrite","chalicothere","chalitzah","chamfrain","changeling",
     "changshan","chanteuse","chanticleer","charmeuse","chartalism","charterparty","chashitsu",
     "chassidim","chaudfroid","chaufferette","chautauqua","chawanmushi","chazzerai",
     "chelicerae","chelicerate","chemiluminescence","chemiosmosis","chemisette","chemocline",
     "cherkeska","cherubikon","chevauchee","chevelure","chevrette","chevronel","chicharron",
     "chichimec","chiliagon","chilipiquin","chiltepin","chinampa","chinquapin","chintamani",
     "chirography","chiropteran","chivalrous","chocolatier","chocolatl","cholecystokinin",
     "chondrichthyan","chondrocyte","chordophone","chorography","choropleth","chowhound",
     "chowkidar","chrematistics","chrismation","christophany","chromoplast","chromosphere",
     "chronobiology","chronogram","chronometry","chronopher","chronostasis","chrysocolla",
     "chrysography","chrysoprase","chrysotile","chupacabra","churrascaria","churrasco",
     "cinquecento","cinquefoil","circumambulation","circumbendibus","circumlocutionary",
     "circumstellar","circumvallation","citronellol","clachan","cladophyll","clafoutis",
     "clarsach","claustrophilia","cleistogamous","cleistogamy","cleistothecium","clepsammia",
     "clinomania","clinometer","clinopyroxene","cliometrics","cluricaune","clurichaun",
     "coatimundi","cocciopesto","coccolithophore","cockatrice","cohomology","coldworking",
     "coleopteran","coleopterist","collenchyma","collography","colonnaded","columbier",
     "combinatorics","commissariat","commodification","commoditization","commutativity",
     "compartmentalization","compatibilism","compositor","comstockery","conceptualism",
     "concertante","conchoidal","conchology","concurrency","condottiere","conidiophore",
     "consanguineousness","consanguinity","consequentialism","consonance","consubstantiation",
     "contango","contourne","contrabandist","contradistinction","contravallation","contredanse",
     "coparcenary","copernicium","coquillage","coracoidal","cordwainer","cordyceps",
     "coronagraph","corsetiere","cosmatesque","cosmochronology","cosmogonical","cosmonautics",
     "cosmopolite","costermonger","costochondral","cotyledonary","courbette","coyotillo",
     "creamware","crenellated","cristallo","crizzling","crorepati","crossopterygian",
     "croupiere","cryoenzymology","cryptanalysis","cryptodire","cryptoeconomics","cryptogamic",
     "cryptomnesia","crystalloluminescence","ctenophore","cuisinier","cuitlacoche",
     "cupellation","cupriferous","curandero","cyanobacteria","cyanometer","cyanotype",
     "cyberinfrastructure","cyberneticist","cyclogenesis","cyclothymia","cymatology",
     "cymometer","cymophane","cynghanedd","cynocephalous","cynocephalus","cytoskeleton",
     "dactyloscopy","danegeld","dannebrog","daodejing","decalescence","decolletage",
     "decontextualization","deerstalking","defalcation","defeasance","deinotherium","delftware",
     "deliquescence","demiurgic","dendrochronological","dendroclimatology","dendrology",
     "depersonalization","derealization","dermapteran","descamisado","desyatina","deuterostome",
     "dharamsala","dharmachakra","dharmashastra","diacaustic","diadromous","diagenesis",
     "dialectology","dialetheism","diaphragmatic","diarthrosis","diastereomer","diathermancy",
     "diathermanous","diatomaceous","diazotype","dibitag","dichotomous","dichroscope",
     "dicotyledon","dictyopteran","dicynodont","diffeomorphism","differenced","digambara",
     "diglossia","dilatometer","dimetrodon","dimidiation","dinoflagellate","diophantine",
     "diphthongization","dipleidoscope","dirigisme","discriminant","dispensationalism",
     "dispensatory","disproportionality","divertissement","dopaminergic","dostoevskian",
     "doxography","doxological","dromaeosaurid","dromomania","ducatoon","duodecimo",
     "dyophysite","dyscalculia","dysgraphia","dysmetropsia","dysmorphia","earthstopper",
     "ebullioscope","ebullioscopy","ecdysozoan","echocardiogram","echopraxia","ectomycorrhiza",
     "ectothermic","efflorescence","efflorescent","einfuhlung","einherjar","elasmobranch",
     "electrochromic","electrodeposition","electroencephalogram","electroluminescence",
     "electrometeor","electrophoretic","electrowinning","emakimono","emblazonry","embrocation",
     "emphyteusis","enantiomorph","enantiomorphism","encapsulation","enchainement","encomienda",
     "endergonic","endogeneity","endomorphism","endoplasmic","engrailed","enigmatology",
     "enneadecagon","enokitake","enseaming","enstatite","enthymematic","entomophagous",
     "entomophilous","entremetier","envelopment","enzymology","epanalepsis","epeirogenic",
     "epeirogeny","ephemerides","ephemeroptera","epicardium","epicheirema","epiclesis",
     "epicureanism","epicycloid","epiglottis","epilimnion","epimeliad","epimerization",
     "epimorphism","epiphyllous","epistemophilia","epithermal","epitrachelion","epizeuxis",
     "equipollence","eremitical","eructation","erziehungsroman","escargotiere","espagnolette",
     "espressivo","espringal","esthetician","ethnomusicology","etiolation","euchologion",
     "eudaemonistic","eudaimonia","eudaimonism","eudiometer","euryhaline","eurypterid",
     "eurythermal","eutrophication","evangeliary","evapotranspiration","excipient","exegetical",
     "existentialism","exoplanetary","extraterritoriality","falsifiability","farinaceous",
     "fasciculation","fazzoletto","feiseanna","felsenmeer","fenghuang","fengshui","fermionic",
     "ferrocerium","ferronniere","fertigation","festschrift","fetterlock","fibreglass",
     "fideicommissum","figurante","filibeg","filoplume","fimbulwinter","financialization",
     "fingerling","flamberge","flanchard","flapdoodle","flerovium","fleuretty","flexography",
     "floriculture","flugelhorn","fluorochrome","fluorometer","fluorometry","fluorophore",
     "folkloristic","foraminifera","forecastle","forgeability","fourragere","frangipani",
     "fricandeau","frontispiece","fructescence","frugivorous","frumentaceous","fungibility",
     "furigana","furoshiki","gabionade","gallabiya","gallinazo","gallopade","galvanization",
     "galvanometer","galvanoscope","gametophyte","gandharva","garbhagriha","garimpeiro",
     "gastrocnemius","gastrolith","gendarmerie","genmaicha","gentilesse","genuflection",
     "geomorphological","geospatial","geostrophic","geosynchronous","geosyncline",
     "gesamtkunstwerk","geyserite","giallolino","gianduiotto","gigantomachy","gilliecallum",
     "ginkgoales","ginnungagap","ginsenoside","gjallarhorn","glauconite","glossophobia",
     "gluconeogenesis","glycogenolysis","glycolysis","glyptodont","glyptography","gnomonics",
     "goldsmithery","gombeenman","gopherwood","gorgoneion","gorsedd","gorseddau","grammatology",
     "granadilla","granoblastic","graptolite","gravadlax","gravitropism","graywacke",
     "greenheart","gremolata","grotesquerie","groundbait","guberniya","guitarron","guttation",
     "guzheng","gymnophiona","gymnosperm","gymnospermous","haberdasher","habiliment",
     "habromania","hacendado","hadopelagic","hadrosaurid","haggadoth","halakhist","halocline",
     "hamantaschen","hamartiology","hanamichi","harambee","hardanger","hardenability",
     "hartebeest","hasenpfeffer","hashigakari","hastilude","haubergeon","haustorium",
     "hearthstone","heiligenschein","heimskringla","heliograph","heliometer","heliopause",
     "helioseismology","heliosphere","heliotropic","heliotropism","hemimetabolous",
     "hemimorphic","hepplewhite","hereditament","herpetofauna","hesperides","hesychasm",
     "heterodactyl","heterological","heterorganic","heteroscedastic","hichiriki","hierophany",
     "hinamatsuri","hippalectryon","hippogriff","hiragana","hobbledehoy","holometabolous",
     "holomictic","holomorphic","holothurian","homeomorphism","homoioteleuton","homoiousian",
     "homomorphic","homoousian","homoousion","homothetic","hooliganism","hoomalimali",
     "horlogerie","hornswoggle","horologiography","horologium","horripilation","houndstooth",
     "houppelande","hulubalang","hutchinsonite","hyaloclastite","hyalography","hyaluronic",
     "hyetograph","hyetography","hygrometry","hygroscopic","hygrothermograph","hylomorphism",
     "hylozoism","hymenophore","hymenopteran","hymenopterous","hyperboloid","hyperinflation",
     "hyperlexia","hypermetropia","hypermnesia","hyperphantasia","hyperthymesia",
     "hypervelocity","hyphopodium","hypnopompic","hypochondriasis","hypostasis","hypostatic",
     "hypostatize","hypsographic","hypsography","ichnotaxon","ichthyocentaur","ichthyosaur",
     "iconodule","iconostasis","idempotent","ideographic","ideographical","ideomotor",
     "idiochromatic","idiolectal","illiquidity","impalement","inadmissibility",
     "incomprehensibility","incontrovertibility","incorporeal","increscent",
     "indistinguishability","inescutcheon","infructescence","institutionalization",
     "intarsiatura","integumentary","interdenominational","interferometry","interrobang",
     "intramuscular","ipecacuanha","ironmaster","ironmongery","ironworker","isagogics",
     "isallobar","isallobaric","isarithmic","isicathamiya","isobathic","isoceraunic",
     "isochronism","isochronous","isodrosotherm","isoelectronic","isoglossal","isohyetal",
     "isomerization","isomorphous","isoplethic","isopterous","isopycnal","ispravnik",
     "istoriato","jabuticaba","jaguarundi","jasperware","jelutong","jinrikisha","jokulhlaup",
     "jotunheim","jugendstil","juxtaglomerular","kabbalist","kachumbari","kadomatsu",
     "kaitiakitanga","kalachakra","kamaaina","kamaboko","kamagong","kamidana","kapellmeister",
     "katsuobushi","katzenjammer","keeshonden","keratinocyte","keraunograph","keroncong",
     "kerygmatic","khokhloma","khrushchevka","kibbitzer","kigelia","kimberwicke","kimblewick",
     "kinematics","kinesthesia","kinetography","kinnikinnick","kintsugi","kistvaens","kitenge",
     "kizomba","klangfarbe","klezmorim","klipspringer","knackwurst","kneidelach",
     "knickerbocker","koeksister","koinobori","kokoshnik","kolkhoznik","kompromat",
     "konzertmeister","korimako","korrigum","krakowiak","krasnozem","kremlinology","kulintang",
     "kunstlerroman","kushiyaki","kusimanse","kwanzaa","labyrinthodont","lacrimation",
     "lagerstatte","laksamana","lamarckian","lambdacism","lambrequin","lamington","landlubber",
     "landsmanshaft","landsting","langoustine","largamente","latifundio","latissimus",
     "latticinio","lebkuchen","lectionary","leechcraft","lepidoblastic","lepidolite",
     "lepidopteran","lepidopterist","lepidopterology","lepidotrichia","lethologica",
     "lexiphanic","lighterman","lignocellulose","lingonberry","lipogrammatic","lissamphibian",
     "lithification","lithometeor","lithophane","livingstonite","lixiviation","logaoedic",
     "logotherapy","lokayukta","longshoreman","loutrophoros","lughnasadh","luminaria",
     "lusingando","lutestring","lyophilization","lysimeter","macanese","macapuno","macchiaioli",
     "machair","machairodont","machicolation","macrauchenia","macrobenthos","macroinstruction",
     "macrolecithal","macrology","macrometeorology","macrometer","macromolecule","macromycete",
     "macrophyte","macropodid","macroscopic","maculation","magnetohydrodynamics",
     "magnetosphere","magnitizdat","mahasabha","mahavakya","mahjongg","majordomo","makalani",
     "makimono","makossa","malihini","mandoline","manketti","manvantara","maquiladora",
     "marcasite","marconigram","marginalia","marlinespike","marlinspike","marmorino",
     "marquisette","marshalling","martellato","marzacotto","mashgiach","maskirovka",
     "mastication","matagouri","matelasse","mavourneen","mayordomo","mbaqanga","mediastinum",
     "megalithic","megalopteran","megatherium","meiobenthos","meistersinger","melittology",
     "membranophone","mendelevium","menschkeit","mensuration","mercerization","merchantman",
     "mereology","meristematic","meromictic","meshchanstvo","meshuggeneh","meshuggener",
     "mesopelagic","mesotrophic","metabolomics","metacomputing","metalepsis","metalloenzyme",
     "metallography","metallothionein","metasomatism","metasyntactic","metatherian",
     "meteoritical","meteorograph","meurtriere","mezzadria","mezzogiorno","mezzotinto",
     "miaphysite","miaphysitism","microdermabrasion","mieliepap","mignardise","millefeuille",
     "millefiori","millefleur","millennialism","minaudiere","minnesinger","mischmetall",
     "misfeasance","misophonia","misterioso","mitsumata","mixolimnion","mizzenmast","molcajete",
     "molinillo","monadology","mongongo","monimolimnion","monogatari","monomictic",
     "monomorphism","monopsonistic","monothelite","monotremate","monsoonal","montgolfier",
     "moonraker","morphophonemic","moscovium","moshavnik","mousseline","mudarabah",
     "multidirectional","multidisciplinary","multiplexing","musharaka","mutawalli",
     "mycorrhizal","myrmecology","mystagogue","mystagogy","mythomania","nachtmaal","nahuatlism",
     "negentropy","nematocyst","nematology","nenuphar","neoplatonism","nephanalysis",
     "nepheloid","nephelometer","nephelometry","nepheloscope","nephoscope","neurohypophysis",
     "neuropteran","neustonic","nidification","nidifugous","niellowork","nixtamalize",
     "nonfeasance","nopalitos","nougatine","nucleophile","nucleophilic","nyckelharpa",
     "oblomovism","obshchina","oceanodromous","octodecimo","odonatology","odontocete",
     "oganesson","okonomiyaki","oleography","oliebollen","oligodendrocyte","oligomerization",
     "oligonucleotide","oligopsony","oligotrophic","omadhauns","ombrometer","ombudsperson",
     "ommatidium","omnibenevolent","oniomania","onomasiology","onychophagia","onychophoran",
     "ophicleide","ophiology","opisthoglyphous","opisthograph","opisthographic","oprichnina",
     "optoelectronics","optometer","orbicularis","orecchiette","organology","ornithischian",
     "ornithomimid","orogenesis","orthocenter","orthoepist","orthophoto","orthopteran",
     "orthopyroxene","oscillograph","osteichthyan","osteoderm","osteogenesis","ostracoderm",
     "overintellectualize","oviposition","pachycephalosaur","padmasana","padronism",
     "paedomorphic","paedomorphosis","paktong","palaeography","palatalization",
     "paleoclimatological","paleoclimatology","paleoecology","paleoenvironmental",
     "paleoichnology","palmarosa","pampiniform","pampootie","pamprodactyl","pandanaceous",
     "panentheism","pangrammatic","panguingue","panpsychism","panslavism","panspermia",
     "pantalettes","pantalone","panthalassa","pantometry","pantomimic","papellone","papelonne",
     "papillote","paraboloid","paralipsis","parallelepiped","parallelization","paramatman",
     "paraprosdokian","parasomnia","parataxon","pareidolia","paremiology","parthenocarpy",
     "parthenogenesis","paskudnyak","passeggiata","passementerie","passepartout","pasticcio",
     "pastiglia","paternoster","patisserie","patroonship","patternmaker","pauldrons",
     "pearlware","pegmatitic","pelecaniform","pelerine","pelycosaur","pendentive","penillion",
     "pennaceous","pennillion","pennoncelle","pentameter","pentatonic","penthemimeral",
     "peptidoglycan","perdendosi","periastron","pericarpial","perichoresis","pericynthion",
     "perigalacticon","perihelion","periosteum","periphrasis","periphyton","perissodactyl",
     "perithecium","peritoneum","permaculture","permineralization","petitgrain","petrogenesis",
     "petroglyphic","petrography","petrolatum","petrushka","petuntse","pfeffernusse",
     "phagocytosis","phalangeal","phalangite","phanerozoic","phantasmagorical",
     "pharmacokinetics","pharmacopoeia","pheasantry","phelloderm","phenocryst","phillabeg",
     "philopatry","phonotactics","phospholipid","phosphorylation","photodisintegration",
     "photogrammetry","photogravure","photolithography","photoluminescence","photolysis",
     "photometeor","photoperiodism","photophosphorylation","photoreceptor","photorespiration",
     "photosphere","phototropism","phycobilisome","phylactery","phyllosilicate","phyllotaxy",
     "phylloxera","physiocracy","physostomous","phytohormone","phytophagous","phytotherapy",
     "picadillo","pichiciego","pickthank","pictogram","pileipellis","pipsissewa","pishrogue",
     "pizzaiolo","planimeter","planimetry","planishing","planisphere","planography",
     "plasmalemma","plasmalogen","plasmodesma","plasmodesmata","plasmolysis","platannas",
     "platycodon","platyhelminth","platykurtic","platyrrhine","pleiotropic","pleochroism",
     "pleonastic","plesiosaur","plethysmograph","pleurodire","pleurodont","plumaceous",
     "pluviometer","pluviometry","pneumatized","pneumotaxic","podotheca","podzolization",
     "pohutukawa","poikilothermic","polarimetry","polderland","poliorcetics","polyalphabetic",
     "polybasite","polychaete","polyconic","polyeleos","polylogarithmic","polymictic",
     "polyplacophoran","polyptoton","polysyllogism","polysyndeton","polysynthetic","polytropic",
     "pompelmoes","ponticello","pontonier","pontonnier","porcellaneous","porciculture",
     "porphyroblast","potamodromous","potamography","potamology","potichomania","potsticker",
     "pouchong","pourpoint","pratyahara","pratyaksha","praxeology","predikant","primogeniture",
     "proboscidean","proceleusmatic","procellariiform","proclitic","profundal","prolegomenon",
     "proletarianization","promyshlennik","pronunciamento","pronunciamiento","prophylaxis",
     "prosenchyma","proskomedia","prosopagnosia","prosopography","prosopopoeia","proteasome",
     "proteroglyphous","proterozoic","protoplanetary","proventriculus","pseudepigrapha",
     "psychasthenia","pterygiophore","pterylography","pterylosis","ptilochronology",
     "pulchritudinous","pulcinella","pulverulence","pulvinated","pulvination","pursuivant",
     "purushartha","purveyance","putonghua","putorino","pycnocline","pycnometer","pygostyle",
     "pyranometer","pyrargyrite","pyrgeometer","pyrheliometer","pyrheliometry","pyrolusite",
     "pyrometallurgy","pyromorphite","quacksalver","quadratrix","quadratura","quantization",
     "quartering","quatorzain","quenchability","quinaquina","quinceanera","quirquincho",
     "racemiferous","rachmones","radioisotope","radiolarian","radiosonde","radiotelegraphic",
     "raisonneur","rallentando","rambouillet","rancheria","rangatira","raskolnik","rasputitsa",
     "rasterization","rawinsonde","rectrices","recusation","reflectometer","refractometry",
     "regisseur","rehmannia","remittitur","respondent","reticello","retroperitoneal",
     "revetment","rhamphotheca","rhizomatous","rhizomorph","rhombohedral","rhombohedron",
     "rhotacism","rhynchocephalian","rhynchokinesis","ribonuclease","ritardando","robotization",
     "roeblingite","roentgenium","roquelaure","rosemaling","rotenburo","rubenesque",
     "rubrication","runestone","runologist","rutherfordium","sabretache","sacahuiste",
     "saccharimeter","sacramentary","saintpaulia","salangane","sallyport","saltarello",
     "saltimbanco","saltimbocca","saltirewise","samhain","samizdat","sampaguita","sampradaya",
     "sandarach","sandbakkels","sannyasin","sapodilla","sarabande","sarcopterygian","sargassum",
     "sarvangasana","sarvodaya","sastrugus","satyagraha","satyagrahi","saucisson","saurischian",
     "sauropodomorph","scagliola","scansorial","scarification","scenography","schapendoes",
     "scherzando","schipperke","schisandra","schlieren","schmaltzy","schmegegge","schnorrer",
     "schnozzle","schussboomer","schwarmerei","sciatheric","scintillometer","sciotheric",
     "sclerenchyma","sclerochronology","sclerotium","scutellaria","scyphozoan","seaborgium",
     "seanchai","securitization","sedimentology","selendang","selenocentric","selenodesy",
     "semasiology","semifreddo","sensitometry","sephiroth","sericulture","serigraphy",
     "serundeng","severability","sextodecimo","sfogliatella","sgian-dubh","sgraffito",
     "shabushabu","shackbolt","shadchanim","shahbandar","shakuhachi","shalagrama","shammashim",
     "shanachie","shantung","shanzhai","shaolin","shapeshifter","shavasana","shavianism",
     "shekhinah","sheltie","shibuichi","shigaraki","shiitake","shikigami","shillelagh",
     "shimenawa","shirakashi","shirataki","shofaroth","shogunate","showjumping","shrinkflation",
     "shugendo","shuriken","shvetambara","siderophile","siderostat","siegecraft","sigmatism",
     "siheyuan","sillimanite","silversmithing","silviculture","singspiel","sinicization",
     "sinocentrism","sinological","sinologist","sinosphere","siphonaptera","sirocco",
     "sitatunga","skerryguard","skomorokh","skraeling","skullduggery","slalomist","slavophile",
     "slieveens","slubberdegullion","sluggardry","slumpflation","smithsonite","smoltification",
     "smorrebrod","smorzando","snallygaster","snickerdoodle","solenoglyphous","solfeggio",
     "solipsistic","solmization","somatization","somatosensory","somatostatin","somnambulism",
     "somnifacient","soothfastness","sopaipilla","sophomania","sostenuto","soubresaut",
     "soukous","spalpeen","spanakopita","sparrowhawk","spasmolytic","spatchcock","spatterdash",
     "spectrogram","spectroheliograph","spectrophotometric","spectrophotometry","speculaas",
     "speleological","spencerian","sphalerite","sphenisciform","sphenodontian","spherulitic",
     "sphingomyelin","sphygmograph","spinnaker","spinnerbait","spirantization","spiritoso",
     "spirometry","sporangiophore","sporangium","sporocarp","sprechgesang","sprechstimme",
     "sprezzatura","springhaas","stabyhoun","staccatissimo","stadholder","stadtholder",
     "stakhanovite","stalagmometer","stanniferous","steersman","steganogram","steganography",
     "steinkern","steinkirk","stenohaline","stereobate","stereochemistry","stereographic",
     "stereoisomer","stereometry","stereoscope","stereotypy","sternocleidomastoid",
     "stethoscopic","stevedoring","stippling","stockfish","stoloniferous","stomatology",
     "stracciatella","strathspey","stratigraphy","stratocumulus","stridulation","strigiform",
     "stroboscope","stromatolite","strophoid","stuccatore","stuccowork","studdingsail",
     "stygofauna","stymphalian","suanpan","subbotnik","subinfeudation","subrogation",
     "sufganiyot","superannuation","superluminal","supernumerary","supersedeas","supervenience",
     "supralapsarian","suprasegmental","surimono","surrebutter","surrejoinder","surstromming",
     "suryanamaskar","susurration","sutradhara","suzerainty","svadharma","svayambhu",
     "swarajist","syllabary","syllogistic","symbouleutic","sympiesometer","sympiezometer",
     "symplectic","synalepha","synaloepha","synaxarion","synchysis","synclinorium",
     "syndicalism","synechism","synezesis","syngenetic","synsacrum","syringeal","szechuanese",
     "tabbouleh","tachistoscope","tachocline","tachymetry","tachypsychia","taffrail",
     "tagliatelle","taijiquan","taijutsu","taikonaut","talismanic","tamagoyaki","tamanduas",
     "tamburica","tamburitza","tamoshanter","tanabata","tangram","tanzanite","tapaderos",
     "taphonomy","taradiddle","taramasalata","taraxacum","tariffication","tarsomere",
     "tautochrone","tautological","telemarker","telematics","telemeteorography","teleostean",
     "tellurometer","temenggung","temescal","temnospondyl","teocalli","tephrochronology",
     "teponaztli","teratology","terpenoid","terracotta","terreplein","tessellation","tethering",
     "tetrachord","tetrahedrite","thalassography","theodolite","therapsid","therianthrope",
     "theriomorphic","thermograph","thermography","thermohygrograph","thigmotropism",
     "thingstead","thixotropic","thixotropy","tiercelet","tilapia","tinikling","tintinnabulary",
     "tintinnabulation","tirthankara","tjanting","tlachtli","tobogganing","tocopherol",
     "tokenomics","tokoloshe","tokusatsu","tolstoyan","tontine","topocentric","tortellini",
     "touraco","tourbillon","tovarishch","trabeation","tranquillo","transcendentalism",
     "transilluminator","transmissometer","trapezohedron","travertine","treenails",
     "treshchotka","triboluminescence","trichopteran","triclinic","trikonasana","trilateration",
     "triphammer","trisagion","triskelion","trituration","troglodytine","troparion",
     "trophallaxis","trophogenic","tropholytic","tsavorite","tsesarevich","tsessebe","tsundere",
     "tulipomania","tumbaga","turbidimetry","turbidite","turloughs","turnverein","twankay",
     "tychoplankton","typefounder","typometric","typometry","ubiquinone","uitlander",
     "unconstitutionality","unidirectionality","upanishad","urediniospore","urochordate",
     "uropygial","usucaption","usufructuary","usuriousness","uvarovite","vajrasana",
     "valorization","vambraced","vantbrace","vaporetto","varangian","varsovienne","vedantist",
     "vedutista","veldschoen","veldtshoen","vermicompost","vermiculation","videlicet",
     "vidyadhara","viennoiserie","viniferous","violoncello","vipassana","virtualization",
     "viscosimeter","viticulture","vivandiere","vizierate","voivodeship","volkslied",
     "voltameter","voltigeur","voorlooper","voortrekker","wainscoting","waterbuck","wayfaring",
     "weimaraner","weldability","welwitschia","whakapapa","whangee","wheresoever",
     "whigmaleerie","whitesmithing","wikiwiki","wildfowler","windjammer","wiredrawing",
     "xanthophyll","xeriscaping","xiaolongbao","xoloitzcuintli","xylophagous","yachtsmanship",
     "yakimono","yakisoba","yamabushi","yarovization","yeshivoth","yiddishkeit","yinyang",
     "ylang-ylang","yogachara","yokozuna","yudansha","yurodivy","zacatonal","zacatones",
     "zamindari","zanfirico","zantedeschia","zapateado","zenithal","zincography","zoomorphic",
     "zooplankton","zooxanthellae","zugunruhe","zwischenzug","zygodactyl","zygodactylous",
     "zygomaticus","zygospore","zymogenesis","zymography"]);

})();
