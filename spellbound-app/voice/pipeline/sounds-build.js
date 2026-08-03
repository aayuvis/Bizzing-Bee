/* Build sounds-data.js: SB_HOM (homophone groups — curated classics ∪ a filtered sweep
   of all 130k pronunciations), SB_ALT_PRON (written alternate pronunciations: heteronyms
   + accepted free variants), SB_DIACRITICS (true marked spellings for words the library
   holds in plain letters). Every shipped word is verified against the libraries. */
const fs = require('fs');
global.window = global;
process.chdir('/home/user/Bizzing-Bee/spellbound-app');
eval(fs.readFileSync('words-data.js', 'utf8'));
eval(fs.readFileSync('words-full.js', 'utf8'));
const NSF = SB_DATA.nsf, FULL = JSON.parse(SB_FULL);
const nk = w => String(w || '').toLowerCase();
const inNsf = new Set(NSF.map(r => nk(r.w))), inFull = new Set(FULL.map(r => nk(r.w)));
const present = w => inNsf.has(nk(w)) || inFull.has(nk(w));

/* ---------- 1) homophone sweep over the union of both libraries ---------- */
const seen = new Map();                       // nkey -> record (nsf wins)
for (const r of FULL) if (r && r.w) seen.set(nk(r.w), r);
for (const r of NSF) if (r && r.w) seen.set(nk(r.w), r);
const norm = p => String(p || '').toLowerCase().replace(/[^a-z]/g, '');
const dnorm = d => new Set(String(d || '').toLowerCase().replace(/[^a-z ]/g, '').split(/\s+/).filter(x => x.length > 2));
const jac = (a, b) => { if (!a.size || !b.size) return 0; let i = 0; for (const x of a) if (b.has(x)) i++; return i / (a.size + b.size - i); };
const canon = w => nk(w).replace(/[^a-z]/g, '').replace(/(.)\1+/g, '$1')
  .replace(/i[sz]/g, 'iz').replace(/re(s?)$/, 'er$1').replace(/our/g, 'or')
  .replace(/ae|oe/g, 'e').replace(/ue$/, '').replace(/e$/, '')
  .replace(/xion/g, 'ction').replace(/log$/, 'log').replace(/gu/g, 'g').replace(/ck|k/g, 'c');
const by = {};
for (const [k, r] of seen) {
  if (!r.p || /[\s]/.test(r.w) || /[^a-z-]/i.test(r.w)) continue;   // single plain-letter tokens only
  const key = norm(r.p); if (key.length < 3) continue;
  (by[key] = by[key] || []).push(r);
}
/* spelling-variant pair, not a homonym: a mid-word 'e' insertion (salable/saleable) or a
   mid-word c↔s / i↔y substitution (defence/defense, gipsy/gypsy). Start-of-word changes
   stay real homonyms (cite/site, racking/wracking); end insertions too (pleas/please). */
const insVariant = (a, b) => {
  if (Math.abs(a.length - b.length) === 1) {
    const [s, l] = a.length < b.length ? [a, b] : [b, a];
    for (let i = 1; i < s.length; i++) if (l[i] === 'e' && s.slice(0, i) + 'e' + s.slice(i) === l) return true;
    return false;
  }
  if (a.length === b.length) {
    let d = -1; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) { if (d >= 0) return false; d = i; }
    if (d <= 0) return false;
    const pair = a[d] + b[d];
    return pair === 'cs' || pair === 'sc' || pair === 'iy' || pair === 'yi';
  }
  return false; };
