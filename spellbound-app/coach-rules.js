/* Bizzing Bee — the Coach's rulebook. Hardcoded, offline, no model anywhere.

   The app already knows WHERE a speller goes wrong: TRAP_DEFS clusters their misses into
   eight named patterns (app3.js, missTraps), and trickAnal names the concept family of any
   single word. What it never had was anything to SAY about it — the trap page could tell a
   child "Silent letters · 6 misses" and then offer nothing but more of the same words.

   This is the missing half: for every trap, the mistake in the child's own terms, the rule
   that fixes it, a check they can run in their head at the microphone, and worked examples.
   Written once, by hand. The same discipline as SB_TIPS, which is parent-facing and picked
   "by analytics rules, never AI" — this is the child-facing twin.

   Keys MUST match TRAP_DEFS + the origin keys missTraps adds (french/greek/latin), and
   `cls` maps the trickAnal families onto the same rows. There is a headless check for that
   in tests/coach-rules.js: a trap with no rule is a silent hole in the page.  */
window.SB_COACH_RULES = {

  double: {
    label: 'Double letters',
    cls: ['dbl'],
    mistake: 'You write one letter where the word wants two — or two where it only wants one.',
    rule: 'A short, sharp vowel before the ending is usually holding a double letter up. Say the word slowly: if the vowel is clipped (căt, nŏt, rŭn) the consonant after it doubles when an ending is added.',
    check: 'Ask: is the vowel short and stressed? Then double. Is it long, or unstressed? Then do not.',
    egs: [['running', 'short ŭ, so the n doubles'], ['writing', 'long ī, so it does not'],
          ['committee', 'two doubles in a row — mm and tt — and one e at the end'],
          ['necessary', 'one c, two s. "One collar, two sleeves" is the old way to remember it']],
  },

  silent: {
    label: 'Silent letters',
    cls: ['silent'],
    mistake: 'You spell what you hear, and a letter you cannot hear goes missing.',
    rule: 'English keeps letters that stopped being spoken centuries ago. They cluster at the front (kn-, wr-, gn-, ps-, pn-, mn-) and at the back (-mb, -gn, -stle). They are not random: they are fossils, and they run in families.',
    check: 'Before you spell, ask whether the word belongs to a silent family you already know. If it starts with an n-sound, kn- and gn- are both live options.',
    egs: [['knight', 'silent k — same family as knee, knot, know'], ['wrestle', 'silent w AND a silent t in -stle'],
          ['psalm', 'silent p, from Greek — same as psyche, pseudo'], ['plumber', 'silent b after m, like thumb and climb']],
  },

  ieei: {
    label: 'ie or ei',
    cls: ['vow'],
    mistake: 'You put the i first when the e goes first, or the other way round.',
    rule: '"i before e, except after c" is only safe when the pair says EE. That is the whole rule, and it is why so many people think the rule is broken — they are applying it to words where the pair does not say EE at all.',
    check: 'Does the pair say EE? If yes, use the rule. If it says AY (neighbour, weigh) or anything else, the rule does not apply and you have to know the word.',
    egs: [['believe', 'says EE, no c before it → ie'], ['receive', 'says EE, sits after c → ei'],
          ['neighbour', 'says AY, so the rule is silent here'], ['weird', 'a genuine exception — learn it as one']],
  },

  schwa: {
    label: 'The schwa',
    cls: [],
    mistake: 'An unstressed vowel turns into a lazy "uh" and you cannot tell which letter it is.',
    rule: 'This is the single biggest source of misspelling, and listening harder will never help — the schwa carries no information at all. Any vowel can reduce to it. The fix is to find a RELATIVE of the word where that syllable is stressed, because the vowel comes back.',
    check: 'Reach for the -ity, -ic, -ian, -ation or -ify form. Those endings pull the stress toward themselves, which is exactly what you need.',
    egs: [['definite', 'DEF-uh-nit → definition (def-i-NI-tion) → the vowel is i'],
          ['custody', 'CUS-tuh-dy → custodian (cus-TO-dian) → o'],
          ['local', 'LO-cuhl → locality (lo-CAL-ity) → a'],
          ['grammar', 'GRAM-muh → grammatical (gram-MAT-ical) → a']],
  },

  endings: {
    label: 'Suffix endings',
    cls: ['end'],
    mistake: 'You choose -able when the word wants -ible, or -ance when it wants -ence.',
    rule: 'The ending usually follows the ROOT. -able tends to sit on a complete English word; -ible tends to sit on a Latin stump that cannot stand alone.',
    check: 'Take the ending off. If what is left is a real English word, -able is the better bet. If it is a fragment, try -ible.',
    egs: [['comfortable', 'comfort is a word → -able'], ['visible', 'vis- is not a word → -ible'],
          ['dependable', 'depend is a word → -able'], ['audible', 'aud- is a Latin stump → -ible'],
          ['supersede', 'the only -sede word in English. There are two -ceed words beyond that: proceed, exceed, succeed — three, in fact, and everything else is -cede']],
  },

  french: {
    label: 'French origins',
    cls: ['fr'],
    mistake: 'A French word is spelled the English way, so the silent tail falls off.',
    rule: 'French loanwords keep their French endings even though English mouths do not pronounce them. -et sounds like AY, -eau sounds like OH, -ette and -esque and -oir all arrive whole.',
    check: 'If the word ends in an unexpected vowel sound and means something to do with food, fashion, ballet, the army or the law, ask for the language of origin. French is the likeliest answer in those fields.',
    egs: [['bouquet', 'boo-KAY — the -et is the giveaway'], ['plateau', '-eau says OH, like bureau and chateau'],
          ['silhouette', '-ette, and an h you cannot hear'], ['reservoir', '-oir, like repertoire and memoir']],
  },

  greek: {
    label: 'Greek origins',
    cls: ['gk'],
    mistake: 'You write f for the ph sound, or k for ch, or i for the Greek y.',
    rule: 'Greek came into English through Latin and brought a fixed set of swaps with it: F is spelled PH, K is often CH, short I in the middle of a word is often Y, and the RH- and -RRH- clusters are Greek on sight.',
    check: 'Ask for the origin. If the answer is Greek, run the swaps before you spell: f→ph, k→ch, i→y.',
    egs: [['pharmacy', 'ph for f, and a y for the i sound'], ['chorus', 'ch saying K — same as chemist, chaos'],
          ['rhythm', 'rh- and a y, and no vowel you can hear in the second half'],
          ['diarrhoea', '-rrh- is the Greek signature — and the oe is too']],
  },

  latin: {
    label: 'Latin origins',
    cls: [],
    mistake: 'You spell the sound instead of the root, so the prefix or the stem loses a letter.',
    rule: 'Latin words are built from parts that keep their spelling even when the sound changes at the join. Learn the prefix once and it is right in every word that carries it.',
    check: 'Split the word into prefix + root + ending, spell each piece you know, and only then worry about the joins.',
    egs: [['accommodate', 'ad- + commodus → the d assimilates to c, giving cc AND mm'],
          ['interrupt', 'inter- + rupt (break) → the double r is the join'],
          ['irresistible', 'in- + resist → the n becomes r, so rr'],
          ['collaborate', 'com- + labor → the m becomes l, so ll']],
  },

  epon: {
    label: 'Words from names',
    cls: ['epon'],
    mistake: 'You spell it phonetically and lose the person or place inside it.',
    rule: 'An eponym is spelled the way the NAME was spelled, not the way the word sounds. The name does not bend to English rules, so no rule you know will predict it — but the story will.',
    check: 'Ask for the origin and the language. If the answer names a person or a place, spell the name, then add the ending.',
    egs: [['boycott', 'Captain Charles Boycott — two t’s because his name had two'],
          ['sandwich', 'the Earl of Sandwich — a place in Kent'],
          ['silhouette', 'Étienne de Silhouette, a French finance minister'],
          ['gerrymander', 'Governor Elbridge Gerry + salamander']],
  },

  hom: {
    label: 'Sound-alikes',
    cls: ['hom'],
    mistake: 'You spell a real word — just not the one that was asked for.',
    rule: 'When two words sound identical, nothing in the sound can help you. Only the MEANING picks the spelling, which is why asking for the definition is not a delaying tactic — it is the whole answer.',
    check: 'Always ask for the definition and the sentence. Then say quietly which of the two you have been given.',
    egs: [['principal / principle', 'the head of a school is your pal; a principle is a rule'],
          ['stationary / stationery', 'stationery has an e, like envelope'],
          ['complement / compliment', 'a complement completes; a compliment is something I say'],
          ['discreet / discrete', 'discrete means separate — and its two e’s are separated by the t']],
  },
};

