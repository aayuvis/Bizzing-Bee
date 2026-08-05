/* Author Volume 14 — "The Grand Trunk Road": South Asian words in English.
   Chapters are written here and emitted to books/southasia-chapters.js in the
   same shape mkbooks.js expects (category/title/difficulty/concept/method/
   cards/words). Word definitions and pronunciations come from the real library
   so nothing in the book is invented. */
const fs = require('fs');
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
const named = JSON.parse(fs.readFileSync('/tmp/sa-named.json', 'utf8'));
const pool = JSON.parse(fs.readFileSync('/tmp/sa-pool.json', 'utf8'));
const poolBy = {}; for (const x of pool) poolBy[x.w.toLowerCase()] = x;

const clip = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/[,;:\s]+\S*$/, '') + '…' : s; };
function W(name, hook) {
  const r = named[name] || poolBy[name];
  if (!r) { console.error('MISSING word:', name); return null; }
  return { w: r.w, say: r.p || '', def: clip(r.d, 86), hook };
}
const words = list => list.map(([n, h]) => W(n, h)).filter(Boolean);

const CH = [];
const push = (title, difficulty, concept, method, cards, ws) =>
  CH.push({ category: 'South Asian Words in English', title, difficulty, concept, method, cards, words: ws });

/* ---------- 1 ---------- */
push('Words from the yoga mat — Sanskrit at the microphone', 'medium',
  'Sanskrit is the oldest language still feeding English new words, and it hands them over almost unchanged. That is the gift: what you hear is very nearly what you write. Long vowels stay long, every letter earns its place, and almost nothing is silent.',
  `<div class='trick'><b>ASANA</b></div>
<b>Say it.</b> AH-suh-nuh
<b>Spell it.</b> A · S · A · N · A
<b>The rule.</b> Sanskrit words are written the way they sound; trust the syllables
<b>Watch for.</b> the schwa in the middle is still an A, never a U`,
  [{ title: 'One letter, one sound', body: 'Sanskrit spelling was designed by grammarians to be exact. Say the word slowly and write what you hear — that strategy fails in French and works here.' },
   { title: 'Vowels do not hide', body: 'English loves to mumble unstressed vowels into schwa. In these words the vowel keeps its written identity: asana, not asuna; prana, not pruna.' },
   { title: 'The -a ending', body: 'A huge share of these words end in a plain -a: yoga, karma, asana, prana, dharma. When you hear that soft final "uh", reach for A first.' },
   { title: 'Ask for the language', body: 'At the mic, "Sanskrit" is a gift of an answer. It tells you: spell it phonetically, keep every vowel, and do not expect silent letters.' }],
  words([['yoga', 'YOH-guh — the O is long, the ending is a plain A'],
         ['mantra', 'MAN + TRA — two clean beats, no vowel between N and T'],
         ['asana', 'three A vowels; the middle one still writes as A'],
         ['prana', 'PRA + NA — the opening PR is a real cluster, not "puh-rana"'],
         ['karma', 'KAR + MA — R then M, nothing between them'],
         ['dharma', 'DH is one sound; the H rides the D and cannot be dropped'],
         ['nirvana', 'NIR + VA + NA — three beats, the middle A is long'],
         ['chakra', 'CH + A + KRA — the KR cluster stays together'],
         ['guru', 'two U vowels, both long: GOO-roo'],
         ['sutra', 'SU + TRA — the same -TRA ending as mantra'],
         ['avatar', 'A · VA · TAR — three As, and it ends in R, not A'],
         ['yogi', 'yoga with an I: the one in this family that does not end in A']]));

