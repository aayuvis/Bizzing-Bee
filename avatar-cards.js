/* ============================================================
   AVATAR-CARDS.js — collectible trump-card layer for all 160 avatars.
   Every avatar in SB_AVATARS gets, derived deterministically from its id +
   rarity (stable across sessions, no per-avatar hand-authoring needed):
     • four core stats (Spark / Wisdom / Speed / Grit, 0-99) + an overall
     • a pack-voiced greeting for the home page speech bubble
     • a title (WWE/Pokémon style)
     • one REAL, kid-friendly word fact (educational)
   The 10 villains keep their hand-written lore from SB_AVATAR_LORE.
   Public API:
     window.SB_AV_CARD(id)               -> {name,pack,rarity,title,greeting,fact,stats,overall,packLabel,c1,c2,rc}
     window.SB_AV_CARD_HTML(id, opts)    -> inner HTML of the trading card
   ============================================================ */
(function () {
  function AVS() { return window.SB_AVATARS || { byId:{}, packs:[], rarities:{} }; }
  // stable 32-bit string hash
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0); }
  function rnd(seed) { var x = Math.sin(seed) * 10000; return x - Math.floor(x); }

  // rarity → stat baseline + spread (higher rarity = stronger + a bit more spread)
  var TIER = { free:{base:52,spread:16}, rare:{base:62,spread:18}, epic:{base:72,spread:18}, legendary:{base:84,spread:14} };
  var STAT_KEYS = [['spark','⚡','Spark'], ['wisdom','🧠','Wisdom'], ['speed','💨','Speed'], ['grit','🛡️','Grit']];

  function statsFor(id, rarity) {
    var t = TIER[rarity] || TIER.free; var out = {};
    STAT_KEYS.forEach(function (k, i) {
      var v = t.base + Math.round((rnd(hash(id + ':' + k[0]) % 100000 + i) * 2 - 1) * t.spread);
      out[k[0]] = Math.max(28, Math.min(99, v));
    });
    return out;
  }

  // pack persona → greeting templates (name-filled). Chosen by hash for variety.
  var PACK_VOICE = {
    hive:      ['Buzz buzz! Ready to spell the meadow bright, {name}?', "{name}'s on the case — one word at a time, we win!", 'Grab some nectar and let’s get spelling, {name}!'],
    stage:     ['Lights up! {name} says the stage is ALL yours tonight.', 'Ta-daa! Spell your best and take a bow, {name}!', 'The marquee’s lit and {name}’s got your cue — go!'],
    cosmos:    ['To infinity and beyond the alphabet, {name}!', '{name} charts the stars — each word lights one up.', 'Countdown’s over — blast off into spelling, {name}!'],
    dojo:      ['Focus, {name}. A calm mind spells a true word.', 'Bow first, then spell. {name} is ready.', 'One breath, one word. {name} walks the speller’s path.'],
    lab:       ['Hypothesis: {name} is about to ace this. Let’s test it!', 'Bubbling with ideas — spell on, {name}!', 'Every word’s an experiment, {name}. Mix it up!'],
    arcade:    ['Insert coin! {name} is player one — press start!', 'New high score incoming, {name}. Let’s go!', '{name} respawns ready. Spell for the win!'],
    origami:   ['Fold by fold, word by word — {name} shapes the day.', 'A crisp crease, a clean word. Ready, {name}?', '{name} unfolds a new adventure — one letter at a time.'],
    elements:  ['Earth, wind, and words — {name} commands them all!', 'Feel the spark, {name}? Let’s spell up a storm.', 'Nature spells too, {name}. Follow the flow!'],
    critter:   ['Yip yip! {name} is SO ready to spell, are you?!', '{name} wags its tail — adventure time!', 'Little paws, big words. Let’s go, {name}!'],
    vibe:      ['Good vibes only — {name} says let’s spell it out!', 'Chill mode on, focus mode on. Ready, {name}?', '{name} brings the good energy. Spell along!'],
    dino:      ['ROAR! {name} stomps in — mighty words ahead!', 'Prehistoric power, {name}. Spell like a titan!', '{name} says: even dinosaurs loved a good long word!'],
    enchanted: ['A little magic, a little spelling — welcome, {name}.', '{name} whispers: every word is a tiny spell.', 'The stars are listening, {name}. Spell true.'],
    wildhearts:['Run wild, spell brave — {name} leads the way!', '{name}’s heart is wild and its words are strong.', 'Free as the wind, sharp as a word. Ready, {name}?'],
    legends:   ['Legends are made of letters, {name}. Prove it!', '{name} steps from the myths — spell your saga!', 'Only the bold spell like {name}. Begin!'],
    turbo:     ['Engines hot, {name}! Spell fast, spell first!', 'Green light! {name} floors it into the words!', '{name} is built for speed AND spelling. Go go go!'],
    villains:  ['So… you dare to spell against me, {name}? How bold.', '{name}. We meet across the board. Spell, if you can.', 'Every word you spell, {name}, I shall try to unwrite.']
  };
  // pack persona → title suffix pool
  var PACK_TITLE = {
    hive:'of the Hive', stage:'of the Spotlight', cosmos:'of the Cosmos', dojo:'of the Dojo',
    lab:'of the Lab', arcade:'of the Arcade', origami:'of the Fold', elements:'of the Elements',
    critter:'of the Wild Pond', vibe:'of Good Vibes', dino:'of the Ancient World', enchanted:'of the Enchanted Wood',
    wildhearts:'of the Wildhearts', legends:'of Legend', turbo:'of the Speedway', villains:'of the Unspelling'
  };
  var RANK = { free:'Rookie', rare:'Speller', epic:'Champion', legendary:'Grandmaster' };

  // ~50 REAL, kid-friendly word facts — assigned per avatar by hash (stable).
  var FACTS = [
    'The dot over a lowercase i or j is called a “tittle.”',
    '“Bookkeeper” has three double letters in a row: oo‑kk‑ee.',
    '“Set” has more meanings than any other English word — over 400!',
    'A sentence using every letter is a “pangram,” like “the quick brown fox jumps over the lazy dog.”',
    '“Queue” is the letter Q followed by four silent letters.',
    'The word “alphabet” comes from the first two Greek letters: alpha and beta.',
    '“Rhythm” is a long word with no a, e, i, o, or u.',
    '“Swims” still reads “swims” when you flip it upside down.',
    'The word “nice” once meant “foolish” long ago.',
    '“Muscle” comes from a Latin word for “little mouse.”',
    'Words that mean the same, like big and large, are “synonyms.”',
    '“Goodbye” is a squished‑up form of “God be with ye.”',
    'The word “robot” comes from a Czech word meaning “work.”',
    '“Salary” is linked to “salt” — Romans were once paid in it.',
    '“Dinosaur” means “terrible lizard” in Greek.',
    '“Butterfly” may have begun as “flutter‑by.”',
    'A word that reads the same backwards, like “level,” is a “palindrome.”',
    'The letter E is the most common letter in English.',
    'The letter Q is almost always followed by U.',
    '“Almost” has all its letters in alphabetical order.',
    'W is the only English letter whose name has more than one syllable.',
    'Silent letters, like the K in “knee,” were often spoken long ago.',
    '“Pineapple” once meant a pinecone before it named the fruit.',
    '“Sandwich” is named after an Earl who liked meat between bread.',
    '“Volcano” comes from Vulcan, the Roman god of fire.',
    '“Cereal” is named after Ceres, the Roman goddess of the harvest.',
    '“January” is named after Janus, the two‑faced Roman god of beginnings.',
    'The word “month” comes from “moon.”',
    'A word that sounds like its meaning, like “buzz,” is “onomatopoeia.”',
    '“Etymology” is the study of where words come from.',
    '“Hamburger” is named after Hamburg, a city in Germany.',
    '“Denim” is named after Nîmes, a city in France — “de Nîmes.”',
    '“Jeans” are named after Genoa, a city in Italy.',
    '“Piano” is short for “pianoforte,” Italian for “soft‑loud.”',
    '“Facetious” contains all five vowels in order: a, e, i, o, u.',
    '“Ambidextrous” means able to use both hands equally well.',
    '“Stewardesses” is a long word typed with only the left hand.',
    'The plus and minus of words — prefixes and suffixes — change a word’s meaning.',
    '“Pangolin,” “penguin,” and “pumpkin” all begin with the same sound but not the same letter pair.',
    'The word “bee” in “spelling bee” may come from neighbors gathering to help.',
    'A “homophone” sounds the same but is spelled differently, like “to,” “too,” and “two.”',
    'The longest word in many dictionaries is a 45‑letter lung‑disease name.',
    '“Gym” is short for “gymnasium,” from a Greek word meaning “to exercise.”',
    '“Astronaut” means “star sailor” in Greek.',
    '“Dandelion” comes from French for “lion’s tooth” — dent de lion.',
    'The word “clue” once meant a ball of thread used to find your way out of a maze.',
    '“Nightmare” once meant an evil spirit, not a bad dream.',
    'A “thesaurus” is a book of synonyms — the word means “treasure” in Greek.',
    'The ampersand “&” was once considered the 27th letter of the alphabet.',
    '“Uncopyrightable” is a long word with no repeated letter.'
  ];

  window.SB_AV_CARD = function (id) {
    var a = AVS().byId[id]; if (!a) return null;
    var lore = (window.SB_AVATAR_LORE || {})[id];
    var pack = (AVS().packs || []).filter(function (p) { return p.id === a.pack; })[0] || { label:a.pack, c1:'#6C4FE0', c2:'#FFC23D' };
    var rar = (AVS().rarities || {})[a.rarity] || { label:a.rarity, c:'#7B8794' };
    var voices = PACK_VOICE[a.pack] || PACK_VOICE.hive;
    var greeting = lore ? lore.greeting : voices[hash(id + 'g') % voices.length].replace(/\{name\}/g, a.name);
    var title = lore ? lore.tagline : (RANK[a.rarity] + ' ' + (PACK_TITLE[a.pack] || ''));
    var fact = FACTS[hash(id + 'fact') % FACTS.length];   // a real word fact (same idea as the villains' lore slot, but educational)
    var stats = statsFor(id, a.rarity);
    var overall = Math.round((stats.spark + stats.wisdom + stats.speed + stats.grit) / 4);
    return { id:id, name:a.name, pack:a.pack, packLabel:pack.label, rarity:a.rarity, rarityLabel:rar.label, rc:rar.c,
      c1:pack.c1, c2:pack.c2, title:title.trim(), greeting:greeting, fact:fact, stats:stats, overall:overall };
  };

  // Trading-card inner HTML. opts.owned=false renders a locked/silhouette variant.
  window.SB_AV_CARD_HTML = function (id, opts) {
    opts = opts || {}; var d = window.SB_AV_CARD(id); if (!d) return '';
    var owned = opts.owned !== false;
    var art = (typeof window.SB_AVATAR === 'function') ? window.SB_AVATAR(id, 150) : '';
    var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var bars = STAT_KEYS.map(function (k) {
      var v = d.stats[k[0]]; var pct = Math.round(v / 99 * 100);
      var col = v >= 85 ? '#2FA35C' : v >= 68 ? '#3D7DF0' : v >= 50 ? '#E0922E' : '#9A8F7C';
      return '<div class="avc-stat"><span class="avc-stat-l">' + k[1] + ' ' + k[2] + '</span>'
        + '<span class="avc-stat-bar"><i style="width:' + pct + '%;background:' + col + '"></i></span>'
        + '<b class="avc-stat-v">' + v + '</b></div>';
    }).join('');
    return '<div class="avc-card avc-' + d.rarity + '" style="--c1:' + d.c1 + ';--c2:' + d.c2 + ';--rc:' + d.rc + '">'
      + '<div class="avc-foil"></div>'
      + '<div class="avc-top"><span class="avc-ovr"><b>' + d.overall + '</b><i>OVR</i></span>'
      + '<span class="avc-rar" style="background:' + d.rc + '">' + esc(d.rarityLabel) + '</span></div>'
      + '<div class="avc-art' + (owned ? '' : ' locked') + '">' + (owned ? art : '<span class="avc-lock">🔒</span>') + '</div>'
      + '<div class="avc-name">' + esc(d.name) + '</div>'
      + '<div class="avc-title">' + esc(d.title) + '</div>'
      + '<div class="avc-stats">' + bars + '</div>'
      + '<div class="avc-fact"><span class="avc-fact-h">📖 Word Fact</span>' + esc(d.fact) + '</div>'
      + '<div class="avc-pack"><span class="avc-dot"></span>' + esc(d.packLabel) + '</div>'
      + '</div>';
  };
})();