/* What changes at each Bee Band. Used for "what to expect next" — the child sees the step
   ahead of them, not the whole ladder, because the whole ladder is discouraging at band 2. */
window.SB_COACH_BANDS = [
  null,
  { name: 'Classroom Speller',  words: 'Everyday words, spelled the way they sound.',
    next: 'Words start keeping letters you cannot hear. Silent k, silent w, silent b.' },
  { name: 'Classroom Speller',  words: 'Common words, a few silent letters, first double letters.',
    next: 'Suffix endings arrive: -able against -ible, -ance against -ence.' },
  { name: 'School-Bee Ready',   words: 'Suffixes, doubles, and the first schwa traps.',
    next: 'Origins start to matter. You will be asked where a word comes from, and the answer will change how you spell it.' },
  { name: 'School-Bee Ready',   words: 'Language of origin becomes a real tool. French and Greek patterns appear.',
    next: 'Greek swaps in force — ph, ch, y, rh — and longer Latin builds.' },
  { name: 'Regional Ready',     words: 'Greek and Latin roots, prefixes that assimilate at the join.',
    next: 'Words nobody spells by ear. Roots and origin questions become the main route to an answer.' },
  { name: 'Regional Ready',     words: 'Root families, eponyms, and sound-alikes decided only by meaning.',
    next: 'Rarer loanwords — Italian, Spanish, German, Japanese — each with its own habits.' },
  { name: 'State & National',   words: 'Loanwords from many languages; the schwa is everywhere.',
    next: 'Championship-level rarity, where the routine matters as much as the knowledge.' },
  { name: 'State & National',   words: 'Rare words, long builds, and multi-part questions.',
    next: 'The last band: words chosen because they resist every rule.' },
  { name: 'Championship',       words: 'Words chosen to defeat pattern-matching. Origin, roots and routine are all you have.',
    next: 'You are at the top band. From here it is depth, calm and the routine — not new categories.' },
];