let swept = [];
for (const key in by) {
  const g = by[key]; if (g.length < 2) continue;
  const keep = [];
  for (const r of g) {
    if (keep.find(x => canon(x.w) === canon(r.w) || insVariant(nk(x.w), nk(r.w)) || jac(dnorm(x.d), dnorm(r.d)) > 0.45)) continue;
    keep.push(r);
  }
  if (keep.length > 1) swept.push(keep.map(r => nk(r.w)));
}
// plural-echo suppression: drop a group whose de-s'd members already form a kept group
const groupSet = new Set(swept.map(g => g.slice().sort().join('|')));
swept = swept.filter(g => {
  if (!g.every(w => /s$/.test(w))) return true;
  return !groupSet.has(g.map(w => w.slice(0, -1)).sort().join('|'));
});
// known variant-spelling pairs that slip the canon (British/US etc.) — not homonyms
const VARIANT_JUNK = new Set(['licence|license', 'licences|licenses', 'connection|connexion', 'reconnection|reconnexion', 'descendant|descendent', 'descendants|descendents', 'cardamom|cardamum', 'cardamoms|cardamums', 'confectionary|confectionery', 'phosphorous|phosphorus', 'abay|abey', 'abeigh|abiegh', 'abbeystead|abbeystede', 'unenamour\'d|unenamoured', 'nonresister|nonresistor', 'abater|abator', 'abaters|abators', 'abetter|abettor', 'abetters|abettors', 'animater|animator', 'adapters|adaptors', 'devisers|devisors', 'dilaters|dilators', 'rarefying|rarifying', 'committable|committible', 'compactable|compactible', 'nontradable|nontradeable', 'nonwritable|nonwriteable', 'aberrance|aberrants', 'reactance|reactants', 'aahed|odd', 'blanch|blanche', 'abbe|abie', 'guarantees|guaranties', 'joinson|joynson', 'susurrous|susurrus', 'defence|defense', 'offence|offense', 'pretence|pretense']);
swept = swept.filter(g => g.length <= 4 && !VARIANT_JUNK.has(g.slice().sort().join('|')))
  .map(g => g.filter(w => !VARIANT_JUNK.has(w)));

/* ---------- 2) curated classic homophone groups (bee canon) ---------- */
const CLASSIC = `aisle isle|allowed aloud|altar alter|arc ark|ascent assent|aural oral|bail bale|bait bate|bald bawled|ball bawl|band banned|bard barred|bare bear|baron barren|base bass|bated baited|bazaar bizarre|beach beech|beat beet|berry bury|berth birth|billed build|bloc block|board bored|boarder border|bough bow|boy buoy|brake break|bread bred|brewed brood|bridal bridle|broach brooch|cache cash|callous callus|cannon canon|canvas canvass|capital capitol|carat caret carrot karat|cast caste|cede seed|ceiling sealing|cell sell|censor censer sensor|cent scent sent|cereal serial|cession session|chased chaste|chews choose|chord cord|chute shoot|cite sight site|coarse course|colonel kernel|complement compliment|coop coupe|core corps|council counsel|creak creek|crews cruise|cue queue|currant current|cygnet signet|cymbal symbol|days daze|dear deer|dew due|die dye|discreet discrete|doe dough|dual duel|earn urn|ewe yew|eyelet islet|faint feint|fair fare|faun fawn|faze phase|feat feet|fir fur|flair flare|flea flee|flew flu flue|flour flower|foreword forward|foul fowl|franc frank|gait gate|gamble gambol|gilt guilt|gnu knew new|gorilla guerrilla|grate great|grisly grizzly|groan grown|guessed guest|hail hale|hair hare|hall haul|hangar hanger|heal heel|hear here|heard herd|heroin heroine|hew hue|higher hire|hoard horde|hoarse horse|hole whole|holey holy wholly|hour our|idle idol idyll|incite insight|jam jamb|knead need|knight night|knot not|know no|lain lane|leach leech|lead led|leak leek|lean lien|lessen lesson|levee levy|links lynx|load lode|loan lone|loot lute|made maid|mail male|main mane|maize maze|mall maul|manner manor|mantel mantle|marshal martial|meat meet mete|medal meddle|might mite|miner minor|moose mousse|morning mourning|muscle mussel|naval navel|none nun|oar ore|ordinance ordnance|overdo overdue|paced paste|packed pact|pail pale|pain pane|pair pare pear|palate palette pallet|passed past|patience patients|pause paws|peace piece|peak peek pique|peal peel|pearl purl|pedal peddle|peer pier|plain plane|pleas please|pole poll|pore pour|pray prey|presence presents|principal principle|profit prophet|rack wrack|rain reign rein|raise rays raze|rap wrap|read reed|real reel|review revue|right rite wright write|ring wring|road rode rowed|roe row|role roll|root route|rote wrote|rung wrung|rye wry|sail sale|scene seen|scull skull|sea see|seam seem|sear seer sere|seas sees seize|serf surf|shear sheer|shone shown|side sighed|slay sleigh|soar sore|sole soul|some sum|son sun|staid stayed|stair stare|stake steak|stationary stationery|steal steel|straight strait|suite sweet|tacks tax|tail tale|taught taut|tea tee|team teem|tear tier|tense tents|threw through|throne thrown|thyme time|tide tied|toad towed|toe tow|told tolled|trussed trust|vain vane vein|vial vile|wade weighed|wail whale|waist waste|wait weight|waive wave|weak week|weather whether|wet whet|which witch|whine wine|wood would|yoke yolk|apophasis apophysis|immanent imminent|immanence imminence|populous populace|complacent complaisant|acclamation acclimation|depravation deprivation|topography typography|diffusing defusing|dualist duelist|krewe crew|fait fate|braid brayed|mock mach|columbia colombia|illation elation|apatite appetite|antiphishing antifishing`
  .split('|').map(s => s.trim().split(/\s+/));

