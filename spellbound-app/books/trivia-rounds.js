/* THE SPECIALITY ROUNDS — the hard half of the trivia companion.

   The generic rounds are drawn at build time from the app's own bank (31,159
   questions, levels 3-5). These are the rounds the bank cannot supply: narrow,
   deep subjects where a quizzer either knows the ground or does not, and where
   the answers are worth knowing for their own sake.

   House style, inherited from the app's bank and tightened for print:
     - `c[0]` is ALWAYS the correct answer; the page shuffles.
     - Never clue with the answer's most famous fact — that goes in `f`.
     - Never ask "which language gave us X"; ask what the root MEANS.
     - A hard question is one where the answer is hard to guess, not one where
       the question is hard to read.

   Formats, set per round by `fmt`:
     'mc'      four options, printed A-D
     'short'   a written answer, with the key at the back of the book
     'xword'   a crossword built from the round's answers
     'square'  a letter square hiding the round's answers

   APPEND ONLY — the book's rounds index in by position. */
window.SB_TRIVIA_ROUNDS = [

  { id: 'greekgods', title: 'The Greek Gods', fmt: 'mc',
    blurb: 'Twelve on the mountain and a great many more off it. The Romans renamed nearly all of them, which is why half of these words come to us twice.',
    qs: [
      { q: 'Which goddess was born from the sea foam, according to Hesiod?', c: ['Aphrodite', 'Artemis', 'Demeter', 'Hestia'], f: 'Her name is usually explained from aphros, "foam" — the origin of the word aphrodisiac.' },
      { q: 'Hephaestus was the god of the forge. What was unusual about him among the Olympians?', c: ['He was lame', 'He was mortal', 'He was blind', 'He never spoke'], f: 'Thrown from Olympus as an infant in most tellings. His Roman name, Vulcan, gave English volcano.' },
      { q: 'Which of the twelve Olympians gave up her seat so that Dionysus could have one?', c: ['Hestia', 'Hera', 'Athena', 'Hebe'], f: 'Hestia, goddess of the hearth — her name survives in the Latin Vesta and the Vestal Virgins.' },
      { q: 'The Muses were nine. Whose daughters were they?', c: ['Zeus and Mnemosyne', 'Apollo and Leto', 'Zeus and Hera', 'Poseidon and Amphitrite'], f: 'Mnemosyne is Memory — which is why mnemonic and museum come from the same family.' },
      { q: 'What did Hermes carry that is still used as a symbol by some medical bodies, in error?', c: ['The caduceus', 'The thyrsus', 'The aegis', 'The trident'], f: 'The correct medical symbol is the single-snake rod of Asclepius; the caduceus has two snakes and belongs to commerce.' },
      { q: 'Which Titan was punished by having an eagle eat his regenerating liver?', c: ['Prometheus', 'Atlas', 'Cronus', 'Oceanus'], f: 'His name means "forethought"; his brother Epimetheus is "afterthought".' },
      { q: 'The word "panic" comes from which god?', c: ['Pan', 'Poseidon', 'Phobos', 'Pluto'], f: 'Pan was believed to cause the sudden groundless terror that could seize a flock, or an army.' },
      { q: 'Which river of the underworld gave English a word meaning "forgetful"?', c: ['Lethe', 'Styx', 'Acheron', 'Cocytus'], f: 'Drinking from Lethe erased memory; hence lethargic, and lethal by a separate route.' },
      { q: 'Athena sprang fully armed from the head of Zeus. Whom had Zeus swallowed to bring this about?', c: ['Metis', 'Leto', 'Maia', 'Themis'], f: 'Metis means "cunning"; the prophecy said her child would overthrow him.' },
      { q: 'Which goddess did the Romans call Ceres, giving English a word for breakfast?', c: ['Demeter', 'Persephone', 'Rhea', 'Gaia'], f: 'Cereal — the grain of Ceres.' },
      { q: 'What was the aegis, carried by Zeus and Athena?', c: ['A shield or breastplate bearing a gorgon’s head', 'A winged sandal', 'A cap of invisibility', 'A three-pronged spear'], f: 'To be "under the aegis" of someone is still to be under their protection.' },
      { q: 'Which nymph faded away until only her voice remained?', c: ['Echo', 'Daphne', 'Calypso', 'Thetis'], f: 'Punished by Hera to repeat only the last words she heard.' }
    ] },

  { id: 'norse', title: 'Norse Mythology', fmt: 'short',
    blurb: 'Four days of the English week are Norse gods. This round is written short — no options, just the answer, and the key is at the back.',
    qs: [
      { q: 'Which Norse god gives his name to Wednesday?', c: ['Odin'], f: 'Woden’s day. Thursday is Thor’s, Friday is Frigg’s, Tuesday is Tyr’s.' },
      { q: 'What is the name of the world tree that holds the nine realms?', c: ['Yggdrasil'], f: 'An ash tree; a squirrel named Ratatoskr runs up and down it carrying insults.' },
      { q: 'What did Odin give up in exchange for a drink from Mimir’s well of wisdom?', c: ['An eye'], f: 'He also hanged himself on Yggdrasil for nine nights to win the runes.' },
      { q: 'Name Thor’s hammer.', c: ['Mjolnir'], f: 'Forged by dwarves; its handle came out short because a fly bit the smith.' },
      { q: 'What is the Norse word for the doom of the gods — the final battle?', c: ['Ragnarok'], f: 'Often mistranslated "twilight of the gods" after Wagner’s Gotterdammerung.' },
      { q: 'Which of Loki’s children is the wolf bound until Ragnarok?', c: ['Fenrir'], f: 'The god Tyr lost his hand binding him, which is why Tyr is the one-handed god.' },
      { q: 'What was the hall where Odin gathered half the warriors who died in battle?', c: ['Valhalla'], f: 'The other half went to Freyja’s field, Folkvangr — a detail usually left out.' },
      { q: 'What is the name of the eight-legged horse ridden by Odin?', c: ['Sleipnir'], f: 'Loki was its mother, which is a longer story than this book has room for.' },
      { q: 'The rainbow bridge between the realms of gods and men is called what?', c: ['Bifrost'], f: 'Guarded by Heimdall, who can hear grass growing.' },
      { q: 'Which Norse word for a fierce warrior gave English a term for uncontrolled rage?', c: ['Berserker'], f: 'Probably "bear-shirt" — to go berserk.' },
      { q: 'Who is the trickster who brings about the death of Balder?', c: ['Loki'], f: 'Everything in creation swore not to harm Balder, except the mistletoe, which was thought too young to ask.' },
      { q: 'What are the three Norse fates called, collectively?', c: ['The Norns'], f: 'Urd, Verdandi and Skuld — past, present and what must be.' }
    ] },

  { id: 'rivers', title: 'Rivers You Have Not Heard Of', fmt: 'mc',
    blurb: 'Everyone can name the Nile. This round is the other ones — the rivers that matter enormously somewhere, and are unknown everywhere else.',
    qs: [
      { q: 'The Irrawaddy is the great river of which country?', c: ['Myanmar', 'Cambodia', 'Laos', 'Bangladesh'], f: 'Also spelled Ayeyarwady. Its dolphins fish cooperatively with people.' },
      { q: 'Which river forms much of the border between Argentina and Uruguay?', c: ['The Uruguay', 'The Parana', 'The Paraguay', 'The Pilcomayo'], f: 'It joins the Parana to form the Rio de la Plata.' },
      { q: 'The Ob is one of the longest rivers in the world. Into what does it drain?', c: ['The Arctic Ocean', 'The Caspian Sea', 'The Sea of Japan', 'Lake Baikal'], f: 'Siberia’s great rivers run north, which is why they flood — the mouths thaw last.' },
      { q: 'Which African river flows through the Okavango Delta and never reaches the sea?', c: ['The Okavango', 'The Zambezi', 'The Limpopo', 'The Orange'], f: 'It empties into the Kalahari and evaporates — an inland delta.' },
      { q: 'The Murray is Australia’s longest river. Which is its principal tributary?', c: ['The Darling', 'The Yarra', 'The Swan', 'The Fitzroy'], f: 'Together they drain about a seventh of the continent.' },
      { q: 'Which European river rises in the Black Forest and reaches the Black Sea?', c: ['The Danube', 'The Elbe', 'The Rhine', 'The Oder'], f: 'It passes through or touches ten countries, more than any other river.' },
      { q: 'The Mekong is called the Lancang in which country?', c: ['China', 'Thailand', 'Vietnam', 'Myanmar'], f: 'Rivers commonly change name at a border; the Mekong changes it five times.' },
      { q: 'Which South American river is the largest tributary of the Amazon by volume?', c: ['The Rio Negro', 'The Madeira', 'The Tapajos', 'The Xingu'], f: 'Where the black Rio Negro meets the pale Solimoes the two run side by side for kilometres without mixing.' },
      { q: 'The Indus gives its name to a country it barely touches. Which country does it mainly flow through?', c: ['Pakistan', 'India', 'Afghanistan', 'Iran'], f: 'India, Hindu and Hindi all descend from the river’s Sanskrit name, Sindhu.' },
      { q: 'Which river runs through Baghdad?', c: ['The Tigris', 'The Euphrates', 'The Karun', 'The Diyala'], f: 'Mesopotamia means "between the rivers" — the Tigris and the Euphrates.' },
      { q: 'The Yenisei divides which two halves of a continent?', c: ['Western and eastern Siberia', 'Northern and southern China', 'European and Asian Turkey', 'Eastern and western Mongolia'], f: 'West of it is flat plain; east of it, high plateau.' },
      { q: 'Which river’s name means "great river" in Spanish, making "Rio Grande River" a repetition?', c: ['The Rio Grande', 'The Rio Negro', 'The Rio Tinto', 'The Rio Bravo'], f: 'Mexico calls it the Rio Bravo del Norte.' }
    ] },

  { id: 'capitals', title: 'Capitals of the World — the hard half', fmt: 'short',
    blurb: 'Not Paris. The capitals people get wrong, including three countries whose largest city is not their capital at all.',
    qs: [
      { q: 'What is the capital of Australia?', c: ['Canberra'], f: 'Chosen as a compromise because Sydney and Melbourne could not agree.' },
      { q: 'What is the capital of Turkey?', c: ['Ankara'], f: 'Istanbul is much larger, and was the capital under the Ottomans as Constantinople.' },
      { q: 'What is the capital of Canada?', c: ['Ottawa'], f: 'Queen Victoria picked it, partly because it sat on the border of Upper and Lower Canada.' },
      { q: 'What is the capital of Brazil?', c: ['Brasilia'], f: 'Built from nothing between 1956 and 1960; from the air the plan looks like an aeroplane.' },
      { q: 'What is the capital of Switzerland?', c: ['Bern'], f: 'Officially the "federal city" — Switzerland has never formally named a capital.' },
      { q: 'What is the capital of New Zealand?', c: ['Wellington'], f: 'The southernmost capital city in the world.' },
      { q: 'What is the capital of Nigeria?', c: ['Abuja'], f: 'Replaced Lagos in 1991, chosen for being central and ethnically neutral.' },
      { q: 'What is the capital of Kazakhstan?', c: ['Astana'], f: 'Renamed Nur-Sultan in 2019 and back to Astana in 2022. Astana simply means "capital".' },
      { q: 'What is the capital of Bolivia’s judiciary — its constitutional capital?', c: ['Sucre'], f: 'La Paz holds the government; Sucre holds the supreme court. Bolivia has two.' },
      { q: 'What is the capital of Myanmar?', c: ['Naypyidaw'], f: 'Built in secret and unveiled in 2005; its roads are twenty lanes wide and largely empty.' },
      { q: 'What is the capital of Morocco?', c: ['Rabat'], f: 'Casablanca is far larger and much better known.' },
      { q: 'What is the capital of Vietnam?', c: ['Hanoi'], f: 'Ho Chi Minh City, formerly Saigon, is the larger of the two.' },
      { q: 'What is the capital of Tanzania?', c: ['Dodoma'], f: 'Officially since 1974, though much of the government stayed in Dar es Salaam for decades.' },
      { q: 'What is the capital of Sri Lanka?', c: ['Sri Jayawardenepura Kotte'], f: 'Colombo is the commercial capital and is what most people say.' }
    ] },

  { id: 'shakespeare', title: 'Shakespeare’s People', fmt: 'mc',
    blurb: 'Not the plots — the people in them, including several everybody can quote without being able to name.',
    qs: [
      { q: 'Who says "The first thing we do, let’s kill all the lawyers"?', c: ['Dick the Butcher, in Henry VI Part 2', 'Falstaff, in Henry IV', 'Iago, in Othello', 'Jaques, in As You Like It'], f: 'He is a rebel proposing to destroy civil order — the line is not a compliment to the speaker.' },
      { q: 'Which character speaks the "Tomorrow, and tomorrow, and tomorrow" speech?', c: ['Macbeth', 'Hamlet', 'King Lear', 'Prospero'], f: 'On being told his wife is dead.' },
      { q: 'In The Tempest, who is Prospero’s daughter?', c: ['Miranda', 'Ariel', 'Sycorax', 'Perdita'], f: 'Her name means "to be wondered at" — Shakespeare seems to have coined it.' },
      { q: 'Who is the Queen of the Fairies in A Midsummer Night’s Dream?', c: ['Titania', 'Hippolyta', 'Hermia', 'Helena'], f: 'Oberon is her husband; Puck is Oberon’s servant.' },
      { q: 'Which character in Othello engineers the whole tragedy?', c: ['Iago', 'Cassio', 'Roderigo', 'Brabantio'], f: 'He has more lines than Othello, and never explains himself: "Demand me nothing... From this time forth I never will speak word."' },
      { q: 'In King Lear, which daughter refuses to flatter her father?', c: ['Cordelia', 'Goneril', 'Regan', 'Ophelia'], f: 'Her answer to "what can you say?" is "Nothing, my lord."' },
      { q: 'Who is the fat knight who appears in Henry IV and The Merry Wives of Windsor?', c: ['Falstaff', 'Bardolph', 'Pistol', 'Bottom'], f: 'Reportedly written into Merry Wives because Elizabeth I wanted to see him in love.' },
      { q: 'In Julius Caesar, who says "Et tu, Brute?"', c: ['Caesar', 'Brutus', 'Cassius', 'Mark Antony'], f: 'Three Latin words in an English play — Shakespeare’s way of marking the moment as history.' },
      { q: 'Which weaver is given a donkey’s head in A Midsummer Night’s Dream?', c: ['Bottom', 'Quince', 'Snug', 'Flute'], f: 'A "bottom" was a spool for winding thread — the joke is a weaver’s joke.' },
      { q: 'Who is Hamlet’s university friend, the one left alive to tell the story?', c: ['Horatio', 'Laertes', 'Rosencrantz', 'Osric'], f: '"Report me and my cause aright to the unsatisfied."' },
      { q: 'In Twelfth Night, which character is tricked into wearing yellow stockings?', c: ['Malvolio', 'Feste', 'Orsino', 'Sir Andrew Aguecheek'], f: 'His name means roughly "ill-will" in Italian.' },
      { q: 'Which of these is NOT a character in Romeo and Juliet?', c: ['Sebastian', 'Mercutio', 'Tybalt', 'Benvolio'], f: 'Sebastian is in Twelfth Night and The Tempest.' }
    ] },

  { id: 'minerals', title: 'Minerals Named After People', fmt: 'mc',
    blurb: 'A mineral may be named for the person who found it, the person who paid for the expedition, or a person the finder admired. Every one of these is an eponym, which makes them all spelling questions too.',
    qs: [
      { q: 'Goethite, an iron ore, is named after whom?', c: ['Johann Wolfgang von Goethe', 'A German village called Goethe', 'Carl Goethe, a mine owner', 'The Goethe river'], f: 'The poet was a serious mineral collector; the mineral is pronounced GER-tite.' },
      { q: 'Which element and its minerals are named after the woman who discovered polonium?', c: ['Curium', 'Radium', 'Poloniumite', 'Sklodovskite'], f: 'Curium honours both Marie and Pierre Curie. Sklodowskite, after her maiden name, is also real.' },
      { q: 'Dolomite is named after Deodat de Dolomieu, who was what?', c: ['A French geologist', 'An Italian duke', 'A Swiss mountaineer', 'A Spanish miner'], f: 'The Dolomite mountains are named after the rock, which is named after the man — a three-step eponym.' },
      { q: 'Smithsonite, a zinc carbonate, shares its namesake with which institution?', c: ['The Smithsonian Institution', 'The Smith College collection', 'The Royal Society', 'The Natural History Museum'], f: 'James Smithson left his fortune to found the Smithsonian, a country he had never visited.' },
      { q: 'Alexandrite changes colour from green to red. Whom is it named after?', c: ['Tsar Alexander II of Russia', 'Alexander the Great', 'Alexander von Humboldt', 'Alexandre Dumas'], f: 'Found in the Urals, reportedly on the day the future tsar came of age.' },
      { q: 'Perovskite, now central to a class of solar cells, honours Lev Perovski, who was what?', c: ['A Russian mineralogist and statesman', 'A Polish chemist', 'A Ukrainian mine engineer', 'A Czech crystallographer'], f: 'The mineral gave its name to an entire crystal structure, used far beyond the original stone.' },
      { q: 'Which mineral is named after the chemist who isolated potassium and sodium?', c: ['Davyne', 'Faradayite', 'Priestleyite', 'Boyleite'], f: 'Humphry Davy, who also gave the world the miner’s safety lamp.' },
      { q: 'Sillimanite is named for Benjamin Silliman, who taught at which university?', c: ['Yale', 'Harvard', 'Princeton', 'Columbia'], f: 'He founded the American Journal of Science, which is still running.' },
      { q: 'Gadolinite honours Johan Gadolin. What did he discover?', c: ['The first rare-earth element', 'The first radioactive element', 'The first noble gas', 'The first synthetic mineral'], f: 'Yttrium — and gadolinium is named for him as well, making him one of very few people with both a mineral and an element.' },
      { q: 'Moissanite, used as a diamond substitute, was first found where?', c: ['In a meteorite crater', 'In a South African mine', 'In a volcanic vent', 'On the sea floor'], f: 'Henri Moissan found it in Canyon Diablo, Arizona, and mistook it at first for diamond.' },
      { q: 'Which mineral is named after the Scottish chemist who described Brownian motion?', c: ['None — Brownian motion is named after a botanist', 'Brownite', 'Robertsonite', 'Scotite'], f: 'Robert Brown was a botanist, and the phenomenon is named for him; the trap here is assuming every famous name has a mineral.' },
      { q: 'Uraninite is named after a planet, which is itself named after what?', c: ['A Greek sky god', 'A Roman emperor', 'A German astronomer', 'A Latin word for "distant"'], f: 'Ouranos, the sky. Uranium is named for the planet, discovered eight years earlier.' }
    ] },

  { id: 'wartime', title: 'Words the Wars Left Behind', fmt: 'short',
    blurb: 'War is one of the fastest word factories in any language. These are ordinary English words that entered the language, or changed meaning entirely, on a battlefield.',
    qs: [
      { q: 'Which word for a period of quiet in a battle now means a truce of any kind?', c: ['Armistice'], f: 'From Latin arma, "arms", and -stitium, "a stopping".' },
      { q: 'What word for a soldier’s temporary shelter comes from the French for "to make a noise"?', c: ['Barrack'], f: 'Via Spanish barraca, a soldier’s hut.' },
      { q: 'Which word, from the Hindi for "dusty", named a uniform colour?', c: ['Khaki'], f: 'Adopted by the British in India so that troops would not be visible at a distance.' },
      { q: 'What term for concealing equipment comes from the French for "to disguise"?', c: ['Camouflage'], f: 'A word civilians did not use before 1914.' },
      { q: 'Which word for a sudden attack from cover comes from Old French for "to lie in wait in a wood"?', c: ['Ambush'], f: 'The bush is really there — embuscher, to hide in the bushes.' },
      { q: 'What word for an all-out bombardment comes from the German for "lightning war"?', c: ['Blitz'], f: 'Short for Blitzkrieg; in Britain "the Blitz" came to mean the bombing of the cities.' },
      { q: 'Which word for the ground between opposing trenches is now used for any unclaimed territory?', c: ['No-man’s-land'], f: 'Recorded in English from the fourteenth century, but fixed in its modern sense by 1914.' },
      { q: 'What word for a small mobile group of soldiers now names a group of anything?', c: ['Squad'], f: 'From Italian squadra, a square — the shape the formation made.' },
      { q: 'Which word for the total surrender of a position comes from Latin for "chapter"?', c: ['Capitulate'], f: 'Terms of surrender were set out under headings — capitula.' },
      { q: 'What word for a soldier’s food ration gave English a term for strict limiting of anything?', c: ['Ration'], f: 'From Latin ratio, a reckoning — the calculated share.' },
      { q: 'Which word meaning "to destroy one in ten" is now used to mean "to destroy almost all"?', c: ['Decimate'], f: 'A Roman punishment for mutiny: one man in ten, chosen by lot.' },
      { q: 'What term for a soldier who has served long and hard now means an expert in any field?', c: ['Veteran'], f: 'From Latin vetus, "old".' },
      { q: 'Which word for the sudden noise and shock of shelling gave English a term for lasting distress?', c: ['Shell shock'], f: 'Coined in 1915; later called combat fatigue, and later still post-traumatic stress.' },
      { q: 'What word for a defensive ditch and mound gave English a verb meaning "to dig in and refuse to move"?', c: ['Entrench'], f: 'From the French trencher, to cut.' }
    ] },

  { id: 'constellations', title: 'Constellations and Their Stories', fmt: 'mc',
    blurb: 'Eighty-eight official constellations, and almost all the northern ones are Greek myths written on the sky.',
    qs: [
      { q: 'Which constellation is the hunter, with a belt of three bright stars?', c: ['Orion', 'Perseus', 'Hercules', 'Bootes'], f: 'The belt stars are Alnitak, Alnilam and Mintaka — all Arabic names.' },
      { q: 'Cassiopeia is recognisable as which shape?', c: ['A W or M', 'A cross', 'A triangle', 'A hook'], f: 'She was placed in the sky upside down as a punishment for vanity.' },
      { q: 'Which constellation contains the star Polaris?', c: ['Ursa Minor', 'Ursa Major', 'Draco', 'Cepheus'], f: 'The pole star is not especially bright — it is useful because it barely moves.' },
      { q: 'The Southern Cross appears on several national flags. What is its Latin name?', c: ['Crux', 'Centaurus', 'Carina', 'Vela'], f: 'The smallest of the 88 constellations by area.' },
      { q: 'Which constellation is named for a lyre and contains Vega?', c: ['Lyra', 'Cygnus', 'Aquila', 'Delphinus'], f: 'The lyre of Orpheus. Vega will be the pole star again in about 12,000 years.' },
      { q: 'Andromeda was chained to a rock as a sacrifice to which sea monster?', c: ['Cetus', 'Hydra', 'Draco', 'Scorpius'], f: 'Cetus is still the root of cetacean, the word for whales and dolphins.' },
      { q: 'Which constellation was the ship Argo, before astronomers broke it into three?', c: ['Argo Navis', 'Pegasus', 'Auriga', 'Columba'], f: 'Split into Carina the keel, Puppis the stern and Vela the sails.' },
      { q: 'Scorpius chased which hunter across the sky, so that the two are never visible at once?', c: ['Orion', 'Perseus', 'Bootes', 'Sagittarius'], f: 'As Scorpius rises in the east, Orion sets in the west.' },
      { q: 'What does the name of the star Betelgeuse most likely mean in Arabic?', c: ['The hand of the giant', 'The eye of the bull', 'The heart of the lion', 'The tail of the fish'], f: 'A mistranscription of yad al-jauza turned the y into a b, and the name stuck.' },
      { q: 'Which zodiac constellation is the only one representing an inanimate object?', c: ['Libra', 'Virgo', 'Aquarius', 'Sagittarius'], f: 'The scales. Its brightest stars still carry Arabic names meaning the northern and southern claws — it was once part of Scorpius.' },
      { q: 'The Pleiades sit in which constellation?', c: ['Taurus', 'Gemini', 'Aries', 'Cancer'], f: 'Seven sisters in the myth; most people see six with the naked eye.' },
      { q: 'Which constellation’s name is Latin for "the swan", and flies down the Milky Way?', c: ['Cygnus', 'Grus', 'Pavo', 'Phoenix'], f: 'Also called the Northern Cross. Cygnet, a young swan, is the same root.' }
    ] },

  { id: 'periodic', title: 'The Periodic Table’s Namesakes', fmt: 'mc',
    blurb: 'Places, planets, people and one Scandinavian village that got four elements to itself.',
    qs: [
      { q: 'Four elements are named after a single village in Sweden. Which village?', c: ['Ytterby', 'Uppsala', 'Kiruna', 'Falun'], f: 'Yttrium, ytterbium, terbium and erbium — all from one quarry.' },
      { q: 'Which element is named after the Greek word for "lazy" or "inactive"?', c: ['Argon', 'Neon', 'Xenon', 'Krypton'], f: 'Argos, idle — because it refused to react with anything.' },
      { q: 'Einsteinium and fermium were both discovered in the debris of what?', c: ['A hydrogen bomb test', 'A particle accelerator', 'A meteorite', 'A uranium mine'], f: 'The Ivy Mike test, 1952; the findings were classified for three years.' },
      { q: 'Which element is named after the Greek for "hidden"?', c: ['Krypton', 'Lanthanum', 'Selenium', 'Iridium'], f: 'And lanthanum, from lanthanein, means almost the same thing — "to lie hidden".' },
      { q: 'Iridium takes its name from Iris. What was she goddess of?', c: ['The rainbow', 'The dawn', 'The sea', 'Memory'], f: 'Its salts are many-coloured. The iris of the eye is the same word.' },
      { q: 'Which element is named after the Latin for "heavy stone"?', c: ['Barium', 'Plumbum (lead)', 'Wolfram (tungsten)', 'Stibium (antimony)'], f: 'Greek barys, heavy — the same root as barometer.' },
      { q: 'Cobalt is named after a creature from German folklore. What kind?', c: ['A goblin', 'A dragon', 'A giant', 'A water spirit'], f: 'Miners blamed the kobold when the ore gave off poisonous fumes and yielded no copper.' },
      { q: 'Which element is named after the Greek titan who stole fire?', c: ['Promethium', 'Titanium', 'Tantalum', 'Uranium'], f: 'Fitting for an element that does not occur in usable quantities in nature.' },
      { q: 'Tantalum is named after Tantalus, who was punished how?', c: ['With food and water always just out of reach', 'By being chained to a rock', 'By pushing a boulder uphill forever', 'By being turned to stone'], f: 'The metal resists absorbing acid — it will not take up what surrounds it. Tantalise is the same name.' },
      { q: 'Which element honours the woman who won Nobel Prizes in two different sciences?', c: ['Curium', 'Meitnerium', 'Nobelium', 'Roentgenium'], f: 'Meitnerium honours Lise Meitner, who explained nuclear fission and was left off the Nobel.' },
      { q: 'Gallium is named after a place. Which one?', c: ['France (Gallia)', 'Wales', 'Galicia in Spain', 'Galilee'], f: 'Its discoverer’s name, Lecoq, also means "the rooster" — gallus in Latin. He denied the pun.' },
      { q: 'Which element is named after the smallest planet, and was discovered by studying the Sun?', c: ['Helium', 'Mercury', 'Selenium', 'Tellurium'], f: 'Helios is the Sun, not a planet — the trap. Helium was found in the solar spectrum before it was found on Earth.' }
    ] },

  { id: 'roots', title: 'Roots Hidden in Plain Sight', fmt: 'xword',
    blurb: 'A crossword built from words whose meaning is sitting inside them, if you know the root. Solve the grid; the clue is the meaning of the parts.',
    qs: [
      { q: 'Fear of confined spaces — from Latin claustrum, "a bolt or enclosure"', c: ['claustrophobia'] },
      { q: 'A word meaning "all-powerful" — omni + potens', c: ['omnipotent'] },
      { q: 'Speaking many languages — poly + glotta, "tongue"', c: ['polyglot'] },
      { q: 'A creature that eats everything — omni + vorare, "to devour"', c: ['omnivore'] },
      { q: 'Writing in beautiful hand — kallos, "beauty", plus graphein', c: ['calligraphy'] },
      { q: 'Measuring the earth — ge, "earth", plus metron', c: ['geometry'] },
      { q: 'A remedy against all poisons — pan + akos, "cure"', c: ['panacea'] },
      { q: 'Sleep-bringing — from Hypnos, the Greek god of sleep', c: ['hypnotic'] },
      { q: 'One who studies the stars — astron plus nomos, "law"', c: ['astronomer'] },
      { q: 'Coming before in time — ante + cedere, "to go"', c: ['antecedent'] },
      { q: 'Under the earth — sub + terra', c: ['subterranean'] },
      { q: 'Carrying across — trans + ferre, "to bear"', c: ['transfer'] }
    ] },

  { id: 'dynasties', title: 'Dynasties and Empires', fmt: 'short',
    blurb: 'The families that ran things, and how long they managed it.',
    qs: [
      { q: 'Which Chinese dynasty built most of the Great Wall as it stands today?', c: ['Ming'], f: 'The earlier walls were rammed earth; the Ming built in brick and stone.' },
      { q: 'Which dynasty ruled Russia from 1613 until 1917?', c: ['Romanov'], f: 'Three hundred and four years, ended by revolution.' },
      { q: 'Ashoka belonged to which Indian dynasty?', c: ['Maurya'], f: 'His edicts, carved on pillars, are among the oldest datable Indian writing.' },
      { q: 'Which family ruled Florence and produced four popes?', c: ['Medici'], f: 'Bankers first; the fortune paid for much of the Renaissance.' },
      { q: 'Which dynasty ruled Egypt from Alexander’s general to Cleopatra?', c: ['Ptolemaic'], f: 'Greek-speaking for three centuries; Cleopatra VII is said to be the first of them to learn Egyptian.' },
      { q: 'Which European royal house is associated with the "Habsburg jaw"?', c: ['Habsburg'], f: 'The result of repeated marriage within the family across generations.' },
      { q: 'Which dynasty founded by Osman I lasted from about 1299 to 1922?', c: ['Ottoman'], f: 'Six centuries — one of the longest-lived of any imperial family.' },
      { q: 'The Tokugawa shogunate ruled Japan from which city?', c: ['Edo'], f: 'Renamed Tokyo, "eastern capital", in 1868.' },
      { q: 'Which Persian dynasty was defeated by Alexander the Great?', c: ['Achaemenid'], f: 'Founded by Cyrus the Great; at its height it ruled about 44 percent of the world’s people.' },
      { q: 'Which West African empire was ruled by Mansa Musa?', c: ['Mali'], f: 'His pilgrimage to Mecca is said to have disrupted the price of gold in Egypt for years.' },
      { q: 'Which dynasty ruled England from 1485 to 1603?', c: ['Tudor'], f: 'Five monarchs, ending with Elizabeth I.' },
      { q: 'Which South American empire had its capital at Cusco?', c: ['Inca'], f: 'Their road network ran about 40,000 kilometres, and they had no wheeled vehicles.' }
    ] },

  { id: 'instruments', title: 'Instruments and the People Who Made Them', fmt: 'mc',
    blurb: 'Half the orchestra is named after somebody, a place, or a noise.',
    qs: [
      { q: 'The saxophone is named after Adolphe Sax, who was what nationality?', c: ['Belgian', 'French', 'German', 'Austrian'], f: 'He also invented the saxhorn and the saxotromba, which caught on rather less.' },
      { q: 'The sousaphone is named after a composer famous for what?', c: ['Marches', 'Operas', 'Symphonies', 'Waltzes'], f: 'John Philip Sousa wanted a tuba that would wrap around the player and point up.' },
      { q: 'Stradivarius violins are named after a maker from which Italian city?', c: ['Cremona', 'Florence', 'Venice', 'Naples'], f: 'Antonio Stradivari made perhaps 1,100 instruments; around 650 survive.' },
      { q: 'The word "piano" is short for what?', c: ['Pianoforte', 'Pianola', 'Pianissimo', 'Pianetta'], f: 'Soft-loud — because unlike the harpsichord it could play both.' },
      { q: 'The theremin is played how?', c: ['Without being touched', 'With the feet', 'By blowing across strings', 'By striking glass'], f: 'Two antennas sense the position of the hands. Leon Theremin also invented a listening device used against the American embassy in Moscow.' },
      { q: 'Which brass instrument’s name is Italian for "large trumpet"?', c: ['Trombone', 'Tuba', 'Cornet', 'Euphonium'], f: 'Tromba plus the augmentative -one.' },
      { q: 'The sitar’s name comes from a Persian word meaning what?', c: ['Three strings', 'Long neck', 'Sweet voice', 'Gourd body'], f: 'Se-tar. The modern instrument has rather more than three.' },
      { q: 'What is a glockenspiel, literally?', c: ['A bell play', 'A wood song', 'A metal box', 'A hand drum'], f: 'German Glocken, bells, plus Spiel, play.' },
      { q: 'The harmonica is also known by which name, from a common use?', c: ['Mouth organ', 'Reed pipe', 'Wind box', 'Breath horn'], f: 'Also the blues harp.' },
      { q: 'The banjo most likely descends from instruments brought from where?', c: ['West Africa', 'Ireland', 'Portugal', 'The Caribbean'], f: 'Gourd-bodied lutes such as the akonting.' },
      { q: 'Which keyboard instrument’s name means "key-board" in its own language?', c: ['Clavier', 'Organ', 'Celesta', 'Spinet'], f: 'From Latin clavis, a key — the same root as clavicle, the collarbone, which was thought to look like a bolt.' },
      { q: 'A "cor anglais" is neither a horn nor English. What is it?', c: ['A large oboe', 'A small trumpet', 'A bass flute', 'A wooden clarinet'], f: 'The name may be a mangling of cor angle, "angled horn" — the early ones were bent.' }
    ] },

  { id: 'seafarers', title: 'Knots, Sails and the Sea', fmt: 'square',
    blurb: 'The sea gave English more idioms than any other trade. Find the words hidden in the square; every one of them came off a ship.',
    qs: [
      { q: 'The lowest sail on a mast — also a standard of comparison', c: ['baseline'] },
      { q: 'To reduce the area of a sail in strong wind', c: ['reef'] },
      { q: 'The right-hand side of a ship, looking forward', c: ['starboard'] },
      { q: 'The left-hand side of a ship, looking forward', c: ['port'] },
      { q: 'A ship’s kitchen', c: ['galley'] },
      { q: 'The rear of a vessel', c: ['stern'] },
      { q: 'The front of a vessel', c: ['bow'] },
      { q: 'A rope’s free end, or a person with no responsibilities', c: ['loose'] },
      { q: 'To lower a flag or sail suddenly', c: ['strike'] },
      { q: 'The depth of water a vessel needs to float', c: ['draught'] },
      { q: 'Wreckage found floating on the sea', c: ['flotsam'] },
      { q: 'Goods thrown overboard deliberately and washed ashore', c: ['jetsam'] }
    ] },

  { id: 'deserts', title: 'Deserts, Peaks and Deeps', fmt: 'mc',
    blurb: 'The extremes of the map — the driest, the highest, the deepest and the coldest, and what they are actually called.',
    qs: [
      { q: 'Which is the driest non-polar desert on Earth?', c: ['The Atacama', 'The Sahara', 'The Gobi', 'The Namib'], f: 'Some weather stations there have never recorded rain.' },
      { q: 'What is the largest desert in the world, by the proper definition?', c: ['Antarctica', 'The Sahara', 'The Arabian', 'The Gobi'], f: 'A desert is defined by precipitation, not by heat — and Antarctica gets almost none.' },
      { q: 'Which is the deepest known point in any ocean?', c: ['The Challenger Deep', 'The Puerto Rico Trench', 'The Java Trench', 'The Tonga Trench'], f: 'In the Mariana Trench, about 10,900 metres down.' },
      { q: 'Measured from its own base on the sea floor, which mountain is the tallest?', c: ['Mauna Kea', 'Everest', 'Denali', 'Aconcagua'], f: 'Over 10,000 metres from base to summit; only 4,207 of them are above water.' },
      { q: 'Which peak is the farthest point from the centre of the Earth?', c: ['Chimborazo', 'Everest', 'Kilimanjaro', 'Elbrus'], f: 'The planet bulges at the equator, and Chimborazo sits almost on it.' },
      { q: 'What is the lowest exposed land on Earth?', c: ['The shore of the Dead Sea', 'Death Valley', 'The Qattara Depression', 'The Turfan Depression'], f: 'More than 400 metres below sea level, and still dropping.' },
      { q: 'The Gobi Desert lies mainly in which two countries?', c: ['Mongolia and China', 'China and Kazakhstan', 'Mongolia and Russia', 'China and Kyrgyzstan'], f: 'Gobi simply means "waterless place" in Mongolian.' },
      { q: 'Which desert is famous for fog that supports life where rain does not fall?', c: ['The Namib', 'The Kalahari', 'The Thar', 'The Sonoran'], f: 'Beetles there stand on their heads to let fog condense and run into their mouths.' },
      { q: 'What is the coldest permanently inhabited place on Earth generally said to be?', c: ['Oymyakon, Russia', 'Alert, Canada', 'Ushuaia, Argentina', 'Barrow, Alaska'], f: 'Recorded at about minus 67 degrees Celsius.' },
      { q: 'Which is the largest hot desert?', c: ['The Sahara', 'The Arabian', 'The Australian', 'The Kalahari'], f: 'Roughly the size of the United States, and only about a fifth of it is sand dunes.' },
      { q: 'The Dead Sea is so salty because it has what?', c: ['No outlet', 'Underground salt springs', 'Volcanic vents', 'A sealed sea floor'], f: 'Water leaves only by evaporation, and the salt stays.' },
      { q: 'Which is the largest sand island in the world?', c: ['K’gari (Fraser Island)', 'Padre Island', 'Sable Island', 'Bazaruto'], f: 'Off the coast of Queensland; it grows rainforest on pure sand.' }
    ] },

  { id: 'medicine', title: 'The Body in Latin and Greek', fmt: 'short',
    blurb: 'Medicine kept its old vocabulary, which means a good speller can very often work out what a word means without ever having been taught it.',
    qs: [
      { q: 'What does the prefix "cardi-" refer to?', c: ['The heart'], f: 'Greek kardia. Cardiac, cardiology, and the cardinal — the hinge, the heart of the matter.' },
      { q: 'What does "derm-" refer to?', c: ['The skin'], f: 'Greek derma. A pachyderm is a "thick-skin".' },
      { q: 'What does the suffix "-itis" mean?', c: ['Inflammation'], f: 'Appendicitis, arthritis, tonsillitis — all the same ending.' },
      { q: 'What does "hepat-" refer to?', c: ['The liver'], f: 'Greek hepar. Hepatic, hepatitis.' },
      { q: 'What does the root "oss-" or "osteo-" refer to?', c: ['Bone'], f: 'Latin os and Greek osteon. Ossify, osteopath.' },
      { q: 'What does "-ectomy" mean at the end of a word?', c: ['Surgical removal'], f: 'Greek ektome, "a cutting out". Appendectomy.' },
      { q: 'What does "neur-" refer to?', c: ['A nerve'], f: 'Greek neuron, originally a sinew or cord.' },
      { q: 'What does "pulmon-" refer to?', c: ['The lungs'], f: 'Latin pulmo. Pulmonary; and the Greek equivalent gives pneumonia.' },
      { q: 'What does "-algia" mean?', c: ['Pain'], f: 'Greek algos. Neuralgia, nostalgia — literally the pain of returning home.' },
      { q: 'What does "gastro-" refer to?', c: ['The stomach'], f: 'Greek gaster. A gastropod is a "stomach-foot" — a snail.' },
      { q: 'What does "ren-" or "nephro-" refer to?', c: ['The kidney'], f: 'Latin ren and Greek nephros; English uses both, renal and nephritis.' },
      { q: 'What does "-osis" usually indicate?', c: ['A condition or process, often abnormal'], f: 'Thrombosis, osmosis, neurosis.' },
      { q: 'What does "ocul-" or "ophthalm-" refer to?', c: ['The eye'], f: 'Ophthalmologist is one of the most misspelled words in English — the silent h after the p is the trap.' },
      { q: 'What does "my-" or "myo-" refer to?', c: ['Muscle'], f: 'Greek mys, which also meant mouse — a flexing bicep was thought to look like one moving under the skin.' }
    ] },

  { id: 'egypt', title: 'Egypt, and the Names of the Gods', fmt: 'mc',
    blurb: 'Three thousand years of it, and the names come to us through Greek — which is why almost none of them are what the Egyptians said.',
    qs: [
      { q: 'Which Egyptian god has the head of a jackal and attends the dead?', c: ['Anubis', 'Horus', 'Set', 'Thoth'], f: 'The Egyptian name was closer to Inpu; Anubis is the Greek.' },
      { q: 'Which god was the scribe of the gods, credited with inventing writing?', c: ['Thoth', 'Ptah', 'Khnum', 'Sobek'], f: 'Ibis-headed. The Greeks matched him with Hermes, giving "hermetic".' },
      { q: 'What was weighed against the heart of the dead in the hall of judgement?', c: ['A feather', 'A grain of wheat', 'A gold ring', 'A drop of water'], f: 'The feather of Maat, meaning truth and order.' },
      { q: 'Which goddess reassembled her murdered husband?', c: ['Isis', 'Nephthys', 'Hathor', 'Bastet'], f: 'Her cult reached as far as Roman Britain.' },
      { q: 'The Rosetta Stone carries the same text in three scripts. Which two Egyptian ones?', c: ['Hieroglyphic and demotic', 'Hieratic and Coptic', 'Demotic and Coptic', 'Hieroglyphic and hieratic'], f: 'The third was Greek, which is how the other two were cracked.' },
      { q: 'What is the Egyptian symbol of life, a looped cross, called?', c: ['Ankh', 'Djed', 'Was', 'Scarab'], f: 'The djed pillar means stability and the was sceptre means power — a full set.' },
      { q: 'Which pharaoh’s intact tomb was found in 1922?', c: ['Tutankhamun', 'Ramesses II', 'Akhenaten', 'Hatshepsut'], f: 'A minor king; the fame is entirely down to the tomb surviving.' },
      { q: 'Hatshepsut is notable for what?', c: ['Ruling as a female pharaoh', 'Building the Great Pyramid', 'Founding Alexandria', 'Defeating the Hittites'], f: 'She is often depicted with a false beard, the pharaonic uniform.' },
      { q: 'What does the word "pharaoh" originally mean?', c: ['Great house', 'God on earth', 'Lord of two lands', 'Son of the sun'], f: 'Per-aa — the palace, used for the person the way "the White House" is used today.' },
      { q: 'Which animal-headed god was associated with chaos and the desert?', c: ['Set', 'Bastet', 'Anubis', 'Apis'], f: 'His animal has never been reliably identified with any real species.' },
      { q: 'The scarab beetle was sacred because it was thought to do what?', c: ['Roll the sun across the sky', 'Guard the entrance to tombs', 'Guide ships on the Nile', 'Carry messages to the gods'], f: 'From watching dung beetles roll a ball — the god Khepri.' },
      { q: 'What is a cartouche?', c: ['An oval enclosing a royal name', 'A burial chamber', 'A ceremonial boat', 'A type of papyrus'], f: 'French for "cartridge" — Napoleon’s soldiers thought the ovals looked like gun cartridges.' }
    ] },

  { id: 'currency', title: 'The Money of the World', fmt: 'short',
    blurb: 'Currencies are mostly named after weights, kings, or the word for "round".',
    qs: [
      { q: 'What is the currency of Japan?', c: ['Yen'], f: 'The character means "round" — as do yuan and won, from the same source.' },
      { q: 'What is the currency of Poland?', c: ['Zloty'], f: 'It means "golden".' },
      { q: 'What is the currency of Turkey?', c: ['Lira'], f: 'From the Latin libra, a pound weight — as are the Italian lira and the British pound.' },
      { q: 'What is the currency of South Africa?', c: ['Rand'], f: 'After the Witwatersrand, the ridge where the gold was found.' },
      { q: 'What is the currency of Thailand?', c: ['Baht'], f: 'Originally a unit of weight for silver, about 15 grams.' },
      { q: 'What is the currency of Sweden?', c: ['Krona'], f: 'It means "crown"; Denmark and Norway use krone.' },
      { q: 'What is the currency of India?', c: ['Rupee'], f: 'From Sanskrit rupya, "wrought silver".' },
      { q: 'What is the currency of Israel?', c: ['Shekel'], f: 'One of the oldest currency names still in use — it appears in the Bible as a weight.' },
      { q: 'What is the currency of Vietnam?', c: ['Dong'], f: 'From the word for bronze, the metal of the old coins.' },
      { q: 'What is the currency of Peru?', c: ['Sol'], f: 'The sun — a nod to the Inca.' },
      { q: 'What is the currency of Ethiopia?', c: ['Birr'], f: 'It means "silver" in Amharic.' },
      { q: 'What is the currency of Ghana?', c: ['Cedi'], f: 'From the Akan word for cowrie shell, which was the money before the coin.' }
    ] },

  { id: 'emperors', title: 'The Roman Emperors', fmt: 'mc',
    blurb: 'Some of them for decades, some of them for weeks. In one year there were four.',
    qs: [
      { q: 'Who was the first Roman emperor?', c: ['Augustus', 'Julius Caesar', 'Tiberius', 'Nero'], f: 'Caesar was never emperor — he was dictator, which is a different office and the reason he was killed.' },
      { q: 'Which emperor built a wall across northern Britain?', c: ['Hadrian', 'Trajan', 'Claudius', 'Septimius Severus'], f: 'Eighty Roman miles, with a fort at every mile.' },
      { q: 'Which emperor wrote the Meditations, a book of Stoic philosophy?', c: ['Marcus Aurelius', 'Hadrian', 'Vespasian', 'Antoninus Pius'], f: 'Written in Greek, in camp, and apparently never meant to be published.' },
      { q: 'Under which emperor did the Roman Empire reach its greatest extent?', c: ['Trajan', 'Augustus', 'Hadrian', 'Diocletian'], f: 'His successor Hadrian immediately gave some of it back as indefensible.' },
      { q: 'Which emperor made Christianity legal across the empire?', c: ['Constantine', 'Theodosius', 'Nero', 'Julian'], f: 'The Edict of Milan, 313. Theodosius later made it the state religion.' },
      { q: 'Which emperor divided the empire into four parts to be ruled together?', c: ['Diocletian', 'Constantine', 'Valens', 'Honorius'], f: 'The tetrarchy — "rule of four".' },
      { q: 'Which emperor is said to have made his horse a consul?', c: ['Caligula', 'Nero', 'Commodus', 'Elagabalus'], f: 'The story comes from hostile sources and may be a joke about how useless he thought the senate.' },
      { q: 'Which emperor began the Colosseum?', c: ['Vespasian', 'Titus', 'Domitian', 'Nero'], f: 'Its proper name is the Flavian Amphitheatre, after his family.' },
      { q: 'What was the "Year of the Four Emperors"?', c: ['69 AD', '96 AD', '193 AD', '235 AD'], f: 'Galba, Otho, Vitellius and Vespasian, in that order and mostly violently.' },
      { q: 'Which emperor was the last to rule a united empire?', c: ['Theodosius I', 'Constantine', 'Justinian', 'Romulus Augustulus'], f: 'He split it between his two sons on his death in 395, and it never rejoined.' },
      { q: 'The word "palace" comes from which Roman hill?', c: ['The Palatine', 'The Capitoline', 'The Aventine', 'The Quirinal'], f: 'Where the emperors lived — the hill named the building type.' },
      { q: 'Which emperor’s name became the German and Russian words for emperor?', c: ['Caesar', 'Augustus', 'Constantine', 'Justinian'], f: 'Kaiser and Tsar — a family name that became a job title twice.' }
    ] },

  { id: 'volcano', title: 'Volcanoes, Faults and Deep Time', fmt: 'mc',
    blurb: 'Geology has the best vocabulary of any science, and most of it is Latin for something obvious.',
    qs: [
      { q: 'What is molten rock called while it is still underground?', c: ['Magma', 'Lava', 'Tephra', 'Pumice'], f: 'It is only lava once it is out.' },
      { q: 'The 1883 eruption of Krakatoa was heard how far away?', c: ['About 4,800 km', 'About 500 km', 'About 1,200 km', 'About 200 km'], f: 'Rodrigues, near Mauritius — the loudest sound in recorded history.' },
      { q: 'Which volcano destroyed Pompeii?', c: ['Vesuvius', 'Etna', 'Stromboli', 'Vulcano'], f: 'In 79 AD. Pliny the Younger described it from across the bay, giving us "Plinian eruption".' },
      { q: 'What is the hardest mineral on the Mohs scale?', c: ['Diamond', 'Corundum', 'Topaz', 'Quartz'], f: 'The scale is only an order, not a measure: diamond is about four times harder than corundum, one step below.' },
      { q: 'What is the ring of volcanoes and faults around the Pacific called?', c: ['The Ring of Fire', 'The Pacific Arc', 'The Mid-Ocean Belt', 'The Andesite Line'], f: 'About 75 percent of the world’s active volcanoes sit on it.' },
      { q: 'Which rock forms from cooled lava that trapped gas, and floats?', c: ['Pumice', 'Basalt', 'Obsidian', 'Granite'], f: 'Rafts of it have been seen drifting across whole oceans after eruptions.' },
      { q: 'What does the word "caldera" mean?', c: ['A cauldron', 'A crater', 'A pit', 'A mouth'], f: 'Spanish, from Latin caldaria — a cooking pot.' },
      { q: 'Which scale measures earthquake energy release, replacing the Richter scale for large quakes?', c: ['The moment magnitude scale', 'The Mercalli scale', 'The Beaufort scale', 'The Rossi-Forel scale'], f: 'Mercalli measures felt intensity, which is a different question.' },
      { q: 'What is the boundary where two plates slide past each other called?', c: ['A transform fault', 'A subduction zone', 'A rift valley', 'A hotspot'], f: 'The San Andreas is the famous one.' },
      { q: 'What is obsidian?', c: ['Volcanic glass', 'Compressed ash', 'A metamorphic rock', 'Fossilised resin'], f: 'It cools too fast to form crystals. Sharper than a surgical blade when freshly knapped.' },
      { q: 'Which Icelandic word for a glacial flood caused by a volcano has entered English?', c: ['Jokulhlaup', 'Fjord', 'Geyser', 'Tundra'], f: 'Geyser is also Icelandic — from Geysir, the name of one particular spring.' },
      { q: 'What is a "hotspot" volcano, such as Hawaii, sitting on?', c: ['A plume of rising mantle', 'A plate boundary', 'A subducting slab', 'A rift'], f: 'The plate moves and the plume does not, which is why the islands form a line.' }
    ] },

  { id: 'ciphers', title: 'Codes, Ciphers and Secret Writing', fmt: 'short',
    blurb: 'The oldest arms race there is, and the one that eventually built the computer.',
    qs: [
      { q: 'What is a cipher that shifts every letter a fixed number of places called?', c: ['A Caesar cipher'], f: 'He is said to have used a shift of three.' },
      { q: 'What machine did the Germans use to encipher messages in the Second World War?', c: ['Enigma'], f: 'Broken first by Polish mathematicians, then at Bletchley Park.' },
      { q: 'What is the practice of hiding a message so that nobody knows it is there at all?', c: ['Steganography'], f: 'Greek for "covered writing" — invisible ink, microdots, a message under a wax tablet.' },
      { q: 'What is the study of breaking codes called?', c: ['Cryptanalysis'], f: 'As opposed to cryptography, which is making them.' },
      { q: 'Which Arab scholar described frequency analysis in the ninth century?', c: ['Al-Kindi'], f: 'Counting how often each letter appears — the technique that killed simple substitution ciphers for good.' },
      { q: 'What is a cipher alphabet written on a strip wrapped round a rod called?', c: ['A scytale'], f: 'Spartan. Unwrap the strip and the letters mean nothing.' },
      { q: 'What language did American forces use as an unbreakable code in the Pacific?', c: ['Navajo'], f: 'Spoken by code talkers; it had no written form and almost no non-Navajo speakers.' },
      { q: 'What is the name for a key used once and then destroyed, which is mathematically unbreakable?', c: ['A one-time pad'], f: 'Unbreakable only if the key is truly random, as long as the message, and never reused.' },
      { q: 'What does the "public" in public-key cryptography mean?', c: ['The encrypting key can be published safely'], f: 'You can lock a box with a key everyone has, if only you have the one that opens it.' },
      { q: 'What is the Vigenere cipher’s key innovation over the Caesar?', c: ['The shift changes for every letter'], f: 'Called le chiffre indechiffrable for three hundred years, until Babbage broke it.' },
      { q: 'What is the term for the original readable message, before encryption?', c: ['Plaintext'], f: 'The encrypted version is ciphertext.' },
      { q: 'Which undeciphered manuscript is written in an unknown script and full of unidentifiable plants?', c: ['The Voynich manuscript'], f: 'Carbon-dated to the early 1400s. Nobody has read a word of it.' }
    ] },

  { id: 'silkroad', title: 'The Silk Road', fmt: 'mc',
    blurb: 'Not a road, and not only silk. A network of routes that moved goods, religions, diseases and words for fifteen hundred years.',
    qs: [
      { q: 'What was the eastern end of the Silk Road, in most periods?', c: ['Chang’an (modern Xi’an)', 'Beijing', 'Guangzhou', 'Kaifeng'], f: 'The Terracotta Army is buried nearby.' },
      { q: 'Which desert did the routes split to avoid, going north and south?', c: ['The Taklamakan', 'The Gobi', 'The Karakum', 'The Thar'], f: 'Its name is often glossed as "you go in and you do not come out", which may be folk etymology but fits.' },
      { q: 'Which religion spread from India to China largely along these routes?', c: ['Buddhism', 'Zoroastrianism', 'Manichaeism', 'Nestorian Christianity'], f: 'All four did, in fact — but Buddhism is the one that stayed.' },
      { q: 'What did the Chinese guard as a state secret for centuries?', c: ['How silk is made', 'How porcelain is fired', 'How paper is made', 'How gunpowder is mixed'], f: 'Sericulture. Legend says two monks smuggled silkworm eggs out in a hollow staff.' },
      { q: 'Which city in modern Uzbekistan was a great Silk Road hub under Timur?', c: ['Samarkand', 'Tashkent', 'Khiva', 'Bukhara'], f: 'Bukhara and Khiva were hubs too; Samarkand was the capital.' },
      { q: 'Which Venetian’s account of the route became the most famous in Europe?', c: ['Marco Polo', 'Niccolo Conti', 'Giovanni Carpini', 'Odoric of Pordenone'], f: 'Dictated to a writer of romances while in prison, which may explain some of it.' },
      { q: 'What disease is generally thought to have travelled west along these routes in the 1340s?', c: ['The Black Death', 'Smallpox', 'Cholera', 'Typhus'], f: 'Carried by fleas on rats, and by people.' },
      { q: 'Paper-making reached the Islamic world after which battle, from captured craftsmen?', c: ['Talas, 751', 'Manzikert, 1071', 'Ain Jalut, 1260', 'Badr, 624'], f: 'From Samarkand it reached Baghdad, then Spain, then the rest of Europe.' },
      { q: 'Which animal made the desert crossings possible?', c: ['The Bactrian camel', 'The dromedary', 'The yak', 'The mule'], f: 'Two humps, and a tolerance for cold that the one-humped dromedary lacks.' },
      { q: 'Which fruit’s English name comes from the Persian for "peach of Armenia"?', c: ['Apricot', 'Nectarine', 'Quince', 'Pomegranate'], f: 'The word travelled through Arabic and Spanish before it reached English.' },
      { q: 'Which Chinese invention reached Europe by these routes and changed warfare?', c: ['Gunpowder', 'The compass', 'The crossbow', 'The stirrup'], f: 'The compass and printing came the same way; the stirrup came earlier, from the steppe.' },
      { q: 'What were the caravan inns along the route called?', c: ['Caravanserais', 'Khanates', 'Bazaars', 'Madrasas'], f: 'Persian: a palace for caravans. Usually a day’s march apart.' }
    ] },

  { id: 'kitchen', title: 'Words from the Kitchen', fmt: 'square',
    blurb: 'Cooking words come from everywhere, and most of them describe an action rather than a dish. Find them in the square.',
    qs: [
      { q: 'To cook slowly in liquid just below boiling', c: ['simmer'] },
      { q: 'To brown meat quickly at high heat to seal it', c: ['sear'] },
      { q: 'To beat air into a mixture', c: ['whisk'] },
      { q: 'To cook gently in a small amount of liquid, of eggs or fish', c: ['poach'] },
      { q: 'To cut into very small cubes', c: ['dice'] },
      { q: 'To fold ingredients together gently', c: ['blend'] },
      { q: 'To soak in a seasoned liquid before cooking', c: ['marinate'] },
      { q: 'To coat with flour, egg and crumbs', c: ['bread'] },
      { q: 'A thickening of flour and fat, the base of many sauces', c: ['roux'] },
      { q: 'To cook briefly in boiling water then plunge into cold', c: ['blanch'] },
      { q: 'To scrape food into shreds against a rough surface', c: ['grate'] },
      { q: 'To spoon cooking juices back over the food', c: ['baste'] }
    ] },

  { id: 'raptors', title: 'Birds of Prey', fmt: 'mc',
    blurb: 'Raptor, from the Latin rapere, to seize — the same root as rapt, rapture and ravish.',
    qs: [
      { q: 'Which bird is the fastest animal on Earth in a dive?', c: ['The peregrine falcon', 'The golden eagle', 'The goshawk', 'The gyrfalcon'], f: 'Recorded above 380 km/h. Its nostrils have baffles so it can breathe at that speed.' },
      { q: 'What is a group of owls called?', c: ['A parliament', 'A murder', 'A charm', 'A gaggle'], f: 'A murder is crows; a charm is finches.' },
      { q: 'Which vulture drops bones from a height to break them?', c: ['The bearded vulture', 'The griffon vulture', 'The Egyptian vulture', 'The king vulture'], f: 'Also called the lammergeier — German for "lamb-vulture", a libel; it eats bones.' },
      { q: 'What is the name for a young hawk taken for falconry before it can fly?', c: ['An eyas', 'A haggard', 'A tiercel', 'A passager'], f: 'A haggard is an adult caught wild; a tiercel is a male, a third smaller than the female.' },
      { q: 'Which owl is the largest in the world by wingspan?', c: ['Blakiston’s fish owl', 'The snowy owl', 'The great horned owl', 'The barn owl'], f: 'Found in Russia, Japan and China; it fishes.' },
      { q: 'Why can owls fly almost silently?', c: ['Fringed feather edges break up the air', 'They glide without flapping', 'Their bones are hollow', 'They fly only downwind'], f: 'The comb-like leading edge is being copied for quieter wind turbines.' },
      { q: 'What is the hood used in falconry for?', c: ['To keep the bird calm', 'To protect its eyes in flight', 'To carry it in rain', 'To mark its owner'], f: 'A bird that cannot see does not startle — the source of "hoodwinked".' },
      { q: 'The osprey has an unusual foot adaptation. What is it?', c: ['A reversible outer toe', 'Webbed toes', 'Four forward-facing toes', 'No hind claw'], f: 'It can hold a fish with two toes in front and two behind, and carries it head-first for aerodynamics.' },
      { q: 'Which raptor is also called the fish eagle and appears on several national emblems?', c: ['The bald eagle', 'The harpy eagle', 'The secretary bird', 'The kite'], f: 'Not bald — "balde" was an old word for white.' },
      { q: 'The secretary bird hunts mainly how?', c: ['On foot, stamping on prey', 'By diving from height', 'By hovering', 'By swimming'], f: 'It can deliver a blow with about five times its own body weight of force.' },
      { q: 'What does the word "mews", the place hawks were kept, originally refer to?', c: ['Moulting', 'Mewing calls', 'A stable', 'A courtyard'], f: 'From French muer, to change — the birds were shut up while they moulted. The London Mews were royal hawk houses before they were stables.' },
      { q: 'Which is the only bird of prey to hunt cooperatively in family groups, hunting in relays?', c: ['Harris’s hawk', 'The kestrel', 'The merlin', 'The buzzard'], f: 'Which is why falconers like them: they are used to working with a team.' }
    ] },

  { id: 'trees', title: 'Trees and What They Are For', fmt: 'short',
    blurb: 'Every one of these trees gave English at least one word, and most gave a trade.',
    qs: [
      { q: 'Which tree’s wood was traditionally used for English longbows?', c: ['Yew'], f: 'So much was imported that Continental yew stocks were stripped.' },
      { q: 'Which tree produces the cork used in bottles?', c: ['Cork oak'], f: 'The bark is stripped every nine years or so and grows back.' },
      { q: 'From which tree do we get the drug aspirin’s original compound?', c: ['Willow'], f: 'Salicin — from Salix, the willow’s Latin name.' },
      { q: 'Which tree is the source of natural rubber?', c: ['The rubber tree (Hevea)'], f: 'Smuggled out of Brazil to Kew and then to Malaya, which ended the Amazon rubber boom.' },
      { q: 'Which tree’s seeds give us chocolate?', c: ['Cacao'], f: 'Theobroma cacao — "food of the gods".' },
      { q: 'Which tree gives the world’s tallest living specimens?', c: ['Coast redwood'], f: 'Over 115 metres. The giant sequoia is bulkier but shorter.' },
      { q: 'Which tree, sacred in India, is a fig that drops aerial roots to form new trunks?', c: ['Banyan'], f: 'Named for the banias, Indian traders who sat under them.' },
      { q: 'Which tree is the source of the spice cinnamon?', c: ['The cinnamon tree (Cinnamomum)'], f: 'The spice is the inner bark, rolled as it dries.' },
      { q: 'Which conifer is deciduous, losing its needles every autumn?', c: ['Larch'], f: 'Almost alone among conifers, along with the dawn redwood and the bald cypress.' },
      { q: 'Which tree species is considered a living fossil, unchanged for 200 million years, with fan-shaped leaves?', c: ['Ginkgo'], f: 'Several survived the Hiroshima blast and are still growing.' },
      { q: 'From which tree does the timber teak come, prized for shipbuilding?', c: ['Teak'], f: 'Its natural oils resist water and insects without treatment.' },
      { q: 'Which tree gives us maple syrup, and how many litres of sap make one of syrup?', c: ['Sugar maple, about 40 litres'], f: 'Boiled down; the ratio is roughly forty to one.' }
    ] },

  { id: 'flags', title: 'Flags and What Is On Them', fmt: 'mc',
    blurb: 'Vexillology, from the Latin vexillum, a military standard. A flag is a compressed history lesson.',
    qs: [
      { q: 'Which country’s flag is the only non-quadrilateral national flag?', c: ['Nepal', 'Switzerland', 'Vatican City', 'Qatar'], f: 'Two stacked pennants; its exact geometry is written into the constitution.' },
      { q: 'The maple leaf on the Canadian flag has how many points?', c: ['Eleven', 'Nine', 'Thirteen', 'Seven'], f: 'A stylised leaf, designed partly to look steady in wind-tunnel tests.' },
      { q: 'Which country’s flag shows a bird of prey eating a snake?', c: ['Mexico', 'Egypt', 'Albania', 'Zambia'], f: 'An Aztec founding legend: build the city where you see it.' },
      { q: 'The Union Jack combines the crosses of which three saints?', c: ['George, Andrew and Patrick', 'George, David and Andrew', 'Andrew, Patrick and David', 'George, Patrick and Columba'], f: 'Wales is not represented — it was already joined to England when the flag was designed.' },
      { q: 'Which country’s flag features a cedar tree?', c: ['Lebanon', 'Cyprus', 'Israel', 'Jordan'], f: 'The cedars of Lebanon appear in the Bible and on the currency too.' },
      { q: 'The Brazilian flag carries a motto in Portuguese. What does it say?', c: ['Order and Progress', 'Liberty and Union', 'God and Country', 'Peace and Justice'], f: 'Ordem e Progresso, taken from the philosophy of Auguste Comte.' },
      { q: 'Which flag shows the night sky over a specific city on a specific date?', c: ['Brazil', 'Australia', 'Samoa', 'Papua New Guinea'], f: 'Rio de Janeiro on the morning of 15 November 1889, the day the republic was proclaimed.' },
      { q: 'Which country’s flag is a solid single colour with no design at all?', c: ['Libya, from 1977 to 2011', 'Bhutan', 'Mauritania', 'Djibouti'], f: 'Plain green, and the only single-colour national flag in modern history.' },
      { q: 'The dragon on the flag of Bhutan is holding what?', c: ['Jewels', 'A sword', 'A scroll', 'A lotus'], f: 'Representing the wealth of the nation. Bhutan’s name for itself means "land of the thunder dragon".' },
      { q: 'Which Scandinavian design element appears on the flags of Denmark, Sweden, Norway, Finland and Iceland?', c: ['An off-centre cross', 'A crown', 'A ship', 'A star'], f: 'The Nordic cross, with its centre shifted towards the hoist.' },
      { q: 'How many stripes are on the flag of the United States, and why?', c: ['Thirteen, for the original colonies', 'Fifty, for the states', 'Twelve, for the months', 'Fifteen, for the first fifteen states'], f: 'It briefly had fifteen stripes; they went back to thirteen when it became clear the flag would run out of room.' },
      { q: 'The flag of Mozambique is the only national flag to feature what modern object?', c: ['An assault rifle', 'A satellite', 'A telephone', 'A bicycle'], f: 'An AK-47 crossed with a hoe, over an open book.' }
    ] },

  /* ---- rounds 26-35: the speller's own ground ------------------------------
     The first twenty-five rounds are general knowledge that happens to be told
     through words. These ten are the other way round: every one of them is
     about why a word is SPELLED the way it is. A speller who knows that the b
     in debt was put there by sixteenth-century scholars, and that the k in knee
     was once said aloud, is not memorising two more words — they are holding a
     rule that decides a hundred they have never seen.
     Origin rounds ask what a root MEANT, never "which language gave us this". */

  { id: 'silentletters', title: 'Silent Letters, and Who Left Them There', fmt: 'mc',
    blurb: 'Almost every silent letter in English is a fossil. Some were spoken and went quiet; others were never spoken at all, and were inserted by scholars who wanted the word to look like its Latin ancestor.',
    qs: [
      { q: 'The b in debt is silent and always was. Why was it put in?', c: ['To show the word came from Latin debitum', 'To mark a long vowel', 'To separate it from another word', 'It was once pronounced'], f: 'Middle English had dette, straight from Old French. Sixteenth-century scholars re-spelled it to display the Latin. The same hand added the b to doubt.' },
      { q: 'The k in knee and knight was once said aloud. Which modern language still pronounces that cluster in its word for knee?', c: ['German', 'French', 'Italian', 'Spanish'], f: 'German Knie. English stopped saying the k in the seventeenth century and kept the letter for another four hundred years.' },
      { q: 'The s in island was inserted because of a mistaken link to which other word?', c: ['Isle', 'Sand', 'Inland', 'Ireland'], f: 'Island is Old English igland and had no s. Isle comes from Latin insula by a completely separate road. The s is a borrowed error.' },
      { q: 'The p in receipt was added to match the Latin recepta. Which related word kept the p AND pronounces it?', c: ['Reception', 'Receive', 'Recipient', 'Recess'], f: 'Receipt, receive and reception are one family; only reception and recipient say the p out loud.' },
      { q: 'The l in salmon is silent. What was the word in Old French, before scholars restored the Latin?', c: ['Saumon', 'Salmone', 'Samoun', 'Salmoun'], f: 'From Latin salmo. English took the French saumon, then put the l back to show the ancestor, without ever saying it.' },
      { q: 'The h in ghost was not in the Old English gast. Who is generally blamed for it?', c: ['Caxton’s Flemish typesetters', 'Samuel Johnson', 'The scribes of Chaucer', 'Noah Webster'], f: 'Flemish compositors in England’s first print shop spelled it the Flemish way, gheest. The h stuck to ghost, ghastly and aghast.' },
      { q: 'In autumn, column and hymn the n is silent. What happens to it in autumnal and columnist?', c: ['It is pronounced again', 'It stays silent', 'It is dropped from the spelling', 'It becomes an m'], f: 'The Latin -mn survives whole; English only silences the n when it lands at the end of the word.' },
      { q: 'The w in sword, two and answer is silent. Which of these still says its w?', c: ['Swore', 'Sword', 'Answer', 'Two'], f: 'The w went quiet before a rounded vowel. Swore kept it because the following vowel is different.' },
      { q: 'The t is silent in castle, listen and whistle. What sound cluster is it caught between?', c: ['s and l', 'a and e', 'c and a', 'n and e'], f: 'English quietly drops the middle consonant of an awkward three-consonant run — the same thing happened in Christmas and often.' },
      { q: 'The b in subtle came back from Latin subtilis. What did subtilis literally describe?', c: ['Finely woven', 'Quietly spoken', 'Deeply hidden', 'Slowly made'], f: 'Sub + tela, "under the web" — the fineness of a cloth. The b was reinserted in the fourteenth century.' },
      { q: 'Gnaw, gnat and gnome all begin with a silent g. Which one is NOT an old Germanic word that once said it?', c: ['Gnome', 'Gnaw', 'Gnat', 'Gnash'], f: 'Gnome was coined in Latin by Paracelsus in the sixteenth century; its silent g is an imitation of the older native words.' },
      { q: 'The c in scissors came from a wrong guess about its parent. Which Latin word were the spellers reaching for?', c: ['Scindere, to cut or split', 'Cisorium, a cutting tool', 'Sectio, a cutting', 'Secare, to cut'], f: 'The true parent is cisorium. Scindere was assumed, and the c was added to show it — the same instinct that put the b in debt, applied to the wrong ancestor.' }
    ] },

  { id: 'doubling', title: 'Double or Single?', fmt: 'short',
    blurb: 'Doubled consonants are not decoration. English doubles a letter to protect a short vowel, and where the stress falls decides whether it doubles at all. Write each answer out in full.',
    qs: [
      { q: 'Write the past tense of "occur".', c: ['occurred'], f: 'Stress on the last syllable doubles the consonant: occur → occurred. Offer, stressed on the first, does not: offered.' },
      { q: 'Write the past tense of "benefit".', c: ['benefited'], f: 'Stress is on the FIRST syllable, so no doubling. Benefitted appears in British usage but the rule points the other way.' },
      { q: 'Write the word meaning "took in and made part of itself", from ab- and sorbere.', c: ['absorbed'], f: 'One b, one r. The related noun absorption drops the b sound of absorb entirely.' },
      { q: 'Write the adjective from "regret".', c: ['regrettable'], f: 'Stressed final syllable, so the t doubles — and the -able ending survives because regret is a whole English word.' },
      { q: 'Write the word for a person who travels on foot, from Latin pedester.', c: ['pedestrian'], f: 'No doubling anywhere. The temptation is a double d, by false analogy with peddler.' },
      { q: 'Write the word meaning "needed" or "essential", built on "requisite".', c: ['prerequisite'], f: 'Two words joined, and neither doubles at the seam: pre + requisite.' },
      { q: 'Write the noun meaning "the state of being embarrassed".', c: ['embarrassment'], f: 'Two r, two s. From Portuguese embaraçar, to entangle — the doubling came in through French.' },
      { q: 'Write the word meaning "living quarters", from Latin accommodare.', c: ['accommodation'], f: 'Two c and two m — the most commonly misspelled long word in English surveys. Ad + com + modus, "to fit to a measure".' },
      { q: 'Write the past tense of "travel" as it is spelled in American usage.', c: ['traveled'], f: 'One l in the United States, two in Britain. Webster cut the doubling where the stress does not fall on the final syllable.' },
      { q: 'Write the word for the tool a carpenter uses to make a surface flat, and the past tense verb from it.', c: ['planed'], f: 'A single consonant plus e keeps the vowel long: planed. Doubling it makes planned, a different word entirely.' },
      { q: 'Write the noun meaning "a formal agreement between nations".', c: ['committee'], f: 'Two m, two t, two e — the champion of doubled letters. From commit, whose final syllable is stressed.' },
      { q: 'Write the word meaning "happening at the same time", from sub- and cedere.', c: ['successive'], f: 'Two c and two s. The cc is pronounced ks, which is why the ear gives no warning.' }
    ] },

  { id: 'ableible', title: 'Is It -able or -ible?', fmt: 'mc',
    blurb: 'There is a rule, and it is nearly reliable: -able attaches to whole English words, -ible to Latin stems that cannot stand alone. Comfort is a word, so comfortable. Aud is not, so audible.',
    qs: [
      { q: 'Which of these is spelled correctly?', c: ['Collapsible', 'Collapsable', 'Collapseable', 'Collapsibel'], f: 'Collaps- is a Latin stem, not a free-standing English word, so it takes -ible.' },
      { q: 'Which of these is spelled correctly?', c: ['Comfortable', 'Comfortible', 'Comfortabel', 'Comfortible'], f: 'Comfort is a complete English word. Whole word, -able.' },
      { q: 'Which of these is spelled correctly?', c: ['Perceptible', 'Perceptable', 'Percieptible', 'Perceptibel'], f: 'Percept- cannot stand alone in English, so -ible. Its cousin perceivable, built on the whole word perceive, takes -able.' },
      { q: 'Which of these is spelled correctly?', c: ['Indispensable', 'Indispensible', 'Indispensabel', 'Indispencable'], f: 'One of the rule’s honest exceptions — dispens- is not a free word, yet the ending is -able.' },
      { q: 'Which of these is spelled correctly?', c: ['Legible', 'Legable', 'Ledgible', 'Legibel'], f: 'From legere, to read. No English word leg means read, so -ible.' },
      { q: 'Which of these is spelled correctly?', c: ['Noticeable', 'Noticable', 'Noticeible', 'Notisable'], f: 'The e is kept to kelp the c stay soft. Drop it and you would be reading "notikable".' },
      { q: 'Which of these is spelled correctly?', c: ['Reversible', 'Reversable', 'Reversibel', 'Reverseable'], f: 'Vers- is the Latin stem for turning. Reverse is a word, but the ending settled on -ible centuries ago.' },
      { q: 'Which of these is spelled correctly?', c: ['Manageable', 'Managable', 'Manageible', 'Managible'], f: 'The e survives to keep the g soft, exactly as in noticeable and changeable.' },
      { q: 'Which of these is spelled correctly?', c: ['Compatible', 'Compatable', 'Compatibel', 'Compatiable'], f: 'From compati, to suffer with. No free English stem, so -ible.' },
      { q: 'Which of these is spelled correctly?', c: ['Inevitable', 'Inevitible', 'Inevitabel', 'Ineveitable'], f: 'In + evitare, to avoid — "not avoidable". The -able here comes straight from the Latin -abilis.' },
      { q: 'Which of these is spelled correctly?', c: ['Irresistible', 'Irresistable', 'Irresistibel', 'Iresistible'], f: 'Two r at the front, and -ible at the back. Resist is a word, which is exactly why this one is so often got wrong.' },
      { q: 'Which of these is spelled correctly?', c: ['Dependable', 'Dependible', 'Dependabel', 'Depenable'], f: 'Depend is a whole word, so the rule holds: -able.' }
    ] },

  { id: 'arabicwords', title: 'What the Arabic Root Meant', fmt: 'mc',
    blurb: 'English took a great deal from Arabic, most of it through Spain and Italy, and much of it still carries the Arabic definite article al- fused to the front where English speakers could not hear the join.',
    qs: [
      { q: 'Algebra comes from al-jabr. What did al-jabr describe?', c: ['The reuniting of broken parts', 'The counting of herds', 'The measuring of land', 'The dividing of an estate'], f: 'From a ninth-century treatise by al-Khwarizmi, whose own name, worn down through Latin, gave English algorithm.' },
      { q: 'Admiral has a d that does not belong to its root. What did the original amir al-bahr mean?', c: ['Commander of the sea', 'Keeper of the fleet', 'Prince of the shore', 'Master of the winds'], f: 'The d crept in through medieval Latin, on the assumption that the word was related to admirari, to wonder at.' },
      { q: 'Magazine reached English meaning a storehouse. What was a makhzan?', c: ['A storehouse', 'A marketplace', 'A ledger', 'A watchtower'], f: 'A store of gunpowder, then a store of writing. The paper magazine and the rifle magazine are the same word.' },
      { q: 'Cipher and zero are the same Arabic word twice. What did sifr mean?', c: ['Empty', 'Round', 'Small', 'Nothing gained'], f: 'It travelled through Latin zephirum to Italian zero, and separately through Old French to cipher.' },
      { q: 'Alcohol first named something quite unlike a drink. What was al-kuhl?', c: ['A fine powder used as eye paint', 'A distilled perfume', 'A medicinal wine', 'A burning oil'], f: 'The sense moved from the powder, to any refined essence, to the spirit distilled from wine.' },
      { q: 'A sofa was originally not furniture. What was a suffa?', c: ['A raised bench along a wall', 'A woven mat', 'A cushioned saddle', 'A shaded courtyard'], f: 'Raised, carpeted and built into the room. English kept the shape and threw away the wall.' },
      { q: 'What did the Arabic qutn name?', c: ['Cotton', 'Linen', 'Silk', 'Wool'], f: 'It entered English through Old French coton in the thirteenth century, along with the trade itself.' },
      { q: 'Giraffe comes from zarafa. Which European language passed it to English with the f?', c: ['Italian', 'German', 'Dutch', 'Portuguese'], f: 'Italian giraffa. Earlier English called the animal a camelopard, a camel crossed with a leopard.' },
      { q: 'Alchemy carries al- plus kimiya. What is the most widely accepted source of kimiya?', c: ['A Greek word for the pouring or fusing of metals', 'An Egyptian word for black earth', 'A Persian word for gold', 'An Aramaic word for fire'], f: 'Greek khymeia. Strip the Arabic article from alchemy and what is left is chemistry.' },
      { q: 'Which of these four words did NOT come to English through Arabic?', c: ['Almond', 'Alcove', 'Algebra', 'Alkali'], f: 'Almond is Greek by way of Latin and French; its al- is a coincidence, which is precisely the trap.' },
      { q: 'Sugar reached English from sukkar, but where does that word ultimately come from?', c: ['Sanskrit sharkara, "gravel"', 'Persian shakar, "sweet"', 'Greek sakkharon, "cane juice"', 'Egyptian seqer, "crystal"'], f: 'Sanskrit named it for what it looked like: grit. It travelled Sanskrit to Persian to Arabic to Italian to English.' },
      { q: 'A safari is a journey. What does the Arabic safar mean?', c: ['A journey or travel', 'A hunt', 'A caravan of camels', 'A desert crossing'], f: 'It reached English through Swahili, which had taken it from Arabic — one of the few Arabic words that arrived by way of East Africa.' }
    ] },

  { id: 'sanskritwords', title: 'What the Sanskrit Root Meant', fmt: 'short',
    blurb: 'Sanskrit words reached English by two very different roads: the scholarly one, through translation, and the everyday one, through three centuries of trade and empire. Write the English word.',
    qs: [
      { q: 'From avatara, "a descent" — the coming down of a god into the world. Which English word?', c: ['avatar'], f: 'The computing sense, a body you wear in a world you are visiting, is closer to the Sanskrit than it looks.' },
      { q: 'From jangala, "rough and waterless ground". Which English word?', c: ['jungle'], f: 'The Sanskrit meant dry scrub. English heard it in India, applied it to dense wet forest, and reversed the meaning.' },
      { q: 'From Jagannatha, "lord of the world" — a temple chariot so large it could not be stopped. Which English word?', c: ['juggernaut'], f: 'English took the chariot and left the god behind.' },
      { q: 'From pandita, "learned" or "scholar". Which English word?', c: ['pundit'], f: 'It meant a Hindu scholar of Sanskrit law before it meant anyone with opinions on television.' },
      { q: 'From champo, "to press or knead". Which English word?', c: ['shampoo'], f: 'It meant a massage for a century before it meant anything to do with hair.' },
      { q: 'From mantra, built on man- "to think" plus an instrument ending. Which English word?', c: ['mantra'], f: 'Literally an instrument of thought, the way a lever is an instrument of lifting.' },
      { q: 'From nirvana, "a blowing out", as of a flame. Which English word?', c: ['nirvana'], f: 'Not a place. The extinguishing of the fire of craving.' },
      { q: 'From guru, whose first meaning is "heavy" or "weighty". Which English word?', c: ['guru'], f: 'A teacher weighty with learning — the same metaphor as English gravity and grave.' },
      { q: 'From naranga, the name of the fruit, which lost its first letter to French. Which English word?', c: ['orange'], f: 'Une norenge became une orenge. The colour is named after the fruit, not the other way round.' },
      { q: 'From khanda, "a piece" or "broken sugar". Which English word?', c: ['candy'], f: 'Through Persian and Arabic qandi to French sucre candi, sugar in pieces.' },
      { q: 'From cakra, "wheel" or "circle". Which English word for a wheel-shaped centre of energy?', c: ['chakra'], f: 'The same Indo-European root that gives English wheel and Greek kuklos, cycle.' },
      { q: 'From upa-ni-shad, "sitting down near" — a pupil at a teacher’s feet. Which English word?', c: ['upanishad'], f: 'The name describes the teaching method, not the subject.' }
    ] },

  { id: 'foreignplurals', title: 'Plurals With Foreign Passports', fmt: 'mc',
    blurb: 'A word that arrives from Latin or Greek often brings its own plural with it, and refuses the English -s for a century or two before giving in. Some have given in. Some never will.',
    qs: [
      { q: 'What is the singular of "data"?', c: ['Datum', 'Data', 'Data point', 'Datus'], f: 'Latin neuter plural of datum, "a thing given". In careful scientific writing data still takes a plural verb.' },
      { q: 'What is the plural of "criterion"?', c: ['Criteria', 'Criterions', 'Criterias', 'Criterium'], f: 'Greek, not Latin — which is why it is not criteriums. The same pattern gives phenomenon and phenomena.' },
      { q: 'What is the singular of "alumni"?', c: ['Alumnus', 'Alumnum', 'Alumni', 'Alumna'], f: 'Alumnus is male, alumna female, alumnae a group of women, alumni a group of men or a mixed group.' },
      { q: 'What is the plural of "crisis"?', c: ['Crises', 'Crisises', 'Crisi', 'Crisae'], f: 'Greek -is becomes -es: crisis, thesis, analysis, basis, all the same way.' },
      { q: 'What is the plural of "cactus" that follows the Latin?', c: ['Cacti', 'Cactuses', 'Cactae', 'Cactii'], f: 'Both cacti and cactuses are accepted; cactii, with two i, is not a form in any language.' },
      { q: 'What is the plural of "index" in mathematics?', c: ['Indices', 'Indexes', 'Indicies', 'Index'], f: 'Indices for the mathematical sense, indexes for the ones at the back of books. The same word split in two.' },
      { q: 'What is the singular of "bacteria"?', c: ['Bacterium', 'Bacteria', 'Bacterius', 'Bacter'], f: 'From Greek bakterion, "little staff", after the shape of the first ones seen down a lens.' },
      { q: 'What is the plural of "larva"?', c: ['Larvae', 'Larvas', 'Larvi', 'Larvum'], f: 'Latin first declension. Larva meant a mask or ghost — the insect wearing a disguise before its true form.' },
      { q: 'What is the plural of "octopus" preferred by most dictionaries?', c: ['Octopuses', 'Octopi', 'Octopodes', 'Octopus'], f: 'The word is Greek, so the Latin -i ending never applied. Octopodes is technically right and almost never used.' },
      { q: 'What is the singular of "media" in its original sense?', c: ['Medium', 'Media', 'Medius', 'Medion'], f: 'A medium is a middle thing — the material through which something travels.' },
      { q: 'What is the plural of "appendix" in a book?', c: ['Appendices', 'Appendixes', 'Appendici', 'Appendixi'], f: 'Appendices at the back of a book, appendixes in surgery. The body took the English plural.' },
      { q: 'What is the plural of "stimulus"?', c: ['Stimuli', 'Stimuluses', 'Stimulae', 'Stimulii'], f: 'Latin stimulus was a goad for driving cattle — a sharp stick, applied to the mind.' }
    ] },

  { id: 'toponyms', title: 'Words That Are Really Places', fmt: 'xword',
    blurb: 'A toponym is a word made from a place name. Cloth, food and animals collect them, because trade names its goods after wherever it first found them. The clue is the meaning; the answer is the word.',
    qs: [
      { q: 'Hard-wearing cotton twill, named for the French city of Nîmes', c: ['denim'], f: 'Serge de Nîmes, the serge of Nîmes. Jeans, worn with it, is from Genoa.' },
      { q: 'A long-distance race named after a plain in Greece', c: ['marathon'], f: 'The runner’s message is the story; the distance was fixed at its modern length only in 1908.' },
      { q: 'A small oily fish named after a Mediterranean island', c: ['sardine'], f: 'Sardinia. The fish was named for where the shoals were found, not where it was tinned.' },
      { q: 'A strong-smelling cheese named after a village in Somerset', c: ['cheddar'], f: 'The caves there held the right temperature for maturing it. The name was never protected, which is why it is now made everywhere.' },
      { q: 'A blue-green mineral whose name means "Turkish"', c: ['turquoise'], f: 'It reached Europe through Turkey from Persia, and was named for the road rather than the mine.' },
      { q: 'Soft napped leather whose name means "from Sweden"', c: ['suede'], f: 'French gants de Suède, "gloves of Sweden".' },
      { q: 'A brilliant purplish-red dye named after an Italian battle', c: ['magenta'], f: 'Discovered in 1859, the year of the battle, and named to sell it.' },
      { q: 'A small yellow songbird named after a group of Atlantic islands', c: ['canary'], f: 'And the islands were named for dogs — Latin canis — not for the bird.' },
      { q: 'A rich figured fabric named after a city in Syria', c: ['damask'], f: 'Damascus. The same city gives damson, the plum, and damascene, the watering of steel.' },
      { q: 'A fine cotton fabric named after a city in Iraq', c: ['muslin'], f: 'Mosul. It reached Europe through Italian mussolina.' },
      { q: 'A metal named after the island of Cyprus', c: ['copper'], f: 'Latin cyprium aes, "Cyprian metal", worn down to cuprum — which is why its symbol is Cu.' },
      { q: 'A game named after an English country house', c: ['badminton'], f: 'The Duke of Beaufort’s seat in Gloucestershire, where the game was played in the 1860s.' }
    ] },

  { id: 'homophonemic', title: 'Homophones at the Microphone', fmt: 'short',
    blurb: 'At a bee these are the ones that end it. The word is said once and two spellings fit the sound, so the only way through is the meaning. Write the spelling that matches the definition given.',
    qs: [
      { q: 'A fundamental truth or rule of conduct. Not the head of a school.', c: ['principle'], f: 'Principle is a rule; principal is the chief person or the sum of money. The head of a school is your pal.' },
      { q: 'Writing paper and envelopes. Not "standing still".', c: ['stationery'], f: 'Stationery with an e is sold by a stationer. Stationary with an a stands still — think of "a" for "at rest".' },
      { q: 'To complete or make whole. Not a piece of praise.', c: ['complement'], f: 'A complement completes; a compliment is kind. The e of complement matches the e of complete.' },
      { q: 'Careful not to be noticed, tactful. Not "separate and distinct".', c: ['discreet'], f: 'Discrete keeps its two e apart, which is what discrete means. That is a genuine memory aid and not a coincidence.' },
      { q: 'A store of something hidden away. Not a great crowd.', c: ['hoard'], f: 'A horde is a crowd, from Turkic ordu, a camp. A hoard is treasure buried.' },
      { q: 'The roof of the mouth. Not an artist’s board, nor a wooden shipping platform.', c: ['palate'], f: 'Palate, palette, pallet — three words, one sound. Palate is the one inside you.' },
      { q: 'A branch of a tree. Not the front of a ship, nor a bending at the waist.', c: ['bough'], f: 'Old English bog, a shoulder or limb. The -ough spelling is one of the seven ways English says that cluster.' },
      { q: 'Strong coarse cloth used for sails and paintings. Not "to seek votes".', c: ['canvas'], f: 'To canvass, with two s, was originally to toss someone in a canvas sheet — then to shake a district for votes.' },
      { q: 'To quote a source. Not a location, nor the ability to see.', c: ['cite'], f: 'Cite, site and sight. Cite is from citare, to summon — you summon your evidence.' },
      { q: 'To draw out a response. Not "forbidden by law".', c: ['elicit'], f: 'Elicit is a verb, illicit an adjective. Illicit is in + licit, "not permitted".' },
      { q: 'A narrow channel of water between two seas. Not "without a bend".', c: ['strait'], f: 'From Latin strictus, drawn tight — the same root as strict. Straitened means squeezed, not straightened out.' },
      { q: 'A feeling of wounded pride. Not a mountain top, nor a quick look.', c: ['pique'], f: 'French piquer, to prick. Peak, peek, pique — and a fourth, peke, if the dog is allowed.' }
    ] },

  { id: 'frenchendings', title: 'French Endings, English Words', fmt: 'mc',
    blurb: 'A third of English came in from French, and it arrived wearing endings that English never made for itself: -eau, -oir, -et, -que. Those endings are a spelling clue, because they behave the French way, not the English one.',
    qs: [
      { q: 'A bureau is a desk, then an office, then a government department. What did the French bureau first name?', c: ['The coarse cloth that covered a desk', 'A locked box for papers', 'A clerk’s stool', 'A room at the front of a house'], f: 'From bure, a woollen baize. The furniture was named after its cloth, and the institution after the furniture.' },
      { q: 'Plateau, plate and flat all descend from one root. What does the French plat mean?', c: ['Flat', 'High', 'Wide', 'Bare'], f: 'A plateau is simply a flat place. The same root gives platform, platypus — "flat foot" — and plaza.' },
      { q: 'What is the plural of "bureau" that follows the French?', c: ['Bureaux', 'Bureaus', 'Bureaui', 'Buroes'], f: 'Words in -eau take -x: plateaux, tableaux, gateaux. English also accepts -s, and increasingly prefers it.' },
      { q: 'A reservoir holds water. What does the -oir ending mark in French?', c: ['A place where the action of the verb happens', 'A person who does the action', 'A thing made by the action', 'A repeated action'], f: 'Reservoir from réserver, memoir from mémoire, escritoire from écrire. The ending names the site.' },
      { q: 'Which of these words did NOT come to English from French?', c: ['Kindergarten', 'Restaurant', 'Ballet', 'Croissant'], f: 'Kindergarten is German, and looks nothing like the others once you know to look — its ending is a whole word, garten.' },
      { q: 'A silhouette is named after Étienne de Silhouette, a French finance minister. Why?', c: ['His economies were so severe that anything cheap was named for him', 'He invented the technique', 'He collected the portraits', 'He was famous for his profile'], f: 'A cut-paper profile was the cheapest portrait available, and 1759 was a year of ruinous austerity.' },
      { q: 'The -et and -ette endings are diminutives. What does a diminutive do?', c: ['Makes the thing smaller', 'Makes the thing feminine', 'Makes the thing plural', 'Makes the thing older'], f: 'Cigarette, a small cigar. Statuette, a small statue. Kitchenette, a small kitchen — that one was coined in English.' },
      { q: 'Why does "antique" end in -que rather than -k?', c: ['It keeps the French spelling of a hard c sound before e', 'It marks the word as a noun', 'It was once pronounced with two syllables at the end', 'It distinguishes it from "antic"'], f: 'French uses qu where English would use k or c: boutique, oblique, physique, unique.' },
      { q: 'A restaurant was originally not a building. What did the French restaurant name?', c: ['A restorative broth', 'A resting place on a road', 'A guild of cooks', 'A table set for guests'], f: 'From restaurer, to restore. The soup was sold first; the room took its name from what was served in it.' },
      { q: 'Which spelling is correct for the frozen dessert, following its French root?', c: ['Sorbet', 'Sorbay', 'Sorbette', 'Sorbé'], f: 'From Turkish şerbet by way of Italian sorbetto — the same word that gives English sherbet, spelled the other way.' },
      { q: 'In "rendezvous", what does the French phrase literally command?', c: ['Present yourselves', 'Meet at the hour', 'Come quietly', 'Wait for me'], f: 'Rendez-vous, the imperative of se rendre. English froze a command into a noun, silent z and all.' },
      { q: 'Why do "champagne" and "cognac" begin with small letters in English?', c: ['They are place names that became common nouns', 'They were never capitalised in French', 'They are trade marks that lapsed', 'They are shortened from longer phrases'], f: 'Champagne and Cognac are French regions. In France the capitals and the boundaries are still defended in court.' }
    ] },

  { id: 'meaningshift', title: 'Words That Changed Sides', fmt: 'mc',
    blurb: 'A word’s meaning is not fixed by its spelling, and several of the most ordinary words in English once meant something close to the opposite. The spelling stayed put while the sense walked off.',
    qs: [
      { q: 'Nice comes from Latin nescius. What did nescius mean?', c: ['Ignorant', 'Delicate', 'Pleasant', 'Precise'], f: 'It went ignorant, then foolish, then fussy, then precise, then agreeable. Its old precision survives in "a nice distinction".' },
      { q: 'What did "silly" mean in Old English?', c: ['Blessed or happy', 'Small', 'Quiet', 'Poor'], f: 'Blessed, then innocent, then harmless, then weak, then foolish. A full slide over six centuries.' },
      { q: 'What did "awful" mean before it meant terrible?', c: ['Inspiring awe', 'Very large', 'Ancient', 'Frightening to look at'], f: 'It described cathedrals and mountains. Awesome now carries the old sense and awful the new one.' },
      { q: '"Clue" was once spelled clew. What is a clew?', c: ['A ball of thread', 'A footprint', 'A key', 'A whisper'], f: 'The thread Theseus unwound in the labyrinth. To follow a clue is still to follow a thread.' },
      { q: 'Quarantine names a specific number. What is it?', c: ['Forty days', 'Thirty days', 'Twenty days', 'Sixty days'], f: 'Venetian quaranta giorni — the period ships waited off Ragusa and Venice during the plague.' },
      { q: 'What did "meat" mean in Middle English?', c: ['Food of any kind', 'Cooked flesh', 'A portion or share', 'A feast'], f: 'It survives in "sweetmeat" and in "meat and drink". Flesh was the word for what meat now means.' },
      { q: 'What did "deer" once mean?', c: ['Any wild animal', 'A young animal', 'A hunted animal', 'A horned animal'], f: 'Old English deor, an animal. German Tier still means animal. English narrowed it to one species.' },
      { q: 'Decimate names a Roman punishment. What did it do?', c: ['Killed one soldier in ten', 'Killed nine in ten', 'Halved a legion', 'Disbanded a unit'], f: 'The unit drew lots and executed every tenth man. The modern loose sense — to destroy most of something — reverses the proportion.' },
      { q: 'What was a "villain" originally?', c: ['A farm worker attached to a villa', 'A wandering thief', 'A soldier without a lord', 'A man outside the law'], f: 'Latin villanus. The word slid from a description of rank to a judgement of character, as churl and boor also did.' },
      { q: 'Egregious once meant the opposite of what it means now. What did it mean?', c: ['Outstandingly good', 'Ordinary', 'Rare', 'Well born'], f: 'Ex + grex, "out of the flock" — standing out. Sixteenth-century irony turned it sour and it never recovered.' },
      { q: 'What did "girl" mean in Middle English?', c: ['A young person of either sex', 'A servant', 'An unmarried woman', 'A young sister'], f: 'A boy could be a girl. Knave and maiden did the work of distinguishing them.' },
      { q: 'What did "naughty" originally describe?', c: ['Having nothing', 'Making noise', 'Being disobedient', 'Being unlucky'], f: 'From naught, nothing — a naughty person was a poor one, then a wicked one, then a badly behaved child.' }
    ] }

];
