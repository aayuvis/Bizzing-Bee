/* The Honey Trail & The Queen's Expedition — full curriculum generation (no engine).
   Outputs:
   - spellbound-app/trail-data.js   window.SB_TRAIL: acts → units (chapter refs, new
     trickster chapters inline, 4 concept-quiz questions per unit, band counts)
   - spellbound-app/trail-map-data.js  compact word→(unit,band) map for the 40,944-word
     Honey Trail pool (Expedition's 128k map is built at engine time; counts computed now)
   - TRAIL-CURRICULUM.md  human-readable review doc
   Bands are global spellDiff terciles, so B1 is genuinely easy in absolute terms. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('words-data.js', 'utf8'));
eval(fs.readFileSync('concepts-data.js', 'utf8'));
eval(fs.readFileSync('adv-concepts-data.js', 'utf8'));
eval(fs.readFileSync('sounds-data.js', 'utf8'));
const W = SB_DATA.nsf, GEN = SB_CONCEPTS.chapters, ADV = SB_ADV_CONCEPTS.chapters;
const HOMSET = new Set((window.SB_HOM || []).flat());
const AP = window.SB_ALT_PRON || {}, DI = window.SB_DIACRITICS || {};
const hasOwn = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const nk = w => String(w || '').toLowerCase();

/* ---- spellDiff (mirrors app3) ---- */
function trickScore(w) { const s = nk(w.w), p = String(w.p || '');
  const f = { epon: 0, silent: 0, fr: 0, gk: 0, end: 0, dbl: 0, vow: 0, hom: 0 };
  if ((w.t || []).indexOf('eponyms') >= 0) f.epon = 12;
  if (HOMSET.has(s)) f.hom = 8;
  if (/^(pn|ps|pt|mn|gn|kn|wr|rh|x)/.test(s)) f.silent += 10;
  if (/(mb|mn|gn)$/.test(s)) f.silent += 8;
  if (/gh/.test(s) && !/ough|augh/.test(s)) f.silent += 6;
  if (/(stle|sten|ften)$/.test(s)) f.silent += 8;
  if (/eau|oux|oir|ille|esque$|que$|gue$|ette$/.test(s)) f.fr += 9;
  if (/et$/.test(s) && /ay$/i.test(p)) f.fr += 9;
  if (/ph|rrh|chn|(?:^|[bcdfgklmnprstz])y[bcdfgklmnprstz]/.test(s)) f.gk += 8;
  if (/ch/.test(s) && /k/i.test(p) && !/ch/i.test(p)) f.gk += 8;
  if (/ae|oe(?!ver)/.test(s)) f.gk += 6;
  if (/(able|ible)$/.test(s)) f.end += 8;
  if (/(ance|ence|ancy|ency|ant|ent)$/.test(s)) f.end += 7;
  if (/(ary|ery|ory|ury)$/.test(s)) f.end += 6;
  if (/(cede|ceed|sede)$/.test(s)) f.end += 10;
  if (/(eous|ious|uous)$/.test(s)) f.end += 6;
  const dbl = s.match(/([bcdfghjklmnpqrstvz])\1/g); if (dbl) f.dbl += Math.min(10, 5 * new Set(dbl).size);
  if (/ei|ie/.test(s)) f.vow += 4;
  if (/ough|augh/.test(s)) f.vow += 9;
  if (/[aeiou]{3}/.test(s)) f.vow += 5;
  let sc = 0; for (const k in f) sc += f[k];
  if (w.m && nk(w.m) !== s) sc += 7;
  return Math.min(60, sc);
}
const spellDiff = w => trickScore(w) * 2 + (w.y || 3) * 5 + Math.min(14, String(w.w || '').length) * .5;

/* ================= ACT & UNIT PLAN — The Honey Trail ================= */
/* one chapter = one unit; tiny sibling categories merge into the act; new trickster
   chapters are authored inline below. */