/* The routine and the habits. Deliberately short: a child reads five of these, not forty. */
window.SB_COACH_TIPS = [
  { t: 'Ask every question you are allowed', b: 'Definition, sentence, language of origin, part of speech, alternate pronunciations. Every one of them narrows the spelling, and none of them costs you anything. Champions ask all five even when they already know the word — it buys thinking time and it builds the habit for the word where they need it.' },
  { t: 'Say it, spell it, say it again', b: 'Say the word before you start and again after you finish. The second saying is the check: if what you spelled does not sound like what you were asked, you still have time.' },
  { t: 'Write it on your hand', b: 'Trace the word with a finger on your palm before you say a letter. It moves the word out of your ear and into your hand, and it slows you to the speed of your own thinking.' },
  { t: 'Break it at the joins', b: 'Long words are short words glued together. Find the prefix, the root and the ending, spell each piece, then say the whole thing. Nobody spells accommodate in one go.' },
  { t: 'When you are stuck, go to the origin', b: 'Not the sound — the origin. Greek, French and Latin each have habits, and knowing which family a word belongs to rules out more wrong answers than any amount of listening.' },
  { t: 'A miss is worth more than a hit', b: 'A word you got right teaches you nothing you did not already know. Every word on your revision pile is a word that will not catch you twice, which is why the pile is the most valuable list in the app.' },
  { t: 'Practise out loud, standing up', b: 'The bee is oral and you will be on your feet. Practising silently at a desk trains a different skill from the one you will be tested on.' },
  { t: 'Short and daily beats long and rare', b: 'Fifteen minutes a day will take you further than two hours on a Sunday. Memory is built by returning to a word, not by staring at it.' },
];