/* ---------- 2 ---------- */
push('The aspirated letters — bh, dh, gh, kh, th', 'hard',
  'This is where South Asian words are actually lost. Indian languages pair many consonants with a breath: bh, dh, gh, kh, jh, th. English ears hear one sound and write one letter, and the H disappears. The H is not decoration — it is a separate letter of the original alphabet.',
  `<div class='trick'><b>DHARMA</b></div>
<b>Say it.</b> DAR-muh
<b>The trap.</b> your ear hears a plain D
<b>The truth.</b> the original letter is DH — D plus breath
<b>The move.</b> ask for the language; if the answer is Sanskrit or Hindi, test DH before D`,
  [{ title: 'Five pairs to know', body: 'BH, DH, GH, JH and KH each write one sound in English but two letters on paper. Learn them as pairs and the H stops surprising you.' },
   { title: 'Say it with the breath', body: 'Practise puffing the H: d-hARma, b-HANgra. Exaggerating the breath while you study builds the habit of writing the H under pressure.' },
   { title: 'Where the H hides', body: 'The H almost always follows its consonant, never precedes it: it is GH not HG, DH not HD. If you can hear the puff, put H second.' },
   { title: 'Check yourself twice', body: 'Any South Asian word with a K, G, D, B or J sound deserves one extra thought: was there a breath after it? That single question saves more words than any other rule here.' }],
  words([['bhangra', 'BH — a B with a breath; the H is the whole trap'],
         ['ghee', 'GH then double E — the H rides the G'],
         ['jodhpurs', 'DH in the middle, and the U before R is silent-ish but written'],
         ['khaki', 'KH at the front, then a plain K — two different letters, same sound'],
         ['dharma', 'DH opens it; D alone is the classic miss'],
         ['kurta', 'no H here — a clean K, which is exactly why you must check'],
         ['chutney', 'CH is its own pair; TN sit together with no vowel'],
         ['gymkhana', 'GYM then KHANA — the KH survives inside the word'],
         ['pukka', 'double K, no H — the doubling replaces the breath'],
         ['chukker', 'CH opening, double K middle, -ER ending']]));

/* ---------- 3 ---------- */
push('What you wear — the clothing words', 'easy',
  'British traders and soldiers carried home the clothes before the words. Every one of these was a garment first and an English word second, and most keep a spelling that looks nothing like the way an English word "should" look.',
  `<div class='trick'><b>JODHPURS</b></div>
<b>Say it.</b> JOD-perz
<b>Spell it.</b> J · O · D · H · P · U · R · S
<b>Break it.</b> jodh · purs
<b>The trap.</b> the silent-sounding DH, then a U you barely hear`,
  [{ title: 'Place names became clothes', body: 'Jodhpurs from Jodhpur, cashmere from Kashmir, madras from the city, calico from Calicut. If a garment sounds like a place, it probably is one — and place spellings do not simplify.' },
   { title: 'The -a endings again', body: 'kurta, sari, dhoti: short garments, short words, plain vowels. These are the easy half of the family.' },
   { title: 'Cummerbund is two words', body: 'From Persian kamar (waist) plus band (tie). Knowing it is a compound explains the double M and the D at the end.' },
   { title: 'Watch the doubles', body: 'cummerbund and bandanna both double a letter English would not: MM and NN. Doubling is the single most common error in this group.' }],
  words([['kurta', 'KUR + TA — a clean K, no H'],
         ['jodhpurs', 'the DH plus the city it came from'],
         ['cummerbund', 'double M — Persian kamar (waist) + band'],
         ['bandanna', 'double N in the middle, then a single A'],
         ['dungaree', 'ends -EE; named for Dongri, a Mumbai district'],
         ['sari', 'the simplest in the family: four letters, both vowels plain'],
         ['shawl', 'SH then AWL — the W is written even though the vowel swallows it'],
         ['chintz', 'ends in TZ — from Hindi chint, a spotted cloth'],
         ['phulkari', 'PH says F; then UL · KA · RI, all plain vowels'],
         ['nainsook', 'NAIN + SOOK — a double O in the second half']]));