const NEWCH = [
  { title: 'Sound Twins — homonyms 101', category: 'Trickster Concepts', difficulty: 'medium',
    concept: 'Some words are twins: they sound exactly alike but wear different spellings — and different meanings. Maize and maze. Son and sun. At a bee, the sound alone cannot save you: the MEANING tells you which twin you have. That is why champions always ask for the definition.',
    method: '<div class="trick"><b>MAZE or MAIZE?</b></div><b>Hear it.</b> MAYZ <b>Stop.</b> Two spellings share this sound. <b>Ask.</b> May I have the definition? <b>Match.</b> A puzzle of paths = maze. The corn plant = maize. <b>Spell the meaning,</b> not the sound.',
    cards: [
      { title: 'Twins are everywhere', body: 'English is full of sound twins: cite/site/sight, pair/pare/pear, road/rode/rowed. The sound is one; the spellings are many.' },
      { title: 'The definition is your map', body: 'When a word COULD be a twin, the definition is not a hint — it is the answer. Champions ask for it every time.' },
      { title: 'Sentence beats sound', body: 'Ask for the word in a sentence too. "The knight rode down the road" settles it instantly.' },
      { title: 'Collect your twins', body: 'Every twin pair you know is a trap that cannot catch you. Keep a twin list. It grows fast.' } ],
    rule: 'homonym-b1' },
  { title: 'Treacherous Twins — homonyms that fool champions', category: 'Trickster Concepts', difficulty: 'hard',
    concept: 'Easy twins sound like childhood words. Treacherous twins sound like vocabulary: populous and populace, immanent and imminent, complacent and complaisant. These pairs have ended national runs — because the speller KNEW both words and still had to pick. Meaning first, always.',
    method: '<div class="trick"><b>POPULOUS or POPULACE?</b></div><b>Hear it.</b> PAH-pyuh-luhs <b>Ask.</b> The definition. <b>Sort.</b> Full of people (adjective) = populous, -OUS like famous. The people themselves (noun) = populace, -ACE like place. <b>Anchor each twin</b> to its own ending story.',
    cards: [
      { title: 'Adjective or noun?', body: 'Many hard twins split by part of speech: populous (adj) vs populace (noun). Ask for the part of speech — it is allowed, and it decides.' },
      { title: 'Endings carry the meaning', body: '-ous means full of. -ace, -ent, -ant each carry their own story. Tie the twin to its ending and it stays tied.' },
      { title: 'The famous fallers', body: 'immanent/imminent, discreet/discrete, complacent/complaisant — pairs with real bee history. Respect them.' },
      { title: 'Never guess a twin', body: 'With twins, a fifty-fifty guess is a coin flip on your whole day. Use every question you are allowed.' } ],
    rule: 'homonym-b23' },
  { title: 'Named After Someone — eponyms', category: 'Trickster Concepts', difficulty: 'medium',
    concept: 'Some words are people. A nemesis was a Greek goddess. A silhouette was a French finance minister. When a word comes from a name, its spelling follows the NAME’s rules, not English rules — so the story is the spelling. Learn who, and you learn how.',
    method: '<div class="trick"><b>SILHOUETTE</b></div><b>Ask.</b> The origin. "From a name" = eponym alert. <b>Place the name.</b> Étienne de Silhouette — French. <b>Spell French:</b> silent H after the L, -OUETTE like the French would. <b>The story carries the letters.</b>',
    cards: [
      { title: 'Ask where it came from', body: 'The origin question is free. "From the name of..." tells you which country’s spelling rules to load.' },
      { title: 'Clusters, not chaos', body: 'Greek myth names spell Greek. French inventor names spell French. German scientist names spell German. Sort the person, sort the spelling.' },
      { title: 'The story sticks', body: 'A goddess of revenge (nemesis), a stingy minister (silhouette), a clumsy Irish family (hooligan) — stories are unforgettable. Use them.' },
      { title: 'Capital clues', body: 'Many eponyms still relate to proper nouns. If the definition mentions a person or place, think eponym.' } ],
    rule: 'eponym' },
  { title: 'Two-Way Words — one spelling, two sounds', category: 'Trickster Concepts', difficulty: 'medium',
    concept: 'Some words have two correct pronunciations — EE-ther and EYE-ther, KAR-uh-mel and KAR-mul — and the pronouncer may use either one. If you only know one sound, the other can make a familiar word feel like a stranger. Champions learn both sounds so no version surprises them.',
    method: '<div class="trick"><b>EITHER</b></div><b>Hear it</b> one way: EE-ther. <b>Expect</b> the other: EYE-ther. <b>Same word, same letters.</b> When a "new" word sounds half-familiar, ask yourself: is this a two-way word I already own?',
    cards: [
      { title: 'The pronouncer’s choice', body: 'Officially listed pronunciations are all fair game on stage. Two-way words are not tricks — they are options.' },
      { title: 'Heteronyms mean business', body: 'Some two-way words change meaning with the sound: DEH-zert (sand) vs dih-ZERT (abandon). The definition tells you which — and the spelling stays the same.' },
      { title: 'Ask for a repeat', body: 'You may ask the pronouncer to repeat the word. Hearing it twice often reveals a two-way word.' },
      { title: 'Own both sounds', body: 'When you learn a word, say it BOTH ways if it has two. Your ear will never be caught off guard.' } ],
    rule: 'altpron' },
  { title: 'Words in Fancy Dress — accent marks', category: 'Trickster Concepts', difficulty: 'hard',
    concept: 'Some borrowed words wear marks in their full dress spelling: café, jalapeño, crêpe. Study lists print the marks; the bee accepts plain letters. Knowing the marked form is a superpower anyway — the mark tells you how the word sounds and which language lent it to us.',
    method: '<div class="trick"><b>JALAPEÑO</b></div><b>See the tilde.</b> Ñ says "ny" — Spanish. <b>Sound it Spanish:</b> ha-luh-PAY-nyoh. <b>Spell plain letters</b> on stage: J-A-L-A-P-E-N-O. <b>The mark taught you the sound;</b> the stage wants the letters.',
    cards: [
      { title: 'Marks are sound maps', body: 'The acute (é) says "ay". The cedilla (ç) keeps C soft. The tilde (ñ) adds "ny". Read the mark, hear the word.' },
      { title: 'Plain letters win', body: 'At the bee, spelling the plain letters is accepted. The marks are knowledge, not obligation.' },
      { title: 'Marks reveal origins', body: 'A circumflex usually means French (and often a lost S — crêpe was crespe). An umlaut points German. Origins unlock patterns.' },
      { title: 'Fancy dress on lists', body: 'Study materials print résumé and piñata in full dress. Recognize the marked form so the list never confuses you.' } ],
    rule: 'diacritic' },
  { title: 'Sneaky Spellings — when sound hides the letters', category: 'Trickster Concepts', difficulty: 'medium',
    concept: 'The hardest words are not the longest — they are the ones whose sound hides the spelling. Silent starters (pneumonia), sound-alike endings (-able or -ible?), doubled letters you cannot hear (occurrence). Every sneaky word belongs to a FAMILY of sneaks, and each family has one trick that unlocks it.',
    method: '<div class="trick"><b>OCCURRENCE</b></div><b>Hear it:</b> uh-KUR-uhns. <b>Name the sneak:</b> doubles you cannot hear + an -ence ending. <b>Load the family rules:</b> occur doubles the R before -ence; -ENCE not -ANCE (like occurrence’s cousin, existence). <b>Spell the family,</b> not the sound.',
    cards: [
      { title: 'Name the trap first', body: 'Before spelling, ask: WHY would this word be on a bee list? Silent letter? Double? Sound-alike ending? Naming the trap loads the right rule.' },
      { title: 'Families of sneaks', body: 'Silent-starter words are a family. -able/-ible words are a family. Doubles are a family. Learn families, not one-offs.' },
      { title: 'The misspelling is a clue', body: 'Most sneaky words have ONE famous wrong spelling. Know the popular mistake and refuse to make it.' },
      { title: 'Slow is smooth', body: 'Sneaky words punish speed. Say the word, name the trap, then spell. Three seconds of thinking beats a year of regret.' } ],
    rule: 'sneaky' },
];

