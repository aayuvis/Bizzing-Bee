import json, sys
sys.path.insert(0, sys.argv[1])  # scripts dir
from build_sources import SOURCES, D

trail = json.load(open(sys.argv[2]))      # extracted regions/stops from trail-data.js + concepts-data.js
overlap = json.load(open(sys.argv[3]))    # stop words vs UK statutory word lists / CCSS example words
OUT = sys.argv[4]

NM = "not mapped"
CB_NM = "not mapped: CBSE Class IX English 2026-27 states no spelling, affix, root or etymology expectation"
CB_VOC = ("Class IX (partial, generic): 'expand vocabulary through contextual reading and writing'; "
          "'understand meanings of unfamiliar words through context and reference tools such as dictionaries' (p.6)")

# Shared phrases (quoted from fetched documents)
L32F = "L.3.2f 'Use spelling patterns and generalizations (e.g., word families, position-based spellings, syllable patterns, ending rules, meaningful word parts) in writing words.'"
L44B = "L.4.4b 'Use common, grade-appropriate Greek and Latin affixes and roots as clues to the meaning of a word (e.g., telegraph, photograph, autograph).'"
LXB = "L.4.4b-L.8.4b (Greek and/or Latin affixes and roots as clues to meaning)"
UK_MORPH = ("Y5-6 statutory spelling: 'use knowledge of morphology and etymology in spelling' (KS1-2 p.36); "
            "Y3-4 and Y5-6 word reading: 'apply their growing knowledge of root words, prefixes and suffixes (etymology and morphology) as listed in English Appendix 1' (pp.25, 33)")
UK_KS3_VOC = "KS3 Reading: 'learning new vocabulary, relating it explicitly to known vocabulary and understanding it with the help of context and dictionaries' (p.4)"
UK_PREF = "Y3-4 statutory 'More prefixes' (Appendix 1 p.11) / Y5-6 'use further prefixes and suffixes and understand the guidance for adding them' (KS1-2 p.36)"

def S(unit, concept, us, uk, cbse, src):
    return {"unit": unit, "concept": concept, "us": us, "uk": uk, "cbse": cbse, "sources": src}

