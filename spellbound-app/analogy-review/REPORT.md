# Analogy content review — the round-3 report

The owner releases the Analogies tab, its lessons, Mock Analogy Bee, Against the Clock, the Link Finder and My Feed's analogy cards on this report (brief 4.5, decision 2). Until then they are reachable only in tester mode.

**How it was reviewed.** Three independent agent rounds over every unit — 1285 units: 1153 items, 85 stems, 45 lessons, 2 cards. Round 1 saw the answer and judged uniqueness, accuracy and kid-safety. Round 2 was a different agent that solved every item BLIND (the item as a child meets it, options shuffled, no answer, no link name) and never saw round 1. Round 3, a third agent, adjudicated every disagreement and re-checked passes. A unit ships only with a pass in rounds 1, 2 and 3 of one cycle. Units round 3 fixed (wrong options dropped, a wrong-sense gloss hidden, wording rewritten) or passed over an earlier fail went through all three rounds again in the next cycle (3 cycles in all); a unit is decided by the last cycle it went through, and anything without three passes there was dropped. Ledger: `analogy-review.json` ({item, round, verdict, reason, cycle}); every sheet and verdict is in `rounds/` and `rounds2/`.

**The four known faults were caught in round 1:** sibling:sister as a synonym (item:1), the "ass" option (item:5g, item:xl), censure/reproach (item:ow) and cache/archive (item:xc) — round 1's prompt did not need fixing.

## Counts

| | round 1 | round 2 (blind) | round 3 |
|---|---|---|---|
| cycle 1 | 1729 (714 fail, 1015 pass) | 1729 (1134 fail, 595 pass) | 1729 (418 fail, 437 fix, 874 pass) |
| cycle 2 | 886 (836 pass, 50 fail) | 886 (873 pass, 13 fail) | 886 (835 pass, 38 fix, 13 fail) |
| cycle 3 | 71 (61 pass, 10 fail) | 71 (59 pass, 12 fail) | 71 (59 pass, 12 fail) |

**Shipped: 1285 units** (1153 items, 85 stems, 45 lessons, 2 cards). **Dropped: 452** (439 items, 13 stems).

Round 2 scoring: in cycle 1 a blind item failed on a different pick, a second defensible answer, an unsafe word OR any written worry (stricter than the brief; round 3 adjudicated every one). From cycle 2 on, the brief's own rule: a different pick, a second defensible answer or an unsafe word fails, and a worry passes to round 3 as a note. 11 cycle-2 items first shown with an empty A:B pair were solved again on a fair sheet (`rounds2/superseded-b2-1.json`).

## Every fix (round 3, every cycle)