const ACTS = [
  { id: 'meadow', title: 'Act I · The Meadow', world: 'meadow', pick: ch => ch.category === 'Spelling Bee Basics' },
  { id: 'library', title: 'Act II · The Great Library', world: 'library', pick: ch => /Spelling Rules|Word Formation/.test(ch.category) },
  { id: 'forum', title: 'Act III · The Roman Forum', world: 'forum', pick: ch => /Latin Prefixes|Latin Suffixes|Latin & Old English Suffixes|Agent Suffixes/.test(ch.category) },
  { id: 'storm', title: 'Act IV · The Storm of Elements', world: 'elements', pick: ch => /Greek Prefixes|Number Prefixes|Greek Suffixes|Greek Medical/.test(ch.category) },
  { id: 'roots', title: 'Act V · The Root Kingdoms', world: 'engine', pick: ch => /Latin Root Families|Greek Root Families/.test(ch.category) },
  { id: 'strait', title: 'Act VI · The Wide Strait', world: 'strait', pick: ch => /French Loanword|Italian Loanword|Loanword Language Groups/.test(ch.category) },
  { id: 'junkyard', title: 'Act VII · The Trickster Junkyard', world: 'junkyard', pick: () => false, extra: NEWCH },
  { id: 'sprints', title: 'Act VIII · The Subject Sprints', world: 'junkyard', pick: ch => ch.category === 'Subject-Area Vocabulary' },
  { id: 'stage', title: 'Act IX · The Big Stage', world: 'stage', pick: ch => /Personality Themes|Advanced Vocabulary|Advanced Spelling Strategy|Championship Level/.test(ch.category) },
];

