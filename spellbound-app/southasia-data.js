/* southasia-data.js — the eleven South Asian chapters, shared by Volume 14 of the
   book series (books/southasia-chapters.js, the authoring copy) and by Expedition IV
   of the Word Atlas. Shape matches SB_CONCEPTS chapters (category/title/difficulty/
   concept/method/cards/words) plus an authored `sc` narration script, so trail.js
   can hand one straight to the concept viewer. Units point in by index (`sa`), so
   this file is APPEND-ONLY: reordering it would repoint every stop on the road. */
window.SB_SOUTHASIA = [
 {
  "category": "South Asian Words in English",
  "title": "Words from the yoga mat — Sanskrit at the microphone",
  "difficulty": "medium",
  "concept": "Sanskrit is the oldest language still feeding English new words, and it hands them over almost unchanged. That is the gift: what you hear is very nearly what you write. Long vowels stay long, every letter earns its place, and almost nothing is silent.",
  "method": "<div class='trick'><b>ASANA</b></div>\n<b>Say it.</b> AH-suh-nuh\n<b>Spell it.</b> A · S · A · N · A\n<b>The rule.</b> Sanskrit words are written the way they sound; trust the syllables\n<b>Watch for.</b> the schwa in the middle is still an A, never a U",
  "cards": [
   {
    "title": "One letter, one sound",
    "body": "Sanskrit spelling was designed by grammarians to be exact. Say the word slowly and write what you hear — that strategy fails in French and works here."
   },
   {
    "title": "Vowels do not hide",
    "body": "English loves to mumble unstressed vowels into schwa. In these words the vowel keeps its written identity: asana, not asuna; prana, not pruna."
   },
   {
    "title": "The -a ending",
    "body": "A huge share of these words end in a plain -a: yoga, karma, asana, prana, dharma. When you hear that soft final \"uh\", reach for A first."
   },
   {
    "title": "Ask for the language",
    "body": "At the mic, \"Sanskrit\" is a gift of an answer. It tells you: spell it phonetically, keep every vowel, and do not expect silent letters."
   }
  ],
  "words": [
   {
    "w": "yoga",
    "say": "YOH-guh",
    "def": "Hindu discipline aimed at training the consciousness for a state of perfect…",
    "hook": "YOH-guh — the O is long, the ending is a plain A",
    "ex": "She does yoga on the balcony before school."
   },
   {
    "w": "mantra",
    "say": "MA-ntruh",
    "def": "a commonly repeated word or phrase",
    "hook": "MAN + TRA — two clean beats, no vowel between N and T"
   },
   {
    "w": "asana",
    "say": "AH-suh-nuh",
    "def": "(Hinduism) a posture or manner of sitting (as in the practice of yoga)",
    "hook": "three A vowels; the middle one still writes as A",
    "ex": "The teacher held each asana for five slow breaths."
   },
   {
    "w": "prana",
    "say": "PRAH-nuh",
    "def": "In Hindu philosophy and yoga, the vital life force or breath energy believed to flow…",
    "hook": "PRA + NA — the opening PR is a real cluster, not \"puh-rana\""
   },
   {
    "w": "karma",
    "say": "KAH-rmuh",
    "def": "(Hinduism and Buddhism) the effects of a person's actions that determine his destiny…",
    "hook": "KAR + MA — R then M, nothing between them"
   },
   {
    "w": "dharma",
    "say": "DAH-rmuh",
    "def": "basic principles of the cosmos; also: an ancient sage in Hindu mythology worshipped…",
    "hook": "DH is one sound; the H rides the D and cannot be dropped",
    "ex": "In the story, the prince follows his dharma even when it costs him the throne."
   },
   {
    "w": "nirvana",
    "say": "nih-RVAH-nuh",
    "def": "(Hinduism and Buddhism) the beatitude that transcends the cycle of reincarnation…",
    "hook": "NIR + VA + NA — three beats, the middle A is long",
    "ex": "The monk described nirvana as the end of all wanting."
   },
   {
    "w": "chakra",
    "say": "CHUK-ruh",
    "def": "One of seven spiritual energy centers believed in yoga to exist along the human body.",
    "hook": "CH + A + KRA — the KR cluster stays together",
    "ex": "The diagram showed a chakra at the base of the spine."
   },
   {
    "w": "guru",
    "say": "GOO-roo",
    "def": "a Hindu or Buddhist religious leader and spiritual teacher",
    "hook": "two U vowels, both long: GOO-roo",
    "ex": "Her grandmother was the family guru on every question of cooking."
   },
   {
    "w": "sutra",
    "say": "SOO-trah",
    "def": "a rule or aphorism in Sanskrit literature or a group of aphoristic doctrinal…",
    "hook": "SU + TRA — the same -TRA ending as mantra",
    "ex": "Each sutra is only a line long, but a teacher can talk about it for an hour."
   },
   {
    "w": "avatar",
    "say": "A-vuh-tahr",
    "def": "a new personification of a familiar idea",
    "hook": "A · VA · TAR — three As, and it ends in R, not A",
    "ex": "In the epic, the god comes to earth as an avatar with a bow."
   },
   {
    "w": "yogi",
    "say": "YOH-gee",
    "def": "United States baseball player (born 1925)",
    "hook": "yoga with an I: the one in this family that does not end in A",
    "ex": "The yogi sat perfectly still while the class fidgeted."
   }
  ],
  "sc": {
   "label": "the phonetic gift",
   "scenes": [
    {
     "mood": "happy",
     "cap": "A language that spells fair",
     "say": "Naga, French has worn me out. Name one origin that plays fair.",
     "show": {
      "word": "asana"
     }
    },
    {
     "mood": "think",
     "cap": "Designed to be exact",
     "say": "Sanskrit. One letter, one sound. Say it slowly and write exactly what you hear.",
     "show": {
      "parts": [
       "a",
       "sa",
       "na"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "The vowel you swallow",
     "say": "Careless! You mumbled the middle vowel and wrote asuna. Every schwa is my doorway.",
     "show": {
      "glyph": "ə"
     }
    },
    {
     "mood": "excited",
     "cap": "Give every vowel its letter",
     "say": "Not here. asana, prana, dharma — the vowel keeps its letter. Soft uh means A.",
     "show": {
      "list": [
       "yoga",
       "karma",
       "sutra"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "The aspirated letters — bh, dh, gh, kh, th",
  "difficulty": "hard",
  "concept": "This is where South Asian words are actually lost. Indian languages pair many consonants with a breath: bh, dh, gh, kh, jh, th. English ears hear one sound and write one letter, and the H disappears. The H is not decoration — it is a separate letter of the original alphabet.",
  "method": "<div class='trick'><b>DHARMA</b></div>\n<b>Say it.</b> DAR-muh\n<b>The trap.</b> your ear hears a plain D\n<b>The truth.</b> the original letter is DH — D plus breath\n<b>The move.</b> ask for the language; if the answer is Sanskrit or Hindi, test DH before D",
  "cards": [
   {
    "title": "Five pairs to know",
    "body": "BH, DH, GH, JH and KH each write one sound in English but two letters on paper. Learn them as pairs and the H stops surprising you."
   },
   {
    "title": "Say it with the breath",
    "body": "Practise puffing the H: d-hARma, b-HANgra. Exaggerating the breath while you study builds the habit of writing the H under pressure."
   },
   {
    "title": "Where the H hides",
    "body": "The H almost always follows its consonant, never precedes it: it is GH not HG, DH not HD. If you can hear the puff, put H second."
   },
   {
    "title": "Check yourself twice",
    "body": "Any South Asian word with a K, G, D, B or J sound deserves one extra thought: was there a breath after it? That single question saves more words than any other rule here."
   }
  ],
  "words": [
   {
    "w": "bhangra",
    "say": "BAH-nggruh",
    "def": "A lively and energetic style of music and dance originating from the Punjab region…",
    "hook": "BH — a B with a breath; the H is the whole trap"
   },
   {
    "w": "ghee",
    "say": "GEE",
    "def": "clarified butter used in Indian cookery",
    "hook": "GH then double E — the H rides the G",
    "ex": "He fried the onions in ghee until the kitchen smelled sweet."
   },
   {
    "w": "jodhpurs",
    "say": "JOD-purz",
    "def": "flared trousers ending at the calves; worn with riding boots",
    "hook": "DH in the middle, and the U before R is silent-ish but written"
   },
   {
    "w": "khaki",
    "say": "k-AH-k-ee",
    "def": "means dull yellowish brown",
    "hook": "KH at the front, then a plain K — two different letters, same sound"
   },
   {
    "w": "dharma",
    "say": "DAH-rmuh",
    "def": "basic principles of the cosmos; also: an ancient sage in Hindu mythology worshipped…",
    "hook": "DH opens it; D alone is the classic miss",
    "ex": "In the story, the prince follows his dharma even when it costs him the throne."
   },
   {
    "w": "kurta",
    "say": "KOOR-tuh",
    "def": "a loose collarless shirt worn by many people on the Indian subcontinent (usually…",
    "hook": "no H here — a clean K, which is exactly why you must check"
   },
   {
    "w": "chutney",
    "say": "CHUH-tnee",
    "def": "a spicy condiment made of chopped fruits or vegetables cooked in vinegar and sugar…",
    "hook": "CH is its own pair; TN sit together with no vowel",
    "ex": "There was a bowl of green chutney beside every plate."
   },
   {
    "w": "gymkhana",
    "say": "jihm-KAH-nuh",
    "def": "a meet at which riders and horses display a range of skills and aptitudes",
    "hook": "GYM then KHANA — the KH survives inside the word",
    "ex": "The riding club held a gymkhana on the first Saturday of May."
   },
   {
    "w": "pukka",
    "say": "PUK-uh",
    "def": "absolutely first class and genuine",
    "hook": "double K, no H — the doubling replaces the breath",
    "ex": "Her father called the new bridge a pukka job, and he did not say that often."
   },
   {
    "w": "chukker",
    "say": "CHUK-er",
    "def": "(polo) one of six divisions into which a polo match is divided",
    "hook": "CH opening, double K middle, -ER ending",
    "ex": "The match paused between the third and fourth chukker."
   }
  ],
  "sc": {
   "label": "the breath letters",
   "scenes": [
    {
     "mood": "happy",
     "cap": "One sound, two letters",
     "say": "Naga, I wrote darma and lost. The judge said dharma. Where did that H come from?",
     "show": {
      "word": "dharma"
     }
    },
    {
     "mood": "think",
     "cap": "The H is a letter, not decoration",
     "say": "Indian languages breathe their consonants. One sound in your ear, two letters on paper.",
     "show": {
      "parts": [
       "d",
       "+",
       "h"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Your ear will not save you",
     "say": "Puff all you like. English ears drop the H, and I collect every one.",
     "show": {
      "big": "no H for you"
     }
    },
    {
     "mood": "excited",
     "cap": "Ask, then test",
     "say": "So I stop trusting my ear. Sanskrit or Hindi? Then test the breath first.",
     "show": {
      "list": [
       "bhangra",
       "ghee",
       "khaki"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "What you wear — the clothing words",
  "difficulty": "easy",
  "concept": "British traders and soldiers carried home the clothes before the words. Every one of these was a garment first and an English word second, and most keep a spelling that looks nothing like the way an English word \"should\" look.",
  "method": "<div class='trick'><b>JODHPURS</b></div>\n<b>Say it.</b> JOD-perz\n<b>Spell it.</b> J · O · D · H · P · U · R · S\n<b>Break it.</b> jodh · purs\n<b>The trap.</b> the silent-sounding DH, then a U you barely hear",
  "cards": [
   {
    "title": "Place names became clothes",
    "body": "Jodhpurs from Jodhpur, cashmere from Kashmir, madras from the city, calico from Calicut. If a garment sounds like a place, it probably is one — and place spellings do not simplify."
   },
   {
    "title": "The -a endings again",
    "body": "kurta, sari, dhoti: short garments, short words, plain vowels. These are the easy half of the family."
   },
   {
    "title": "Cummerbund is two words",
    "body": "From Persian kamar (waist) plus band (tie). Knowing it is a compound explains the double M and the D at the end."
   },
   {
    "title": "Watch the doubles",
    "body": "cummerbund and bandanna both double a letter English would not: MM and NN. Doubling is the single most common error in this group."
   }
  ],
  "words": [
   {
    "w": "kurta",
    "say": "KOOR-tuh",
    "def": "a loose collarless shirt worn by many people on the Indian subcontinent (usually…",
    "hook": "KUR + TA — a clean K, no H"
   },
   {
    "w": "jodhpurs",
    "say": "JOD-purz",
    "def": "flared trousers ending at the calves; worn with riding boots",
    "hook": "the DH plus the city it came from"
   },
   {
    "w": "cummerbund",
    "say": "KUM-er-bund",
    "def": "a broad pleated sash worn as formal dress with a tuxedo",
    "hook": "double M — Persian kamar (waist) + band",
    "ex": "He wore a red cummerbund with his black jacket."
   },
   {
    "w": "bandanna",
    "say": "ban-DAN-uh",
    "def": "large and brightly colored handkerchief; often used as a neckerchief",
    "hook": "double N in the middle, then a single A",
    "ex": "She tied a bandanna over her hair before painting."
   },
   {
    "w": "dungaree",
    "say": "dun-guh-REE",
    "def": "a coarse durable twill-weave cotton fabric",
    "hook": "ends -EE; named for Dongri, a Mumbai district",
    "ex": "The workshop supplied a dungaree jacket to every apprentice."
   },
   {
    "w": "sari",
    "say": "SAH-ree",
    "def": "a dress worn primarily by Hindu women; consists of several yards of light material…",
    "hook": "the simplest in the family: four letters, both vowels plain",
    "ex": "Her mother folded the sari into neat pleats before pinning it."
   },
   {
    "w": "shawl",
    "say": "SHAWL",
    "def": "cloak consisting of an oblong piece of cloth used to cover the head and shoulders",
    "hook": "SH then AWL — the W is written even though the vowel swallows it",
    "ex": "He put a shawl round her shoulders on the cold platform."
   },
   {
    "w": "chintz",
    "say": "CHIHNTS",
    "def": "a brightly printed and glazed cotton fabric",
    "hook": "ends in TZ — from Hindi chint, a spotted cloth"
   },
   {
    "w": "phulkari",
    "say": "fool-KAH-ree",
    "def": "A traditional embroidery style from the Punjab region of South Asia, featuring…",
    "hook": "PH says F; then UL · KA · RI, all plain vowels"
   },
   {
    "w": "nainsook",
    "say": "NAYN-sook",
    "def": "a soft lightweight muslin used especially for babies",
    "hook": "NAIN + SOOK — a double O in the second half"
   }
  ],
  "sc": {
   "label": "what came home in a trunk",
   "scenes": [
    {
     "mood": "happy",
     "cap": "Clothes before words",
     "say": "Naga, why do riding trousers hide a DH in the middle?",
     "show": {
      "word": "jodhpurs"
     }
    },
    {
     "mood": "think",
     "cap": "It is a place",
     "say": "Because Jodhpur is a city. Place names never simplify their spelling for anyone.",
     "show": {
      "parts": [
       "jodh",
       "purs"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "The doubles are mine",
     "say": "And while you admire the geography, you will write cumerbund with one M. You always do.",
     "show": {
      "word": "cummerbund"
     }
    },
    {
     "mood": "excited",
     "cap": "Find the seam",
     "say": "Persian kamar, waist, plus band, tie. Two words, so two Ms meet at the seam.",
     "show": {
      "parts": [
       "kamar",
       "band"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "What you eat — the kitchen words",
  "difficulty": "easy",
  "concept": "Food words travel first and fastest, and they arrive with their spelling intact because nobody wants to rename dinner. Several of these were spelled by British ears rather than Indian ones, which is exactly why they look strange.",
  "method": "<div class='trick'><b>MULLIGATAWNY</b></div>\n<b>Say it.</b> mul-ih-guh-TAW-nee\n<b>Break it.</b> mul · li · ga · taw · ny\n<b>The story.</b> Tamil milagu-tanni, \"pepper water\" — an English ear wrote it down\n<b>The traps.</b> double L, then a schwa A, then AW before -NY",
  "cards": [
   {
    "title": "English ears, Indian words",
    "body": "Mulligatawny is what \"milagu-tanni\" sounded like to a British soldier. When a word was transcribed by ear, expect doubled letters and unexpected vowels."
   },
   {
    "title": "The schwa problem lands here too",
    "body": "mulligatAwny, tamArind, basmAti: unstressed vowels mumble. Say the word in beats and give each vowel its full value while you study."
   },
   {
    "title": "Short and safe",
    "body": "ghee, curry, chutney, basmati — these are short, phonetic and reliable. Bank them quickly so your energy goes to the long ones."
   },
   {
    "title": "One is a plural trap",
    "body": "curry becomes curries: the Y turns to I before -ES, exactly like the ordinary English rule. Loanwords still obey English grammar once they settle in."
   }
  ],
  "words": [
   {
    "w": "tamarind",
    "say": "TAM-uh-rind",
    "def": "the pod of a large tropical tree",
    "hook": "TAM + A + RIND — the middle A is a schwa but writes as A"
   },
   {
    "w": "chutney",
    "say": "CHUH-tnee",
    "def": "a spicy condiment made of chopped fruits or vegetables cooked in vinegar and sugar…",
    "hook": "CH opening; TN with no vowel between",
    "ex": "There was a bowl of green chutney beside every plate."
   },
   {
    "w": "basmati",
    "say": "bahs-MAH-tee",
    "def": "a long-grain aromatic rice originally grown in the Himalayas",
    "hook": "BAS + MA + TI — three beats, three plain vowels",
    "ex": "The basmati rice smelled of popcorn as it cooked."
   },
   {
    "w": "mulligatawny",
    "say": "muh-lih-guh-TAH-nee",
    "def": "a soup of eastern India that is flavored with curry; prepared with a meat or chicken…",
    "hook": "double L, then AW before the -NY ending"
   },
   {
    "w": "curry",
    "say": "KUH-ree",
    "def": "a spicy dish of meat or vegetables in a richly spiced sauce, often with rice",
    "hook": "double R before the Y",
    "ex": "They ate curry and rice off steel plates."
   },
   {
    "w": "ghee",
    "say": "GEE",
    "def": "clarified butter used in Indian cookery",
    "hook": "the GH pair plus a double E",
    "ex": "He fried the onions in ghee until the kitchen smelled sweet."
   },
   {
    "w": "jaggery",
    "say": "JAG-er-ee",
    "def": "unrefined brown sugar made from palm sap",
    "hook": "double G in the middle, then -ERY",
    "ex": "The sweets were made with jaggery instead of white sugar."
   },
   {
    "w": "kedgeree",
    "say": "KEJ-uh-ree",
    "def": "a dish of rice and hard-boiled eggs and cooked flaked fish",
    "hook": "DG makes the J sound, then -EREE",
    "ex": "Breakfast at the old hotel was still kedgeree and toast."
   },
   {
    "w": "mango",
    "say": "MA-nggoh",
    "def": "large evergreen tropical tree cultivated for its large oval fruit",
    "hook": "from Tamil mankay; the O ending is the English part",
    "ex": "The mango was so ripe that juice ran down his wrist."
   },
   {
    "w": "saffron",
    "say": "s-A-f-r-uh-n",
    "def": "a crocus having showy purple flowers",
    "hook": "double F — the Persian root travelled with the spice"
   }
  ],
  "sc": {
   "label": "the kitchen words",
   "scenes": [
    {
     "mood": "happy",
     "cap": "Words you can eat",
     "say": "Naga, half my dinner is on the list. Tandoori. Chutney. Basmati. Are they friendly?",
     "show": {
      "list": [
       "chutney",
       "basmati",
       "tandoori"
      ]
     }
    },
    {
     "mood": "think",
     "cap": "Mostly, yes",
     "say": "Food words travelled by mouth and kept their sounds. Break them into beats.",
     "show": {
      "parts": [
       "tan",
       "doo",
       "ri"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Except the long one",
     "say": "Mulligatawny. Say it fast and a letter goes missing. I will be waiting there.",
     "show": {
      "word": "mulligatawny"
     }
    },
    {
     "mood": "excited",
     "cap": "So I slow down",
     "say": "Mul · li · ga · taw · ny. Five beats, a double L, and AW.",
     "show": {
      "parts": [
       "mul",
       "li",
       "ga",
       "taw",
       "ny"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "The Raj words — English that came home changed",
  "difficulty": "medium",
  "concept": "For two centuries English lived in South Asia and picked up vocabulary for things it had no word for: a house with a low roof, a bribe, a mob, a cart too heavy to stop. These words feel completely English now, which is what makes their spelling sneaky.",
  "method": "<div class='trick'><b>JUGGERNAUT</b></div>\n<b>Say it.</b> JUG-er-nawt\n<b>Break it.</b> jug · ger · naut\n<b>The traps.</b> double G, then -NAUT with an A you cannot hear\n<b>The story.</b> Jagannath, a temple chariot so vast it could not be stopped",
  "cards": [
   {
    "title": "They hide in plain sight",
    "body": "bungalow, cushy, loot, thug, pundit — nobody hears these as foreign, so nobody double-checks them. That is precisely why they show up in finals."
   },
   {
    "title": "AU and OO surprises",
    "body": "juggernaut ends -NAUT, not -NOT. loot doubles its O. These vowel choices come from transliteration, not from English patterns."
   },
   {
    "title": "A house with a Bengali name",
    "body": "bungalow is from bangla — \"of Bengal\", a Bengali-style house. The -OW ending is an English spelling of a Bengali vowel."
   },
   {
    "title": "Ask for the meaning",
    "body": "Several of these have shifted meaning: a pundit was a learned scholar, a thug was a member of a specific gang. If a definition sounds oddly specific and old, suspect the Raj."
   }
  ],
  "words": [
   {
    "w": "bungalow",
    "say": "BUH-ngguh-loh",
    "def": "a small house with a single story",
    "hook": "from bangla, \"of Bengal\"; ends -OW",
    "ex": "They rented a small bungalow near the beach for the summer."
   },
   {
    "w": "juggernaut",
    "say": "JUH-ger-nawt",
    "def": "a massive inexorable force that seems to crush everything in its way",
    "hook": "double G plus the -NAUT ending",
    "ex": "The team became a juggernaut that no defence could slow."
   },
   {
    "w": "cushy",
    "say": "KUU-shee",
    "def": "not burdensome or demanding; borne or done easily and without hardship",
    "hook": "from khush (pleasant) — one S, then Y"
   },
   {
    "w": "loot",
    "say": "LOOT",
    "def": "goods or money obtained illegally",
    "hook": "double O; from Hindi lut, plunder",
    "ex": "The soldiers carried the loot away in carts."
   },
   {
    "w": "thug",
    "say": "THUHG",
    "def": "an aggressive and violent young criminal",
    "hook": "TH then UG — three letters, no trap, easy points",
    "ex": "The traveller was warned that a thug might be waiting on the road."
   },
   {
    "w": "pundit",
    "say": "PUH-nduht",
    "def": "someone who has been admitted to membership in a scholarly field",
    "hook": "from pandit, a scholar; a plain single-consonant word",
    "ex": "Every pundit on television predicted the wrong result."
   },
   {
    "w": "veranda",
    "say": "ver-A-nduh",
    "def": "a porch along the outside of a building (sometimes partly enclosed)",
    "hook": "one R, one N, ends in plain A",
    "ex": "They drank tea on the veranda and watched the rain."
   },
   {
    "w": "cheroot",
    "say": "sheh-ROOT",
    "def": "a cigar with both ends cut flat",
    "hook": "CH then double O — from Tamil shuruttu, a roll",
    "ex": "The old captain smoked a cheroot on the deck each evening."
   },
   {
    "w": "dacoit",
    "say": "dah-KOYT",
    "def": "a member of an armed gang of robbers",
    "hook": "OI in the middle; an armed robber",
    "ex": "The village kept a watchman in case a dacoit came down from the hills."
   },
   {
    "w": "sepoy",
    "say": "SEE-poy",
    "def": "A native soldier of the Indian subcontinent who was trained and employed in the…",
    "hook": "SE + POY — from Persian sipahi, a soldier",
    "ex": "His great-grandfather served as a sepoy in the same regiment."
   }
  ],
  "sc": {
   "label": "English that came home changed",
   "scenes": [
    {
     "mood": "happy",
     "cap": "A word with a passport",
     "say": "Naga, my dictionary says bungalow is English. It also says it is Bengali. Which is it?",
     "show": {
      "word": "bungalow"
     }
    },
    {
     "mood": "think",
     "cap": "Both, in order",
     "say": "From bangla — of Bengal. English borrowed the house, then spelled it the English way.",
     "show": {
      "parts": [
       "bangla",
       "bungalow"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Borrowed spellings wobble",
     "say": "A wobbling spelling is a gift to me. Was it -ow? -oe? Choose wrong.",
     "show": {
      "glyph": "-ow?"
     }
    },
    {
     "mood": "excited",
     "cap": "Learn the family",
     "say": "bungalow, veranda, pyjamas, shampoo — English endings over Indian roots. Learn the pattern once.",
     "show": {
      "list": [
       "veranda",
       "pyjamas",
       "shampoo"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "Beasts, boats and the wild",
  "difficulty": "medium",
  "concept": "When English met animals and boats it had never seen, it borrowed the local name rather than invent one. These words are old, worn smooth by centuries of use, and their spellings preserve sounds that English then reshaped.",
  "method": "<div class='trick'><b>CATAMARAN</b></div>\n<b>Say it.</b> KAT-uh-muh-ran\n<b>Break it.</b> ca · ta · ma · ran\n<b>The story.</b> Tamil kattumaram, \"tied wood\" — two hulls lashed together\n<b>The traps.</b> four beats, and the two middle vowels are both schwa but both A",
  "cards": [
   {
    "title": "All-A words",
    "body": "catamaran, sambar, bandicoot: when the schwa mumbles, A is the safest bet in this family. Sanskrit and Tamil both lean heavily on A."
   },
   {
    "title": "Cheetah keeps its H",
    "body": "From Sanskrit chitra, \"spotted\". The CH and the final H both survive — English would happily have written \"cheeta\", but the H stayed."
   },
   {
    "title": "Jungle changed its vowel",
    "body": "From jangal, meaning wasteland or uncultivated ground. English shifted the A to U and softened the meaning to dense forest."
   },
   {
    "title": "Two hulls, two words",
    "body": "catamaran is a compound in Tamil (kattu + maram). Long loanwords are often compounds; splitting them is easier than memorising them."
   }
  ],
  "words": [
   {
    "w": "catamaran",
    "say": "ka-tuh-mer-AN",
    "def": "a sailboat with two parallel hulls held together by single deck",
    "hook": "four beats, and every vowel is an A"
   },
   {
    "w": "cheetah",
    "say": "CHEE-tuh",
    "def": "long-legged spotted cat of Africa and southwestern Asia having nonretractile claws…",
    "hook": "from chitra, spotted; keeps both the CH and the final H",
    "ex": "A cheetah can outrun any animal on the plain for about twenty seconds."
   },
   {
    "w": "jungle",
    "say": "JUH-ngguhl",
    "def": "a location marked by an intense competition and struggle for survival",
    "hook": "from jangal — the A became U in English",
    "ex": "The path disappeared into the jungle within a hundred metres."
   },
   {
    "w": "bandicoot",
    "say": "BA-ndih-koot",
    "def": "any of various agile ratlike terrestrial marsupials of Australia and adjacent…",
    "hook": "BANDI + COOT — double O in the tail"
   },
   {
    "w": "nilgai",
    "say": "NIL-gy",
    "def": "large Indian antelope; male is blue-grey with white markings; female is brownish…",
    "hook": "NEEL + GY — nil (blue) + gai (cow), a compound animal",
    "ex": "A nilgai stepped out of the scrub and stared at the jeep."
   },
   {
    "w": "nilgai",
    "say": "NIL-gy",
    "def": "large Indian antelope; male is blue-grey with white markings; female is brownish…",
    "hook": "NIL + GAI — \"blue cow\"; the AI is one sound",
    "ex": "A nilgai stepped out of the scrub and stared at the jeep."
   },
   {
    "w": "jackal",
    "say": "j-A-k-uh-l",
    "def": "a wild dog of Asia and Africa",
    "hook": "from Sanskrit srgala; ends -AL, not -EL"
   },
   {
    "w": "dinghy",
    "say": "d-IH-ng-ee",
    "def": "a small boat designed as a lifeboat",
    "hook": "from dingi; the GH pair before the Y"
   },
   {
    "w": "mongoose",
    "say": "MAH-nggoos",
    "def": "agile grizzled Old World viverrine; preys on snakes and rodents",
    "hook": "from Marathi mangus; double O, and the plural is mongooses",
    "ex": "The mongoose killed the snake before anyone could move."
   },
   {
    "w": "teak",
    "say": "TEEK",
    "def": "hard, strong yellowish-brown wood used for furniture and ships, resistant to insects",
    "hook": "from Malayalam tekka — EA for one long sound"
   }
  ],
  "sc": {
   "label": "beasts, boats and the wild",
   "scenes": [
    {
     "mood": "happy",
     "cap": "All the vowels are A",
     "say": "Naga, catamaran has four As in a row of syllables. Is that allowed?",
     "show": {
      "word": "catamaran"
     }
    },
    {
     "mood": "think",
     "cap": "Tamil built it that way",
     "say": "kattu, to tie; maram, wood. Tied wood — a boat. Tamil leans hard on A.",
     "show": {
      "parts": [
       "kattu",
       "maram"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Bet wrong once",
     "say": "One O instead of an A and the boat sinks. Catomaran looks almost right.",
     "show": {
      "big": "catomaran"
     }
    },
    {
     "mood": "excited",
     "cap": "Almost right is out",
     "say": "So I write A and find the seam. cheetah, nilgai, sambar — all compounds.",
     "show": {
      "list": [
       "cheetah",
       "nilgai",
       "sambar"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "The road words — Persian along the trade routes",
  "difficulty": "medium",
  "concept": "Persian was the court and trade language across much of South and Central Asia for centuries, so a whole layer of English words reached us through Persian on their way from or to India. They tend to be short, concrete and market-flavoured.",
  "method": "<div class='trick'><b>BAZAAR</b></div>\n<b>Say it.</b> buh-ZAR\n<b>Spell it.</b> B · A · Z · A · A · R\n<b>The trap.</b> the double A — one sound, two letters\n<b>Compare.</b> caravan has three separate As; bazaar doubles one",
  "cards": [
   {
    "title": "Persian doubles vowels",
    "body": "bazaar keeps AA for a single long vowel — a Persian habit English normally refuses. It is the most-missed letter pair in this chapter."
   },
   {
    "title": "Short and concrete",
    "body": "divan, turban, caravan, khaki: market goods and travel gear. Persian trade words are usually two or three plain syllables."
   },
   {
    "title": "Shampoo is a command",
    "body": "From Hindi champo — \"press!\" — the imperative of champna, to knead. It arrived as a head massage, not a bottle."
   },
   {
    "title": "Watch the -AN endings",
    "body": "divan, turban, caravan all end -AN. If you hear that soft \"un\" at the end of a Persian-route word, write AN before EN or ON."
   }
  ],
  "words": [
   {
    "w": "bazaar",
    "say": "b-uh-z-AH-r",
    "def": "a marketplace especially in the Middle East",
    "hook": "the double A is the whole test"
   },
   {
    "w": "caravan",
    "say": "KA-ruh-van",
    "def": "a procession (of wagons or mules or camels) traveling together in single file",
    "hook": "three separate As, no doubling"
   },
   {
    "w": "divan",
    "say": "dih-VAN",
    "def": "a long backless sofa (usually with pillows against a wall)",
    "hook": "DI + VAN — ends -AN"
   },
   {
    "w": "turban",
    "say": "t-UR-b-uh-n",
    "def": "a headdress consisting of a long cloth that is wrapped around a cap or directly…",
    "hook": "TUR + BAN — the second vowel is A, not E"
   },
   {
    "w": "shampoo",
    "say": "sha-MPOO",
    "def": "cleansing agent consisting of soaps or detergents used for washing the hair",
    "hook": "from champo, \"press!\"; double O ending",
    "ex": "She left the shampoo in her hair while she found a towel."
   },
   {
    "w": "khaki",
    "say": "k-AH-k-ee",
    "def": "means dull yellowish brown",
    "hook": "the KH pair; Persian for dusty"
   },
   {
    "w": "cashmere",
    "say": "KA-zhmihr",
    "def": "a very soft, warm wool that comes from a special kind of goat",
    "hook": "from Kashmir; the place kept its K, the cloth took a C"
   },
   {
    "w": "calico",
    "say": "KA-luh-koh",
    "def": "coarse cloth with a bright print",
    "hook": "from Calicut; one L, ends -CO"
   },
   {
    "w": "madras",
    "say": "MA-druhs",
    "def": "A light cotton cloth with a colorful plaid pattern.",
    "hook": "a city that became a cloth and a curry",
    "ex": "He wore a madras shirt in bright checks."
   },
   {
    "w": "maharaja",
    "say": "mah-her-AH-zhuh",
    "def": "a great raja; a Hindu prince or king in India ranking above a raja",
    "hook": "MAHA (great) + RAJA (king) — a compound worth splitting"
   }
  ],
  "sc": {
   "label": "the road words",
   "scenes": [
    {
     "mood": "happy",
     "cap": "Words that walked",
     "say": "Naga, bazaar has two As next to each other. Nothing in English does that.",
     "show": {
      "word": "bazaar"
     }
    },
    {
     "mood": "think",
     "cap": "Persian, along the road",
     "say": "It is Persian, off the trade roads. Its long vowels get written twice.",
     "show": {
      "parts": [
       "ba",
       "zaar"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "One A is easier",
     "say": "And so much more tempting. Bazar. Look how tidy it is. Write the tidy one.",
     "show": {
      "big": "bazar"
     }
    },
    {
     "mood": "excited",
     "cap": "Tidy is not correct",
     "say": "Two As, because the vowel is long. Persian holds it; the spelling holds it.",
     "show": {
      "list": [
       "caravan",
       "divan",
       "khaki"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "Sanskrit compounds — long words built from short ones",
  "difficulty": "hard",
  "concept": "Sanskrit builds meaning by welding words together, and it does so freely: a compound can run for many syllables and still be one legal word. English inherited some of these whole. Learn the pieces and the terrifying long ones become arithmetic.",
  "method": "<div class='trick'><b>MAHATMA</b></div>\n<b>Say it.</b> muh-HAHT-muh\n<b>Break it.</b> maha + atma\n<b>The pieces.</b> maha = great · atma = soul\n<b>The join.</b> the two As merge into one long A: mah-ATma",
  "cards": [
   {
    "title": "maha- means great",
    "body": "maharaja (great king), maharani (great queen), mahatma (great soul). One prefix, a whole family of words — and it is always MAHA, never maja or mahar."
   },
   {
    "title": "Vowels merge at the seam",
    "body": "When Sanskrit joins two words, touching vowels fuse. That is why mahatma has one A where you might expect two — the seam is invisible in the spelling."
   },
   {
    "title": "Split before you spell",
    "body": "For any long Sanskrit word, find the seam first. Two short words are always easier to spell than one long one, and the seam usually falls at a consonant pair."
   },
   {
    "title": "The technical ones",
    "body": "bahuvrihi and dvandva are the grammarians’ own names for compound types. They look impossible and are perfectly phonetic — proof that the phonetic rule holds even at the top of the difficulty scale."
   }
  ],
  "words": [
   {
    "w": "mahatma",
    "say": "muh-HAH-tmuh",
    "def": "(Hinduism) term of respect for a brahmin sage",
    "hook": "maha (great) + atma (soul), vowels merged"
   },
   {
    "w": "maharaja",
    "say": "mah-her-AH-zhuh",
    "def": "a great raja; a Hindu prince or king in India ranking above a raja",
    "hook": "maha + raja — the same prefix, a new word"
   },
   {
    "w": "ashram",
    "say": "A-shrahm",
    "def": "a quiet place where people go to meditate, pray, and practice yoga",
    "hook": "ASH + RAM — SH then R, no vowel between",
    "ex": "The ashram sat above the river, reached by two hundred steps."
   },
   {
    "w": "chakra",
    "say": "CHUK-ruh",
    "def": "One of seven spiritual energy centers believed in yoga to exist along the human body.",
    "hook": "the KR cluster; a wheel or centre",
    "ex": "The diagram showed a chakra at the base of the spine."
   },
   {
    "w": "tulsi",
    "say": "TOOL-see",
    "def": "A sacred aromatic plant of the mint family native to India, also called holy basil…",
    "hook": "TUL + SI — the sacred basil, four letters, no traps"
   },
   {
    "w": "bindi",
    "say": "BIN-dee",
    "def": "A decorative mark worn on the forehead, especially by Hindu women, traditionally a…",
    "hook": "BIN + DI — from bindu, a dot"
   },
   {
    "w": "swami",
    "say": "SWAH-mee",
    "def": "a Hindu religious teacher; used as a title of respect",
    "hook": "SW opening cluster, then -AMI",
    "ex": "The swami answered every question with another question."
   },
   {
    "w": "rajah",
    "say": "RAH-juh",
    "def": "a prince or king in India",
    "hook": "the optional final H that raja can also drop",
    "ex": "The rajah's palace is now a museum."
   },
   {
    "w": "pundit",
    "say": "PUH-nduht",
    "def": "someone who has been admitted to membership in a scholarly field",
    "hook": "from pandit — the A became U in English",
    "ex": "Every pundit on television predicted the wrong result."
   },
   {
    "w": "gymkhana",
    "say": "jihm-KAH-nuh",
    "def": "a meet at which riders and horses display a range of skills and aptitudes",
    "hook": "GYM + KHANA; the KH survives mid-word",
    "ex": "The riding club held a gymkhana on the first Saturday of May."
   }
  ],
  "sc": {
   "label": "long words, short parts",
   "scenes": [
    {
     "mood": "happy",
     "cap": "A word the length of a road",
     "say": "Naga, chakravyuha. That is nine letters of trouble before breakfast.",
     "show": {
      "word": "chakravyuha"
     }
    },
    {
     "mood": "think",
     "cap": "It is two words holding hands",
     "say": "chakra, wheel; vyuha, formation. Sanskrit joins short words and never hides the seam.",
     "show": {
      "parts": [
       "chakra",
       "vyuha"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Then find the seam",
     "say": "You will not. Under the lights a long word looks like one unbroken wall.",
     "show": {
      "big": "9 letters"
     }
    },
    {
     "mood": "excited",
     "cap": "Walls have bricks",
     "say": "maharaja is maha plus raja. Once I see the bricks, length stops frightening me.",
     "show": {
      "list": [
       "maharaja",
       "mahatma",
       "chakra"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "The spice trail — words older than the empire",
  "difficulty": "medium",
  "concept": "Some of these came so long ago they no longer feel borrowed at all. Sugar, ginger, candy and camphor reached English through Persian, Arabic, Greek and Latin — but they started in Sanskrit or Tamil, and their spellings carry the whole journey.",
  "method": "<div class='trick'><b>SUGAR</b></div>\n<b>Say it.</b> SHOOG-er\n<b>The journey.</b> Sanskrit sharkara → Persian → Arabic → Latin → French → English\n<b>The oddity.</b> the S is pronounced SH, which no English rule predicts\n<b>Why.</b> five languages each reshaped it a little",
  "cards": [
   {
    "title": "The longest journeys distort most",
    "body": "A word that passed through four languages arrives bent. sugar, ginger and candy all look nothing like their Sanskrit ancestors — and each irregularity is one language’s fingerprint."
   },
   {
    "title": "Ginger doubles its G sound",
    "body": "From Sanskrit srngavera via Greek and Latin. Both Gs are soft, which is why the spelling looks so unlike its sound."
   },
   {
    "title": "Candy was a lump of sugar",
    "body": "From khanda, a piece or fragment. The KH lost its H on the road through Persian and Arabic — the opposite of the aspiration rule you learned earlier."
   },
   {
    "title": "Ask for the origin anyway",
    "body": "If the judge says Sanskrit for a word this ordinary, that is a warning: this one travelled, so the phonetic rule may not hold. Ask for language history when you can."
   }
  ],
  "words": [
   {
    "w": "sugar",
    "say": "SHUU-ger",
    "def": "a white crystalline carbohydrate used as a sweetener and preservative",
    "hook": "from sharkara; the S says SH",
    "ex": "He stirred two spoons of sugar into the tea."
   },
   {
    "w": "ginger",
    "say": "JIH-njer",
    "def": "perennial plants having thick branching aromatic rhizomes and leafy reedlike stems",
    "hook": "both Gs soft; a long journey through Greek and Latin"
   },
   {
    "w": "candy",
    "say": "KA-ndee",
    "def": "a rich sweet made of flavored sugar and often combined with fruit or nuts",
    "hook": "from khanda, a fragment — the H fell away",
    "ex": "The shop sold candy in glass jars along the whole wall."
   },
   {
    "w": "camphor",
    "say": "KAM-fer",
    "def": "a strong-smelling white substance from a tree, used in medicines and mothballs",
    "hook": "PH says F; from Sanskrit karpura",
    "ex": "The old trunk smelled of camphor and cedar."
   },
   {
    "w": "saffron",
    "say": "s-A-f-r-uh-n",
    "def": "a crocus having showy purple flowers",
    "hook": "double F; the spice and the word arrived together"
   },
   {
    "w": "musk",
    "say": "MUHSK",
    "def": "A strong-smelling substance used to make perfume.",
    "hook": "from Sanskrit muska; four letters, no trap",
    "ex": "The perfume had a deep note of musk under the flowers."
   },
   {
    "w": "lilac",
    "say": "LEYE-lak",
    "def": "any of various plants of the genus Syringa having large panicles of usually fragrant…",
    "hook": "through Persian from Sanskrit nila, blue",
    "ex": "A lilac bush grew against the garden wall."
   },
   {
    "w": "orange",
    "say": "AW-ruhnj",
    "def": "A round, juicy citrus fruit with a thick, colorful peel.",
    "hook": "from naranga; English lost the opening N",
    "ex": "She peeled the orange in one long spiral."
   },
   {
    "w": "lemon",
    "say": "LEH-muhn",
    "def": "yellow oval fruit with juicy acidic flesh",
    "hook": "from limu via Persian and Arabic",
    "ex": "A slice of lemon floated in the jug of water."
   },
   {
    "w": "sapphire",
    "say": "s-A-f-ay-ur",
    "def": "a precious gemstone of rich blue corundum highly valued in jewelry",
    "hook": "double P then -IRE; from Sanskrit sanipriya"
   }
  ],
  "sc": {
   "label": "older than the empire",
   "scenes": [
    {
     "mood": "happy",
     "cap": "The oldest borrowing of all",
     "say": "Naga, sugar is on my list. Sugar. It cannot possibly be a hard word.",
     "show": {
      "word": "sugar"
     }
    },
    {
     "mood": "think",
     "cap": "It is the oldest one here",
     "say": "Sanskrit sharkara, through Persian, Arabic, Italian, French. Four languages bent it. Hence the SH.",
     "show": {
      "parts": [
       "sharkara",
       "sugar"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Long journeys break words",
     "say": "Exactly. A broken word cannot be reasoned out. You can only know it.",
     "show": {
      "glyph": "sh?"
     }
    },
    {
     "mood": "excited",
     "cap": "Then I know it",
     "say": "ginger, candy, camphor — each irregular spelling is a fingerprint of its road.",
     "show": {
      "list": [
       "ginger",
       "candy",
       "camphor"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "Festival, faith and the arts",
  "difficulty": "hard",
  "concept": "These are the words English borrowed for things it had no concept for: a dance form, a devotional act, a philosophical stance. They are almost always transcribed straight from the original, which makes them phonetic — and long.",
  "method": "<div class='trick'><b>KATHAKALI</b></div>\n<b>Say it.</b> kah-thah-KAH-lee\n<b>Break it.</b> ka · tha · ka · li\n<b>The pattern.</b> KA · THA · KA · LI — the beats almost repeat\n<b>The trap.</b> the TH in the middle is aspirated T, and the H must be written",
  "cards": [
   {
    "title": "Rhythm beats memory",
    "body": "Dance and music words are built on rhythm, so say them in rhythm. kathakali, bhangra and abhinaya are far easier chanted than spelled letter by letter cold."
   },
   {
    "title": "Aspiration returns",
    "body": "kathakali, abhinaya, bhangra: the H after T, B and other consonants is doing real work. This chapter is the aspiration chapter’s hardest exam."
   },
   {
    "title": "Ahimsa is a stance",
    "body": "From a- (not) plus himsa (harm) — non-violence. The prefix a- meaning \"not\" works exactly like the Greek one you already know."
   },
   {
    "title": "These are gift words",
    "body": "Because they were transcribed by scholars rather than soldiers, they follow the original spelling closely. Trust the phonetic rule here more than anywhere else in the book."
   }
  ],
  "words": [
   {
    "w": "kathakali",
    "say": "kah-tuh-KAH-lee",
    "def": "A highly stylized classical dance-drama from the Indian state of Kerala…",
    "hook": "four beats; the middle TH keeps its H"
   },
   {
    "w": "bhangra",
    "say": "BAH-nggruh",
    "def": "A lively and energetic style of music and dance originating from the Punjab region…",
    "hook": "the BH pair opens it"
   },
   {
    "w": "ahimsa",
    "say": "ah-HIM-sah",
    "def": "a Buddhist and Hindu and especially Jainist doctrine holding that all forms of life…",
    "hook": "a- (not) + himsa (harm)"
   },
   {
    "w": "prana",
    "say": "PRAH-nuh",
    "def": "In Hindu philosophy and yoga, the vital life force or breath energy believed to flow…",
    "hook": "the PR cluster; life breath"
   },
   {
    "w": "tulsi",
    "say": "TOOL-see",
    "def": "A sacred aromatic plant of the mint family native to India, also called holy basil…",
    "hook": "sacred basil; plain and short"
   },
   {
    "w": "bindi",
    "say": "BIN-dee",
    "def": "A decorative mark worn on the forehead, especially by Hindu women, traditionally a…",
    "hook": "from bindu, a dot"
   },
   {
    "w": "mantra",
    "say": "MA-ntruh",
    "def": "a commonly repeated word or phrase",
    "hook": "the -TRA ending, shared with sutra"
   },
   {
    "w": "dharma",
    "say": "DAH-rmuh",
    "def": "basic principles of the cosmos; also: an ancient sage in Hindu mythology worshipped…",
    "hook": "the DH opening — the chapter’s recurring test",
    "ex": "In the story, the prince follows his dharma even when it costs him the throne."
   },
   {
    "w": "nirvana",
    "say": "nih-RVAH-nuh",
    "def": "(Hinduism and Buddhism) the beatitude that transcends the cycle of reincarnation…",
    "hook": "NIR + VA + NA; the middle A is long",
    "ex": "The monk described nirvana as the end of all wanting."
   },
   {
    "w": "guru",
    "say": "GOO-roo",
    "def": "a Hindu or Buddhist religious leader and spiritual teacher",
    "hook": "two long U vowels",
    "ex": "Her grandmother was the family guru on every question of cooking."
   }
  ],
  "sc": {
   "label": "festival, faith and the arts",
   "scenes": [
    {
     "mood": "happy",
     "cap": "Words with drums in them",
     "say": "Naga, kathakali. Four beats and a TH I do not trust.",
     "show": {
      "word": "kathakali"
     }
    },
    {
     "mood": "think",
     "cap": "Trust it — and clap it",
     "say": "ka · tha · ka · li. The TH keeps its breath. Clap all four beats.",
     "show": {
      "parts": [
       "ka",
       "tha",
       "ka",
       "li"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "Beats are not spelling",
     "say": "One clap short and it collapses. Kathkali. The judge notices even if nobody else does.",
     "show": {
      "big": "kathkali"
     }
    },
    {
     "mood": "excited",
     "cap": "Four beats, four written",
     "say": "diwali, mandala, abhinaya, bhangra. If I can dance the word, I can spell the word.",
     "show": {
      "list": [
       "diwali",
       "mandala",
       "bhangra"
      ]
     }
    }
   ]
  }
 },
 {
  "category": "South Asian Words in English",
  "title": "At the microphone — the South Asian checklist",
  "difficulty": "hard",
  "concept": "Everything in this book collapses into a short routine. South Asian words reward the speller who asks the right two questions and then trusts the syllables, because these words were written to be sounded out.",
  "method": "<div class='trick'><b>THE ROUTINE</b></div>\n<b>Ask 1.</b> what language? Sanskrit, Hindi, Tamil, Persian — each has a habit\n<b>Ask 2.</b> is there a breath? test BH, DH, GH, KH, TH before the plain letter\n<b>Then.</b> count the beats out loud\n<b>Then.</b> give every unstressed vowel its written value — usually A",
  "cards": [
   {
    "title": "Two questions, most of the marks",
    "body": "Language, then aspiration. Those two answers decide the spelling of the majority of South Asian words you will ever face on a stage."
   },
   {
    "title": "A is the default vowel",
    "body": "When a vowel mumbles in one of these words, A is the highest-probability letter by a wide margin. That single habit is worth more than memorising lists."
   },
   {
    "title": "Compounds beat length",
    "body": "Long words here are nearly always two short words joined. maha+raja, katta+maram, kamar+band. Find the seam and the length stops mattering."
   },
   {
    "title": "You already know these",
    "body": "If your family speaks a South Asian language, you have an advantage no other origin gives you: you have heard these words correctly your whole life. Trust that ear — then check for the H."
   }
  ],
  "words": [
   {
    "w": "bazaar",
    "say": "b-uh-z-AH-r",
    "def": "a marketplace especially in the Middle East",
    "hook": "the double A"
   },
   {
    "w": "jodhpurs",
    "say": "JOD-purz",
    "def": "flared trousers ending at the calves; worn with riding boots",
    "hook": "the DH"
   },
   {
    "w": "mulligatawny",
    "say": "muh-lih-guh-TAH-nee",
    "def": "a soup of eastern India that is flavored with curry; prepared with a meat or chicken…",
    "hook": "the double L and the AW"
   },
   {
    "w": "catamaran",
    "say": "ka-tuh-mer-AN",
    "def": "a sailboat with two parallel hulls held together by single deck",
    "hook": "four As"
   },
   {
    "w": "cummerbund",
    "say": "KUM-er-bund",
    "def": "a broad pleated sash worn as formal dress with a tuxedo",
    "hook": "the double M",
    "ex": "He wore a red cummerbund with his black jacket."
   },
   {
    "w": "juggernaut",
    "say": "JUH-ger-nawt",
    "def": "a massive inexorable force that seems to crush everything in its way",
    "hook": "the double G and -NAUT",
    "ex": "The team became a juggernaut that no defence could slow."
   },
   {
    "w": "mahatma",
    "say": "muh-HAH-tmuh",
    "def": "(Hinduism) term of respect for a brahmin sage",
    "hook": "the merged seam"
   },
   {
    "w": "kathakali",
    "say": "kah-tuh-KAH-lee",
    "def": "A highly stylized classical dance-drama from the Indian state of Kerala…",
    "hook": "the rhythm and the TH"
   },
   {
    "w": "bandanna",
    "say": "ban-DAN-uh",
    "def": "large and brightly colored handkerchief; often used as a neckerchief",
    "hook": "the double N",
    "ex": "She tied a bandanna over her hair before painting."
   },
   {
    "w": "chutney",
    "say": "CHUH-tnee",
    "def": "a spicy condiment made of chopped fruits or vegetables cooked in vinegar and sugar…",
    "hook": "the CH and the TN",
    "ex": "There was a bowl of green chutney beside every plate."
   }
  ],
  "sc": {
   "label": "the checklist",
   "scenes": [
    {
     "mood": "happy",
     "cap": "One routine for all of them",
     "say": "Naga, the bell is in an hour. Give me the routine.",
     "show": {
      "big": "ask · breathe · beat"
     }
    },
    {
     "mood": "think",
     "cap": "Two questions carry most of it",
     "say": "Ask the language. Ask about the breath. Those two answers decide most of them.",
     "show": {
      "parts": [
       "language?",
       "breath?"
      ]
     }
    },
    {
     "mood": "oops",
     "cap": "And the third thing",
     "say": "The doubles. bazaar, cummerbund, bandanna. You will remember the H and forget the doubling.",
     "show": {
      "list": [
       "bazaar",
       "bandanna"
      ]
     }
    },
    {
     "mood": "excited",
     "cap": "Then the checklist has four",
     "say": "Language. Breath. Beats. Doubles. Every unstressed vowel is an A until proven otherwise.",
     "show": {
      "list": [
       "dharma",
       "catamaran",
       "chutney"
      ]
     }
    }
   ]
  }
 }
];
