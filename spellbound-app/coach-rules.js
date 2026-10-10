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
    face: 'echo', col: '#C4763C',
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
    face: 'ghost', col: '#6C4FE0',
    label: 'Silent letters',
    cls: ['silent'],
    mistake: 'You spell what you hear, and a letter you cannot hear goes missing.',
    rule: 'English keeps letters that stopped being spoken centuries ago. They cluster at the front (kn-, wr-, gn-, ps-, pn-, mn-) and at the back (-mb, -gn, -stle). They are not random: they are fossils, and they run in families.',
    check: 'Before you spell, ask whether the word belongs to a silent family you already know. If it starts with an n-sound, kn- and gn- are both live options.',
    egs: [['knight', 'silent k — same family as knee, knot, know'], ['wrestle', 'silent w AND a silent t in -stle'],
          ['psalm', 'silent p, from Greek — same as psyche, pseudo'], ['plumber', 'silent b after m, like thumb and climb']],
  },

  ieei: {
    face: 'glitch', col: '#2E8FB8',
    label: 'ie or ei',
    cls: ['vow'],
    mistake: 'You put the i first when the e goes first, or the other way round.',
    rule: '"i before e, except after c" is only safe when the pair says EE. That is the whole rule, and it is why so many people think the rule is broken — they are applying it to words where the pair does not say EE at all.',
    check: 'Does the pair say EE? If yes, use the rule. If it says AY (neighbour, weigh) or anything else, the rule does not apply and you have to know the word.',
    egs: [['believe', 'says EE, no c before it → ie'], ['receive', 'says EE, sits after c → ei'],
          ['neighbour', 'says AY, so the rule is silent here'], ['weird', 'a genuine exception — learn it as one']],
  },

  schwa: {
    face: 'wisp', col: '#7A7291',
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
    face: 'gatekeeper', col: '#178A4C',
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
    face: 'diva', col: '#C4453C',
    label: 'French origins',
    cls: ['fr'],
    mistake: 'A French word is spelled the English way, so the silent tail falls off.',
    rule: 'French loanwords keep their French endings even though English mouths do not pronounce them. -et sounds like AY, -eau sounds like OH, -ette and -esque and -oir all arrive whole.',
    check: 'If the word ends in an unexpected vowel sound and means something to do with food, fashion, ballet, the army or the law, ask for the language of origin. French is the likeliest answer in those fields.',
    egs: [['bouquet', 'boo-KAY — the -et is the giveaway'], ['plateau', '-eau says OH, like bureau and chateau'],
          ['silhouette', '-ette, and an h you cannot hear'], ['reservoir', '-oir, like repertoire and memoir']],
  },

  greek: {
    face: 'athena', col: '#3A7CA5',
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
    face: 'aurum', col: '#B8860B',
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
    face: 'gutenberg', col: '#8A5B00',
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
    face: 'kitsune', col: '#A0522D',
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

/* ===================== THE ERROR TYPE OF ONE MISS (road to 4.5, P1.19, 10 Oct 2026) =====================
   The audit typed "cyclx" for "cycle" and the miss panel said "Greek origins… f→ph": the tip came from the
   WORD's family (cycle is Greek), not from the MISTAKE. This reads the mistake itself — the typed letters
   against the word's, aligned by edit distance — and names its TYPE: a dropped final e, a missing or extra
   double, ie/ei, -able/-ible and the other look-alike endings, a silent letter left out, a vowel written for
   another, two letters swapped, one sound spelled another way… Each type carries a tip about THAT mistake,
   built from the child's own letters. Deterministic: the same pair always gets the same answer, nothing is
   drawn at random. When no rule matches it returns null, and app3's missWhy falls back to the concept family.
   SB_MISS_ERR(typed, word, {hom:[sound-alike words]}) → {t, fam, label, tip} | null.
   fam is the concept family the type belongs to (the miss panel's data-why), or null when it has none.
   It lives here, in the lazy rulebook, so it costs Home's first screen nothing; missWhy asks for the file.
   Guard: tests/miss-tips.cjs (a table of real typed/target pairs, and the 50,000 recorded misspellings). */
window.SB_MISS_ERR = (function () {
  'use strict';
  const VOW = /^[aeiou]$/, CONS = /^[b-df-hj-np-tv-z]$/;
  function align(typed, word) {
    const a = typed.slice(0, 60), b = word, m = a.length, n = b.length, D = [];
    for (let i = 0; i <= m; i++) { D.push(new Array(n + 1).fill(0)); D[i][0] = i; } for (let j = 0; j <= n; j++) D[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    const cols = []; let i = m, j = n;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && D[i][j] === D[i - 1][j - 1]) { cols.push({ t: a[i - 1], w: b[j - 1], op: 'ok' }); i--; j--; }
      else if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + 1) { cols.push({ t: a[i - 1], w: b[j - 1], op: 'sub' }); i--; j--; }
      else if (j > 0 && D[i][j] === D[i][j - 1] + 1) { cols.push({ t: '', w: b[j - 1], op: 'del' }); j--; }
      else { cols.push({ t: a[i - 1], w: '', op: 'ins' }); i--; } }
    return cols.reverse(); }
  const q = (s) => '“' + s + '”';
  const up = (w, i, n) => w.slice(0, i) + w.slice(i, i + (n || 1)).toUpperCase() + w.slice(i + (n || 1));   // the letters that matter, in capitals
  const and = (a) => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
  /* the silent letters of a word: [pattern, silent-letter offsets inside the match] */
  const SILENT = [[/^kn/, [0]], [/^gn/, [0]], [/^wr/, [0]], [/^p[sn]/, [0]], [/^mn/, [0]], [/^rh/, [1]], [/^gh/, [1]], [/^(?:hour|honest|honou?r|heir)/, [0]],
    [/mb(?=$|s$|ed$|er|ing)/, [1]], [/mn(?=$|s$)/, [1]], [/gn(?=$|s$|ed$|ing$|er)/, [0]], [/st(?=le$|len?$|en$|ening$)/, [1]], [/ft(?=en$)/, [1]],
    [/igh/, [1, 2]], [/[ao]ugh(?=t)/, [2, 3]], [/bt/, [0]], [/[ao]l(?=[km]|f$|ves?$)/, [1]], [/oul(?=d)/, [2]], [/sc(?=[eiy])/, [1]], [/scle$/, [1]],
    [/gu(?=[eiy])/, [1]], [/gue$/, [1, 2]], [/^sw(?=or)/, [1]], [/answ/, [3]], [/^two$/, [1]], [/is(?=l)/, [1]], [/cht/, [0, 1]], [/wed(?=nes)/, [2]],
    [/ndso/, [1]], [/eipt$/, [2]], [/xh/, [1]], [/^ghost|ghet|spagh/, [1]], [/bu(?=[iy])/, [1]]];
  function silentAt(w) { const at = new Map();
    SILENT.forEach(([re, offs]) => { const g = new RegExp(re.source, 'g'); let m; while ((m = g.exec(w))) { offs.forEach((o) => at.set(m.index + o, true)); if (g.lastIndex === m.index) g.lastIndex++; } });
    return at; }
  /* one sound, several spellings — both halves of a miss must sit in ONE row */
  const SOUNDS = [['f', ['f', 'ff', 'ph', 'gh']], ['k', ['c', 'k', 'ck', 'ch', 'cc', 'q', 'qu', 'que', 'kk']], ['s', ['s', 'ss', 'c', 'sc', 'ce', 'se']],
    ['j', ['j', 'g', 'dg', 'dge', 'ge', 'gi']], ['sh', ['sh', 'ti', 'ci', 'ch', 'ssi', 'si', 'sci']], ['z', ['z', 'zz', 's', 'se', 'x']],
    ['ch', ['ch', 'tch', 't']], ['w', ['w', 'wh']], ['n', ['n', 'kn', 'gn', 'pn', 'nn']], ['m', ['m', 'mb', 'mn', 'mm']], ['r', ['r', 'wr', 'rh', 'rr']], ['g', ['g', 'gh', 'gu', 'gg']],
    ['ks', ['x', 'ks', 'cks', 'cs']], ['kw', ['qu', 'kw', 'cw']],
    ['ow', ['ow', 'ou']], ['oy', ['oi', 'oy']], ['aw', ['aw', 'au', 'al']], ['ay', ['ai', 'ay', 'ey', 'ei', 'eigh', 'a']], ['ee', ['ee', 'ea', 'ie', 'ei', 'ey', 'e']],
    ['oh', ['oa', 'ow', 'oe', 'ough', 'o']], ['oo', ['oo', 'ew', 'ue', 'ou', 'ui', 'u']], ['eye', ['igh', 'ie', 'y', 'ye', 'i']], ['er', ['er', 'ir', 'ur', 'ear', 'or']], ['air', ['air', 'are', 'ear', 'ere']]];
  const sameSound = (a, b) => a !== b && SOUNDS.some(([, g]) => g.indexOf(a) >= 0 && g.indexOf(b) >= 0);
  /* endings that sound alike: [the word's ending, the other spellings of the same sound, label, tip(suffix)] */
  const ENDS = [
    [/(able|ably|ability|ible|ibly|ibility)$/, (s) => [(s[0] === 'a' ? 'i' : 'a') + s.slice(1)], '-able or -ible',
      (s) => s[0] === 'a' ? '-able usually goes on a whole word you can hear by itself (accept → acceptable, read → readable). This one is -' + s + '.'
        : '-ible usually goes on a part that is not a word by itself (vis → visible, poss → possible). This one is -' + s + '.'],
    [/(ance|ence|ancy|ency|ant|ent)$/, (s) => [(s[0] === 'a' ? 'e' : 'a') + s.slice(1)], '-ance or -ence',
      (s) => '-a' + s.slice(1) + ' and -e' + s.slice(1) + ' sound exactly the same, so the ear cannot choose. A word family keeps its letter (importance, important; confidence, confident) — this one is -' + s + '.'],
    [/(tion|sion|ssion|cian|tian)s?$/, () => ['tion', 'sion', 'ssion', 'cian', 'tian', 'shun', 'shion', 'cion', 'sian', 'tions', 'sions', 'cians'], '-tion, -sion or -cian',
      (s) => '“shun” has several spellings: -cian is for a person who does a job (musician), -sion often follows l, n, r or s (tension, version), and -tion is the most common. This one is -' + s + '.'],
    [/(er|or|ar)s?$/, (s) => ['er', 'or', 'ar', 'ers', 'ors', 'ars', 'our', 'ur'].filter((x) => x !== s), '-er, -or or -ar',
      (s) => '-er, -or and -ar all sound like “er” at the end. -or is common on Latin words (actor, editor) and -ar on a few (beggar, collar). This one is -' + s + '.'],
    [/(ary|ery|ory)$/, (s) => ['ary', 'ery', 'ory', 'ury'].filter((x) => x !== s), '-ary, -ery or -ory', (s) => '-ary, -ery and -ory are hard to hear apart. This one is -' + s + '.'],
    [/(eous|ious|uous|ous)$/, (s) => ['us', 'ous', 'eous', 'ious', 'uous', 'ouse', 'ose', 'uos'].filter((x) => x !== s), 'The -ous ending', (s) => 'It sounds like “us”, but a describing word spells it -' + s + '.'],
    [/(le|el|al|il|ol)$/, (s) => ['le', 'el', 'al', 'il', 'ol', 'ul', 'ell', 'all', 'ile'].filter((x) => x !== s), '-le, -el or -al', (s) => '-le, -el, -al and -il can all sound like “ul” at the end. This word ends -' + s + '.'],
    [/(cede|ceed|sede)s?$/, (s) => ['cede', 'ceed', 'sede', 'seed', 'cead', 'ceeds', 'cedes'].filter((x) => x !== s), '-cede, -ceed or -sede',
      () => 'Only three words end -ceed (exceed, proceed, succeed) and one ends -sede (supersede); the rest end -cede.'],
    [/(ise|ize|yse|yze)$/, (s) => ['ise', 'ize', 'yse', 'yze'].filter((x) => x !== s), '-ise or -ize', (s) => 'This word is spelled -' + s + ' here.']];
  const SUF_V = /^(ing|ed|er|est|able|ible|ous|ive|ion|ity|ance|ence|al|ure|ish|ist|ism|ary|ery|or)$/;
  const SUF_C = /^(ly|ment|ful|ness|less|some)$/;
  const SUF_I = /^(es|ed|er|est|ness|ly|ful|ment|ance|ant|able|ous|al|ty)$/;
  const PREF = /^(mis|dis|un|im|il|ir|in|over|inter|sub|counter|with)/;
  const R = (t, fam, label, tip) => ({ t, fam, label, tip });
  /* a word with every doubled consonant written once, and which consonants were doubled (by position) */
  function runs(s) { const out = []; for (let i = 0; i < s.length; i++) { const c = s[i];
      if (CONS.test(c) && s[i + 1] === c) { out.push({ c, d: true, i }); while (s[i + 1] === c) i++; } else out.push({ c, d: false, i }); }
    return out; }

  return function missErr(typed, word, o) {
    o = o || {};
    const t = String(typed || '').toLowerCase().trim().replace(/\s+/g, ' '), w = String(word || '').toLowerCase().trim();
    if (!t || !w || t === w) return null;
    /* a real word that sounds the same */
    if ((o.hom || []).map((x) => String(x).toLowerCase()).indexOf(t) >= 0) return R('hom', 'hom', 'A sound-alike word', q(t) + ' is a real word that sounds the same, but it means something else. Listen for the meaning first, then pick the spelling that goes with it.');
    /* two neighbours swapped */
    for (let i = 0; i + 1 < w.length; i++) {
      if (w[i] === w[i + 1] || t !== w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)) continue;
      const pr = w.slice(i, i + 2);
      if (pr === 'ie') return R('ieei', 'ieei', 'ie or ei', 'i before e here: the word has ' + q('ie') + ' — ' + up(w, i, 2) + '.');
      if (pr === 'ei') return w[i - 1] === 'c' ? R('ieei', 'ieei', 'ie or ei', 'Right after c it flips to e then i: ' + up(w, i - 1, 3) + ' (like receive and ceiling).')
        : R('ieei', 'ieei', 'ie or ei', 'This is one of the ' + q('ei') + ' words (like their, weird, beige): e first, then i — ' + up(w, i, 2) + '.');
      if (i === w.length - 2 && (pr === 'le' || pr === 'el')) return R('le-el', 'endings', 'The -' + pr + ' ending', 'This word ends -' + pr + ', not -' + pr[1] + pr[0] + '.');
      return R('swap', null, 'Two letters swapped', 'Every letter is there, but ' + q(pr) + ' came out as ' + q(pr[1] + pr[0]) + '. Say it slowly and write the sounds in the order you hear them.');
    }
    /* the final e */
    if (w.length > 2 && /[^aeiouy]e$/.test(w) && (t === w.slice(0, -1) || (t.length === w.length && t.slice(0, -1) === w.slice(0, -1) && t.slice(-1) !== 'e'))) {
      const tip = /[^aeiou]le$/.test(w) ? 'It ends -le: the e at the end is silent, but it is written — ' + up(w, w.length - 2, 2) + '.'
        : /[aeiou][^aeiou]e$/.test(w) ? 'The e at the end is silent, but it is written — and it makes the vowel before it say its name (hop → hope).'
          : 'There is a silent e at the end: you do not hear it, but it is written.';
      return R('final-e', 'silent', 'The silent e at the end', tip); }
    if (t === w + 'e' && /[^aeiou]$/.test(w)) return R('no-final-e', null, 'No e at the end', 'This word stops at the ' + w.slice(-1) + ': no silent e on the end.');

    const cols = align(t, w); const ed = []; let wi = 0, ti = 0;
    cols.forEach((c) => { if (c.op !== 'ok') ed.push({ op: c.op, t: c.t, w: c.w, wi, ti }); if (c.op !== 'ins') wi++; if (c.op !== 'del') ti++; });
    if (!ed.length) return null;
    const one = ed.length === 1 ? ed[0] : null;
    /* a rule that names a stem ("hope + ing") only does so when the stem is a real word: given o.isWord, it is asked */
    const isW = (k) => !o.isWord || !!o.isWord(k);
    /* e before a suffix: dropped before a vowel ending, kept before a consonant one */
    if (one && one.op === 'ins' && one.t === 'e' && one.wi >= 2 && CONS.test(w[one.wi - 1]) && SUF_V.test(w.slice(one.wi)) && isW(w.slice(0, one.wi) + 'e'))
      return R('drop-e', 'endings', 'Drop the e', 'Drop the e before an ending that starts with a vowel: ' + w.slice(0, one.wi) + 'e + ' + w.slice(one.wi) + ' → ' + w + '.');
    if (one && one.op === 'del' && one.w === 'e' && one.wi >= 2 && CONS.test(w[one.wi - 1]) && SUF_C.test(w.slice(one.wi + 1)) && isW(w.slice(0, one.wi + 1)))
      return R('keep-e', 'endings', 'Keep the e', 'Keep the e before an ending that starts with a consonant: ' + w.slice(0, one.wi + 1) + ' + ' + w.slice(one.wi + 1) + ' → ' + w + '.');
    /* y and i */
    if (/[^aeiou]ies$/.test(w) && t === w.slice(0, -3) + 'ys') return R('y-i', 'endings', 'Change y to i', 'A consonant and then y: change the y to i and add -es (' + w.slice(0, -3) + 'y → ' + w + ').');
    if (one && one.op === 'sub' && one.t === 'y' && one.w === 'i' && one.wi >= 2 && CONS.test(w[one.wi - 1]) && SUF_I.test(w.slice(one.wi + 1)) && isW(w.slice(0, one.wi) + 'y'))
      return R('y-i', 'endings', 'Change y to i', 'Change the y to i before this ending: ' + w.slice(0, one.wi) + 'y + ' + w.slice(one.wi + 1) + ' → ' + w + '.');
    if (/[^aeiou]ying$/.test(w) && (t === w.slice(0, -4) + 'ing' || t === w.slice(0, -4) + 'iing')) return R('keep-y', 'endings', 'Keep the y', 'Keep the y before -ing: ' + w.slice(0, -3) + ' + ing → ' + w + '.');
    /* -ly on a word that ends in l keeps both; -ful has one */
    if (/[^l]lly$/.test(w) && t === w.slice(0, -3) + 'ly' && isW(w.slice(0, -2))) return R('whole-ly', 'endings', 'Add -ly to the whole word', 'Keep the whole word and add -ly: ' + w.slice(0, -2) + ' + ly → ' + w + ' (two l’s).');
    if (/ful$/.test(w) && t === w + 'l') return R('ful', 'double', '-ful has one l', 'As an ending, full drops an l: -ful (hope + full → hopeful).');
    /* silent letters left out */
    const sil = silentAt(w); const silHit = ed.filter((e) => (e.op === 'del' || e.op === 'sub') && sil.has(e.wi));
    if (silHit.length && silHit.length >= ed.filter((e) => e.op === 'del').length - 1) {
      const L = []; silHit.forEach((e) => { const prev = L[L.length - 1]; if (prev && prev.end === e.wi) { prev.s += e.w; prev.end++; } else L.push({ s: e.w, end: e.wi + 1 }); });
      const ls = L.map((x) => x.s), many = ls.length > 1 || ls[0].length > 1;
      return R('silent', 'silent', 'A silent letter', (many ? w + ' has silent ' + and(ls) : 'The ' + ls[0] + ' in ' + w + ' is silent') + ': you do not hear ' + (many ? 'them' : 'it') + ', but ' + (many ? 'they are' : 'it is') + ' written.'); }
    /* double letters: the two spellings are the same once every doubled consonant is written once */
    const rw = runs(w), rt = runs(t);
    if (rw.length === rt.length && rw.every((x, i) => x.c === rt[i].c) && rw.some((x, i) => x.d !== rt[i].d)) {
      const miss = rw.filter((x, i) => x.d && !rt[i].d), ext = rw.filter((x, i) => !x.d && rt[i].d);
      const pairs = [...new Set(miss.map((x) => x.c + x.c))], singles = [...new Set(ext.map((x) => x.c))];
      if (miss.length && !ext.length) {
        const c = miss[0].c, s0 = miss[0].i;   // where the pair starts in the word
        const pm = w.match(PREF);
        if (miss.length === 1 && pm && o.isWord && s0 === pm[0].length - 1 && w.length - pm[0].length >= 5 && o.isWord(w.slice(pm[0].length)))
          return R('dbl-prefix', 'double', 'Prefix + word', pm[0] + ' + ' + w.slice(pm[0].length) + ' → ' + w + ': the prefix ends with ' + c + ' and the word starts with one, so both stay.');
        if (miss.length === 1 && /^(ing|ed|est)$/.test(w.slice(s0 + 2)) && VOW.test(w[s0 - 1] || '') && !VOW.test(w[s0 - 2] || 'a') && isW(w.slice(0, s0 + 1)))
          return R('dbl-suffix', 'double', 'Double before the ending', 'A short vowel and one consonant, then an ending: double the last letter (' + w.slice(0, s0 + 1) + ' → ' + w + ').');
        return R('dbl-miss', 'double', 'Double letters', w + ' has ' + and(pairs) + '. Say it in beats and keep both letters of ' + (pairs.length > 1 ? 'each pair.' : 'the pair.')); }
      if (ext.length && !miss.length) return R('dbl-extra', 'double', 'One letter, not two', 'Only one ' + and(singles) + ' in ' + w + ' — not ' + and(singles.map((x) => x + x)) + '.');
      return R('dbl-shift', 'double', 'Which letter doubles', w + ' has ' + and(pairs) + ' and one ' + and(singles) + ' — the double is on the other letter.'); }
    /* the zone where the two spellings part: the longest shared start and end */
    let p = 0; while (p < t.length && p < w.length && t[p] === w[p]) p++;
    let s = 0; while (s < t.length - p && s < w.length - p && t[t.length - 1 - s] === w[w.length - 1 - s]) s++;
    const wz = w.slice(p, w.length - s), tz = t.slice(p, t.length - s);
    /* an ending that sounds like another — on a real stem (giant is not gi + ant) */
    for (const [re, alts, label, tip] of ENDS) {
      const m = w.match(re); if (!m || w.length - m[0].length < 3) continue;
      const suf = m[0], base = w.slice(0, w.length - suf.length);
      if (p < base.length - 1) continue;   // the miss must be in the ending (one letter of slack before it)
      if (t.slice(0, base.length) === base && alts(suf).indexOf(t.slice(base.length)) >= 0) return R('end', 'endings', label, tip(suf)); }
    /* one sound, spelled another way — read over the zone, and over it widened a letter either side */
    const wins = [[wz, tz, p]]; if (p > 0) wins.push([w.slice(p - 1, w.length - s), t.slice(p - 1, t.length - s), p - 1]);
    if (s > 0) wins.push([w.slice(p, w.length - s + 1), t.slice(p, t.length - s + 1), p]);
    for (const [a, b, at] of wins) {
      if (!a) continue;
      if (a === 'ph' && /^ff?$/.test(b)) return R('ph', 'greek', 'ph says f', 'In ' + w + ', ph says f — a Greek habit (phone, graph, photo).');
      if (a === 'ch' && /^(k|ck)$/.test(b)) return R('ch-k', 'greek', 'ch says k', 'Here ch says k — a Greek habit (school, chorus, character).');
      if (a === 'y' && b === 'i' && at > 0 && at < w.length - 1) {
        if (CONS.test(w[at - 1]) && CONS.test(w[at + 1])) return R('y-i-sound', 'greek', 'y says i', 'In ' + w + ', y stands for the i sound — a Greek habit (gym, myth, syllable).');
        if (VOW.test(w[at - 1]) && /^(ed|er|ing|s|ment|al|able|ance|ers|ments)$/.test(w.slice(at + 1)) && isW(w.slice(0, at + 1)))
          return R('keep-y', 'endings', 'Keep the y', 'A vowel and then y: keep the y and add the ending (' + w.slice(0, at + 1) + ' + ' + w.slice(at + 1) + ' → ' + w + ').');
        if (VOW.test(w[at - 1])) return R('vowel-team', 'schwa', 'The vowel team', 'The sound is spelled ' + q(w[at - 1] + 'y') + ' here, not ' + q(w[at - 1] + 'i') + '.'); }
      if (a === 'c' && /^ss?$/.test(b) && /[eiy]/.test(w[at + 1] || '')) return R('soft-c', null, 'Soft c', 'c says s before e, i or y — ' + up(w, at) + ' uses a c.');
      if (a === 'g' && b === 'j' && /[eiy]/.test(w[at + 1] || '')) return R('soft-g', null, 'Soft g', 'g says j before e, i or y — ' + up(w, at) + ' uses a g.');
      if (a === 'ck' && /^(k|c)$/.test(b)) return R('ck', null, 'ck after a short vowel', 'After a short vowel the k sound is usually ck (back, pocket) — ' + up(w, at, 2) + '.');
      if (a === 'tch' && b === 'ch') return R('tch', null, 'tch after a short vowel', 'After a short vowel the ch sound is usually tch (catch, kitchen) — ' + up(w, at, 3) + '.');
      if (a === 'dge' && /^(ge|j)$/.test(b)) return R('dge', null, 'dge after a short vowel', 'After a short vowel the j sound at the end is dge (badge, bridge).');
      if (a === 'wh' && b === 'w') return R('wh', 'silent', 'The wh', 'This one is spelled wh — the h is quiet, but it is written (' + up(w, at, 2) + ').');
      if (a === 'ture' && /^(cher|chur|chure)$/.test(b)) return R('ture', 'endings', 'The -ture ending', '-ture sounds like “cher” at the end of a word (picture, adventure, nature).'); }
    /* a miss made only of vowels is a vowel miss, unless a vowel TEAM was spelled another way (speech, taboos) */
    const vOnly = ed.every((e) => VOW.test(e.t || 'a') && VOW.test(e.w || 'a'));
    for (const [a, b] of wins) if (sameSound(a, b) && (!vOnly || (/^[aeiou]+$/.test(a) && /^[aeiou]+$/.test(b) && Math.max(a.length, b.length) >= 2))) return R('sound', null, 'One sound, two spellings', 'The sound is right, but here it is spelled ' + q(a) + ', not ' + q(b) + '.');
    /* vowels: written for another, left out, or one too many */
    if (ed.every((e) => e.op === 'sub' && VOW.test(e.t) && VOW.test(e.w))) {
      const team = (x) => { let a = p, b = x.length - s; while (a > 0 && VOW.test(x[a - 1])) a--; while (b < x.length && VOW.test(x[b])) b++; return x.slice(a, b); };
      const vw = team(w), vt = team(t);
      if (ed.length === 1 && (vw.length >= 2 || vt.length >= 2)) return R('vowel-team', 'schwa', 'The vowel team', 'The vowel sound here is spelled ' + q(vw) + ', not ' + q(vt) + '.');
      return R('vowel', 'schwa', 'The hidden vowel', 'In a quiet beat every vowel sounds like “uh”, so the ear cannot tell you which one. Say it the spelling way, every vowel clear: ' + ed.reduce((x, e) => up(x, e.wi), w) + '.'); }
    if (ed.every((e) => e.op === 'del' && VOW.test(e.w))) return R('vowel-miss', 'schwa', 'A quiet vowel', 'A vowel you barely hear is missing: ' + ed.reduce((x, e) => up(x, e.wi), w) + '. Say every beat of the word.');
    if (ed.every((e) => e.op === 'ins' && VOW.test(e.t))) return R('vowel-extra', 'schwa', 'One vowel too many', 'There is no ' + and([...new Set(ed.map((e) => e.t))]) + ' there — ' + w + '. People often add one when they say it.');
    /* a single letter left out, added or changed */
    if (one && one.op === 'del') return R('missing', null, 'One letter missing', 'The ' + one.w + ' is missing: ' + up(w, one.wi) + '. Say each beat and check every sound has its letter.');
    if (one && one.op === 'ins') return R('extra', null, 'One letter too many', 'There is no ' + one.t + ' after ' + q(w.slice(0, one.wi)) + ' — the word is ' + w + '.');
    if (one && one.op === 'sub') return R('letter', null, 'One letter changed', 'It is ' + q(one.w) + ', not ' + q(one.t) + ': ' + up(w, one.wi) + '. Say it slowly and listen for that sound.');
    return null;   // a mix of mistakes: the concept family speaks instead
  };
})();