/* ---- word→unit classifier for the Honey Trail ----
   priority: trickster identities > origin/prefix/suffix > roots > subject themes.
   Each unit gets a rule; every word lands in its FIRST matching unit (priority order),
   guaranteeing single assignment. */
const lw = ch => (ch.words || []).map(x => nk(x.w));
function unitRule(ch, actId) {
  const t = ch.title, c = ch.category;
  const first = m => m && m[1] ? nk(m[1]) : null;
  if (c === 'Latin Prefixes' || /Prefixes/.test(c)) {
    const heads = (t.match(/^([a-z]+(?:- \/ [a-z-]+)*)/i) ? t.split('(')[0] : t).match(/[a-z]+(?=-)/gi) || [];
    if (heads.length) { const re = new RegExp('^(' + heads.map(h => nk(h)).join('|') + ')[a-z]{3,}');
      return w => re.test(nk(w.w)); } }
  if (/Suffixes/.test(c)) {
    const tails = t.match(/-([a-z]+)/gi) || [];
    if (tails.length) { const re = new RegExp('(' + tails.map(x => nk(x).slice(1)).join('|') + ')$');
      return w => re.test(nk(w.w)); } }
  if (c === 'Latin Root Families' || c === 'Greek Root Families') {
    const roots = (t.match(/[a-z]{3,}/gi) || []).filter(x => !/root|family|families|the|and|of/i.test(x)).slice(0, 4).map(nk);
    if (roots.length) { const re = new RegExp('(' + roots.join('|') + ')');
      return w => re.test(nk(w.w)) && /latin|greek/i.test(w.o || ''); } }
  if (/French Loanword/.test(c)) return w => /french|anglo-norman/i.test(w.o || '');
  if (/Italian Loanword/.test(c)) return w => /italian/i.test(w.o || '');
  if (c === 'Loanword Language Groups') {
    const m = { 'Spanish': /spanish/i, 'German': /german/i, 'Japanese': /japanese/i, 'Arabic': /arabic|persian|turkish/i, 'Sanskrit': /hindi|sanskrit|urdu|tamil/i, 'Dutch': /dutch|afrikaans/i, 'Celtic': /irish|gaelic|welsh|celtic|scots|breton|cornish/i };
    for (const k in m) if (t.indexOf(k) >= 0) { const re = m[k]; return w => re.test(w.o || ''); }
    return w => false; }
  if (c === 'Subject-Area Vocabulary' || c === 'Personality Themes') {
    const words = new Set(lw(ch)); const themes = new Set();
    (ch.words || []).forEach(x => { const r = W.find(v => nk(v.w) === nk(x.w)); if (r) (r.t || []).forEach(tg => themes.add(tg)); });
    const top = [...themes].slice(0, 3);
    return w => words.has(nk(w.w)) || (top.length && (w.t || []).some(tg => top.includes(tg))); }
  if (/Spelling Rules|Word Formation|Spelling Bee Basics|Advanced/.test(c) || actId === 'stage') {
    const words = new Set(lw(ch)); return w => words.has(nk(w.w)); }
  const words = new Set(lw(ch)); return w => words.has(nk(w.w));
}
const TRICK_RULES = {
  'homonym-b1': w => HOMSET.has(nk(w.w)) && spellDiff(w) < 40,
  'homonym-b23': w => HOMSET.has(nk(w.w)),
  'eponym': w => (w.t || []).includes('eponyms'),
  'altpron': w => hasOwn(AP, nk(w.w)),
  'diacritic': w => hasOwn(DI, nk(w.w)) || /[^\x00-\x7f]/.test(w.w),
  'sneaky': w => trickScore(w) >= 20,
};