const homMap = new Map();                     // sorted-key -> group
for (const g of swept.concat(CLASSIC)) {
  const grp = [...new Set(g.map(nk))].filter(w => w.length > 1);
  if (grp.length < 2) continue;
  const key = grp.slice().sort().join('|');
  if (!homMap.has(key)) homMap.set(key, grp);
}
// require at least one member present in a library (else it can never surface)
const HOM = [...homMap.values()].filter(g => g.some(present));
const homPresent = HOM.reduce((a, g) => a + g.filter(present).length, 0);

/* ---------- 3) alternate pronunciations (written; het = two meanings) ---------- */
const ALT = {
  // heteronyms — one spelling, two sounds, two meanings
  bass: { a: 'BAYSS', b: 'BASS', s: 'base', n: 'BAYSS in music; BASS the fish' },
  bow: { a: 'BOH', b: 'BOW', s: 'boh', n: 'BOH the ribbon or violin bow; BOW to bend' },
  buffet: { a: 'buh-FAY', b: 'BUH-fit', s: 'buffay', n: 'buh-FAY the meal; BUH-fit to strike' },
  close: { a: 'KLOHS', b: 'KLOHZ', s: 'kloze', n: 'KLOHS nearby; KLOHZ to shut' },
  conduct: { a: 'KON-dukt', b: 'kun-DUKT', s: 'kunduckt', n: 'KON-dukt behaviour; kun-DUKT to lead' },
  console: { a: 'KON-sohl', b: 'kun-SOHL', s: 'kunsole', n: 'KON-sohl the cabinet; kun-SOHL to comfort' },
  content: { a: 'KON-tent', b: 'kun-TENT', s: 'kuntent', n: 'KON-tent what is inside; kun-TENT happy' },
  contract: { a: 'KON-trakt', b: 'kun-TRAKT', s: 'kuntract', n: 'KON-trakt the agreement; kun-TRAKT to shrink' },
  contrast: { a: 'KON-trast', b: 'kun-TRAST', s: 'kuntrast', n: 'noun up front, verb at the back' },
  convert: { a: 'KON-vert', b: 'kun-VERT', s: 'kunvert', n: 'KON-vert the person; kun-VERT to change' },
  desert: { a: 'DEH-zert', b: 'dih-ZERT', s: 'dizzert', n: 'DEH-zert the dry land; dih-ZERT to abandon' },
  dove: { a: 'DUHV', b: 'DOHV', s: 'dohv', n: 'DUHV the bird; DOHV dived' },
  entrance: { a: 'EN-truhns', b: 'en-TRANS', s: 'entrance', n: 'EN-truhns the doorway; en-TRANS to delight' },
  excuse: { a: 'ek-SKYOOS', b: 'ek-SKYOOZ', s: 'excyooz', n: 'SKYOOS the reason; SKYOOZ to forgive' },
  incense: { a: 'IN-sens', b: 'in-SENS', s: 'insens', n: 'IN-sens the fragrant smoke; in-SENS to enrage' },
  intimate: { a: 'IN-tuh-mut', b: 'IN-tuh-mayt', s: 'intimate', n: 'MUT close; MAYT to hint' },
  invalid: { a: 'IN-vuh-lid', b: 'in-VA-lid', s: 'invalid', n: 'IN-vuh-lid the patient; in-VA-lid not valid' },
  lead: { a: 'LEED', b: 'LED', s: 'led', n: 'LEED to guide; LED the metal' },
  live: { a: 'LIV', b: 'LEYEV', s: 'lyve', n: 'LIV to be alive; LEYEV as in live wire' },
  minute: { a: 'MIH-nit', b: 'meye-NOOT', s: 'mynoot', n: 'MIH-nit sixty seconds; meye-NOOT tiny' },
  moderate: { a: 'MO-duh-rut', b: 'MO-duh-rayt', s: 'moderate', n: 'RUT mild; RAYT to chair a debate' },
  object: { a: 'OB-jekt', b: 'ub-JEKT', s: 'ubject', n: 'OB-jekt the thing; ub-JEKT to protest' },
  permit: { a: 'PER-mit', b: 'per-MIT', s: 'permitt', n: 'PER-mit the licence; per-MIT to allow' },
  present: { a: 'PREH-zunt', b: 'prih-ZENT', s: 'prezent', n: 'PREH-zunt the gift; prih-ZENT to show' },
  produce: { a: 'PROH-doos', b: 'pruh-DOOS', s: 'produce', n: 'PROH-doos the vegetables; pruh-DOOS to make' },
  progress: { a: 'PRO-gres', b: 'pruh-GRES', s: 'progress', n: 'PRO-gres the advance; pruh-GRES to move on' },
  project: { a: 'PRO-jekt', b: 'pruh-JEKT', s: 'project', n: 'PRO-jekt the plan; pruh-JEKT to cast forward' },
  rebel: { a: 'REH-bul', b: 'rih-BEL', s: 'rebell', n: 'REH-bul the person; rih-BEL to rise up' },
  record: { a: 'REH-kord', b: 'rih-KORD', s: 'recorred', n: 'REH-kord the disc; rih-KORD to write down' },
  refuse: { a: 'REH-fyoos', b: 'rih-FYOOZ', s: 'refyooz', n: 'REH-fyoos rubbish; rih-FYOOZ to say no' },
  sewer: { a: 'SOO-er', b: 'SOH-er', s: 'sohur', n: 'SOO-er the drain; SOH-er one who sews' },
  sow: { a: 'SOH', b: 'SOW', s: 'soh', n: 'SOH to plant; SOW the pig' },
  subject: { a: 'SUB-jekt', b: 'sub-JEKT', s: 'subject', n: 'SUB-jekt the topic; sub-JEKT to make undergo' },
  tear: { a: 'TEER', b: 'TAIR', s: 'tair', n: 'TEER from crying; TAIR to rip' },
  wind: { a: 'WIND', b: 'WEYEND', s: 'wynde', n: 'WIND the breeze; WEYEND to coil' },
  wound: { a: 'WOOND', b: 'WOWND', s: 'wowned', n: 'WOOND the injury; WOWND coiled up' },
  alternate: { a: 'AWL-ter-nut', b: 'AWL-ter-nayt', s: 'allternate', n: 'NUT the substitute; NAYT to take turns' },
  deliberate: { a: 'dih-LIH-buh-rut', b: 'dih-LIH-buh-rayt', s: 'deliberate', n: 'RUT on purpose; RAYT to weigh options' },
  delegate: { a: 'DEH-lih-gut', b: 'DEH-lih-gayt', s: 'delegate', n: 'GUT the representative; GAYT to hand over' },
  duplicate: { a: 'DOO-plih-kut', b: 'DOO-plih-kayt', s: 'duplicate', n: 'KUT the copy; KAYT to copy' },
  elaborate: { a: 'ih-LA-buh-rut', b: 'ih-LA-buh-rayt', s: 'elaborate', n: 'RUT detailed; RAYT to explain further' },
  estimate: { a: 'EH-stih-mut', b: 'EH-stih-mayt', s: 'estimate', n: 'MUT the rough figure; MAYT to reckon' },
  graduate: { a: 'GRA-joo-ut', b: 'GRA-joo-ayt', s: 'gradjooate', n: 'UT the alum; AYT to finish school' },
  advocate: { a: 'AD-vuh-kut', b: 'AD-vuh-kayt', s: 'advocate', n: 'KUT the supporter; KAYT to argue for' },
  associate: { a: 'uh-SOH-shee-ut', b: 'uh-SOH-shee-ayt', s: 'associate', n: 'UT the colleague; AYT to connect' },
  separate: { a: 'SEH-puh-rut', b: 'SEH-puh-rayt', s: 'separate', n: 'RUT apart; RAYT to divide' },
  syndicate: { a: 'SIN-dih-kut', b: 'SIN-dih-kayt', s: 'syndicate', n: 'KUT the group; KAYT to publish widely' },
  // accepted free variants — either sound may come from the pronouncer
  either: { a: 'EE-ther', b: 'EYE-ther', s: 'eyether', n: 'both are correct' },
  neither: { a: 'NEE-ther', b: 'NEYE-ther', s: 'nyether', n: 'both are correct' },
  caramel: { a: 'KAR-uh-mel', b: 'KAR-mul', s: 'karmul', n: 'both are correct' },
  apricot: { a: 'AP-rih-kot', b: 'AY-prih-kot', s: 'ayprikot', n: 'both are correct' },
  envelope: { a: 'EN-vuh-lohp', b: 'AHN-vuh-lohp', s: 'onvelope', n: 'both are correct' },
  niche: { a: 'NICH', b: 'NEESH', s: 'neesh', n: 'both are correct' },
  forte: { a: 'FOR-tay', b: 'FORT', s: 'fort', n: "FOR-tay in music; FORT one's strength (both heard)" },
  route: { a: 'ROOT', b: 'ROWT', s: 'rowt', n: 'both are correct' },
  coupon: { a: 'KOO-pon', b: 'KYOO-pon', s: 'cuepon', n: 'both are correct' },
  pecan: { a: 'pih-KAHN', b: 'PEE-kan', s: 'peekan', n: 'both are correct' },
  tomato: { a: 'tuh-MAY-toh', b: 'tuh-MAH-toh', s: 'tomahto', n: 'both are correct' },
  vase: { a: 'VAYS', b: 'VAHZ', s: 'vahz', n: 'both are correct' },
  leisure: { a: 'LEE-zher', b: 'LEH-zher', s: 'lezher', n: 'both are correct' },
  garage: { a: 'guh-RAHZH', b: 'GAR-ij', s: 'garridge', n: 'both are correct' },
  schedule: { a: 'SKEH-jool', b: 'SHEH-jool', s: 'shedyool', n: 'US and UK forms' },
  herb: { a: 'ERB', b: 'HERB', s: 'hurb', n: 'US drops the h; UK sounds it' },
  often: { a: 'AW-fun', b: 'AWF-tun', s: 'offtun', n: 'the t may be silent or sounded' },
  data: { a: 'DAY-tuh', b: 'DA-tuh', s: 'dattuh', n: 'both are correct' },
  pajamas: { a: 'puh-JAH-muz', b: 'puh-JA-muz', s: 'pajammas', n: 'both are correct' },
  crayon: { a: 'KRAY-on', b: 'KRAY-un', s: 'krayun', n: 'both are correct' },
  almond: { a: 'AH-mund', b: 'AL-mund', s: 'allmund', n: 'the l may be silent or sounded' },
  banal: { a: 'buh-NAL', b: 'BAY-nul', s: 'baynul', n: 'both are correct' },
  err: { a: 'ER', b: 'AIR', s: 'air', n: 'both are correct' },
  croissant: { a: 'kruh-SAHNT', b: 'kwah-SAHN', s: 'kwassohn', n: 'English and French-style' },
  turmeric: { a: 'TER-muh-rik', b: 'TOO-muh-rik', s: 'toomerick', n: 'both are correct' },
  celtic: { a: 'KEL-tik', b: 'SEL-tik', s: 'seltick', n: 'KEL-tik for the peoples; SEL-tik in team names' },
};
/* CMUdict-mined alternates (audibly meaningful only — see /tmp/altpron-auto.py);
   the hand-curated entries above override them, carrying better notes and speakables */
