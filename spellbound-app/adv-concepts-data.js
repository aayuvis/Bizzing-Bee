/* Bizzing Bee — ADVANCED concept chapters. Gated to Advanced Mode; never appear in the
   general concept list. Same chapter shape as SB_CONCEPTS plus `adv:true`, but pitched at
   national-level competitors: these teach decision PROCEDURES, not word parts.

   Narration lives in SB_ADV_CSCRIPT, indexed by position in this array. Clips are
   voice/a<i>-<n>.mp3, synthesised with Kokoro voice `am_michael` at 0.95x — a slower,
   lower register than the kid-facing af_heart used for the 121 general chapters.

   Stage types used here beyond the general set (glyph/word/list/build/breakdown):
     shift  {rows:[{label,syl:[],on}]}          stress moving under derivation
     rescue {unclear:{word,at}, clear:{word,syl:[],on}}   schwa recovered via a relative
     tree   {sound, branches:[{sp,org,ex}]}     one sound, candidate spellings by origin
     pair   {left, right, root, note}           two words, one root, two routes
     ask    {q, rules:[]}                       a question at the mic and what it rules out */
window.SB_ADV_CONCEPTS = { version: 1, chapters: [

/* ---------- 0. Schwa Rescue ---------- */
{
  title: 'Schwa Rescue — find the relative that stresses the vowel',
  category: 'Championship Procedure', difficulty: 'expert', adv: true,
  concept: 'The schwa is the largest single source of misspelling because it carries no spelling information: any vowel, and the letter y, can reduce to it. Listening harder cannot help. The procedure is to find a related word in which that syllable takes the stress, which restores the vowel to its true identity.',
  method: "<div class='trick'><b>DEFINITE</b></div>\n<b>Problem.</b> DEF-uh-nit — the second vowel is a schwa, so it could be a, e, i, o or u\n<b>Find a relative.</b> definition\n<b>Stress it.</b> def-i-NI-tion — the syllable is now stressed\n<b>Read the vowel.</b> i\n<b>Return.</b> def-i-nite\n<b>Check.</b> the root is Latin finis = boundary, which also carries i",
  cards: [
    { title: 'Why the schwa is different', body: 'Every other sound in English narrows your options. Hear /f/ and you are choosing between f, ph and gh. Hear a schwa and you are choosing between every vowel in the alphabet plus y. It is the only sound that gives you nothing, which is why it accounts for the majority of championship misspellings.' },
    { title: 'The relative test', body: 'English keeps a vowel\'s spelling constant across a word family even when the sound changes. So a relative where the syllable is stressed shows you the letter directly. custody is unclear; cus-TO-dian is not. major is unclear; ma-JOR-ity is not. local is unclear; lo-CAL-ity is not.' },
    { title: 'Building the reflex', body: 'The reflex to train is: hear a schwa, immediately reach for the -ity, -ic, -ian, -ation or -ify form of the same word. Those four suffixes pull stress toward themselves, which is exactly what you need. If no relative exists, fall through to the root: the Latin or Greek source usually carries the vowel you want.' },
    { title: 'When there is no relative', body: 'Some words are morphological orphans and have no stressed relative. For those, the root is your only route, and if the root is unknown, ask for the language of origin and spell to that language\'s default. Guessing a is not a strategy; guessing the origin default is.' },
  ],
},

/* ---------- 1. Stress Shift ---------- */
{
  title: 'Stress Shift — predicting which vowel will fail',
  category: 'Championship Procedure', difficulty: 'expert', adv: true,
  concept: 'Stress moves as suffixes attach, and whichever syllable loses the stress reduces to a schwa. Knowing where the stress will land lets you predict which vowel is about to become unreliable before you have to spell it, and which relative will rescue it.',
  method: "<div class='trick'><b>PHOTOGRAPH → PHOTOGRAPHY → PHOTOGRAPHIC</b></div>\n<b>Base.</b> PHO-to-graph — stress on 1\n<b>Add -y.</b> pho-TOG-ra-phy — stress moves to 2\n<b>Add -ic.</b> pho-to-GRAPH-ic — stress moves to 3\n<b>Consequence.</b> the o in the second syllable is clear in photography, mumbled in photograph\n<b>Use it.</b> to spell photograph, borrow the vowel from photography",
  cards: [
    { title: 'Suffixes that pull stress', body: '-ity, -ic, -ian, -ify, -ation and -ial move the stress toward themselves, usually onto the syllable immediately before them. This is why they are so useful for schwa rescue: they relocate the stress onto exactly the syllable you could not hear.' },
    { title: 'Suffixes that leave stress alone', body: '-ness, -less, -ment, -ful, -ly and -er attach without moving the stress. They are the Germanic layer of English and they behave politely. They are no help for rescue, because the syllable you cannot hear stays unstressed.' },
    { title: 'Reading a family as a set', body: 'Strong competitors do not learn words, they learn families, because one family shares one set of vowels across three or four stress patterns. monarch, monarchy, monarchic. lithograph, lithography, lithographic. patriarch, patriarchy, patriarchal. Learn the family and every member becomes spellable.' },
    { title: 'The trap of the base form', body: 'The base form is often the hardest member of a family to spell, because base forms carry the most unstressed syllables. Derived forms are easier. So when a base form is called, reach for the derivative in your head first, then work back.' },
  ],
},

/* ---------- 2. Language-of-Origin Decision Tree ---------- */
{
  title: 'The Origin Tree — one sound, ranked spellings',
  category: 'Championship Procedure', difficulty: 'expert', adv: true,
  concept: 'Knowing eight loanword groups is not the same as being able to use them. The usable form of that knowledge is the inverse lookup: given a sound you have just heard, which spellings are candidates, and in what order should you try them given the origin. This is why language of origin is the most valuable question at the microphone.',
  method: "<div class='trick'><b>HEARD /sh/</b></div>\n<b>English.</b> sh — shell, shawl\n<b>French.</b> ch — chef, chandelier, machine\n<b>German.</b> sch — schadenfreude, schnitzel\n<b>Italian.</b> sci — prosciutto, sciatica\n<b>Latin.</b> ti / ci — nation, precious\n<b>Ask.</b> the origin, and the list collapses to one",
  cards: [
    { title: 'Sounds that fan out', body: 'A handful of sounds carry almost all the risk. /f/ splits into f, ph and gh. /k/ before a front vowel splits into k, c, ch and qu. /sh/ splits five ways. Long /ee/ at word end splits into i, y, ie, is and ee. Learn these five fans cold and you have covered most of what a hard word can throw at you.' },
    { title: 'Origin defaults', body: 'Each origin has a default that is right far more often than not. Greek: ph for /f/, y for short /i/, ch for hard /k/, rh at the start. French: silent final consonant, ou for /oo/, eau for /oh/. Italian: every vowel sounded, doubled consonants, final vowel. German: sch, and compounding rather than suffixing.' },
    { title: 'Asking in the right order', body: 'If the word sounds Greek, ask the origin first and the root second, because the root will tell you the internal vowels. If it sounds French, ask the origin then the part of speech, because that settles the ending. If it sounds like it could be a homophone, ask for the definition before anything else.' },
    { title: 'When the tree gives two answers', body: 'Sometimes two branches survive. That is when alternate pronunciations earn their keep: a second pronunciation often stresses a different syllable and exposes a vowel the first one hid. Ask for it. It is the least used of the permitted questions and one of the most informative.' },
  ],
},

/* ---------- 3. Championship Question Strategy ---------- */
{
  title: 'At the Microphone — what each question rules out',
  category: 'Championship Procedure', difficulty: 'expert', adv: true,
  concept: 'You may ask for the language of origin, the definition, the part of speech, alternate pronunciations, and use in a sentence. Each one eliminates a different class of spelling, so the order you ask in should depend on the ambiguity you are actually facing rather than on habit.',
  method: "<div class='trick'><b>THE FIVE QUESTIONS</b></div>\n<b>Origin.</b> fixes which orthography applies\n<b>Root.</b> fixes internal vowels and doubled letters\n<b>Definition.</b> separates homophones\n<b>Part of speech.</b> settles -ance / -ant and -ence / -ent\n<b>Alternate pronunciation.</b> can move the stress and expose a schwa\n<b>Sentence.</b> confirms sense when the definition was abstract",
  cards: [
    { title: 'Origin first, almost always', body: 'Origin is the highest-information question because it selects the whole spelling system, not one letter. Every other question operates inside the system that origin picks. The exception is a suspected homophone, where the definition has to come first or you will spell the wrong word perfectly.' },
    { title: 'Part of speech is underrated', body: 'English distinguishes noun and adjective endings that sound identical. -ance and -ence, -ant and -ent, -cy and -sy, -ise and -ice. Knowing whether you are spelling a thing or a description of a thing frequently settles the last letter, and it is a question almost nobody asks.' },
    { title: 'Use your time deliberately', body: 'Asking questions is not stalling; it is the mechanism the rules give you for gathering evidence. But ask with a purpose. Decide what you do not know, ask the question that resolves it, and spell. Asking all five in sequence signals that you have no hypothesis, and burns the clock you may need.' },
    { title: 'Spelling out loud', body: 'Say the word, spell at a steady rhythm, say it again. The rhythm matters more at this level than it does at a school bee: it stops you compressing a doubled letter, and it gives you a beat in which to catch an error while a correction is still allowed. A rushed string of letters cannot be self-audited.' },
  ],
},

/* ---------- 4. Greek initial clusters ---------- */
{
  title: 'Greek Openings — ps, pn, mn, chth, phth, rh, bd',
  category: 'Advanced Orthography', difficulty: 'expert', adv: true,
  concept: 'Greek allowed consonant clusters at the start of a word that English does not pronounce. English kept the spelling and dropped the first sound. So an unexplained initial consonant is almost always a Greek fingerprint, and the clusters are a closed set you can memorise outright.',
  method: "<div class='trick'><b>PNEUMONIA</b></div>\n<b>Heard.</b> noo-MOHN-yuh — starts with an n sound\n<b>Origin.</b> Greek\n<b>Candidates.</b> n, kn, gn, pn\n<b>Greek default.</b> pn — from pneuma = breath\n<b>Spell.</b> P N E U M O N I A\n<b>Family.</b> pneumatic, pneumograph, pneumothorax",
  cards: [
    { title: 'The closed set', body: 'ps as in psalm and pseudonym. pn as in pneumonia and pneumatic. mn as in mnemonic. chth as in chthonic. phth as in phthisis. rh as in rhetoric and rhinoceros. bd as in bdellium and bdelloid. Also gn in gnomon and pt in ptomaine. That is nearly the whole inventory.' },
    { title: 'Which silent letter, though', body: 'Hearing an /n/ at the start leaves you choosing between kn, gn, pn and plain n. Origin decides it: kn and gn are Old English (knife, gnaw), pn is Greek (pneumonia). Hearing an /s/ leaves ps against sc against plain s, and ps is Greek. The silent letter is a label telling you which language you are in.' },
    { title: 'rh and the doubled rr', body: 'Greek rho takes an h after it at the start of a word, and when a prefix puts that rho inside a compound it doubles: rhythm but arrhythmia, rhea but diarrhoea, rhage but haemorrhage. If you hear a Greek word with an internal /r/ after a prefix, suspect rrh.' },
    { title: 'Our library holds 170 of these', body: 'The core competition library carries 170 words with one of these openings and the full library carries 427, so this is not a curiosity — it is a pattern worth an hour of drill. rhinorrhagia, pneumatocyst, bdelloid and phthisis all sit in the word pool you are already studying.' },
  ],
},

/* ---------- 5. Latin & Greek plurals ---------- */
{
  title: 'Classical Plurals — ae, i, a, ices, mata',
  category: 'Advanced Orthography', difficulty: 'expert', adv: true,
  concept: 'Words borrowed whole from Latin and Greek often kept their original plural, and the plural ending you hear tells you which declension the singular belonged to, which in turn tells you how to spell the singular. The relationship runs both ways and is worth knowing in both directions.',
  method: "<div class='trick'><b>VORTICES</b></div>\n<b>Heard.</b> VOR-tih-seez\n<b>Ending.</b> the /seez/ sound points to -ices\n<b>Rule.</b> Latin nouns in -ex or -ix take -ices\n<b>Singular.</b> vortex\n<b>Spell.</b> V O R T I C E S\n<b>Family.</b> index/indices, appendix/appendices, matrix/matrices",
  cards: [
    { title: 'The five main patterns', body: 'Latin -a becomes -ae: vertebra, vertebrae. Latin -us becomes -i: fungus, fungi. Latin -um becomes -a: datum, data. Latin -ex or -ix becomes -ices: vortex, vortices. Greek -ma becomes -mata: stigma, stigmata. Learn the pair, not the single form.' },
    { title: 'Hearing the plural first', body: 'At the microphone you are often given the plural, and the plural is the more informative form. -ae tells you the singular ended in -a. -ices tells you it ended in -ex or -ix, and that a c appears where you might have written an x. -mata tells you Greek, and that the singular ends -ma not -mat.' },
    { title: 'Where English overrode the original', body: 'Not every borrowing kept its classical plural, and some now take both. Some words moved fully into English endings, and a few plurals became singulars in the move: agenda and data both began as Latin plurals. When both forms are valid the bee will accept the one it asked for, so listen to the ending you were given.' },
    { title: 'Beyond the classics', body: 'French contributes -eaux for singulars in -eau: bureau, bureaux; tableau, tableaux. Italian contributes -i for -o: virtuoso, virtuosi. Hebrew contributes -im: cherub, cherubim; seraph, seraphim. Each is a small closed set and each is worth memorising as a set.' },
  ],
},

]};