/* ---------- 4 ---------- */
push('What you eat — the kitchen words', 'easy',
  'Food words travel first and fastest, and they arrive with their spelling intact because nobody wants to rename dinner. Several of these were spelled by British ears rather than Indian ones, which is exactly why they look strange.',
  `<div class='trick'><b>MULLIGATAWNY</b></div>
<b>Say it.</b> mul-ih-guh-TAW-nee
<b>Break it.</b> mul · li · ga · taw · ny
<b>The story.</b> Tamil milagu-tanni, "pepper water" — an English ear wrote it down
<b>The traps.</b> double L, then a schwa A, then AW before -NY`,
  [{ title: 'English ears, Indian words', body: 'Mulligatawny is what "milagu-tanni" sounded like to a British soldier. When a word was transcribed by ear, expect doubled letters and unexpected vowels.' },
   { title: 'The schwa problem lands here too', body: 'mulligatAwny, tamArind, basmAti: unstressed vowels mumble. Say the word in beats and give each vowel its full value while you study.' },
   { title: 'Short and safe', body: 'ghee, curry, chutney, basmati — these are short, phonetic and reliable. Bank them quickly so your energy goes to the long ones.' },
   { title: 'One is a plural trap', body: 'curry becomes curries: the Y turns to I before -ES, exactly like the ordinary English rule. Loanwords still obey English grammar once they settle in.' }],
  words([['tamarind', 'TAM + A + RIND — the middle A is a schwa but writes as A'],
         ['chutney', 'CH opening; TN with no vowel between'],
         ['basmati', 'BAS + MA + TI — three beats, three plain vowels'],
         ['mulligatawny', 'double L, then AW before the -NY ending'],
         ['curry', 'double R before the Y'],
         ['ghee', 'the GH pair plus a double E'],
         ['jaggery', 'double G in the middle, then -ERY'],
         ['kedgeree', 'DG makes the J sound, then -EREE'],
         ['mango', 'from Tamil mankay; the O ending is the English part'],
         ['saffron', 'double F — the Persian root travelled with the spice']]));

/* ---------- 5 ---------- */
push('The Raj words — English that came home changed', 'medium',
  'For two centuries English lived in South Asia and picked up vocabulary for things it had no word for: a house with a low roof, a bribe, a mob, a cart too heavy to stop. These words feel completely English now, which is what makes their spelling sneaky.',
  `<div class='trick'><b>JUGGERNAUT</b></div>
<b>Say it.</b> JUG-er-nawt
<b>Break it.</b> jug · ger · naut
<b>The traps.</b> double G, then -NAUT with an A you cannot hear
<b>The story.</b> Jagannath, a temple chariot so vast it could not be stopped`,
  [{ title: 'They hide in plain sight', body: 'bungalow, cushy, loot, thug, pundit — nobody hears these as foreign, so nobody double-checks them. That is precisely why they show up in finals.' },
   { title: 'AU and OO surprises', body: 'juggernaut ends -NAUT, not -NOT. loot doubles its O. These vowel choices come from transliteration, not from English patterns.' },
   { title: 'A house with a Bengali name', body: 'bungalow is from bangla — "of Bengal", a Bengali-style house. The -OW ending is an English spelling of a Bengali vowel.' },
   { title: 'Ask for the meaning', body: 'Several of these have shifted meaning: a pundit was a learned scholar, a thug was a member of a specific gang. If a definition sounds oddly specific and old, suspect the Raj.' }],
  words([['bungalow', 'from bangla, "of Bengal"; ends -OW'],
         ['juggernaut', 'double G plus the -NAUT ending'],
         ['cushy', 'from khush (pleasant) — one S, then Y'],
         ['loot', 'double O; from Hindi lut, plunder'],
         ['thug', 'TH then UG — three letters, no trap, easy points'],
         ['pundit', 'from pandit, a scholar; a plain single-consonant word'],
         ['veranda', 'one R, one N, ends in plain A'],
         ['cheroot', 'CH then double O — from Tamil shuruttu, a roll'],
         ['dacoit', 'OI in the middle; an armed robber'],
         ['sepoy', 'SE + POY — from Persian sipahi, a soldier']]));

