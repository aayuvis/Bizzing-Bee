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
    villains:  ['So… you dare to spell against me, {name}? How bold.', '{name}. We meet across the board. Spell, if you can.', 'Every word you spell, {name}, I shall try to unwrite.'],
    serpent:   ['Ssslither over here, {name} — let’s ssspell!', '{name} and me, coiled and ready. Ssstrike true!', 'One letter at a time, {name} — sssmooth and sssteady wins.']
  };
  // pack persona → title suffix pool
  var PACK_TITLE = {
    hive:'of the Hive', stage:'of the Spotlight', cosmos:'of the Cosmos', dojo:'of the Dojo',
    lab:'of the Lab', arcade:'of the Arcade', origami:'of the Fold', elements:'of the Elements',
    critter:'of the Wild Pond', vibe:'of Good Vibes', dino:'of the Ancient World', enchanted:'of the Enchanted Wood',
    wildhearts:'of the Wildhearts', legends:'of Legend', turbo:'of the Speedway', villains:'of the Unspelling',
    serpent:'of the Serpent Pack'
  };
  var RANK = { free:'Rookie', rare:'Speller', epic:'Champion', legendary:'Grandmaster' };

  // Per-avatar LORE (in-world character flavor for the card top) + FACT (a REAL
  // fact about what inspired the avatar — mythology, science, history, nature).
  var LOREDB = {
    // ---- HIVE ----
    bizzy:{lore:'The little bee who spells the world back together, one petal at a time.',fact:'Honeybees do a real “waggle dance” — the angle and length of the wiggle tells the hive exactly where the flowers are.'},
    honeypot:{lore:'A pot so sweet the whole meadow comes calling.',fact:'Honey never spoils — pots found in 3,000-year-old Egyptian tombs were still good to eat.'},
    bumble:{lore:'Big, fuzzy and loyal — Bumble never lets go of a friend.',fact:'Bumblebees warm up for flight by shivering their muscles, so they can fly on cold days honeybees can’t.'},
    waggle:{lore:'The hive’s map-maker, always pointing the way.',fact:'The bee waggle dance was decoded by scientist Karl von Frisch, who won a Nobel Prize for it.'},
    drone:{lore:'Steady and sure, Drone Dan keeps the hive humming.',fact:'Drone bees are the males of the hive — they have no stinger and their job is to help start new colonies.'},
    clover:{lore:'Lucky by name, luckier by the words she spells.',fact:'Bees must visit up to 2 million flowers to make a single jar of honey.'},
    blossom:{lore:'Where Blossom lands, colour returns to the world.',fact:'Flowers use bright colours and scent as landing signs to guide bees straight to their nectar.'},
    nectar:{lore:'The sweetest reward for a word well spelled.',fact:'Nectar is a sugary flower drink; bees turn it into honey by fanning it with their wings to dry it out.'},
    propolis:{lore:'The hive’s healer and handy-bee.',fact:'Propolis is a sticky “bee glue” from tree sap that bees use to seal cracks and keep the hive germ-free.'},
    queenhive:{lore:'The wise ruler of the Hive, keeper of every name.',fact:'A queen bee can lay around 2,000 eggs in a single day — more than her own body weight.'},
    // ---- STAGE ----
    star:{lore:'Born for the spotlight, centre stage always.',fact:'“The show must go on” is a real theatre rule — performers finish even when something goes wrong.'},
    mic:{lore:'Turn it up — Big Mic makes every word heard.',fact:'Before microphones, theatres were built like stone bowls so an actor’s voice could reach the back row.'},
    maestro:{lore:'One wave of the baton and the whole show begins.',fact:'“Maestro” means “master” in Italian — the title given to a great orchestra conductor.'},
    jester:{lore:'The fool who’s cleverer than he looks.',fact:'Court jesters were often the only people allowed to tell a king the truth — hidden inside a joke.'},
    lumen:{lore:'A living spotlight that never lets the stage go dark.',fact:'“Limelight” comes from old stage lamps that burned lime to make a bright white glow, before electricity.'},
    diva:{lore:'The star everyone came to hear.',fact:'“Diva” means “goddess” in Italian and once described only the very finest opera singers.'},
    popcorn:{lore:'No show is complete without a bucket of Popcorn.',fact:'Popcorn pops because each kernel holds a drop of water that turns to steam and bursts it open.'},
    melody:{lore:'She hums the tune the whole world forgot.',fact:'“Melody” comes from Greek words meaning “song” and “singing”.'},
    encore:{lore:'One more, one more! Encore never wants the show to end.',fact:'“Encore” is French for “again” — audiences shout it to ask for one more song.'},
    goldlegend:{lore:'The legend the marquee was built for.',fact:'A standing ovation — the audience rising to clap — is one of the oldest ways to honour a performer.'},
    // ---- COSMOS ----
    luna:{lore:'A gentle glow that guides night-time spellers home.',fact:'“Luna” is the Latin word for Moon — the root of words like “lunar” and “lunatic”.'},
    astro:{lore:'Mission commander of the Cosmos crew.',fact:'“Astronaut” means “star sailor”, from the Greek astron (star) and nautes (sailor).'},
    comet:{lore:'A streak of light that never sits still.',fact:'A comet’s glowing tail always points away from the Sun, blown back by the solar wind.'},
    rocket:{lore:'Rae counts down and blasts off into every challenge.',fact:'Rockets fly by Newton’s law — pushing gas down and back pushes the rocket up and forward.'},
    alien:{lore:'A friendly visitor learning our strange Earth words.',fact:'Scientists really do listen for aliens, scanning space with giant radio telescopes just in case.'},
    saturn:{lore:'Calm, ringed and always the coolest in the room.',fact:'Saturn’s rings are billions of chunks of ice and rock, from dust-sized to house-sized.'},
    blackhole:{lore:'The Void that swallows light — and the odd letter.',fact:'A black hole’s gravity is so strong that not even light can escape it, which is why it looks black.'},
    supernova:{lore:'Goes out with the biggest bang in the galaxy.',fact:'A supernova is a giant star exploding — for a short time it can outshine an entire galaxy.'},
    ufo:{lore:'Nobody’s quite sure what Saucer is. Saucer likes it that way.',fact:'“UFO” just means Unidentified Flying Object — most turn out to be planes, balloons or planets.'},
    nebula:{lore:'A drake born in the dust where stars are made.',fact:'A nebula is a giant cloud of gas and dust in space where new stars are born.'},
    // ---- DOJO ----
    panda:{lore:'The calm sensei who spells with a still mind.',fact:'Giant pandas spend up to 14 hours a day eating bamboo — almost their only food.'},
    ninja:{lore:'Strikes only the right letter, never a wrong one.',fact:'Real ninja of old Japan were spies and scouts, prized for stealth far more than fighting.'},
    samurai:{lore:'Honour first, word second, mistake never.',fact:'The samurai lived by “bushido”, a code valuing honour, courage and self-control above all.'},
    neko:{lore:'A paw raised for good luck and good spelling.',fact:'The waving “lucky cat” (maneki-neko) is a Japanese charm believed to invite good fortune.'},
    bamboo:{lore:'Bends in the wind but never breaks.',fact:'Some bamboo grows almost a metre in a single day — one of the fastest-growing plants on Earth.'},
    kitsune:{lore:'A clever fox spirit who earns a new tail with every wise word.',fact:'In Japanese folklore a kitsune is a magical fox that grows a new tail as it gains wisdom — up to nine.'},
    oni:{lore:'All grin and grumble, but soft underneath.',fact:'An oni is a horned ogre of Japanese legend; each spring people throw beans to chase them away.'},
    koi:{lore:'Swims upstream, no matter how hard the current.',fact:'A Japanese legend says a koi that swims up a waterfall becomes a dragon — a symbol of never giving up.'},
    starsteel:{lore:'Forged sharp, tempered calm.',fact:'A real katana blade was folded and hammered many times over to make its steel both strong and sharp.'},
    dragonmaster:{lore:'Master of the rain and the river, wisest of the Dojo.',fact:'Unlike fire-breathing western dragons, East Asian dragons are wise water spirits that bring the rain.'},
    // ---- LAB ----
    beaker:{lore:'Bubbling with big ideas and bigger words.',fact:'A beaker’s little spout, the “lip”, lets a scientist pour liquid without spilling a drop.'},
    atom:{lore:'Small but the building block of everything.',fact:'Atoms are so tiny that millions could fit across the width of a single human hair.'},
    robo:{lore:'Beep-boop — always ready to help you spell.',fact:'The word “robot” comes from a Czech play and a word meaning “forced work”.'},
    magnet:{lore:'Max pulls the right answer straight to him.',fact:'Earth itself is a giant magnet — which is why a compass needle always points north.'},
    germy:{lore:'The tiny troublemaker soap sends packing.',fact:'Washing your hands with soap for 20 seconds washes away most germs that make us sick.'},
    brainiac:{lore:'Confidence: 100%. Knows a word for everything.',fact:'Your brain has about 86 billion nerve cells, passing messages faster than a race car.'},
    phoenix:{lore:'Rises brighter from every mistake.',fact:'The phoenix is a mythic bird said to burst into flame and be reborn from its own ashes.'},
    volt:{lore:'A jolt of pure spelling energy.',fact:'The “volt” is named after Alessandro Volta, who built the first battery in the year 1800.'},
    scopey:{lore:'Sees the tiny details everyone else misses.',fact:'A microscope can magnify things hundreds of times — enough to see a single living cell.'},
    aurum:{lore:'The golden formula, rarest in the Lab.',fact:'“Aurum” is the Latin name for gold — which is why gold’s chemical symbol is “Au”.'},
    // ---- ARCADE ----
    pixel:{lore:'Player one, ready to start.',fact:'A “pixel” (short for “picture element”) is one tiny dot; screens use millions to make a picture.'},
    joy:{lore:'Push, tilt, spell — Joy Stick loves the game.',fact:'The “joystick” was named by early pilots — it was the control stick that flew the plane.'},
    ghost:{lore:'Haunts the maze, chasing the next word.',fact:'In classic Pac-Man each of the four ghosts was programmed to chase in its own special way.'},
    dpad:{lore:'Up, down, left, right — always knows the way.',fact:'The “+”-shaped D-pad was invented by Nintendo in 1982 and is still used on controllers today.'},
    tokeny:{lore:'One token, one more try.',fact:'Old arcades ran on tokens instead of coins so the machines only took the arcade’s own money.'},
    bossbot:{lore:'The big challenge at the end of the level.',fact:'A “boss” is the tough enemy at the end of a game stage — beat it to move on.'},
    rainbow:{lore:'Zooms across the finish in every colour.',fact:'A rainbow always shows its colours in the same order: red, orange, yellow, green, blue, indigo, violet.'},
    glitch:{lore:'A friendly bug in the machine.',fact:'A “glitch” is a small fault in a game or machine; astronauts first used the word for odd spikes in power.'},
    hiscore:{lore:'One more life, one more word — never game over.',fact:'“1-UP” means an extra life in video games — grab one and you keep playing after a mistake.'},
    neonking:{lore:'Rules the arcade in electric light.',fact:'Neon signs glow because electricity makes the neon gas sealed inside the glass tubes light up.'},
    // ---- ORIGAMI ----
    paperplane:{lore:'One fold, one throw, and away it soars.',fact:'The world-record paper plane flew over 88 metres — farther than a football pitch is wide.'},
    cranefold:{lore:'Folded for luck, folded for a wish.',fact:'Folding 1,000 paper cranes is a Japanese tradition said to grant a wish or bring healing.'},
    boatfold:{lore:'Sails any puddle into an adventure.',fact:'“Origami” comes from the Japanese “oru” (to fold) and “kami” (paper) — the art of paper folding.'},
    hopfold:{lore:'Press its back and watch it leap!',fact:'A traditional origami frog really hops when you press and slide off its folded back.'},
    fanfold:{lore:'A graceful flutter with every fold.',fact:'The folding fan was invented in Japan — legend says inspired by the folding wings of a bat.'},
    lotusfold:{lore:'Blooms clean and calm from the muddiest pond.',fact:'The lotus rises spotless out of muddy water, a symbol of staying pure through hardship.'},
    koifold:{lore:'A paper fish that dreams of becoming a dragon.',fact:'Traditional origami is folded from a single square of paper — no cuts and no glue.'},
    kabuto:{lore:'A folded helmet for a paper samurai.',fact:'The origami “kabuto” is a samurai helmet Japanese children wear on Children’s Day.'},
    flutterfold:{lore:'Light as paper, quick as a wing.',fact:'Origami butterflies decorated Japanese weddings, representing the bride and the groom.'},
    goldencrane:{lore:'The rarest fold of all — pure good fortune.',fact:'The crane is Japan’s bird of luck and long life — real cranes can live over 60 years.'},
    // ---- ELEMENTS ----
    pebble:{lore:'Small, smooth and steady.',fact:'A smooth river pebble got that way by tumbling in the water for thousands of years.'},
    breeze:{lore:'A gentle push in the right direction.',fact:'Wind is simply air moving from high-pressure areas to low — you feel it as a breeze.'},
    droplet:{lore:'Every big splash starts with one little drop.',fact:'A single raindrop can be made of a million tiny cloud droplets that joined together to fall.'},
    ember:{lore:'A tiny spark with a warm heart.',fact:'Fire needs three things to burn — heat, fuel and oxygen; take any one away and it goes out.'},
    leafy:{lore:'Grows a little greener with every word.',fact:'Leaves are green because of chlorophyll, which uses sunlight to make the plant’s food.'},
    cloudy:{lore:'Head in the clouds, heart full of rain.',fact:'A big fluffy cloud is made of water droplets and can weigh as much as 100 elephants.'},
    wave:{lore:'Rolls in bigger and bolder every time.',fact:'Ocean waves are made by wind pushing across the surface — the water itself mostly stays put.'},
    boulder:{lore:'Immovable, unshakeable, unstoppable.',fact:'Given enough time, water and wind wear a whole mountain down into sand, one grain at a time.'},
    zappy:{lore:'A flash of pure electric excitement.',fact:'A bolt of lightning is about five times hotter than the surface of the Sun.'},
    elemental:{lore:'Master of earth, water, air and fire.',fact:'Ancient thinkers believed everything was made of four elements: earth, water, air and fire.'},
    // ---- CRITTER ----
    froggy:{lore:'The pond’s brightest little star.',fact:'A frog drinks by soaking up water through its skin instead of using its mouth.'},
    corg:{lore:'Zooms in, tail wagging, ready for anything.',fact:'Corgis were bred to herd cattle — their short legs kept them safely under the kicking hooves.'},
    sharky:{lore:'All fin, no fear.',fact:'Sharks have swum the seas for over 400 million years — longer than trees have grown on land.'},
    slowmo:{lore:'Takes it slow and still wins the day.',fact:'Sloths move so slowly that green algae grows on their fur, helping them hide in the trees.'},
    capy:{lore:'The calmest friend you’ll ever meet.',fact:'The capybara is the world’s largest rodent and so calm that other animals love to rest on it.'},
    narly:{lore:'The unicorn of the sea.',fact:'A narwhal’s “horn” is really a giant tooth that can grow up to 3 metres long.'},
    redpanda:{lore:'Rusty tumbles through every puzzle with a grin.',fact:'Red pandas were named before giant pandas — and they aren’t closely related to them at all.'},
    axo:{lore:'Always smiling, always growing back stronger.',fact:'An axolotl can regrow lost legs, its tail, and even parts of its heart and brain.'},
    rexy:{lore:'A little dino with a big roar.',fact:'Many scientists think small meat-eating dinosaurs were the ancestors of today’s birds.'},
    uni:{lore:'The rarest, most magical of the pond crew.',fact:'The narwhal’s spiral tusk is thought to have inspired the old legends of the unicorn.'},
    // ---- VIBE ----
    gg:{lore:'Good game, good vibes, good spelling.',fact:'“GG” means “good game” — a friendly way players say well-played after a match.'},
    duckie:{lore:'Floats through every challenge, unbothered.',fact:'A rubber duck floats because it’s full of air, which is lighter than the water it pushes aside.'},
    boba:{lore:'Sweet, chewy and full of surprises.',fact:'The chewy pearls in bubble tea, called “boba”, are made from tapioca — a starch from the cassava root.'},
    sprinkle:{lore:'A little sparkle on top of everything.',fact:'Sprinkles were first made in France, where they’re called “nonpareil”, meaning “without equal”.'},
    pengu:{lore:'Waddles on land, flies underwater.',fact:'Penguins can’t fly in the air, but they “fly” underwater, flapping their wings to swim fast.'},
    slimey:{lore:'Squishy, stretchy and strangely wise.',fact:'Slime is a “non-Newtonian” fluid — it flows like a liquid but snaps like a solid if you hit it fast.'},
    djbot:{lore:'Drops the beat for every spelling win.',fact:'A DJ “scratches” by moving a record back and forth to make rhythms — a real musical skill.'},
    plushy:{lore:'The softest, most huggable hero.',fact:'The teddy bear is named after US President Theodore “Teddy” Roosevelt.'},
    catlord:{lore:'Rules the couch, judges your spelling, purrs anyway.',fact:'A cat’s purr vibrates at a frequency that may help heal bones and calm both cat and human.'},
    yeti:{lore:'Frost the friendly snow-giant.',fact:'The yeti, or “abominable snowman”, is a legendary ape-like creature said to roam the Himalayas.'},
    // ---- DINO ----
    trice:{lore:'Three horns, no fear.',fact:'Triceratops had three horns and a huge bony frill, probably for defence and to attract mates.'},
    stego:{lore:'Big plates, bigger heart.',fact:'Stegosaurus was as long as a bus but had a brain only about the size of a walnut.'},
    raptor:{lore:'Quick, clever and never fooled by a trap.',fact:'Velociraptor was really only about the size of a turkey — and it likely had feathers.'},
    ptero:{lore:'Rules the prehistoric skies.',fact:'Pterosaurs were flying reptiles, not dinosaurs; the biggest had the wingspan of a small plane.'},
    bronto:{lore:'Gentle giant, reaching for the treetops.',fact:'Long-necked sauropods like Brontosaurus could reach leaves at heights no other animal could touch.'},
    spino:{lore:'The river-hunter, bigger than a T. rex.',fact:'Spinosaurus was longer than T. rex and may be the first dinosaur known to swim and hunt fish.'},
    ankylo:{lore:'A walking tank with a club for a tail.',fact:'Ankylosaurus was covered in bony armour and had a tail club that could swing hard enough to break bone.'},
    mosa:{lore:'Ruler of the ancient oceans.',fact:'Mosasaurus was a giant sea reptile that ruled the oceans while dinosaurs ruled the land.'},
    fossil:{lore:'A whisper from a hundred million years ago.',fact:'A fossil forms when minerals slowly replace buried bone, turning it to stone over millions of years.'},
    rexking:{lore:'The king of the dinosaurs, teeth and all.',fact:'T. rex had a bite strong enough to crush a car and teeth as long as bananas.'},
    // ---- ENCHANTED ----
    midnight:{lore:'A shadow that brings good luck, not bad.',fact:'Long ago black cats were feared, but in many countries a black cat crossing your path means good luck.'},
    wisp:{lore:'A dancing light that leads you onward.',fact:'A “will-o’-the-wisp” is a real glow over marshes, made by gases from rotting plants.'},
    lunamoth:{lore:'Pale green wings that shine by moonlight.',fact:'The luna moth has no mouth — as an adult it never eats and lives only about a week.'},
    fae:{lore:'A tiny bit of woodland magic.',fact:'Folklore said fairies lived in mushroom “fairy rings” — which are really one fungus growing outward.'},
    crystal:{lore:'Sharp, clear and quietly powerful.',fact:'A crystal’s beautiful shape comes from its atoms lining up in a perfectly repeating pattern.'},
    mer:{lore:'A pearl of the deep, patient and rare.',fact:'A pearl forms inside an oyster, one thin layer at a time, around a tiny grain of sand.'},
    snowfox:{lore:'Vanishes into the snow at will.',fact:'The Arctic fox’s fur turns white in winter and brown in summer so it stays hidden all year.'},
    briar:{lore:'Gentle rose, guarded by thorns.',fact:'Sleeping Beauty is also called “Briar Rose”, after the thorny roses that grew around her castle.'},
    wish:{lore:'Make a wish — Wish just might grant it.',fact:'The “wishbone” is a real bird bone; pulling it to make a wish is a tradition over 2,000 years old.'},
    starweaver:{lore:'Weaves the scattered stars back into stories.',fact:'Ancient people connected stars into pictures called constellations to tell stories and find their way.'},
    // ---- WILDHEARTS ----
    monarch:{lore:'Travels farther than any butterfly should.',fact:'Monarch butterflies migrate up to 4,800 km — a journey so long it takes several generations.'},
    hoppy:{lore:'Quick feet, quicker wits.',fact:'A rabbit’s teeth never stop growing, so it must gnaw constantly to keep them worn down.'},
    fawn:{lore:'Shy, gentle and brave when it counts.',fact:'A newborn fawn has almost no scent, which helps hide it from predators while its mother is away.'},
    ottie:{lore:'Playful to the last, holds on to friends.',fact:'Sea otters hold hands while they sleep so they don’t drift apart on the waves.'},
    echo:{lore:'Finds the way through the darkest night.',fact:'Bats find their way in the dark using “echolocation” — squeaks that bounce back like sonar.'},
    pounce:{lore:'Fastest paws in the wild.',fact:'The cheetah is the fastest land animal, sprinting up to 112 km/h in short bursts.'},
    swan:{lore:'Graceful above, paddling hard below.',fact:'Swans often mate for life, and a group of them flying together is called a “wedge”.'},
    howl:{lore:'Leads the pack, calls the moon.',fact:'Wolves howl to gather their pack, and each wolf’s howl is as unique as a fingerprint.'},
    blaze:{lore:'Clever, quick and full of fire.',fact:'A fox uses Earth’s magnetic field to help judge distance when it pounces on prey under the snow.'},
    pegasus:{lore:'The winged horse who spells among the clouds.',fact:'Pegasus, the winged horse of Greek myth, was said to be born from sea foam by the ocean.'},
    // ---- LEGENDS ----
    squatch:{lore:'A gentle giant hiding in the deep woods.',fact:'Bigfoot, or “Sasquatch”, is a legendary ape-like giant said to roam the forests of North America.'},
    nessie:{lore:'The shy secret of a deep, cold lake.',fact:'The Loch Ness Monster is a legendary creature said to live in a deep lake in Scotland.'},
    griff:{lore:'Eagle above, lion below, guardian of treasure.',fact:'The griffin, with an eagle’s head and a lion’s body, was said to guard treasure in ancient legends.'},
    golem:{lore:'Clay brought to life to protect the weak.',fact:'In Jewish folklore a golem is a giant made of clay, brought to life to protect its people.'},
    cyclo:{lore:'One eye, and it never misses a letter.',fact:'The Cyclops of Greek myth was a one-eyed giant; the hero Odysseus escaped one by tricking it.'},
    fang:{lore:'A creature of the night with a soft side.',fact:'Vampire bats are real — but they’re tiny and lap up blood rather than truly “bite”.'},
    kraken:{lore:'Rises from the deep to swallow whole ships.',fact:'The kraken is a giant sea monster of Norse legend, likely inspired by real giant squid.'},
    mino:{lore:'The beast at the heart of the maze.',fact:'The Minotaur of Greek myth — half man, half bull — lived at the centre of a giant maze called a labyrinth.'},
    phantom:{lore:'Here, then gone, like a word half-remembered.',fact:'“Phantom” comes from a Greek word meaning “to show” — the same root as “fantasy”.'},
    hydra:{lore:'Cut off one head and two more appear.',fact:'The Hydra of Greek myth grew two new heads for each one cut off — until Hercules used fire to stop it.'},
    // ---- TURBO ----
    rally:{lore:'Reads the road and never misses a turn.',fact:'In rally racing a co-driver reads notes aloud so the driver knows every turn before it arrives.'},
    turbo:{lore:'Built for speed, tuned for wins.',fact:'A turbocharger uses a car’s own exhaust to spin a fan that forces in more air — and more power.'},
    crash:{lore:'Walks away from every wipe-out, grinning.',fact:'Race cars have a “crumple zone” that folds in a crash, soaking up the force to protect the driver.'},
    airtime:{lore:'Lives for the moment all four wheels leave the ramp.',fact:'Skateboarders and BMX riders call the moment both wheels leave the ramp “catching air”.'},
    striker:{lore:'Always first to the finish line.',fact:'A “striker” in football is the player whose main job is to score the goals.'},
    champ:{lore:'The checkered flag belongs to Champ.',fact:'The checkered flag has signalled the winner of a race for over 100 years.'},
    hover:{lore:'No wheels, no limits.',fact:'A maglev train “hovers” on magnets and can travel over 600 km/h with no wheels touching the track.'},
    nitro:{lore:'One button for a burst of pure speed.',fact:'Some race cars use nitrous oxide for a burst of extra oxygen — and a burst of extra speed.'},
    mech:{lore:'A giant machine with a spelling heart.',fact:'The word “mecha” for giant robots comes from “mechanical” and began in Japanese comics.'},
    titan:{lore:'The unbeatable champion of the Speedway.',fact:'The Titans were giant gods of Greek myth; Saturn’s largest moon, Titan, is named after them.'},
    // ---- VILLAINS (top = their saga lore; fact = the real inspiration) ----
    greymoth:{fact:'Real clothes moths eat holes in wool and cloth — like letters quietly vanishing from a sweater.'},
    locust:{fact:'Real locust swarms can hold billions of insects, darken the sky and strip whole fields bare.'},
    vstatic:{fact:'The fuzzy “static” on an old TV is partly caused by faint radio echoes left over from the Big Bang.'},
    gnash:{fact:'A crocodile has one of the strongest bites in nature — but almost no strength to open its jaws back up.'},
    glitchv:{fact:'A “glitch” is a small fault in a machine; astronauts first used the word for sudden spikes in power.'},
    smudge:{fact:'A swarm moves as one because each member simply follows its nearest neighbours — no leader needed.'},
    voidmaw:{fact:'A black hole is a real “void” whose gravity is so strong that not even light can escape it.'},
    gatekeeper:{fact:'Ancient walled cities really had gatekeepers who challenged every stranger with a password.'},
    vex:{fact:'Hornets are the largest wasps; a single queen can build an entire colony from scratch each spring.'},
    wordeater:{fact:'The Ten-Headed Word-Eater is inspired by Ravana, the ten-headed king of the Ramayana — each head said to master a different art and science, from music and medicine to war.'},
    // ---- SERPENT ----
    noodle:{lore:'The friendly garden snake who spells one letter at a time.',fact:'Snakes smell with their tongues — the forked flick picks up scent and feeds it to a special sense organ.'},
    sunny:{lore:'A sunny corn snake, warm and easy-going.',fact:'Snakes are cold-blooded, so they bask in the sun to warm up and slither to the shade to cool down.'},
    cobra:{lore:'Spreads its hood wide and stands tall to spell.',fact:'A king cobra can rear up a third of its body length to look a grown person right in the eye.'},
    python:{lore:'Patient and powerful, never rushes a word.',fact:'Pythons don’t use venom — they squeeze, and can go months between meals after a big one.'},
    rattler:{lore:'Shakes its tail to warn, then spells in a flash.',fact:'A rattlesnake’s rattle is made of loose, hollow segments of keratin — the same stuff as your fingernails.'},
    viper:{lore:'Quick, sharp and always precise.',fact:'Vipers have heat-sensing pits on their faces that “see” the warmth of prey in total darkness.'},
    boa:{lore:'A gentle giant with beautiful patterns.',fact:'Boa constrictors are born live, not hatched from eggs like most snakes.'},
    mamba:{lore:'The fastest speller in the grass.',fact:'The black mamba is one of the fastest snakes on Earth, gliding at up to 20 km/h.'},
    seasnake:{lore:'Glides through the waves, spelling as it swims.',fact:'Sea snakes can stay underwater for hours, taking in some oxygen straight through their skin.'},
    naga:{lore:'The mythical serpent-guardian, wisest of the pack.',fact:'The Naga is a mighty serpent of Hindu and Buddhist legend, said to guard treasure, temples and rivers.'}
  };

  // fallback pool if an id somehow lacks authored lore
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

  // Villains live in the villains pack AND scattered through other packs.
  var VILLAIN_EXTRA = { glitch:1, blackhole:1, oni:1, ghost:1, bossbot:1, kraken:1, hydra:1, mino:1, cyclo:1 };
  function isVillain(a) { return a.pack === 'villains' || !!VILLAIN_EXTRA[a.id]; }

  window.SB_AV_CARD = function (id) {
    var a = AVS().byId[id]; if (!a) return null;
    var slore = (window.SB_AVATAR_LORE || {})[id];   // hand-written saga lore (villains)
    var db = LOREDB[id] || {};
    var pack = (AVS().packs || []).filter(function (p) { return p.id === a.pack; })[0] || { label:a.pack, c1:'#6C4FE0', c2:'#FFC23D' };
    var rar = (AVS().rarities || {})[a.rarity] || { label:a.rarity, c:'#7B8794' };
    var voices = PACK_VOICE[a.pack] || PACK_VOICE.hive;
    var villain = isVillain(a);
    var greeting = slore ? slore.greeting : voices[hash(id + 'g') % voices.length].replace(/\{name\}/g, a.name);
    var title = slore ? slore.tagline : (RANK[a.rarity] + ' ' + (PACK_TITLE[a.pack] || ''));
    // LORE line (character backstory shown up top). Villains use their saga backstory.
    var lore = slore ? slore.fact : (db.lore || (a.name + ' of the ' + pack.label + '.'));
    // FACT = a real fact about what inspired the avatar.
    var fact = db.fact || FACTS[hash(id + 'fact') % FACTS.length];
    var stats = statsFor(id, a.rarity);
    var overall = Math.round((stats.spark + stats.wisdom + stats.speed + stats.grit) / 4);
    return { id:id, name:a.name, pack:a.pack, packLabel:pack.label, rarity:a.rarity, rarityLabel:rar.label, rc:rar.c,
      c1:pack.c1, c2:pack.c2, title:title.trim(), greeting:greeting, lore:lore, fact:fact, stats:stats, overall:overall,
      villain:villain, kind:villain ? 'villain' : 'hero' };
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
    var kindBadge = d.villain
      ? '<span class="avc-kind villain">😈 Villain</span>'
      : '<span class="avc-kind hero">⭐ Hero</span>';
    return '<div class="avc-card avc-' + d.rarity + (d.villain ? ' avc-villain' : '') + '" style="--c1:' + d.c1 + ';--c2:' + d.c2 + ';--rc:' + d.rc + '">'
      + '<div class="avc-foil"></div>'
      + '<div class="avc-top"><span class="avc-ovr"><b>' + d.overall + '</b><i>OVR</i></span>'
      + '<span class="avc-badges">' + kindBadge + '<span class="avc-rar" style="background:' + d.rc + '">' + esc(d.rarityLabel) + '</span></span></div>'
      + '<div class="avc-art' + (owned ? '' : ' locked') + '">' + (owned ? art : '<span class="avc-lock">🔒</span>') + '</div>'
      + '<div class="avc-name">' + esc(d.name) + '</div>'
      + '<div class="avc-title">' + esc(d.title) + '</div>'
      + '<div class="avc-lore">' + esc(d.lore) + '</div>'
      + '<div class="avc-stats">' + bars + '</div>'
      + '<div class="avc-fact"><span class="avc-fact-h">💡 Inspired by</span>' + esc(d.fact) + '</div>'
      + '<div class="avc-pack"><span class="avc-dot"></span>' + esc(d.packLabel) + '</div>'
      + '</div>';
  };
})();