| cycle | unit | dropped options | gloss | why |
|---|---|---|---|---|
| 1 | item:6 | invention |  | Gadget/device is a standard near-synonym pair children use interchangeably, so r1's 'broader' objection does not sink it. Both rounds rightly flag 'invention' (a gadget is an invention; the gloss even says 'invented'). D |
| 1 | item:8 | package |  | Shipment/freight is a sound synonym pair. Both rounds agree 'package' reads as the same thing as a shipment to a child; drop it. Remaining inventory/receipt/premium are clearly wrong. |
| 1 | item:10 | adult |  | Pair is right. Both rounds note 'adult' is a defensible opposite of young (young animal vs adult); drop it. innocent/timid/tame are not opposites. |
| 1 | item:12 |  | hidden | Relation cruel/kind is exactly right and r2 passed it; r1 is correct that the gloss shows kind the noun ('a category of things'). Hide the gloss. 'kindness' is a noun, not the opposite of the adjective cruel. |
| 1 | item:13 |  | hidden | give/take is right (r2 pass); gloss is the noun 'take' (income or profit), wrong sense per r1. Hide. |
| 1 | item:15 |  | hidden | buy/sell is right (r2 pass); gloss is the noun 'sell' (activity of persuading), wrong sense per r1. Hide. |
| 1 | item:16 |  | hidden | short/long is right (r2 pass); gloss is the verb 'long' (desire strongly), wrong sense per r1. Hide. |
| 1 | item:18 | november, december | hidden | night/day is right. Gloss is the 24-hour 'day', which contains the night, so hide it (r1). Also 'november' and 'december' are proper nouns shown lowercase as filler; drop them, leaving winter/lit. |
| 1 | item:21 | corn | hidden | wheat is a kind of grain. r1 is right that 'corn' is the British word for cereal grain (wheat is a kind of corn) and that the gloss shows a grain of sand. Drop corn, hide gloss; harvest/bean/coconut remain wrong. |
| 1 | item:27 | field | hidden | diamond is a kind of gem. r1 is right: a baseball diamond is a kind of field, and the gloss ('art highly prized') is the wrong sense. Drop field, hide gloss; emerald/ruby are co-members, not categories. |
| 1 | item:33 | mentor |  | teach/teacher is exact. r1 is right that a mentor is also one who teaches; drop it. instruction/follower/composer are not people who teach. |
| 1 | item:42 |  | hidden | artificial/natural is right (r2 pass); gloss is the noun 'a natural' (someone certain to succeed), wrong sense per r1. Hide. |
| 1 | item:43 | decrease |  | Both rounds agree 'decrease' is also an opposite of expand; drop it. widen/grow/increase are not opposites. shrink gloss correct. |
| 1 | item:44 |  | hidden | shut/open is right (r2 pass); gloss is the noun 'the open' (unobstructed space), wrong sense per r1. Hide. |
| 1 | item:45 |  | hidden | temporary/permanent is right (r2 pass); gloss describes a hair perm, wrong sense per r1. Hide. |
| 1 | item:46 | comply | hidden | refuse/accept is right. Both rounds agree 'comply' is a defensible opposite of refuse; drop it. Gloss 'consider or hold as true' is the belief sense, not agreeing/receiving; hide. |
| 1 | item:47 |  | hidden | accept/refuse is right (r2 pass). r1 is right that the gloss shows refuse = rubbish, a different word in sound and sense; hide. comply/justify/receive/bread are not opposites of accept. |
| 1 | item:48 | charity |  | donation/gift is sound. Both rounds agree 'charity' can mean a donation; drop it. nonprofit/tuition/broker remain wrong. |
| 1 | item:53 | cedar |  | trunk/elephant is right. Both rounds agree a cedar also has a trunk; drop it. stalk and stump do not have a trunk as a part (a stump is what is left of one). |
| 1 | item:55 | bottom |  | sole/shoe is right (r2 pass). r1 is right to object to 'bottom': the sole IS the bottom of a shoe, which muddles the part-whole question, and it is a giggle word. Drop it; thumb/elbow remain. |
| 1 | item:56 | poetry |  | verse/poem is right. Both rounds agree 'poetry' is a defensible whole; drop it. sung/composer/accent remain wrong. |
| 1 | item:57 | week |  | minute/hour is right (r2 pass). r1 is right that a minute is also part of a week; drop it. The number words thirty/forty/twenty are not wholes. |
| 1 | item:62 | metal |  | ring/gold is the intended material. Both rounds agree 'metal' is equally true; drop it. call/screw/golden are not materials a ring is made from. |
| 1 | item:64 | shred | hidden | scissors/cut is right (r2 pass). r1: scissors can shred, and the gloss is 'a share of the profits'. Drop shred, hide gloss; sew/magnify/bore remain wrong. |
| 1 | item:69 |  | hidden | thermometer/measure is right (r2 pass); gloss is the noun 'a measure' (a manoeuvre toward a goal), wrong sense per r1. Hide. |
| 1 | item:72 |  | hidden | A sieve is used to strain (straining pasta is familiar by age 12), so r1's obscurity point is weak; r2 passed. The physics-deformation gloss is the wrong sense; hide it. |
| 1 | item:73 | disposition |  | tendency/inclination is sound. Both rounds agree 'disposition' is also a synonym; drop it. tolerance/acceptance/skepticism remain wrong. |
| 1 | item:75 | calamity |  | devastation/ruin is sound. Both rounds agree 'calamity' is defensibly close; drop it. emptiness/mishap remain clearly wrong. |
| 1 | item:77 | resentment, animosity |  | malice/spite is sound. Both rounds agree animosity (and r1 adds resentment) are thesaurus synonyms of malice; drop both. acceptance/leniency remain. |
| 1 | item:79 | cravat, canvases |  | Children call a quilt a blanket and dictionaries list them as synonyms, so r1's hyponym objection does not sink it at 'about the same'. Both rounds object to the odd distractors 'cravat' and 'canvases'; drop them, leavin |
| 1 | item:80 | hate, dickens |  | hatred/animosity is sound. Both rounds agree 'hate' is also a synonym and 'dickens' is a minced oath (and a lowercased surname); drop both. adoration/acceptance remain. |
| 1 | item:98 | monument | hidden | Statue/sculpture are listed synonyms and children use them interchangeably for a carved figure. Both rounds flag 'monument' as defensible; drop it. The gloss 'a three-dimensional work of plastic art' will be read as art  |
| 1 | item:105 | menial, cooper |  | workman/laborer is sound (r2 pass). r1 is right that 'menial' as a noun means a servant and is demeaning; also 'cooper' is itself a kind of workman. Drop both; conveyor/wagon remain. |
| 1 | item:115 | aboriginal |  | flora/vegetation is sound. Both rounds agree lowercase 'aboriginal' is an identity term used as filler; drop it. fauna/annual remain wrong. |
| 1 | item:124 | slag |  | Lather is soap foam and the two are used interchangeably, so r1's hyponym point does not sink it (r2 passed). Neither round noticed 'slag', which is a common British insult for a woman; it fails as a word even in its inn |
| 1 | item:128 | disability, distress |  | difficulty/trouble is sound (r2 pass). r1 is right that 'disability' beside difficulty/trouble implies disability = trouble (stigmatising) and 'distress' is arguable; drop both. exhaustion/spite remain. |
| 1 | item:149 | assent | hidden | approve/endorse is sound. Both rounds agree 'assent' is also a synonym; drop it. The gloss 'Be behind' reads as physical position to a child; hide it. repaid/repeal/amend remain wrong. |
| 1 | item:151 | wallet | hidden | A purse is a kind of container (r2 pass). r1 is right that in British English a purse is a small wallet; drop it. The gloss trails into 'a large metal boxlike object of standardized…' (a shipping container), which mislea |
| 1 | item:159 | arab |  | trader/merchant is sound. Both rounds agree lowercase 'arab' beside trader/bazaar is an ethnic stereotype; drop it. bazaar/export/pelt remain wrong. |
| 1 | item:161 | fetter |  | handcuff/manacle is sound at L7. Both rounds agree 'fetter' is also a synonym; drop it. deterrent/impediment/pillory are not synonyms of handcuff. |
| 1 | item:163 | september | hidden | begin/finish is right (r2 pass). Gloss is the noun 'a finish' (surface texture), wrong sense per r1; hide. 'september' is a proper noun shown lowercase as filler; drop it. arrive/early/day remain wrong. |
| 1 | item:166 | garter |  | manacle/shackle is exact (r1 pass). r2 is right that 'garter' has a lingerie association; drop it. sling/barrage remain wrong. |
| 1 | item:175 | salary |  | stipend/allowance is sound at L6. Both rounds agree 'salary' is a near-synonym of stipend; drop it. 'allow' is only a family member, and tuition/shareholder are wrong. |
| 1 | item:176 | nile, estuary |  | Swamp is the everyday word children use for a wetland, so 'about the same' holds (r2 pass). r1 is right that 'nile' is a lowercase proper noun; also 'estuary' is itself a wetland type a child could defend. Drop both; hab |
| 1 | item:185 | urine |  | accumulation/buildup is sound. Both rounds agree 'urine' is toilet-giggle filler; drop it. melanin/breakdown/albumin remain wrong. |
| 1 | item:186 | considerate, kindly |  | courteous/polite is exact. Both rounds agree 'considerate' (and r1 adds 'kindly') are synonyms; drop both. frolicsome/boorish remain wrong. |
| 1 | item:187 | initiative |  | undertaking/project is sound (r2 pass). r1 is right that 'initiative' (a new plan) is arguable; drop it. diversion/advancement remain. |
| 1 | item:g | trek |  | Hiking is walking and children use the words for the same activity ('go for a hike/walk'), so 'about the same' holds. Both rounds flag 'trek' as a synonym of hike; drop it. trail/scout/driveway remain wrong. |
| 1 | item:i | path |  | road/street is a standard L1 synonym pair (r2 pass). r1 is right that 'path' is arguable; drop it. traffic/driver/transit remain wrong. |
| 1 | item:j | vacation |  | trip/journey is sound (r2 pass). r1 is right that a child equates a vacation with a trip; drop it. bus/drove/backpack remain. |
| 1 | item:n | arab |  | trader/dealer is sound. Both rounds agree lowercase 'arab' beside trader/bazaar is an ethnic stereotype; drop it. bazaar/export/import remain wrong. |
| 1 | item:o | testimony, witness |  | evidence/proof are listed synonyms and children treat them the same (r2 pass). r1 is right that 'testimony' is a kind of evidence; 'witness' in 'bear witness' also means evidence. Drop both; validity/defendant remain. |
| 1 | item:r | poker |  | playing/performing holds in the music/drama sense the gloss names, and hockey/soccer are things you play but not synonyms of playing, so performing is the one answer (r2 pass). r1 is right that 'poker' is a gambling game |
| 1 | item:w |  | hidden | cent = penny holds in the US and the UK penny is likewise one hundredth (r2 pass). r1 is right that the gloss ('a fractional monetary unit of ireland and the united kingdom') shows the UK unit, lowercases two country nam |
| 1 | item:x | mentor |  | tutor/instructor is sound (r2 pass). r1 is right that 'mentor' is also a synonym of tutor; drop it. seminar/tuition/nonprofit remain. |
| 1 | item:1d | behind |  | bottom/top is exact (r2 pass). 'bottom' is an ordinary word, but 'behind' as a noun is slang for buttocks, as r1 says; drop it. rim/dive/sink remain wrong. |
| 1 | item:1k | ascend |  | sink/float is right. Both rounds agree 'ascend' is also an opposite of sink; drop it. leak/shrink/wet remain wrong. |
| 1 | item:1m | hatred |  | love/hate is right. Both rounds agree 'hatred' is also an opposite of love (noun); drop it. anger/rich/lend remain wrong. |
| 1 | item:1n | mini | hidden | big/small is right (r2 pass). r1 is right: 'mini' means small and is a defensible opposite, and the gloss is 'the small of the back'. Drop mini, hide gloss. |
| 1 | item:1q |  | hidden | heavy/light is right (r2 pass); gloss is light as radiation, wrong sense per r1. Hide. |
| 1 | item:1w | storm |  | calm/stormy is right (r2 pass). r1 is right that 'storm' is the noun opposite of calm; drop it. confident/awake/quiet remain wrong. |
| 1 | item:1z | reckless |  | timid/brave is right (r2 pass). r1 is right that 'reckless' is arguably an opposite of timid; drop it. envy/tame/cruel remain wrong. |
| 1 | item:2e | mom |  | kitchen is a kind of room. Both rounds agree 'mom' beside kitchen plays to a gender stereotype; drop it. mop/towel remain (two). |
| 1 | item:2g |  | hidden | A boot is a type of shoe in standard dictionaries (Cambridge: 'a type of shoe that covers the whole foot and the lower part of the leg'), and r2 called it acceptable. r1's real point is that the shown gloss says shoes st |
| 1 | item:2v | pig |  | hog is a kind of animal. Both rounds agree a hog is a kind of pig, a second valid category; drop it. pork/ham/gravy are not categories. |
| 1 | item:3w |  | hidden | climb/climber is exact (r2 pass); gloss is the climbing-plant sense, wrong per r1. Hide. |
| 1 | item:4b | loyalty |  | commitment/dedication is sound (r2 pass). r1 is right that 'loyalty' matches the gloss ('wholehearted fidelity'); drop it. betrayal/mandatory/retirement remain wrong. |
| 1 | item:4f | comment |  | note/message is sound. Both rounds agree 'comment' is also a sense of note; drop it. paragraph/musical remain wrong. |
| 1 | item:4j |  | hidden | ginger is a kind of plant (r2 pass); gloss is the factory sense, wrong per r1. Hide. curry/garlic/soy/basil are co-members or foods, not categories. |
| 1 | item:4k |  | hidden | curry is a kind of dish (r2 pass); gloss is dishware, wrong per r1. Hide. |
| 1 | item:4q | feet, hind |  | toe/foot is right. Both rounds agree 'feet' is the plural trap; also 'hind' (a female deer, or hind leg) has toes. Drop both; thumb/elbow remain. |
| 1 | item:4r | hind |  | hoof/horse is right (r2 pass). r1 is right that 'hind' (a female deer, or a hind leg) has hooves; drop it. paw/toe remain wrong. |
| 1 | item:4t | sweater |  | collar/shirt is right. Both rounds note some sweaters have collars; drop it. sleeve/hem remain (parts, not wholes). |
| 1 | item:4w | pony | hidden | mane/lion is right. Both rounds agree a pony has a mane; drop it. The gloss writes 'africa and india' in lowercase, a spelling error in a spelling app; hide it. paddock/moorland/trot remain wrong. |
| 1 | item:4y | iris |  | pupil/eye is right. r1 is right that the pupil sits in the iris, so 'iris' is defensible; drop it. r2's point that 'student' is a fair other-sense trap is right; colon/student remain. |
| 1 | item:5b | porcelain |  | pottery/clay is right (r2 pass). r1 is right that 'made of porcelain' is everyday usage; drop it. shard/artisan/bronze remain wrong. |
| 1 | item:5c | wicker |  | chair/wood is right. Both rounds agree wicker chairs are common; drop it. gym/wooden/dresser remain wrong. |
| 1 | item:5g | ass, tofu | hidden | omelet/egg is right. Both rounds agree 'ass' is a common swear word even in its donkey sense; drop it. Also drop 'tofu' (tofu/eggless omelets are common in vegetarian households in this audience). The gloss is the biolog |
| 1 | item:5j | granite |  | statue/marble is right. Both rounds agree statues are also carved from granite; drop it. monument/sculptor/figure are not materials. |
| 1 | item:5k | cider |  | basket/wicker is right. Both rounds note 'cider' is alcoholic in UK/Indian usage; drop it. bale/sack/oat remain. |
| 1 | item:5l |  | hidden | butter is made from cream (r2 pass); gloss is 'the best people in a group', wrong per r1. Hide. |
| 1 | item:5s | felt |  | blanket/wool is right. Both rounds agree felt blankets exist; drop it. lawn/sweater/cover are not materials. |
| 1 | item:5u | gold |  | coin/metal is right. Both rounds agree gold coins exist; drop it. penny/dollar/glass remain wrong. |
| 1 | item:5w | glass |  | table/wood is right. Both rounds agree glass tables are common; drop it. dinner/grid/wooden remain. |
| 1 | item:6c |  | hidden | grater/shred is right (r2 pass); gloss is the noun 'a shred' (tiny amount), wrong per r1. Hide. |
| 1 | item:6f | boil, bake |  | stove/cook is right. Both rounds note a stove boils (and bakes); drop both. cool/shred remain wrong. |
| 1 | item:6g | cool |  | freezer/freeze is right. Both rounds note 'cool' is near; drop it. wake/shred/bake remain wrong. |
| 1 | item:6h | magnify, photograph | hidden | telescope/observe is right. Both rounds agree 'magnify' is equally valid; telescopes are also used to photograph the sky. Drop both. The gloss ('discover or determine the existence of') is not the watching sense; hide it |
| 1 | item:6i | sweep | hidden | oar/row is right (r2 pass). r1 is right that the gloss is the noun 'a row' (a line) and that 'sweep' is a rowing term; drop sweep, hide gloss. |
| 1 | item:6j |  | hidden | glue/stick is right (r2 pass); gloss is the noun 'a stick' of wood, wrong per r1. Hide. |
| 1 | item:6k |  | hidden | whisk/beat is right (r2 pass); gloss is a policeman's beat, wrong per r1. Hide. |
| 1 | item:6l |  | hidden | shovel/dig is right (r2 pass); gloss is an archaeological dig, wrong per r1. Hide. |
| 1 | item:6m |  | hidden | broom/sweep is right (r2 pass); gloss is 'a wide scope', wrong per r1. Hide. |
| 1 | item:6n | signal | hidden | alarm/wake is right. Both rounds agree an alarm also signals; drop it. Gloss is 'the consequences of an event' (in the wake of); hide it. freeze/unlock/strain remain. |
| 1 | item:6p | cook |  | spoon/stir is right (r2 pass). r1 is right that a wooden spoon is used to cook; drop it. bake/shred/boil remain wrong. |
| 1 | item:6r |  | hidden | ruler/measure is right (r2 pass); gloss is the noun 'a measure' (manoeuvre), wrong per r1. Hide. |
| 1 | item:6v | beat | hidden | hammer/pound is right. Both rounds agree 'beat' is equally valid; drop it. Gloss is the weight unit; hide it. bore/sweep/sew remain. |
| 1 | item:6w |  | hidden | net/catch is right (r2 pass); gloss is 'a catch' (hidden drawback), wrong per r1. Hide. |
| 1 | item:6y |  | hidden | saw/cut is right (r2 pass); gloss is 'a share of the profits', wrong per r1. Hide. |
| 1 | item:7c | option, preference |  | choice/pick holds ('take your pick'). Both rounds agree 'option' and 'preference' are also synonyms (r2 blind-picked option); drop both. outlook/favour remain. |
| 1 | item:7f | cider |  | filling/stuffing is sound in the food and cushion senses (r2 pass). r1 is right about 'cider' (alcoholic in UK/India); drop it. hum/savory/pastry remain. |
| 1 | item:7i | korean |  | blend/mixture is exact. Both rounds agree lowercase 'korean' is a nationality used as filler; drop it. genre/mute/clash remain. |
| 1 | item:7k | harassment |  | intimidation/bullying is sound and familiar at L4. Both rounds agree 'harassment' is also a synonym; drop it. compulsion/subversion remain. |
| 1 | item:7n | saline |  | seawater/saltwater is used interchangeably and r2 passed. r1 is right that 'saline' (salt water) is defensible; drop it. evaporation/beaker/reservoir remain. |
| 1 | item:7q | malice, resentment |  | animosity/hostility is sound. Both rounds agree 'malice' and 'resentment' are also synonyms; drop both. indignation/leniency remain. |
| 1 | item:7r |  | hidden | feather/plume is a dictionary synonym pair (r2 pass). r1 is right that the gloss ('anything that resembles a feather') is the smoke-plume sense; hide it. crest/peacock/stork/stripe are not synonyms. |
| 1 | item:7w | endeavor, hobby |  | pursuit/chase is sound with the gloss shown. Both rounds agree 'endeavor' and 'hobby' fit pursuit's other sense; drop both. ambition/liberation remain. |
| 1 | item:8c | monday, tuesday |  | arrive/arrival is exact. Both rounds agree 'monday' and 'tuesday' are proper nouns shown lowercase; drop them. noon/leave remain. |
| 1 | item:8h | vertebral |  | spiny is the only member of spine's family. Both rounds note the anatomy distractors frame spine as the backbone; 'vertebral' is the adjective for that sense and a child could defend it. Drop it; caudal/alveolar/pectoral |
| 1 | item:9e | andean |  | hill/hilly is exact (r2 pass). r1 is right that 'andean' is a proper adjective shown lowercase; drop it. grassy/steeper/snowy remain. |
| 1 | item:9h |  | hidden | kettle/boil is right (r2 pass); gloss is the pus-filled sore, wrong sense and gross per r1. Hide. |
| 1 | item:9j | observe |  | microscope/magnify is right. Both rounds agree 'observe' is equally valid; drop it. strain/light/freeze remain. |
| 1 | item:9t | farmhand |  | ranch/rancher is exact (r2 pass). r1 is right that 'farmhand' is also a person who works a ranch; drop it. mow/estate/bunk remain. |
| 1 | item:9v | punk |  | compose/composer is exact (r2 pass). r1 is right that 'punk' is a common insult; drop it. elegy/lyric/solo remain. |
| 1 | item:9x | firefighter, hostage |  | rescue/rescuer is exact (r2 pass). r1 is right that a firefighter also rescues and 'hostage' is heavy; drop both. shipwreck/salvation remain. |
| 1 | item:a4 | bondage |  | Agree with R1/R2 that 'bondage' has a strong sexual sense and must go. liberate -> liberation is an exact word-family pair, the gloss is the right sense, and confinement/oppression/onus share no root with liberate, so th |
| 1 | item:a8 | fibrosis, thyroid | hidden | abnormal -> abnormality is an exact word-family pair. Agree with R1/R2: 'fibrosis' and 'thyroid' are obscure medical distractors (drop), and the gloss frames abnormality as 'defective genes or developmental deficiencies' |
| 1 | item:ae | arousal |  | Agree 'arousal' has a common sexual sense and must be dropped. responsive -> responsiveness is an exact word-family pair; stimuli/stimulus/activation share no root, and the gloss describes the right sense. |
| 1 | item:ax | asexual, ovarian |  | metamorphosis -> metamorphic is an exact word-family pair and the gloss ('of or relating to metamorphosis') is right. Agree 'ovarian' and 'asexual' are reproductive words out of place here; drop them, leaving mutant/rudi |
| 1 | item:b0 | munch, bitten | hidden | nibble -> devour is a true stronger/weaker pair. Agree with R1 (overruling R2's pass): 'munch' is also a stronger nibble; 'bitten' (bite) is too, so drop both. The gloss 'Destroy completely' is the wrong sense of devour; |
| 1 | item:b4 | pathetic |  | sad -> miserable is a true stronger pair and the gloss is the right sense. Agree with R1 over R2: 'pathetic' is a common playground put-down and also means 'causing sadness', so it is both unsuitable and arguable; drop i |
| 1 | item:b6 | monsoon |  | breeze -> gale is a true stronger pair and the gloss fits. Agree with R1 over R2: monsoon is literally a seasonal wind, and a child from an Indian household may defend it as a stronger breeze; drop it. sway/sunflower/dew |
| 1 | item:bc | terrified |  | worried -> frantic is a true stronger pair (frantic with worry) and the gloss is right. Agree 'terrified' is defensible as an extreme of worried; drop it. astonished/thrilled/exhausted remain and none is a stronger worri |
| 1 | item:bp | frigid | hidden | dim -> dark is a true stronger pair. Drop 'frigid': 'frigid' has a dictionary sexual sense (an insult aimed at women), so it is a double-meaning word and cannot appear for 8-15; R2 was right to flag it, R1's pass missed  |
| 1 | item:bq | frigid |  | pond -> lake is a true stronger pair and the gloss is right. Drop 'frigid': 'frigid' has a dictionary sexual sense (an insult aimed at women), so it is a double-meaning word and cannot appear for 8-15; R2 was right to fl |
| 1 | item:br | largest |  | big -> huge is a true stronger pair and the gloss is right. Agree with R1 over R2: 'largest' (superlative of large) is defensible as a stronger big; drop it. tiny/mini/small remain. |
| 1 | item:bs | frigid |  | stream -> river is a true stronger pair and the gloss is right. Drop 'frigid': 'frigid' has a dictionary sexual sense (an insult aimed at women), so it is a double-meaning word and cannot appear for 8-15; R2 was right to |
| 1 | item:bu | frigid |  | warm -> hot is a true stronger pair. Drop 'frigid': 'frigid' has a dictionary sexual sense (an insult aimed at women), so it is a double-meaning word and cannot appear for 8-15; R2 was right to flag it, R1's pass missed  |
| 1 | item:c8 | gaudy, womanly | hidden | tasteful -> tasteless is a true opposite. Agree with R1/R2: 'gaudy' is also an opposite of tasteful (drop), and 'womanly' beside tasteful/genteel reads as a gender stereotype (drop). The gloss 'Lacking flavor' is the wro |
| 1 | item:ci | harmless | hidden | dangerous -> safe is a true opposite. Agree 'harmless' is also an opposite of dangerous; drop it. The gloss is the strongbox noun sense of safe; hide. lethal/unsafe/safety remain. |
| 1 | item:ck | surplus, limitless |  | scarce -> plentiful is a true opposite and the gloss is right. Agree 'surplus' and 'limitless' are near-opposites a child could defend; drop both. meager/rare remain (both synonyms). |
| 1 | item:cl | sink |  | ascend -> descend is the exact opposite and the gloss is right. Agree with R1 over R2: 'sink' (go down) is a defensible opposite of ascend; drop it. descendant/float/shrink remain. |
| 1 | item:cp | olympic |  | successful -> unsuccessful is an exact opposite. Agree with R1 over R2: 'olympic' is a proper adjective in lower case; drop it. costly/effective remain (two). |
| 1 | item:d1 |  | hidden | Agree with R1 (gloss-only): taro is truly a kind of plant and radish/sesame/parsnip/dill are not categories it belongs to, but 'plant' is glossed as a factory. Hide the gloss. |
| 1 | item:d2 | asiatic |  | civet -> mammal is true and the gloss is right. Agree 'asiatic' is a dated, sometimes offensive proper adjective in lower case; drop it. marten/blackbird/muskrat are not categories a civet belongs to. |
| 1 | item:d9 | harp |  | Overrules R1's obscurity fail: zither is a familiar alphabet-book word, and 'instrument' is the only category on offer. But some zithers are sold as harps (lap harp, autoharp), so a child can defend 'harp'; drop it. The  |
| 1 | item:dj | parasite |  | flea -> insect is true and the gloss is right. Agree a flea is also a parasite; drop it. larvae/mite/anteater are not categories a flea belongs to (a mite is an arachnid). |
| 1 | item:dm |  | hidden | Agree with R1 (gloss-only): capsicum is a kind of plant and the fruit distractors are not categories it belongs to, but 'plant' is glossed as a factory. Hide. |
| 1 | item:dn |  | hidden | Agree with R1 (gloss-only): caraway is a kind of plant and the herb distractors are not categories it belongs to; caraway (seeds) is a familiar kitchen word, so not too obscure, but 'plant' is glossed as a factory. Hide. |
| 1 | item:dt | minstrel | hidden | flamenco -> dance is true. Partly agree with R2: 'minstrel' carries the blackface minstrel-show history; drop it, leaving jive/dancer (flamenco is not a kind of jive). The gloss is the VERB sense of dance while flamenco  |
| 1 | item:du | minstrel | hidden | rumba -> dance is true. Drop 'minstrel' (blackface minstrel-show association, as R2 flagged), leaving jive/dancer. The gloss is the verb sense of dance, not the noun used here; hide. |
| 1 | item:dw | gull |  | seagull -> bird is true and the gloss is right. Agree a seagull is a gull, so 'gull' is a second answer; drop it. swipe/screech remain. |
| 1 | item:dx | lens |  | magnifier -> instrument is true. Agree a magnifier is a lens; drop it. spectra/microscopy/instrumental remain. Gloss is the general instrument sense, which fits. |
| 1 | item:e6 |  | hidden | Agree with R1 (overruling R2's pass on the gloss only): vaporize -> vaporization is exact and the distractors share no root, but the gloss 'Annihilation by vaporizing something' is the violent sense. Hide. |
| 1 | item:ec | visionary |  | realistic -> unrealistic is exact. Agree with R1 that 'visionary' (idealistic, impractical) is a near-opposite; drop it. cinematic/practical/artistic remain. |
| 1 | item:ef |  | hidden | Agree with R1: wobbly -> steady is a true opposite and snug/sag/doorknob/freezer are not opposites, but the gloss shows the 'boyfriend/girlfriend' noun sense. Hide. |
| 1 | item:eg | wholesome, productive |  | beneficial -> advantageous is a true synonym and the gloss is right. Agree 'wholesome' is a defensible synonym; 'productive' is also listed as one in some thesauri. Drop both; nutritional/advantage remain. |
| 1 | item:es | oblong |  | oval -> ellipse is a standard synonym pair and the gloss is the right (if technical) sense. Agree 'oblong' is commonly used for oval shapes; drop it. round/lob/knob remain. |
| 1 | item:f2 | considerate, kindly |  | attentive -> careful is a thesaurus synonym (heedful) and the gloss mentions attention. Agree 'considerate' is a dictionary sense of attentive, and 'kindly' rides on the same sense; drop both. heedless/neglectful (antony |
| 1 | item:fd | neurotic |  | fixation -> preoccupation is a true synonym and the gloss is right. Agree 'neurotic' is a stigmatising mental-health label; drop it. partiality/preoccupy/vulnerability remain. |
| 1 | item:ff | floodlight |  | illuminate -> brighten is a true synonym and the gloss is right. Overrules R2 and refines R1: as a verb, 'floodlight' means to illuminate with floodlights, a defensible synonym; drop it. moonlight/flicker/foreground rema |
| 1 | item:fk |  | hidden | Agree with R1: rational -> irrational is exact and the distractors are not opposites, but the gloss is the maths noun sense. Hide. |
| 1 | item:fq | went | hidden | Agree with R1: arrive -> leave is a true opposite, but 'went' (past of go) invites a child to call it the opposite of arrive (drop), and the gloss is the noun sense 'time off work' (hide). appear/day/begin remain. |
| 1 | item:fw |  | hidden | Agree with R1: shallow -> deep is exact and the distractors are not opposites, but the gloss is the noun sense ('the central and most profound part'). Hide. |
| 1 | item:fz |  | hidden | Agree with R1: proud -> humble is a true opposite and the distractors are not opposites, but the gloss is the verb sense. Hide. |
| 1 | item:g1 | stormy | hidden | Agree with R1/R2: sunny -> cloudy is a true opposite, but 'stormy' is also defensible (drop) and the gloss 'lacking definite form' is the wrong sense (hide). joyful/summer/winter remain. |
| 1 | item:g8 |  | hidden | Agree with R1: loud -> quiet is exact, but the gloss is the noun sense 'calm weather'. Hide. |
| 1 | item:ga |  | hidden | Agree with R1: frequent -> rare is exact, but the gloss 'not widely known' is not the 'seldom' sense. Hide. |
| 1 | item:ge |  | hidden | Agree with R1: stormy -> calm is a true opposite, but the gloss is the noun 'steadiness of mind'. Hide. |
| 1 | item:gi | absinthe |  | acrid -> acridity is an exact word-family pair. Agree 'absinthe' is an alcoholic drink; drop it. wormwood/sorrel/thyme remain. |
| 1 | item:gu |  | hidden | Overrules R2's bare fail on the relation, which is exact (entangle -> entanglement), and the distractors share no root. But the gloss shows the 'trap that ensnares its victim' sense rather than the act or state of entang |
| 1 | item:gy | pathetic |  | rapture -> rapturous is exact and the gloss is right. Drop 'pathetic', a common put-down (same call as item:b4). sorrowful/regretful/thankful remain. |
| 1 | item:gz | eleusinian |  | mystery -> mysterious is exact. Agree with R2 that 'eleusinian' is a proper adjective in lower case (and names a religious rite); drop it. suspenseful/imponderable/allegorical remain. |
| 1 | item:hj | sulfide |  | pyrite -> mineral is true (fool's gold) and the gloss is right. Agree pyrite is iron sulfide; drop 'sulfide'. hematite/arsenate/lanthanum remain. |
| 1 | item:hw | twill |  | gabardine -> fabric is true and the gloss is right. Agree gabardine is a twill weave, so 'twill' is a second category; drop it. argyle/chemise/crinoline remain. |
| 1 | item:hy | alsatian | hidden | quiche -> dish (of food) is true. Agree with R1 that the gloss is the dishware sense; hide. 'alsatian' is a proper adjective in lower case; drop. marinara/anchovy/quince remain. |
| 1 | item:i1 | aqua |  | Overrules R2's bare fail: turquoise is a mineral and the gloss is right. But children know turquoise as a colour, and 'aqua' is a neighbouring blue-green they could defend; drop it. glint/dapple/fleck remain. |
| 1 | item:i7 | malaysian |  | mesquite -> tree is true and the gloss is right. 'malaysian' is a national name in lower case used as filler; drop it. hazel/myrtle/sedge remain. |
| 1 | item:id | overall |  | coverall -> garment is true and the gloss is right. Agree with R2 that 'overall' is a near-synonym a child could choose; drop it. overcoat/dolman/necktie remain. |
| 1 | item:if | buttock |  | quadruped -> animal is true and the gloss is right. Agree 'buttock' is a giggle-prone body word; drop it. tarsus/incisor/pectoral remain. |
| 1 | item:ig | obesity, indulgence |  | excess -> overabundance is a true synonym and the gloss is right. Agree 'obesity' is body-stigmatising and 'indulgence' is a defensible synonym of excess; drop both. anemia/depletion remain. |
| 1 | item:ir | turnip |  | rutabaga -> vegetable is true and the gloss is right. Agree the rutabaga is the swede or 'yellow turnip', so 'turnip' is a second category; drop it. dill/radish/taro remain. |
| 1 | item:is |  | hidden | Harpsichord is a kind of instrument, and every wrong option fails the link (tambourine is a sibling, pavane/minuet are dances, instrumental is an adjective), so R1's pass holds on the link. But the gloss is the general ' |
| 1 | item:j3 |  | hidden | tall -> short is a sound opposite, and high, sunny, narrow and entrance are not opposites of tall, so R2's bare fail does not hold for the link. But the gloss is the length/duration sense ('from end to end ... lasting a  |
| 1 | item:j6 |  | hidden | guilty -> innocent is a sound opposite, and no wrong option is one, so the link is fine. I agree with R1 that the gloss is the noun sense ('a person who lacks knowledge of evil'), not 'not guilty'. Hide it. |
| 1 | item:j9 | fright, panic |  | dread = apprehension is a sound synonym pair (fearful anticipation). Both rounds are right that 'fright' is also a synonym of dread, and 'panic' is close enough to argue. Dropping both leaves nightmare and timidity, neit |
| 1 | item:jh | hoax, laugh |  | joke = jest is a sound synonym pair. But 'hoax' (a practical joke) and 'laugh' (informal 'it was a laugh/joke') can be argued as synonyms. Drop both. Silly and nonsense remain, and neither means a joke. |
| 1 | item:jp | murder |  | rogue = rascal is sound, and felon, cabal and traitor do not mean a rogue. I agree with R2 that 'murder' is a grim, violent filler word for this audience. Dropping it leaves three clean wrong options. |
| 1 | item:jv | posterior | hidden | In everyday use belly = stomach, and pelvis, thorax and femur are clearly not the belly. Both rounds are right that 'posterior' is a snigger word for a bottom, so drop it. R1 is also right that the gloss is the internal- |
| 1 | item:k1 | correctness | hidden | exactness = precision is a sound pair in everyday English. Both rounds are right that 'correctness' is also a synonym, so drop it. Brevity and criterion remain. The gloss is the technical 'reproducible in amount' sense,  |
| 1 | item:k4 | sheen |  | sparkle = gleam is sound. Both rounds are right that 'sheen' (a shine of reflected light) is close enough to defend, so drop it. Emerald, lantern and opal remain, and none of them means sparkle. |
| 1 | item:k8 | broadway | hidden | A piano is a kind of instrument, and recital, instrumental and composer fail the link, so R1's pass holds on the link. But 'broadway' is a lowercase proper noun used as filler, so drop it. The gloss is the general 'devic |
| 1 | item:ka | decency |  | correctness = accuracy (freedom from error) is sound. But correctness also means propriety, conforming to social standards, and in that sense 'decency' is defensible. Drop it. Criterion, discretion and authenticity remai |
| 1 | item:kb | cooperative, pact |  | partnership = alliance is a sound pair. But 'pact' (the agreement that forms an alliance) and 'cooperative' (a jointly run enterprise, close to a partnership) can both be argued. Drop both. Kinship and equity remain. |
| 1 | item:kc | paleozoic |  | A tortoise is a kind of reptile, and otter, salamander and crayfish are clear wrong options. But 'paleozoic' is a proper noun (the Paleozoic era) shown in lowercase as filler, so drop it. |
| 1 | item:kd |  | hidden | alienate = estrange is sound, and distrust, mistrust, confide and abash are not synonyms, so the link holds. But the gloss is estrange's other sense ('remove from customary environment'), not 'make unfriendly', which is  |
| 1 | item:ke | ruffle, matt |  | wrinkle = crease is sound. But 'ruffle' (to wrinkle, to rumple) is listed as a synonym of wrinkle, and 'matt' is an odd variant spelling that reads like the name Matt. Drop both. Freckle and fuzz remain. |
| 1 | item:kj | ashamed, unhappy |  | sorry = apologetic is sound. Both rounds are right that 'ashamed' and 'unhappy' (feeling sorry) are defensible. Dropping both leaves pointless and optimistic, which are clearly wrong. |
| 1 | item:km |  | hidden | queue = line is sound, and picket, stairway, sentry and roadway do not mean queue. I agree with R1 that the gloss ('one beside another') describes a rank, not a queue (one behind another). Hide it. |
| 1 | item:ko | bulk |  | size = magnitude is sound. Both rounds are right that 'bulk' (size, volume) is a defensible synonym, so drop it. Thickness, decrease and average remain, and all are clearly wrong. |
| 1 | item:kp | bought | hidden | sell -> buy is a sound level-1 opposite. The gloss is the noun sense ('an advantageous purchase'), so hide it, as R1 says. 'bought' is a past form of the answer and invites a tense quibble, so drop it. Sold, export and b |
| 1 | item:ku | vile, abominable |  | vicious = cruel is sound. R1 is right that 'vile' (wicked, depraved) is listed for vicious, and 'abominable' is close enough to argue. Drop both. Cruelty, a noun, and pitiable remain. |
| 1 | item:kv | racket |  | A bat (the animal) is a mammal. But a table-tennis bat is also called a racket, so 'racket' gives a second reading. Drop it. Whistle, cricket and flick are not categories of bat. The gloss is the right sense. |
| 1 | item:kx | kale | hidden | Broccoli is a kind of plant, and a broader category is still true, so R2's 'vegetable absent' is not a defect. But the gloss is the factory sense of 'plant', so hide it (R1). Broccoli and kale are the same species (Brass |
| 1 | item:kz |  | hidden | Turmeric (haldi) is a plant, the spice is its root, and nutmeg, apricot, cola and cumin are siblings, so the link holds. But the gloss is the factory sense of 'plant' (R1), so hide it. |
| 1 | item:l2 | levant |  | cape = headland is exact, and the gloss shows that sense. R2 is right that 'levant' is a proper noun shown in lowercase as filler, so drop it. Banner, lapel and turban remain, and they are garments or unrelated things, n |
| 1 | item:l3 | conjecture |  | supposition = assumption is sound. Both rounds are right that 'conjecture' is an equally standard synonym, so drop it. Misconception and censorship remain, and both are clearly wrong. |
| 1 | item:la |  | hidden | progress = advancement is sound, and recovery, resume and disruption are not synonyms, so the link holds. But the gloss is the 'furtherance of a cause' sense ('encouragement of the progress...'), not 'moving forward'. Hi |
| 1 | item:lc | troy | hidden | kingdom = realm is sound at level 1. R2 is right that 'troy' is a lowercase proper noun used as filler, so drop it. Heir and reign remain. The gloss is the figurative sense ('a domain in which something is dominant'), no |
| 1 | item:ld |  | hidden | In common use, hearth = fireplace ('sitting by the hearth'), and alcove, rooftop, patio and bathtub are clearly wrong. R1's fail rests only on the gloss, which shows hearth's narrower sense ('the floor of a fireplace') a |
| 1 | item:lh | humble |  | high -> low is the clean opposite. But 'humble' is a dictionary antonym of high in the rank sense (high-born vs humble-born), so drop it. Height, peak and tall remain, and none of them is an opposite of high. |
| 1 | item:lj | brother |  | friend = pal is sound. But 'brother' sits in the same dictionary synset as pal (buddy, brother, chum), so it is defensible. Drop it. Sister and gas remain, and both are clearly wrong. The gloss is correct. |
| 1 | item:ln | secrecy |  | In the sense 'with confidence = with certainty', confidence = certainty is a dictionary sense (certitude). But R1 is right that 'secrecy' fits the 'told in confidence' sense, so drop it. Gratitude, generosity and certain |
| 1 | item:lq | malice, resentment |  | animosity = hatred is sound. Both rounds are right that 'malice' and 'resentment' are also listed synonyms, so drop both. Indignation and anger remain, and neither is the lasting hostility animosity means. |
| 1 | item:ls |  | hidden | An oboe is a kind of instrument, and harp, saxophone and bass are siblings while instrumental is an adjective, so the link holds. But the gloss is the general 'device that requires skill' sense, not the musical one. Hide |
| 1 | item:lv | lingerie |  | Flannel is a kind of fabric. Both rounds are right that 'lingerie' is unsuitable for 8 to 15, so drop it. Sweater, plaid and overcoat remain. Flannel is not a kind of plaid (plaid is a pattern), so fabric stays the only  |
| 1 | item:ly | pasty |  | lacquer = varnish is sound, and absorbent, gypsum and inlay are clearly wrong. But 'pasty' is a body insult (pasty-faced, pale-skinned), so drop it. |
| 1 | item:lz | ethnic |  | nation = country is exact at level 1. But 'ethnic' as filler next to 'nation' is a loaded word in this audience's context (and offensive as a noun), so drop it. Treaty and union remain. |
| 1 | item:m7 |  | hidden | predict = foretell is sound, and calculate, theorize, determine and fathom are not synonyms, so the link holds. But the gloss 'Foreshadow or presage' is foretell's 'be a sign of' sense (and is itself obscure), not 'say i |
| 1 | item:m9 | tramp |  | An ambulance is a kind of vehicle. Both rounds are right that 'tramp' is a slang insult for a homeless person or a woman, so drop it. Motorist, baggage and taxicab remain, and an ambulance is a kind of none of them. |
| 1 | item:me | athens, tomb | hidden | monument = memorial is sound (a war monument = a war memorial). But 'athens' is a lowercase proper noun, and 'tomb' (a monument over a grave) is arguable, so drop both. Legacy and cemetery remain. R1 is right that the gl |
| 1 | item:mf | recreate |  | evoke = elicit (call forth a response) is sound. But one dictionary sense of evoke is 'to re-create imaginatively', so 'recreate' is defensible. Drop it. Sublime, heighten and mute remain. |
| 1 | item:mg | mansion |  | hall = corridor is sound, and the gloss shows it. But R2 is right that 'hall' is also a manor house, so 'mansion' is defensible. Drop it. Palace, grand and barn remain. |
| 1 | item:mj | bracken, jungle |  | undergrowth = brush (dense low growth) is a standard pair, and the gloss teaches the right sense. But R1 is right that 'bracken' (fern undergrowth) is arguable, and 'jungle' (dense overgrowth) is too. Drop both. Scurry a |
| 1 | item:mo | forcefulness, boldness |  | aggression = belligerence (a hostile disposition) is sound at level 8. Both rounds are right that 'forcefulness' and 'boldness' fit aggression's assertive sense, so drop both. Harassment and abashment remain, and neither |
| 1 | item:mr | skillet |  | A griddle is a cooking utensil, and the gloss is right, so R1's pass holds on the link. But a griddle is often sold as a flat skillet ('griddle skillet'), which invites a 'kind of skillet' answer, so drop skillet. Cornbr |
| 1 | item:mx | ruthless |  | cruel = vicious is sound. Both rounds are right that 'ruthless' is an equally standard synonym (R2's blind solver picked it), so drop it. Reckless, kind (the opposite) and dreadful remain, and none of them means cruel. |
| 1 | item:my | vile, immoral |  | shameful = scandalous (disgraceful) is sound. Both rounds are right that 'vile' and 'immoral' are defensible, so drop both. Tactless and pitiable remain. |
| 1 | item:n1 | eclipse |  | disappearance = vanishing is exact. But thesauruses list 'eclipse' (fading from view) under disappearance, so drop it. Revelation, landslide and chronicle remain. |
| 1 | item:n3 | desultory |  | unhurried = leisurely is exact. 'desultory' (casual, aimless) is obscure and arguable, as R2 notes, so drop it. Brisk and hasty (opposites) and giddy remain. |
| 1 | item:n6 | array |  | display = exhibition is sound. Both rounds are right that 'array' (an impressive display) is defensible, so drop it. Artwork, ruby and emblem remain. |
| 1 | item:n9 | unrealistic |  | improbable = unlikely is exact. Both rounds are right that 'unrealistic' is defensible, so drop it. Plausible (the opposite), truthful and trite remain. |
| 1 | item:ne | shop | hidden | stall = booth (a market stall) is sound. R1 is right that 'shop' (a small open-fronted shop) is defensible, so drop it. Bazaar, vendor and bakery remain. The gloss is the restaurant-booth sense, not the market stall, so  |
| 1 | item:nh | cavalier |  | horseman = rider is sound. Both rounds are right that 'cavalier' literally means a horseman, so drop it. Herder, reindeer and handler remain. |
| 1 | item:nj |  | hidden | low -> high is the clean opposite, and lower, ascend, scarce and sink are not, so R1's pass holds on the link. But the gloss is the noun sense ('a lofty level', as in 'an all-time high'), not the adjective. Hide it. |
| 1 | item:nr | bartender |  | craftsman = artisan is exact. Both rounds are right that 'bartender' is an alcohol-service word, so drop it. Carpenter, engraver and mason are specific crafts, not synonyms. |
| 1 | item:nt |  | hidden | empty -> full is the clean level-1 opposite, and exit, stale, plentiful and entrance are not. R1 is right that the gloss is the full-moon sense, so hide it. |
| 1 | item:nv | velvety, matt |  | fuzzy = downy (covered with fine soft hair) is sound. Both rounds are right that 'velvety' is defensible, so drop it, along with 'matt' (an odd variant spelling that reads like a name). Lacy and down remain. |
| 1 | item:o7 | swindler, murder |  | rogue = scoundrel is sound, and the gloss shows it. Both rounds are right that 'swindler' is defensible and 'murder' is a grim filler word, so drop both. Felon and treachery remain. |
| 1 | item:od | derision |  | contempt = disdain (the gloss is their shared definition) is sound. Both rounds are right that 'derision' (scorn) is defensible, so drop it. Insult, acceptance and affront remain. |
| 1 | item:oh | assistance, supervision |  | guidance = advice is sound. Both rounds are right that 'supervision' and 'assistance' are defensible, so drop both. Tutor and mentor remain, and both are people, not advice. |
| 1 | item:ol | racism, atheism |  | viewpoint = perspective is exact. Both rounds are right that 'racism' and 'atheism' are loaded filler words (race, faith), so drop both. Tenet and humanism remain. |
| 1 | item:ow | reproach |  | Agree with both rounds that 'reproach' is a near-synonym of condemnation/censure; condemnation -> censure itself is sound at L5. Dropping 'reproach' leaves misdeed, repentance, discontent, none of which means condemnatio |
| 1 | item:ox | knob, screw |  | prong -> tine is exact and the gloss is right. R2 is correct that 'knob' and 'screw' carry common vulgar slang senses (the rule fails them even in innocent senses); R1 missed this. Dropping both leaves slash, cutter. |
| 1 | item:oy | solidity |  | rigidity -> stiffness is exact. R2 gave no specific fault; the one risk is 'solidity', which thesauri list near rigidity/firmness, so drop it. Remaining elasticity, adhesion, flexibility are clearly not synonyms. |
| 1 | item:p5 |  | hidden | fair -> carnival is sound in the travelling funfair sense (WordNet groups fair/carnival/funfair). R2 named no fault in the pair. But the gloss shown is carnival's festival-with-processions sense, which is not what a fair |
| 1 | item:p7 | unacceptable |  | Agree with both rounds that 'unacceptable' is a defensible synonym of inappropriate. inappropriate -> improper is sound; dropping 'unacceptable' leaves plausible, blatant, unintentional. |
| 1 | item:pe | sho, respirator |  | Both rounds flag 'sho' (not a word a child knows) and R1 notes 'respirator' is a kind of mask and could be picked. mask -> disguise is sound (to mask = to disguise; the gloss shows that shared sense). Dropping sho and re |
| 1 | item:pg | fable |  | story -> narrative is exact. R2 gave no specific fault, but 'fable' is a thesaurus synonym of story (both a tale and a made-up account), so it competes; drop it. Remaining memoir, biography, fantasy are kinds of writing, |
| 1 | item:pi | champion |  | Agree with both rounds that 'champion' (champion of a cause) also means defender. defender -> protector is sound; dropping champion leaves fighter, fortress. |
| 1 | item:pl | audit |  | client -> customer is exact (same WordNet synset). R2 named no fault in the pair, but at L1 (age 8) 'audit' is adult jargon; drop it. patent and pension remain, both everyday enough and clearly wrong. |
| 1 | item:pn | bondage, confinement |  | Agree with both rounds: 'bondage' has a sexual sense (unsafe) and 'confinement' is a defensible synonym of constraint. constraint -> limitation is sound; dropping both leaves exclusion, volition. |
| 1 | item:pu | facile |  | Agree with both rounds that 'facile' also means easy. easy -> effortless is sound; dropping facile leaves clearer, docile. |
| 1 | item:pw | incorrect |  | Agree with both rounds that 'incorrect' fits faulty (faulty reasoning). faulty -> defective is sound; dropping incorrect leaves accidental, defect, clearer. |
| 1 | item:q0 | chasm |  | fissure -> crack share one synset ('a long narrow opening'). Agree with both rounds that 'chasm' is weakly defensible (a deep fissure); drop it. cavern, indentation, magma remain and none means fissure. |
| 1 | item:q2 | cavalier |  | Agree with both rounds that 'cavalier' literally means horseman. horseman -> equestrian is sound; dropping cavalier leaves stallion, herder, reindeer. |
| 1 | item:q5 |  | hidden | speck -> fleck is sound (a tiny spot/mark) and glint, glimmer, orb are clearly wrong; R2 named no specific fault. But the gloss shown is fleck's 'fragment broken off from the whole' sense, which is not what a speck is, s |
| 1 | item:q8 | affirm |  | proclaim -> declare is exact. R1 is right that 'affirm' is a thesaurus synonym (to state positively); drop it. accuse, invoke, condemn remain, none meaning proclaim. |
| 1 | item:q9 | ecliptic |  | plane -> airplane is exact in the aircraft sense; R2 named no fault in the pair. 'ecliptic' is astronomy jargon too obscure for L5; drop it. meridian, airship, perimeter remain and none means plane-the-aircraft. |
| 1 | item:qd | muck, crock |  | grime -> filth is sound. Agree with both rounds that 'muck' is a defensible synonym, and R1 that 'crock' carries a crude idiom; drop both. soot and silt remain (specific substances, not synonyms of grime). |
| 1 | item:qh |  | hidden | asleep -> awake is a sound opposite and sad, happy, laugh, calm are clearly not opposites; R2 named no fault in the pair. But the gloss 'Stop sleeping' is the verb (to awake), not the adjective awake that opposes asleep, |
| 1 | item:qi | flaccid, pasty |  | stringy -> fibrous is sound. Agree with both rounds: 'flaccid' carries an adult connotation and 'pasty' is a body insult; drop both. rubbery and pulpy remain, both clearly different textures. |
| 1 | item:qj | endive | hidden | Chicory is a kind of plant. Agree with R1: 'endive' is the same/related plant and could be picked, and the gloss shown is plant = factory ('buildings for industrial labor'), the wrong sense. Drop endive and hide the glos |
| 1 | item:qm | medullary, epithelial | hidden | fibrous -> stringy is sound; R2 named no specific fault. But 'medullary' and 'epithelial' are anatomy jargon too obscure for L7, and the gloss 'Lean and sinewy' is the wiry-person sense of stringy, not the fibrous-textur |
| 1 | item:r0 | slag |  | harden -> solidify is exact; R2 named no fault in the pair. But 'slag' is a common British vulgar insult, which fails even in its innocent (smelting waste) sense; drop it. leach and thicken remain. |
| 1 | item:r8 | trimming |  | ornament -> adornment is sound. Agree with both rounds that 'trimming' is a thesaurus synonym; drop it. garland, drapery, embroidery remain (particular decorations, not synonyms). |
| 1 | item:r9 | probate, litigate |  | penalize -> punish is exact; R2 named no fault in the pair. But 'probate' and 'litigate' are adult legal jargon too obscure for L6; drop both. disqualify and punishment remain, neither a synonym of the verb penalize. |
| 1 | item:ra | aperitif |  | food -> sustenance is sound. Agree with both rounds that 'aperitif' is an alcoholic drink (unsuitable); drop it. vegetarian, calorie, pickle remain. |
| 1 | item:rb | bantu, slavic | hidden | ancestry -> lineage is sound. Agree with both rounds: 'bantu' and 'slavic' are lowercased ethnic/language names used as filler (bantu was an apartheid label); drop both. Also hide the gloss, which defines lineage as 'des |
| 1 | item:rn |  | hidden | agree -> agreement is a correct verb->noun family and refusal, arrival, argument, decision are not its family; R2 named no fault in the pair. But the gloss shown is the contract sense ('exchange of promises'), not the ac |
| 1 | item:rp | print |  | copy -> duplicate is sound. Agree with both rounds that 'print' is a defensible synonym of copy; drop it. dictation, edition, imitator remain, none a synonym. |
| 1 | item:rq |  | hidden | Oat is a kind of grain and coconut, nutmeg, simmer, beet are not categories. Agree with R1 that the gloss shows grain's 'small granular particle' sense, not cereal grain; hide it. |
| 1 | item:rr | orthorhombic |  | asymmetrical is the adjective of asymmetry; R2's bare 'noun->adj' names no fault. But 'orthorhombic' is crystallography jargon too obscure for L7; drop it. dimensional and geometrical remain. |
| 1 | item:s5 | endorsement, notary |  | confirmation -> verification is sound. Agree with both rounds that 'endorsement' fits confirmation's approval sense; drop it. Also drop 'notary', legal jargon obscure at L4. precedent and referral remain. |
| 1 | item:se | posit |  | guess -> supposition is sound. R1 is right that 'posit' means to suppose and could be picked; drop it. refutation, probable, solver remain. |
| 1 | item:si | calamus |  | A sycamore is a kind of tree; R2's bare 'category' names no fault. But 'calamus' (a plant genus) is too obscure; drop it. hazel and briar remain as sibling plants, not categories. |
| 1 | item:sl | thong |  | A legging is a garment. Agree with both rounds that 'thong' has an underwear double meaning; drop it. overcoat, footwear, sling remain. |
| 1 | item:sn |  | hidden | meaning -> significance is sound in the 'what is meant' sense, and singular, pronoun, significant, tense are clearly wrong. But the gloss 'The quality of being significant' is the importance sense, not the meaning sense; |
| 1 | item:so | notification |  | announcement -> declaration is sound. Agree with both rounds that 'notification' is a defensible synonym; drop it. reporter, presenter, subscriber remain. |
| 1 | item:su |  | hidden | dinner -> supper are interchangeable for the evening meal in common use, and diner, guest, food, bread are clearly wrong; R2 named no fault in the pair. But the gloss 'A light evening meal' contrasts supper with dinner ( |
| 1 | item:sx | salute, admiration |  | praise -> acclaim is sound (gloss 'enthusiastic approval'). Agree with R1 that 'salute' (to honour publicly) is defensible; also drop 'admiration', a feeling close enough to praise to compete. dedication and reviewer rem |
| 1 | item:tc |  | hidden | old -> new is a sound opposite and brave, cowardice, ancient (a synonym), guilty are not opposites of old; R2 named no fault in the pair. But the gloss 'Not of long duration' reads to an 8-year-old as 'short-lived', a di |
| 1 | item:te | contention |  | disagreement -> dispute is sound. Agree with both rounds that 'contention' is a synonym; drop it. mediation, consensus, reconciliation remain (all resolutions, not disputes). |
| 1 | item:tp | lena |  | maze -> labyrinth is exact; gloss right. Agree with both rounds that 'lena' is not a word a child knows (a river or a name); drop it. subway and spaceship remain. |
| 1 | item:u0 |  | hidden | A guitar is a kind of instrument; keyboard is a sibling, fret a part, instrumental an adjective. R2's bare 'category' names no fault. But the gloss 'A device that requires skill for proper use' is the tool sense, not the |
| 1 | item:ud | muck |  | mire -> bog is sound (soft wet ground). Agree with both rounds that 'muck' fits mire's mud sense; drop it. trample, grime, rubble remain. |
| 1 | item:uf | defile |  | pollute -> contaminate is exact. Agree with both rounds that 'defile' is a synonym (and carries an unwanted connotation); drop it. grime, percolate, overburden remain. |
| 1 | item:ui | agony |  | sorrow -> sadness is sound. Agree with R1 that 'agony' (anguish) is listed as a synonym of sorrow; drop it. fury, joy, anger remain. |
| 1 | item:up |  | hidden | float -> sink is a sound opposite for L1 and ascend, stormy, cloudy, shallow are not; R2 named no fault in the pair. Agree with R1 that the gloss is the plumbing-fixture noun, contradicting the verb sense; hide it. |
| 1 | item:uq | abuse |  | rejection -> refusal is exact; gloss right. Agree with both rounds that 'abuse' is too heavy a word for an L2 filler; drop it. involvement and conviction remain. |
| 1 | item:ux |  | hidden | A pie is a kind of dish (prepared food), and burger, steak, bacon, seafood are foods, not categories a pie belongs to. Agree with R1 that the gloss is dish = dishware, the wrong sense; hide it. |
| 1 | item:v4 | overall, extensive |  | global = worldwide is sound, but r1 and r2 are right that 'overall' is a standard synonym in the comprehensive sense ('a global view') and 'extensive' is close too. Dropping both leaves national/economic, neither defensi |
| 1 | item:v5 | manly |  | courage -> courageous is a clean word-family pair; unwavering/heroic are not of the family. r2 is right that 'manly' pairs courage with a gender stereotype; drop it. |
| 1 | item:v6 |  | hidden | bagpipe is a kind of (musical) instrument and no distractor competes; 'instrumental' is an adjective trap, not a second answer. But the gloss 'a device that requires skill for proper use' is the generic tool sense, not t |
| 1 | item:vc | chasm, indentation |  | fissure = crevice is sound and the gloss is the WordNet sense they share. r1/r2 are right that 'chasm' (a deep fissure) is defensible; also drop 'indentation', which the gloss's 'depression in a surface' makes look right |
| 1 | item:vf | fool |  | cuckoo is a kind of bird; thrush/kangaroo/ferret are not categories it belongs to. Agree with both rounds that 'fool' is an insult that calls up cuckoo's slang 'crazy' sense: drop it. |
| 1 | item:vl | repository | hidden | receptacle = container is sound. Agree that 'repository' is a listed synonym: drop it. The gloss's parenthetical ('especially a large metal boxlike object of standardized…') teaches the shipping-container sense: hide it. |
| 1 | item:vm | unfamiliar |  | unaware = oblivious is sound at L8. r1 is right that 'unfamiliar' ('unfamiliar with' = 'unaware of') is defensible: drop it. hopeless/pessimistic/smarter remain. |
| 1 | item:vn | water |  | aqua = cyan as a colour (web aqua is cyan), and the gloss is cyan's colour sense. Both rounds are right that dictionary 'aqua' also means water: drop 'water'. littoral/amber/sluice remain, none a synonym. |
| 1 | item:vq | support, framework |  | foundation = groundwork is sound and the gloss shows the shared 'basis' sense. Agree that 'support' and 'framework' are defensible: drop both. exterior/concrete remain. |
| 1 | item:vw | spasm, ureter |  | constriction = narrowing is exact. r2 is right that ureter is an obscure medical distractor, and 'spasm' (an involuntary tightening) is close enough to constriction to argue: drop both. dilation (the opposite) and corona |
| 1 | item:vy | marvel |  | amaze = astonish is exact, but 'marvel' is listed beside them in many thesauruses and a child could defend it: drop it. gasp/wept remain. |
| 1 | item:w0 | concoction | hidden | medley = potpourri is sound at L7. Agree 'concoction' (a mixture) is defensible: drop it. The gloss is a broken fragment ('Is any mixture of unrelated objects subjects etc'): hide it. haricot/turnover remain. |
| 1 | item:w2 | bias |  | inclination = tendency is sound. Agree 'bias' is a standard synonym (a leaning) and fits the gloss itself: drop it. reconciliation/acceptance/absurdity remain. |
| 1 | item:w3 | quiver |  | fluttering = flapping is sound. Agree with r1 that 'quiver' (flutter/tremble) is defensible: drop it. mane/seagull/cheetah remain. |
| 1 | item:w6 | wager |  | winner = champion is sound. r2 is right that 'wager' is a gambling word, out of place for children: drop it. tennis/golfer/hockey remain. |
| 1 | item:w7 | dexterity |  | skill = expertise is sound. Agree 'dexterity' is a standard synonym: drop it. adept (an adjective/person), discipline, profession remain, none meaning skill. |
| 1 | item:wb | industry |  | factory = mill is a true synonym set ('cotton mill', 'steel mill') and the gloss shows it. But 'industry' is used for a factory in Indian English ('he runs a small industry'), which this audience hears: drop it. shipment |
| 1 | item:we | turbulence, cessation |  | disruption = disturbance is sound. 'turbulence' (turmoil, upheaval) and 'cessation' (a disruption of service is a stop) are close enough to argue: drop both. impediment/depletion remain. |
| 1 | item:wj | chisel |  | engrave = etch as verbs (the gloss 'to carve or cut a design into a hard surface' fits both). Agree with both rounds that 'chisel' fits the same gloss: drop it. inlay/brooch/stencil remain. |
| 1 | item:wk | convenient |  | accessible = available is sound. Agree 'convenient' (easy to reach) is a listed synonym: drop it. virtual/impersonal remain. |
| 1 | item:wq | holler |  | screech = squeal (high-pitched; tyres screech/squeal) is sound. 'holler' (to yell) sits beside screech in many thesauruses: drop it. hoot/honk/growl remain, all low or different sounds. |
| 1 | item:ws | tramp |  | motorist = driver is exact. Agree with both rounds that 'tramp' is a derogatory word for a homeless person and a sexual insult in slang: drop it. streetcar/scooter/taxicab remain. |
| 1 | item:ww | redeem |  | repay = reimburse is sound. Agree with r1 that 'redeem' (pay off a debt) is defensible: drop it. mortgage/resent/expend remain. |
| 1 | item:wy | ness |  | capable -> capability is a sound family pair. Agree with both rounds that 'ness' is a suffix, not a word: drop it. state/worthy/render remain. |
| 1 | item:x0 |  | hidden | move -> movement is the verb-to-noun family; halt/decision/arrival/imagination belong elsewhere. r2's fail gives only the relation name, no defect, and I find none. But the gloss ('a change of position that does not enta |
| 1 | item:x5 |  | hidden | tight/loose are direct opposites and no distractor competes. Agree with r1 that the gloss 'grant freedom to' is the verb sense: hide it. |
| 1 | item:x6 |  | hidden | leaping = jumping is exact; swoop/trot/dove/twirl are other movements. Agree with r1 that the gloss (an athletic competition) is the wrong sense: hide it. |
| 1 | item:x7 |  | hidden | a xylophone is a kind of (musical) instrument; strum/mouthpiece/fret are parts or actions, 'instrumental' an adjective trap. r2's fail gives only the relation name, no defect, and I find none. But the gloss is the generi |
| 1 | item:xc | repository, archive |  | cache = hoard (a hidden store) is sound and the gloss shows that sense. Agree 'repository' and 'archive' (a store) are defensible: drop both. retrieval/encryption remain. |
| 1 | item:xg | ting |  | fleck = speck is exact. r2 flagged 'ting' as odd: it is also UK slang for a girl, often sexualised. Drop it. topaz/amethyst remain. |
| 1 | item:xo | scorn, sneer |  | derision = mockery is sound. Agree 'scorn' and 'sneer' are standard synonyms: drop both. jealousy/indignation remain. |
| 1 | item:xy | repel, repulse |  | deter = discourage is sound. Agree 'repel' is defensible ('a repellent deters insects'), and 'repulse' (drive back) is close: drop both. entrap/fend remain. |
| 1 | item:y7 | boost |  | increase = gain is sound. r2's blind pick of 'boost' proves it is a second answer: drop it. reduction/efficiency/insulin remain. |
| 1 | item:yr | hypotheses, inference |  | speculation = conjecture is sound. Agree with r1 that 'hypotheses' is defensible, and 'inference' is close: drop both. skepticism/paradox remain. |
| 1 | item:yw | limp |  | droop = sag is sound. 'limp' (flowers go limp) is close enough to argue: drop it. lob/tuft/maroon remain. |
| 1 | item:z4 | abrasive |  | caustic = corrosive is sound and the gloss shows the chemical sense. Agree with both rounds that figurative 'abrasive' is defensible: drop it. vapour/wetness/lather remain. |
| 1 | item:za | inconvenient |  | unsuitable = inappropriate is sound. Agree with r1 that 'inconvenient' ('an unsuitable time') is a listed synonym: drop it. appropriate/satisfactory/negligent remain. |
| 1 | item:zh | feast, ceremony |  | celebration = festival is sound. Agree 'feast' (a feast day) and 'ceremony' are defensible: drop both. supper/graduation remain. |
| 1 | item:zi | writer |  | bard = minstrel is sound. 'writer' is arguable (the Bard, a poet, is a writer): drop it. maiden/epic/ballad remain. |
| 1 | item:zj |  | hidden | ancient/modern are direct opposites; elder/old are synonyms, love/answer unrelated. Agree with r1 that the gloss 'a contemporary person' is the noun sense: hide it. |
| 1 | item:zm | deputy |  | assistant = helper is sound. Agree 'deputy' is a standard synonym: drop it. boss/senior/executive remain. |
| 1 | item:zs | performance |  | routine = habit ('my morning routine/habit') is sound and the gloss shows it. Agree with r1 that 'performance' (a dance routine) is defensible: drop it. rehearsal/overtime/recital remain. |
| 1 | item:10a |  | hidden | a tuba is a kind of (musical) instrument; clapper/cymbal/drummer/instrumental do not compete. r2's fail gives only the relation name, no defect, and I find none. But the gloss is the generic device sense: hide it. |
| 1 | item:10d | disdain |  | superiority = excellence is sound and the gloss shows it. Agree with r1 that 'disdain' (an air of superiority) is defensible: drop it. humility/patriotism/excel remain. |
| 1 | item:10i | confinement, handicap | hidden | limitation = constraint is sound. Agree that 'confinement' and 'handicap' (a dated disability term) are defensible: drop both. The gloss shows physical restraint, not the sense of a limit: hide it. oversight/dependency r |
| 1 | item:10s | suspicion |  | doubt = skepticism is sound. Agree 'suspicion' is a standard synonym: drop it. certainty/contradiction/conviction remain. |
| 1 | item:10u |  | hidden | gulp = swallow (verb) is sound and no distractor competes. Agree with r1 that the gloss 'a small amount of liquid food' contradicts gulp: hide it. |
| 1 | item:10v | keen | hidden | blunt/sharp are direct opposites. Agree that 'keen' (a keen blade) is also an opposite of blunt: drop it. The gloss is the musical sharp: hide it. timid/tame/cowardice remain. |
| 1 | item:10w | defender, fighter |  | champion = winner is sound and the gloss shows it. Agree 'defender' is defensible (a champion of the poor), and 'fighter' too: drop both. triumph/boxer remain. |
| 1 | item:10x | unacceptable |  | improper = inappropriate is sound. Agree 'unacceptable' is a listed synonym: drop it. negligent/untrue/inconvenient remain. |
| 1 | item:11a | naughty |  | sneaky = underhanded is sound. 'naughty' overlaps for a child (sneaky behaviour is naughty) and carries an adult double sense: drop it. extra/silent remain. |
| 1 | item:11b | oriental |  | tubular = cylindrical is exact. Agree with both rounds that 'oriental' is a dated, offensive term: drop it. warty/conical/narrower remain. |
| 1 | item:11c |  | hidden | music -> musical is the noun-to-adjective family; joyful/heroic/magical/rainy are not of it. r2's fail gives only the relation name, no defect, and I find none. But the gloss is the noun 'a musical' (a show): hide it. |
| 1 | item:11e | indignation |  | fury = wrath is sound. Agree with r1 that 'indignation' (anger) is defensible: drop it. elation/emotion/fear remain. |
| 1 | item:11i | trustworthy |  | plausible = credible is sound. 'trustworthy' is a synonym of credible ('a credible witness') and a child could defend it: drop it. doubtful/improbable/apologetic remain. |
| 1 | item:11m | caricature |  | exaggeration = embellishment is sound and the gloss shows it. Agree with r1 that 'caricature' (an exaggerated portrayal) is defensible: drop it. attractiveness/vividness/absurd remain. |
| 1 | item:11o | unacceptable |  | Agree with r1/r2: 'unacceptable' is a common thesaurus synonym of 'inappropriate', so two answers fit. inappropriate = unsuitable is exact and the gloss is the right sense; dropping 'unacceptable' leaves plausible/blatan |
| 1 | item:11q | pub, shiver |  | Agree with both rounds that 'pub' is an alcohol venue and 'shiver' is defensible (a chill = a shivering fit). chill = coldness is exact and the gloss is the right sense; dropping pub and shiver leaves cornbread/drizzle. |
| 1 | item:11v | dignity, royalty |  | Agree with both rounds: 'nobility' also means noble character, so 'dignity' is defensible, and 'royalty' is close enough to tempt. nobility = aristocracy (the hereditary class) is exact and the gloss is that sense; dropp |
| 1 | item:11x | cavity |  | Agree with both rounds that 'cavity' is defensible (a heart chamber is a cavity). chamber = room is exact in its usual sense and the gloss shows that sense; dropping 'cavity' leaves portal/barn/interior. |
| 1 | item:12b | serial |  | Agree with both rounds: 'serial' (in a series) is a defensible synonym of 'successive'. successive = sequential is exact; dropping 'serial' leaves eleven/tertiary/cyclical. |
| 1 | item:12j | relish |  | Agree with both rounds that 'relish' (to savour; a pleasing flavour) is defensible. savor = taste in the flavour sense is exact and the gloss shows it; dropping 'relish' leaves soy/oatmeal/ginger. |
| 1 | item:12n | trustworthy |  | Agree with r1 that 'trustworthy' is defensible for 'believable' (a believable witness is a credible one). believable = plausible is exact; dropping it leaves sensible/constructive/unrealistic, none the same meaning. |
| 1 | item:12p | jesus |  | Agree with both rounds: 'jesus' lowercased as a throwaway distractor is disrespectful. fate = destiny is exact; dropping it leaves prophecy/mortal/soul. |
| 1 | item:12q | swagger |  | Agree with both rounds: 'swagger' (arrogant manner) is a listed synonym of arrogance. arrogance = conceit is exact; dropping it leaves jealousy/boldness/envy. |
| 1 | item:12r |  | hidden | Disagree with r2's bare fail on the link: Merriam-Webster defines a perch as 'a roost for a bird', so perch = roost holds. But the gloss shown ('a shelter with perches for fowl') is the hen-house sense, which is not a pe |
| 1 | item:12t | matt |  | Disagree with r2's bare fail on the link: crease = fold is exact and the gloss is the verb sense. But 'matt' reads as a lowercase name (or a variant spelling of matte) in a spelling app; drop it, leaving fray/hunch/fuzz. |
| 1 | item:12x | fennel, briar | hidden | Agree with r1: the gloss shows 'plant' as a factory and 'fennel'/'briar' are equally kinds of plant. An artichoke is a plant; dropping fennel and briar leaves russet/bur, neither a group an artichoke belongs to, and hidi |
| 1 | item:13a | delightful |  | Agree with both rounds: 'delightful' is a standard synonym of 'adorable'. adorable = lovable is exact; dropping it leaves gaudy/flamboyant. |
| 1 | item:13b | pregnancy, fetus |  | Agree with both rounds that 'pregnancy' and 'fetus' are unsuitable throwaway distractors at L2. baby = infant is exact and the gloss is right; dropping them leaves mother/cub ('cub' is the young of certain animals, not t |
| 1 | item:13f | bin | hidden | Disagree with r2's bare fail on the link: trash = garbage. But the gloss shown ('food that is discarded') is the narrow sense in which garbage is NOT trash, so hide it; and 'bin' is defensible in the 'throw it in the tra |
| 1 | item:13j | november |  | Disagree with r2's bare fail on the link: sunshine = sunlight. But 'november' is a lowercase proper noun used as filler; drop it, leaving midday/cooler/sunflower. |
| 1 | item:13n |  | hidden | Disagree with r2's bare fail on the link: crevice = fissure (WordNet's crack/crevice/fissure synset). But the gloss shown ('a long narrow depression in a surface') is the anatomical groove sense, not the crack; hide it.  |
| 1 | item:13r | broadway |  | Disagree with r2's bare fail on the link: a drama is a play. But 'broadway' is a lowercase proper noun used as filler; drop it, leaving comedian/epic. |
| 1 | item:13u | executive |  | Agree with r1 that 'executive' is defensible for 'boss'. boss = supervisor is exact and the gloss is right; dropping it leaves advisor/assistant/sergeant. |
| 1 | item:13x | holly | hidden | Agree with r1: the gloss shows 'plant' as a factory and 'holly' is also a kind of plant. Mistletoe is a plant; dropping holly leaves bur/muskrat, and hiding the gloss removes the wrong sense. |
| 1 | item:14f | nag, inconvenience |  | Agree with r1: 'nag' and 'inconvenience' are listed synonyms of 'annoy'. annoy = irritate is exact; dropping both leaves blunder/muddle. |
| 1 | item:14g | affix |  | Agree with both rounds: 'affix' is a standard synonym of 'attach'. attach = fasten holds; dropping 'affix' leaves limber/padlock/subordinate. |
| 1 | item:14i | crete, andes |  | Agree with r2: 'crete' and 'andes' are lowercase proper nouns used as filler. settler = colonist is exact (WordNet synset) and the gloss is right; dropping them leaves homestead/farmland. |
| 1 | item:14m | assent |  | Agree with both rounds: 'assent' is a defensible near-synonym. endorse = approve (give sanction to) is exact; dropping it leaves libel/empower. |
| 1 | item:14n | oversight |  | Side with r1 over r2: 'oversight' (supervision) is a defensible synonym of administration/management. The link is exact and the gloss right; dropping it leaves enforcement/manage. L2 is ambitious for 'administration', so |
| 1 | item:14o | broker |  | r1 passed and r2 failed on 'broker'. Thesauri list broker among synonyms for merchant/dealer, so it is close enough to argue; drop it. merchant = trader is exact; bazaar/import/cart remain. |
| 1 | item:14s | easter, passover |  | Agree with both rounds: 'easter' and 'passover' are faith festivals shown lowercased as throwaway distractors, and in the liturgical sense both ARE feasts. feast = banquet is exact; dropping them leaves supper/anniversar |
| 1 | item:14w | video |  | Side with r1 over r2: 'video' is a defensible answer (watch a video = a movie for many children). movie = film is exact; dropping 'video' leaves television/dot/theater. |
| 1 | item:14x | gaster |  | Side with r2 on 'gaster': an obscure entomology word, not suitable even as a distractor. gullet = esophagus is exact and the gloss is right; dropping 'gaster' leaves tripe/reflux. |
| 1 | item:14y | daredevil |  | Side with r1 over r2: 'daredevil' is used as an adjective (daring, bold) and some thesauri list it under brave. brave = courageous is exact; dropping it leaves veteran/courage/ruthless. |
| 1 | item:15h | stab |  | Agree with both rounds: 'stab' is a defensible (and violent) sense of thrust. thrust = push is exact and the gloss right; dropping 'stab' leaves rotor/crank. |
| 1 | item:15i | lena |  | Agree with both rounds that 'lena' is a lowercase proper name used as filler. bookshelf = bookcase holds in the common sense (Cambridge: 'a shelf, or a set of shelves, for books'); dropping 'lena' leaves alcove/workspace |
| 1 | item:15k | suspicion |  | Agree with both rounds: 'suspicion' is a standard synonym of doubt. doubt = uncertainty is exact; dropping it leaves certainty/contradiction/conviction. |
| 1 | item:15u | handicap |  | Agree with both rounds: 'handicap' is a dated, stigmatising disability term. evade = avoid is exact and the gloss is right; dropping it leaves bail/arrest/defraud. |
| 1 | item:16h | antipathy |  | Agree with both rounds: 'antipathy' (strong aversion) is defensible. disgust = revulsion is exact; dropping it leaves resentment/acceptance/anger. |
| 1 | item:16i | proficiency, competence |  | Agree with both rounds: 'proficiency' and 'competence' are listed near-synonyms of aptitude. aptitude = talent (natural ability) is exact; dropping both leaves intellect/upbringing. |
| 1 | item:16j | mime |  | Side with r1 over r2: 'mime' (to imitate; an imitating performer) is defensible. imitator = mimic is exact; dropping it leaves parody/columnist/entertainer. |
| 1 | item:16k | perverse |  | Agree with both rounds: 'perverse' carries the 'pervert' association and should not be here. scruple -> scrupulous is a clean word-family pair, and 'scruples' is known at 13; dropping 'perverse' leaves obstinate/blameles |
| 1 | item:16l | nick |  | Agree with both rounds: a nick is a small cut or scratch, so it is defensible. scratch = abrasion holds and the gloss is right; dropping it leaves dent/blot/shin. |
| 1 | item:16n | catapult |  | Side with r2 over r1: 'catapult' (to move suddenly at speed) matches the 'shoot forward' sense of shoot. shoot = sprout in the plant sense is exact and the gloss pins it; dropping 'catapult' leaves aerial/arrow/bombardme |
| 1 | item:16o | pub |  | Agree with both rounds: 'pub' is an alcohol venue. cellar = basement is exact; dropping it leaves granary/urn/cupboard. |
| 1 | item:17j | stimulus |  | Agree with both rounds: 'stimulus' is a listed synonym of impulse (impetus). impulse = urge is exact and the gloss right; dropping it leaves volition/receptor. |
| 1 | item:17l | adjourn |  | Agree with both rounds: 'adjourn' (put off to a later time) is defensible. postpone = defer is exact; dropping it leaves annul/repeal/revoke. |
| 1 | item:17n | smooth |  | Side with r1 over r2: thesauri give 'smooth' as an opposite of sharp (sharp vs smooth edges, taste), so two answers fit for an 8-year-old. sharp/blunt is the canonical pair; dropping 'smooth' leaves sour/strong/thick. |
| 1 | item:17s | invoke |  | Agree with both rounds: 'invoke' (appeal earnestly to) is defensible. entreat = beg is exact; dropping it leaves jeer/mourn/absolve. |
| 1 | item:17u | affirm, decree |  | Agree with r1: 'affirm' and 'decree' are both defensible synonyms of declare. declare = proclaim is exact; dropping both leaves condemn/shall. |
| 1 | item:17w | torrent, geyser |  | Agree with both rounds: 'torrent' is defensible, and 'geyser' (a gush of water) is as well. surge = gush (a sudden rapid flow) holds; dropping both leaves blizzard/hurricane. |
| 1 | lesson:same:trap |  |  | Agree with both rounds: 'a breeze is not cool' reads as a false claim (breezes are often cool, and 'not cool' is slang). The point is that breeze does not MEAN cool. |
| 1 | lesson:part:bridge |  |  | Side with r2 over r1: with bare nouns the template reads 'petal is part of flower', which drops the articles in a spelling app. 'The ... the ...' works for every singular stem (the month is part of the year, the key is p |
| 1 | lesson:part:spot |  |  | Agree with both rounds: 'could you find the first thing on or in the second?' is a location test that a cup on a table or a fish in a pond passes. The test must be about making up the whole. |
| 1 | lesson:use:bridge |  |  | Agree with both rounds: with the stem scissors/cut it renders 'scissors is used to cut', a grammar error. 'We use the {A} to {B}' has no verb agreement on {A}, so it is correct for scissors and knife alike. |
| 1 | lesson:use:trap |  |  | Side with r2 over r1: 'mop is a tool, not a job' contradicts itself, since to mop IS a cleaning job. A bucket shares the cupboard but is not an action. |
| 1 | lesson:degree:bridge |  |  | Side with r2 over r1: 'Hot is a stronger warm' is ungrammatical, and 'Freezing is a stronger cold' reads as an illness. Talking about the words fixes both: 'Starving is a stronger word than hungry', 'Gulp is a stronger w |
| 1 | lesson:degree:trap |  |  | Agree with both rounds: chilly is colder than cool, so it is not 'the SAME strength', and 'the far end' has no scale. Use a pair that really is the same strength. |
| 1 | card:shiva |  |  | Agree with r1 that the text is respectful, accurate and from the inside (Ganga in his hair, meditation, Maha Shivaratri as a night of prayer). The closing line presumes every reader's family honours Shiva, and many in th |
| 1 | item:119 | june, shad |  | Overturns both passes: 'june' is a lowercase proper noun (a month name) used as filler, and 'shad' (a fish) is obscure at L3. blooming = flowering is exact and the gloss right; dropping both leaves tulip/meadow. |
| 1 | item:137 |  | hidden | Re-check finds a defect both rounds passed: cringe = wince is right and every distractor is wrong, but the gloss reads 'Is to draw back or tense the body', broken English shown to a child in a spelling app. Hide it. |
| 1 | item:c4 |  | hidden | Re-check finds a defect both rounds passed: disprove/prove is a sound opposite pair and the distractors are fine, but the gloss shown ('be shown or be found to be', as in 'it proved false') is not the sense that opposes  |
| 1 | item:d7 |  | hidden | Re-check finds a defect both rounds passed: a cello is a (musical) instrument and the distractors are fine, but the gloss shown is the skill-tool sense ('a device that requires skill for proper use'), not the musical one |
| 1 | item:14r |  | hidden | Re-check finds a defect both rounds passed: slope = incline is exact, but the gloss 'an elevated geological formation' describes a hill and fits the distractors 'plateau' and 'crag' just as well, so it points away from t |
| 1 | item:14 |  | hidden | Rounds 1-2 passed; the link holds (visible/hidden are opposites) and no option competes, but the gloss 'Prevent from being seen or discovered' is the verb 'hide', not the adjective 'hidden' - wrong sense. Hide the gloss. |
| 1 | item:50 | optic |  | Rounds 1-2 passed, but 'optic' (an optical instrument, or the eye itself) is a whole that a lens is genuinely part of, so camera is not the one defensible answer. Drop optic; laser, infrared and vision remain. |
| 1 | item:59 | helm |  | Rounds 1-2 passed, but a ship's helm is 'a tiller or wheel and its steering gear', so a wheel is part of a helm too. Drop helm; pivot and propeller remain. |
| 1 | item:63 |  | hidden | Rounds 1-2 passed; pen is used to write and no option competes, but the gloss 'Produce a literary work' is the authoring sense, not forming letters with a pen. Hide the gloss. |
| 1 | item:82 | tub |  | Rounds 1-2 passed, but 'tub' is a near-synonym of bucket in everyday use (a tub/bucket of ice cream or popcorn), so pail is not the only defensible answer. Drop tub; faucet, artery, bale remain. |
| 1 | item:138 |  | hidden | Rounds 1-2 passed; picturesque/scenic is a sound synonym and lurid/dingy/spooky do not compete, but the gloss 'Used of locations' is a truncated usage note that shows no meaning at all. Hide the gloss. |
| 1 | item:139 |  | hidden | Rounds 1-2 passed; zero/nothing holds, but the gloss 'A quantity of no importance' reads to a child as 'an unimportant amount', not 'none at all'. Hide the gloss. |
| 1 | item:3h |  | hidden | Rounds 1-2 passed; design -> designer is sound and no option competes, but the gloss defines an interior designer ('designing architectural interiors and their furnishings'), a narrow profession, not 'a person who design |
| 1 | item:3j |  | hidden | Rounds 1-2 passed; direct -> director is sound and no option competes, but the gloss 'Someone who controls resources and expenditures' is the finance-manager sense, not 'one who directs' as an 8-year-old meets it. Hide t |
| 1 | item:3y |  | hidden | Rounds 1-2 passed; swim -> swimmer is sound and no option competes, but the gloss 'A trained athlete who participates in swimming meets' teaches the competitive sense only - everyday 'swimmer' is anyone who swims. Hide t |
| 1 | item:4x | section |  | Rounds 1-2 passed, but many books group chapters into sections or parts, so 'a chapter is part of a section' is defensible. Drop section; paragraph, essay, lesson remain. |
| 1 | item:5h |  | hidden | Rounds 1-2 passed; tire is made from rubber and no option competes, but the gloss prints the genus names lowercase ('hevea and ficus') - a miscapitalisation a spelling app would display, and too technical for level 3. Hi |
| 1 | item:5m |  | hidden | Rounds 1-2 passed; popcorn is made from corn and no option competes, but the gloss shows the plant ('Tall annual cereal grass...') rather than the kernels, and prints 'america' lowercase. Hide the gloss. |
| 1 | item:5r | cream |  | Rounds 1-2 passed, but many cakes are made with cream (cream cakes, cheesecake), so 'cream' is a partly defensible material beside flour. Drop cream; bun, loaf, block remain. |
| 1 | item:6d |  | hidden | Rounds 1-2 passed; a magnet is used to attract and no option competes, but the gloss ('by means of some psychological power or physical attributes') is the person-attracts-attention sense, not magnetic force. Hide the gl |
| 1 | item:6z |  | hidden | Rounds 1-2 passed; a scale is used to weigh and no option competes, but the gloss 'Have a certain weight' is the intransitive sense (it weighs 5 kg), not measuring weight. Hide the gloss. |
| 1 | item:7b | orphan |  | Rounds 1-2 passed; home/residence is sound, but 'orphan' as a wrong answer beside 'home' frames an orphaned or fostered child as the not-home option - needlessly hurtful filler. Drop orphan; vacation, nowhere, permanent  |
| 1 | item:7p | realization, cognition |  | Rounds 1-2 passed, but thesauri list 'realization' as a synonym of comprehension and 'cognition' overlaps it, so grasp is not the only defensible answer. Drop both; volition and actuality remain. |
| 1 | item:7z |  | hidden | Rounds 1-2 passed; barrier/obstacle is sound and the physical-barrier distractors are hyponyms, not synonyms, but the gloss restricts obstacle to 'Something immaterial...', which contradicts the physical barrier the item |
| 1 | item:8g | agnostic |  | Rounds 1-2 passed; accept -> acceptance is sound, but with a gloss about believing something true, 'agnostic' as a wrong answer reads as judging a stance on faith. Drop agnostic; skeptic, refuse, admiration remain. |
| 1 | item:8v | rotational |  | Rounds 1-2 passed, but 'rotational' is itself in rotate's word family (the same idea with a new job), so rotation is not the one defensible answer. Drop rotational; pivot, compressor, propulsion remain. |
| 1 | item:9i |  | hidden | Rounds 1-2 passed; a pump is used to inflate and no option competes, but the gloss leads with 'Exaggerate', the figurative sense (inflated claims), not filling with air. Hide the gloss. |
| 1 | item:a7 | null |  | Rounds 1-2 passed, but 'null' is the root of annul (annul = make null), so a child can defend 'annul becomes null' as the same idea with a new job. Drop null; revoke, repeal, postponement remain. |
| 1 | item:b3 |  | hidden | Overturning the double pass on the gloss only. hot -> scorching is right and none of humid/breezy/spicy/cooler is a stronger 'hot' (spicy is a different sense, not a stronger one). But the gloss 'Make very hot and dry' d |
| 1 | item:b5 |  | hidden | Overturning the double pass on the gloss only. surprised -> astonished is right; terrified/exhausted/thrilled/fascinated are strong forms of other feelings. But 'Affect with wonder' is the definition of the verb 'astonis |
| 1 | item:b7 | joyful |  | Overturning the double pass on one option. happy -> ecstatic is right, but 'joyful' is defensible as a stronger 'happy' too: the classroom 'shades of meaning' scale runs happy -> joyful -> ecstatic, so a child who picks  |
| 1 | item:bd |  | hidden | Overturning the double pass on the gloss only. scared -> terrified is right and no other option is a stronger 'scared'. But 'Fill with terror' defines the verb 'terrify', not the adjective 'terrified'. Hide the gloss. |
| 1 | item:bf |  | hidden | Overturning the double pass on the gloss only. wet -> soaked is right; mud/asphalt/muddy/scrub are not a stronger 'wet'. But the gloss 'Submerge in a liquid' is the verb 'soak' and suggests dunking, not 'thoroughly wet', |
| 1 | item:bg |  | hidden | Overturning the double pass on the gloss only. angry -> furious is right; resentful/sullen/irascible/gruff are kinds of bad temper, not a stronger anger. But the gloss 'Marked by extreme and violent energy' is the 'a fur |
| 1 | item:bi |  | hidden | Overturning the double pass on the gloss only. pleased -> delighted is right; fascinated/exhausted/terrified/astonished are strong forms of other states. But 'Give pleasure to or be pleasing to' defines the verb 'delight |
| 1 | item:bk |  | hidden | Overturning the double pass on the gloss only. hungry -> starving is right; grumpy/devour/miserable/gulp are not a stronger 'hungry'. But the gloss 'The act of depriving of food or subjecting to famine' is the act of sta |
| 1 | item:bn |  | hidden | Overturning the double pass on the gloss only. tired -> exhausted is right and no other option is a stronger 'tired'. But 'Wear out completely' defines the verb 'exhaust', not the adjective 'exhausted' (very tired). Hide |
| 1 | item:c3 |  | hidden | Overturning the double pass on the gloss only. colorful <-> colorless is right and vibrant/silken/bright/lacy are not opposites. But the gloss 'Lacking in variety and interest' is the figurative (dull) sense; the pair is |
| 1 | item:c5 |  | hidden | Overturning the double pass on the gloss only. thoughtless <-> thoughtful is right; careless/negligent are near-twins of thoughtless, immoral/cowardly are not opposites. But the gloss 'Having intellectual depth' is the ' |
| 1 | item:dp |  | hidden | Overturning the double pass on the gloss only. A chime is a percussion instrument (tuned bells), and clang/jingle/ding are sounds while 'instrumental' is the wrong job, so the answer is unique. But the gloss 'A device th |
| 1 | item:e4 |  | hidden | Overturning the double pass on the gloss only. The link is sound: response -> responsive, and 'responsiveness' is a same-family word with the wrong job (exactly the trap the lesson describes), reflex/adverse/impulsive un |
| 1 | item:16q |  | hidden | Overturning the double pass on the gloss only. jealous ~ envious is a sound everyday pair, and mad/regretful/cynical/fearful are not twins. But the gloss 'Showing extreme cupidity' defines envy as greed (cupidity = greed |
| 1 | item:17r |  | hidden | Overturning the double pass on the gloss only. omission ~ deletion is a sound pair (leaving something out), and insertion is the opposite, parentheses/contradictory/spoof unrelated. But the gloss 'Any process whereby sou |
| 1 | item:17t |  | hidden | Overturning the double pass on the gloss only. booth ~ stall (a market stall) is right, and van/bazaar/inn/discount are not twins. But the gloss 'A division of a stable or barn accommodating one animal' is the horse-stal |
| 1 | lesson:degree:idea |  |  | Overturning the double pass, taking up round 2's note. The text says pairs are 'the same feeling or size, turned up' and then gives warm/hot/scorching, which is temperature, neither a feeling nor a size; the items in thi |
| 2 | item:8 |  | hidden | Agree with r1 over r2: shipment/freight is a sound pair and inventory/receipt/premium do not compete, but the shown gloss 'Is goods or cargo transported for pay' is broken English with a stray leading 'Is' (the same defe |
| 2 | item:161 |  | hidden | Agree with r1 over r2: handcuff/manacle is a sound L7 pair and deterrent/impediment/pillory do not compete, but the shown gloss 'A shackle for the hand handcuffs' is a garbled run-on displayed to a child. Hide the gloss. |
| 2 | item:185 | albumin |  | accumulation/buildup is sound and no option competes, but 'albumin' (a blood/egg protein) is technical jargon far too obscure at L4 (age 11). Drop it; melanin and breakdown remain, neither a synonym. Gloss right. Both ro |
| 2 | item:y | stag |  | Agree with r1 on the option only: performing/acting is sound and the gloss names the drama sense, but 'stag' beside performing/solo/audition sits in the 'stag show / stag night' sense (men-only, often adult entertainment |
| 2 | item:7a |  | hidden | possible/feasible is sound at L4 and probable (likely) is a fair near-miss rather than a second answer, but the shown gloss 'Is capable of being done' carries the same stray leading 'Is' as the cringe/freight/miserable/j |
| 2 | item:9p | mastic |  | perfume/perfumer holds (a perfumer makes perfume, the gloss says so) and is the only person on offer, but 'mastic' (a resin) is far too obscure at L5 (age 12), as r2 noted. Drop it; fragrance, beeswax and linseed remain, |
| 2 | item:ae |  | hidden | Agree with r1 on the gloss: responsive/responsiveness is an exact family pair and stimuli/stimulus/activation share no root, but the gloss for the noun reads 'Responsive to stimulation', an adjective phrase that repeats  |
| 2 | item:b4 |  | hidden | Agree with r1 over r2 on the gloss: sad -> miserable is a true stronger pair and ecstatic/patriotic/nostalgic do not compete, but the gloss 'Is very unhappy uneasy or uncomfortable' is broken English (stray leading 'Is', |
| 2 | item:b6 |  | hidden | Agree with r1 over r2 on the gloss: breeze -> gale is a true stronger pair and sway/sunflower/dew do not compete, but the gloss 'A strong wind moving 45-90 knots' teaches a false number (a gale, Beaufort 7-10, is about 2 |
| 2 | item:bu |  | hidden | Agree with r1 over r2 on the gloss: warm -> hot is a true stronger pair and cold/gulp/downpour do not compete, but the gloss 'Used of physical heat' is only a usage note with no meaning - the defect for which picturesque |
| 2 | item:d9 |  | hidden | Agree with r1 over r2: zither -> instrument is true and fret/instrumental/saxophone do not compete, but the gloss 'A device that requires skill for proper use' is the tool sense of instrument, not the musical sense a zit |
| 2 | item:e8 |  | hidden | aggressive/aggressiveness is an exact family pair and repulse/harassment/exploitation/antagonist share no root, but the shown gloss 'The quality of being bold and enterprising' is the business-praise sense, while the ite |
| 2 | item:ej |  | hidden | Agree with r1 over r2 on the gloss: envious/jealous is a sound pair and wary/giddy/unhappy/impassive do not compete, but the gloss 'Is feeling resentment against someone because of success' is broken English (stray leadi |
| 2 | item:es | knob |  | Link and gloss sound: oval = ellipse; round/lob are not synonyms. But 'knob' is labelled taboo slang in British English (penis; 'you knob' as an insult), and the rule fails a word that is also a common insult even in an  |
| 2 | item:fy | restless |  | Agree with R1 over the cycle-1 overrule: quiet also means calm/still (a quiet night, a quiet child), and dictionaries give restless/agitated as its antonyms in that sense, so 'restless' is a second defensible opposite. l |
| 2 | item:g7 |  | hidden | Agree with R1 over the cycle-1 overrule: the link is right (entrance is the opposite of exit; shut/ascend/sink/exclude are not), but the shown gloss 'Something that provides access (to get in or get out)' tells the child |
| 2 | item:gn | pasty |  | Link and gloss sound: gelatin -> gelatinous; greasy/gummy/preservative share no root. But 'pasty' is a body insult (pasty-faced, pale-skinned) - the same word cycle-1 round 3 dropped from item:ly for that reason - so dro |
| 2 | item:hd | abort |  | Link and gloss sound: continuance is a real noun of continue; disruption/resume/inactivity share no root. Agree with R1 over the cycle-1 overrule: 'abort' as random filler carries a dominant adult sense (ending a pregnan |
| 2 | item:hk |  | hidden | Agree with R1 over the cycle-1 overrule: the link is right (a synthesizer is a musical instrument; amplifier/sonata/multimedia/instrumental fail it), but the gloss is the general 'device that requires skill' sense, not t |
| 2 | item:hx | parmesan |  | Link and gloss sound: marinara is a sauce; mozzarella/cutlet/brioche are not its categories. But 'parmesan' is a proper adjective (of Parma) that dictionaries capitalise, shown in lowercase as filler - the same call cycl |
| 2 | item:kr |  | hidden | Link is sound (loyalty = devotion; betrayal/leadership/agony/believer are not synonyms), but agree with R1: the gloss 'Strong attachment zeal enthusiasm' has lost its punctuation and reads as a word pile to a level-2 (ab |
| 2 | item:m5 | blister |  | Link and gloss sound: bump (a lump from a knock) = swelling; shin/sag/eyelash are wrong. Agree with R1 over the cycle-1 overrule that 'blister' is also a raised bump on the skin, so a careful child can defend it in the s |
| 2 | item:od |  | hidden | Agree with R1. contempt = disdain is sound and insult, acceptance, affront are not feelings of scorn, but the gloss shown is garbled ('...unworthy of or beneath one scorn') and defines disdain with the clue word itself.  |
| 2 | item:on |  | hidden | Agree with R1. legacy = inheritance (the thing handed down) is sound and claimant, eyewitness, landowner are people, but the gloss is inheritance's 'hereditary succession' sense (the act of succeeding), not the property  |
| 2 | item:p0 | thoroughbred |  | A racehorse is a kind of horse, but thoroughbred is the breed most racehorses are, so a child can reasonably pick it (R2's note). Drop it; rodeo, equestrian, handler remain and none is a category of racehorse. Gloss righ |
| 2 | item:ph |  | hidden | Agree with R1. Nutmeg is a spice and parsley, almond, coconut, soy are not categories it belongs to, but the gloss shown is spice's 'used as a preservative' sense rather than the flavouring sense a child needs. Hide it. |
| 2 | item:r6 | beggar |  | beg = entreat is exact, but 'beggar' as filler labels a person by poverty and is used as a put-down (R2's note); the rules bar stigmatising filler. Drop it; bully, grumble, shun remain. Gloss right. |
| 2 | item:u6 | plump, beaver |  | Agree with both rounds on the distractors: 'plump' beside pig/hog invites a body-shaming reading, and 'beaver' carries a common vulgar slang sense, which fails even in its innocent sense. pig = hog is a sound basic farm- |
| 2 | item:ua |  | hidden | Partly agree with R1. The bridge is 'means about the same as', and thesauruses give fatigue as the everyday synonym of exhaustion ('suffering from exhaustion/fatigue'); laziness, dizziness, fortitude, boredom do not comp |
| 2 | item:ut | matt |  | crease = wrinkle is exact and the gloss is right, but 'matt' is a rare variant spelling (usually 'matte') that reads like the name Matt in a spelling app, and the same word was dropped from another item for that reason.  |
| 2 | item:vb | optimise |  | Agree with R1. customize = personalize is exact and covet and recalculate are clearly wrong, but offering both 'optimise' and 'optimize' in a spelling app makes one look like a misspelling and wastes an option. Drop 'opt |
| 2 | item:vn | littoral |  | Partly overrule R1. Under the bridge 'means about the same as', aqua and cyan both name the same greenish-blue (dictionaries define both that way), and the gloss is cyan's colour sense; 'water' was already dropped. But ' |
| 2 | item:wi |  | hidden | certify -> certification is the right verb-to-noun family, and confirmation, applicant, subscription, publisher are other roots. But the gloss is the narrow enfranchisement sense ('...or bestowing a franchise on'), which |
| 2 | item:yy | screw |  | Side with r2's fail on safety, not on the link. hole = opening is right and the gloss fits, but 'screw' has a common crude slang sense and here sits next to 'hole' and 'peg', which turns an innocent set into innuendo for |
| 2 | item:zp |  | hidden | Partly side with r1. circumference = girth holds in the 'distance around something' sense (the girth of a tree trunk; thesauri list girth under circumference), and vertex/vertices, longitude, median do not compete (the v |
| 2 | item:10t | vert |  | Partly side with r1. flip = somersault is a dictionary sense (MW: a somersault, especially in the air; children say 'do a flip'), the gloss pins it, and no option is a synonym. But 'vert' reads to most children as a frag |
| 2 | item:13s | greatness |  | Partly side with r1. significance = meaning is a standard sense ('the significance of a symbol'), and the gloss shows it. But significance's commoner sense is importance, and 'greatness' is close enough to importance ('t |
| 2 | item:17n | thick |  | Side with r1 on 'thick'. sharp/blunt is the canonical pair and the gloss is right, but 'thick' is a standard opposite of sharp in the mind sense (sharp-witted vs thick-headed), and in that sense it is a playground insult |

### Wording rewritten

- **lesson:same:trap**: Watch for a word that goes WITH the word but does not MEAN the same. Cool and breeze often go together, but breeze does not mean cool.
- **lesson:part:bridge**: The {A} is part of the {B}.
- **lesson:part:spot**: Ask: is the first thing one of the pieces that make up the second? A wheel is part of a bicycle. A cup on a table is not part of the table.
- **lesson:use:bridge**: We use the {A} to {B}.
- **lesson:use:trap**: Another thing from the same place is a trap. For broom, bucket tempts you because it lives in the same cupboard, but a bucket is a thing, not a job. The answer is the job a broom does: sweep.
- **lesson:degree:bridge**: {B} is a stronger word than {A}.
- **lesson:degree:trap**: A near twin at the SAME strength is the trap. For big, large tempts you, but large is just as strong as big. The stronger word is huge.
- **card:shiva**: Shiva is one of the most loved gods in Hinduism, honoured by Hindu families all over the world today. Many families pray to him as the one who protects, changes and makes new beginnings possible. In many homes and temples he is shown in quiet meditation, with the river Ganga flowing from his hair. Many families keep the festival of Maha Shivaratri, a night of prayer, with songs and stories. Families who honour him each do it in their own way. If yours does, ask them how.
- **lesson:degree:idea**: Some pairs are the same idea, turned up. Warm turned up is hot. Hot turned up is scorching.

## Every unit dropped

| unit | why |
|---|---|
| item:0 | Agree with both fails. 'friday', 'december', 'easter' are proper nouns shown lowercase (not allowed as filler) and 'feast' (feast day) is a defensible synonym of holiday; dropping all four leaves no wrong options. |
| item:1 | Agree with both fails: a sister is a kind of sibling, not the same meaning; no true synonym offered. |
| item:3 | Agree with both fails: sitting = posing only in the portrait sense; a child reads sitting as being seated and 'rest' is tempting. |
| item:5 | Agree with both fails: to children 'diner' is a restaurant; the 'one who dines' sense is obscure at L2, and eater is broader. |
| item:7 | Agree with both fails: tavern/bar are drinking-establishment words (gloss says 'licensed to sell alcoholic drinks') and 'spit' is a crude option. |
| item:68 | Agree with both fails: 'bore' at L3 reads as 'be dull' and its gloss confirms that sense ('a person who evokes boredom'); 'dig' is also arguable. Too confusing to rescue. |
| item:76 | Agree with both fails: an alibi is a narrow legal kind of excuse (being elsewhere at a crime), not the same meaning. |
| item:92 | Agree with r1 (and r2's own 'FLAWED' note): the bridge for this link says '{A} becomes {B}: the same idea with a new job', and 'meaningless' reverses the idea (without meaning); the parallel to the noun->adjective pairs in this set (hill:hi |
| item:93 | Agree with r1: a latch fastens a door but does not lock it ('latched but not locked' is the everyday distinction), so latch/lock is not the same meaning. Doubtful, so it does not ship. |
| item:94 | Agree with both fails: 'boring' to a child means dull; drilling = boring is a confusing sense, and bunker/weld are obscure. |
| item:96 | Agree with both fails: pregnancy/gestation/fetus is a reproductive topic, and 'gestation' is obscure at L4. |
| item:97 | Agree with r1: a mirror is one kind of reflector and a bike reflector is not a mirror; the words are not interchangeable. |
| item:99 | Agree with both fails: 'smack' is heroin slang and a hit, and 'boring' reads as dull to a child. |
| item:100 | Agree with r1 over r2: 'levy' is too formal and obscure for L2 (age 9), and 'payment' is arguably close to tax. |
| item:101 | Agree with both fails: the gloss is the adjective 'striking' (impressive); 'hit' is a family member. Dropping hit leaves only puck and flick, and flick is itself a light hit, so it is not rescuable. |
| item:102 | Agree with both fails: 'deceased' is formal and adult for L2 and the option set is death-themed (coffin, memorial, death). |
| item:103 | Link (a): 'pouch' is a narrower word for 'bag'. Dictionaries define a pouch as 'a small bag', so d is a kind of c, which is the 'A kind of' link, not 'Same meaning'. The shown gloss ('a sack or satchel of moderate size') also does not descr |
| item:107 | Agree with both fails: 'sho' is a very obscure Japanese mouth organ that reads as a typo of 'shoe', making footwear look right. |
| item:110 | Agree with both fails: cheat and chess do not mean the same; the pair is broken. |
| item:112 | Agree with both fails: andromeda as a shrub genus is obscure; children know it as a galaxy. |
| item:113 | Agree with both fails: a steppe is grassland, not a kind of tree; broken pair. |
| item:117 | Agree with both fails: vegetation is plants collectively, not a kind of plant, and the gloss is the factory sense. |
| item:121 | Agree with both fails: a smudge is not a kind of insect; broken pair. |
| item:125 | Agree with both fails: a cleat is not a kind of metal, and buckle/padlock/clutch are co-members; broken. |
| item:129 | Agree with both fails: rain is a kind of precipitation, not the same meaning (snow is precipitation too). |
| item:130 | Agree with both fails: statehouse is US-specific and obscure, and 'abattoir' (slaughterhouse) is an unsuitable option. |
| item:131 | Agree with both fails: astrantia and every distractor are obscure botanical genera; gloss is the factory sense. |
| item:133 | Rounds 1-2 passed it, but every wrong option (july, december, november, tuesday) is a month or weekday - a proper noun shown lowercase as filler, which a spelling app must not display. Dropping them would leave no options, so it cannot be r |
| item:134 | Agree with both fails: hiss = boo only in the heckling sense, and 'smack' is drug slang. |
| item:135 | Agree with r1 over r2: arrow = pointer only in the sign/cursor sense; the main sense (projectile) makes 'bullet' look right, and after dropping it only intercept and 'stab' (a weapon word) remain. |
| item:136 | Agree with both fails: brush = undergrowth is a sense most L4 children do not know, and 'hedge' is tempting. |
| item:146 | Agree with both fails: pustule/boil/papule are gross medical terms, a pustule is not a boil, and 'papule' is arguable. |
| item:147 | Agree with both fails: structural does not mean organizational. |
| item:150 | Agree with both fails: a pelt is an animal skin, not a kind of coat garment; 'fell' is an archaic synonym. |
| item:152 | Agree with both fails: a picnic is not a cookout (picnic food need not be cooked). |
| item:154 | Agree with both fails: accused is not the same as suspect, and 'murder' is a violent option at L2. |
| item:157 | Agree with r1 over r2: a crypt is an underground vault and not every tomb is one; 'monument' is arguable and the set is heavily death-themed. Doubtful. |
| item:158 | Agree with r1 over r2: a garland (a string of flowers, a mala to most of this audience) is not a wreath (a ring, with funeral associations); 'turban' as filler beside it is also poor. |
| item:160 | Agree with both fails: 'ideology' is arguable, 'conviction' at L2 also means a criminal conviction, and capitalism/feminism are political filler. |
| item:162 | Agree with both fails: soaring (rising high) is not gliding, and 'climax' has a sexual double meaning. |
| item:165 | Agree with both fails: 'dementia' and 'madness' as filler stigmatise mental illness. Dropping them leaves perception and 'animus' (Latin for mind), which is arguable, so it cannot be rescued. |
| item:168 | Agree with r1: the plural 'cacti' as 'a kind of plant' gives an ungrammatical bridge in a spelling app, and the gloss is the factory sense; dropping options cannot fix c. |
| item:172 | Agree with both fails: 'a national' as a noun meaning citizen is obscure for L1 (age 8). |
| item:176 | Link (a): a swamp is one TYPE of wetland (wetlands include marshes, bogs, fens and swamps; WordNet puts swamp under wetland). d is a narrower word, so 'Same meaning' is false and the pair teaches the 'A kind of' link under the wrong name. |
| item:177 | Agree with both fails: a caterpillar is one kind of larva (a maggot is a larva too); not the same meaning. |
| item:180 | Agree with both fails: 'buttock' is a giggle body word, and 'extremity' (a hand or foot) is not quite appendage (a limb) and reads as 'extreme' to a child. |
| item:181 | Agree with both fails: cholesterol is not a kind of animal; broken pair. |
| item:183 | Agree with both fails: 'rustic' as a noun is obscure and demeaning at L2, and 'peasant' is used as an insult. |
| item:a | Agree with both fails: juice is a kind of extract, and resin and latex are plant extracts too. |
| item:e | Agree with r1 over r2: 'patron' at L2 mainly means supporter or sponsor and is advanced for age 9. |
| item:h | Agree with both fails: a network is not a grid. |
| item:t | Rounds 1-2 passed it, but three of four wrong options are proper nouns shown lowercase as filler (atlantic, pacific, ohio). Dropping them leaves only northwest, under the 2-option minimum, so it cannot be rescued. |
| item:u | Agree with both fails: 'extent' is a synonym of amount and 'gross' is arguable; dropping them leaves only one wrong option. |
| item:y | Link (a): acting is one kind of performing. Singing, dancing, playing music and doing magic are all performing but not acting, so d is narrower than c. A careful child can see 'you can perform a song without acting', so 'Same meaning' is no |
| item:1f | Rounds 1-2 passed it, but all four wrong options (december, november, october, july) are month names shown lowercase as filler. Cannot be rescued by dropping. |
| item:1i | Rounds 1-2 passed it, but three wrong options (february, july, october) are month names shown lowercase as filler; dropping them leaves only 'month', under the 2-option minimum. |
| item:1v | Rounds 1-2 passed it, but three wrong options (july, october, december) are month names shown lowercase as filler; dropping them leaves only 'afternoon', under the 2-option minimum. |
| item:2c | Agree with r1: 'pink' is defensible (rose is a shade of pink) and 'june' is a lowercase proper noun; dropping both leaves no wrong options. |
| item:2m | Agree with both fails: 'young' is not a kind of animal; broken pair. |
| item:2o | Agree with both fails: a pocket is part of a garment, not a kind of one. |
| item:2s | Agree with r1: a scoop is arguably a kind of spoon and 'spit' is crude; dropping both leaves only one wrong option. |
| item:2w | Agree with both fails: coral to an 8-9 year old is the sea creature; 'coral is a kind of colour' is a secondary sense and ambiguous at L2. |
| item:2x | Agree with both fails: baking is not a kind of cake; broken pair. |
| item:2z | Agree with both fails: laundry is clothes collectively, not a kind of garment. |
| item:3o | Agree with both fails: 'judge' is already the agent noun; referee is a loose match. |
| item:3u | Agree with both fails: 'guard' is already the agent noun, and defender/escort also guard. |
| item:4a | Agree with r1 over r2: curly and wavy are contrasted categories in everyday talk (curly vs wavy hair), not the same meaning. |
| item:4g | Agree with r1 over r2: 'departed' at L2 reads as 'left' (the train departed); it is a euphemism, and the options are a death set (coffin, memorial, death). |
| item:4i | Agree with both fails: 'plant' in the factory sense is too adult at L2; a child reads plant as greenery. |
| item:4u | Agree with both fails: a clam has a shell too (and a pod is a pea's shell), and the gloss is the turtleneck sense; dropping both leaves one option. |
| item:5a | Agree with both fails: cask/keg/brewer are beer words; dropping them leaves one option (and bottles are often plastic). |
| item:5n | Agree with both fails: the body-part distractors push the fingernail sense (not iron), and modern nails are steel; the pair is shaky. |
| item:7d | Agree with both fails: supplement = appendix only in the book sense; a child knows a vitamin supplement and the appendix organ. |
| item:7j | Agree with both fails: phlegm and sputum are gross body-fluid words and 'harassment' is adult; dropping them leaves one option. |
| item:7l | Agree with r1 over r2: a carving is one kind of sculpture (clay and bronze sculptures are not carvings), and the gloss itself says so. |
| item:7o | Agree with both fails: scarce (in short supply) and sparse (thinly scattered) are only near-synonyms; a careful child would not equate them. |
| item:7s | Agree with r1: children are explicitly taught revising and editing as different steps of the writing process; the gloss calls revising a kind of editing. |
| item:7t | Agree with both fails: grumbling means complaining; only the stomach sense matches rumbling, and 'nag'/'rant' fit better. |
| item:7u | Agree with both fails: a cauldron is a very large pot, not a plain synonym, and 'pot' is also drug slang. |
| item:7v | Agree with both fails: arithmetic is a branch of maths, as geometry is. |
| item:7x | Agree with both fails: dominate and prevail are not the same meaning, and 'overrun' is as defensible. |
| item:8h | Agree with r1: caudal, alveolar and pectoral are anatomy jargon far too obscure at L4 (age 11), and they frame 'spine' as the backbone, whose adjective is 'spinal', while 'spiny' belongs to the prickle sense; the circular gloss 'Having spin |
| item:9a | Agree with r1 over r2: 'systemic' is adult vocabulary at L4, and the child-natural adjective of system is 'systematic'. |
| item:9k | Agree with both fails: 'bleacher' as a person is obscure (children know bleachers as seats), and oleoresin/turpentine are obscure. |
| item:9n | Agree with both fails: 'sioux', 'siberia', 'nebraska' are lowercase proper nouns, one a people's name; dropping them leaves one option. |
| item:9s | Agree with r1 over r2: to almost everyone a transmitter is a device, and then modem/telegraph also transmit; 'morse' is a lowercase proper noun. |
| item:9z | Agree with both fails: 'felon' and 'accomplice' are also people who do wrong, and 'murder' is violent; dropping them leaves one option. |
| item:a7 | Agree with r1 over r2: annul/annulment is legal/adult vocabulary (chiefly the annulment of a marriage or a law) and too obscure for L5 (age 12); the pair itself is the problem, so no drop or gloss change rescues it. |
| item:ai | Agree with R1/R2: the noun a child knows for observe is 'observation'; 'observance' is mainly the keeping-a-rule/religious-custom noun, so the item teaches the wrong partner. Dropping the astrology distractors would not fix that. |
| item:am | Agree with R1/R2: both c (arouse) and d (arousal) carry a common sexual sense; cannot be rescued by dropping options. |
| item:az | Agree with R1/R2: the bridge says 'the same idea with a new job', but odorless means WITHOUT odour; R2's blind solver picked 'smelly' as the adjective of odour. The pair does not fit its own link. |
| item:b8 | Overrules R1's pass: the answer itself is 'frigid', which has a dictionary sexual sense (an insult aimed at women); a double-meaning word cannot be the answer for 8-15, and an answer cannot be dropped. |
| item:b9 | Agree with R1/R2: 'nasty' and 'evil' are also stronger forms of bad, and so is 'miserable' (miserable weather, a miserable day). Dropping all three leaves one wrong option, below the minimum; the gloss is also the 'causing terror' sense. |
| item:bq | Overturn the double pass: this link's bridge reads '{B} is a stronger {A}', so the item asserts 'a lake is a stronger pond', which is false - a lake is a bigger body of still water, not a stronger one. Size is not strength, so the link is n |
| item:cq | Agree with R1/R2: shameful (disgraceful) and shameless (feeling no shame) are not opposites; a shameless act is usually shameful. False antonym. |
| item:cr | Agree with R1/R2: shameless and shameful are not opposites; the item teaches a false antonym. |
| item:ct | Agree with R1/R2: 'equity' is a defensible opposite of inequality, and 'ethnicity'/'capitalism' beside inequality read as political. Removing all three leaves one wrong option; cannot be rescued. |
| item:d0 | Agree with R1/R2: a lathe is a machine, not the hand 'implement' the gloss describes, it is obscure at level 5, 'screw' has a vulgar slang sense, and 'cutter' is arguable (a lathe cuts). Too many problems to rescue. |
| item:d3 | Agree with R1/R2: dolomite is obscure at level 6 and is chiefly known as a mineral, so 'a kind of rock' is not clean. |
| item:d4 | Agree with R1/R2: a scape is a leafless flower stalk, not a kind of flower; distractors bait the landscape sense. Broken. |
| item:d6 | Agree with R1/R2: a pupa is a life stage of an insect, not a kind of insect. |
| item:d8 | Agree with R1/R2: jute is at least as well known as a fibre as a plant, so 'fibre' is a second answer; 'twine' is also arguable (crafters call jute twine 'jute'), 'caulk' sounds like a vulgar word, and 'plant' is glossed as a factory. Dropp |
| item:db | Agree with R1/R2: a clove is a spice (a dried bud) or a garlic segment to a child; 'kind of flower' is wrong/confusing. |
| item:dc | Agree with R1/R2: a horseshoe is made OF metal, not a kind of metal; 'noose' is also unsuitable. |
| item:dd | Agree with R1/R2: a cornfield is a field, not a kind of plant; no option is a true category. |
| item:de | Agree with R1/R2: 'specie' is very obscure and reads as a misspelling of 'species', which the distractors bait. |
| item:df | Agree with R1 over R2: dulcimer is too obscure for level 5 (unlike zither it is not a childhood word), and 'harp' is a plausible pick for a stringed box instrument; dropping harp leaves only two options around an unknown word. |
| item:dh | Agree with R1/R2: an appetizer is food, not a kind of drink, and the blind solver picked 'starter'. Broken link. |
| item:do | Agree with R1/R2: to a child a chestnut is a nut or a tree; 'kind of wood' is a stretch. |
| item:dr | Agree with R1/R2: gemstones are mostly minerals/crystals, not rocks; the link is loose. |
| item:dv | Agree with R1 over R2: a drape is a curtain made OF cloth, not a kind of cloth (velvet is). The link is not exactly true. |
| item:dy | Agree with R1 over R2: receptacle and container are synonyms, not a 'kind of' pair; the game has a separate Same-meaning link, so this teaches the wrong link. The gloss also leans on the shipping-container sense. |
| item:e1 | Agree with R1/R2: the distractors (reef, toad, auk) point at the sea anemone, which is an animal; 'flower' would be the natural category and is absent; 'plant' is glossed as a factory. |
| item:ea | Agree with R1/R2: 'feminism' offered as an opposite of equality and 'supremacy' are politically loaded, and supremacy/domination are arguable opposites. Dropping them leaves one option. |
| item:eh | Agree with R1/R2: illustrative (clarifying by examples) does not mean descriptive; loose. |
| item:em | Agree with R1/R2 that 'monstrous' (and 'abominable') are second synonyms, and further: hideous means EXTREMELY ugly, so this is a Stronger/weaker pair mislabelled Same meaning. Dropping options does not fix the link. |
| item:en | Agree with R1/R2: a birdhouse is a small nest box, an aviary a large enclosure; not the same meaning. 'abattoir' is also grim. |
| item:eq | Agree with R1: earthenware is one kind of pottery (beside stoneware and porcelain), so this is a Kind-of pair labelled Same meaning. |
| item:et | Agree with R1/R2: a silhouette is a dark outline shape, not a shadow; related, not same meaning. |
| item:eu | Agree with R1/R2: the gloss itself says a pinafore is a sleeveless DRESS; only in one UK sense is it an apron. Ambiguous. |
| item:ex | Agree with R1: a chauffeur is a particular kind of driver (one employed to drive someone), so this is a Kind-of pair labelled Same meaning; R2 also failed it. |
| item:ez | Agree with R1/R2: children know potpourri as dried petals, not a medley; 'cardamon' is a variant spelling in a spelling app; 'horehound' is obscure and giggle-prone. |
| item:f0 | Agree with R1/R2: as a noun, cunning is also trickery and sleight, and 'stealth' overlaps too; dropping all of them leaves one option. |
| item:f4 | Agree with R1: the gullet is the oesophagus (as the gloss says), narrower than throat, and larynx is also arguable as throat. Not same meaning. |
| item:f7 | Agree with R1/R2: a boutique is a kind of shop, and stall/bakery are also kinds of shop; no true synonym. |
| item:f8 | Agree with R1/R2: a chrysalis is a butterfly/moth pupa (narrower), and 'teat' is unsuitable. |
| item:f9 | Agree with R1: unattractive -> ugly is a degree pair (unattractive < ugly < hideous), the app's Stronger/weaker link, not Same meaning. |
| item:fb | Agree with R1: tailoring and dressmaking are related crafts, not the same; 'corset' unnecessary. |
| item:fe | Agree with R1/R2: antagonistic, militant and defiant are all synonyms of combative (arguably closer than argumentative); dropping them leaves one option. |
| item:gj | Agree with R1/R2: benignity is obscure, and neoplasm/cyst/fibrosis frame benign as tumour vocabulary; dropping them leaves one option. |
| item:gp | Agree with R1/R2: 'abettal' is extremely rare (abetment is usual) and the distractors are adult crime terms. |
| item:gs | Agree with R1/R2: pleura/pleural is specialist anatomy, too obscure even at level 9. |
| item:gt | Agree with R1/R2: enteron/enteric is specialist vocabulary, too obscure for level 8. |
| item:h4 | Agree with R1/R2: mesoderm/mesodermal is embryology jargon, too obscure for level 7; 'ovarian' also unsuitable. |
| item:hg | Agree with R1/R2: a cantaloupe is a kind of melon (blind solver picked melon); 'vine' describes the plant, not the fruit. |
| item:hi | Agree with R1/R2: carcajou is very obscure and its synonym 'wolverine' is a trap; 'cracidae' is a taxon in lower case. |
| item:hl | Agree with R1/R2: amboyna is an obscure timber name, too obscure for level 8. |
| item:hm | Agree with R1/R2: magnesia is magnesium oxide, a compound (the mineral is periclase); the link is not clean. |
| item:ho | Agree with R1/R2: friedcake (a doughnut) is obscure/regional and 'kind of cake' is doubtful. |
| item:hq | Agree with R1/R2: aquilegia is obscure, 'pansy' is also a homophobic insult, and 'plant' is glossed as a factory. |
| item:hr | Agree with R1: caladium is a horticultural name too obscure for level 7, and 'pavilion' plays on the factory gloss; hiding the gloss does not cure the obscurity. |
| item:ht | Agree with R1: 'mustelid' is a zoological family term, too obscure for level 7. |
| item:hu | Agree with R1: curassow is obscure for level 8, and every distractor is equally obscure. |
| item:hz | Agree with R1/R2: a pyre is a pile of wood for burning (usually a funeral), not a kind of wood; the blind solver picked 'bonfire'. |
| item:i0 | Agree with R1/R2: iodoform is an antiseptic compound, not a kind of sweet. Broken. |
| item:i2 | Agree with R1/R2: 'melon' is the natural category (blind pick), and 'cantaloup' is a variant spelling. |
| item:i3 | Agree with R1/R2: cassia is mostly a tree genus and a spice; 'kind of shrub' is not clean, and it is obscure. |
| item:i5 | Agree with R1: euphorbia is obscure, every distractor is a lower-case Latin genus name, and 'plant' is glossed as a factory. |
| item:i8 | Agree with R1: ageratum is obscure for level 7, distractors (vitis, cassia, cornel) are obscure genus names, and 'plant' is glossed as a factory. |
| item:i9 | Agree with R1/R2: althaea is obscure, 'liliaceae' is a taxon in lower case, and 'plant' is glossed as a factory. |
| item:ic | Agree with R1/R2: a rhizome is an underground stem (part of a plant), not a kind of plant. |
| item:ie | Agree with R1: 'japonica' is an obscure botanical epithet, too obscure for level 7. |
| item:ii | Agree with R1/R2: ornamentation is the primary synonym of embellishment (blind pick); exaggeration is a secondary sense. |
| item:ij | Agree with R1: a schematic is a kind of diagram (its own gloss says so); not same meaning. |
| item:ik | Agree with R1/R2: fluorescence is a kind of luminescence; not same meaning. |
| item:il | Agree with R1/R2: a bean is one kind of legume (peas and lentils are others); not same meaning. |
| item:im | Agree with R1/R2: a boutique is a kind of shop; 'lyon' is a place name in lower case. |
| item:in | Agree with R1/R2: metazoa is a taxonomic group name, very obscure; 'subkingdom' was the blind pick. |
| item:io | Agree with R1/R2: gramma (grama grass) is very obscure and reads as 'grandma'. |
| item:ip | Agree with R1: caragana is an obscure plant genus, too obscure for level 8. |
| item:iq | Agree with R1/R2: a thallus is a plant body (a part), not a kind of plant; 'plant' is glossed as a factory. |
| item:iv | Both rounds passed, but I fail it on suitability. tonal/tonality are music-theory terms well beyond a level-5 (about age 11) child, and the shown gloss ('Any of 24 major or minor diatonic scales that provide the tonal framework...') is the  |
| item:ix | I agree with both rounds. Whiteness, complexion and melanin put skin-colour words next to 'discolor', which is a colourism risk for this audience. Dropping those three would leave only one wrong option (pigmentation), so it cannot be fixed. |
| item:jf | I agree with both rounds. liter/litre is one word in its US and UK spellings, not two words that mean the same. In a spelling app it teaches the wrong lesson. |
| item:jg | I agree with both rounds. A portfolio (a large flat case for drawings) is not a briefcase. The two are related objects, not synonyms. |
| item:ji | I agree with both rounds. A magistrate is a particular kind of judge (a lay or lower-court judge), so the pair is narrower-to-broader, not the same meaning. |
| item:jk | I agree with both rounds. Grease is one kind of lubricant (the gloss itself says 'a thick fatty oil used to lubricate'), so the pair is narrower-to-broader, not the same meaning. |
| item:jm | I agree with both rounds. 'beating' at level 1 reads as violence. The gloss gives the winner's sense ('the act of overcoming'), which makes 'win' and 'victory' arguable answers too, so the item is ambiguous. |
| item:js | Link (a) and level (d): in everyday and British use, 'extremities' means the hands and feet (Oxford, Cambridge), which are only the ends of the limbs. The 'limb' sense is medical register ('upper/lower extremities'). To an 11-year-old, extr |
| item:jw | I agree with both rounds. Smog is haze caused by pollution, so it is a narrower term, not the same meaning as haze. |
| item:jx | I agree with R1. The gloss defines exhaustion as 'extreme fatigue', which tells the child it is the stronger word. That makes it a stronger/weaker pair under a 'same meaning' link. Doubtful, so it does not ship. |
| item:jz | I agree with both rounds. To a child, 'grumble' means complain. It matches 'rumble' only in the weak secondary sense of a low noise. |
| item:k0 | I agree with both rounds. To a child, 'bike' means a bicycle, so motorcycle is right only in a secondary sense, and 'scooter' muddies it further. |
| item:k5 | I agree with both rounds. Tavern, bar and mug make a pub-and-alcohol theme unsuitable at level 2, and the gloss for 'bar' is the metal-rod sense. |
| item:k7 | I agree with both rounds. 'dickens' is a lowercase proper name and a mild oath. 'romantic' = 'idealist' depends on a rare noun sense that children will read as love. Unsafe and confusing. |
| item:k9 | I agree with both rounds. 'limber' as a vehicle (an artillery cart) is archaic, and children know limber only as 'flexible'. |
| item:kf | I agree with both rounds. An acquisition is any getting of possession, and a purchase is one way of getting it. Broader, not the same meaning. |
| item:kh | I agree with both rounds. Fumes are not clearly 'a kind of cloud', and 'vapor' is at least as defensible a category. R2's blind solver picked it. |
| item:kn | I agree with both rounds. Shopping includes searching, so it is not the same as purchasing, and 'acquisition' is an equally defensible synonym of purchasing. |
| item:kq | I agree with both rounds. Prairie and steppe are region-specific grasslands, not exact synonyms, and 'alaskan', 'abel' and 'sahara' are proper nouns shown in lowercase as filler. |
| item:kw | I agree with both rounds. A kettle is made of metal, not a kind of metal. The link is false. |
| item:ky | I agree with R1. 'schist' sounds like a common swear word, which is a guaranteed snigger for ages 8 to 15. |
| item:l0 | I agree with both rounds. A clan is a kin group within a people, not the same as a tribe. The gloss's '(usually preliterate)' framing is loaded, and 'ethnic' is used as filler. |
| item:l1 | I agree with both rounds. 'penetrate' carries a sexual double meaning for this age band, and it is not the same as 'enter' (it means passing through against resistance). |
| item:l4 | I agree with both rounds. A chauffeur is a particular kind of driver, one employed to drive others, so the pair is narrower-to-broader. |
| item:l6 | I agree with both rounds. A melody is the tune, one part of a song, so the two words are related, not the same. |
| item:l7 | I agree with both rounds. Compost is one kind of fertilizer, so the pair is narrower-to-broader. |
| item:lf | I agree with both rounds. A monolith is a block or monument made of stone, not a kind of stone, and 'pillar' muddies it further. |
| item:li | I agree with both rounds. A defendant is the accused in court, while a suspect is merely under suspicion. They are related legal words, not the same meaning. |
| item:lo | I agree with both rounds. 'several' (more than two but not many) and 'some' (an unspecified amount) are not the same meaning, and the gloss 'Quantifier' teaches nothing. |
| item:lt | I agree with both rounds. A beneficiary is one particular kind of recipient (of a will, insurance or benefit). The gloss makes recipient the broader word. |
| item:lw | I agree with both rounds. The gloss is the factory sense of 'plant', and seaweed is algae, not a true plant, so the link itself is doubtful. |
| item:m1 | I agree with both rounds. Authority is rightful power, not power itself. 'leadership' is arguable, and 'authority' is advanced for level 1. Doubtful. |
| item:m2 | I agree with both rounds. 'ornis' (the bird life of a region) is extremely obscure and is not a kind of bird. |
| item:m6 | I agree with both rounds. Lumber is sawn timber, a processed kind of wood, so wood is broader, and 'plank' is arguable. |
| item:m8 | I agree with both rounds. Feasting (eating lavishly) is not the same as dining, and 'easter' is a festival name shown in lowercase. |
| item:md | I agree with both rounds. Rainfall is one kind of precipitation (snow, sleet and hail are others), so the pair is narrower-to-broader. |
| item:mf | Level (d) and loose fit: 'elicit' (and 'evoke') are secondary-school academic words, too advanced for L4 (about age 11). They also overlap only in the 'call forth a response' sense: you evoke a memory or an image, but you elicit an answer o |
| item:mn | I agree with both rounds. A breakthrough is an important discovery, so the pair is narrower-to-broader, and 'revelation' is an equally defensible synonym. |
| item:mp | I agree with both rounds. 'brushing' is an action, not a kind of tool. The link is false. |
| item:mv | I agree with both rounds. A bureaucrat is a particular, negatively coloured kind of official, and 'bureaucratic' fits the adjective reading of 'official'. |
| item:mz | I agree with both rounds. Spice is one kind of seasoning, and ginger and mustard are seasonings too, so the item has more than one defensible answer. |
| item:n0 | I agree with both rounds. 'optical' is about light and optics, not a clean synonym of 'visual'. 'graphic' is defensible, and 'optical' is hard at level 2. |
| item:n2 | I agree with both rounds. 'hypothesis' and 'axiom' are defensible synonyms of assumption. Dropping them and the 'hypotheses' plural would leave only 'certainty', so it cannot be fixed. |
| item:n5 | I agree with both rounds. A cape is a headland, not a peninsula, and 'balkan', 'arabian' and 'canada' are proper nouns shown in lowercase. |
| item:n8 | I agree with both rounds. Tumbling is one kind of acrobatics, and 'somersault' (a tumbling move) is also defensible. |
| item:nf | I agree with R1. 'ugly' is a common playground body insult, and appearance-judgement pairs are unsuitable for 8 to 15. |
| item:nl | I agree with both rounds. 'fastener' is a more natural answer for pin (R2's blind solver chose it). 'pinion' (to pin down) is also defensible, and 'knob' is vulgar slang. Dropping all three would leave one option. |
| item:nq | I agree with both rounds. 'gestation' is adult and obscure at level 4, and a cluster of pregnancy and puberty words is unsuitable distractor material for this age band. |
| item:ns | I agree with both rounds. Shellfish include crustaceans, not only mollusks, and many mollusks are not shellfish, so the link is false. |
| item:nu | R2's obscurity point decides it. 'flounce' as a dress trim is obscure even at level 7: children know the word only as 'to storm off', and the distractors are all garment words. Doubtful, so it does not ship. |
| item:nw | I agree with both rounds. archil/orchil is two spellings of a lichen dye, far too obscure for any child, and 'aal' is too. |
| item:ny | I agree with both rounds. A cocoon (a silk case) is not a chrysalis (a butterfly pupa), 'sucker' is an insult, and 'anopheles' is obscure. |
| item:o0 | I agree with both rounds. A sabot is a wooden clog, so 'clog' is equally defensible, and 'sabot' is obscure at level 5. |
| item:o2 | Link (a): a platter is a large serving plate or dish, while a tray is a flat board with a rim for carrying things (Cambridge). They are related tableware, not the same thing. A cafeteria tray is not a platter, and the gloss shown is tray's  |
| item:o3 | I agree with both rounds. Most acacias are trees and 'tree' is not offered, so 'shrub' is not clearly the category. |
| item:o5 | I agree with both rounds. Spice is one kind of flavoring, and 'sweetener' is also a flavoring, so there is no exact synonym. |
| item:o6 | I agree with R1. Body-part distractors (eyesight, retinal, pituitary) beside 'abnormality'/'defect' frame bodies as defective, which stigmatises disability. abnormality is also not exactly 'defect'. |
| item:o9 | I agree with both rounds. An essay is not an article (a school essay is not a published piece). A loose synonym at level 1. |
| item:oa | I agree with both rounds. 'thong' has an underwear meaning and 'pinion' is defensible. Dropping both leaves 'padlock' and 'bridle', and bridle (to restrain, curb) is itself arguable for the verb shackle, so it cannot be fixed cleanly. |
| item:ob | I agree with both rounds. 'hell' and 'damnation' are swear words and faith terms. Dropping them leaves 'adversary' and 'cruelty', and cruelty is arguable as a near-synonym of evil, so it cannot be fixed. |
| item:oc | I agree with both rounds. A child's allowance (pocket money) is not a grant. A weak, confusing synonym. |
| item:og | I agree with both rounds. 'arnica' and the distractors (buckthorn, capparis, artemisia) are too obscure, and arnica is better called an herb or a plant. |
| item:oj | I agree with both rounds. 'shrink' as slang for psychiatrist mocks mental-health care, and 'recoil' is defensible (shrink back). |
| item:oo | I agree with both rounds. 'chute' primarily means a slide or channel. As 'parachute' it is an informal clipping that confuses a child. |
| item:or | I agree with both rounds. A ski is not a kind of metal. The link is false. |
| item:oz | Agree with R1. At L2 (age ~9) range = scope only in the abstract 'extent' sense, and scope, threshold and infrared are well above that level; 'width' is also arguable for range's extent/span sense. Dropping width would not fix the level pro |
| item:p3 | Agree with both rounds: hay is cut and dried grass used as fodder, not a kind of grass, and 'crop' is equally defensible as its category. Link not exactly true. |
| item:p4 | Agree with both rounds: a politician is broader than a lawmaker (legislator); not the same meaning. |
| item:p6 | Overturning R1's pass: a snout is specifically an animal's long projecting nose and mouth (the gloss itself says so), narrower than 'nose'; applied to a person it is a mocking word. Not the same meaning. |
| item:p8 | Agree with both rounds: sugar is a kind of sweetener, not the same meaning; 'sugary' adds family confusion. |
| item:p9 | Agree with both rounds: juice is not an extract (an extract is obtained by steeping); weak synonym at L2. |
| item:pa | Agree with both rounds: a household need not be a family, and 'establishment' is a listed synonym of household. Link loose. |
| item:pc | Agree with both rounds: 'sweet' is a taste adjective, not a category glycerin belongs to; chemistry distractors (acetone, hexane, emulsifier) are too obscure. |
| item:pd | amorphous -> shapeless is sound, but all four distractors are technical jargon (orthorhombic, monoclinic, ferric, colloidal) too obscure for 8-15, as R2 says; dropping two still leaves only chemistry jargon. Not rescuable mechanically. |
| item:pf | Agree with both rounds: a chair is a kind of seat, not the same meaning. |
| item:pj | Agree with both rounds: 'corylus' and distractors vitis, calamus, agathis are Latin genus names far too obscure for 8-15. |
| item:pl | client = customer is exact, but at L1 (age 8) client is above level and the only two remaining distractors, patent and pension, are adult business vocabulary; nothing more can be dropped (two must remain). Too obscure for its level, so fail |
| item:po | Agree with both rounds: sap is not juice, 'latex' is itself a plant sap and so defensible, and 'juicy' is the answer's family. Not rescuable. |
| item:pv | Agree with both rounds: a franchise is not the same as a dealership (franchise is also the right to vote); adult business vocabulary. |
| item:pz | Agree with both rounds: vulnerability is not a clean synonym of exposure, and 'vulnerable' (the answer's family) confuses. |
| item:q3 | Agree with both rounds: 'fowl' ordinarily means poultry, a kind of bird; bird is the broader word, so not the same meaning. |
| item:q6 | Overturning R1's pass: a kernel is chiefly the inner part of a seed or nut (or a cereal grain), not a synonym of seed, and the gloss 'a small hard fruit' would confuse a child. Doubtful, so it does not ship. |
| item:qb | Agree with R1: the answer 'wrong' used as a noun reads as a quiz verdict and will be misread by a child; the item cannot be rescued by dropping options. |
| item:qd | Agree with R2. Thesauruses list soot as a synonym of grime (grimy black dirt), so soot is a second defensible answer, and dropping it would leave only silt, below the two-option minimum. Cannot be rescued. |
| item:qe | Agree with both rounds: a tomato is botanically a fruit, a well-known fact for children; 'kind of vegetable' is contestable. |
| item:qf | Agree with both rounds: magma is molten rock, not 'a kind of rock' to a child, and 'scum' is a common insult. |
| item:ql | Agree with both rounds: jubilation, ecstasy and rapture are all synonyms of euphoria, and 'ecstasy' is a drug name. Dropping them would leave fewer than two options. |
| item:qn | Agree with R1: a crane is a machine that uses a hoist, not the same thing, and 'crane' the bird with 'roost' adds ambiguity. |
| item:qr | Agree with both rounds: conifers are mostly trees, not shrubs, and 'evergreen' is the category a blind solver picks. |
| item:qt | Agree with both rounds: cement is an ingredient of concrete, not the same thing - a common misconception to avoid teaching. |
| item:qu | Agree with both rounds: hemorrhage is heavy bleeding (stronger), and the medical vocabulary (coronary, transfusion) is unsuitable here. |
| item:qx | Agree with both rounds: a novelist is a kind of author, not the same meaning. |
| item:qy | Agree with both rounds: earthenware is one kind of pottery (low-fired porous clay), narrower than pottery. |
| item:r1 | Agree with both rounds: 'sabot' is too obscure for L5, and 'clog' read as a blockage makes 'congestion' defensible. |
| item:r2 | Agree with R1: soap and detergent are different cleaning agents (detergent is synthetic); not the same meaning. |
| item:r3 | Agree with both rounds: 'malvaceae' (a botanical family, mostly not trees) and araceae, ranunculus, dicot are far too obscure, and the link is wrong. |
| item:r5 | Agree with both rounds: a reservoir is a (usually artificial) lake, not a synonym, and 'lagoon' is as defensible - the blind solver picked it. |
| item:rd | Agree with both rounds: 'outstanding' and 'incredible' are both synonyms of extraordinary; dropping both would leave one option. |
| item:rf | Agree with both rounds: a parcel is a package, not a container, and 'bundle' is a defensible match. |
| item:rh | Agree with both rounds: gluttony is greed for food specifically (and a religious 'deadly sin' term), narrower than greed. |
| item:rj | Agree with both rounds: an airplane is a kind of aircraft, not the same meaning. |
| item:rl | Agree with R1. At L1 (age 8) 'flesh' reads as the body, and the gloss shown ('soft tissue of the body of a vertebrate') teaches body tissue rather than food; meat is flesh eaten as food, a narrower word. Bacon and lamb (kinds of meat) also  |
| item:ro | Overturning R1's pass: a gown is a long, formal dress - a kind of dress, not a synonym (a school dress is not a gown). |
| item:ru | Agree with both rounds: a participant is not the same as a member, and 'wager' is a gambling word. |
| item:rv | Agree with both rounds: bevel/chamfer and rabbet, mortice are woodworking jargon too obscure for 8-15, and 'miter' is a kind of bevel. |
| item:rx | Overturning R1's pass: a municipality can be a city or a town, and the gloss defines town as 'smaller than a city', so town is narrower; 'hamlet' is also close. Not exactly the same meaning. |
| item:s0 | Overturning R1's pass: a tray (flat carrier with a rim) and a platter (large serving dish) are different objects, and 'container' is a broader term a tray belongs to. Doubtful. |
| item:s2 | Agree with both rounds: arithmetic is one branch of mathematics, not the same meaning. |
| item:s4 | Agree with R1: 'canadian' and 'scotland' are proper nouns lowercased in a spelling app, and 'alp' is near highland; dropping all three leaves one option. |
| item:sa | Agree with R1: a latch fastens without locking; not the same as a lock. |
| item:sb | Agree with R1: a bonfire is a large celebratory or signal fire (per its own gloss), not a campfire. |
| item:sf | Agree with both rounds: 'peculiarity' is a synonym of trait, and the gender filler 'masculinity'/'masculine' is out of place; dropping all three leaves one option. |
| item:sk | Agree with both rounds: 'sheen' is at least as close to gleam as sparkle is (gleam is a steady shine, sparkle is flashing points), and the gloss shows sparkle's 'merriment' sense. d is not clearly the one answer. |
| item:sp | Agree with both rounds: palaver, gabble and blabber are all synonyms of prattle. |
| item:sq | Agree with R1: citizenship and nationality are not the same (and sensitive for diaspora families), and the gloss shows the 'people of common origin' sense. |
| item:sw | Agree with R1: a plateau is a kind of highland (flat elevated land); highland is broader. |
| item:sz | Agree with R1: 'ravine' fits the chasm gloss ('deep, narrow opening with steep sides') as well as chasm does, and an abyss (a bottomless depth) is not exactly a chasm. Doubtful. |
| item:t0 | Agree with both rounds: stillness is chiefly absence of motion, and 'tranquility' is as defensible - the blind solver picked it. |
| item:t1 | Agree with R1: a grotto is a small cave and a cavern a large one, and the gloss shows cavern's figurative 'large dark space' sense. |
| item:t3 | Agree with R1: a petal is also part of a violet or a pink (both flowers), and with only two wrong options nothing can be dropped. |
| item:t4 | Overturning R1's pass: a giggle is a high, silly laugh and a chuckle a low, quiet one - two different laughs, not the same meaning. |
| item:t7 | Agree with R1: to a child lava is molten rock, so 'lava is a kind of rock' is confusing, and 'rocky' is the answer's own family. |
| item:ta | Agree with both rounds: 'cloudy' (and 'dreamy') are defensible synonyms of hazy; dropping them would leave one option. |
| item:td | Agree with R1: a shelf is a flat board and a rack a framework; not the same meaning. |
| item:tf | Agree with R1 that 'june' is a lowercased month name, and more: a blaze is a large fierce fire while a flame is a single tongue of fire, so the link is not exact. Dropping june does not rescue it. |
| item:tg | Agree with both rounds: a pebble is a small stone, narrower than stone. |
| item:ti | Agree with both rounds: 'irish' and 'welsh' are lowercased nationality names ('welsh' is also a slur verb); dropping both leaves one option. |
| item:tj | Overturning R1's pass: a gymnast is a sports athlete and an acrobat a performer; overlapping, not the same meaning. |
| item:tk | Agree with R1: a chime is a set of tuned bells (per its own gloss), not a bell. |
| item:tl | Agree with both rounds: 'aalii' and 'baptisia' are far too obscure, and 'cactuses' is a non-standard plural. |
| item:tm | Agree with R1: straighten (make straight) and align (put in line) overlap but are not the same meaning; 'crook' is a criminal word as filler. |
| item:tn | Agree with both rounds: decent, sufficient and reasonable are all defensible synonyms of acceptable. |
| item:tq | Agree with both rounds: a pine is a kind of conifer, not the same meaning. |
| item:tr | Agree with both rounds: aircraft is broader than airplane. |
| item:tu | Agree with both rounds: 'sucker' is a playground insult with a crude double meaning, and 'dupe' as a verb makes 'hoax' fit. |
| item:tv | Agree with both rounds: awareness is not the same as knowledge, and 'realization' (the blind pick) and 'cognition' are as defensible. |
| item:tw | Agree with R1: a suspect is not the accused (accused is a later legal step); crime vocabulary at L2. |
| item:tz | Overturning R1's pass: the maths distractors (logarithm, topology) cue the mathematical sense, where a subgroup is not a subset; 'topology' is also too obscure for L5. Doubtful. |
| item:u2 | Agree with R1: a clock is one kind of timepiece (watches are another); timepiece is broader. |
| item:u4 | Agree with both rounds: 'hypothesis' and 'axiom' are defensible synonyms of assumption; dropping them (and the plural 'hypotheses') leaves one option. |
| item:u8 | Agree with both rounds: a pomegranate is thought of as a fruit (and the plant is often a shrub); 'tree' is not the clear category. |
| item:u9 | Agree with R1. At L2 (age ~9) surplus and excess are above level, and every distractor (revenue, premium, export, investment) is adult finance vocabulary. The level problem runs through the whole item, so dropping options cannot rescue it. |
| item:ul | Overturning R1's pass: the standard English spelling is 'consommé'; showing 'consomme' in a spelling app teaches a misspelling, and the word is marginal even at L8. |
| item:um | Agree with R1: 'propriety' is too advanced for L4 (age 11), as are skepticism and objectivity among the options. |
| item:ur | Agree with both rounds: 'aborigine' is a dated/offensive term, and 'turkic', 'malay', 'borneo' are lowercased ethnic/place names. |
| item:us | Agree with R1: to a child a skyline is the outline of buildings against the sky, not the horizon. |
| item:uw | Overturning R1's pass: a canyon is a large deep gorge while a ravine is a smaller narrow one (the gloss 'narrow steep-sided valley' undersells a canyon); WordNet makes canyon a kind of ravine. Not exactly the same meaning. |
| item:uy | Agree with R1: 'governmental' is only a weak synonym of political (a political party is not governmental), and 'government' is the answer's own root. |
| item:v2 | Agree with r1 and r2: 'cosmopolitan' is overwhelmingly an adjective (and a cocktail/magazine name); the noun sense 'sophisticate' is obscure even at L8, and every distractor is a lower-cased proper noun used as filler. |
| item:v8 | Agree with both rounds: magic = witchcraft only in the sorcery sense (stage magic is not witchcraft), and 'shaman' (a real religious role) and 'witchcraft' itself (a practice some adherents hold as religion) sit beside wizard/ghost as fanta |
| item:v9 | Agree with both rounds: 'jesus' is a sacred name lower-cased as a throwaway distractor, and 'doom' is only an unpleasant fate, not the same as fate. |
| item:va | Agree with both rounds: to a child a mango is a fruit; 'mango is a kind of tree' is true only of the plant, and no option offers 'fruit'. Misleading. |
| item:vg | Agree with r1/r2: a fresco is a kind of mural (painted on wet plaster), not the same meaning, and 'graffiti' is also a wall painting. Link not exact. |
| item:vn | Link (a) and (d): aqua and cyan are two different colour names, not one word's synonyms. Aqua is a light blue-green, and WordNet files it with turquoise/aquamarine. Cyan is a separate synset, 'a primary subtractive color for light', and tha |
| item:vp | Agree with both rounds: 'tumble' mainly means fall; 'flip' matches only the gymnastics sense, and 'plop' (fall heavily) is at least as close. No single defensible answer. |
| item:vr | sorrowful = sad is sound, but tearful and somber (both rounds) are standard synonyms, and 'pitiful' also overlaps ('a sorrowful/pitiful sight'). Dropping all three would leave one wrong option, so it cannot be rescued. |
| item:vs | Agree with r1: engraving and etching are distinct printmaking techniques, and the gloss defines a print from an etched plate, which an engraving is not. |
| item:vt | Agree with r1: a watch is one kind of timepiece (clocks are timepieces too), and the gloss itself says 'a small portable timepiece'. Link not 'same meaning'. |
| item:vu | Agree with both rounds: 'weapon is a kind of instrument' rests on a generic sense no child recognises, the gloss is generic, firearm/cannon are hyponyms the other way, and the whole option set is weapons vocabulary. |
| item:vv | Agree with both rounds: at L4 'brush' is the tool; the undergrowth sense is obscure, and 'broom' is a defensible tool-sense answer. Cannot be rescued by dropping alone. |
| item:vx | Link (a): gruel is defined as 'a THIN porridge' (WordNet puts it under porridge; Oxford: thin liquid food of oatmeal), so porridge is the broader word and gruel a kind of it. That is the 'A kind of' link, not 'Same meaning'. |
| item:vz | Agree with both rounds: 'neoplasm' is a technical medical term, far too obscure at L5, and tumour vocabulary is heavy for this age. |
| item:w1 | Agree with r1: an announcement is one kind of statement (a bank statement or a maths statement is not an announcement), and the gloss 'a formal public statement' makes d narrower; 'affidavit' is another kind. Link not exact. |
| item:w8 | Agree with both rounds that confederacy and affiliation are defensible; dropping them leaves only affiliate and 'ethnic' (a filler word that should not be there), and the gloss is the business-contract sense of partnership. Too many faults  |
| item:wf | Agree with r1: juice (from fruit) and sap (fluid circulating in a plant) are related, not the same meaning; 'blood' is a grim distractor. |
| item:wl | Agree with both rounds: to a child a cucumber is a vegetable; 'kind of vine' is true only of the plant and there is no 'vegetable' option. Misleading. |
| item:wn | Agree with both rounds: roe is fish eggs, not a kind of fish. The link is false. |
| item:wo | Agree with r1: a melody is the tune alone and a song has words, and the gloss 'a short musical composition with words' contradicts 'melody'. |
| item:wp | Agree with r1: at L1 'class' is a school class and 'category' is a hard word for age 8, with school-word distractors pulling the other way. Too hard for its level; cannot be rescued. |
| item:wu | r1 passed it and r2 failed it without a reason; on a fresh look a hairpiece is usually a partial piece (toupee, extension), and a wig is one kind of hairpiece, so this is a kind-of pair, not the same meaning. Failed for the same reason as t |
| item:wv | Agree with both rounds: the gloss defines 'plant' as a factory, peppermint and thyme are also plants, and a child knows licorice as a sweet. |
| item:wz | Agree with both rounds: hiking is a kind of walking (a long walk, per the gloss), not the same meaning. |
| item:x1 | Agree with both rounds: 'corporeal' is too obscure at L5 (age 12). |
| item:x2 | Agree with both rounds: litre/liter are spelling variants of one word, not two words with the same meaning, and confusing in a spelling app. |
| item:xa | Agree with both rounds: ash (powdery residue) and soot (black carbon from smoke) are different substances. |
| item:xb | Agree with both rounds: 'occident' is archaic and obscure, 'indy' is not a word, and 'arabia' is a lower-cased proper noun used as filler. |
| item:xh | Agree with r1: a plane is one kind of aircraft (helicopters and balloons are aircraft too), and the gloss itself says so. Link not exact. |
| item:xi | Agree with both rounds: extortion is obtaining by threats, not overcharging; 'fraud' is as close; adult crime vocabulary. |
| item:xj | Agree with both rounds: notable and incredible are standard synonyms of remarkable; dropping them leaves one wrong option, so it cannot be rescued. |
| item:xl | Agree with both rounds: 'ass' is a common swear word, and a statue is a kind of sculpture (the gloss says so), so even without it the link is not exact. |
| item:xs | Agree with both rounds: 'abhorrer' is a rare, near-nonce word, not one to teach. |
| item:xu | Agree with r1: a song has words and a tune is the melody alone; related, not the same meaning. Failed for the same reason as melody/song. |
| item:xv | Agree with both rounds: a click and a clink are different sounds. |
| item:xw | Agree with both rounds: fun is enjoyment, entertainment is an activity or show; related, not the same. |
| item:xy | Side with r1 over r2. Only entrap and fend are left as wrong options, and 'fend' (MW: to keep or ward off, repel; 'fend off an attack') is as close to deter as 'repel', which cycle 1 dropped from this very item as defensible ('spikes deter  |
| item:y0 | Agree with r1: at L1 'plant' means a green plant and the factory sense is too hard for age 8; 'industry' is also used for a factory in Indian English. |
| item:y3 | Agree with both rounds: 'denial' mainly means saying something is untrue and only weakly 'rejection', and 'abuse' is a heavy distractor at L2. |
| item:y5 | Agree with both rounds: 'contradict' and 'negate' are listed synonyms of refute; dropping them leaves one wrong option. |
| item:yb | Agree with both rounds: 'arousal' has a sexual sense and 'neurosis' is a clinical term as filler; dropping both leaves one wrong option. |
| item:yc | Agree with both rounds: a moraine is a ridge of glacial debris, not a kind of stone. |
| item:yg | Agree with both rounds: 'bait' and 'entrap' are defensible synonyms of entice; dropping them leaves one wrong option, and the gloss repeats 'entice'. |
| item:yi | Agree with both rounds: granule/grain is near-synonymy, not 'kind of', and 'speck' also fits. |
| item:ym | Agree with r1: reasoning is a kind of thinking (the gloss says 'thinking that is coherent and logical'). Link not exact. |
| item:yt | Agree with both rounds: manure is one kind of fertilizer, as the gloss shows. Link not exact. |
| item:yv | Agree with both rounds: likeness also means a portrait, so representation, depiction and effigy are all defensible; dropping them leaves one option. |
| item:yz | Agree with both rounds: caulk is one kind of filler (the gloss says so), it is obscure at L4, and r2 notes it sounds like a vulgar word. |
| item:ze | Agree with r1: the gloss defines an airport as an airfield with tower, hangars and passenger facilities, a narrower kind. Link not exact. |
| item:zh | Link (a): a festival is one kind of celebration, a special, organised, often religious or cultural one (Oxford: 'a day or period of celebration'). A birthday party or a win is a celebration but not a festival, so d is narrower than c, and ' |
| item:zk | Agree with r1: 'warmer' is first the comparative of warm (and 'cooler' plays on it); warmer = heater is confusing at L2. |
| item:zn | Agree with both rounds: a child does not know a waffle as a kind of cake, and the gloss 'baked in an oven' is wrong for a waffle. |
| item:zr | Agree with r1: viewing (watching) and screening (showing a film) are not the same, and it is too hard at L2. |
| item:zt | Agree with both rounds: logic (reasoning) and rationale (the reasons for something) are not synonyms. |
| item:zu | Agree with both rounds: 'embryonic' is defensible, and ovarian/glandular are odd anatomy filler; dropping all three leaves one option. |
| item:10b | Agree with both rounds: a poll (a survey or vote) and a questionnaire (a list of questions) are related, not the same. |
| item:10e | Side with r1 over r2. In the school science a 12-13-year-old is taught (states of matter), vaporization is the whole liquid-to-gas change and evaporation is one kind of it, the other being boiling. Teaching 'vaporization means the same as e |
| item:10f | Agree with r1: a gesture is one kind of motion (the gloss: 'motion of hands or body'), and jolt/rotation are other kinds. Link not exact. |
| item:10h | Agree with both rounds: prudence and deliberation are defensible, and 'premeditation' carries a criminal connotation. |
| item:10j | Agree with both rounds: the gloss is lawn grass, which maize is not, and a child knows maize as a crop. |
| item:10l | Agree with both rounds: yeast is one kind of leaven, and 'leaven' is obscure at L4. |
| item:10m | Agree with both rounds: 'suck' is crude slang, and swallow = sip is weak (a sip is a small drink). |
| item:10p | Agree with r1: a banker is one kind of financier (the gloss says so), and 'broker' is arguable. |
| item:10z | Agree with r1: a carving is one kind of sculpture, and 'woodwork' is arguable. Link not exact. |
| item:11g | Agree with both rounds: a tiara is one kind of crown, and wreath/garland are also crowns. Not rescuable. |
| item:11p | Side with r2 over r1: the gloss itself defines a sequoia as EITHER of two trees, of which the redwood is one, so d is broader than c rather than the same meaning; 'appalachian' is a lowercase proper noun used as filler, and the gloss lowerc |
| item:11r | Agree with both rounds: a quilt is one kind of blanket/bedding (stitched, stuffed layers), so d is narrower than c, not the same meaning. |
| item:11t | Agree with both rounds: 'autoclave' is a technical lab word, too obscure for L7; an autoclave is also one kind of sterilizer, and the gloss shown describes the autoclave, not d. |
| item:11u | Agree with both rounds: a cookout is an outdoor barbecue and a picnic is a packed outdoor meal; related, not the same meaning. |
| item:11w | Agree with both rounds: a news article is not an essay, and at L1 'article' also means a/an or an item. The link is false. |
| item:11z | Side with r2 over r1: a shroud is a burial wrapping MADE of cloth, not a kind of cloth (as muslin or denim is); WordNet files it under garment. 'mesh' is itself a kind of fabric, so the item is muddled, and the death theme adds nothing. |
| item:12a | Agree with both rounds: 'pillory' is obscure for L7 with a punishment theme, it is an instrument only in the 'instrument of punishment' sense, and the gloss shows the tool-requiring-skill sense. |
| item:12c | Agree with both rounds: melting (solid to liquid by heat) and dissolving (going into solution) are different processes; the item teaches a science error. |
| item:12f | Agree with both rounds: 'drove' as a noun is obscure at L2 (age 9) and reads as the past tense of 'drive'. |
| item:12h | Agree with both rounds: forage is fodder, grass is a kind of forage (reverse of the claim), and 'browse' is equally forage. No clean answer. |
| item:12l | Agree with both rounds: a subpoena is one kind of summons (for witnesses), so d is narrower; it is also an obscure legal term at L6. |
| item:12m | Agree with both rounds: dissolving and melting are different processes (the gloss itself says melting is by heat); teaches a science error. |
| item:12s | Agree with r2's concern: 'ruth' reads as a lowercase proper name and 'agnostic' is a faith-position word beside 'liar'. Dropping both would leave only 'diction', fewer than two wrong options, so it cannot be fixed. |
| item:12v | Agree with both rounds: a drummer is one kind of percussionist, so d is broader than c. |
| item:12y | Agree with both rounds: a suspect has not been charged and a defendant has, so the link is false; a crime topic at L2 besides. |
| item:12z | Agree with both rounds that 'lingerie' (and 'bodice') are unsuitable, and more: a blouse is a kind of shirt (a woman's top), so the link is not same meaning. Cannot be rescued by dropping options. |
| item:13c | Agree with r1: a fixation is an unhealthy, obsessive preoccupation (the gloss itself defines it through preoccupation), so it is stronger, not the same; distractors use mental-health terms casually. |
| item:13d | Agree with both rounds: an agitator stirs up political unrest, which is not the same as a troublemaker; 'activist' is defensible and the item equates activists with troublemakers. The gloss is circular. |
| item:13e | Agree with both rounds: a grotto is a small (often decorated) kind of cave, so d is broader. |
| item:13g | Agree with r1: a padlock is one kind of lock, so d is broader, not the same meaning. |
| item:13l | Agree with both rounds: a grill is made of metal, it is not a kind of metal; and the blind solver reached for 'stove'. Link false. |
| item:13m | Agree with both rounds: the gloss itself defines a meadow as a kind of field; d is narrower than c. |
| item:13o | Agree with r1: a newborn is a narrower kind of baby; 'calf'/'cub' are newborn animals and 'pregnancy' is unsuitable at L2. |
| item:13p | Agree with both rounds: a vassal was a free landholder and a serf was unfree; historically false, and obscure at L4. |
| item:13t | Agree with both rounds: a tactic is a short-term move and a strategy is the overall plan; too hard for L2 besides. |
| item:13w | Side with r2 over r1: a fleece is the whole coat of a sheep, and to a child today fleece is mostly a synthetic fabric, while the gloss defines wool as fabric. Not exactly the same; too doubtful to ship. |
| item:13z | Agree with both rounds: 'petri' is not a standalone word (it is the eponym in 'Petri dish'). |
| item:14a | Agree with r1: 'garland' and 'gild' are both verbs meaning to adorn in a particular way, defensible answers. Dropping both leaves only 'brooch', fewer than two wrong options. |
| item:14b | Agree with both rounds: a mechanic repairs machines and a machinist operates machine tools; not the same. |
| item:14c | Agree with both rounds: performing matches playing only in the music/role sense, and the gloss leads with 'having fun with a game'. Not exact at L2. |
| item:14j | Agree with both rounds: to a child a kettle is for tea; it matches cauldron only in an old cooking-pot sense; 'aorta' is a stray distractor. |
| item:14k | Agree with both rounds that 'torrent' and 'geyser' are defensible. And after dropping them, 'sluice' (verb: pour or flow freely) is also defensible, leaving only 'jolt'. Cannot be fixed. |
| item:14n | Side with r1 over r2. The link is sound, but L2 is about age 9, and 'administration' is an office and government word a 9-year-old does not reliably know (cycle 1 already flagged L2 as ambitious). Unlike a word-family item, a same-meaning i |
| item:14q | Agree with both rounds: 'passerine' is a technical ornithology term, too obscure even at L8. |
| item:14u | Agree with both rounds: 'orpiment' (an arsenic mineral) is far too obscure for L7. |
| item:14v | Agree with both rounds: 'occident' is archaic and loaded at L6, and caucasus/volga/polynesian are lowercase proper and ethnic names used as filler. |
| item:14z | Agree with both rounds: 'caste' and 'ethnic' are sensitive distractors, and 'nationality' also has an ethnic-group sense, so 'ancestry' becomes arguable. Dropping all three would leave only 'adoption'. |
| item:15a | Side with r1 over r2: soap is one kind of cleanser, so d is broader, not the same meaning. |
| item:15c | Agree with both rounds: 'buffoon' is an insult word (the gloss says 'a rude or vulgar fool') and 'comedian' is a defensible synonym of clown. |
| item:15d | Side with r1 over r2: an oblong is a non-square rectangle or any elongated shape, not exactly 'rectangle'; and 'malayan'/'peruvian' are lowercase nationality words used as filler. |
| item:15e | Agree with both rounds: a glossary is a list of terms with meanings, a vocabulary is the words a person or language uses. Not synonyms. |
| item:15f | Agree with both rounds: 'chunky' and 'pasty' are both used to tease about bodies, and 'lump' is a family form. Dropping the unsafe options leaves fewer than two. |
| item:15g | Agree with both rounds: 'cabochon' is very obscure for L7, and the gloss shows 'gem' as 'art highly prized'. |
| item:15m | Agree with both rounds: 'native' is defensible (the gloss even says 'or who was born there'), and 'nebraska'/'turkic' are lowercase proper and ethnic names. Dropping all three leaves only 'peninsula'. |
| item:15n | Side with r1 over r2: 'brazilian' is a lowercase nationality word with an adult grooming sense, and 'medal' is a kind of prize, close enough to argue. Dropping both leaves only 'won'. The gloss's 'retribution for wrongdoing' is also off for |
| item:15o | Agree with both rounds: steppe and prairie are two different regional grasslands, not one meaning. |
| item:15p | Agree with both rounds: satire is a genre that often uses irony, not irony itself; the gloss is sarcasm's. |
| item:15r | Side with r2 over r1: penny = cent only in American usage. In Britain a penny is 1/100 of a pound, not a cent, and much of the audience is British or Indian. |
| item:15s | Side with r1 over r2: a catalog is one kind of list (of items, often for sale), and receipt/dictionary are equally kinds of list. Muddled at L2. |
| item:15v | Side with r1 over r2: a monarch may be a king, queen or emperor, so 'monarch' is the category and d is broader. |
| item:15z | Side with r1 over r2: the gloss itself defines an inn as a kind of hotel, and in British use an inn is a pub. Not the same meaning. |
| item:16b | Side with r1 over r2: a donation is a gift to a cause, a narrower kind of gift; the true synonym would be 'present'. |
| item:16c | Side with r1 over r2: a municipality is any self-governing city or town (broader than 'town'), and 'moscow' is a lowercase proper noun. |
| item:16e | Side with r1 over r2: robbery is theft by threat or violence (the gloss says so), a narrower kind of theft; 'fraud' is also close. |
| item:16f | Side with r1 over r2: a floret is one small flower inside a flower head (or a piece of broccoli), so part-of competes with kind-of; the gloss shows 'flower' as a plant grown for blooms. Too doubtful. |
| item:16r | Agree with both rounds: a flipper is a swim fin or an animal's limb, not a kind of shoe, and 'fin' is what a flipper is. |
| item:16s | Agree with both rounds: 'sensor' is equally a category for radar, 'wireless' arguable, and the gloss shows instrument as a skill tool where a child expects a musical instrument. |
| item:16t | Agree with both rounds: 'Christ' is a title whose application to Jesus is a Christian belief, not a word synonym; a faith's central figure in a lowercase synonym drill; 'mortal' touches doctrine. |
| item:16u | Agree with both rounds: 'investigation' and 'evaluation' are both defensible; dropping them leaves only 'diagnosis'. |
| item:16x | Side with r1 over r2: a quarry is an open pit for stone, a narrower kind of excavation than a mine; 'quarry' also means prey. |
| item:16y | Agree with both rounds: ligne/abscissa/iamb are obscure (and 'ligne' looks like a misspelling of 'line'); dropping them leaves only 'parallel'. |
| item:17b | Agree with both rounds: 'mire' and 'grime' fit muck at least as well as 'ooze' (the blind solver chose mire), and muck = ooze is itself loose (muck is also manure). |
| item:17e | Agree with both rounds: the gloss itself makes a spa a kind of (health) resort; d is narrower. |
| item:17g | Side with r1 over r2: scheduling is fixing times, a narrower part of planning, not the same meaning. |
| item:17i | Agree with both rounds: a sip is a tiny taste and a swallow a gulp; 'savor' is arguable and 'cider' can be alcoholic. |
| stem:same:5 | Side with r1 over r2: 'mad' means angry only in informal American use; in British and Indian English it means crazy, a stigmatising word. A worked example must be clean for the whole audience. |
| stem:who:0 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'baker' is 'bake' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-firs |
| stem:who:1 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'teacher' is 'teach' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-f |
| stem:who:2 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'sailor' is 'sail' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-fir |
| stem:who:3 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'painter' is 'paint' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-f |
| stem:who:4 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'farmer' is 'farm' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-fir |
| stem:who:5 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'singer' is 'sing' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-fir |
| stem:who:6 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'actor' is 'act' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-first |
| stem:who:7 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'driver' is 'drive' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-fi |
| stem:who:8 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'swimmer' is 'swim' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation-fi |
| stem:who:9 | I side with r2's fail and overrule the earlier round-3 passes. 'Who does it' is true of this pair, but 'inventor' is 'invent' plus an agent ending, so the Word-families line is also true of it. That line matters in the product: the relation |
| stem:who:n0 | I agree with both rounds. 'cook' is just as commonly a noun for the person, so cook : chef reads as two people-words that mean about the same, and a chef is also a kind of cook. The relation-first step offers 'Cook means about the same as c |
| stem:who:n4 | I side with r2's fail over r1's pass. 'tutor' is an everyday verb in children's lives ('she tutors me in maths', 'I get tutored'), and to tutor is to teach, one to one. So the offered 'Teach means about the same as tutor' is defensible, and |

## Stops removed from the map

A stop needs 16 reviewed items with enough wrong answers for its region (a practice and a check that never overlap). These fell short after the review and are off the map until more items are written and reviewed: orchard-part (12 reviewed items), workshop-who (11 reviewed items), peaks-kind (10 reviewed items). Every region keeps at least three stops.

## For the owner

- Round 2 of cycle 1 failed the Shiva card on principle (a living, worshipped god as a "Legendary" collectible beside a historical pantheon), not on its words. Its words passed. The avatar's place in the packs is your decision (10 Oct: Shiva and Zeus stay, each with a respectful card); the reviewers were told not to judge it, and this note is here so you see the concern.
- The data shown to a child is exactly what shipped: `analogy-data.js` was cut to the shipped items (same ids and words the reviewers read), with the library meaning for every word it uses, except a word whose gloss a round-3 reviewer hid as the wrong sense — that word shows no gloss anywhere (`glossHeld`).