/* ---------- 6 ---------- */
push('Beasts, boats and the wild', 'medium',
  'When English met animals and boats it had never seen, it borrowed the local name rather than invent one. These words are old, worn smooth by centuries of use, and their spellings preserve sounds that English then reshaped.',
  `<div class='trick'><b>CATAMARAN</b></div>
<b>Say it.</b> KAT-uh-muh-ran
<b>Break it.</b> ca · ta · ma · ran
<b>The story.</b> Tamil kattumaram, "tied wood" — two hulls lashed together
<b>The traps.</b> four beats, and the two middle vowels are both schwa but both A`,
  [{ title: 'All-A words', body: 'catamaran, sambar, bandicoot: when the schwa mumbles, A is the safest bet in this family. Sanskrit and Tamil both lean heavily on A.' },
   { title: 'Cheetah keeps its H', body: 'From Sanskrit chitra, "spotted". The CH and the final H both survive — English would happily have written "cheeta", but the H stayed.' },
   { title: 'Jungle changed its vowel', body: 'From jangal, meaning wasteland or uncultivated ground. English shifted the A to U and softened the meaning to dense forest.' },
   { title: 'Two hulls, two words', body: 'catamaran is a compound in Tamil (kattu + maram). Long loanwords are often compounds; splitting them is easier than memorising them.' }],
  words([['catamaran', 'four beats, and every vowel is an A'],
         ['cheetah', 'from chitra, spotted; keeps both the CH and the final H'],
         ['jungle', 'from jangal — the A became U in English'],
         ['bandicoot', 'BANDI + COOT — double O in the tail'],
         ['nilgai', 'NEEL + GY — nil (blue) + gai (cow), a compound animal'],
         ['nilgai', 'NIL + GAI — "blue cow"; the AI is one sound'],
         ['jackal', 'from Sanskrit srgala; ends -AL, not -EL'],
         ['dinghy', 'from dingi; the GH pair before the Y'],
         ['mongoose', 'from Marathi mangus; double O, and the plural is mongooses'],
         ['teak', 'from Malayalam tekka — EA for one long sound']]));

/* ---------- 7 ---------- */
push('The road words — Persian along the trade routes', 'medium',
  'Persian was the court and trade language across much of South and Central Asia for centuries, so a whole layer of English words reached us through Persian on their way from or to India. They tend to be short, concrete and market-flavoured.',
  `<div class='trick'><b>BAZAAR</b></div>
<b>Say it.</b> buh-ZAR
<b>Spell it.</b> B · A · Z · A · A · R
<b>The trap.</b> the double A — one sound, two letters
<b>Compare.</b> caravan has three separate As; bazaar doubles one`,
  [{ title: 'Persian doubles vowels', body: 'bazaar keeps AA for a single long vowel — a Persian habit English normally refuses. It is the most-missed letter pair in this chapter.' },
   { title: 'Short and concrete', body: 'divan, turban, caravan, khaki: market goods and travel gear. Persian trade words are usually two or three plain syllables.' },
   { title: 'Shampoo is a command', body: 'From Hindi champo — "press!" — the imperative of champna, to knead. It arrived as a head massage, not a bottle.' },
   { title: 'Watch the -AN endings', body: 'divan, turban, caravan all end -AN. If you hear that soft "un" at the end of a Persian-route word, write AN before EN or ON.' }],
  words([['bazaar', 'the double A is the whole test'],
         ['caravan', 'three separate As, no doubling'],
         ['divan', 'DI + VAN — ends -AN'],
         ['turban', 'TUR + BAN — the second vowel is A, not E'],
         ['shampoo', 'from champo, "press!"; double O ending'],
         ['khaki', 'the KH pair; Persian for dusty'],
         ['cashmere', 'from Kashmir; the place kept its K, the cloth took a C'],
         ['calico', 'from Calicut; one L, ends -CO'],
         ['madras', 'a city that became a cloth and a curry'],
         ['maharaja', 'MAHA (great) + RAJA (king) — a compound worth splitting']]));