STOPS = {
# ---------------- Act I · The Meadow ----------------
"u1": S("u1","say-spell-say oral routine", NM+": no CCSS L.3-8 statement on an oral spelling procedure", NM, NM, []),
"u2": S("u2","letter sounds; hard/soft c and g",
  "Grade 3 (partial): "+L32F+" Names position-based spellings as a category, not c/g softening.",
  "Years 1-2 (direct, below Y3): Y1 revision 'all letters of the alphabet and the sounds which they most commonly represent'; Y1 'Using k for the /k/ sound'; Y2 'The /s/ sound spelt c before e, i and y' and '/dʒ/ ... sometimes spelt as g elsewhere in words before e, i and y' (Appendix 1 pp.2, 6, 7)",
  NM, ["ccss-l3","uk-app1"]),
"u3": S("u3","short/long vowels; magic e (split digraphs)",
  "Grade 3 (partial): "+L32F+" ('syllable patterns'); vowel-consonant-e is not named.",
  "Year 1 (direct, below Y3): vowel digraphs incl. split digraphs a-e, e-e, i-e, o-e, u-e (Appendix 1 p.4)",
  NM, ["ccss-l3","uk-app1"]),
"u4": S("u4","syllables",
  "Grade 3 (direct): "+L32F+" ('syllable patterns'); RF.3.3c 'Decode multisyllable words.'",
  "Year 1 (direct, below Y3): statutory 'Division of words into syllables' - 'Each syllable is like a beat in the spoken word' (Appendix 1 p.2)",
  NM, ["ccss-l3","ccss-rf","uk-app1"]),
"u5": S("u5","segmenting sounds into letters",
  NM+": segmenting is K-2 foundational material; L.3-8.2 does not restate it",
  "Years 1-2 (direct, below Y3): Y1 revision 'the process of segmenting spoken words into sounds before choosing graphemes to represent the sounds', 'words with adjacent consonants' (Appendix 1 p.2); Y2 'segmenting spoken words into phonemes and representing these by graphemes' (KS1-2 p.19)",
  NM, ["uk-app1","uk-ks12"]),
"u6": S("u6","consonant digraphs sh ch th wh ph ck ng",
  "Grade 3 (partial): "+L32F+" ('position-based spellings', e.g. ck after a short vowel); digraphs not named.",
  "Year 1 (direct, below Y3): revision of 'consonant digraphs'; 'The sounds /f/, /l/, /s/, /z/ and /k/ spelt ff, ll, ss, zz and ck'; 'The /ŋ/ sound spelt n before k'; 'New consonant spellings ph and wh' (Appendix 1 pp.2, 6)",
  NM, ["ccss-l3","uk-app1"]),
"u7": S("u7","vowel teams ai/ay, ee/ea, oa/ow, oi/oy, au/aw",
  "Grade 3 (partial): "+L32F+" ('position-based spellings'); vowel teams not named.",
  "Year 1 (direct, below Y3): 'Vowel digraphs and trigraphs' table - ai, oi, ay, oy, ee, ea, oa, ow, au, aw etc.; 'ay and oy are used for those sounds at the end of words' (Appendix 1 pp.4-5)",
  NM, ["ccss-l3","uk-app1"]),
"u8": S("u8","blends; silent letters kn wr mb",
  NM+": CCSS L.3-8 does not name blends or silent letters",
  "Years 1, 2, 5-6 (direct): Y1 'words with adjacent consonants'; Y2 'The /n/ sound spelt kn and (less often) gn at the beginning of words', 'The /r/ sound spelt wr'; Y5-6 'Words with silent letters' (examples include lamb, knight, island) (Appendix 1 pp.2, 7, 20). 'island' is on the Y3-4 statutory list.",
  NM, ["uk-app1"]),
"u9": S("u9","word stress",
  NM+": stress is not named in L.3-8.2/L.3-8.4",
  "Year 1 guidance (partial, non-statutory): 'Words of more than one syllable often have an unstressed syllable in which the vowel sound is unclear' (p.2); stress also governs the Y3-4 and Y5-6 doubling rules (pp.11, 19)",
  NM, ["uk-app1"]),
"u10": S("u10","schwa in unstressed syllables",
  NM+": schwa is not named in L.3-8.2/L.3-8.4",
  "Years 1-6 (partial, non-statutory guidance/notes): Y1 unclear vowel in unstressed syllable (p.2); Y3-4 notes 'opposite is related to oppose, so the schwa sound in opposite is spelt as o' (p.17); Y5-6 notes on familiar/family (p.24)",
  NM, ["uk-app1"]),
"u11": S("u11","asking for definition, origin, part of speech, sentence, pronunciation",
  "Grades 4-6 (direct for meaning, pronunciation, part of speech; origin not named): L.4.4c/L.5.4c 'Consult reference materials ... to find the pronunciation and determine or clarify the precise meaning of key words and phrases'; L.6.4c adds 'or its part of speech'",
  "Years 3-6 (partial): Y3-4 'use the first two or three letters of a word to check its spelling in a dictionary' (KS1-2 p.27); Y5-6 'use dictionaries to check the spelling and meaning of words' (p.36); Upper KS2 overview: 'If the pronunciation sounds unfamiliar, they should ask for help in determining both the meaning of the word and how to pronounce it correctly' (p.31)",
  "Class IX (partial): 'understand meanings of unfamiliar words through context and reference tools such as dictionaries' (p.6)",
  ["ccss-l4","ccss-l5","ccss-l6","uk-ks12","cbse-ix"]),
# ---------------- Act II · The Great Library ----------------
"u12": S("u12","silent initial kn-/gn-/wr- (Old English)",
  NM+": CCSS L.3-8 does not name silent letters",
  "Years 2 and 5-6 (direct): Y2 'The /n/ sound spelt kn and (less often) gn at the beginning of words' (guidance: 'The k and g at the beginning of these words was sounded hundreds of years ago'), 'The /r/ sound spelt wr at the beginning of words'; Y5-6 'Words with silent letters' (Appendix 1 pp.7, 20)",
  NM, ["uk-app1"]),
"u13": S("u13","silent -gh-",
  NM+": CCSS L.3-8 does not name silent letters",
  "Years 5-6 (direct): 'Words with silent letters' (guidance: in knight 'the gh used to represent the sound that ch now represents in the Scottish word loch') and 'Words containing the letter-string ough' (Appendix 1 p.20). Stop words naughty, though, thought, through are on the Y3-4 statutory list.",
  NM, ["uk-app1"]),
"u14": S("u14","ie/ei rule and exceptions",
  "Grade 3 (partial): "+L32F+" ('generalizations'); ie/ei not named.",
  "Years 3-6 (direct): Y3-4 'Words with the /eɪ/ sound spelt ei, eigh, or ey' (vein, weigh, eight, neighbour); Y5-6 'Words with the /i:/ sound spelt ei after c' (guidance: 'The i before e except after c rule ...'; exceptions protein, caffeine, seize) (Appendix 1 pp.14, 20). Statutory-list words: believe, height, reign (Y3-4); achieve, foreign, leisure (Y5-6).",
  NM, ["ccss-l3","uk-app1"]),
"u15": S("u15","doubling a final consonant before a vowel suffix",
  "Grade 3 (direct): L.3.2e 'Use conventional spelling ... for adding suffixes to base words (e.g., sitting, smiled, cries, happiness)'; L.3.2f 'ending rules'",
  "Years 2-6 (direct): Y2 doubling for one-syllable words (p.8); Y3-4 'Adding suffixes beginning with vowel letters to words of more than one syllable' (forgetting, beginning, preferred) (p.11); Y5-6 '... to words ending in -fer' (referring, preferred) (p.19). Statutory-list words: occasion (Y3-4); accommodate, committee, embarrass, necessary, recommend (Y5-6).",
  NM, ["ccss-l3","uk-app1"]),
"u16": S("u16","soft c before e/i/y; Latin sc",
  "Grade 3 (partial): "+L32F+" ('position-based spellings')",
  "Years 2-4 (direct): Y2 'The /s/ sound spelt c before e, i and y'; Y3-4 'Words with the /s/ sound spelt sc (Latin in origin)' - the stop's -escent words are sc words (Appendix 1 pp.7, 14)",
  NM, ["ccss-l3","uk-app1"]),
"u17": S("u17","ph = /f/ as a Greek signal",
  "Grade 3 (partial): "+L32F+" Greek origin as a spelling signal is not in CCSS; L.4.4b's ph-examples (telegraph, photograph) concern meaning, not spelling.",
  "Year 1 (partial, below Y3): 'New consonant spellings ph and wh' (dolphin, alphabet, phonics, elephant) (p.6); Appendix 1 does not tie ph to Greek origin",
  NM, ["ccss-l3","ccss-l4","uk-app1"]),
"u18": S("u18","qu; -que",
  NM+": CCSS L.3-8 does not name qu/-que",
  "Years 3-4 (partial): 'Words ending with the /g/ sound spelt -gue and the /k/ sound spelt -que (French in origin)' - antique and unique are both Appendix examples and stop words (p.14); the q-always-u rule itself is not stated",
  NM, ["uk-app1"]),
"u19": S("u19","y as a vowel in Greek words",
  "Grade 3 (partial): "+L32F,
  "Years 3-4 (direct): 'The /ɪ/ sound spelt y elsewhere than at the end of words' (myth, gym, Egypt, pyramid, mystery) (p.11); stop words rhythm, symbol are on the Y5-6 statutory list",
  NM, ["ccss-l3","uk-app1"]),
"u20": S("u20","-ough (six pronunciations)",
  "Grade 3 (partial): "+L32F,
  "Years 5-6 (direct): 'Words containing the letter-string ough' - 'ough is one of the trickiest spellings in English' (p.20). Statutory-list words: although/though, enough, thought, through (Y3-4); thorough (Y5-6).",
  NM, ["ccss-l3","uk-app1"]),
"u21": S("u21","homophones",
  "Grade 4 (direct; L.1 strand, outside L.2/L.4): L.4.1g 'Correctly use frequently confused words (e.g., to, too, two; there, their).'",
  "Years 3-6 (direct): Y3-4 'Homophones and near-homophones' (accept/except, affect/effect); Y5-6 'Homophones and other words that are often confused' - guidance pairs include principal/principle, compliment/complement, stationary/stationery, affect/effect, all stop words (Appendix 1 pp.15, 21-22)",
  NM, ["ccss-l4","uk-app1"]),
"u22": S("u22","contronyms (one word, opposite meanings)",
  "Grades 4-8 (partial): the L.x.4 stem 'Determine or clarify the meaning of unknown and multiple-meaning words and phrases ...' with L.x.4a context clues; contronyms are not named",
  NM, NM, ["ccss-l4"]),
"u23": S("u23","eponyms",
  NM+": no CCSS L.2/L.4 statement on words from names (L.7.5a 'mythological allusions' concerns figures of speech, not word origins)",
  NM, NM, []),
# ---------------- Act III · The Roman Forum ----------------
"u24": S("u24","in-/im-/il-/ir- (not), assimilation",
  "Grades 3-8 (direct for meaning; assimilation not named): L.3.4b 'Determine the meaning of the new word formed when a known affix is added to a known word'; "+LXB,
  "Years 3-4 (direct): 'More prefixes' guidance: 'The prefix in- can mean both not and in/into'; 'Before a root word starting with l, in- becomes il'; 'm or p, in- becomes im-'; 'r, in- becomes ir-' (Appendix 1 pp.11-12)",
  NM, ["ccss-l3","ccss-l4","uk-app1"]),
"u25": S("u25","un-",
  "Grade 3 (direct): L.3.4b, example comfortable/uncomfortable",
  "Year 1 (direct, below Y3): statutory 'Adding the prefix -un' (Appendix 1 p.6; KS1-2 p.12 'using the prefix un-')",
  NM, ["ccss-l3","uk-app1","uk-ks12"]),
"u26": S("u26","dis- (double s before s)",
  "Grade 3 (direct): L.3.4b, example agreeable/disagreeable",
  "Years 3-4 (direct): 'Like un-, the prefixes dis- and mis- have negative meanings' (disappoint, disagree, disobey) (p.11); 'disappear' is on the Y3-4 statutory list",
  NM, ["ccss-l3","uk-app1"]),
"u27": S("u27","de-", "Grades 4-8 (partial): "+LXB+"; de- not named", "Years 3-6 (partial): "+UK_PREF+"; de- not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u28": S("u28","ex-/e-/ef-", "Grades 4-8 (partial): "+LXB+"; ex- not named", "Years 3-6 (partial): "+UK_PREF+"; ex- not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u29": S("u29","re-", "Grades 4-8 (partial): "+LXB+"; re- not named",
  "Years 3-4 (direct): 're- means again or back' (redo, refresh, return) (p.12)", NM, ["ccss-l4","uk-app1"]),
"u30": S("u30","pre-/pro-",
  "Grades 3 and 8 (direct): L.3.4b example heat/preheat; L.8.4b example 'precede, recede, secede' (precede is a stop word)",
  "Years 3-6 (partial): "+UK_PREF+"; pre-/pro- not named", NM, ["ccss-l3","ccss-l8","uk-app1","uk-ks12"]),
"u31": S("u31","sub-/sur-/super-/supra-", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 3-4 (direct): 'sub- means under'; 'super- means above' (p.12)", NM, ["ccss-l4","uk-app1"]),
"u32": S("u32","com-/con-/col-/cor-/co-", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 5-6 (partial): 'Use of the hyphen' (co-ordinate, co-operate) (p.19); non-statutory notes: 'conscience is simply science with the prefix con- added' (p.24)", NM, ["ccss-l4","uk-app1"]),
"u33": S("u33","mal-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 3-6 (partial): "+UK_PREF+"; mal- not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u34": S("u34","mis-", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 3-4 (direct): dis- and mis- 'have negative meanings' (misbehave, mislead, misspell (mis + spell)) (p.11)", NM, ["ccss-l4","uk-app1"]),
"u35": S("u35","inter-/intra-", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 3-4 (direct for inter-): 'inter- means between or among' (p.12); intra- not named", NM, ["ccss-l4","uk-app1"]),
"u36": S("u36","trans-/per-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 3-6 (partial): "+UK_PREF+"; not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u37": S("u37","ab-/abs-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 3-6 (partial): "+UK_PREF+"; not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u38": S("u38","ad- (assimilation)", "Grades 4-8 (partial): "+LXB+"; not named", "Years 3-6 (partial): "+UK_PREF+"; not named", NM, ["ccss-l4","uk-app1","uk-ks12"]),
"u39": S("u39","-tion/-sion/-cion",
  "Grade 3 (partial): RF.3.3b 'Decode words with common Latin suffixes' (reading); L.3.2e adding suffixes to base words; choosing -tion vs -sion is not named",
  "Years 2-4 (direct): Y2 'Words ending in -tion' (p.9); Y3-4 'The suffix -ation', 'Endings which sound like /ʒən/' (-sion), 'Endings which sound like /ʃən/, spelt -tion, -sion, -ssion, -cian' (pp.12-14)",
  NM, ["ccss-l3","ccss-rf","uk-app1"]),
"u40": S("u40","-ous/-ious/-eous/-uous",
  "Grades 4-8 (partial): "+LXB+"; RF.3.3b Latin suffixes (reading)",
  "Years 3-6 (direct): Y3-4 'The suffix -ous' (guidance covers -ious and -eous: serious, hideous, courageous) (p.13); Y5-6 'Endings which sound like /ʃəs/ spelt -cious or -tious' (p.18). 'mischievous' is on the Y5-6 statutory list.",
  NM, ["ccss-l4","ccss-rf","uk-app1"]),
"u41": S("u41","-able/-ible",
  "Grade 3 (partial): L.3.4b examples agreeable, comfortable (affix meaning, not the -able/-ible choice)",
  "Years 5-6 (direct): 'Words ending in -able and -ible', 'Words ending in -ably and -ibly' (p.19)", NM, ["ccss-l3","uk-app1"]),
"u42": S("u42","-ance/-ence/-ancy/-ency",
  "Grades 4-8 (partial): "+LXB,
  "Years 5-6 (direct): 'Words ending in -ant, -ance/-ancy, -ent, -ence/-ency' (p.18); 'conscience' is on the Y5-6 statutory list",
  NM, ["ccss-l4","uk-app1"]),
"u43": S("u43","-ity/-ness/-hood/-ship/-dom",
  "Grade 3 (partial): L.3.2e example happiness (adding suffixes to base words)",
  "Year 2 (partial, below Y3): 'The suffixes -ment, -ness, -ful, -less and -ly' (p.9) - -ness only", NM, ["ccss-l3","uk-app1"]),
"u44": S("u44","agent suffixes -er/-or/-ist/-ian/-eur/-eer",
  "Grades 4-8 (partial): "+LXB+"; agent suffixes not named",
  "Years 3-4 (partial): '-cian is used if the root word ends in c or cs' (musician, electrician) (p.14); 'amateur' is on the Y5-6 statutory list",
  NM, ["ccss-l4","uk-app1"]),
# ---------------- Act IV · The Storm of Elements ----------------
"u45": S("u45","anti-/hyper-/hypo-", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 3-4 (direct for anti-): 'anti- means against' (antiseptic, anti-clockwise, antisocial) (p.12); hyper-/hypo- not named", NM, ["ccss-l4","uk-app1"]),
"u46": S("u46","auto-/tele-/micro-/macro-/mega-",
  "Grade 4 (direct): "+L44B+" (telegraph is a stop word)",
  "Years 3-4 (direct for auto-): 'auto- means self or own' (autobiography, autograph) (p.12)", NM, ["ccss-l4","uk-app1"]),
"u47": S("u47","bio-/geo-/photo-/hydro-/thermo-",
  "Grades 4-5 (direct): L.4.4b example photograph; L.5.4b 'Use common, grade-appropriate Greek and Latin affixes and roots as clues to the meaning of a word (e.g., photograph, photosynthesis)' (photosynthesis is a stop word)",
  "Years 5-6 (partial): "+UK_MORPH+"; none of these prefixes named", NM, ["ccss-l4","ccss-l5","uk-ks12"]),
"u48": S("u48","Greek body prefixes neuro-/cardio-/osteo-/psycho-/derm-/hem-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH, NM, ["ccss-l6","uk-ks12"]),
"u49": S("u49","meta-/para-/epi-/syn-/peri-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH+"; 'symbol' is on the Y5-6 statutory list", NM, ["ccss-l6","uk-ks12","uk-app1"]),
"u50": S("u50","Latin and Greek number prefixes", "Grades 4-8 (partial): "+LXB+"; not named",
  "Years 3-4 (partial): 'bicycle' is on the Y3-4 statutory list; non-statutory notes: 'bicycle is cycle (from the Greek for wheel) with bi- (meaning two) before it' (p.17)", NM, ["ccss-l4","uk-app1"]),
"u51": S("u51","poly-/multi-/omni-/pan-", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH, NM, ["ccss-l6","uk-ks12"]),
"u52": S("u52","-ism/-ist", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH, NM, ["ccss-l6","uk-ks12"]),
"u53": S("u53","-ology/-ologist/-ographer", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH, NM, ["ccss-l6","uk-ks12"]),
"u54": S("u54","medical suffixes -itis/-osis/-ectomy/-plasty/-scope/-meter", "Grades 4-8 (partial): "+LXB+"; not named", "Years 5-6 (partial): "+UK_MORPH, NM, ["ccss-l6","uk-ks12"]),
}

# ---------------- Act V · The Root Kingdoms ----------------
ROOT_GENERIC_US = "Grades 4-8 (partial): "+LXB+"; L.3.4c 'Use a known root word as a clue to the meaning of an unknown word with the same root (e.g., company, companion)'; this root is not named"
ROOT_GENERIC_UK = "Years 3-6 (partial): "+UK_MORPH+"; Appendix 1 lists no Greek/Latin roots"
for u, c in [("u56","Greek phon/phone"),("u57","Greek path/pathy"),("u59","Greek morph"),("u60","Greek scop/scope"),
             ("u61","Greek log/logy"),("u62","Greek phil/phile"),("u63","Greek gen/genesis"),("u64","Greek dem/demo"),
             ("u66","Latin dict/dic"),("u67","Latin duc/duct"),("u68","Latin fer"),("u69","Latin scrib/script"),
             ("u70","Latin port"),("u71","Latin miss/mit"),("u72","Latin vert/vers"),("u73","Latin spec/spect/spic"),
             ("u74","Latin ten/tain/tent"),("u75","Latin cred")]:
    STOPS[u] = S(u, c+" (root)", ROOT_GENERIC_US, ROOT_GENERIC_UK, NM, ["ccss-l3","ccss-l4","uk-ks12"])
STOPS["u72"]["uk"] += "; 'controversy' is on the Y5-6 statutory list"
STOPS["u55"] = S("u55","Greek graph/gram (root)",
  "Grades 4-5 (direct): "+L44B+" (telegraph is a stop word); L.5.4b example photograph",
  "Years 3-6 (partial): "+UK_MORPH+"; Y3-4 auto- guidance example 'autograph' (p.12)", NM, ["ccss-l4","ccss-l5","uk-ks12","uk-app1"])
STOPS["u58"] = S("u58","Greek chron (root)", ROOT_GENERIC_US,
  "Years 3-4 (partial): 'Words with the /k/ sound spelt ch (Greek in origin)' (scheme, chorus, chemist, echo, character) (p.14) - the spelling signal of chron-, not its meaning", NM, ["ccss-l4","uk-app1"])
STOPS["u65"] = S("u65","Latin aud (hear) (root)",
  "Grade 6 (direct): L.6.4b 'Use common, grade-appropriate Greek or Latin affixes and roots as clues to the meaning of a word (e.g., audience, auditory, audible)' - audible and audience are stop words",
  ROOT_GENERIC_UK, NM, ["ccss-l6","uk-ks12"])

# ---------------- Act VI · The Wide Strait ----------------
US_LOAN = NM+": CCSS L.3-8 has no language-of-origin spelling standard (only generic 'Spell correctly', L.6.2b/L.7.2b/L.8.2c)"
for u, c in [("u76","French -eau/-eaux"),("u77","French -oir/-oire"),("u78","French -ette"),("u82","Italian double consonants"),
             ("u83","Italian music & art terms"),("u84","Arabic loanwords (al-)"),("u85","Spanish loanwords"),("u86","Japanese loanwords"),
             ("u87","German loanwords"),("u89","Norse loanwords"),("u90","Celtic & Gaelic loanwords")]:
    STOPS[u] = S(u, c, US_LOAN, NM+": Appendix 1 does not mention this pattern or language", NM, [])
STOPS["u88"] = S("u88","Sanskrit & Hindi loanwords", US_LOAN, NM,
  NM+" (closest, not a match: Language R1 competency C-4.4, 'Demonstrates a basic knowledge of the commonalities among some of the major Indian languages, such as their common phonetic and scientifically arranged alphabets and scripts, common grammatical structures, origins and' [page break] 'sources of vocabularies from Sanskrit and other classical languages' (pp.3-4), concerns Indian languages, not English loanwords)", ["cbse-ix"])
STOPS["u79"] = S("u79","French -esque/-ique/-que", US_LOAN,
  "Years 3-4 (direct for -que): 'Words ending with the /g/ sound spelt -gue and the /k/ sound spelt -que (French in origin)' (league, tongue, antique, unique) - antique and unique are stop words (p.14); -esque not named",
  NM, ["uk-app1"])
STOPS["u80"] = S("u80","French silent final letters", US_LOAN,
  "Years 3-4 (partial): 'Words with the /ʃ/ sound spelt ch (mostly French in origin)' (chef, chalet, machine, brochure) fits crochet, ricochet (p.14); silent final consonants are not named",
  NM, ["uk-app1"])
STOPS["u81"] = S("u81","French agent -eur", US_LOAN,
  "Years 5-6 (partial): 'amateur' is on the Y5-6 statutory list (p.23); the -eur pattern itself is not named", NM, ["uk-app1"])

# ---------------- Act VII · The Trickster Junkyard ----------------
STOPS["u91"] = S("u91","homophones (basic)",
  "Grade 4 (direct; L.1 strand): L.4.1g 'Correctly use frequently confused words (e.g., to, too, two; there, their).'",
  "Years 2-4 (direct): Y2 'Homophones and near-homophones' - 'It is important to know the difference in meaning between homophones' (sun/son, night/knight) (p.10); Y3-4 'Homophones and near-homophones'; Y3-4 PoS 'spell further homophones' (KS1-2 p.27)",
  NM, ["ccss-l4","uk-app1","uk-ks12"])
STOPS["u92"] = S("u92","advanced confusable pairs",
  "Grade 4 (partial; L.1 strand): L.4.1g 'frequently confused words' - grade-4 examples are basic",
  "Years 5-6 (direct): 'Homophones and other words that are often confused'; Y5-6 PoS 'continue to distinguish between homophones and other words which are often confused' (Appendix 1 pp.21-22; KS1-2 p.36)",
  NM, ["ccss-l4","uk-app1","uk-ks12"])
STOPS["u93"] = S("u93","eponyms", NM, NM, NM, [])
STOPS["u94"] = S("u94","variant pronunciations of one spelling",
  "Grades 4-5 (partial): L.4.4c/L.5.4c consult reference materials 'to find the pronunciation'; variant pronunciations are not named",
  NM, NM, ["ccss-l4","ccss-l5"])
STOPS["u95"] = S("u95","accent marks in loanwords", NM, NM, NM, [])
STOPS["u96"] = S("u96","sneaky families: silent starters, -able/-ible, unheard doubles",
  "Grade 3 (partial): "+L32F,
  "Years 3-6 (partial): Y5-6 'Words with silent letters' and 'Words ending in -able and -ible' (pp.19-20); suffix doubling rules (Y3-4 p.11, Y5-6 p.19); 'occur' is on the Y5-6 statutory list",
  NM, ["ccss-l3","uk-app1"])

# ---------------- Act VIII · The Subject Sprints ----------------
L66 = "L.6.6-L.8.6 'Acquire and use accurately grade-appropriate general academic and domain-specific words and phrases' (L.6 strand, outside the requested L.2/L.4)"
for u, c in [("u97","medical body-system vocabulary"),("u99","fine arts & music vocabulary"),("u100","culinary vocabulary"),
             ("u101","geography & place words"),("u102","law & government vocabulary"),("u104","time words"),
             ("u105","size & quantity words"),("u106","knowledge & learning words"),("u109","colour, light & perception words"),
             ("u110","sound, music & language-theory words"),("u111","architecture vocabulary"),("u112","flora & fauna vocabulary"),
             ("u113","philosophical & religious vocabulary")]:
    STOPS[u] = S(u, c, "Grades 6-8 (partial): "+L66+"; "+LXB,
                 "KS3, Years 7-9 (partial): "+UK_KS3_VOC+"; Upper KS2 overview: 'there will continue to be a need for pupils to learn subject-specific vocabulary' (KS1-2 p.31)",
                 CB_VOC, ["ccss-l6","uk-ks3","uk-ks12","cbse-ix"])
STOPS["u98"] = S("u98","natural science vocabulary",
  "Grade 5 (direct): L.5.4b example 'photograph, photosynthesis' (photosynthesis is a stop word)",
  "KS3, Years 7-9 (partial): "+UK_KS3_VOC, CB_VOC, ["ccss-l5","uk-ks3","cbse-ix"])
STOPS["u103"] = S("u103","words from Greek & Roman mythology",
  "Grade 7 (partial; L.5 strand): L.7.5a 'Interpret figures of speech (e.g., literary, biblical, and mythological allusions) in context' - meaning, not spelling",
  "KS3, Years 7-9 (partial): "+UK_KS3_VOC, CB_VOC, ["ccss-l7","uk-ks3","cbse-ix"])
STOPS["u107"] = S("u107","movement & direction words (cede, ven, fer, vert)",
  "Grade 8 (direct): L.8.4b 'Use common, grade-appropriate Greek or Latin affixes and roots as clues to the meaning of a word (e.g., precede, recede, secede)' - all three are stop words",
  "KS3, Years 7-9 (partial): "+UK_KS3_VOC, CB_VOC, ["ccss-l8","uk-ks3","cbse-ix"])
STOPS["u108"] = S("u108","literary & poetic devices",
  "Grade 8 (partial; L.5 strand): L.8.5a 'Interpret figures of speech (e.g. verbal irony, puns) in context'",
  "KS3, Years 7-9 (direct): Writing 'drawing on knowledge of literary and rhetorical devices from their reading and listening to enhance the impact of their writing' (p.5); Reading 'recognising a range of poetic conventions and understanding how these have been used' (p.4); 'discussing reading, writing and spoken language with precise and confident use of linguistic and literary terminology' (p.6)",
  CB_VOC, ["ccss-l8","uk-ks3","cbse-ix"])

# ---------------- Act IX · The Big Stage ----------------
STAGE_US = "Grades 6-8 (partial): "+LXB.replace("L.4.4b","L.6.4b")+"; L.6.5c-L.8.5c 'Distinguish among the connotations (associations) of words with similar denotations (definitions)' (L.5 strand)"
STAGE_UK = "KS3, Years 7-9 (partial): "+UK_KS3_VOC+"; KS3 overview: 'Teachers should show pupils how to understand the relationships between words, how to understand nuances in meaning' (p.3); Y5-6 "+UK_MORPH.split('; ')[0]
for u, c in [("u114","ego/auto/alter (self)"),("u115","loqu/phon/verb (speaking)"),("u116","ver/mendax/cred/pseudo (honesty)"),
             ("u117","four humours (emotion words)"),("u118","sap/sophos/stult (wisdom)"),("u120","ben/mal/clem (kindness)"),
             ("u121","greg/anthrop/soci/mis (social)"),("u123","personality: talkers, thinkers, liars")]:
    STOPS[u] = S(u, c, STAGE_US, STAGE_UK, CB_VOC, ["ccss-l6","ccss-l7","ccss-l8","uk-ks3","uk-ks12","cbse-ix"])
STOPS["u119"] = S("u119","aud(ere)/fort/tim/phob (courage & fear)",
  STAGE_US+". Note: L.6.4b's aud- examples (audience, auditory, audible) are from audire 'hear'; this stop's audacious is from audere 'dare', so it is not the same root.",
  STAGE_UK, CB_VOC, ["ccss-l6","ccss-l7","ccss-l8","uk-ks3","uk-ks12","cbse-ix"])
STOPS["u122"] = S("u122","rhetorical terms for deception",
  "Grades 7-8 (partial; L.5 strand): L.7.5a figures of speech incl. allusions; L.8.5a 'verbal irony, puns'",
  "KS3, Years 7-9 (direct): Writing 'drawing on knowledge of literary and rhetorical devices from their reading and listening' (p.5); 'precise and confident use of linguistic and literary terminology' (p.6)",
  CB_VOC, ["ccss-l7","ccss-l8","uk-ks3","cbse-ix"])
STOPS["u124"] = S("u124","schwa and unstressed vowels in common hard words",
  "Grades 4-5 (partial): L.4.2d/L.5.2e 'Spell grade-appropriate words correctly, consulting references as needed'; schwa not named",
  "Years 3-6 (direct by word list): 14 of the stop's 15 words are on the statutory lists - Y3-4: February, library, separate; Y5-6: category, competition, definite, environment, explanation, government, necessary, privilege, relevant, restaurant, temperature (Appendix 1 pp.16, 23)",
  CB_NM, ["ccss-l4","ccss-l5","uk-app1"])
STOPS["u125"] = S("u125","the 44 phonemes, sound-to-spelling mapping",
  "Grade 3 (partial): "+L32F,
  "Years 1-6 (partial): Y1 spell: 'words containing each of the 40+ phonemes already taught' (KS1-2 p.12); 7 of 16 stop words on statutory lists - Y3-4: enough, separate, special; Y5-6: definite, environment, necessary, privilege",
  CB_NM, ["ccss-l3","uk-ks12","uk-app1"])
STOPS["u126"] = S("u126","championship words (mixed patterns)",
  NM+" beyond generic 'Spell correctly' (L.6.2b/L.7.2b/L.8.2c)", NM, CB_NM, ["ccss-l6"])
STOPS["u127"] = S("u127","generosity & miserliness words",
  "Grade 6 (partial; L.5 strand): L.6.5c 'Distinguish among the connotations (associations) of words with similar denotations (definitions) (e.g., stingy, scrimping, economical, unwasteful, thrifty)' - the same semantic field as parsimonious, penurious",
  STAGE_UK, CB_VOC, ["ccss-l6","uk-ks3","cbse-ix"])
STOPS["u128"] = S("u128","rare-language loanwords", US_LOAN, NM, CB_NM, [])

REGIONS = {
 "meadow": dict(
   concepts=["oral spelling routine","letter sounds, hard/soft c and g","short/long vowels and magic e","syllables","segmenting","consonant digraphs","vowel teams","blends and silent letters","stress","schwa","asking for definition/origin/part of speech"],
   us=dict(grade="Grade 3", standards=["L.3.2f","RF.3.3c","L.4.4c","L.5.4c","L.6.4c"], sources=["ccss-l3","ccss-rf","ccss-l4","ccss-l5","ccss-l6"], strength="partial",
     why="L.3.2f: 'Use spelling patterns and generalizations (e.g., word families, position-based spellings, syllable patterns, ending rules, meaningful word parts) in writing words.' Most Meadow phonics (digraphs, vowel teams, segmenting) is K-2 material the L.3-8 strand does not restate; the Ask-the-Right-Questions stop (u11) fits L.4.4c-L.6.4c (reference materials for pronunciation, meaning, part of speech)."),
   uk=dict(year="Years 1-2", statements=["Y1 revision: all letters of the alphabet and the sounds which they most commonly represent; consonant digraphs; vowel digraphs; the process of segmenting spoken words into sounds; words with adjacent consonants","Y1: Division of words into syllables","Y1: Vowel digraphs and trigraphs (incl. a-e, i-e, o-e, u-e)","Y1: New consonant spellings ph and wh","Y2: The /s/ sound spelt c before e, i and y","Y2: The /n/ sound spelt kn and (less often) gn; the /r/ sound spelt wr","Y5-6: Words with silent letters"], sources=["uk-app1","uk-ks12"], strength="direct (below the requested Y3-9 band)",
     why="Appendix 1 places the Meadow's phonics content in Year 1 and Year 2, which is below the 8-15 age band; only the silent-letters stop (Y5-6) and the dictionary stop (Y3-6) reach Key Stage 2."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped",
     why="The CBSE Class IX English curriculum states no phonics or spelling expectation. One stop (u11, asking for meaning) partially matches its dictionary statement. No CBSE Class 3-8 English curriculum document was fetched.")),
 "library": dict(
   concepts=["silent kn/gn/wr","silent gh","ie/ei","doubling before suffixes","soft c / Latin sc","ph (Greek)","qu/-que","y as a vowel","-ough","homophones","contronyms","eponyms"],
   us=dict(grade="Grades 3-4", standards=["L.3.2e","L.3.2f","L.4.1g","L.4.2d"], sources=["ccss-l3","ccss-l4"], strength="partial",
     why="L.3.2e 'Use conventional spelling ... for adding suffixes to base words' and L.3.2f 'spelling patterns and generalizations' are the CCSS's only pattern-level spelling statements; L.4.1g 'Correctly use frequently confused words' covers homophones. CCSS does not name silent letters, ie/ei, -ough or language-of-origin signals."),
   uk=dict(year="Years 3-6", statements=["Y3-4: Adding suffixes beginning with vowel letters to words of more than one syllable","Y3-4: The /ɪ/ sound spelt y elsewhere than at the end of words","Y3-4: Words with the /s/ sound spelt sc (Latin in origin)","Y3-4: Words with the /eɪ/ sound spelt ei, eigh, or ey","Y3-4: -gue/-que (French in origin)","Y3-4: Homophones and near-homophones","Y5-6: Words with the /i:/ sound spelt ei after c","Y5-6: Words containing the letter-string ough","Y5-6: Words with silent letters","Y5-6: Adding suffixes beginning with vowel letters to words ending in -fer","Y5-6: Homophones and other words that are often confused"], sources=["uk-app1"], strength="direct",
     why="Appendix 1's Y3-4 and Y5-6 statutory headings name almost every Library rule outright (ie/ei after c, ough, silent letters, y as /ɪ/, sc, doubling, homophones); kn/gn/wr and soft c sit in Year 2. Contronyms and eponyms are not in Appendix 1."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped", why="The CBSE Class IX English curriculum states no spelling-rule expectation.")),
 "forum": dict(
   concepts=["Latin prefixes and assimilation (in-, un-, dis-, de-, ex-, re-, pre-/pro-, sub-/super-, com-, mal-, mis-, inter-/intra-, trans-/per-, ab-, ad-)","Latin and other suffixes (-tion/-sion, -ous, -able/-ible, -ance/-ence, -ity/-ness, agent suffixes)"],
   us=dict(grade="Grades 3-8", standards=["L.3.2e","L.3.4b","RF.3.3a","RF.3.3b","L.4.4b","L.5.4b","L.6.4b","L.7.4b","L.8.4b"], sources=["ccss-l3","ccss-rf","ccss-l4","ccss-l5","ccss-l6","ccss-l7","ccss-l8"], strength="direct for affix meaning; partial for spelling choices",
     why="L.3.4b 'Determine the meaning of the new word formed when a known affix is added to a known word' starts the strand; L.4.4b-L.5.4b ('Use common, grade-appropriate Greek and Latin affixes and roots as clues to the meaning of a word') and L.6.4b-L.8.4b (the same with 'Greek or Latin') repeat the expectation at every grade without assigning particular affixes to grades (except examples, e.g. L.8.4b precede, recede, secede)."),
   uk=dict(year="Years 3-6", statements=["Y3-4: More prefixes (guidance: dis-, mis-, in-/il-/im-/ir-, re-, sub-, inter-, super-, anti-, auto-)","Y3-4: The suffix -ation; The suffix -ous; Endings which sound like /ʃən/, spelt -tion, -sion, -ssion, -cian","Y5-6: Endings which sound like /ʃəs/ spelt -cious or -tious; /ʃəl/","Y5-6: Words ending in -ant, -ance/-ancy, -ent, -ence/-ency","Y5-6: Words ending in -able and -ible; -ably and -ibly","Y5-6 PoS: use further prefixes and suffixes and understand the guidance for adding them"], sources=["uk-app1","uk-ks12"], strength="direct for named prefixes/suffixes; partial for de-, ex-, pre-/pro-, mal-, trans-/per-, ab-, ad-",
     why="Appendix 1 makes 'More prefixes' (Y3-4) and the -tion/-sion, -ous, -able/-ible and -ance/-ence endings (Y3-6) statutory; the prefix list and assimilation rule for in- appear in its non-statutory guidance column."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped", why="The CBSE Class IX English curriculum does not mention prefixes, suffixes or word formation.")),
 "storm": dict(
   concepts=["Greek prefixes (anti-, hyper-, hypo-, auto-, tele-, micro-, macro-, mega-, bio-, geo-, photo-, hydro-, thermo-, body prefixes, meta-, para-, epi-, syn-, peri-)","number prefixes","poly-/multi-/omni-/pan-","Greek suffixes (-ism/-ist, -ology, medical suffixes)"],
   us=dict(grade="Grades 4-5", standards=["L.4.4b","L.5.4b","L.6.4b","L.7.4b","L.8.4b"], sources=["ccss-l4","ccss-l5","ccss-l6","ccss-l7","ccss-l8"], strength="direct (Grades 4-5); the strand continues to Grade 8",
     why="L.4.4b 'Use common, grade-appropriate Greek and Latin affixes and roots as clues to the meaning of a word (e.g., telegraph, photograph, autograph)' and L.5.4b '(e.g., photograph, photosynthesis)' - tele-, auto- and photo- are Storm prefixes, and telegraph and photosynthesis are Storm words."),
   uk=dict(year="Years 3-6", statements=["Y3-4 More prefixes guidance: anti- means against; auto- means self or own","Y5-6 PoS: use knowledge of morphology and etymology in spelling","Y3-4 statutory word list: bicycle (notes: bi- meaning two, cycle from the Greek for wheel)"], sources=["uk-app1","uk-ks12"], strength="partial",
     why="Only anti- and auto- are named (Y3-4 guidance); the other Greek prefixes and suffixes fall under the general Y5-6 requirement to 'use knowledge of morphology and etymology in spelling'."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped", why="The CBSE Class IX English curriculum does not mention Greek or Latin word parts.")),
 "roots": dict(
   concepts=["Greek roots (graph, phon, path, chron, morph, scop, log, phil, gen, dem)","Latin roots (aud, dict, duc, fer, scrib, port, miss/mit, vert, spec, ten, cred)"],
   us=dict(grade="Grades 4-8", standards=["L.3.4c","L.4.4b","L.5.4b","L.6.4b","L.7.4b","L.8.4b"], sources=["ccss-l3","ccss-l4","ccss-l5","ccss-l6","ccss-l7","ccss-l8"], strength="direct (graph at Grade 4, aud at Grade 6); partial for the other roots",
     why="L.6.4b 'Use common, grade-appropriate Greek or Latin affixes and roots as clues to the meaning of a word (e.g., audience, auditory, audible)' matches the aud stop word for word; L.4.4b's examples are graph words; L.3.4c introduces using 'a known root word as a clue'. CCSS does not assign the other roots to grades."),
   uk=dict(year="Years 3-6", statements=["Y3-4 and Y5-6 word reading: apply their growing knowledge of root words, prefixes and suffixes (etymology and morphology)","Y5-6 spelling: use knowledge of morphology and etymology in spelling","Y3-4: Words with the /k/ sound spelt ch (Greek in origin)"], sources=["uk-ks12","uk-app1"], strength="partial",
     why="The programmes of study require morphology and etymology in Years 3-6, but Appendix 1 names no Greek or Latin roots; only chron- is touched, via the Greek ch = /k/ spelling."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped", why="The CBSE Class IX English curriculum does not mention roots or etymology.")),
 "strait": dict(
   concepts=["French endings (-eau, -oir, -ette, -esque/-que, silent finals, -eur)","Italian double consonants and music terms","Arabic, Spanish, Japanese, German, Sanskrit/Hindi, Norse and Celtic loanword patterns"],
   us=dict(grade=NM, standards=[], sources=["ccss-l6"], strength="not mapped",
     why="CCSS L.3-8 has no language-of-origin spelling standard; the only applicable text is generic ('Spell correctly', L.6.2b/L.7.2b/L.8.2c)."),
   uk=dict(year="Years 3-4", statements=["Y3-4: Words with the /ʃ/ sound spelt ch (mostly French in origin)","Y3-4: Words ending with the /g/ sound spelt -gue and the /k/ sound spelt -que (French in origin)","Y5-6 statutory word list: amateur"], sources=["uk-app1"], strength="partial (French -que and ch only)",
     why="Appendix 1 names two French patterns in Years 3-4 (antique and unique are both its examples and Strait words); it does not mention -eau, -oir, -ette, Italian, Arabic, Spanish, Japanese, German, Indic, Norse or Celtic patterns."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped",
     why="No English loanword expectation. Competency C-4.4 (origins of vocabularies from Sanskrit) concerns Indian languages, not English spelling, so it is not mapped.")),
 "junkyard": dict(
   concepts=["homophones (basic and advanced)","eponyms","variant pronunciations","accent marks","sneaky spelling families"],
   us=dict(grade="Grade 4", standards=["L.4.1g","L.4.4c","L.5.4c"], sources=["ccss-l4","ccss-l5"], strength="partial",
     why="L.4.1g 'Correctly use frequently confused words (e.g., to, too, two; there, their)' (L.1 strand, outside the requested L.2/L.4) covers the twin stops; L.4.4c/L.5.4c 'find the pronunciation' touches two-way words. Eponyms and accent marks are not in CCSS."),
   uk=dict(year="Years 3-6", statements=["Y2 and Y3-4: Homophones and near-homophones","Y5-6: Homophones and other words that are often confused","Y5-6: Words with silent letters; Words ending in -able and -ible"], sources=["uk-app1","uk-ks12"], strength="direct for homophones; partial for sneaky spellings",
     why="Homophones run through Appendix 1 from Year 2 to Year 6, with 'other words that are often confused' at Y5-6 matching the treacherous-twins stop. Eponyms, variant pronunciations and accent marks are not in Appendix 1."),
   cbse=dict(cls=NM, statements=[], sources=["cbse-ix"], strength="not mapped", why="The CBSE Class IX English curriculum does not mention homophones or spelling.")),
 "sprints": dict(
   concepts=["subject-area vocabulary (medicine, science, arts, cooking, geography, law, mythology, time, size, knowledge, movement, literary devices, light, sound, architecture, nature, philosophy)"],
   us=dict(grade="Grades 6-8", standards=["L.6.4b","L.7.4b","L.8.4b","L.5.4b","L.6.6","L.7.6","L.8.6"], sources=["ccss-l5","ccss-l6","ccss-l7","ccss-l8"], strength="direct for two stops (L.5.4b photosynthesis, L.8.4b precede/recede/secede); partial otherwise",
     why="L.8.4b's examples 'precede, recede, secede' are all words in the movement stop; L.6.6-L.8.6 'Acquire and use accurately grade-appropriate general academic and domain-specific words and phrases' (L.6 strand, outside L.2/L.4) is the CCSS home for subject vocabulary."),
   uk=dict(year="Key Stage 3 (Years 7-9)", statements=["KS3 Reading: learning new vocabulary, relating it explicitly to known vocabulary and understanding it with the help of context and dictionaries","KS3 Writing: drawing on knowledge of literary and rhetorical devices","KS3 Writing: applying the spelling patterns and rules set out in English Appendix 1","Upper KS2 overview: there will continue to be a need for pupils to learn subject-specific vocabulary"], sources=["uk-ks3","uk-ks12"], strength="partial (direct for the literary-devices stop)",
     why="KS3 sets vocabulary-learning and literary/rhetorical-device expectations but no subject word lists; the Y5-6 overview anticipates subject-specific vocabulary in Year 7."),
   cbse=dict(cls="Class IX", statements=["expand vocabulary through contextual reading and writing","understand meanings of unfamiliar words through context and reference tools such as dictionaries","use appropriate words and expressions to communicate ideas clearly","apply vocabulary effectively in speaking and writing tasks"], sources=["cbse-ix"], strength="partial (generic vocabulary only)",
     why="The Class IX 'Structures (Grammar) & Vocabulary' learning standards (p.6) are about vocabulary growth in general; they name no subject vocabulary and say nothing about spelling.")),
 "stage": dict(
   concepts=["Latin/Greek root clusters for character and personality words","rhetorical terms","schwa and unstressed vowels","44 phonemes","championship words","rare-language loanwords"],
   us=dict(grade="Grades 6-8", standards=["L.6.4b","L.7.4b","L.8.4b","L.6.5c","L.7.5c","L.8.5c","L.6.2b","L.7.2b","L.8.2c"], sources=["ccss-l6","ccss-l7","ccss-l8","ccss-l4","ccss-l5"], strength="partial",
     why="L.6.4b-L.8.4b (Greek or Latin roots as clues to meaning) and L.6.5c-L.8.5c (connotations of near-synonyms, e.g. L.6.5c 'stingy, scrimping, economical, unwasteful, thrifty') fit the root-cluster vocabulary stops; spelling itself is only 'Spell correctly' at Grades 6-8."),
   uk=dict(year="Years 5-6 and Key Stage 3 (Years 7-9)", statements=["Y3-4 and Y5-6 statutory word lists (14 of 15 schwa-stop words; 7 of 16 phoneme-stop words)","KS3 Reading: learning new vocabulary ... with the help of context and dictionaries","KS3 Writing: drawing on knowledge of literary and rhetorical devices","KS3: applying the spelling patterns and rules set out in English Appendix 1"], sources=["uk-app1","uk-ks3","uk-ks12"], strength="direct for the schwa stop (word lists) and rhetorical terms (KS3); partial otherwise",
     why="The schwa stop is almost entirely statutory Y3-6 list words; the vocabulary stops sit under KS3's vocabulary and literary/rhetorical-device statements. KS3 adds no new spelling content beyond applying Appendix 1."),
   cbse=dict(cls="Class IX", statements=["expand vocabulary through contextual reading and writing","understand meanings of unfamiliar words through context and reference tools such as dictionaries","apply vocabulary effectively in speaking and writing tasks"], sources=["cbse-ix"], strength="partial (generic vocabulary only; vocabulary stops only)",
     why="Only the generic Class IX vocabulary standards (p.6) apply, and only to the vocabulary-building stops; the spelling stops (schwa, phonemes, championship words) and loanwords are not mapped.")),
}

def stop_out(s, title):
    st = STOPS[s["unit"]]
    o = overlap.get(s["unit"], {})
    ev = {}
    if o.get("y34"): ev["uk_y3_4_statutory_list"] = o["y34"]
    if o.get("y56"): ev["uk_y5_6_statutory_list"] = o["y56"]
    if o.get("cc"): ev["ccss_example_words"] = o["cc"]
    out = {"unit": s["unit"], "title": title, "concept": st["concept"], "us": st["us"], "uk": st["uk"], "cbse": st["cbse"], "sources": st["sources"]}
    if ev: out["word_evidence"] = ev
    return out

regions = []
for a in trail:
    R = REGIONS[a["act"]]
    name = a["title"].split("·", 1)[1].strip() if "·" in a["title"] else a["title"]
    us, uk, cb = R["us"], R["uk"], R["cbse"]
    regions.append({
        "act": a["act"], "name": name, "act_title": a["title"], "concepts": R["concepts"],
        "us": {"grade": us["grade"], "standards": us["standards"], "sources": us["sources"], "strength": us["strength"], "why": us["why"]},
        "uk": {"year": uk["year"], "statements": uk["statements"], "sources": uk["sources"], "strength": uk["strength"], "why": uk["why"]},
        "cbse": {"class": cb["cls"], "statements": cb["statements"], "sources": cb["sources"], "strength": cb["strength"], "why": cb["why"]},
        "stops": [stop_out(s, s["title"]) for s in a["stops"]],
    })

missing = [s["unit"] for a in trail for s in a["stops"] if s["unit"] not in STOPS]
assert not missing, missing
ids = {s["id"] for s in SOURCES}
for r in regions:
    for k in ("us", "uk", "cbse"):
        for sid in r[k]["sources"]: assert sid in ids, sid
    for s in r["stops"]:
        for sid in s["sources"]: assert sid in ids, (s["unit"], sid)

doc = {
 "built": D,
 "note": ("Sourced curriculum map for the Bizzing Bee Word Atlas (SB_TRAIL.honey.acts, 9 regions, 128 stops; stop concepts read from concepts-data.js, Trickster stops from their inline chapters). "
          "Every mapping cites a document fetched in this session; nothing is mapped from memory. 'direct' = the document names the concept, or its example words are the stop's words; "
          "'partial' = the document covers the category but not this pattern; 'not mapped' = the document does not mention it. "
          "PROVENANCE: corestandards.org, gov.uk and cbseacademic.nic.in were all blocked by this sandbox's egress policy (HTTP 403 at the proxy) and web fetch could not resolve them, "
          "so each document was fetched as a copy from a public GitHub mirror (sources[].fetched_from) and checked: the CCSS XML is the official CCSSI file (official RefURIs inside); "
          "the three DfE PDFs carry DfE metadata and titles; the CBSE PDF's sha256 equals an independent record of the official URL. sources[].url is the official location (taken from the documents or from search results, not fetched). "
          "Re-fetch from the official hosts before publishing. SCOPE NOTES: CCSS assigns no particular affix or root to a grade - L.4.4b-L.8.4b repeat 'grade-appropriate Greek and/or Latin affixes and roots' with example words, so grade spans are reported. "
          "A few CCSS standards outside L.x.2/L.x.4 (L.4.1g, L.x.5, L.x.6, RF.3.3) are cited because they name a concept L.x.2/L.x.4 does not, and each is labelled. "
          "UK: only the left-hand column of Appendix 1 is statutory; guidance-column and notes evidence is labelled non-statutory/guidance. KS3 adds no new spelling content beyond applying Appendix 1. "
          "CBSE: only the Class IX 2026-27 English curriculum was found and fetched; it has no spelling statement and only generic vocabulary statements, so most rows are 'not mapped'. No CBSE English curriculum for Classes 3-8 was located."),
 "sources": SOURCES,
 "regions": regions,
}
json.dump(doc, open(OUT, "w"), ensure_ascii=False, indent=1)
print("regions", len(regions), "stops", sum(len(r["stops"]) for r in regions))