/* ---- build units ---- */
let unitSeq = 0; const units = []; const acts = [];
for (const act of ACTS) {
  const chs = GEN.filter(act.pick).map(ch => ({ ch, gi: GEN.indexOf(ch), neu: false }))
    .concat((act.extra || []).map(ch => ({ ch, gi: -1, neu: true })));
  const ids = [];
  for (const { ch, gi, neu } of chs) {
    const id = 'u' + (++unitSeq);
    units.push({ id, act: act.id, title: ch.title, gi, neu, ch, rule: neu ? TRICK_RULES[ch.rule] : unitRule(ch, act.id), ruleName: neu ? ch.rule : 'auto' });
    ids.push(id);
  }
  acts.push({ id: act.id, title: act.title, world: act.world, units: ids });
}

/* ---- classify all 40,944 words: priority = trickster acts first, then acts in order,
   teaching words always land in their own chapter's unit ---- */
const teachOwner = {}; // word -> unit id (curated chapter words claim their unit)
for (const u of units) for (const x of (u.ch.words || [])) { const k = nk(x.w); if (!teachOwner[k]) teachOwner[k] = u.id; }
const PRIORITY = ['junkyard', 'forum', 'storm', 'roots', 'strait', 'library', 'meadow', 'sprints', 'stage'];
const orderedUnits = PRIORITY.flatMap(a => units.filter(u => u.act === a));
const assign = {}; // word -> unit id
for (const w of W) {
  const k = nk(w.w);
  if (teachOwner[k]) { assign[k] = teachOwner[k]; continue; }
  for (const u of orderedUnits) { try { if (u.rule && u.rule(w)) { assign[k] = u.id; break; } } catch (e) {} }
  if (!assign[k]) assign[k] = 'checkpoint';
}
/* bands: global terciles of spellDiff over the whole pool */
const diffs = W.map(w => spellDiff(w)).sort((a, b) => a - b);
const t1 = diffs[Math.floor(diffs.length / 3)], t2 = diffs[Math.floor(diffs.length * 2 / 3)];
const band = w => { const d = spellDiff(w); return d < t1 ? 1 : d < t2 ? 2 : 3; };
const pools = {}; // unit -> {1:[],2:[],3:[]}
for (const w of W) { const u = assign[nk(w.w)]; (pools[u] = pools[u] || { 1: [], 2: [], 3: [] })[band(w)].push(nk(w.w)); }