const AUTO = JSON.parse(fs.readFileSync('/tmp/altpron-auto.json', 'utf8'));
const altKept = {}, altDropped = [];
for (const w in AUTO) if (present(w)) altKept[w] = AUTO[w];
for (const w in ALT) (present(w) ? (altKept[w] = ALT[w]) : altDropped.push(w));

/* ---------- 4) diacritics — the full-dress spelling behind the plain letters ---------- */
const DIA = {
  cliche: ['cliché', 'acute accent'], naive: ['naïve', 'diaeresis'], naivete: ['naïveté', 'diaeresis + acute'],
  facade: ['façade', 'cedilla'], melee: ['mêlée', 'circumflex + acute'], decoupage: ['découpage', 'acute accent'],
  applique: ['appliqué', 'acute accent'], consomme: ['consommé', 'acute accent'], matinee: ['matinée', 'acute accent'],
  denouement: ['dénouement', 'acute accent'], doppelganger: ['doppelgänger', 'umlaut'], soupcon: ['soupçon', 'cedilla'],
  resume: ['résumé', 'acute accents'], jalapeno: ['jalapeño', 'tilde'], pinata: ['piñata', 'tilde'],
  senor: ['señor', 'tilde'], manana: ['mañana', 'tilde'], vicuna: ['vicuña', 'tilde'],
  smorgasbord: ['smörgåsbord', 'umlaut + ring'], puree: ['purée', 'acute accent'], saute: ['sauté', 'acute accent'],
  fiancee: ['fiancée', 'acute accent'], fiance: ['fiancé', 'acute accent'], canape: ['canapé', 'acute accent'],
  protege: ['protégé', 'acute accents'], attache: ['attaché', 'acute accent'], crepe: ['crêpe', 'circumflex'],
  entree: ['entrée', 'acute accent'], outre: ['outré', 'acute accent'], risque: ['risqué', 'acute accent'],
  roue: ['roué', 'acute accent'], soiree: ['soirée', 'acute accent'], ingenue: ['ingénue', 'acute accent'],
  creme: ['crème', 'grave accent'], crepes: ['crêpes', 'circumflex'], garcon: ['garçon', 'cedilla'],
  chateau: ['château', 'circumflex'], cafe: ['café', 'acute accent'], touche: ['touché', 'acute accent'],
  flambe: ['flambé', 'acute accent'], blase: ['blasé', 'acute accent'], creche: ['crèche', 'grave accent'],
  saag: null, // placeholder never emitted
  paella: null, habitue: ['habitué', 'acute accent'], detente: ['détente', 'acute accent'],
  fete: ['fête', 'circumflex'], eclair: ['éclair', 'acute accent'], elan: ['élan', 'acute accent'],
  emigre: ['émigré', 'acute accents'], epee: ['épée', 'acute accents'], etude: ['étude', 'acute accent'],
  expose: ['exposé', 'acute accent'], flanerie: ['flânerie', 'circumflex'], frappe: ['frappé', 'acute accent'],
  gateau: ['gâteau', 'circumflex'], lycee: ['lycée', 'acute accent'], macrame: ['macramé', 'acute accent'],
  moire: ['moiré', 'acute accent'], negligee: ['négligée', 'acute accents'], passe: ['passé', 'acute accent'],
  pate: ['pâté', 'circumflex + acute'], precis: ['précis', 'acute accent'], premiere: ['première', 'grave accent'],
  seance: ['séance', 'acute accent'], tete: null, ubermensch: ['übermensch', 'umlaut'],
  cortege: ['cortège', 'grave accent'], communique: ['communiqué', 'acute accent'],
  debutante: ['débutante', 'acute accent'], decolletage: ['décolletage', 'acute accent'],
  demode: ['démodé', 'acute accents'], divorcee: ['divorcée', 'acute accent'],
  menage: ['ménage', 'acute accent'], recherche: ['recherché', 'acute accent'],
  repechage: ['repêchage', 'circumflex'], retrousse: ['retroussé', 'acute accent'],
  cause_celebre: null, piquee: null,
};
const diaKept = {}, diaDropped = [];
for (const w in DIA) { if (!DIA[w]) continue; (present(w) ? (diaKept[w] = { m: DIA[w][0], n: DIA[w][1] }) : diaDropped.push(w)); }
// words the library already spells WITH marks — index them too (plain form as key)
const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
for (const r of FULL) {
  if (!/[^\x00-\x7f]/.test(r.w) || /\s/.test(r.w)) continue;
  const plain = nk(strip(r.w));
  if (!diaKept[plain]) diaKept[plain] = { m: r.w, n: 'marked in the dictionary', lib: 1 };
}

