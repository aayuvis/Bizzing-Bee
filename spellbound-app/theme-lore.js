/* theme-lore.js — the explanation that opens every Theme Journey.

   A theme used to drop you straight into a word list. Now it opens the way a
   concept chapter does: what this family of words actually is (i), how you spot
   one at the microphone (s), and the spelling trap it sets (w). Three short
   paragraphs, then the words.

   Keyed by theme id (themes-data.js). Deferred by boot-lazy with the theme data. */
window.SB_THEME_LORE = {

/* ---------- Science & Nature ---------- */
body: {
  i: 'Medicine kept Latin and Greek long after everyone else stopped using them, so the body is spelled in two dead languages at once. One bone can have a Latin name and a Greek adjective sitting next to it.',
  s: 'Ask for the origin. Greek gives you the science words — cardiac, hepatic, cranial. Latin gives you the plain parts — femur, tendon, abdomen.',
  w: 'Greek PH for an F sound (pharynx, diaphragm) and silent openers like PN- and PS-. Latin plurals go their own way too: one vertebra, two vertebrae.'
},
disease: {
  i: 'Disease names are built like machines: a root that says which part, plus an ending that says what is wrong with it. -itis is inflammation, -osis is a condition, -emia is in the blood.',
  s: 'Find the ending first. Once you know -itis, -osis, -algia and -emia, half the word is already spelled before you start guessing.',
  w: 'The joins are where the letters hide. Two vowels meeting at a seam often keep both (gastroenteritis), and the O linking parts is almost always an O, never an A.'
},
pharmacy: {
  i: 'Medicine names come from three places at once: Greek and Latin roots, plant names from wherever the plant grew, and invented brand names that had to be spellable in forty languages.',
  s: 'If it names a plant or a mineral, it is probably old and phonetic. If it ends in a manufactured cluster like -mycin or -cillin, it was coined in a laboratory.',
  w: 'The invented ones are the traps: they follow no history, so there is nothing to reason from. Learn the ending families — -mycin, -cillin, -caine, -phylline.'
},
animals: {
  i: 'Animal words arrived with the animals. The ones Europeans always knew are Old English and short; the ones they met on voyages kept the name the local people used, spelling and all.',
  s: 'A short, blunt animal word is usually native (otter, weasel, badger). A long or odd-looking one usually travelled (aardvark, chameleon, kangaroo).',
  w: 'The travelled ones keep foreign letter runs English would never invent: AA in aardvark, double consonants in okapi and giraffe, a silent P in ptarmigan.'
},
birds: {
  i: 'Half of all bird names are the sound the bird makes. The other half describe what it looks like or where it lives — and a surprising number are named after the person who first described them.',
  s: 'Say it out loud. If the word sounds like a call (chickadee, curlew, cuckoo), the spelling usually follows the sound closely.',
  w: 'The descriptive ones are compounds and the seam is the trap: nuthatch, oystercatcher, whip-poor-will. Find the two halves and spell each one separately.'
},
insects: {
  i: 'Entomology names things in Greek and Latin, so the scientific insect words are built from roots — but the everyday ones are old English farm words, and the two sets look nothing alike.',
  s: 'Coleoptera and cicada come from the classical side. Weevil, earwig and midge come from the kitchen and the field.',
  w: 'Watch the doubles in the everyday ones (grasshopper, caterpillar) and the PT and PS openings in the classical ones (pterygote, psyllid).'
},
marine: {
  i: 'Sea words came aboard ships. That means Dutch, Norse and Portuguese sailors named a great deal of the ocean, and their spellings came along unchanged.',
  s: 'Dutch and Norse give you hard consonants and short vowels. Greek gives you the scientific creatures — cetacean, echinoderm, plankton.',
  w: 'Dutch loans keep letter pairs English avoids (schooner, sloop, walrus). Greek ones hide an F inside PH and a K inside CH.'
},
botany: {
  i: 'Every plant has two names: the one gardeners use and the Latin one botanists use. English borrowed freely from both, which is why one plant can be spelled three ways.',
  s: 'Botanical Latin is regular — if you can say it in syllables, you can spell it. The gardener names are older and messier.',
  w: 'The Latin endings are the reliable part: -aceae, -phyll, -ose, -carp. The trap is the unstressed vowel in the middle, which is almost always the one you would not guess.'
},
flowers: {
  i: 'Tree and flower names are some of the oldest words in English, which is exactly why they are strange. They were spelled before the rules existed, and nobody has tidied them since.',
  s: 'Short and odd means old and native — yew, ash, elm, sloe. Long and Latin means it arrived with a botanist.',
  w: 'Old names keep silent letters and dead spellings (chrysanthemum, fuchsia, hydrangea). Fuchsia is named after a man called Fuchs — the H sits where his name put it.'
},
chemistry: {
  i: 'Chemistry invented most of its own vocabulary on purpose, so its words are unusually honest: an ending tells you the kind of substance, and the root tells you what is in it.',
  s: 'Learn the ending set — -ide, -ate, -ite, -ous, -ic, -yl. They are the grammar of the whole subject and they never lie to you.',
  w: 'The element names are the irregular part, because many are eponyms or place names. And the unstressed vowels in long chains reduce to a schwa that hides its real letter.'
},
astronomy: {
  i: 'The sky is named in Greek myth and Arabic navigation. Greek gave us the constellations and the science; Arabic astronomers gave us the individual star names, which is why so many begin with AL-.',
  s: 'AL- at the front is Arabic (Aldebaran, Altair, Algol). A god or hero in the meaning is Greek or Roman.',
  w: 'The Arabic names keep vowel runs that look wrong and are right. The Greek ones hide a K in CH and an F in PH: chromosphere, photosphere.'
},
weather: {
  i: 'Weather words come from everywhere sailors went, because weather is what sailors talked about. Typhoon, monsoon, tornado and hurricane each came from a different ocean.',
  s: 'Ask where the storm happens. Monsoon came through Arabic and Portuguese; typhoon through Chinese and Greek; hurricane through Taino and Spanish.',
  w: 'These are multi-stop journeys, so the spelling is a compromise nobody would predict. Learn each one as a story rather than a rule.'
},
minerals: {
  i: 'A mineral is usually named for where it was found, what it looks like, or who found it — and the ending -ite is the signature that says "this is a rock".',
  s: 'If it ends in -ite, expect a place name or a person in front of it. If it ends in -ine or -ase, expect Greek describing a property.',
  w: 'Place and person names never simplify. Wollastonite keeps both Ls, and labradorite keeps Labrador exactly as the map spells it.'
},
physics: {
  i: 'Physics borrowed its everyday words from Latin and its units from the people who did the work, so the same page can hold vector, momentum, newton and joule.',
  s: 'A unit is almost always a surname with a lower-case letter: watt, ampere, hertz, kelvin. A concept is almost always Latin.',
  w: 'The units are eponyms, so they follow a person, not English. Ampère and Coulomb bring their French letter patterns with them.'
},
ecology: {
  i: 'Ecology is a young science, so most of its vocabulary was assembled from Greek parts on purpose within the last hundred and fifty years. That makes it unusually regular.',
  s: 'Break it at the seam: bio-, eco-, -sphere, -system, -trophic. Every word in this family is two or three known pieces joined.',
  w: 'The joining vowel is the trap. It is almost always an O (biosphere, ecotone, autotrophic), and the temptation is to hear it as an A.'
},

/* ---------- Earth & Place ---------- */
landforms: {
  i: 'Landforms are named in whatever language the people who lived there spoke, so a single mountain range can hand English a Spanish word, an Arabic word and a Norse one.',
  s: 'Fjord is Norse, mesa and arroyo are Spanish, wadi is Arabic, tundra is Russian. The landscape tells you the language.',
  w: 'Each one keeps its home spelling. Fjord has no vowel where English wants one; arroyo doubles the R; escarpment hides a French -MENT ending.'
},
nations: {
  i: 'Country and people names are the most politically careful words in English: they are spelled the way the place asks to be spelled, which is why they resist every English rule.',
  s: 'These are proper nouns, so there is no pattern to fall back on — only the actual spelling, which is why bees love them.',
  w: 'Doubled letters and unexpected vowels do the damage: Filipino has one L, Philippines has two Ps, and Caribbean has one R and two Bs.'
},
waterways: {
  i: 'Water words are split between the sailors who crossed it and the scientists who measured it, so estuary and strait sit beside hydrography and limnology.',
  s: 'Practical water words are short and Germanic. Scientific ones are Greek and start with hydro-, limno- or thalasso-.',
  w: 'The Greek prefixes are reliable. The trap is in the plain words: strait against straight, and the -UARY ending on estuary.'
},
maps: {
  i: 'Navigation words came from whoever was best at getting somewhere: Greek geometry, Arabic astronomy, Portuguese and Dutch seamanship. All four layers are still in the vocabulary.',
  s: 'Geo- and -graphy are Greek. Azimuth, nadir and zenith are Arabic. Starboard and binnacle came off a Dutch deck.',
  w: 'The Arabic ones look impossible and are perfectly phonetic. The Greek compounds hide their seam: cartography, orthodromic, isobath.'
},
farming: {
  i: 'Farming is the oldest continuous vocabulary in English. Most of it is Old English, unchanged for a thousand years, which is why so much of it is spelled unreasonably.',
  s: 'Short, thick words with odd letters are native: plough, furrow, sheaf, scythe. Anything ending -culture is Latin and arrived later.',
  w: 'The old ones keep dead spellings: OUGH in plough, a silent C in scythe, EA doing three different jobs in sheaf, wheat and leaven.'
},

/* ---------- Food & Living ---------- */
culinary: {
  i: 'Professional cooking is conducted in French, because French kitchens wrote the rules. English took the method words whole, accents and silent letters included.',
  s: 'If it is a technique, guess French: sauté, braise, blanch, julienne, roux. If it is an ingredient, it could be from anywhere.',
  w: 'French endings are the whole test — -EAU, -ÉE, -OIR, -ETTE — and the final consonant is usually silent but always written.'
},
dishes: {
  i: 'Dish names travel by mouth, not by book, so they keep the sound of the language they came from and get whatever spelling the first English writer guessed.',
  s: 'Say the word and ask which kitchen it came out of. The answer usually tells you the vowel pattern.',
  w: 'Doubled letters are the biggest miss: mozzarella, gnocchi, biryani, mulligatawny. Italian GN and CCH need learning once and then they are free.'
},
spices: {
  i: 'Spice words are the oldest trade words we have. Sugar, pepper, ginger and cinnamon each crossed four or five languages before reaching English, and every crossing bent the spelling.',
  s: 'A spice word that looks irregular usually is — that irregularity is the fingerprint of the route it took.',
  w: 'Long journeys make unpredictable spellings, so reasoning fails here. Sugar begins with an S that says SH because Persian and Italian both had a turn.'
},
fabrics: {
  i: 'Cloth is named for the city that made it. Denim is from Nîmes, muslin from Mosul, damask from Damascus, calico from Calicut — the map is inside the word.',
  s: 'If a fabric sounds like a place, it is one, and place names never simplify their spelling for English convenience.',
  w: 'Keep the geography intact: cashmere holds Kashmir, chiffon holds its French double F, and organdie keeps its French ending.'
},
buildings: {
  i: 'Architecture speaks Italian and French, because the Renaissance and the great cathedrals happened there. The Greek layer underneath names the parts of a temple.',
  s: 'Italian gives you the grand words — loggia, piazza, cupola. Greek names the classical parts — pediment, architrave, peristyle.',
  w: 'Italian doubles consonants where English would not, and Greek hides its usual disguises: a K in CH, an F in PH.'
},
household: {
  i: 'Everyday objects are named in three layers: Old English for the oldest things, French for anything that was once fancy, and trade names for anything invented.',
  s: 'A short word for a plain object is native. A long word for the same object arrived with the Normans and thinks it is superior.',
  w: 'The French layer keeps silent endings (bureau, armoire, chandelier) and the native layer keeps dead spellings (knife, comb, wrought).'
},

/* ---------- Arts & Culture ---------- */
music: {
  i: 'Music is written in Italian. Tempo, dynamics and expression are all Italian words, because Italian composers were the first to write instructions on the page.',
  s: 'Instruction words are Italian and phonetic: allegro, crescendo, pianissimo. Instrument names come from wherever the instrument was built.',
  w: 'Italian doubles its consonants and means it: pianissimo, fortissimo, cello. Say the double and you will write the double.'
},
stage: {
  i: 'Theatre is Greek at the roots and French at the surface. Greek named the building and the drama; French named the dancing, which is why ballet vocabulary is entirely French.',
  s: 'Anything about dance is French — plié, arabesque, pirouette. Anything about drama is Greek — chorus, protagonist, catharsis.',
  w: 'French dance words keep accents and silent endings. Greek drama words hide a K in CH: chorus, choreography, catharsis.'
},
painting: {
  i: 'Painting and sculpture borrowed Italian for technique and French for movements, so fresco, chiaroscuro and impasto sit beside collage and trompe-l’oeil.',
  s: 'Technique is usually Italian; a movement or a style is usually French. Both are older than the English words for the same things.',
  w: 'Italian CH says K (chiaroscuro), Italian SC says SH (crescendo, sciamachy), and French keeps letters it refuses to pronounce.'
},
poetry: {
  i: 'Literary vocabulary is Greek, because Greek critics named the parts of a poem first and nobody has improved on the names since.',
  s: 'Almost every device word is Greek: metaphor, hyperbole, onomatopoeia, synecdoche. If it names a trick of language, guess Greek.',
  w: 'Greek vowel runs are the trap. Onomatopoeia has five vowels in a row at the end and every one is written; hyperbole ends in a spoken E.'
},
myth: {
  i: 'Myth words are names first and words second. A god or a hero was named, and then the name became an ordinary word — which means the spelling follows a person, not a rule.',
  s: 'If the meaning mentions a god, a hero or a monster, you are spelling a name, and names do not obey phonics.',
  w: 'Greek names keep CH for K and PH for F, and Roman ones keep their Latin vowel endings. Learn the name and the word comes free.'
},
religion: {
  i: 'Religious vocabulary preserves the language of the tradition: Hebrew and Aramaic for one, Greek and Latin for another, Sanskrit and Arabic for others. Each keeps its own letters.',
  s: 'Ask which tradition. That single answer decides whether you are spelling Hebrew, Greek, Latin, Arabic or Sanskrit.',
  w: 'Hebrew gives you unexpected H placements, Greek gives you PH and CH, and Sanskrit gives you the aspirated pairs — bh, dh, kh.'
},
festivals: {
  i: 'Festival names are the most local words in the language. They came from one town or one tradition, and they were written down by whoever was standing there.',
  s: 'These are not built from parts, so there is nothing to decode. They are learned whole, like names — which is exactly what most of them are.',
  w: 'Expect doubles and vowel pairs that look wrong: Hallowe’en, Michaelmas, Diwali, Hogmanay. The apostrophes and capitals count too.'
},

/* ---------- People & Society ---------- */
law: {
  i: 'English law is conducted in Latin and Norman French, on purpose, because the Normans wrote the courts and never translated them. Both languages are still in the room.',
  s: 'Latin phrases stay whole (habeas corpus, subpoena). French words keep French shapes (plaintiff, attorney, tort).',
  w: 'Latin keeps its own endings and its silent letters (subpoena, indictment — the C is not spoken). French keeps -EY and -IFF.'
},
politics: {
  i: 'Politics is Greek at the top and Latin in the machinery: democracy, oligarchy and polity are Greek; legislature, senate and constitution are Roman.',
  s: 'Government structures are Latin. Kinds of rule are Greek, and nearly all end in -CRACY or -ARCHY.',
  w: '-CRACY and -ARCHY are the reliable pair, and ARCHY hides a K in the CH. The Latin words trap you on unstressed vowels instead.'
},
economy: {
  i: 'Money words came from whoever was trading: Italian invented banking and gave us the vocabulary, Arabic gave us the arithmetic, and Dutch gave us the shipping terms.',
  s: 'Banking and accounting words are Italian — bankrupt, credit, tariff. Numbers and calculation are Arabic — cipher, algorithm, zero.',
  w: 'Italian doubles (tariff, bullion) and Arabic vowel runs are the two traps. Both are learnable in one sitting.'
},
jobs: {
  i: 'Job names carry the ending that means "the person who does this": -ER and -OR from Latin, -IST from Greek, -SMITH and -WRIGHT from Old English.',
  s: 'Find the ending and you have half the word. -WRIGHT means a maker (playwright, wheelwright), -SMITH means a worker in a material.',
  w: '-ER against -OR is the classic decision, and there is no sound difference. Latin verbs usually take -OR; English ones usually take -ER.'
},
character: {
  i: 'Words for what people are like are mostly Latin adjectives, and they arrived in pairs of opposites — which is why so many begin with a prefix that flips the meaning.',
  s: 'Strip the prefix. IN-, IM-, DIS- and UN- all mean not, and what is left is usually a word you already know.',
  w: 'The prefix doubles a letter when it meets the same letter: immaculate, innocuous, irascible. That doubling is the whole test.'
},
emotions: {
  i: 'Feeling words split cleanly: the blunt ones are Old English and the subtle ones are Latin or French, which is why we have both fear and trepidation.',
  s: 'Short and physical means native. Long and precise means it came through Latin, usually with a -TION or -ANCE ending.',
  w: '-ANCE against -ENCE is the trap and it never sounds different. Latin -ANTIA gives -ANCE; Latin -ENTIA gives -ENCE.'
},
kinship: {
  i: 'Family words are among the oldest words in any language, and they barely change. Mother, father and brother are recognisable across half the languages of Europe and India.',
  s: 'These are so old they predate borrowing. If it names a close relative, it is almost certainly native.',
  w: 'The relations that arrived later are the tricky ones: nephew keeps a French PH, and in-law compounds need their hyphens.'
},

/* ---------- History & Conflict ---------- */
war: {
  i: 'Military words are Norman French, because the Normans ran the army. Older Germanic fighting words survived underneath, and later gunpowder words came from Italian.',
  s: 'Ranks and organisation are French — sergeant, lieutenant, corps. Weapons often came from Italian — cannon, musket, bastion.',
  w: 'French keeps silent letters and refuses to sound them: corps, lieutenant, reveille. Write the letters anyway.'
},
ancient: {
  i: 'Words for the ancient world came through the archaeologists who dug it up, which means they arrived in Greek and Latin transliterations of Egyptian, Sumerian and Persian names.',
  s: 'These are transliterations, so they are more phonetic than they look. Sound them out slowly and the letters usually appear.',
  w: 'The vowel choices in a transliteration are conventions, not sounds — pharaoh, ziggurat, sarcophagus. Learn the convention once.'
},
royalty: {
  i: 'Courts and heraldry are Norman French, and heraldry is the most French thing in English: it kept its own grammar, its own colour words and its own word order.',
  s: 'Heraldic colour words are pure French — gules, azure, sable, vert. Court words came with the Conquest.'
  ,
  w: 'French doubles and endings do the damage: chevalier, escutcheon, fleur-de-lis. The silent final consonants are still written.'
},
seafaring: {
  i: 'Exploration vocabulary is Portuguese, Spanish and Dutch, in that order, because that is the order in which those nations went looking.',
  s: 'Ship parts are usually Dutch (boom, deck, yacht). Voyage and cargo words are usually Portuguese or Spanish (armada, cargo, monsoon).',
  w: 'Dutch letter pairs look impossible and are regular: yacht, schooner, sloop. Learn the pair, not the word.'
},

/* ---------- Movement & Play ---------- */
sports: {
  i: 'Sport words come from the country that codified the sport. English gave the world football and cricket vocabulary; France gave fencing and cycling; Japan gave the martial arts.',
  s: 'Ask which country wrote the rules. Fencing is French (riposte, épée), judo is Japanese (ippon, randori), and cricket is stubbornly English.',
  w: 'French sport words keep accents and silent endings; Japanese ones are phonetic but need their doubled consonants and long vowels.'
},
vehicles: {
  i: 'Transport words track the technology: carriages are French, ships are Dutch, railways are English, and cars borrowed from everywhere at once.',
  s: 'Older road vehicles are French (chaise, landau, limousine). Anything with an engine is nineteenth century and often a coinage.',
  w: 'The French carriage words are the traps — brougham, cabriolet, phaeton. Each keeps letters English would happily drop.'
},
tools: {
  i: 'Tool names are the plainest words in the language for the oldest tools, and the most technical for the newest — hammer and awl beside micrometer and theodolite.',
  s: 'Short and native means ancient. Greek compounds mean a nineteenth-century instrument, and they break neatly at the seam.',
  w: 'The old ones hide silent letters (wrench, gnomon, awl); the instrument words hide their joining vowel, which is almost always an O.'
},

/* ---------- Language & Mind ---------- */
logic: {
  i: 'Philosophy argues in Greek and writes in Latin. The big ideas are Greek nouns; the technical machinery of an argument is Latin.',
  s: 'Ideas ending -ISM, -OLOGY or -IC are Greek. Argument words like premise, inference and syllogism come through Latin.',
  w: 'Greek vowel pairs and PH are the traps (phenomenon, epistemology). And -ISM never doubles the S no matter how it sounds.'
},
numbers: {
  i: 'Mathematics counts in Latin, describes shapes in Greek, and calculates in Arabic. All three are visible in a single page of a textbook.',
  s: 'Number prefixes are Latin or Greek in pairs — bi-/di-, tri-/tri-, quad-/tetra-. Calculation words are Arabic: algebra, algorithm, cipher.',
  w: 'The Greek shape words hide a K in CH (chord, isochronous) and the Arabic ones begin AL-, which is the Arabic word for "the".'
},
wordwords: {
  i: 'Words about language are Greek, because Greek grammarians invented the job. Every part of speech and every kind of sound has a Greek name.',
  s: 'If it names a part of language, guess Greek: morpheme, phoneme, etymology, orthography.',
  w: 'These are the words most likely to contain their own trap: orthography, onomatopoeia, syllabification. PH, CH and vowel runs all at once.'
},
time: {
  i: 'The calendar is Roman, the days are Norse, and the scientific time words are Greek. Three different peoples divided up the same week.',
  s: 'Month names are Latin, day names are Norse gods, and anything measuring time precisely is Greek — chronometer, isochronous.',
  w: 'Greek CHRON hides a K, Latin months keep their own vowels, and the Norse days hide letters nobody says: Wednesday, Thursday.'
},
colors: {
  i: 'Colour words came with whatever was that colour: a dye, a stone, a bird or a flower. Almost no colour word started life meaning only a colour.',
  s: 'Ask what the thing was. Magenta is a battle, indigo is a country, vermilion is a worm, and saffron is a flower.',
  w: 'Because each one is really a noun, each keeps that noun’s spelling: turquoise keeps its French ending, chartreuse keeps its monastery.'
},
eponyms: {
  i: 'An eponym is a person’s name that became an ordinary word. The moment you know that, the spelling stops being a puzzle: you are spelling somebody’s surname.',
  s: 'The definition usually gives it away — "named after", "invented by", "discovered by". Ask the origin and you get the nationality of the name.',
  w: 'Names never simplify. Fahrenheit, Guillotine, Boycott and Sandwich all keep exactly the letters their owners used.'
},

/* ---------- Where words come from ---------- */
olatin: {
  i: 'Latin is the biggest single layer in English — more than half the words in a dictionary. It arrived twice: once with the Church, and again through French after the Normans.',
  s: 'Latin words break into prefix, root and suffix, and every piece is reusable. Learn one root and you get thirty words.',
  w: 'The endings are the whole game: -ANCE against -ENCE, -ABLE against -IBLE, -ARY against -ERY. None of them sound different; all of them follow the Latin original.'
},
ogreek: {
  i: 'Greek is the language of science and of ideas. English borrowed it deliberately, to build new words for new things, which is why Greek words look assembled rather than grown.',
  s: 'Greek announces itself: PH for F, CH for K, PS and PN at the front, Y in the middle where you expect an I.',
  w: 'The silent openers are the classic trap — pneumonia, psychology, mnemonic. And RH at the start always keeps its H: rhythm, rhetoric, rhinoceros.'
},
ofrench: {
  i: 'A third of English came through French, and French is where phonetic spelling goes to die. The letters were kept and the pronunciation moved on without them.',
  s: 'Look for the endings: -EAU, -ETTE, -OIR, -AGE, -QUE, -ET. And listen for a final consonant that is written but not said.',
  w: 'You cannot hear French spelling, so hearing harder will not help. These words are learned by their ending family, and there are only about a dozen families.'
},
oiberian: {
  i: 'Italian, Spanish and Portuguese are the most phonetic donors English has. What you hear is very nearly what you write — the vowels stay open and every letter does a job.',
  s: 'Italian doubles its consonants and means it. Spanish keeps J and LL doing Spanish jobs. Portuguese brings ÃO and NH.',
  w: 'The doubles are the test: mozzarella, spaghetti, tortilla, guerrilla. Italian CH says K and Italian SC says SH.'
},
onordic: {
  i: 'German, Norse and the Nordic languages are English’s close cousins, so their words feel native — but they build long compounds and use hard consonants where English has gone soft.',
  s: 'If it is a long word made of two short blunt ones, guess German. If it is a short word about weather, ships or violence, guess Norse.',
  w: 'German keeps clusters English avoids (angst, zeitgeist, kitsch) and does not soften them. Norse gives you SK where English would use SH: skirt beside shirt.'
},
odutch: {
  i: 'Dutch is the largest untaught origin in English. Dutch sailors, painters and engineers were the best in Europe for a century, and English took their vocabulary wholesale.',
  s: 'Ships, water management, art and food. If the word is about a boat, a dyke, a painting or a snack, try Dutch first.',
  w: 'Dutch letter pairs are consistent and unfamiliar: OE says OO, IJ becomes Y, and CH is a throat sound written as CH. Yacht, schooner, sloop, coleslaw.'
},
oceltic: {
  i: 'Celtic languages were here before English and are still spoken alongside it, so their words come in with spellings built for a completely different sound system.',
  s: 'Irish, Welsh, Scots Gaelic and Cornish. Look for consonant pairs English would never invent, and for LL and DD doing Welsh work.',
  w: 'The clusters are the trap: Welsh LL and DD, Irish MH and BH, Scots CH. Loch, banshee, whisky, cromlech and eisteddfod all keep their home letters.'
},
osouth: {
  i: 'Sanskrit is the oldest language still feeding English new words, and it hands them over almost unchanged. Its spelling was designed by grammarians to be exact.',
  s: 'These words are written the way they sound. Count the beats and give every unstressed vowel its written value, which is usually an A.',
  w: 'The aspirated letters are where these words are lost. BH, DH, GH, JH and KH each write one sound with two letters, and English ears drop the H every time.'
},
oeastasia: {
  i: 'Japanese, Chinese and Korean words arrive through a standard romanisation, which means somebody has already decided how to spell them and the decision is consistent.',
  s: 'Japanese is open syllables — every consonant is followed by a vowel. Chinese comes through Pinyin or the older Wade-Giles, which explains the odd Q and X.',
  w: 'Japanese needs its long vowels and doubled consonants (shiitake, kabuki, tsunami — the T is written). Chinese needs the romanisation it actually arrived in.'
},
osemitic: {
  i: 'Arabic gave English its mathematics, astronomy and chemistry, and gave them early. Hebrew came through scripture. Both bring sounds English has no letters for.',
  s: 'AL- at the front is the Arabic word for "the", fused on: algebra, alkali, almanac, alchemy. That prefix is a gift of an answer.',
  w: 'The vowels are approximations, so they look wrong and are right. Learn the AL- family together, then the ones with Q for a sound English writes as K.'
},
oslavic: {
  i: 'Russian and the Slavic languages arrived mostly in the last two centuries, through politics, science and food, and they came with their suffixes attached.',
  s: 'Look for the endings: -NIK, -SKY, -VICH, -OVKA. And for the words that name a thing by what it does.',
  w: 'These are transliterations from Cyrillic, so the consonant clusters are real and complete. Tsar, borscht, sputnik and intelligentsia keep every letter.'
},
oturkic: {
  i: 'Persian and Turkish words walked the trade roads, which means they arrived slowly and through several other languages, picking up spellings along the way.',
  s: 'Bazaar, caravan, divan, khaki, kiosk, yogurt. If it is about trade, textiles, food or a tent, try the Silk Road.',
  w: 'Long vowels get written twice: bazaar, caravan. And KH is one sound with two letters, exactly as in the South Asian family next door.'
},
opacific: {
  i: 'Malay, Maori, Hawaiian and the Polynesian languages are built from open syllables, so their words are unusually easy to say and unusually easy to misspell.',
  s: 'Every consonant is followed by a vowel, and vowels often double. Count the syllables and write one vowel for each sound you hear.',
  w: 'Doubled vowels are the test: kangaroo, cockatoo, taboo, ukulele, luau. English wants to collapse them; the original does not.'
},
oworld: {
  i: 'When Europeans met the Americas and Africa they kept the local names for things they had never seen — which is why chocolate, canoe, safari and banjo are all loanwords.',
  s: 'Nahuatl and Quechua for the Americas, Bantu, Yoruba and Swahili for Africa. Food, animals and music are the biggest categories.',
  w: 'These came through Spanish or Portuguese first, so the spelling is a European guess at a non-European word: chocolate, tobacco, jaguar, gnu.'
},
ooldeng: {
  i: 'Old English is the home layer: the oldest and commonest words we own. They were spelled before the rules existed, and the pronunciation has moved on without them.',
  s: 'Short, blunt, and about something basic — body, weather, farming, family, fighting. If it feels like it has always been here, it has.',
  w: 'This is where the silent letters live: knee, gnaw, wrist, comb, thought, sword. Every one of those letters was once spoken and the spelling never caught up.'
},

/* ---------- Named after someone ---------- */
epgreek: {
  i: 'Greek myth is the deepest well of eponyms in English. A god or a hero was named, the name became a word, and the word kept the name’s spelling exactly.',
  s: 'The definition mentions a god, a titan, a nymph or a hero. Panic is Pan, echo is Echo, and tantalise is Tantalus.',
  w: 'Greek names bring Greek habits: CH for K, PH for F, and Y where an I would sound the same. Learn the myth and the letters follow.'
},
eplatin: {
  i: 'Roman names became words through emperors, generals, families and gods — and Latin names decline, so the word often keeps a Latin ending rather than an English one.',
  s: 'Julius gave July, Augustus gave August, and Cicero, Caesar and Vulcan are all still working as ordinary words.',
  w: 'Latin endings stay Latin: -IAN, -INE, -IAL. And a doubled letter inside a Roman name stays doubled however unlikely it looks.'
},
epfrench: {
  i: 'French eponyms come from inventors, chefs, aristocrats and soldiers — people who put their name on a thing and had that name spelled the French way forever after.',
  s: 'Guillotine, silhouette, mayonnaise, chauvinism, sadism. If the meaning names a French person, expect French letters.',
  w: 'French names keep their accents, their doubles and their silent endings. Béchamel, Praline and Nicotine each hold a person inside them.'
},
epiber: {
  i: 'Italian and Spanish eponyms come mostly from scientists, sailors and saints — and Italian names double their consonants, which is where the marks are won and lost.',
  s: 'Volt is Volta, galvanise is Galvani, and marzipan and maraschino keep their Italian shapes.',
  w: 'The doubles are the test. And Italian CH says K, so a name with CH in it is not going to sound the way it looks.'
},
epnordic: {
  i: 'German and Nordic eponyms are overwhelmingly scientific: the physicists, chemists and botanists who measured things got their names turned into the units.',
  s: 'If the word is a unit of measurement, it is almost certainly a surname: hertz, ohm, kelvin, angstrom, roentgen.',
  w: 'German names keep clusters and umlaut vowels flattened into English spellings — Fahrenheit, Diesel, Zeppelin, Mesmer. Write the whole surname.'
},
epeng: {
  i: 'English and Celtic eponyms come from earls, engineers, eccentrics and places on the British map, and they are the ones most likely to look like ordinary words.',
  s: 'Sandwich, boycott, cardigan, macadam, wellington. Each is a person or a place pretending to be a common noun.',
  w: 'Because they look ordinary, the temptation is to spell them by sound. Don’t: cardigan holds an earl, and macadam holds a man called McAdam.'
},
epworld: {
  i: 'The rest of the world’s namesakes: people and places from everywhere the previous shelves do not cover, from Arabic scholars to Indian mathematicians.',
  s: 'The definition names a person or a place you would not find in Europe. Ask for the language of the name, not the language of the word.',
  w: 'A name from outside Europe usually arrived through a transliteration, so it is more phonetic than it looks — but its vowels are a convention to be learned, not guessed.'
}
};
