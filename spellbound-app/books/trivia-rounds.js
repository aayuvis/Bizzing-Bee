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
    ] }

];