/* ---------- 8 ---------- */
push('Sanskrit compounds — long words built from short ones', 'hard',
  'Sanskrit builds meaning by welding words together, and it does so freely: a compound can run for many syllables and still be one legal word. English inherited some of these whole. Learn the pieces and the terrifying long ones become arithmetic.',
  `<div class='trick'><b>MAHATMA</b></div>
<b>Say it.</b> muh-HAHT-muh
<b>Break it.</b> maha + atma
<b>The pieces.</b> maha = great · atma = soul
<b>The join.</b> the two As merge into one long A: mah-ATma`,
  [{ title: 'maha- means great', body: 'maharaja (great king), maharani (great queen), mahatma (great soul). One prefix, a whole family of words — and it is always MAHA, never maja or mahar.' },
   { title: 'Vowels merge at the seam', body: 'When Sanskrit joins two words, touching vowels fuse. That is why mahatma has one A where you might expect two — the seam is invisible in the spelling.' },
   { title: 'Split before you spell', body: 'For any long Sanskrit word, find the seam first. Two short words are always easier to spell than one long one, and the seam usually falls at a consonant pair.' },
   { title: 'The technical ones', body: 'bahuvrihi and dvandva are the grammarians’ own names for compound types. They look impossible and are perfectly phonetic — proof that the phonetic rule holds even at the top of the difficulty scale.' }],
  words([['mahatma', 'maha (great) + atma (soul), vowels merged'],
         ['maharaja', 'maha + raja — the same prefix, a new word'],
         ['ashram', 'ASH + RAM — SH then R, no vowel between'],
         ['chakra', 'the KR cluster; a wheel or centre'],
         ['tulsi', 'TUL + SI — the sacred basil, four letters, no traps'],
         ['bindi', 'BIN + DI — from bindu, a dot'],
         ['swami', 'SW opening cluster, then -AMI'],
         ['rajah', 'the optional final H that raja can also drop'],
         ['pundit', 'from pandit — the A became U in English'],
         ['gymkhana', 'GYM + KHANA; the KH survives mid-word']]));

/* ---------- 9 ---------- */
push('The spice trail — words older than the empire', 'medium',
  'Some of these came so long ago they no longer feel borrowed at all. Sugar, ginger, candy and camphor reached English through Persian, Arabic, Greek and Latin — but they started in Sanskrit or Tamil, and their spellings carry the whole journey.',
  `<div class='trick'><b>SUGAR</b></div>
<b>Say it.</b> SHOOG-er
<b>The journey.</b> Sanskrit sharkara → Persian → Arabic → Latin → French → English
<b>The oddity.</b> the S is pronounced SH, which no English rule predicts
<b>Why.</b> five languages each reshaped it a little`,
  [{ title: 'The longest journeys distort most', body: 'A word that passed through four languages arrives bent. sugar, ginger and candy all look nothing like their Sanskrit ancestors — and each irregularity is one language’s fingerprint.' },
   { title: 'Ginger doubles its G sound', body: 'From Sanskrit srngavera via Greek and Latin. Both Gs are soft, which is why the spelling looks so unlike its sound.' },
   { title: 'Candy was a lump of sugar', body: 'From khanda, a piece or fragment. The KH lost its H on the road through Persian and Arabic — the opposite of the aspiration rule you learned earlier.' },
   { title: 'Ask for the origin anyway', body: 'If the judge says Sanskrit for a word this ordinary, that is a warning: this one travelled, so the phonetic rule may not hold. Ask for language history when you can.' }],
  words([['sugar', 'from sharkara; the S says SH'],
         ['ginger', 'both Gs soft; a long journey through Greek and Latin'],
         ['candy', 'from khanda, a fragment — the H fell away'],
         ['camphor', 'PH says F; from Sanskrit karpura'],
         ['saffron', 'double F; the spice and the word arrived together'],
         ['musk', 'from Sanskrit muska; four letters, no trap'],
         ['lilac', 'through Persian from Sanskrit nila, blue'],
         ['orange', 'from naranga; English lost the opening N'],
         ['lemon', 'from limu via Persian and Arabic'],
         ['sapphire', 'double P then -IRE; from Sanskrit sanipriya']]));