/* ============================================================================
   NARRATION — indexed by chapter position above. Mature register: no exclamation,
   no cheerleading, second person, mechanism named. Read by Kokoro `am_michael`.
   ============================================================================ */
window.SB_ADV_CSCRIPT = {

0: { label: 'schwa rescue', scenes: [
  { mood: 'think', cap: 'The schwa gives you nothing',
    say: 'Every other sound in English narrows your options. Hear an eff sound and you are choosing between three spellings. Hear a schwa, and you are choosing between every vowel in the alphabet, plus the letter y. It is the only sound that tells you nothing at all.',
    show: { t: 'glyph', text: 'ə', sub: 'any vowel, and y' } },
  { mood: 'oops', cap: 'DEF-uh-nit — which vowel is that?',
    say: 'Take the word definite. The second syllable is unstressed, so it reduces. Def, uh, nit. That uh could be an a, an e, an i, an o or a u. Listening harder will not help you, because the information is not in the sound.',
    show: { t: 'rescue', unclear: { word: 'definite', at: 3 } } },
  { mood: 'happy', cap: 'Find a relative that stresses it',
    say: 'So do not listen harder. Find a relative. Definition. Now the syllable takes the stress. Def, i, NI, tion. The vowel is an i, and it was an i in definite all along.',
    show: { t: 'rescue', unclear: { word: 'definite', at: 3 }, clear: { word: 'definition', syl: ['def', 'i', 'ni', 'tion'], on: 2 } } },
  { mood: 'think', cap: 'It works across the whole language',
    say: 'This is not a trick for one word. English keeps a vowel spelled the same across a word family even when the sound changes. Custody is unclear; custodian is not. Major is unclear; majority is not. Local is unclear; locality is not.',
    show: { t: 'list', items: [{ word: 'custodian', hi: [4, 1] }, { word: 'majority', hi: [3, 1] }, { word: 'locality', hi: [3, 1] }] } },
  { mood: 'happy', cap: 'Four suffixes do the work',
    say: 'The suffixes that help are the ones that pull stress toward themselves. Ity. Ic. Ian. Ation. When you hear a schwa, reach for one of those forms of the same word, because those are the endings that relocate the stress onto the syllable you could not hear.',
    show: { t: 'glyph', text: '-ity -ic -ian -ation', sub: 'these pull the stress' } },
  { mood: 'think', cap: 'No relative? Go to the root',
    say: 'Some words have no stressed relative. For those, the root is your route. Definite comes from the Latin finis, meaning boundary, and that carries an i as well. And if the root is unknown, ask for the language of origin and spell to that language default. Guessing a is not a strategy.',
    show: { t: 'breakdown', word: 'definite', parts: [{ txt: 'de-', gloss: 'completely' }, { txt: 'fin', gloss: 'boundary' }, { txt: '-ite', gloss: 'made so' }] } },
] },

1: { label: 'stress shift', scenes: [
  { mood: 'think', cap: 'Stress is not fixed',
    say: 'Stress in English moves. Attach a suffix and the loud beat can jump to a different syllable, and whichever syllable loses the stress reduces to a schwa. So stress shift is not a curiosity. It is the mechanism that decides which vowel is about to fail you.',
    show: { t: 'glyph', text: 'stress moves', sub: 'and vowels reduce' } },
  { mood: 'happy', cap: 'PHO-to-graph → pho-TOG-ra-phy',
    say: 'Photograph. The stress is on the first syllable. Now add a y. Photography. The stress has moved to the second. Add ic instead, and you get photographic, with the stress on the third. One family, three stress patterns.',
    show: { t: 'shift', rows: [
      { label: 'photograph', syl: ['pho', 'to', 'graph'], on: 0 },
      { label: 'photography', syl: ['pho', 'tog', 'ra', 'phy'], on: 1 },
      { label: 'photographic', syl: ['pho', 'to', 'graph', 'ic'], on: 2 } ] } },
  { mood: 'think', cap: 'The consequence',
    say: 'Here is why that matters. In photograph, the second o is unstressed and mumbled. In photography, the same o carries the stress and rings out clearly. Same letter, same family, two different degrees of certainty. Borrow from the certain one.',
    show: { t: 'shift', rows: [
      { label: 'photograph', syl: ['pho', 'to', 'graph'], on: 0, dim: 1 },
      { label: 'photography', syl: ['pho', 'tog', 'ra', 'phy'], on: 1 } ] } },
  { mood: 'happy', cap: 'Which suffixes move stress',
    say: 'Ity, ic, ian, ify, ation and ial pull the stress toward themselves, usually onto the syllable right before them. Ness, less, ment, ful, ly and er leave the stress exactly where it was. The first group is the Latin layer of English. The second is the Germanic layer, and it behaves politely.',
    show: { t: 'list', items: [{ word: 'monarchic', hi: [3, 3] }, { word: 'patriarchal', hi: [6, 3] }, { word: 'lithography', hi: [4, 3] }] } },
  { mood: 'think', cap: 'Learn families, not words',
    say: 'Strong competitors do not memorise words. They memorise families, because one family shares one set of vowels across three or four stress patterns. Monarch, monarchy, monarchic. Lithograph, lithography, lithographic. Learn the family and every member becomes spellable.',
    show: { t: 'shift', rows: [
      { label: 'monarch', syl: ['mon', 'arch'], on: 0 },
      { label: 'monarchy', syl: ['mon', 'ar', 'chy'], on: 0 },
      { label: 'monarchic', syl: ['mo', 'nar', 'chic'], on: 1 } ] } },
  { mood: 'oops', cap: 'The base form is the hard one',
    say: 'One warning. The base form is usually the hardest member of a family to spell, because base forms carry the most unstressed syllables. Derived forms are easier. So when a base form is called, reach for the derivative in your head first, and work back from it.',
    show: { t: 'glyph', text: 'base → derived → back', sub: 'spell the easy one first' } },
] },

2: { label: 'the origin tree', scenes: [
  { mood: 'think', cap: 'Knowing origins is not using them',
    say: 'You can know that Greek uses p h for an eff sound and still freeze at the microphone. Knowing the origins is not the same as being able to use them. The usable form runs the other way: you hear a sound, and you need the candidate spellings, ranked.',
    show: { t: 'glyph', text: 'sound → spellings', sub: 'the inverse lookup' } },
  { mood: 'happy', cap: 'One sound, five spellings',
    say: 'Take the sh sound. In English it is s h, as in shell. In French it is c h, as in chef. In German it is s c h, as in schadenfreude. In Italian it is s c i, as in prosciutto. In Latin words it can be t i or c i, as in nation. Five branches from one sound.',
    show: { t: 'tree', sound: '/sh/', branches: [
      { sp: 'sh', org: 'English', ex: 'shell' },
      { sp: 'ch', org: 'French', ex: 'chef' },
      { sp: 'sch', org: 'German', ex: 'schnitzel' },
      { sp: 'sci', org: 'Italian', ex: 'prosciutto' },
      { sp: 'ti', org: 'Latin', ex: 'nation' } ] } },
  { mood: 'think', cap: 'Ask, and the tree collapses',
    say: 'Now ask one question. What is the language of origin? The answer does not give you a letter. It gives you an entire orthography, and the five branches collapse to one. That is why origin is the highest value question you are allowed to ask.',
    show: { t: 'ask', q: 'Language of origin?', rules: ['Greek → ph, y, ch, rh', 'French → silent finals, ou, eau', 'Italian → every vowel sounded', 'German → sch, compounds'] } },
  { mood: 'happy', cap: 'Five fans carry most of the risk',
    say: 'A handful of sounds carry nearly all the danger. The eff sound splits into f, p h and g h. A hard k before a front vowel splits into k, c, c h and q u. The sh sound splits five ways. A long ee at the end of a word splits into i, y, i e, i s and e e. Learn those fans cold.',
    show: { t: 'tree', sound: '/f/', branches: [
      { sp: 'f', org: 'English / Latin', ex: 'fable' },
      { sp: 'ph', org: 'Greek', ex: 'phoneme' },
      { sp: 'gh', org: 'Old English', ex: 'laugh' } ] } },
  { mood: 'think', cap: 'Origin defaults',
    say: 'Each origin has a default that is right far more often than not. Greek: p h for eff, y for a short i, c h for a hard k, r h at the start. French: a silent final consonant, o u for oo, e a u for oh. Italian: every vowel sounded, doubled consonants, a final vowel.',
    show: { t: 'list', items: [{ word: 'phoneme', hi: [0, 2] }, { word: 'rhetoric', hi: [0, 2] }, { word: 'tableau', hi: [5, 3] }] } },
  { mood: 'happy', cap: 'When two branches survive',
    say: 'Sometimes two branches survive the origin question. That is when alternate pronunciations earn their keep. A second pronunciation often stresses a different syllable and exposes a vowel the first one hid. Ask for it. It is the least used of the permitted questions, and one of the most informative.',
    show: { t: 'ask', q: 'Are there alternate pronunciations?', rules: ['a second stress pattern', 'exposes a hidden vowel'] } },
] },

3: { label: 'at the microphone', scenes: [
  { mood: 'think', cap: 'Five questions, five different jobs',
    say: 'You are allowed five questions. Language of origin. Definition. Part of speech. Alternate pronunciations. Use in a sentence. Each one eliminates a different class of spelling, so the order you ask in should depend on the ambiguity in front of you, not on habit.',
    show: { t: 'ask', q: 'The five permitted questions', rules: ['origin — picks the orthography', 'definition — separates homophones', 'part of speech — settles the ending', 'alternate pronunciation — moves the stress', 'sentence — confirms the sense'] } },
  { mood: 'happy', cap: 'Origin first, almost always',
    say: 'Origin is usually first, because it is the only question that selects a whole spelling system rather than a single letter. Every other question then operates inside the system that origin picked. There is one exception, and it matters.',
    show: { t: 'glyph', text: 'origin', sub: 'picks the whole system' } },
  { mood: 'oops', cap: 'Unless it might be a homophone',
    say: 'If the word could be a homophone, the definition has to come first. Otherwise you will spell the wrong word perfectly, and a perfect spelling of the wrong word is still an elimination. Hear anything that could be two words, and ask what it means before you ask anything else.',
    show: { t: 'pair', left: 'principal', right: 'principle', root: 'both from Latin princeps', note: 'the definition is the only thing that separates them' } },
  { mood: 'think', cap: 'Part of speech is underrated',
    say: 'English distinguishes noun and adjective endings that sound identical. Ance against ence. Ant against ent. Ise against ice. Knowing whether you are spelling a thing or a description of a thing often settles the final letters, and it is a question almost nobody asks.',
    show: { t: 'pair', left: 'dependant', right: 'dependent', root: 'noun / adjective', note: 'part of speech decides the ending' } },
  { mood: 'happy', cap: 'Ask with a purpose',
    say: 'Asking questions is not stalling. It is the mechanism the rules give you for gathering evidence. But ask with a purpose. Decide what you do not know, ask the question that resolves it, then spell. Asking all five in order signals that you have no hypothesis, and it burns the clock you may need later.',
    show: { t: 'glyph', text: 'hypothesis first', sub: 'then the question that tests it' } },
  { mood: 'think', cap: 'Say it, spell it, say it',
    say: 'Then spell. Say the word, spell at a steady rhythm, say it again. The rhythm matters more at this level than at a school bee, because it stops you compressing a doubled letter, and it gives you a beat in which to catch an error while a correction is still allowed. A rushed string of letters cannot be audited.',
    show: { t: 'glyph', text: 'say · spell · say', sub: 'the rhythm is the audit' } },
] },

4: { label: 'Greek openings', scenes: [
  { mood: 'think', cap: 'Greek allowed clusters English does not say',
    say: 'Ancient Greek let words begin with consonant clusters that English cannot pronounce. When English borrowed those words it kept the spelling and quietly dropped the first sound. So an unexplained silent consonant at the start of a word is almost always a Greek fingerprint.',
    show: { t: 'glyph', text: 'ps pn mn rh', sub: 'written, not spoken' } },
  { mood: 'happy', cap: 'The set is closed — memorise it',
    say: 'The good news is that the set is closed. P s, as in psalm. P n, as in pneumonia. M n, as in mnemonic. C h t h, as in chthonic. P h t h, as in phthisis. R h, as in rhetoric. B d, as in bdelloid. Add g n and p t and you have almost the whole inventory.',
    show: { t: 'list', items: [{ word: 'pseudonym', hi: [0, 2] }, { word: 'mnemonic', hi: [0, 2] }, { word: 'phthisis', hi: [0, 3] }] } },
  { mood: 'think', cap: 'Which silent letter, though?',
    say: 'Hearing an n at the start leaves you choosing between k n, g n, p n and a plain n. Origin decides it. K n and g n are Old English, as in knife and gnaw. P n is Greek, as in pneumonia. The silent letter is a label telling you which language you are standing in.',
    show: { t: 'tree', sound: '/n/ at the start', branches: [
      { sp: 'n', org: 'most words', ex: 'nature' },
      { sp: 'kn', org: 'Old English', ex: 'knife' },
      { sp: 'gn', org: 'Old English', ex: 'gnaw' },
      { sp: 'pn', org: 'Greek', ex: 'pneumatic' } ] } },
  { mood: 'happy', cap: 'Worked: pneumonia',
    say: 'So, worked through. You hear noo moh nyuh. It starts with an n sound. You ask the origin and you are told Greek. Greek default for an unexplained initial n is p n, from pneuma, meaning breath. P, n, e, u, m, o, n, i, a.',
    show: { t: 'breakdown', word: 'pneumonia', hi: [0, 2], parts: [{ txt: 'pneum-', gloss: 'breath, lung' }, { txt: '-ia', gloss: 'condition' }] } },
  { mood: 'think', cap: 'rh, and the doubled rrh',
    say: 'One more. Greek rho takes an h after it at the start of a word. And when a prefix pushes that rho inside a compound, it doubles. Rhythm, but arrhythmia. Rhoea, but diarrhoea. Rhage, but haemorrhage. If you hear a Greek word with an r after a prefix, suspect r r h.',
    show: { t: 'list', items: [{ word: 'arrhythmia', hi: [1, 3] }, { word: 'haemorrhage', hi: [5, 3] }] } },
  { mood: 'happy', cap: 'This is worth an hour of drill',
    say: 'This is not a curiosity. The core competition library carries a hundred and seventy words with one of these openings, and the full library carries four hundred and twenty seven. Rhinorrhagia, pneumatocyst, bdelloid and phthisis are already in the pool you are studying.',
    show: { t: 'glyph', text: '170 / 427', sub: 'words in your own library' } },
] },

5: { label: 'classical plurals', scenes: [
  { mood: 'think', cap: 'Borrowed whole, plural and all',
    say: 'Some words came into English whole, and brought their original plural with them. That plural is not decoration. The ending tells you which Latin or Greek declension the singular belonged to, and that tells you how the singular is spelled.',
    show: { t: 'glyph', text: '-ae  -i  -a  -ices', sub: 'the plural is evidence' } },
  { mood: 'happy', cap: 'The five main pairs',
    say: 'Latin a becomes a e. Vertebra, vertebrae. Latin us becomes i. Fungus, fungi. Latin um becomes a. Datum, data. Latin ex or ix becomes i c e s. Vortex, vortices. Greek ma becomes m a t a. Stigma, stigmata. Learn the pair, never the single form.',
    show: { t: 'list', items: [{ word: 'vertebrae', hi: [7, 2] }, { word: 'vortices', hi: [4, 4] }, { word: 'stigmata', hi: [5, 3] }] } },
  { mood: 'think', cap: 'The plural is the informative form',
    say: 'At the microphone you are often given the plural, and that is the more useful form. A e tells you the singular ended in a. I c e s tells you it ended in e x or i x, and warns you that a c appears where you might have written an x. M a t a tells you Greek.',
    show: { t: 'breakdown', word: 'vortices', hi: [4, 4], parts: [{ txt: 'vortex', gloss: 'the singular' }, { txt: '-ices', gloss: 'Latin -ex / -ix plural' }] } },
  { mood: 'oops', cap: 'English did not always agree',
    say: 'Be careful, because English overrode some of these. A few words now take both plurals, and a few classical plurals became English singulars in the move. Agenda and data both began life as Latin plurals. When both forms are valid, the bee accepts the one it asked you for, so listen to the ending you were given.',
    show: { t: 'pair', left: 'datum', right: 'data', root: 'Latin singular / plural', note: 'data is now often treated as singular' } },
  { mood: 'happy', cap: 'Beyond Latin and Greek',
    say: 'Other languages contribute their own. French gives e a u x for singulars in e a u. Bureau, bureaux. Italian gives i for o. Virtuoso, virtuosi. Hebrew gives i m. Cherub, cherubim. Seraph, seraphim. Each is a small closed set, and each is worth learning as a set.',
    show: { t: 'list', items: [{ word: 'bureaux', hi: [4, 3] }, { word: 'virtuosi', hi: [7, 1] }, { word: 'cherubim', hi: [6, 2] }] } },
  { mood: 'think', cap: 'Two hundred and fifty four in your pool',
    say: 'The core library carries two hundred and fifty four words with a classical plural ending, and the full library carries four hundred and sixty eight. Maxillae, auspices, glossopetrae and abietineae are all sitting in the pool already. Drill them as pairs.',
    show: { t: 'glyph', text: '254 / 468', sub: 'words in your own library' } },
] },

};