/* ---------- emit ---------- */
const out = '/* Bizzing Bee — sound data: homophone groups (SB_HOM), written alternate\n' +
  '   pronunciations (SB_ALT_PRON: a/b written forms, s speakable alt for TTS, n note),\n' +
  '   and true diacritic spellings (SB_DIACRITICS: m marked form, n mark name).\n' +
  '   Generated from a 130k-pronunciation sweep + hand curation; regenerate with the\n' +
  '   session build script rather than editing by hand. */\n' +
  'window.SB_HOM=' + JSON.stringify(HOM) + ';\n' +
  'window.SB_ALT_PRON=' + JSON.stringify(altKept) + ';\n' +
  'window.SB_DIACRITICS=' + JSON.stringify(diaKept) + ';\n';
fs.writeFileSync('sounds-data.js', out);
console.log('SB_HOM groups:', HOM.length, '| member words:', HOM.reduce((a, g) => a + g.length, 0), '| present in libs:', homPresent);
console.log('SB_ALT_PRON:', Object.keys(altKept).length, 'kept | dropped (not in libs):', altDropped.join(', ') || 'none');
console.log('SB_DIACRITICS:', Object.keys(diaKept).length, 'kept | dropped:', diaDropped.join(', ') || 'none');
console.log('bytes:', out.length);