/* ---------- 10 ---------- */
push('Festival, faith and the arts', 'hard',
  'These are the words English borrowed for things it had no concept for: a dance form, a devotional act, a philosophical stance. They are almost always transcribed straight from the original, which makes them phonetic — and long.',
  `<div class='trick'><b>KATHAKALI</b></div>
<b>Say it.</b> kah-thah-KAH-lee
<b>Break it.</b> ka · tha · ka · li
<b>The pattern.</b> KA · THA · KA · LI — the beats almost repeat
<b>The trap.</b> the TH in the middle is aspirated T, and the H must be written`,
  [{ title: 'Rhythm beats memory', body: 'Dance and music words are built on rhythm, so say them in rhythm. kathakali, bhangra and abhinaya are far easier chanted than spelled letter by letter cold.' },
   { title: 'Aspiration returns', body: 'kathakali, abhinaya, bhangra: the H after T, B and other consonants is doing real work. This chapter is the aspiration chapter’s hardest exam.' },
   { title: 'Ahimsa is a stance', body: 'From a- (not) plus himsa (harm) — non-violence. The prefix a- meaning "not" works exactly like the Greek one you already know.' },
   { title: 'These are gift words', body: 'Because they were transcribed by scholars rather than soldiers, they follow the original spelling closely. Trust the phonetic rule here more than anywhere else in the book.' }],
  words([['kathakali', 'four beats; the middle TH keeps its H'],
         ['bhangra', 'the BH pair opens it'],
         ['ahimsa', 'a- (not) + himsa (harm)'],
         ['prana', 'the PR cluster; life breath'],
         ['tulsi', 'sacred basil; plain and short'],
         ['bindi', 'from bindu, a dot'],
         ['mantra', 'the -TRA ending, shared with sutra'],
         ['dharma', 'the DH opening — the chapter’s recurring test'],
         ['nirvana', 'NIR + VA + NA; the middle A is long'],
         ['guru', 'two long U vowels']]));

/* ---------- 11 ---------- */
push('At the microphone — the South Asian checklist', 'hard',
  'Everything in this book collapses into a short routine. South Asian words reward the speller who asks the right two questions and then trusts the syllables, because these words were written to be sounded out.',
  `<div class='trick'><b>THE ROUTINE</b></div>
<b>Ask 1.</b> what language? Sanskrit, Hindi, Tamil, Persian — each has a habit
<b>Ask 2.</b> is there a breath? test BH, DH, GH, KH, TH before the plain letter
<b>Then.</b> count the beats out loud
<b>Then.</b> give every unstressed vowel its written value — usually A`,
  [{ title: 'Two questions, most of the marks', body: 'Language, then aspiration. Those two answers decide the spelling of the majority of South Asian words you will ever face on a stage.' },
   { title: 'A is the default vowel', body: 'When a vowel mumbles in one of these words, A is the highest-probability letter by a wide margin. That single habit is worth more than memorising lists.' },
   { title: 'Compounds beat length', body: 'Long words here are nearly always two short words joined. maha+raja, katta+maram, kamar+band. Find the seam and the length stops mattering.' },
   { title: 'You already know these', body: 'If your family speaks a South Asian language, you have an advantage no other origin gives you: you have heard these words correctly your whole life. Trust that ear — then check for the H.' }],
  words([['bazaar', 'the double A'],
         ['jodhpurs', 'the DH'],
         ['mulligatawny', 'the double L and the AW'],
         ['catamaran', 'four As'],
         ['cummerbund', 'the double M'],
         ['juggernaut', 'the double G and -NAUT'],
         ['mahatma', 'the merged seam'],
         ['kathakali', 'the rhythm and the TH'],
         ['bandanna', 'the double N'],
         ['chutney', 'the CH and the TN']]));

/* ---------- storyboard scenes (the comic opener of each chapter) ----------
   Same shape as SB_CSCRIPT / SB_ADV_CSCRIPT: {label, scenes:[{mood, cap, say, show}]}.
   Naga guides this volume; Bizzy opens every chapter; the 'oops' beat is Vex. */