/* ---- concept-quiz questions: 4 per unit, generated from chapter content ---- */
const strip1 = s => String(s || '').split(/(?<=[.!?])\s/)[0].slice(0, 160);
function quizFor(u, allUnits) {
  const ch = u.ch; const qs = [];
  const others = allUnits.filter(x => x.act !== u.act);
  const pick3 = (arr, seed) => { const out = []; for (let i = 0; i < arr.length && out.length < 3; i++) { const x = arr[(seed + i * 7) % arr.length]; if (!out.includes(x)) out.push(x); } return out; };
  // Q1: the big idea (true statement vs other chapters' ideas)
  qs.push({ ty: 'idea', q: `Which of these is the big idea of “${ch.title}”?`,
    c: [strip1(ch.concept), ...pick3(others.map(o => strip1(o.ch.concept)), unitSeq + u.id.length)] });
  // Q2: family member (teaching word vs far-away words)
  const tw = (ch.words || [])[0]; const far = pick3(others.flatMap(o => (o.ch.words || []).slice(0, 1)).map(x => x.w), u.id.length * 3);
  if (tw) qs.push({ ty: 'member', q: `Which word belongs to this chapter's family?`, c: [tw.w, ...far] });
  // Q3: card match (card title -> its body, decoys = same chapter's other cards)
  const cards = (ch.cards || []);
  if (cards.length >= 3) qs.push({ ty: 'card', q: `The card “${cards[0].title}” says…`,
    c: [String(cards[0].body).slice(0, 140), ...cards.slice(1, 4).map(cd => String(cd.body).slice(0, 140))] });
  // Q4: hook check (hook with word masked -> pick the word)
  const hooked = (ch.words || []).find(x => x.hook && x.hook.length > 20);
  if (hooked) { const masked = String(hooked.hook).replace(new RegExp(hooked.w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), '▁▁▁');
    const near = (ch.words || []).filter(x => x.w !== hooked.w).slice(0, 3).map(x => x.w);
    if (near.length >= 2) qs.push({ ty: 'hook', q: `“${masked.slice(0, 150)}” — which word is this hook about?`, c: [hooked.w, ...near] }); }
  return qs.slice(0, 4);
}
for (const u of units) u.qs = quizFor(u, units);

/* ================= The Queen's Expedition (43 advanced units) ================= */
const EXPEDS = [
  { id: 'proving', title: 'Expedition I · The Proving Ground', world: 'warfield', pick: ch => ch.category === 'Championship Procedure' },
  { id: 'greysea', title: 'Expedition II · The Grey Sea', world: 'greysea', pick: ch => ch.category === 'Advanced Orthography' && /schwa|vowel|stress/i.test(ch.title) },
  { id: 'liars', title: 'Expedition III · The Liars’ Junkyard', world: 'junkyard', pick: ch => ch.category === 'Advanced Orthography' },
  { id: 'farflung', title: 'Expedition IV · The Far Shores', world: 'strait', pick: ch => ch.category === 'Origins Beyond the Big Four' },
  { id: 'factory', title: 'Expedition V · The Word Factory', world: 'engine', pick: ch => ch.category === 'How Words Are Built' },
];
let eSeq = 0; const eUnits = []; const expeds = []; const eUsed = new Set();
for (const ex of EXPEDS) {
  const chs = ADV.filter(ch => !eUsed.has(ch.title) && ex.pick(ch));
  chs.forEach(ch => eUsed.add(ch.title));
  const ids = [];
  for (const ch of chs) { const id = 'x' + (++eSeq);
    eUnits.push({ id, act: ex.id, title: ch.title, ai: ADV.indexOf(ch), ch }); ids.push(id); }
  expeds.push({ id: ex.id, title: ex.title, world: ex.world, units: ids });
}
for (const u of eUnits) u.qs = quizFor(u, eUnits);
if (eUsed.size !== ADV.length) { console.error('Expedition coverage', eUsed.size, '/', ADV.length); process.exit(1); }

/* ================= emit ================= */
const trail = {
  version: 1,
  names: { honey: 'The Word Atlas', expedition: 'The Advanced Rounds' },
  rules: { gate: 0.8, expeditionGate: 0.9, checkpointEvery: 4, bands: 3, coexist: true },
  bandCuts: { t1: Math.round(t1 * 10) / 10, t2: Math.round(t2 * 10) / 10 },
  honey: { acts, units: units.map(u => {
    const p = pools[u.id] || { 1: [], 2: [], 3: [] };
    const total = p[1].length + p[2].length + p[3].length;
    const kind = total >= 40 ? 'family' : 'lesson';
    let lap;
    if (kind === 'lesson') { // taught once; foundations pin to Lap 1, champion craft to Lap 2+
      const tws = (u.ch.words || []).map(x => W.find(v => nk(v.w) === nk(x.w))).filter(Boolean);
      const avg = tws.length ? tws.reduce((a2, w2) => a2 + band(w2), 0) / tws.length : 1;
      lap = Math.min(3, Math.max(1, Math.round(avg)));
      if (u.act === 'meadow' || u.act === 'library') lap = 1;
      if (u.act === 'stage' && /Advanced|Championship/.test(u.ch.category)) lap = Math.max(2, lap);
    }
    return { id: u.id, act: u.act, title: u.title, gi: u.gi,
      neu: u.neu || false, chapter: u.neu ? u.ch : undefined, qs: u.qs, kind, lap,
      laps: kind === 'family' ? [1, 2, 3].filter(b => p[b].length >= 12) : [lap],
      bands: { b1: p[1].length, b2: p[2].length, b3: p[3].length } }; }) },
  expedition: { expeds, units: eUnits.map(u => ({ id: u.id, act: u.act, title: u.title, ai: u.ai, qs: u.qs })) },
  checkpointPool: (pools['checkpoint'] ? [1, 2, 3].map(b => pools['checkpoint'][b].length) : [0, 0, 0]),
};
fs.writeFileSync('trail-data.js',
  '/* Bizzing Bee — The Honey Trail & The Queen\'s Expedition curriculum.\n' +
  '   Generated by the trail build script (see session scratchpad / books pipeline).\n' +
  '   Units reference concept chapters by index (gi into SB_CONCEPTS.chapters, ai into\n' +
  '   SB_ADV_CONCEPTS.chapters); neu units carry their chapter inline (no narration yet).\n' +
  '   qs are concept-quiz questions with c[0] ALWAYS the correct answer (UI shuffles). */\n' +
  'window.SB_TRAIL=' + JSON.stringify(trail) + ';\n');
const mapOut = {};
for (const uid in pools) mapOut[uid] = pools[uid];
fs.writeFileSync('trail-map-data.js',
  '/* Bizzing Bee — Honey Trail word map: every nsf word in exactly one unit, banded 1-3\n' +
  '   by global spellDiff terciles. Lazy-load with the trail engine (not in index.html\n' +
  '   until the engine ships). Regenerate with the trail build script. */\n' +
  'window.SB_TRAIL_MAP=' + JSON.stringify(mapOut) + ';\n');

/* ---- validation + review doc ---- */
let assigned = 0, orphans = pools['checkpoint'] ? pools['checkpoint'][1].length + pools['checkpoint'][2].length + pools['checkpoint'][3].length : 0;
for (const uid in pools) if (uid !== 'checkpoint') assigned += pools[uid][1].length + pools[uid][2].length + pools[uid][3].length;
const skipLap1 = trail.honey.units.filter(u => u.kind === 'family' && u.bands.b1 < 12);
const qTotal = units.reduce((a, u) => a + u.qs.length, 0) + eUnits.reduce((a, u) => a + u.qs.length, 0);
console.log(`Honey Trail: ${acts.length} acts, ${units.length} units (${NEWCH.length} newly authored trickster chapters)`);
console.log(`Expedition: ${expeds.length} expeditions, ${eUnits.length} units`);
console.log(`Words assigned: ${assigned} + checkpoint pool ${orphans} = ${assigned + orphans} / ${W.length}`);
console.log(`Band cuts: B1<${trail.bandCuts.t1} <=B2< ${trail.bandCuts.t2} <=B3`);
const fam = trail.honey.units.filter(u => u.kind === 'family').length;
console.log(`Family units (spiral across laps): ${fam} · Lesson units (once): ${trail.honey.units.length - fam}`);
console.log(`Family units not in Lap 1 (<12 easy words): ${skipLap1.length}`);
console.log(`Concept-quiz questions generated: ${qTotal}`);