const SC = [
  ['the phonetic gift', [
    ['happy', 'A language that spells fair', 'Naga, French has worn me out. Name one origin that plays fair.', { word: 'asana' }],
    ['think', 'Designed to be exact', 'Sanskrit. One letter, one sound. Say it slowly and write exactly what you hear.', { parts: ['a', 'sa', 'na'] }],
    ['oops', 'The vowel you swallow', 'Careless! You mumbled the middle vowel and wrote asuna. Every schwa is my doorway.', { glyph: 'ə' }],
    ['excited', 'Give every vowel its letter', 'Not here. asana, prana, dharma — the vowel keeps its letter. Soft uh means A.', { list: ['yoga', 'karma', 'sutra'] }]]],
  ['the breath letters', [
    ['happy', 'One sound, two letters', 'Naga, I wrote darma and lost. The judge said dharma. Where did that H come from?', { word: 'dharma' }],
    ['think', 'The H is a letter, not decoration', 'Indian languages breathe their consonants. One sound in your ear, two letters on paper.', { parts: ['d', '+', 'h'] }],
    ['oops', 'Your ear will not save you', 'Puff all you like. English ears drop the H, and I collect every one.', { big: 'no H for you' }],
    ['excited', 'Ask, then test', 'So I stop trusting my ear. Sanskrit or Hindi? Then test the breath first.', { list: ['bhangra', 'ghee', 'khaki'] }]]],
  ['what came home in a trunk', [
    ['happy', 'Clothes before words', 'Naga, why do riding trousers hide a DH in the middle?', { word: 'jodhpurs' }],
    ['think', 'It is a place', 'Because Jodhpur is a city. Place names never simplify their spelling for anyone.', { parts: ['jodh', 'purs'] }],
    ['oops', 'The doubles are mine', 'And while you admire the geography, you will write cumerbund with one M. You always do.', { word: 'cummerbund' }],
    ['excited', 'Find the seam', 'Persian kamar, waist, plus band, tie. Two words, so two Ms meet at the seam.', { parts: ['kamar', 'band'] }]]],
  ['the kitchen words', [
    ['happy', 'Words you can eat', 'Naga, half my dinner is on the list. Tandoori. Chutney. Basmati. Are they friendly?', { list: ['chutney', 'basmati', 'tandoori'] }],
    ['think', 'Mostly, yes', 'Food words travelled by mouth and kept their sounds. Break them into beats.', { parts: ['tan', 'doo', 'ri'] }],
    ['oops', 'Except the long one', 'Mulligatawny. Say it fast and a letter goes missing. I will be waiting there.', { word: 'mulligatawny' }],
    ['excited', 'So I slow down', 'Mul · li · ga · taw · ny. Five beats, a double L, and AW.', { parts: ['mul', 'li', 'ga', 'taw', 'ny'] }]]],
  ['English that came home changed', [
    ['happy', 'A word with a passport', 'Naga, my dictionary says bungalow is English. It also says it is Bengali. Which is it?', { word: 'bungalow' }],
    ['think', 'Both, in order', 'From bangla — of Bengal. English borrowed the house, then spelled it the English way.', { parts: ['bangla', 'bungalow'] }],
    ['oops', 'Borrowed spellings wobble', 'A wobbling spelling is a gift to me. Was it -ow? -oe? Choose wrong.', { glyph: '-ow?' }],
    ['excited', 'Learn the family', 'bungalow, veranda, pyjamas, shampoo — English endings over Indian roots. Learn the pattern once.', { list: ['veranda', 'pyjamas', 'shampoo'] }]]],
  ['beasts, boats and the wild', [
    ['happy', 'All the vowels are A', 'Naga, catamaran has four As in a row of syllables. Is that allowed?', { word: 'catamaran' }],
    ['think', 'Tamil built it that way', 'kattu, to tie; maram, wood. Tied wood — a boat. Tamil leans hard on A.', { parts: ['kattu', 'maram'] }],
    ['oops', 'Bet wrong once', 'One O instead of an A and the boat sinks. Catomaran looks almost right.', { big: 'catomaran' }],
    ['excited', 'Almost right is out', 'So I write A and find the seam. cheetah, nilgai, sambar — all compounds.', { list: ['cheetah', 'nilgai', 'sambar'] }]]],
  ['the road words', [
    ['happy', 'Words that walked', 'Naga, bazaar has two As next to each other. Nothing in English does that.', { word: 'bazaar' }],
    ['think', 'Persian, along the road', 'It is Persian, off the trade roads. Its long vowels get written twice.', { parts: ['ba', 'zaar'] }],
    ['oops', 'One A is easier', 'And so much more tempting. Bazar. Look how tidy it is. Write the tidy one.', { big: 'bazar' }],
    ['excited', 'Tidy is not correct', 'Two As, because the vowel is long. Persian holds it; the spelling holds it.', { list: ['caravan', 'divan', 'khaki'] }]]],
  ['long words, short parts', [
    ['happy', 'A word the length of a road', 'Naga, chakravyuha. That is nine letters of trouble before breakfast.', { word: 'chakravyuha' }],
    ['think', 'It is two words holding hands', 'chakra, wheel; vyuha, formation. Sanskrit joins short words and never hides the seam.', { parts: ['chakra', 'vyuha'] }],
    ['oops', 'Then find the seam', 'You will not. Under the lights a long word looks like one unbroken wall.', { big: '9 letters' }],
    ['excited', 'Walls have bricks', 'maharaja is maha plus raja. Once I see the bricks, length stops frightening me.', { list: ['maharaja', 'mahatma', 'chakra'] }]]],
  ['older than the empire', [
    ['happy', 'The oldest borrowing of all', 'Naga, sugar is on my list. Sugar. It cannot possibly be a hard word.', { word: 'sugar' }],
    ['think', 'It is the oldest one here', 'Sanskrit sharkara, through Persian, Arabic, Italian, French. Four languages bent it. Hence the SH.', { parts: ['sharkara', 'sugar'] }],
    ['oops', 'Long journeys break words', 'Exactly. A broken word cannot be reasoned out. You can only know it.', { glyph: 'sh?' }],
    ['excited', 'Then I know it', 'ginger, candy, camphor — each irregular spelling is a fingerprint of its road.', { list: ['ginger', 'candy', 'camphor'] }]]],
  ['festival, faith and the arts', [
    ['happy', 'Words with drums in them', 'Naga, kathakali. Four beats and a TH I do not trust.', { word: 'kathakali' }],
    ['think', 'Trust it — and clap it', 'ka · tha · ka · li. The TH keeps its breath. Clap all four beats.', { parts: ['ka', 'tha', 'ka', 'li'] }],
    ['oops', 'Beats are not spelling', 'One clap short and it collapses. Kathkali. The judge notices even if nobody else does.', { big: 'kathkali' }],
    ['excited', 'Four beats, four written', 'diwali, mandala, abhinaya, bhangra. If I can dance the word, I can spell the word.', { list: ['diwali', 'mandala', 'bhangra'] }]]],
  ['the checklist', [
    ['happy', 'One routine for all of them', 'Naga, the bell is in an hour. Give me the routine.', { big: 'ask · breathe · beat' }],
    ['think', 'Two questions carry most of it', 'Ask the language. Ask about the breath. Those two answers decide most of them.', { parts: ['language?', 'breath?'] }],
    ['oops', 'And the third thing', 'The doubles. bazaar, cummerbund, bandanna. You will remember the H and forget the doubling.', { list: ['bazaar', 'bandanna'] }],
    ['excited', 'Then the checklist has four', 'Language. Breath. Beats. Doubles. Every unstressed vowel is an A until proven otherwise.', { list: ['dharma', 'catamaran', 'chutney'] }]]],
];
const MOOD_CAP = {};
CH.forEach((c, i) => {
  const s = SC[i]; if (!s) { console.error('NO SCENES for', c.title); return; }
  c.sc = { label: s[0], scenes: s[1].map(([mood, cap, say, show]) => ({ mood, cap, say, show })) };
});

const missing = CH.filter(c => c.words.length < 8);
if (missing.length) { console.error('thin chapters:', missing.map(c => c.title)); }
if (CH.some(c => !c.sc)) { console.error('missing scenes'); process.exit(1); }
fs.writeFileSync('books/southasia-chapters.js',
  '/* Volume 14 — The Grand Trunk Road: South Asian words in English.\n' +
  '   Authored for the book series; word definitions and pronunciations are pulled\n' +
  '   from the app word library at authoring time, so nothing here is invented.\n' +
  '   Shape matches SB_CONCEPTS chapters (category/title/difficulty/concept/method/\n' +
  '   cards/words) so mkbooks.js can treat it like any other chapter source. */\n' +
  'window.SB_SOUTHASIA = ' + JSON.stringify(CH, null, 1) + ';\n');
console.log('chapters:', CH.length, '| words total:', CH.reduce((a, c) => a + c.words.length, 0));
console.log('bytes:', fs.statSync('books/southasia-chapters.js').size);