let md = `# The Honey Trail & The Queen's Expedition — generated curriculum\n\n`;
md += `Names locked: base journey = **The Honey Trail**, ultra = **The Queen's Expedition**.\n`;
md += `Decisions: coexists with the classic ladder · hard 80% gate (90% Expedition) · checkpoint every 4th unit.\n\n`;
md += `**Coverage:** ${assigned + orphans} of ${W.length} words assigned — ${assigned} in units, ${orphans} in the checkpoint pool.\n`;
md += `**Bands:** B1 < ${trail.bandCuts.t1} ≤ B2 < ${trail.bandCuts.t2} ≤ B3 (global spellDiff terciles).\n`;
md += `**Questions:** ${qTotal} concept-quiz questions across ${units.length + eUnits.length} units (c[0] correct; UI shuffles).\n\n`;
md += `## The Honey Trail — ${acts.length} acts, ${units.length} units\n`;
for (const a of acts) {
  md += `\n### ${a.title}  *(world: ${a.world})*\n\n| Unit | Chapter | Kind | B1 | B2 | B3 | Runs in |\n|---|---|---|---|---|---|---|\n`;
  for (const id of a.units) { const u = trail.honey.units.find(x => x.id === id);
    md += `| ${u.id}${u.neu ? ' ✳' : ''} | ${u.title.replace(/\|/g, '/')} | ${u.kind} | ${u.bands.b1} | ${u.bands.b2} | ${u.bands.b3} | ${u.kind === 'lesson' ? 'Lap ' + u.lap + ' (once)' : 'Laps ' + u.laps.join(', ')} |\n`; }
}
md += `\n✳ = newly authored trickster chapter (inline in trail-data.js; narration to be recorded when the engine ships).\n`;
md += `\n## The Queen's Expedition — ${expeds.length} expeditions, ${eUnits.length} units\n`;
for (const ex of expeds) {
  md += `\n### ${ex.title}  *(world: ${ex.world})*\n`;
  for (const id of ex.units) { const u = trail.expedition.units.find(x => x.id === id); md += `- ${u.id} · ${u.title}\n`; }
}
md += `\n*(Expedition word pools classify from the full 128k at engine time; the quiz sets above are final.)*\n`;
md += `\n## How the books line up (one story, two media)\n
The Library's volumes and the Trail's acts share worlds deliberately — the app journey and the
print books are the same road:\n
| Trail act | World | Book volume(s) |\n|---|---|---|\n| I The Meadow | meadow | Vol. 1 Lift-Off! |\n| II The Great Library | library | Vol. 2 The Rulebook |\n| III The Roman Forum | forum | Vol. 3 Latin Launchers + the suffix half of Vol. 5 |\n| IV The Storm of Elements | elements | Vol. 4 Greek Lightning |\n| V The Root Kingdoms | engine | Vols. 6–7 Root Camp |\n| VI The Wide Strait | strait | Vol. 8 The World Tour |\n| VII The Trickster Junkyard | junkyard | ✳ new chapters — next book edition adds a Tricksters volume (or folds into Vol. 5) |\n| VIII The Subject Sprints | junkyard | Vol. 9 Subject Sprints |\n| IX The Big Stage | stage | Vols. 5 + 10 (endings, personalities, championship craft) |\n| Expeditions I–V | warfield/greysea/junkyard/strait/engine | Vols. 11–15, one-to-one |\n
Structure note: a book chapter already runs comic → Big Idea → Pro Move → practice → puzzle —
that is the Trail unit loop minus the concept quiz. Two follow-ups for the next book edition:
(1) add each unit's four concept-quiz questions to the chapter's Check Yourself block so paper
and app gate on the same understanding; (2) print each chapter's Lap-1 band words as the
practice bench and move harder band words to a marked "Lap 2 return" page, mirroring the
band-cap rule; (3) the six new trickster chapters get pages (and a possible Vol. 18) once
their narration is recorded.\n`;
md += `\n## Sample concept-quiz questions\n`;
for (const u of [units[12], units.find(x => x.neu), eUnits[4]].filter(Boolean)) {
  md += `\n**${u.title}**\n`;
  for (const q of u.qs) md += `- *(${q.ty})* ${q.q}\n  - ✔ ${String(q.c[0]).slice(0, 90)}\n  - ✗ ${String(q.c[1] || '').slice(0, 70)}\n`;
}
fs.writeFileSync('TRAIL-CURRICULUM.md', md);
console.log('wrote trail-data.js, trail-map-data.js, TRAIL-CURRICULUM.md');
