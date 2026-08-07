/* THE COMPANION OF LINES WORTH KEEPING — poems, sonnets, haiku and the long
   quotes, for a speller.

   Every text here is in the public domain, and every one is printed WHOLE where
   it is short enough to print whole; where it is not, the passage is the one
   people actually quote, cut at a line that closes. Nothing is paraphrased.

   The book is not a general anthology. It belongs in a spelling library because
   of the last field on every piece: `hard`, the words in that text a speller
   should be able to spell and say. A child who has learned the Tempest speech
   has met `insubstantial` and `pageant` in the only place they are unforgettable.

   Shape per piece:
     t     title
     a     author, with dates
     src   where it comes from — the play, act and scene, or the collection
     y     year, as printed
     kind  'speech' | 'sonnet' | 'poem' | 'haiku' | 'prose'
     lines the text, one array element per line as the poet set it
     note  what to listen for — prosody, argument, or the turn
     hard  [{w, say, def}] the bee-worthy words inside it

   APPEND ONLY. The book's sections index in by position. */
window.SB_POEMS = {

  /* =============== I. THE SPEECHES =============== */
  speeches: {
    title: 'Six speeches everybody half-knows',
    blurb: 'These are the passages that get quoted at half length and misquoted at full length. Here they are entire, so you can hear where the sentence actually turns — and Shakespeare’s sentences always turn.',
    pieces: [
      {
        t: 'To be, or not to be',
        th: 'night', a: 'William Shakespeare (1564–1616)', src: 'Hamlet, Act III, Scene 1', y: 'c. 1600', kind: 'speech',
        lines: [
          'To be, or not to be, that is the question:',
          'Whether ’tis nobler in the mind to suffer',
          'The slings and arrows of outrageous fortune,',
          'Or to take arms against a sea of troubles',
          'And by opposing end them. To die—to sleep,',
          'No more; and by a sleep to say we end',
          'The heart-ache and the thousand natural shocks',
          'That flesh is heir to: ’tis a consummation',
          'Devoutly to be wish’d. To die, to sleep;',
          'To sleep, perchance to dream—ay, there’s the rub:',
          'For in that sleep of death what dreams may come,',
          'When we have shuffled off this mortal coil,',
          'Must give us pause—there’s the respect',
          'That makes calamity of so long life.'
        ],
        note: 'Not a speech about suicide so much as a speech about not knowing. Every line adds a clause and refuses to finish the thought; the colons and dashes are the sound of a man arguing with himself and losing. Read it slowly and you will hear that it never once says "I".',
        hard: [
          { w: 'outrageous', say: 'owt-RAY-juhss', def: 'shockingly bad or excessive' },
          { w: 'consummation', say: 'kon-suh-MAY-shuhn', def: 'a completion or perfect finish' },
          { w: 'devoutly', say: 'dih-VOWT-lee', def: 'earnestly and sincerely, as in prayer' },
          { w: 'perchance', say: 'per-CHANSS', def: 'by chance; perhaps' },
          { w: 'calamity', say: 'kuh-LAM-ih-tee', def: 'a disaster causing great distress' }
        ]
      },
      {
        t: 'Hath not a Jew eyes?',
        th: 'city', a: 'William Shakespeare (1564–1616)', src: 'The Merchant of Venice, Act III, Scene 1', y: 'c. 1597', kind: 'speech',
        lines: [
          'I am a Jew. Hath not a Jew eyes? Hath not a Jew hands, organs,',
          'dimensions, senses, affections, passions; fed with the same food,',
          'hurt with the same weapons, subject to the same diseases, healed by',
          'the same means, warmed and cooled by the same winter and summer as',
          'a Christian is? If you prick us, do we not bleed? If you tickle us,',
          'do we not laugh? If you poison us, do we not die? And if you wrong',
          'us, shall we not revenge? If we are like you in the rest, we will',
          'resemble you in that.'
        ],
        note: 'Shylock builds the whole speech out of questions, and every question is one nobody can answer no to. That is the trap: by the time he reaches revenge you have already agreed to the eight steps before it. Notice it is prose, not verse — Shakespeare drops the metre when a character is arguing rather than feeling.',
        hard: [
          { w: 'dimensions', say: 'dih-MEN-shuhnz', def: 'measurable extents such as height and width' },
          { w: 'affections', say: 'uh-FEK-shuhnz', def: 'feelings of fondness or emotion' },
          { w: 'resemble', say: 'rih-ZEM-buhl', def: 'to look or be like something else' },
          { w: 'revenge', say: 'rih-VENJ', def: 'harm done in return for a wrong suffered' }
        ]
      },
      {
        t: 'The quality of mercy',
        th: 'stage', a: 'William Shakespeare (1564–1616)', src: 'The Merchant of Venice, Act IV, Scene 1', y: 'c. 1597', kind: 'speech',
        lines: [
          'The quality of mercy is not strain’d,',
          'It droppeth as the gentle rain from heaven',
          'Upon the place beneath. It is twice blest;',
          'It blesseth him that gives and him that takes.',
          '’Tis mightiest in the mightiest; it becomes',
          'The throned monarch better than his crown.',
          'His sceptre shows the force of temporal power,',
          'The attribute to awe and majesty,',
          'Wherein doth sit the dread and fear of kings;',
          'But mercy is above this sceptred sway,',
          'It is enthroned in the hearts of kings,',
          'It is an attribute to God himself.'
        ],
        note: 'The answer to the speech above, and the two are usually taught apart, which ruins both. "Strain’d" here means forced or squeezed out — mercy cannot be demanded, only given. Listen to how the argument climbs: rain, then a crown, then a sceptre, then God.',
        hard: [
          { w: 'sceptre', say: 'SEP-ter', def: 'an ornamented rod carried as a symbol of royal power' },
          { w: 'temporal', say: 'TEM-per-uhl', def: 'to do with worldly rather than spiritual affairs' },
          { w: 'attribute', say: 'AT-rih-byoot', def: 'a quality regarded as belonging to someone' },
          { w: 'majesty', say: 'MAJ-uh-stee', def: 'impressive dignity or grandeur, especially of a monarch' },
          { w: 'enthroned', say: 'en-THROHND', def: 'placed on a throne; given a position of honour' }
        ]
      },
      {
        t: 'Tomorrow, and tomorrow, and tomorrow',
        th: 'night', a: 'William Shakespeare (1564–1616)', src: 'Macbeth, Act V, Scene 5', y: 'c. 1606', kind: 'speech',
        lines: [
          'Tomorrow, and tomorrow, and tomorrow,',
          'Creeps in this petty pace from day to day,',
          'To the last syllable of recorded time;',
          'And all our yesterdays have lighted fools',
          'The way to dusty death. Out, out, brief candle!',
          'Life’s but a walking shadow, a poor player,',
          'That struts and frets his hour upon the stage,',
          'And then is heard no more. It is a tale',
          'Told by an idiot, full of sound and fury,',
          'Signifying nothing.'
        ],
        note: 'Three tomorrows in a row, and the line drags because of them — the rhythm is doing the exhaustion for him. Then the images shorten: candle, shadow, player, tale. He is running out of things to compare life to, and the last word is "nothing".',
        hard: [
          { w: 'syllable', say: 'SIL-uh-buhl', def: 'a unit of pronunciation with one vowel sound' },
          { w: 'signifying', say: 'SIG-nih-fye-ing', def: 'being a sign of; meaning' },
          { w: 'petty', say: 'PET-ee', def: 'small and of little importance' }
        ]
      },
      {
        t: 'All the world’s a stage',
        th: 'stage', a: 'William Shakespeare (1564–1616)', src: 'As You Like It, Act II, Scene 7', y: 'c. 1599', kind: 'speech',
        lines: [
          'All the world’s a stage,',
          'And all the men and women merely players;',
          'They have their exits and their entrances,',
          'And one man in his time plays many parts,',
          'His acts being seven ages. At first, the infant,',
          'Mewling and puking in the nurse’s arms.',
          'Then the whining schoolboy, with his satchel',
          'And shining morning face, creeping like snail',
          'Unwillingly to school.'
        ],
        note: 'The famous opening of a much longer catalogue — seven ages, and the speech walks all the way to "second childishness and mere oblivion". It is funny before it is sad, which is why the sadness lands.',
        hard: [
          { w: 'satchel', say: 'SATCH-uhl', def: 'a bag with a shoulder strap, used for carrying books' },
          { w: 'oblivion', say: 'uh-BLIV-ee-uhn', def: 'the state of being forgotten' },
          { w: 'entrances', say: 'EN-truhn-sez', def: 'acts of coming onto a stage' }
        ]
      },
      {
        t: 'Our revels now are ended',
        th: 'stage', a: 'William Shakespeare (1564–1616)', src: 'The Tempest, Act IV, Scene 1', y: 'c. 1611', kind: 'speech',
        lines: [
          'Our revels now are ended. These our actors,',
          'As I foretold you, were all spirits and',
          'Are melted into air, into thin air:',
          'And, like the baseless fabric of this vision,',
          'The cloud-capp’d towers, the gorgeous palaces,',
          'The solemn temples, the great globe itself,',
          'Yea, all which it inherit, shall dissolve',
          'And, like this insubstantial pageant faded,',
          'Leave not a rack behind. We are such stuff',
          'As dreams are made on, and our little life',
          'Is rounded with a sleep.'
        ],
        note: 'Very likely the last thing Shakespeare wrote about his own theatre — "the great globe itself" is both the world and the playhouse he worked in. "Into thin air" begins here. So does "such stuff as dreams are made on", which almost everyone quotes as "made of".',
        hard: [
          { w: 'insubstantial', say: 'in-suhb-STAN-shuhl', def: 'lacking solidity or reality' },
          { w: 'pageant', say: 'PAJ-uhnt', def: 'an elaborate public spectacle or procession' },
          { w: 'gorgeous', say: 'GOR-juhss', def: 'beautiful; richly coloured' },
          { w: 'solemn', say: 'SOL-uhm', def: 'formal and dignified; serious' },
          { w: 'dissolve', say: 'dih-ZOLV', def: 'to fade away or break up' }
        ]
      },
      {
        t: 'Now is the winter of our discontent',
        th: 'war', a: 'William Shakespeare (1564–1616)', src: 'Richard III, Act I, Scene 1', y: 'c. 1593', kind: 'speech',
        lines: [
          'Now is the winter of our discontent',
          'Made glorious summer by this sun of York;',
          'And all the clouds that lour’d upon our house',
          'In the deep bosom of the ocean buried.',
          'Now are our brows bound with victorious wreaths;',
          'Our bruised arms hung up for monuments;',
          'Our stern alarums changed to merry meetings,',
          'Our dreadful marches to delightful measures.',
          'Grim-visaged war hath smooth’d his wrinkled front;',
          'And now, instead of mounting barbed steeds',
          'To fright the souls of fearful adversaries,',
          'He capers nimbly in a lady’s chamber',
          'To the lascivious pleasing of a lute.'
        ],
        note: 'Almost everyone quotes the first line as though it means "times are bad". It means the opposite: the winter is OVER — you have to reach "made glorious summer" to get the sentence. "This sun of York" is a pun on son, and the man saying it is telling you, in the sunniest weather of his life, that he intends to ruin everything.',
        hard: [
          { w: 'discontent', say: 'diss-kuhn-TENT', def: 'dissatisfaction with one’s circumstances' },
          { w: 'victorious', say: 'vik-TOR-ee-uhss', def: 'having won a victory' },
          { w: 'monuments', say: 'MON-yoo-muhnts', def: 'structures raised to keep a memory alive' },
          { w: 'adversaries', say: 'AD-ver-sair-eez', def: 'opponents in a contest or conflict' },
          { w: 'nimbly', say: 'NIM-blee', def: 'quickly and lightly on one’s feet' }
        ]
      },
      {
        t: 'Once more unto the breach',
        th: 'war', a: 'William Shakespeare (1564–1616)', src: 'Henry V, Act III, Scene 1', y: 'c. 1599', kind: 'speech',
        lines: [
          'Once more unto the breach, dear friends, once more;',
          'Or close the wall up with our English dead.',
          'In peace there’s nothing so becomes a man',
          'As modest stillness and humility:',
          'But when the blast of war blows in our ears,',
          'Then imitate the action of the tiger;',
          'Stiffen the sinews, summon up the blood,',
          'Disguise fair nature with hard-favour’d rage;',
          'Then lend the eye a terrible aspect;',
          'Let it pry through the portage of the head',
          'Like the brass cannon; let the brow o’erwhelm it',
          'As fearfully as doth a galled rock',
          'O’erhang and jutty his confounded base,',
          'Swill’d with the wild and wasteful ocean.'
        ],
        note: 'A king talking soldiers into a hole in a wall. Notice that he spends two lines praising calm before he asks for none of it — the speech admits that what it wants is unnatural, then tells them exactly which muscles to use anyway.',
        hard: [
          { w: 'breach', say: 'BREECH', def: 'a gap broken through a wall or defence' },
          { w: 'humility', say: 'hyoo-MIL-ih-tee', def: 'a modest view of one’s own importance' },
          { w: 'sinews', say: 'SIN-yooz', def: 'tendons; the tough cords that join muscle to bone' },
          { w: 'aspect', say: 'ASS-pekt', def: 'the look or appearance of something' },
          { w: 'confounded', say: 'kuhn-FOWN-did', def: 'thrown into confusion; overthrown' }
        ]
      },
      {
        t: 'We few, we happy few',
        th: 'war', a: 'William Shakespeare (1564–1616)', src: 'Henry V, Act IV, Scene 3', y: 'c. 1599', kind: 'speech',
        lines: [
          'This day is call’d the feast of Crispian:',
          'He that outlives this day, and comes safe home,',
          'Will stand a tip-toe when this day is named,',
          'And rouse him at the name of Crispian.',
          'He that shall live this day, and see old age,',
          'Will yearly on the vigil feast his neighbours,',
          'And say "To-morrow is Saint Crispian":',
          'Then will he strip his sleeve and show his scars,',
          'And say "These wounds I had on Crispin’s day."',
          'Old men forget: yet all shall be forgot,',
          'But he’ll remember with advantages',
          'What feats he did that day. We few, we happy few,',
          'We band of brothers; for he to-day that sheds',
          'His blood with me shall be my brother.',
          'And gentlemen in England now a-bed',
          'Shall think themselves accursed they were not here.'
        ],
        note: 'The trick of it is the tense. He is outnumbered five to one and he talks about the battle entirely in the future perfect — what you will have done, what you will tell people, how you will misremember it. By the end the men are not being asked to fight; they are being asked not to miss out.',
        hard: [
          { w: 'vigil', say: 'VIJ-il', def: 'a period of staying awake, often the night before a feast' },
          { w: 'neighbours', say: 'NAY-berz', def: 'people who live nearby (British spelling)' },
          { w: 'accursed', say: 'uh-KUR-sid', def: 'under a curse; detestable' },
          { w: 'feats', say: 'FEETS', def: 'acts of notable skill or courage' }
        ]
      },
      {
        t: 'Friends, Romans, countrymen',
        th: 'stage', a: 'William Shakespeare (1564–1616)', src: 'Julius Caesar, Act III, Scene 2', y: 'c. 1599', kind: 'speech',
        lines: [
          'Friends, Romans, countrymen, lend me your ears;',
          'I come to bury Caesar, not to praise him.',
          'The evil that men do lives after them;',
          'The good is oft interred with their bones;',
          'So let it be with Caesar. The noble Brutus',
          'Hath told you Caesar was ambitious:',
          'If it were so, it was a grievous fault,',
          'And grievously hath Caesar answer’d it.',
          'Here, under leave of Brutus and the rest—',
          'For Brutus is an honourable man;',
          'So are they all, all honourable men—',
          'Come I to speak in Caesar’s funeral.',
          'He was my friend, faithful and just to me:',
          'But Brutus says he was ambitious;',
          'And Brutus is an honourable man.'
        ],
        note: 'The most famous piece of sarcasm in English. Antony has been forbidden to blame anyone, so he obeys — and repeats "honourable" until the word turns to acid in the crowd’s mouth. He never once contradicts Brutus. He just says his name too often.',
        hard: [
          { w: 'interred', say: 'in-TURD', def: 'buried in the earth or a tomb' },
          { w: 'ambitious', say: 'am-BISH-uhss', def: 'having a strong desire for success or power' },
          { w: 'grievous', say: 'GREE-vuhss', def: 'causing grief or great harm; very serious' },
          { w: 'honourable', say: 'ON-er-uh-buhl', def: 'deserving respect (British spelling)' }
        ]
      },
      {
        t: 'Is this a dagger which I see before me',
        th: 'night', a: 'William Shakespeare (1564–1616)', src: 'Macbeth, Act II, Scene 1', y: 'c. 1606', kind: 'speech',
        lines: [
          'Is this a dagger which I see before me,',
          'The handle toward my hand? Come, let me clutch thee.',
          'I have thee not, and yet I see thee still.',
          'Art thou not, fatal vision, sensible',
          'To feeling as to sight? or art thou but',
          'A dagger of the mind, a false creation,',
          'Proceeding from the heat-oppressed brain?',
          'I see thee yet, in form as palpable',
          'As this which now I draw.',
          'Thou marshall’st me the way that I was going;',
          'And such an instrument I was to use.',
          'Mine eyes are made the fools o’ the other senses,',
          'Or else worth all the rest: I see thee still.'
        ],
        note: 'A man interrogating his own hallucination like a scientist — is it solid? can I touch it? — and losing the argument. He asks whether the dagger is real four times, and the fourth time he has stopped wanting the answer.',
        hard: [
          { w: 'dagger', say: 'DAG-er', def: 'a short pointed knife used as a weapon' },
          { w: 'sensible', say: 'SEN-sih-buhl', def: 'able to be perceived by the senses' },
          { w: 'palpable', say: 'PAL-puh-buhl', def: 'able to be touched or felt; unmistakable' },
          { w: 'marshall’st', say: 'MAR-shuhlst', def: 'from marshal — to lead or guide in order' },
          { w: 'instrument', say: 'IN-struh-muhnt', def: 'a tool used for a particular purpose' }
        ]
      },
      {
        t: 'What a piece of work is a man',
        th: 'library', a: 'William Shakespeare (1564–1616)', src: 'Hamlet, Act II, Scene 2', y: 'c. 1600', kind: 'speech',
        lines: [
          'What a piece of work is a man! How noble in reason, how',
          'infinite in faculty! In form and moving how express and',
          'admirable! In action how like an angel, in apprehension',
          'how like a god! The beauty of the world! The paragon of',
          'animals! And yet, to me, what is this quintessence of dust?',
          'Man delights not me — no, nor woman neither, though by',
          'your smiling you seem to say so.'
        ],
        note: 'Set as prose, because it is prose: Hamlet drops into everyday speech to say the largest thing in the play. Five exclamation marks of praise and then one flat question that cancels them all. "Quintessence" meant the fifth element, the pure stuff above the other four — and he attaches it to dust.',
        hard: [
          { w: 'faculty', say: 'FAK-uhl-tee', def: 'a natural power of the mind or body' },
          { w: 'admirable', say: 'AD-mer-uh-buhl', def: 'deserving respect and approval' },
          { w: 'apprehension', say: 'ap-rih-HEN-shuhn', def: 'understanding; the act of grasping with the mind' },
          { w: 'paragon', say: 'PAIR-uh-gon', def: 'a perfect example of a quality' },
          { w: 'quintessence', say: 'kwin-TESS-uhnss', def: 'the purest, most essential form of something' }
        ]
      },
      {
        t: 'The barge she sat in',
        th: 'water', a: 'William Shakespeare (1564–1616)', src: 'Antony and Cleopatra, Act II, Scene 2', y: 'c. 1607', kind: 'speech',
        lines: [
          'The barge she sat in, like a burnish’d throne,',
          'Burn’d on the water: the poop was beaten gold;',
          'Purple the sails, and so perfumed that',
          'The winds were love-sick with them; the oars were silver,',
          'Which to the tune of flutes kept stroke, and made',
          'The water which they beat to follow faster,',
          'As amorous of their strokes. For her own person,',
          'It beggar’d all description: she did lie',
          'In her pavilion—cloth-of-gold of tissue—',
          'O’er-picturing that Venus where we see',
          'The fancy outwork nature: on each side her',
          'Stood pretty dimpled boys, like smiling Cupids,',
          'With divers-colour’d fans, whose wind did seem',
          'To glow the delicate cheeks which they did cool.'
        ],
        note: 'Enobarbus is a plain-spoken soldier, and this is the one time in the play he cannot be plain. Watch what happens to the verbs: the wind is love-sick, the water chases the oars, the fans warm the cheeks they are cooling. Everything in the scene has fallen for her, including the grammar.',
        hard: [
          { w: 'burnished', say: 'BUR-nisht', def: 'polished until it shines' },
          { w: 'amorous', say: 'AM-er-uhss', def: 'showing or feeling love' },
          { w: 'pavilion', say: 'puh-VIL-yuhn', def: 'a large decorated tent' },
          { w: 'divers', say: 'DYE-verz', def: 'an old word for various or several' }
        ]
      },
      {
        t: 'If we shadows have offended',
        th: 'forest', a: 'William Shakespeare (1564–1616)', src: 'A Midsummer Night’s Dream, Act V, Scene 1', y: 'c. 1595', kind: 'speech',
        lines: [
          'If we shadows have offended,',
          'Think but this, and all is mended,',
          'That you have but slumber’d here',
          'While these visions did appear.',
          'And this weak and idle theme,',
          'No more yielding but a dream,',
          'Gentles, do not reprehend:',
          'If you pardon, we will mend.',
          'And, as I am an honest Puck,',
          'If we have unearned luck',
          'Now to ’scape the serpent’s tongue,',
          'We will make amends ere long;',
          'Else the Puck a liar call:',
          'So, good night unto you all.',
          'Give me your hands, if we be friends,',
          'And Robin shall restore amends.'
        ],
        note: 'The play apologises to you for existing. It is written in seven-syllable couplets — one beat shorter than the grand line — which is why it trots. "Give me your hands" asks for applause and for forgiveness in the same four words, and the actor cannot tell which he is getting.',
        hard: [
          { w: 'reprehend', say: 'rep-rih-HEND', def: 'to reprove or find fault with' },
          { w: 'amends', say: 'uh-MENDZ', def: 'something done to make up for a wrong' },
          { w: 'slumbered', say: 'SLUM-berd', def: 'slept' },
          { w: 'serpent', say: 'SUR-puhnt', def: 'a snake, especially a large one' }
        ]
      },
      {
        t: 'Now my charms are all o’erthrown',
        th: 'sea', a: 'William Shakespeare (1564–1616)', src: 'The Tempest, Epilogue', y: 'c. 1611', kind: 'speech',
        lines: [
          'Now my charms are all o’erthrown,',
          'And what strength I have’s mine own,',
          'Which is most faint: now, ’tis true,',
          'I must be here confined by you,',
          'Or sent to Naples. Let me not,',
          'Since I have my dukedom got,',
          'And pardon’d the deceiver, dwell',
          'In this bare island by your spell;',
          'But release me from my bands',
          'With the help of your good hands.',
          'Gentle breath of yours my sails',
          'Must fill, or else my project fails,',
          'Which was to please. Now I want',
          'Spirits to enforce, art to enchant;',
          'And my ending is despair,',
          'Unless I be relieved by prayer,',
          'Which pierces so, that it assaults',
          'Mercy itself, and frees all faults.',
          'As you from crimes would pardon’d be,',
          'Let your indulgence set me free.'
        ],
        note: 'Prospero was the play’s magician, and this is thought to be Shakespeare’s own farewell to the stage — his last solo-written play. The magic is gone by the time he speaks; all that is left is an old man asking an audience, quite plainly, to clap.',
        hard: [
          { w: 'confined', say: 'kuhn-FINED', def: 'kept within limits; shut in' },
          { w: 'deceiver', say: 'dih-SEE-ver', def: 'a person who tricks or misleads' },
          { w: 'enchant', say: 'en-CHANT', def: 'to put under a magic spell' },
          { w: 'indulgence', say: 'in-DUL-junss', def: 'a kind, lenient act of forgiveness' }
        ]
      },
      {
        t: 'Out, damned spot!',
        th: 'night', a: 'William Shakespeare (1564–1616)', src: 'Macbeth, Act V, Scene 1', y: 'c. 1606', kind: 'speech',
        lines: [
          'Out, damned spot! out, I say!—One: two: why,',
          'then, ’tis time to do’t.—Hell is murky!—Fie, my',
          'lord, fie! a soldier, and afeard? What need we',
          'fear who knows it, when none can call our power',
          'to accompt?—Yet who would have thought the old man',
          'to have had so much blood in him.',
          '',
          'The Thane of Fife had a wife: where is she now?—',
          'What, will these hands ne’er be clean?—No more o’',
          'that, my lord, no more o’ that: you mar all with',
          'this starting.',
          '',
          'Here’s the smell of the blood still: all the',
          'perfumes of Arabia will not sweeten this little',
          'hand. Oh, oh, oh!',
          '',
          'Wash your hands, put on your nightgown; look not so',
          'pale.—I tell you yet again, Banquo’s buried; he',
          'cannot come out on’s grave.',
          '',
          'To bed, to bed! there’s knocking at the gate: come,',
          'come, come, come, give me your hand. What’s',
          'done cannot be undone.—To bed, to bed, to bed!'
        ],
        note: 'Lady Macbeth says all of this asleep, in a dream, scrubbing hands that have been clean for weeks. Notice how the sentences stop finishing themselves — a mind confessing to no one, in a language only guilt speaks fluently.',
        hard: [
          { w: 'murky', say: 'MUR-kee', def: 'dark and gloomy; hard to see through' },
          { w: 'accompt', say: 'uh-KOWNT', def: 'an old spelling of account — a reckoning' },
          { w: 'perfumes', say: 'PER-fyoomz', def: 'sweet-smelling substances' },
          { w: 'starting', say: 'STAR-ting', def: 'sudden nervous movements; flinching' }
        ]
      },
      {
        t: 'Blow, winds, and crack your cheeks!',
        th: 'water', a: 'William Shakespeare (1564–1616)', src: 'King Lear, Act III, Scene 2', y: 'c. 1606', kind: 'speech',
        lines: [
          'Blow, winds, and crack your cheeks! rage! blow!',
          'You cataracts and hurricanoes, spout',
          'Till you have drench’d our steeples, drown’d the cocks!',
          'You sulphurous and thought-executing fires,',
          'Vaunt-couriers to oak-cleaving thunderbolts,',
          'Singe my white head! And thou, all-shaking thunder,',
          'Strike flat the thick rotundity o’ the world!',
          'Crack nature’s moulds, all germens spill at once,',
          'That make ingrateful man!'
        ],
        note: 'An old king, betrayed by both daughters he trusted, stands on a heath and orders the sky to end the world — and the sky, being weather, obliges without noticing him at all. That gap between what he demands and what actually happens is the whole tragedy in nine lines.',
        hard: [
          { w: 'cataracts', say: 'KAT-uh-rakts', def: 'large, powerful waterfalls' },
          { w: 'sulphurous', say: 'SUL-fer-uhss', def: 'like sulphur; smelling of fire and brimstone' },
          { w: 'rotundity', say: 'roh-TUN-dih-tee', def: 'roundness; here, the whole round world' },
          { w: 'ingrateful', say: 'in-GRAYT-fuhl', def: 'an old form of ungrateful' }
        ]
      },
      {
        t: 'O for a Muse of fire',
        th: 'fire', a: 'William Shakespeare (1564–1616)', src: 'Henry V, Prologue', y: 'c. 1599', kind: 'speech',
        lines: [
          'O for a Muse of fire, that would ascend',
          'The brightest heaven of invention,',
          'A kingdom for a stage, princes to act',
          'And monarchs to behold the swelling scene!',
          'Then should the warlike Harry, like himself,',
          'Assume the port of Mars; and at his heels,',
          'Leash’d in like hounds, should famine, sword and fire',
          'Crouch for employment. But pardon, gentles all,',
          'The flat unraised spirits that hath dared',
          'On this unworthy scaffold to bring forth',
          'So great an object: can this cockpit hold',
          'The vasty fields of France? or may we cram',
          'Within this wooden O the very casques',
          'That did affright the air at Agincourt?'
        ],
        note: 'A whole war, kings, horses, France — and Shakespeare had none of it: a bare wooden circle and a few dozen actors. So the Chorus does the only honest thing: it apologises for the stage in advance, and asks the audience to imagine the rest. Theatre’s oldest trick, said out loud.',
        hard: [
          { w: 'ascend', say: 'uh-SEND', def: 'to rise or climb upward' },
          { w: 'monarchs', say: 'MON-arks', def: 'kings or queens; rulers' },
          { w: 'scaffold', say: 'SKAF-uhld', def: 'a raised wooden platform, here meaning the stage' },
          { w: 'vasty', say: 'VAST-ee', def: 'an old poetic form of vast' },
          { w: 'affright', say: 'uh-FRITE', def: 'an old word meaning to frighten' }
        ]
      },
      {
        t: 'Cowards die many times',
        th: 'city', a: 'William Shakespeare (1564–1616)', src: 'Julius Caesar, Act II, Scene 2', y: 'c. 1599', kind: 'speech',
        lines: [
          'Cowards die many times before their deaths;',
          'The valiant never taste of death but once.',
          'Of all the wonders that I yet have heard,',
          'It seems to me most strange that men should fear;',
          'Seeing that death, a necessary end,',
          'Will come when it will come.'
        ],
        note: 'Caesar says this the morning he is warned not to leave his house, and goes anyway. Six lines, and every one of them turns out to be exactly wrong about his own death — which is either the definition of tragic irony or the definition of stubbornness, and Shakespeare seems to think it is both.',
        hard: [
          { w: 'valiant', say: 'VAL-yuhnt', def: 'possessing or showing courage' },
          { w: 'necessary', say: 'NESS-uh-sair-ee', def: 'unavoidable; required' }
        ]
      },
      {
        t: 'But soft, what light through yonder window breaks',
        th: 'night', a: 'William Shakespeare (1564–1616)', src: 'Romeo and Juliet, Act II, Scene 2', y: 'c. 1595', kind: 'speech',
        lines: [
          'But soft, what light through yonder window breaks?',
          'It is the east, and Juliet is the sun.',
          'Arise, fair sun, and kill the envious moon,',
          'Who is already sick and pale with grief,',
          'That thou her maid art far more fair than she.',
          'Be not her maid, since she is envious;',
          'Her vestal livery is but sick and green,',
          'And none but fools do wear it; cast it off.',
          'It is my lady, O, it is my love!',
          'O, that she knew she were!'
        ],
        note: 'Romeo is hiding in a garden talking to a lit window, and the whole speech runs on one idea: Juliet outshines the moon so completely that the moon gets jealous and sick. It is astronomy used as a compliment, and it is the most quoted opening line in the language.',
        hard: [
          { w: 'yonder', say: 'YON-der', def: 'over there; at a distance' },
          { w: 'envious', say: 'EN-vee-uhss', def: 'feeling jealous of someone else' },
          { w: 'vestal', say: 'VESS-tuhl', def: 'chaste, pure — like a vestal virgin' },
          { w: 'livery', say: 'LIV-er-ee', def: 'a distinctive uniform or dress' }
        ]
      },
      {
        t: 'O Romeo, Romeo, wherefore art thou Romeo?',
        th: 'flower', a: 'William Shakespeare (1564–1616)', src: 'Romeo and Juliet, Act II, Scene 2', y: 'c. 1595', kind: 'speech',
        lines: [
          'O Romeo, Romeo, wherefore art thou Romeo?',
          'Deny thy father and refuse thy name;',
          'Or, if thou wilt not, be but sworn my love,',
          'And I’ll no longer be a Capulet.',
          '’Tis but thy name that is my enemy;',
          'Thou art thyself, though not a Montague.',
          'What’s Montague? it is nor hand, nor foot,',
          'Nor arm, nor face, nor any other part',
          'Belonging to a man. O, be some other name!',
          'What’s in a name? that which we call a rose',
          'By any other name would smell as sweet;',
          'So Romeo would, were he not Romeo call’d,',
          'Retain that dear perfection which he owes',
          'Without that title. Romeo, doff thy name,',
          'And for that name, which is no part of thee,',
          'Take all myself.'
        ],
        note: '"Wherefore" does not mean "where" — it means "why", and the misreading is nearly universal. Juliet is not asking where Romeo is; she is asking why he had to be born a Montague, the one family name standing between her and the person she has already chosen.',
        hard: [
          { w: 'wherefore', say: 'WAIR-for', def: 'an old word meaning "why", not "where"' },
          { w: 'perfection', say: 'per-FEK-shuhn', def: 'the state of being flawless or complete' },
          { w: 'retain', say: 'rih-TAYN', def: 'to continue to have or hold' }
        ]
      },
      {
        t: 'This was the noblest Roman of them all',
        th: 'city', a: 'William Shakespeare (1564–1616)', src: 'Julius Caesar, Act V, Scene 5', y: 'c. 1599', kind: 'speech',
        lines: [
          'This was the noblest Roman of them all:',
          'All the conspirators, save only he,',
          'Did that they did in envy of great Caesar;',
          'He only, in a general honest thought',
          'And common good to all, made one of them.',
          'His life was gentle, and the elements',
          'So mix’d in him that Nature might stand up',
          'And say to all the world, "This was a man!"'
        ],
        note: 'Antony spent the whole play turning the city against Brutus, and here, standing over Brutus’s body, he says the one thing he never said to his face: that of all the men who killed Caesar, Brutus alone believed he was doing right. It is generosity offered a beat too late to matter to the man it is about.',
        hard: [
          { w: 'conspirators', say: 'kuhn-SPEER-uh-terz', def: 'people who plan something secretly and unlawfully together' },
          { w: 'elements', say: 'EL-uh-muhnts', def: 'the basic parts making up a whole; here, one’s nature' }
        ]
      },
      {
        t: 'Give me liberty, or give me death!',
        th: 'fire', a: 'Patrick Henry (1736–1799)', src: 'Virginia Convention, Richmond', y: '23 March 1775', kind: 'speech',
        lines: [
          'Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty, or give me death!'
        ],
        note: 'The last line of a much longer speech, and Henry built the whole address to arrive at exactly this sentence — every argument before it is a road leading here. Delivered to a convention still hoping to avoid a war with Britain; within a month, the war had started anyway.',
        hard: [
          { w: 'purchased', say: 'PUR-chuhst', def: 'obtained by paying a price' },
          { w: 'liberty', say: 'LIB-er-tee', def: 'the state of being free' }
        ]
      },
      {
        t: 'With malice toward none',
        th: 'dawn', a: 'Abraham Lincoln (1809–1865)', src: 'Second Inaugural Address, Washington', y: '4 March 1865', kind: 'speech',
        lines: [
          'With malice toward none, with charity for all, with firmness in the right as God gives us to see the right, let us strive on to finish the work we are in, to bind up the nation’s wounds, to care for him who shall have borne the battle and for his widow and his orphan — to do all which may achieve and cherish a just and lasting peace among ourselves, and with all nations.'
        ],
        note: 'Delivered six weeks before the Civil War ended and six weeks before Lincoln was killed — a president who had every reason to speak of victory instead spent his second inaugural on tenderness toward the side he had just beaten. It is one sentence, and it never once uses the word "we won".',
        hard: [
          { w: 'malice', say: 'MAL-iss', def: 'the desire to harm someone; ill will' },
          { w: 'charity', say: 'CHAIR-ih-tee', def: 'generosity and kindness toward others' },
          { w: 'cherish', say: 'CHAIR-ish', def: 'to protect and care for lovingly' }
        ]
      },
      {
        t: 'Ain’t I a Woman?',
        th: 'road', a: 'Sojourner Truth (c. 1797–1883)', src: 'Women’s Convention, Akron, Ohio', y: '1851', kind: 'speech',
        lines: [
          'That man over there says that women need to be helped into carriages, and lifted over ditches, and to have the best place everywhere. Nobody ever helps me into carriages, or over mud-puddles, or gives me any best place! And ain’t I a woman?',
          'Look at me! Look at my arm! I have ploughed and planted, and gathered into barns, and no man could head me! And ain’t I a woman?',
          'I could work as much and eat as much as a man — when I could get it — and bear the lash as well! And ain’t I a woman? I have borne thirteen children, and seen most all sold off to slavery, and when I cried out with my mother’s grief, none but Jesus heard me! And ain’t I a woman?'
        ],
        note: 'Truth was born enslaved and could not read or write; the speech survives only because a woman in the audience wrote down what she remembered years later, in Truth’s own spoken dialect, which is why it reads so differently from the polished speeches around it — it sounds like someone actually talking.',
        hard: [
          { w: 'convention', say: 'kuhn-VEN-shuhn', def: 'a large formal meeting for a shared purpose' },
          { w: 'ploughed', say: 'PLOWD', def: 'turned over earth with a plough to prepare it for planting (British spelling)' }
        ]
      },
      {
        t: 'The Man in the Arena',
        th: 'mountain', a: 'Theodore Roosevelt (1858–1919)', src: 'Citizenship in a Republic, Paris', y: '23 April 1910', kind: 'speech',
        lines: [
          'It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood; who strives valiantly; who errs, who comes short again and again, because there is no effort without error and shortcoming; but who does actually strive to do the deeds; who knows great enthusiasms, the great devotions; who spends himself in a worthy cause; who at the best knows in the end the triumph of high achievement, and who at the worst, if he fails, at least fails while daring greatly, so that his place shall never be with those cold and timid souls who neither know victory nor defeat.'
        ],
        note: 'One enormous sentence, built the way a boxing match is built: clause after clause landing blows, "who strives... who errs... who fails... who dares", until the only people left standing outside the ring are the ones who never got in it. The whole passage is an argument for trying and losing over never trying at all.',
        hard: [
          { w: 'marred', say: 'MARD', def: 'damaged or spoiled in appearance' },
          { w: 'valiantly', say: 'VAL-yuhnt-lee', def: 'with courage and determination' },
          { w: 'devotions', say: 'dih-VOH-shuhnz', def: 'strong feelings of loyalty or love' },
          { w: 'achievement', say: 'uh-CHEEV-muhnt', def: 'a thing accomplished successfully' },
          { w: 'timid', say: 'TIM-id', def: 'showing a lack of courage or confidence' }
        ]
      },
      {
        t: 'The only thing we have to fear',
        th: 'city', a: 'Franklin D. Roosevelt (1882–1945)', src: 'First Inaugural Address, Washington', y: '4 March 1933', kind: 'speech',
        lines: [
          'So, first of all, let me assert my firm belief that the only thing we have to fear is fear itself — nameless, unreasoning, unjustified terror which paralyzes needed efforts to convert retreat into advance. In every dark hour of our national life, a leadership of frankness and vigor has met with that understanding and support of the people themselves which is essential to victory.'
        ],
        note: 'Delivered at the bottom of the Great Depression, with a quarter of the country out of work and banks failing across the nation. The famous line is really a diagnosis: Roosevelt is saying the economic damage is real, but the fear making people hoard money and stop spending is its own separate problem — and the one a president can actually speak to directly.',
        hard: [
          { w: 'unreasoning', say: 'un-REE-zuh-ning', def: 'not based on or guided by reason' },
          { w: 'paralyzes', say: 'PAIR-uh-lyz-iz', def: 'makes unable to move or act' },
          { w: 'vigor', say: 'VIG-er', def: 'physical or mental strength and energy' },
          { w: 'essential', say: 'ih-SEN-shuhl', def: 'absolutely necessary' }
        ]
      },
      {
        t: 'I will fight no more forever',
        th: 'snow', a: 'Chief Joseph (c. 1840–1904)', src: 'Surrender near the Bear Paw Mountains, Montana', y: '5 October 1877', kind: 'speech',
        lines: [
          'Tell General Howard I know his heart. What he told me before, I have it in my heart. I am tired of fighting. Our chiefs are killed. Looking Glass is dead. Toohoolhoolzote is dead. The old men are all dead. It is the young men who say yes or no. He who led the young men is dead. It is cold, and we have no blankets. The little children are freezing to death. My people, some of them, have run away to the hills, and have no blankets, no food. No one knows where they are — perhaps freezing to death. I want to have time to look for my children, and see how many of them I can find. Maybe I shall find them among the dead. Hear me, my chiefs. I am tired; my heart is sick and sad. From where the sun now stands, I will fight no more forever.'
        ],
        note: 'The Nez Perce had marched over 1,000 miles trying to reach safety in Canada and were stopped forty miles short of the border. This was translated and written down by an army officer at the surrender, which means the exact words are uncertain — but the last sentence has been remembered exactly, in every retelling, for a century and a half.',
        hard: [
          { w: 'chiefs', say: 'CHEEFS', def: 'leaders of a tribe or clan' },
          { w: 'forever', say: 'for-EV-er', def: 'for all future time; endlessly' }
        ]
      }
    ]
  },

  /* =============== II. THE SONNET =============== */
  sonnets: {
    title: 'Fourteen lines, and a turn',
    blurb: 'A sonnet is an argument with a hinge in it. Eight lines set a problem, then something shifts — usually at line nine, in the English form at the final couplet — and the poem answers itself. Find the hinge and you have read the poem.',
    pieces: [
      {
        t: 'Sonnet 18: Shall I compare thee to a summer’s day?',
        th: 'flower', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'Shall I compare thee to a summer’s day?',
          'Thou art more lovely and more temperate:',
          'Rough winds do shake the darling buds of May,',
          'And summer’s lease hath all too short a date;',
          'Sometime too hot the eye of heaven shines,',
          'And often is his gold complexion dimm’d;',
          'And every fair from fair sometime declines,',
          'By chance or nature’s changing course untrimm’d;',
          'But thy eternal summer shall not fade,',
          'Nor lose possession of that fair thou ow’st;',
          'Nor shall death brag thou wander’st in his shade,',
          'When in eternal lines to time thou grow’st:',
          '   So long as men can breathe or eyes can see,',
          '   So long lives this, and this gives life to thee.'
        ],
        note: 'The hinge is "But" at line nine. Everything before it is a list of ways summer fails; everything after is the boast that the poem will not. And it was right — you are reading it four hundred years later.',
        hard: [
          { w: 'temperate', say: 'TEM-per-uht', def: 'mild; neither very hot nor very cold' },
          { w: 'complexion', say: 'kuhm-PLEK-shuhn', def: 'the natural colour and appearance of the skin' },
          { w: 'eternal', say: 'ih-TER-nuhl', def: 'lasting forever' }
        ]
      },
      {
        t: 'Sonnet 116: Let me not to the marriage of true minds',
        th: 'sea', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'Let me not to the marriage of true minds',
          'Admit impediments. Love is not love',
          'Which alters when it alteration finds,',
          'Or bends with the remover to remove:',
          'O no! it is an ever-fixed mark',
          'That looks on tempests and is never shaken;',
          'It is the star to every wandering bark,',
          'Whose worth’s unknown, although his height be taken.',
          'Love’s not Time’s fool, though rosy lips and cheeks',
          'Within his bending sickle’s compass come;',
          'Love alters not with his brief hours and weeks,',
          'But bears it out even to the edge of doom.',
          '   If this be error and upon me proved,',
          '   I never writ, nor no man ever loved.'
        ],
        note: 'A definition written entirely in negatives — not love, not Time’s fool, alters not — until the couplet stakes the poet’s whole career on it. "Bark" is a ship; "his height be taken" is a navigator measuring a star.',
        hard: [
          { w: 'impediments', say: 'im-PED-ih-muhnts', def: 'obstacles that stand in the way' },
          { w: 'tempests', say: 'TEM-pists', def: 'violent storms' },
          { w: 'sickle', say: 'SIK-uhl', def: 'a curved blade for cutting grain' },
          { w: 'compass', say: 'KUM-puhss', def: 'the range or reach of something' }
        ]
      },
      {
        t: 'Sonnet 130: My mistress’ eyes are nothing like the sun',
        th: 'flower', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'My mistress’ eyes are nothing like the sun;',
          'Coral is far more red than her lips’ red;',
          'If snow be white, why then her breasts are dun;',
          'If hairs be wires, black wires grow on her head.',
          'I have seen roses damask’d, red and white,',
          'But no such roses see I in her cheeks;',
          'And in some perfumes is there more delight',
          'Than in the breath that from my mistress reeks.',
          'I love to hear her speak, yet well I know',
          'That music hath a far more pleasing sound;',
          'I grant I never saw a goddess go;',
          'My mistress, when she walks, treads on the ground:',
          '   And yet, by heaven, I think my love as rare',
          '   As any she belied with false compare.',
        ],
        note: 'A joke at the expense of every other sonnet ever written. Thirteen lines of insults, and then a couplet that turns them all into the compliment: she is real, and the poets comparing women to suns and coral are lying.',
        hard: [
          { w: 'coral', say: 'KOR-uhl', def: 'a hard red or pink substance formed by sea creatures' },
          { w: 'damask', say: 'DAM-uhsk', def: 'patterned, like the figured silk of Damascus' },
          { w: 'belied', say: 'bih-LYDE', def: 'gave a false impression of' }
        ]
      },

      {
        t: 'Sonnet 29: When, in disgrace with fortune and men’s eyes',
        th: 'dawn', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'When, in disgrace with fortune and men’s eyes,',
          'I all alone beweep my outcast state,',
          'And trouble deaf heaven with my bootless cries,',
          'And look upon myself and curse my fate,',
          'Wishing me like to one more rich in hope,',
          'Featured like him, like him with friends possess’d,',
          'Desiring this man’s art and that man’s scope,',
          'With what I most enjoy contented least;',
          'Yet in these thoughts myself almost despising,',
          'Haply I think on thee, and then my state,',
          'Like to the lark at break of day arising',
          'From sullen earth, sings hymns at heaven’s gate;',
          '   For thy sweet love remember’d such wealth brings',
          '   That then I scorn to change my state with kings.'
        ],
        note: 'Eight lines of self-pity so complete it is almost funny, and then one word — "Haply", meaning by chance — turns the whole poem over. The lark image lifts the metre with it: after twelve heavy lines the verse suddenly climbs.',
        hard: [
          { w: 'bootless', say: 'BOOT-liss', def: 'useless; bringing no result' },
          { w: 'haply', say: 'HAP-lee', def: 'by chance; perhaps' },
          { w: 'sullen', say: 'SUL-uhn', def: 'gloomy and silent; dull in colour' },
          { w: 'despising', say: 'dih-SPY-zing', def: 'regarding with contempt' }
        ]
      },
      {
        t: 'On First Looking into Chapman’s Homer',
        th: 'sea', a: 'John Keats (1795–1821)', src: 'The Examiner', y: '1816', kind: 'sonnet',
        lines: [
          'Much have I travell’d in the realms of gold,',
          '   And many goodly states and kingdoms seen;',
          '   Round many western islands have I been',
          'Which bards in fealty to Apollo hold.',
          'Oft of one wide expanse had I been told',
          '   That deep-brow’d Homer ruled as his demesne;',
          '   Yet did I never breathe its pure serene',
          'Till I heard Chapman speak out loud and bold:',
          'Then felt I like some watcher of the skies',
          '   When a new planet swims into his ken;',
          'Or like stout Cortez when with eagle eyes',
          '   He star’d at the Pacific—and all his men',
          'Look’d at each other with a wild surmise—',
          '   Silent, upon a peak in Darien.',
        ],
        note: 'A poem about reading a translation, which sounds dull and is not: it is about the moment a book cracks the world open. Keats got his explorer wrong — it was Balboa, not Cortez — and nobody has ever wanted the line changed.',
        hard: [
          { w: 'fealty', say: 'FEE-uhl-tee', def: 'loyalty sworn to a lord' },
          { w: 'demesne', say: 'dih-MAYN', def: 'land attached to a manor; a domain' },
          { w: 'surmise', say: 'ser-MYZE', def: 'a guess made without firm evidence' },
          { w: 'expanse', say: 'ik-SPANSS', def: 'a wide continuous area' }
        ]
      },
      {
        t: 'Composed upon Westminster Bridge',
        th: 'city', a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'sonnet',
        lines: [
          'Earth has not any thing to shew more fair:',
          'Dull would he be of soul who could pass by',
          'A sight so touching in its majesty:',
          'This City now doth like a garment wear',
          'The beauty of the morning; silent, bare,',
          'Ships, towers, domes, theatres, and temples lie',
          'Open unto the fields, and to the sky;',
          'All bright and glittering in the smokeless air.',
          'Never did sun more beautifully steep',
          'In his first splendour valley, rock, or hill;',
          'Ne’er saw I, never felt, a calm so deep!',
          'The river glideth at his own sweet will:',
          '   Dear God! the very houses seem asleep;',
          '   And all that mighty heart is lying still!'
        ],
        note: 'The great poet of lakes and mountains, undone by London at dawn. "Smokeless" is the key: he is seeing the city in the one hour before the fires are lit, and it will not look like this again all day.',
        hard: [
          { w: 'majesty', say: 'MAJ-uh-stee', def: 'impressive dignity or grandeur' },
          { w: 'splendour', say: 'SPLEN-der', def: 'magnificent and brilliant appearance' },
          { w: 'glideth', say: 'GLYE-duhth', def: 'moves smoothly and quietly (old form of glides)' }
        ]
      },
      {
        t: 'Ozymandias',
        th: 'ruin', a: 'Percy Bysshe Shelley (1792–1822)', src: 'The Examiner', y: '1818', kind: 'sonnet',
        lines: [
          'I met a traveller from an antique land,',
          'Who said—"Two vast and trunkless legs of stone',
          'Stand in the desert. . . . Near them, on the sand,',
          'Half sunk a shattered visage lies, whose frown,',
          'And wrinkled lip, and sneer of cold command,',
          'Tell that its sculptor well those passions read',
          'Which yet survive, stamped on these lifeless things,',
          'The hand that mocked them, and the heart that fed;',
          'And on the pedestal, these words appear:',
          'My name is Ozymandias, King of Kings;',
          'Look on my Works, ye Mighty, and despair!',
          'Nothing beside remains. Round the decay',
          'Of that colossal Wreck, boundless and bare',
          'The lone and level sands stretch far away."'
        ],
        note: 'Four voices in fourteen lines: Shelley, the traveller, the sculptor and the dead king — and the king, who wanted the last word, is the one quoted inside two other people’s speech. "Nothing beside remains" is the shortest sentence in the poem and it lands like a door closing.',
        hard: [
          { w: 'visage', say: 'VIZ-ij', def: 'a person’s face or facial expression' },
          { w: 'pedestal', say: 'PED-uh-stuhl', def: 'the base on which a statue stands' },
          { w: 'colossal', say: 'kuh-LOSS-uhl', def: 'extremely large' },
          { w: 'antique', say: 'an-TEEK', def: 'belonging to ancient times' }
        ]
      },
      {
        t: 'Death, be not proud (Holy Sonnet 10)',
        th: 'night', a: 'John Donne (1572–1631)', src: 'Holy Sonnets', y: '1633', kind: 'sonnet',
        lines: [
          'Death, be not proud, though some have called thee',
          'Mighty and dreadful, for thou art not so;',
          'For those whom thou think’st thou dost overthrow',
          'Die not, poor Death, nor yet canst thou kill me.',
          'From rest and sleep, which but thy pictures be,',
          'Much pleasure; then from thee much more must flow,',
          'And soonest our best men with thee do go,',
          'Rest of their bones, and soul’s delivery.',
          'Thou art slave to fate, chance, kings, and desperate men,',
          'And dost with poison, war, and sickness dwell,',
          'And poppy or charms can make us sleep as well',
          'And better than thy stroke; why swell’st thou then?',
          '   One short sleep past, we wake eternally,',
          '   And death shall be no more; Death, thou shalt die.'
        ],
        note: 'Donne argues with Death the way a lawyer argues with a witness — calls it "poor Death", calls it a slave, points out that opium works better. The last four words are one of the great endings in English.',
        hard: [
          { w: 'dreadful', say: 'DRED-fuhl', def: 'causing great fear or awe' },
          { w: 'desperate', say: 'DES-per-uht', def: 'reckless from despair' },
          { w: 'eternally', say: 'ih-TER-nuh-lee', def: 'forever; without end' }
        ]
      },
      {
        t: 'The world is too much with us',
        th: 'sea', a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'sonnet',
        lines: [
          'The world is too much with us; late and soon,',
          'Getting and spending, we lay waste our powers;—',
          'Little we see in Nature that is ours;',
          'We have given our hearts away, a sordid boon!',
          'This Sea that bares her bosom to the moon;',
          'The winds that will be howling at all hours,',
          'And are up-gathered now like sleeping flowers;',
          'For this, for everything, we are out of tune;',
          'It moves us not.—Great God! I’d rather be',
          'A Pagan suckled in a creed outworn;',
          'So might I, standing on this pleasant lea,',
          'Have glimpses that would make me less forlorn;',
          '   Have sight of Proteus rising from the sea;',
          '   Or hear old Triton blow his wreathed horn.'
        ],
        note: 'Written two hundred years before anyone had a phone, and it is still the best complaint about being too busy to look up. "A sordid boon" — a filthy gift — is the sharpest three words in it.',
        hard: [
          { w: 'sordid', say: 'SOR-did', def: 'dirty, squalid or morally low' },
          { w: 'boon', say: 'BOON', def: 'a thing that is helpful; a blessing' },
          { w: 'forlorn', say: 'fer-LORN', def: 'lonely and unhappy' },
          { w: 'wreathed', say: 'REETHD', def: 'twisted or coiled into a ring' }
        ]
      },
      {
        t: 'Sonnet 73: That time of year thou mayst in me behold',
        th: 'forest', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'That time of year thou mayst in me behold',
          'When yellow leaves, or none, or few, do hang',
          'Upon those boughs which shake against the cold,',
          'Bare ruin’d choirs, where late the sweet birds sang.',
          'In me thou see’st the twilight of such day',
          'As after sunset fadeth in the west,',
          'Which by and by black night doth take away,',
          'Death’s second self, that seals up all in rest.',
          'In me thou see’st the glowing of such fire',
          'That on the ashes of his youth doth lie,',
          'As the death-bed whereon it must expire,',
          'Consum’d with that which it was nourish’d by.',
          '   This thou perceiv’st, which makes thy love more strong,',
          '   To love that well which thou must leave ere long.'
        ],
        note: 'Three images, each one shorter-lived than the last: a year, a day, a fire. Watch the first quatrain hesitate — "yellow leaves, or none, or few" — a man correcting himself downward, in public, about how much of himself is left.',
        hard: [
          { w: 'boughs', say: 'BOWZ', def: 'the main branches of a tree' },
          { w: 'choirs', say: 'KWIRE-z', def: 'the parts of a church where singers sit' },
          { w: 'expire', say: 'ek-SPYRE', def: 'to come to an end; to die' },
          { w: 'nourished', say: 'NUR-isht', def: 'fed and kept alive' },
          { w: 'perceive', say: 'per-SEEV', def: 'to become aware of; to understand' }
        ]
      },
      {
        t: 'Sonnet 30: When to the sessions of sweet silent thought',
        th: 'library', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'When to the sessions of sweet silent thought',
          'I summon up remembrance of things past,',
          'I sigh the lack of many a thing I sought,',
          'And with old woes new wail my dear time’s waste:',
          'Then can I drown an eye, unus’d to flow,',
          'For precious friends hid in death’s dateless night,',
          'And weep afresh love’s long since cancell’d woe,',
          'And moan the expense of many a vanish’d sight:',
          'Then can I grieve at grievances foregone,',
          'And heavily from woe to woe tell o’er',
          'The sad account of fore-bemoaned moan,',
          'Which I new pay as if not paid before.',
          '   But if the while I think on thee, dear friend,',
          '   All losses are restor’d and sorrows end.'
        ],
        note: 'The whole poem is a lawsuit. "Sessions", "summon", "account", "expense", "cancell’d", "pay", "losses restor’d" — grief is being audited. Then the couplet closes the books in one line, which is either a comfort or a very quick change of subject.',
        hard: [
          { w: 'remembrance', say: 'rih-MEM-bruhnss', def: 'the act of remembering; a memory kept' },
          { w: 'grievances', say: 'GREE-vuhn-siz', def: 'causes of complaint or resentment' },
          { w: 'foregone', say: 'FOR-gawn', def: 'gone before; past and done with' },
          { w: 'precious', say: 'PRESH-uhss', def: 'of great value; greatly loved' }
        ]
      },
      {
        t: 'Sonnet 60: Like as the waves make towards the pebbled shore',
        th: 'sea', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'Like as the waves make towards the pebbled shore,',
          'So do our minutes hasten to their end;',
          'Each changing place with that which goes before,',
          'In sequent toil all forwards do contend.',
          'Nativity, once in the main of light,',
          'Crawls to maturity, wherewith being crown’d,',
          'Crooked eclipses ’gainst his glory fight,',
          'And Time that gave doth now his gift confound.',
          'Time doth transfix the flourish set on youth',
          'And delves the parallels in beauty’s brow,',
          'Feeds on the rarities of nature’s truth,',
          'And nothing stands but for his scythe to mow:',
          '   And yet to times in hope my verse shall stand,',
          '   Praising thy worth, despite his cruel hand.'
        ],
        note: 'A whole life in four lines — born, crowned, eclipsed, taken back — and then Time gets teeth: it transfixes, it delves, it feeds, it mows. The poem loses the argument on purpose and then claims the last word anyway.',
        hard: [
          { w: 'nativity', say: 'nuh-TIV-ih-tee', def: 'the occasion of a person’s birth' },
          { w: 'maturity', say: 'muh-TYOOR-ih-tee', def: 'the state of being fully grown' },
          { w: 'eclipses', say: 'ih-KLIP-siz', def: 'obscurings of one heavenly body by another' },
          { w: 'transfix', say: 'tranz-FIKS', def: 'to pierce through; to hold motionless' },
          { w: 'scythe', say: 'SYTHE', def: 'a long curved blade for mowing by hand' }
        ]
      },
      {
        t: 'Sonnet 65: Since brass, nor stone, nor earth, nor boundless sea',
        th: 'ruin', a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
        lines: [
          'Since brass, nor stone, nor earth, nor boundless sea,',
          'But sad mortality o’ersways their power,',
          'How with this rage shall beauty hold a plea,',
          'Whose action is no stronger than a flower?',
          'O, how shall summer’s honey breath hold out',
          'Against the wrackful siege of battering days,',
          'When rocks impregnable are not so stout,',
          'Nor gates of steel so strong, but Time decays?',
          'O fearful meditation! where, alack,',
          'Shall Time’s best jewel from Time’s chest lie hid?',
          'Or what strong hand can hold his swift foot back?',
          'Or who his spoil of beauty can forbid?',
          '   O, none, unless this miracle have might,',
          '   That in black ink my love may still shine bright.'
        ],
        note: 'Four hard things in the first line and every one of them loses. The poem asks six questions and answers none of them until "O, none" — and then stakes everything on the cheapest material in the list: ink.',
        hard: [
          { w: 'mortality', say: 'mor-TAL-ih-tee', def: 'the state of being subject to death' },
          { w: 'impregnable', say: 'im-PREG-nuh-buhl', def: 'unable to be captured or broken into' },
          { w: 'meditation', say: 'med-ih-TAY-shuhn', def: 'deep, focused thought' },
          { w: 'miracle', say: 'MEER-uh-kuhl', def: 'a wonderful event beyond natural explanation' }
        ]
      },
      {
        t: 'When I consider how my light is spent',
        th: 'night', a: 'John Milton (1608–1674)', src: 'Sonnet 19', y: 'c. 1655', kind: 'sonnet',
        lines: [
          'When I consider how my light is spent',
          'Ere half my days in this dark world and wide,',
          'And that one talent which is death to hide',
          'Lodg’d with me useless, though my soul more bent',
          'To serve therewith my Maker, and present',
          'My true account, lest He returning chide,',
          '"Doth God exact day-labour, light denied?"',
          'I fondly ask. But Patience, to prevent',
          'That murmur, soon replies: "God doth not need',
          'Either man’s work or his own gifts: who best',
          'Bear his mild yoke, they serve him best. His state',
          'Is kingly; thousands at his bidding speed',
          '   And post o’er land and ocean without rest:',
          '   They also serve who only stand and wait."',
        ],
        note: 'Milton went blind in his forties. The whole octave is one enormous sentence that cannot finish — the sound of a question being worked up to and dreaded. Then Patience interrupts him mid-line, which is the only rude thing in the poem and the kindest.',
        hard: [
          { w: 'lodged', say: 'LOJD', def: 'placed or left somewhere for keeping' },
          { w: 'chide', say: 'CHIDE', def: 'to scold or rebuke' },
          { w: 'murmur', say: 'MUR-mer', def: 'a low complaint spoken under the breath' },
          { w: 'yoke', say: 'YOKE', def: 'a wooden crosspiece harnessing two animals; a burden' },
          { w: 'bidding', say: 'BID-ing', def: 'a command or request' }
        ]
      },
      {
        t: 'The New Colossus',
        th: 'city', a: 'Emma Lazarus (1849–1887)', src: 'Written for the pedestal of the Statue of Liberty', y: '1883', kind: 'sonnet',
        lines: [
          'Not like the brazen giant of Greek fame,',
          'With conquering limbs astride from land to land;',
          'Here at our sea-washed, sunset gates shall stand',
          'A mighty woman with a torch, whose flame',
          'Is the imprisoned lightning, and her name',
          'Mother of Exiles. From her beacon-hand',
          'Glows world-wide welcome; her mild eyes command',
          'The air-bridged harbor that twin cities frame.',
          '"Keep, ancient lands, your storied pomp!" cries she',
          'With silent lips. "Give me your tired, your poor,',
          'Your huddled masses yearning to breathe free,',
          'The wretched refuse of your teeming shore.',
          '   Send these, the homeless, tempest-tost to me,',
          '   I lift my lamp beside the golden door!"'
        ],
        note: 'It begins by refusing the obvious comparison — not that colossus, this one — and the difference is the whole poem: the old giant straddled a harbour to keep ships out. Note "refuse": here it is REF-yooss, rubbish, not rih-FYOOZ. A heteronym doing the hardest work in the line.',
        hard: [
          { w: 'brazen', say: 'BRAY-zuhn', def: 'made of brass; boldly shameless' },
          { w: 'astride', say: 'uh-STRIDE', def: 'with a leg on either side' },
          { w: 'beacon', say: 'BEE-kuhn', def: 'a fire or light used as a signal' },
          { w: 'refuse', say: 'REF-yooss', def: 'matter thrown away; rubbish' },
          { w: 'tempest', say: 'TEM-pist', def: 'a violent storm' }
        ]
      },
      {
        t: 'When I have Fears that I May Cease to Be',
        th: 'night', a: 'John Keats (1795–1821)', src: 'Written in a letter to J. H. Reynolds', y: '1818', kind: 'sonnet',
        lines: [
          'When I have fears that I may cease to be',
          'Before my pen has glean’d my teeming brain,',
          'Before high-piled books, in charact’ry,',
          'Hold like rich garners the full ripen’d grain;',
          'When I behold, upon the night’s starr’d face,',
          'Huge cloudy symbols of a high romance,',
          'And think that I may never live to trace',
          'Their shadows, with the magic hand of chance;',
          'And when I feel, fair creature of an hour,',
          'That I shall never look upon thee more,',
          'Never have relish in the faery power',
          'Of unreflecting love;—then on the shore',
          '   Of the wide world I stand alone, and think',
          '   Till love and fame to nothingness do sink.'
        ],
        note: 'Keats was twenty-two and already knew. Three "when"s pile up for twelve lines without a main clause — the sentence will not land — and when it finally does, everything in it goes small: one man, one shore, two words sinking.',
        hard: [
          { w: 'gleaned', say: 'GLEEND', def: 'gathered bit by bit, as grain left after harvest' },
          { w: 'teeming', say: 'TEEM-ing', def: 'full to overflowing; swarming' },
          { w: 'garners', say: 'GAR-nerz', def: 'storehouses for grain' },
          { w: 'relish', say: 'REL-ish', def: 'great enjoyment of something' }
        ]
      },
      {
        t: 'Bright star, would I were stedfast as thou art',
        th: 'snow', a: 'John Keats (1795–1821)', src: 'Written in a volume of Shakespeare', y: '1819', kind: 'sonnet',
        lines: [
          'Bright star, would I were stedfast as thou art—',
          'Not in lone splendour hung aloft the night',
          'And watching, with eternal lids apart,',
          'Like nature’s patient, sleepless Eremite,',
          'The moving waters at their priestlike task',
          'Of pure ablution round earth’s human shores,',
          'Or gazing on the new soft-fallen mask',
          'Of snow upon the mountains and the moors—',
          'No—yet still stedfast, still unchangeable,',
          'Pillow’d upon my fair love’s ripening breast,',
          'To feel for ever its soft fall and swell,',
          'Awake for ever in a sweet unrest,',
          '   Still, still to hear her tender-taken breath,',
          '   And so live ever—or else swoon to death.'
        ],
        note: 'He asks for one quality of the star and spends eight lines refusing all its others. "Stedfast" is Keats’s own spelling — it was already old-fashioned when he wrote it, and he wanted the older, harder word. The poem ends on a choice between two things that are both an ending.',
        hard: [
          { w: 'stedfast', say: 'STED-fast', def: 'an older spelling of steadfast — firmly fixed' },
          { w: 'splendour', say: 'SPLEN-der', def: 'magnificent brightness (British spelling)' },
          { w: 'eremite', say: 'AIR-uh-mite', def: 'a hermit, especially a religious one' },
          { w: 'ablution', say: 'uh-BLOO-shuhn', def: 'a ceremonial washing' },
          { w: 'unchangeable', say: 'un-CHAYN-juh-buhl', def: 'not able to be altered' }
        ]
      },
      {
        t: 'God’s Grandeur',
        th: 'dawn', a: 'Gerard Manley Hopkins (1844–1889)', src: 'Poems', y: '1877', kind: 'sonnet',
        lines: [
          'The world is charged with the grandeur of God.',
          'It will flame out, like shining from shook foil;',
          'It gathers to a greatness, like the ooze of oil',
          'Crushed. Why do men then now not reck his rod?',
          'Generations have trod, have trod, have trod;',
          'And all is seared with trade; bleared, smeared with toil;',
          'And wears man’s smudge and shares man’s smell: the soil',
          'Is bare now, nor can foot feel, being shod.',
          'And for all this, nature is never spent;',
          'There lives the dearest freshness deep down things;',
          'And though the last lights off the black West went',
          'Oh, morning, at the brown brink eastward, springs—',
          '   Because the Holy Ghost over the bent',
          '   World broods with warm breast and with ah! bright wings.'
        ],
        note: 'Read it aloud or you will miss it entirely. Hopkins hammers the same sounds until they wear out — "have trod, have trod, have trod", "seared, bleared, smeared" — so the language itself gets tired and grubby, and then the last three lines let the air back in.',
        hard: [
          { w: 'grandeur', say: 'GRAN-jer', def: 'splendour and impressiveness' },
          { w: 'seared', say: 'SEERD', def: 'burned or scorched on the surface' },
          { w: 'bleared', say: 'BLEERD', def: 'made dim or blurred' },
          { w: 'smudge', say: 'SMUJ', def: 'a dirty mark or smear' },
          { w: 'shod', say: 'SHOD', def: 'wearing shoes' }
        ]
      },
      {
        t: 'It is a beauteous evening, calm and free',
        th: 'sea', a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'sonnet',
        lines: [
          'It is a beauteous evening, calm and free,',
          'The holy time is quiet as a Nun',
          'Breathless with adoration; the broad sun',
          'Is sinking down in its tranquillity;',
          'The gentleness of heaven broods o’er the Sea:',
          'Listen! the mighty Being is awake,',
          'And doth with his eternal motion make',
          'A sound like thunder—everlastingly.',
          'Dear Child! dear Girl! that walkest with me here,',
          'If thou appear untouched by solemn thought,',
          'Thy nature is not therefore less divine:',
          'Thou liest in Abraham’s bosom all the year;',
          '   And worshipp’st at the Temple’s inner shrine,',
          '   God being with thee when we know it not.'
        ],
        note: 'Eight lines of hush and then "Listen!" — the loudest word in the poem is an instruction to be quiet. The turn happens when he notices the child beside him is not impressed, and decides that is holier than being impressed. Note "tranquillity": two l’s, the British spelling.',
        hard: [
          { w: 'beauteous', say: 'BYOO-tee-uhss', def: 'beautiful (a poetic form)' },
          { w: 'adoration', say: 'ad-uh-RAY-shuhn', def: 'deep love and respect' },
          { w: 'tranquillity', say: 'trang-KWIL-ih-tee', def: 'calmness and quiet (British spelling)' },
          { w: 'solemn', say: 'SOL-uhm', def: 'formal and dignified; deeply serious' },
          { w: 'divine', say: 'dih-VINE', def: 'of or like God' }
        ]
      }
    ]
  },

  /* =============== III. HAIKU =============== */
  haiku: {
    title: 'Seventeen syllables',
    blurb: 'A haiku is not a small poem; it is a whole poem that has thrown away everything except the moment. Three lines, traditionally five syllables then seven then five, and somewhere in it a season and a cut — a place where the poem turns without saying so. The Japanese is given in rōmaji, and the English underneath is a plain rendering, not a translation trying to be a poem.',
    pieces: [
      {
        t: 'The old pond', th: 'water', a: 'Matsuo Bashō (1644–1694)', src: 'Haru no Hi', y: '1686', kind: 'haiku',
        lines: ['furuike ya', 'kawazu tobikomu', 'mizu no oto', '', 'The old pond —', 'a frog jumps in:', 'the sound of water.'],
        note: 'The most famous poem in Japanese. Nothing happens except a sound, and the whole art is in the silence you are made to notice before it.',
        hard: [{ w: 'tranquil', say: 'TRANG-kwil', def: 'free from disturbance; calm' }]
      },
      {
        t: 'On a bare branch', th: 'bird', a: 'Matsuo Bashō (1644–1694)', src: 'Azuma Nikki', y: '1680', kind: 'haiku',
        lines: ['kare eda ni', 'karasu no tomarikeri', 'aki no kure', '', 'On a bare branch', 'a crow has settled —', 'autumn dusk.'],
        note: 'Three things and no verb of feeling. The poem trusts the crow, the branch and the failing light to do all of it.',
        hard: [{ w: 'desolate', say: 'DESS-uh-luht', def: 'bleak and empty; deserted' }]
      },
      {
        t: 'The summer grasses', th: 'war', a: 'Matsuo Bashō (1644–1694)', src: 'Oku no Hosomichi', y: '1689', kind: 'haiku',
        lines: ['natsukusa ya', 'tsuwamono domo ga', 'yume no ato', '', 'Summer grasses —', 'all that remains', 'of warriors’ dreams.'],
        note: 'Written at a battlefield where an army was destroyed five hundred years earlier. Grass, and the word "remains", and he never mentions a single body.',
        hard: [{ w: 'vestige', say: 'VESS-tij', def: 'a trace of something that no longer exists' }]
      },
      {
        t: 'A world of dew', th: 'water', a: 'Kobayashi Issa (1763–1828)', src: 'Ora ga Haru', y: '1819', kind: 'haiku',
        lines: ['tsuyu no yo wa', 'tsuyu no yo nagara', 'sarinagara', '', 'This world of dew', 'is a world of dew —', 'and yet, and yet.'],
        note: 'Issa wrote it after his daughter died. The Buddhist teaching says the world is passing, like dew; he agrees with the teaching and refuses it in the same breath. "Sarinagara" is the sound of a man who knows better and cannot help it.',
        hard: [{ w: 'transient', say: 'TRAN-zee-uhnt', def: 'lasting only a short time' }]
      },
      {
        t: 'The snail', th: 'mountain', a: 'Kobayashi Issa (1763–1828)', src: 'Collected haiku', y: 'c. 1810', kind: 'haiku',
        lines: ['katatsumuri', 'soro soro nobore', 'fuji no yama', '', 'O snail,', 'climb Mount Fuji —', 'but slowly, slowly.'],
        note: 'The kindest poem about ambition ever written, and the only advice most people need.',
        hard: [{ w: 'ascend', say: 'uh-SEND', def: 'to go up or climb' }]
      },
      {
        t: 'The lightning flash', th: 'sea', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1770', kind: 'haiku',
        lines: ['inazuma ya', 'nami moteyueru', 'akitsushima', '', 'Lightning —', 'and the waves are wreathed', 'around the islands.'],
        note: 'Buson painted as well as wrote, and it shows: the flash is a light source, and the poem is composed the way a picture is.',
        hard: [{ w: 'archipelago', say: 'ar-kih-PEL-uh-goh', def: 'a group or chain of islands' }]
      },
      {
        t: 'First autumn morning', th: 'dawn', a: 'Matsuo Bashō (1644–1694)', src: 'Collected haiku', y: 'c. 1690', kind: 'haiku',
        lines: ['asa yosamu', 'tabi no yadori no', 'kaji no oto', '', 'Cold at dawn —', 'from the traveller’s lodging,', 'the sound of a hammer.'],
        note: 'Two facts and no comment. The cold is his; the hammer is somebody else already at work, which is what makes the cold lonely.',
        hard: [{ w: 'lodging', say: 'LOJ-ing', def: 'a temporary place to stay' }]
      },
      {
        t: 'The temple bell stops', th: 'night', a: 'Matsuo Bashō (1644–1694)', src: 'Collected haiku', y: 'c. 1688', kind: 'haiku',
        lines: ['kane kiete', 'hana no ka wa tsuku', 'yūbe kana', '', 'The bell fades away —', 'the scent of blossom strikes,', 'evening.'],
        note: 'One sense hands over to another: the sound stops and the smell arrives in its place. The verb for the scent is the verb for a bell being struck.',
        hard: [{ w: 'resonance', say: 'REZ-uh-nuhnss', def: 'a deep, lingering sound' }]
      },
      {
        t: 'Spring rain', th: 'water', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1775', kind: 'haiku',
        lines: ['harusame ya', 'monogatari yuku', 'mino to kasa', '', 'Spring rain —', 'walking and talking,', 'a straw cape and an umbrella.'],
        note: 'You never see the two people, only what they are wearing. Buson was a painter and this is a painter’s trick: describe the shapes, let the reader supply the friends.',
        hard: [{ w: 'drizzle', say: 'DRIZ-uhl', def: 'fine light rain' }]
      },
      {
        t: 'The piercing chill', th: 'snow', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1770', kind: 'haiku',
        lines: ['mi ni shimu ya', 'naki tsuma no kushi wo', 'neya ni fumu', '', 'The piercing chill —', 'my dead wife’s comb, in our bedroom,', 'under my heel.'],
        note: 'The whole poem is one physical shock standing in for a year of grief. Notice he does not say he was sad; he says he stepped on something.',
        hard: [{ w: 'piercing', say: 'PEER-sing', def: 'sharp and penetrating' }]
      },
      {
        t: 'The child of poverty', th: 'night', a: 'Kobayashi Issa (1763–1828)', src: 'Collected haiku', y: 'c. 1815', kind: 'haiku',
        lines: ['yase-gaeru', 'makeru na Issa', 'kore ni ari', '', 'Skinny frog,', 'don’t give up the fight —', 'Issa is here.'],
        note: 'Written watching a frog lose a contest it could not win. Issa cheers for it anyway, by name, which is the whole of his poetry in three lines.',
        hard: [{ w: 'perseverance', say: 'per-suh-VEER-uhnss', def: 'continued effort in spite of difficulty' }]
      },
      {
        t: 'In this world', th: 'flower', a: 'Kobayashi Issa (1763–1828)', src: 'Collected haiku', y: 'c. 1812', kind: 'haiku',
        lines: ['yo no naka wa', 'jigoku no ue no', 'hanami kana', '', 'In this world', 'we walk on the roof of hell', 'gazing at flowers.'],
        note: 'The most cheerful terrible thing ever written. Both halves are true at once and the poem refuses to choose between them.',
        hard: [{ w: 'oblivious', say: 'uh-BLIV-ee-uhss', def: 'not aware of what is happening around you' }]
      },
      {
        t: 'Such stillness', th: 'mountain', a: 'Matsuo Bashō (1644–1694)', src: 'Oku no Hosomichi', y: '1689', kind: 'haiku',
        lines: ['shizukesa ya', 'iwa ni shimiiru', 'semi no koe', '', 'Such stillness —', 'soaking into the rock,', 'the cry of the cicadas.'],
        note: 'A noise so continuous it becomes silence, and then goes into stone. The verb shimiiru is what ink does to paper.',
        hard: [{ w: 'cicada', say: 'sih-KAY-duh', def: 'a loud insect that sings in hot weather' }]
      },
      {
        t: 'Sick on a journey', th: 'road', a: 'Matsuo Bashō (1644–1694)', src: 'His last poem', y: '1694', kind: 'haiku',
        lines: ['tabi ni yande', 'yume wa kareno wo', 'kakemeguru', '', 'Sick on a journey —', 'my dreams go wandering', 'over withered fields.'],
        note: 'The last thing he wrote. He had spent his life walking, and even the dream keeps walking after the body stops.',
        hard: [{ w: 'withered', say: 'WITH-erd', def: 'dried up and shrivelled' }]
      },
      {
        t: 'First cold shower', th: 'snow', a: 'Matsuo Bashō (1644–1694)', src: 'Collected haiku', y: '1689', kind: 'haiku',
        lines: ['hatsushigure', 'saru mo komino wo', 'hoshige nari', '', 'First cold shower —', 'even the monkey seems to want', 'a little coat of straw.'],
        note: 'A whole season announced by one animal looking cold. Bashō almost never says he is uncomfortable; he finds something else that is.',
        hard: [{ w: 'drizzle', say: 'DRIZ-uhl', def: 'light, fine rain' }]
      },
      {
        t: 'Peaks of cloud', th: 'mountain', a: 'Matsuo Bashō (1644–1694)', src: 'Oku no Hosomichi', y: '1689', kind: 'haiku',
        lines: ['kumo no mine', 'ikutsu kuzurete', 'tsuki no yama', '', 'Peaks of cloud —', 'how many have crumbled?', 'The mountain of the moon.'],
        note: 'Two mountains in three lines: one made of vapour that keeps falling down, one that has not moved. Only one of them is asked a question.',
        hard: [{ w: 'summit', say: 'SUM-it', def: 'the highest point of a hill or mountain' }]
      },
      {
        t: 'Rape blossoms', th: 'flower', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1774', kind: 'haiku',
        lines: ['na no hana ya', 'tsuki wa higashi ni', 'hi wa nishi ni', '', 'Fields of yellow flowers —', 'the moon in the east,', 'the sun in the west.'],
        note: 'Buson trained as a painter and it shows: this is a canvas, not a thought. Three light sources, no people, and the exact minute of the day given away without a single number.',
        hard: [{ w: 'horizon', say: 'huh-RYE-zuhn', def: 'the line where earth and sky appear to meet' }]
      },
      {
        t: 'On the temple bell', th: 'night', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1770', kind: 'haiku',
        lines: ['tsurigane ni', 'tomarite nemuru', 'kochō kana', '', 'On the temple bell,', 'settled, fast asleep —', 'a butterfly.'],
        note: 'Everything in it is about what has not happened yet. The bell is enormous, the butterfly weighs nothing, and any moment now somebody will ring it.',
        hard: [{ w: 'precarious', say: 'prih-KAIR-ee-uhss', def: 'not securely held; dangerously uncertain' }]
      },
      {
        t: 'Evening wind', th: 'water', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1770', kind: 'haiku',
        lines: ['yū kaze ya', 'mizu aosagi no', 'hagi wo utsu', '', 'The evening wind —', 'water slaps against', 'the blue heron’s legs.'],
        note: 'The heron never moves and is never described. You get its legs, and from the legs you get the stillness of the whole bird.',
        hard: [{ w: 'heron', say: 'HAIR-uhn', def: 'a long-legged wading bird' }]
      },
      {
        t: 'Skinny frog', th: 'water', a: 'Kobayashi Issa (1763–1828)', src: 'Collected haiku', y: 'c. 1816', kind: 'haiku',
        lines: ['yase-gaeru', 'makeru na Issa', 'kore ni ari', '', 'Skinny frog,', 'don’t give up the fight —', 'Issa is here.'],
        note: 'Issa watched two frogs fighting over a mate and took a side. He puts his own name in the poem, which almost nobody did, because somebody had to be in the frog’s corner.',
        hard: [{ w: 'perseverance', say: 'pur-suh-VEER-uhnss', def: 'continued effort in spite of difficulty' }]
      },
      {
        t: 'Come and play with me', th: 'bird', a: 'Kobayashi Issa (1763–1828)', src: 'Ora ga Haru', y: '1819', kind: 'haiku',
        lines: ['ware to kite', 'asobe ya oya no', 'nai suzume', '', 'Come and play with me,', 'sparrow', 'with no mother.'],
        note: 'Issa’s mother died when he was three. He is not comforting the bird; he is asking it for something, which is why the poem does not sound sweet.',
        hard: [{ w: 'orphan', say: 'OR-fuhn', def: 'a child whose parents have died' }]
      },
      {
        t: 'The morning glory', th: 'flower', a: 'Fukuda Chiyo-ni (1703–1775)', src: 'Chiyo-ni kushū', y: 'c. 1750', kind: 'haiku',
        lines: ['asagao ni', 'tsurube torarete', 'morai mizu', '', 'The morning glory', 'has taken the well bucket —', 'I shall beg for water.'],
        note: 'A vine has wound round the rope overnight and she will not cut it. The poem is a small legal finding: the flower got there first, so she is the one who must go without.',
        hard: [{ w: 'tendril', say: 'TEN-dril', def: 'a slender coiling shoot by which a plant climbs' }]
      },
      {
        t: 'I bite into a persimmon', th: 'dawn', a: 'Masaoka Shiki (1867–1902)', src: 'Written at Hōryū-ji', y: '1895', kind: 'haiku',
        lines: ['kaki kueba', 'kane ga naru nari', 'Hōryūji', '', 'I bite into a persimmon —', 'and a bell begins to sound:', 'Hōryū-ji.'],
        note: 'Two senses and a place name, and no connection offered between them. Shiki insisted a haiku should be a sketch from life; here the coincidence IS the poem, and explaining it would kill it.',
        hard: [{ w: 'persimmon', say: 'per-SIM-uhn', def: 'a sweet orange fruit eaten when very ripe' }]
      },
      {
        t: 'Again and again', th: 'snow', a: 'Masaoka Shiki (1867–1902)', src: 'Collected haiku', y: '1896', kind: 'haiku',
        lines: ['ikutabi mo', 'yuki no fukasa wo', 'tazunekeri', '', 'Again and again', 'I ask how deep', 'the snow has become.'],
        note: 'Shiki spent his last years unable to leave his bed. The poem never says he cannot look out of the window; it only lets you hear him asking, and asking.',
        hard: [{ w: 'confined', say: 'kuhn-FYND', def: 'kept within limits; unable to leave' }]
      }
    ]
  },

  /* =============== IV. FIVE LINES AND A BOUNCE =============== */
  limericks: {
    title: 'Five lines and a bounce',
    blurb: 'A limerick is five lines wearing a fixed uniform: lines one, two and five rhyme with each other and run long, while lines three and four rhyme with each other and run short — AABBA, and you can hear the shape before you understand the sentence. The engine underneath is the anapaest, that da-da-DUM gallop that will not let you mumble, so every syllable has to be struck cleanly or the line falls over. That is exactly why a spelling book wants them: a limerick is a machine for making words audible, forcing the ear to count the beats in a word like ca-PA-cious or ex-CEED-ing-ly before the hand ever tries to spell it.',
    pieces: [
{
        t: 'There was an Old Man with a beard',
        th: 'bird', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Man with a beard,',
          'Who said, “It is just as I feared!—',
          'Two Owls and a Hen,',
          'Four Larks and a Wren,',
          'Have all built their nests in my beard!”'
        ],
        note: 'Lear ends line five on the same word he began with — “beard” rhymed against itself — so the poem shuts like a box, and the two short lines are pure inventory, a bird list ticked off with the flat calm of a man reporting a burglary rather than a nesting colony on his own face. The comedy is the tone: “just as I feared” means he saw it coming and did nothing.',
        hard: [
          { w: 'wren', say: 'REN', def: 'a tiny brown songbird, spelled with a silent w' },
          { w: 'plumage', say: 'PLOO-mij', def: 'the feathers covering a bird' },
          { w: 'exasperation', say: 'eg-zas-puh-RAY-shun', def: 'the feeling of being worn out by an annoyance' }
        ]
      },
      {
        t: 'There was an Old Man with a nose',
        th: 'stage', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Man with a nose,',
          'Who said, “If you choose to suppose',
          'That my nose is too long,',
          'You are certainly wrong!”',
          'That remarkable Man with a nose.'
        ],
        note: 'The whole middle of the poem is a man arguing with an accusation nobody has actually made, which is the joke — he protests before he is challenged. Lear never tells us the nose is long; the denial does all the describing, and the last line hands him the faintly damning word “remarkable” instead of agreeing with him.',
        hard: [
          { w: 'remarkable', say: 'ri-MAR-kuh-bul', def: 'worth noticing or commenting on' },
          { w: 'protuberance', say: 'pruh-TOO-bur-unss', def: 'a part that sticks out from a surface' },
          { w: 'indignant', say: 'in-DIG-nunt', def: 'angry at something felt to be unfair' }
        ]
      },
      {
        t: 'There was a Young Lady whose bonnet',
        th: 'bird', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was a Young Lady whose bonnet',
          'Came untied when the birds sate upon it;',
          'But she said, “I don’t care!',
          'All the birds in the air',
          'Are welcome to sit on my bonnet!”'
        ],
        note: 'Lear needs a three-syllable rhyme and bullies the language into giving him one: “bonnet / upon it / bonnet,” where “upon it” is two words pretending to be one. The turn is temperamental rather than logical — she does not fix the hat, she reclassifies it as a public perch, and the exclamation mark in line three carries the whole change of heart.',
        hard: [
          { w: 'bonnet', say: 'BON-it', def: 'a hat tied under the chin with ribbons' },
          { w: 'sate', say: 'SAYT', def: 'an old-fashioned past tense of sit' },
          { w: 'millinery', say: 'MIL-uh-ner-ee', def: 'the trade of making hats' }
        ]
      },
      {
        t: 'There was an Old Man in a boat',
        th: 'water', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Man in a boat,',
          'Who said, “I’m afloat! I’m afloat!”',
          'When they said, “No! you ain’t!”',
          'He was ready to faint,',
          'That unhappy Old Man in a boat.'
        ],
        note: 'This is the rare limerick built entirely out of a disagreement, and the man is right — he is in a boat, he is afloat — yet the crowd flatly contradicts him and he crumples anyway. Lear repeats “I’m afloat” to fill the long second line with pure insistence, then answers it with the shortest, rudest possible line three.',
        hard: [
          { w: 'afloat', say: 'uh-FLOHT', def: 'resting on the surface of water rather than sinking' },
          { w: 'buoyant', say: 'BOY-unt', def: 'able to float' },
          { w: 'contradict', say: 'kon-truh-DIKT', def: 'to say the opposite of what someone has said' }
        ]
      },
      {
        t: 'There was an Old Person of Dover',
        th: 'flower', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Person of Dover,',
          'Who rushed through a field of blue Clover;',
          'But some very large bees',
          'Stung his nose and his knees,',
          'So he very soon went back to Dover.'
        ],
        note: 'The two short lines are the sting, literally — “bees / knees” is a fast, clipped pair dropped into the middle of a poem whose long lines amble. Lear ends where he started, at Dover, so the entire adventure cancels itself out: the man travels a full circle and gains nothing but two sore knees.',
        hard: [
          { w: 'clover', say: 'KLOH-vur', def: 'a low field plant with round pinkish or white flower heads' },
          { w: 'apiary', say: 'AY-pee-air-ee', def: 'a place where bee hives are kept' },
          { w: 'nectar', say: 'NEK-tur', def: 'the sweet liquid bees collect from flowers' }
        ]
      },
      {
        t: 'There was an Old Man of Kamschatka',
        th: 'snow', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Man of Kamschatka,',
          'Who possessed a remarkably fat cur;',
          'His gait and his waddle',
          'Were held as a model',
          'To all the fat dogs in Kamschatka.'
        ],
        note: 'Line two does not really rhyme — “Kamschatka” and “cur” only agree if you swallow the ending, and Lear lets that near-miss stand, which is part of the deadpan. Meanwhile “waddle / model” is a perfect two-syllable rhyme, so the dog moves more gracefully in the rhyme scheme than he does in life.',
        hard: [
          { w: 'gait', say: 'GAYT', def: 'the particular way a person or animal walks' },
          { w: 'cur', say: 'KUR', def: 'an old word for a scruffy or mixed-breed dog' },
          { w: 'waddle', say: 'WOD-ul', def: 'to walk with short steps, rocking side to side' }
        ]
      },
      {
        t: 'There was an Old Person of Ware',
        th: 'mountain', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was an Old Person of Ware,',
          'Who rode on the back of a bear;',
          'When they asked, “Does it trot?”',
          'He said, “Certainly not!',
          'He’s a Moppsikon Floppsikon bear!”'
        ],
        note: 'The last line abandons English altogether: “Moppsikon Floppsikon” is a nonsense word pair invented purely to fill four beats, and it works because the anapaestic bounce is so strong that the ear accepts any syllables that march in step. Note that the man treats a made-up adjective as a complete answer, and the poem lets him win the argument.',
        hard: [
          { w: 'ursine', say: 'UR-syne', def: 'having to do with bears' },
          { w: 'portmanteau', say: 'port-MAN-toh', def: 'a word made by jamming two other words together' },
          { w: 'preposterous', say: 'pri-POS-tur-uss', def: 'so silly it cannot be taken seriously' }
        ]
      },
      {
        t: 'There was a Young Lady whose chin',
        th: 'stage', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was a Young Lady whose chin',
          'Resembled the point of a pin;',
          'So she had it made sharp,',
          'And purchased a harp,',
          'And played several tunes with her chin.'
        ],
        note: 'Lear starts with a simile — the chin is “like” a pin — and then quietly treats the simile as a fact, sharpening it and using it as a plectrum. The little word “So” at the head of line three is the hinge: it pretends the harp is a reasonable consequence of the chin, and the poem never blinks.',
        hard: [
          { w: 'resembled', say: 'ri-ZEM-buld', def: 'looked like something else' },
          { w: 'harpist', say: 'HAR-pist', def: 'a person who plays the harp' },
          { w: 'silhouette', say: 'sil-oo-ET', def: 'the dark outline of something seen against light' }
        ]
      },
      {
        t: 'There was a Young Lady of Ryde',
        th: 'road', a: 'Edward Lear (1812–1888)', src: 'A Book of Nonsense', y: '1846', kind: 'limerick',
        lines: [
          'There was a Young Lady of Ryde,',
          'Whose shoe-strings were seldom untied;',
          'She purchased some clogs,',
          'And some small spotted dogs,',
          'And frequently walked about Ryde.'
        ],
        note: 'Nothing happens, and that is the trick — the poem promises a catastrophe in the shoe-strings of line two and then delivers only shopping. “Clogs / dogs” is a snapped-off rhyme that makes the purchases sound like one impulsive errand, and the flat last line lets the whole thing fizzle out on purpose.',
        hard: [
          { w: 'clogs', say: 'KLOGZ', def: 'heavy shoes with wooden soles' },
          { w: 'promenade', say: 'prom-uh-NAHD', def: 'a leisurely public walk, or the place you take one' },
          { w: 'frequently', say: 'FREE-kwunt-lee', def: 'often; again and again' }
        ]
      },
      {
        t: 'There was an Old Man who said, “Hush!”',
        th: 'forest', a: 'Edward Lear (1812–1888)', src: 'More Nonsense', y: '1872', kind: 'limerick',
        lines: [
          'There was an Old Man who said, “Hush!',
          'I perceive a young bird in this bush!”',
          'When they said, “Is it small?”',
          'He replied, “Not at all!',
          'It is four times as big as the bush!”'
        ],
        note: 'The joke is a measurement problem: a bird four times the size of its own bush cannot be hiding in it, so line five destroys the picture line two just built. Lear also rhymes “Hush” with “bush” with “bush,” reusing the same word at the end, which makes the last line land like someone thumping the table.',
        hard: [
          { w: 'perceive', say: 'pur-SEEV', def: 'to notice or become aware of something' },
          { w: 'shrubbery', say: 'SHRUB-ur-ee', def: 'a group of bushes planted together' },
          { w: 'exaggerate', say: 'eg-ZAJ-uh-rayt', def: 'to make something sound bigger than it is' }
        ]
      },
      {
        t: 'A wonderful bird is the pelican',
        th: 'sea', a: 'Dixon Lanier Merritt (1879–1972)', src: 'The Nashville Banner', y: '1910', kind: 'limerick',
        lines: [
          'A wonderful bird is the pelican,',
          'His bill will hold more than his belican,',
          'He can take in his beak',
          'Enough food for a week,',
          'But I’m darned if I know how the helican.'
        ],
        note: 'Three of the five lines rhyme on a syllable that does not exist: “belican” and “helican” are “belly can” and “the hell can” bent to fit the shape of “pelican.” It is a rhyme so determined that it rebuilds the English language around one bird, and the wrenched spelling is the entire point of reading it aloud.',
        hard: [
          { w: 'pelican', say: 'PEL-i-kun', def: 'a large water bird with a pouch under its beak' },
          { w: 'capacious', say: 'kuh-PAY-shuss', def: 'able to hold a great deal' },
          { w: 'gullet', say: 'GUL-it', def: 'the throat passage food travels down' }
        ]
      },
      {
        t: 'There was a young lady of Niger',
        th: 'forest', a: 'Cosmo Monkhouse (1840–1901)', src: 'Traditional', y: '1891', kind: 'limerick',
        lines: [
          'There was a young lady of Niger',
          'Who smiled as she rode on a tiger;',
          'They returned from the ride',
          'With the lady inside,',
          'And the smile on the face of the tiger.'
        ],
        note: 'The last line is a single image doing all the work: the smile has changed owners, and the poem reports it as calmly as a passenger list. Notice that “returned” in line three is technically true — they did come back — which is why the rhyme lands as a shock rather than a description.',
        hard: [
          { w: 'ferocious', say: 'fuh-ROH-shuss', def: 'fierce and dangerous' },
          { w: 'feline', say: 'FEE-lyne', def: 'having to do with cats' },
          { w: 'irony', say: 'EYE-ruh-nee', def: 'when the outcome is the opposite of what was expected' }
        ]
      },
      {
        t: 'There once was a man from Peru',
        th: 'night', a: 'Anonymous', src: 'Traditional', y: 'traditional', kind: 'limerick',
        lines: [
          'There once was a man from Peru',
          'Who dreamed he was eating his shoe.',
          'He awoke in the night',
          'With a terrible fright',
          'And found out that it was quite true.'
        ],
        note: 'The whole poem is a trapdoor in the last four words. Lines one to four set up an ordinary nightmare, and “it was quite true” retroactively moves the shoe out of the dream and into the mouth — the tense never changes, only the status of the facts.',
        hard: [
          { w: 'fright', say: 'FRYTE', def: 'a sudden feeling of fear' },
          { w: 'nightmare', say: 'NYTE-mair', def: 'a frightening dream' },
          { w: 'literal', say: 'LIT-ur-ul', def: 'true in the plainest, most exact sense' }
        ]
      },
      {
        t: 'There was a young lady named Bright',
        th: 'night', a: 'A. H. Reginald Buller (1874–1944)', src: 'Punch', y: '1923', kind: 'limerick',
        lines: [
          'There was a young lady named Bright,',
          'Whose speed was far faster than light;',
          'She set out one day',
          'In a relative way,',
          'And returned on the previous night.'
        ],
        note: 'A physics lecture folded into five lines: the pun sits on “in a relative way,” which is both a casual phrase and a direct nod to Einstein, and the punchline is a time paradox delivered with the shrug of a train timetable. The rhyme Bright / light / night quietly runs the argument, because the joke needs light and night in the same sound.',
        hard: [
          { w: 'relativity', say: 'rel-uh-TIV-i-tee', def: 'Einstein’s theory about how time and speed are linked' },
          { w: 'velocity', say: 'vuh-LOSS-i-tee', def: 'speed in a particular direction' },
          { w: 'paradox', say: 'PAIR-uh-doks', def: 'a statement that contradicts itself yet seems true' }
        ]
      },
      {
        t: 'There was a young lady of Lynn',
        th: 'water', a: 'Anonymous', src: 'Traditional', y: 'traditional', kind: 'limerick',
        lines: [
          'There was a young lady of Lynn',
          'Who was so uncommonly thin',
          'That when she essayed',
          'To drink lemonade,',
          'She slipped through the straw and fell in.'
        ],
        note: 'The rhyme word “in” is held back for four lines and then arrives in the worst possible position — inside the glass. The scale reverses without warning: the straw stops being a tool and becomes a chute, and the poem is over before you can object to the physics.',
        hard: [
          { w: 'essayed', say: 'eh-SAYD', def: 'attempted or tried, in an old-fashioned sense' },
          { w: 'uncommonly', say: 'un-KOM-un-lee', def: 'unusually; more than is normal' },
          { w: 'lemonade', say: 'lem-uh-NAYD', def: 'a drink made from lemons, sugar and water' }
        ]
      },
      {
        t: 'A canner, exceedingly canny',
        th: 'fire', a: 'Anonymous', src: 'Traditional', y: 'traditional', kind: 'limerick',
        lines: [
          'A canner, exceedingly canny,',
          'One morning remarked to his granny,',
          '“A canner can can',
          'Anything that he can,',
          'But a canner can’t can a can, can he?”'
        ],
        note: 'One syllable, “can,” is used as a job, a verb, a permission word and a metal tin, all inside two short lines — nine times in the last three lines, and the meaning shifts on almost every repetition. The overlong final line is deliberate: it crams in an extra “can he?” so the tongue trips exactly where the sense does.',
        hard: [
          { w: 'canny', say: 'KAN-ee', def: 'clever and quick to spot an advantage' },
          { w: 'exceedingly', say: 'ek-SEE-ding-lee', def: 'extremely; to a very great degree' },
          { w: 'preserve', say: 'pri-ZURV', def: 'to treat food so it keeps without spoiling' }
        ]
      }
    ]
  },

  /* =============== IV. POEMS WORTH KNOWING BY HEART =============== */
  byheart: {
    title: 'Poems worth knowing by heart',
    blurb: 'Learning a poem by heart is not showing off. It is the only way to own one — to have it available at three in the morning when there is no book. Every poem here is short enough to learn in a week.',
    pieces: [
      {
        t: 'The Road Not Taken',
        th: 'road', a: 'Robert Frost (1874–1963)', src: 'Mountain Interval', y: '1916', kind: 'poem',
        lines: [
          'Two roads diverged in a yellow wood,',
          'And sorry I could not travel both',
          'And be one traveler, long I stood',
          'And looked down one as far as I could',
          'To where it bent in the undergrowth;',
          '',
          'Then took the other, as just as fair,',
          'And having perhaps the better claim,',
          'Because it was grassy and wanted wear;',
          'Though as for that the passing there',
          'Had worn them really about the same,',
          '',
          'And both that morning equally lay',
          'In leaves no step had trodden black.',
          'Oh, I kept the first for another day!',
          'Yet knowing how way leads on to way,',
          'I doubted if I should ever come back.',
          '',
          'I shall be telling this with a sigh',
          'Somewhere ages and ages hence:',
          'Two roads diverged in a wood, and I—',
          'I took the one less traveled by,',
          'And that has made all the difference.'
        ],
        note: 'Almost universally misread. Frost says twice that the two roads were worn "about the same" — the poem is about the story we will tell later, "with a sigh", not about a brave choice. The sigh is the whole joke, and it is a sad one.',
        hard: [
          { w: 'diverged', say: 'dih-VERJD', def: 'separated and went in different directions' },
          { w: 'undergrowth', say: 'UN-der-grohth', def: 'dense low plants growing beneath trees' },
          { w: 'trodden', say: 'TROD-uhn', def: 'walked on; trampled' }
        ]
      },
      {
        t: 'Stopping by Woods on a Snowy Evening',
        th: 'snow', a: 'Robert Frost (1874–1963)', src: 'New Hampshire', y: '1923', kind: 'poem',
        lines: [
          'Whose woods these are I think I know.',
          'His house is in the village though;',
          'He will not see me stopping here',
          'To watch his woods fill up with snow.',
          '',
          'My little horse must think it queer',
          'To stop without a farmhouse near',
          'Between the woods and frozen lake',
          'The darkest evening of the year.',
          '',
          'He gives his harness bells a shake',
          'To ask if there is some mistake.',
          'The only other sound’s the sweep',
          'Of easy wind and downy flake.',
          '',
          'The woods are lovely, dark and deep,',
          'But I have promises to keep,',
          'And miles to go before I sleep,',
          'And miles to go before I sleep.'
        ],
        note: 'Look at the rhymes: each stanza’s odd line out becomes the next stanza’s rhyme, chaining the poem forward — until the last stanza, which rhymes all four and stops the chain. The repeated last line is the poem shutting its own door.',
        hard: [
          { w: 'harness', say: 'HAR-niss', def: 'the straps by which an animal is fastened to a cart' },
          { w: 'downy', say: 'DOW-nee', def: 'soft and fluffy, like fine feathers' }
        ]
      },
      {
        t: 'Invictus',
        th: 'night', a: 'William Ernest Henley (1849–1903)', src: 'Book of Verses', y: '1888', kind: 'poem',
        lines: [
          'Out of the night that covers me,',
          '   Black as the pit from pole to pole,',
          'I thank whatever gods may be',
          '   For my unconquerable soul.',
          '',
          'In the fell clutch of circumstance',
          '   I have not winced nor cried aloud.',
          'Under the bludgeonings of chance',
          '   My head is bloody, but unbowed.',
          '',
          'Beyond this place of wrath and tears',
          '   Looms but the Horror of the shade,',
          'And yet the menace of the years',
          '   Finds and shall find me unafraid.',
          '',
          'It matters not how strait the gate,',
          '   How charged with punishments the scroll,',
          'I am the master of my fate,',
          '   I am the captain of my soul.'
        ],
        note: 'Henley wrote it from a hospital bed; he had lost a leg to tuberculosis at seventeen and was fighting to keep the other. "Invictus" is Latin for unconquered. Nothing in it is metaphorical.',
        hard: [
          { w: 'unconquerable', say: 'un-KONG-ker-uh-buhl', def: 'impossible to defeat or overcome' },
          { w: 'bludgeonings', say: 'BLUJ-uhn-ingz', def: 'heavy repeated blows' },
          { w: 'menace', say: 'MEN-iss', def: 'a threatening quality or person' },
          { w: 'strait', say: 'STRAYT', def: 'narrow; tight' }
        ]
      },
      {
        t: 'If—',
        th: 'mountain', a: 'Rudyard Kipling (1865–1936)', src: 'Rewards and Fairies', y: '1910', kind: 'poem',
        lines: [
          'If you can keep your head when all about you',
          '   Are losing theirs and blaming it on you,',
          'If you can trust yourself when all men doubt you,',
          '   But make allowance for their doubting too;',
          'If you can wait and not be tired by waiting,',
          '   Or being lied about, don’t deal in lies,',
          'Or being hated, don’t give way to hating,',
          '   And yet don’t look too good, nor talk too wise:',
          '',
          'If you can dream—and not make dreams your master;',
          '   If you can think—and not make thoughts your aim;',
          'If you can meet with Triumph and Disaster',
          '   And treat those two impostors just the same;',
          '',
          'If you can fill the unforgiving minute',
          '   With sixty seconds’ worth of distance run,',
          'Yours is the Earth and everything that’s in it,',
          '   And—which is more—you’ll be a Man, my son!'
        ],
        note: 'One sentence. The whole poem is a single suspended "if" that does not reach its main clause until the last two lines, thirty-odd lines later — which is why reading it aloud is genuinely difficult, and why it works.',
        hard: [
          { w: 'allowance', say: 'uh-LOW-uhnss', def: 'an amount permitted; a making of room for' },
          { w: 'impostors', say: 'im-POSS-terz', def: 'people who pretend to be what they are not' },
          { w: 'unforgiving', say: 'un-fer-GIV-ing', def: 'not allowing for mistakes or weakness' }
        ]
      },
      {
        t: 'The Tyger',
        th: 'fire', a: 'William Blake (1757–1827)', src: 'Songs of Experience', y: '1794', kind: 'poem',
        lines: [
          'Tyger Tyger, burning bright,',
          'In the forests of the night;',
          'What immortal hand or eye,',
          'Could frame thy fearful symmetry?',
          '',
          'In what distant deeps or skies.',
          'Burnt the fire of thine eyes?',
          'On what wings dare he aspire?',
          'What the hand, dare seize the fire?',
          '',
          'And what shoulder, & what art,',
          'Could twist the sinews of thy heart?',
          'And when thy heart began to beat,',
          'What dread hand? & what dread feet?',
          '',
          'What the hammer? what the chain,',
          'In what furnace was thy brain?',
          'What the anvil? what dread grasp,',
          'Dare its deadly terrors clasp!',
          '',
          'When the stars threw down their spears',
          'And water’d heaven with their tears:',
          'Did he smile his work to see?',
          'Did he who made the Lamb make thee?',
          '',
          'Tyger Tyger burning bright,',
          'In the forests of the night:',
          'What immortal hand or eye,',
          'Dare frame thy fearful symmetry?'
        ],
        note: 'Fourteen questions and not one answer. Note the single word Blake changes in the last stanza: "Could" becomes "Dare". Having looked at the tiger for six stanzas he no longer doubts that it was possible, only that anyone would risk it. Blake’s own spelling is kept.',
        hard: [
          { w: 'symmetry', say: 'SIM-uh-tree', def: 'balanced proportion between the parts of a thing' },
          { w: 'immortal', say: 'ih-MOR-tuhl', def: 'living forever; deathless' },
          { w: 'sinews', say: 'SIN-yooz', def: 'tough cords joining muscle to bone' },
          { w: 'furnace', say: 'FUR-niss', def: 'an enclosed chamber for producing intense heat' },
          { w: 'anvil', say: 'AN-vil', def: 'an iron block on which metal is hammered' }
        ]
      },
      {
        t: '"Hope" is the thing with feathers',
        th: 'bird', a: 'Emily Dickinson (1830–1886)', src: 'Poems', y: 'c. 1861', kind: 'poem',
        lines: [
          '"Hope" is the thing with feathers -',
          'That perches in the soul -',
          'And sings the tune without the words -',
          'And never stops - at all -',
          '',
          'And sweetest - in the Gale - is heard -',
          'And sore must be the storm -',
          'That could abash the little Bird',
          'That kept so many warm -',
          '',
          'I’ve heard it in the chillest land -',
          'And on the strangest Sea -',
          'Yet - never - in Extremity,',
          'It asked a crumb - of me.'
        ],
        note: 'Dickinson’s dashes are not decoration — they are where she breathes, and where she refuses to close a thought. Keep them when you copy the poem out. The bird is never named as hope after the first line; it simply becomes a bird.',
        hard: [
          { w: 'abash', say: 'uh-BASH', def: 'to make someone feel embarrassed or ashamed' },
          { w: 'extremity', say: 'ik-STREM-ih-tee', def: 'a condition of extreme need or danger' },
          { w: 'perches', say: 'PUR-chiz', def: 'sits or rests on something, as a bird does' }
        ]
      },
      {
        t: 'I Wandered Lonely as a Cloud',
        th: 'flower', a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'poem',
        lines: [
          'I wandered lonely as a cloud',
          'That floats on high o’er vales and hills,',
          'When all at once I saw a crowd,',
          'A host, of golden daffodils;',
          'Beside the lake, beneath the trees,',
          'Fluttering and dancing in the breeze.',
          '',
          'Continuous as the stars that shine',
          'And twinkle on the milky way,',
          'They stretched in never-ending line',
          'Along the margin of a bay:',
          'Ten thousand saw I at a glance,',
          'Tossing their heads in sprightly dance.',
          '',
          'The waves beside them danced; but they',
          'Out-did the sparkling waves in glee:',
          'A poet could not but be gay,',
          'In such a jocund company:',
          'I gazed—and gazed—but little thought',
          'What wealth the show to me had brought:',
          '',
          'For oft, when on my couch I lie',
          'In vacant or in pensive mood,',
          'They flash upon that inward eye',
          'Which is the bliss of solitude;',
          'And then my heart with pleasure fills,',
          'And dances with the daffodils.'
        ],
        note: 'The point is the last stanza, not the flowers. The poem is about memory — about the fact that he did not know at the time what he was being given. "I gazed—and gazed—but little thought."',
        hard: [
          { w: 'jocund', say: 'JOK-uhnd', def: 'cheerful and light-hearted' },
          { w: 'sprightly', say: 'SPRYTE-lee', def: 'lively; full of energy' },
          { w: 'pensive', say: 'PEN-siv', def: 'thoughtful, often with a touch of sadness' },
          { w: 'solitude', say: 'SOL-ih-tood', def: 'the state of being alone' },
          { w: 'daffodils', say: 'DAF-uh-dilz', def: 'yellow spring flowers with a trumpet-shaped centre' }
        ]
      },
      {
        t: 'Dreams',
        th: 'bird', a: 'Langston Hughes (1901–1967)', src: 'The Weary Blues era', y: '1922', kind: 'poem',
        lines: [
          'Hold fast to dreams',
          'For if dreams die',
          'Life is a broken-winged bird',
          'That cannot fly.',
          '',
          'Hold fast to dreams',
          'For when dreams go',
          'Life is a barren field',
          'Frozen with snow.'
        ],
        note: 'Eight lines, two images, and the second is worse than the first — a bird that cannot fly is still alive; a frozen field is not. Hughes builds the whole poem on that one step down.',
        hard: [
          { w: 'barren', say: 'BAIR-uhn', def: 'producing no vegetation; bleak and empty' }
        ]
      },
      {
        t: 'The Lake Isle of Innisfree',
        th: 'water', a: 'W. B. Yeats (1865–1939)', src: 'The Rose', y: '1893', kind: 'poem',
        lines: [
          'I will arise and go now, and go to Innisfree,',
          'And a small cabin build there, of clay and wattles made;',
          'Nine bean-rows will I have there, a hive for the honey-bee,',
          'And live alone in the bee-loud glade.',
          '',
          'And I shall have some peace there, for peace comes dropping slow,',
          'Dropping from the veils of the morning to where the cricket sings;',
          'There midnight’s all a glimmer, and noon a purple glow,',
          'And evening full of the linnet’s wings.',
          '',
          'I will arise and go now, for always night and day',
          'I hear lake water lapping with low sounds by the shore;',
          'While I stand on the roadway, or on the pavements grey,',
          'I hear it in the deep heart’s core.'
        ],
        note: 'Written in London, homesick, after hearing a shop-window fountain. "The bee-loud glade" is one of the best compound words in English, and this book owes it a mention.',
        hard: [
          { w: 'wattles', say: 'WOT-uhlz', def: 'woven rods and branches used to build walls' },
          { w: 'glade', say: 'GLAYD', def: 'an open space in a wood' },
          { w: 'linnet', say: 'LIN-it', def: 'a small brown-and-grey finch' }
        ]
      },
      {
        t: 'Remember',
        th: 'night', a: 'Christina Rossetti (1830–1894)', src: 'Goblin Market and Other Poems', y: '1862', kind: 'sonnet',
        lines: [
          'Remember me when I am gone away,',
          '   Gone far away into the silent land;',
          '   When you can no more hold me by the hand,',
          'Nor I half turn to go yet turning stay.',
          'Remember me when no more day by day',
          '   You tell me of our future that you plann’d:',
          '   Only remember me; you understand',
          'It will be late to counsel then or pray.',
          'Yet if you should forget me for a while',
          '   And afterwards remember, do not grieve:',
          '   For if the darkness and corruption leave',
          '   A vestige of the thoughts that once I had,',
          'Better by far you should forget and smile',
          '   Than that you should remember and be sad.'
        ],
        note: 'Eight lines asking to be remembered, and then the turn takes it all back. Rossetti was nineteen. The generosity of the last two lines is the hardest thing in the poem to write and she makes it look easy.',
        hard: [
          { w: 'counsel', say: 'KOWN-suhl', def: 'advice; to give advice' },
          { w: 'corruption', say: 'kuh-RUP-shuhn', def: 'decay; the process of rotting' },
          { w: 'vestige', say: 'VESS-tij', def: 'a small remaining trace of something' }
        ]
      },
      {
        t: 'O Captain! My Captain!',
        th: 'sea', a: 'Walt Whitman (1819–1892)', src: 'Sequel to Drum-Taps', y: '1865', kind: 'poem',
        lines: [
          'O Captain! my Captain! our fearful trip is done,',
          'The ship has weather’d every rack, the prize we sought is won,',
          'The port is near, the bells I hear, the people all exulting,',
          'While follow eyes the steady keel, the vessel grim and daring;',
          '   But O heart! heart! heart!',
          '      O the bleeding drops of red,',
          '         Where on the deck my Captain lies,',
          '            Fallen cold and dead.'
        ],
        note: 'Whitman wrote it for Lincoln, weeks after the assassination, and hated how popular it became — it is far more conventional than the rest of him. Watch the shape: the lines shorten and step inward until the poem physically falls down the page.',
        hard: [
          { w: 'exulting', say: 'ig-ZULT-ing', def: 'showing great triumphant joy' },
          { w: 'vessel', say: 'VESS-uhl', def: 'a ship or large boat' },
          { w: 'keel', say: 'KEEL', def: 'the ridge along the bottom of a ship’s hull' }
        ]
      },
      {
        t: 'Sea Fever',
        th: 'sea', a: 'John Masefield (1878–1967)', src: 'Salt-Water Ballads', y: '1902', kind: 'poem',
        lines: [
          'I must go down to the seas again, to the lonely sea and the sky,',
          'And all I ask is a tall ship and a star to steer her by,',
          'And the wheel’s kick and the wind’s song and the white sail’s shaking,',
          'And a grey mist on the sea’s face, and a grey dawn breaking.',
          '',
          'I must go down to the seas again, for the call of the running tide',
          'Is a wild call and a clear call that may not be denied;',
          'And all I ask is a windy day with the white clouds flying,',
          'And the flung spray and the blown spume, and the sea-gulls crying.',
          '',
          'I must go down to the seas again, to the vagrant gypsy life,',
          'To the gull’s way and the whale’s way where the wind’s like a whetted knife;',
          'And all I ask is a merry yarn from a laughing fellow-rover,',
          'And quiet sleep and a sweet dream when the long trick’s over.'
        ],
        note: 'Every stanza starts the same and means it more each time — "must" is not "want". Read the list of small things he asks for and notice none of them is a person; the whole poem is a man choosing the sea over company.',
        hard: [
          { w: 'vagrant', say: 'VAY-gruhnt', def: 'wandering, without a fixed home' },
          { w: 'whetted', say: 'WET-id', def: 'sharpened, as a blade on a stone' },
          { w: 'spume', say: 'SPYOOM', def: 'froth or foam on the sea' },
          { w: 'denied', say: 'dih-NIDE', def: 'refused; not allowed to happen' }
        ]
      },
      {
        t: 'The Second Coming',
        th: 'ruin', a: 'W. B. Yeats (1865–1939)', src: 'Michael Robartes and the Dancer', y: '1919', kind: 'poem',
        lines: [
          'Turning and turning in the widening gyre',
          'The falcon cannot hear the falconer;',
          'Things fall apart; the centre cannot hold;',
          'Mere anarchy is loosed upon the world,',
          'The blood-dimmed tide is loosed, and everywhere',
          'The ceremony of innocence is drowned;',
          'The best lack all conviction, while the worst',
          'Are full of passionate intensity.',
          '',
          'Surely some revelation is at hand;',
          'Surely the Second Coming is at hand.',
          'The Second Coming! Hardly are those words out',
          'When a vast image out of Spiritus Mundi',
          'Troubles my sight: somewhere in sands of the desert',
          'A shape with lion body and the head of a man,',
          'A gaze blank and pitiless as the sun,',
          'Is moving its slow thighs, while all about it',
          'Reel shadows of the indignant desert birds.'
        ],
        note: 'Written just after the First World War, and it reads like this morning’s news to every generation since — that is the poem’s whole reputation, and also its warning: a text that fits everything may explain nothing. The falcon spiralling out of the falconer’s call is the picture the rest of the poem works from.',
        hard: [
          { w: 'gyre', say: 'JYRE', def: 'a spiral or vortex; a circular course' },
          { w: 'anarchy', say: 'AN-er-kee', def: 'absence of government or order' },
          { w: 'conviction', say: 'kuhn-VIK-shuhn', def: 'a firm belief' },
          { w: 'revelation', say: 'rev-uh-LAY-shuhn', def: 'a dramatic disclosure of something hidden' },
          { w: 'indignant', say: 'in-DIG-nuhnt', def: 'angry at something unfair' }
        ]
      },
{
        t: 'In Flanders Fields',
        th: 'war', a: 'John McCrae (1872–1918)', src: 'Punch', y: '1915', kind: 'poem',
        lines: [
          'In Flanders fields the poppies blow',
          'Between the crosses, row on row,',
          'That mark our place; and in the sky',
          'The larks, still bravely singing, fly',
          'Scarce heard amid the guns below.',
          '',
          'We are the Dead. Short days ago',
          'We lived, felt dawn, saw sunset glow,',
          'Loved and were loved, and now we lie',
          'In Flanders fields.',
          '',
          'Take up our quarrel with the foe:',
          'To you from failing hands we throw',
          'The torch; be yours to hold it high.',
          'If ye break faith with us who die',
          'We shall not sleep, though poppies grow',
          'In Flanders fields.'
        ],
        note: 'It is a rondeau: fifteen lines on only two rhyme sounds, plus a short refrain lifted from the opening line. Listen for how “In Flanders fields” returns twice as a half-line that breaks the meter — the tetrameter stops short, and the silence after it is the poem’s grave. Notice too that the speaker changes hands: the dead address the living only in the last stanza, turning a landscape description into a demand.',
        hard: [
          { w: 'poppies', say: 'POP-eez', def: 'red field flowers that grew over the graves' },
          { w: 'scarce', say: 'SKAIRSS', def: 'barely, hardly at all' },
          { w: 'quarrel', say: 'KWOR-uhl', def: 'a fight or dispute' },
          { w: 'foe', say: 'FOH', def: 'an enemy' }
        ]
      },
      {
        t: 'She Walks in Beauty',
        th: 'night', a: 'Lord Byron (1788–1824)', src: 'Hebrew Melodies', y: '1815', kind: 'poem',
        lines: [
          'She walks in beauty, like the night',
          'Of cloudless climes and starry skies;',
          'And all that’s best of dark and bright',
          'Meet in her aspect and her eyes;',
          'Thus mellowed to that tender light',
          'Which heaven to gaudy day denies.',
          '',
          'One shade the more, one ray the less,',
          'Had half impaired the nameless grace',
          'Which waves in every raven tress,',
          'Or softly lightens o’er her face;',
          'Where thoughts serenely sweet express,',
          'How pure, how dear their dwelling-place.',
          '',
          'And on that cheek, and o’er that brow,',
          'So soft, so calm, yet eloquent,',
          'The smiles that win, the tints that glow,',
          'But tell of days in goodness spent,',
          'A mind at peace with all below,',
          'A heart whose love is innocent!'
        ],
        note: 'Three six-line stanzas of iambic tetrameter rhyming ababab — a scheme so tight it keeps braiding dark and light back together, which is the poem’s whole argument. Listen for the balancing act in “One shade the more, one ray the less”: the line is built as a scale that would tip if you touched it. The praise also migrates, moving from surface (skies, tress, cheek) inward to mind and heart by the final couplet.',
        hard: [
          { w: 'climes', say: 'KLYMES', def: 'regions, considered by their weather' },
          { w: 'gaudy', say: 'GAW-dee', def: 'showy in a cheap, glaring way' },
          { w: 'tress', say: 'TRESS', def: 'a lock or braid of hair' },
          { w: 'serenely', say: 'suh-REEN-lee', def: 'calmly and untroubled' },
          { w: 'eloquent', say: 'EL-uh-kwent', def: 'expressive; speaking without words' }
        ]
      },
      {
        t: 'Loveliest of trees, the cherry now',
        th: 'flower', a: 'A. E. Housman (1859–1936)', src: 'A Shropshire Lad', y: '1896', kind: 'poem',
        lines: [
          'Loveliest of trees, the cherry now',
          'Is hung with bloom along the bough,',
          'And stands about the woodland ride',
          'Wearing white for Eastertide.',
          '',
          'Now, of my threescore years and ten,',
          'Twenty will not come again,',
          'And take from seventy springs a score,',
          'It only leaves me fifty more.',
          '',
          'And since to look at things in bloom',
          'Fifty springs are little room,',
          'About the woodlands I will go',
          'To see the cherry hung with snow.'
        ],
        note: 'Three quatrains in rhymed couplets, and the middle one is pure arithmetic — seventy minus twenty leaves fifty — which is a strange, cold thing to do inside a spring poem, and exactly the point. Listen for the turn in the last line: “hung with snow” repeats the earlier “hung with bloom,” so the blossom and the winter become one image, and the boy walking out to look at trees is really counting.',
        hard: [
          { w: 'bough', say: 'BOW', def: 'a main branch of a tree' },
          { w: 'Eastertide', say: 'EE-ster-tyde', def: 'the Easter season' },
          { w: 'threescore', say: 'THREE-skor', def: 'sixty' },
          { w: 'score', say: 'SKOR', def: 'a group of twenty' }
        ]
      },
      {
        t: 'When I was one-and-twenty',
        th: 'road', a: 'A. E. Housman (1859–1936)', src: 'A Shropshire Lad', y: '1896', kind: 'poem',
        lines: [
          'When I was one-and-twenty',
          'I heard a wise man say,',
          '“Give crowns and pounds and guineas',
          'But not your heart away;',
          'Give pearls away and rubies',
          'But keep your fancy free.”',
          'But I was one-and-twenty,',
          'No use to talk to me.',
          '',
          'When I was one-and-twenty',
          'I heard him say again,',
          '“The heart out of the bosom',
          'Was never given in vain;',
          '’Tis paid with sighs a plenty',
          'And sold for endless rue.”',
          'And I am two-and-twenty,',
          'And oh, ’tis true, ’tis true.'
        ],
        note: 'Two matched eight-line stanzas in ballad measure, and the second is a near-copy of the first — the repetition is the joke, because the speaker had to hear it twice and live it once. Listen for the single year that separates the stanzas: “one-and-twenty” becomes “two-and-twenty,” and the whole education fits in that gap. The last line drops the argument entirely and just repeats “’tis true,” which is what being wrong sounds like.',
        hard: [
          { w: 'guineas', say: 'GHIN-eez', def: 'old British gold coins' },
          { w: 'fancy', say: 'FAN-see', def: 'affection or romantic liking' },
          { w: 'bosom', say: 'BUUZ-uhm', def: 'the breast, as the seat of feeling' },
          { w: 'vain', say: 'VAYN', def: 'without result or purpose' },
          { w: 'rue', say: 'ROO', def: 'bitter regret' }
        ]
      },
      {
        t: 'The Owl and the Pussy-cat',
        th: 'sea', a: 'Edward Lear (1812–1888)', src: 'Nonsense Songs', y: '1871', kind: 'poem',
        lines: [
          'The Owl and the Pussy-cat went to sea',
          'In a beautiful pea-green boat,',
          'They took some honey, and plenty of money,',
          'Wrapped up in a five-pound note.',
          'The Owl looked up to the stars above,',
          'And sang to a small guitar,',
          '“O lovely Pussy! O Pussy, my love,',
          'What a beautiful Pussy you are,',
          'You are,',
          'You are!',
          'What a beautiful Pussy you are!”',
          '',
          'Pussy said to the Owl, “You elegant fowl!',
          'How charmingly sweet you sing!',
          'O let us be married! too long we have tarried:',
          'But what shall we do for a ring?”',
          'They sailed away, for a year and a day,',
          'To the land where the Bong-Tree grows',
          'And there in a wood a Piggy-wig stood',
          'With a ring at the end of his nose,',
          'His nose,',
          'His nose,',
          'With a ring at the end of his nose.',
          '',
          '“Dear Pig, are you willing to sell for one shilling',
          'Your ring?” Said the Piggy, “I will.”',
          'So they took it away, and were married next day',
          'By the Turkey who lives on the hill.',
          'They dined on mince, and slices of quince,',
          'Which they ate with a runcible spoon;',
          'And hand in hand, on the edge of the sand,',
          'They danced by the light of the moon,',
          'The moon,',
          'The moon,',
          'They danced by the light of the moon.'
        ],
        note: 'Lear runs internal rhyme through the long lines — “plenty of money,” “elegant fowl,” “mince, and slices of quince” — so each stanza gallops until the three-word tag lines (“You are, / You are!”) stop it dead, like a chorus catching its breath. The famous word “runcible” is Lear’s own invention, meaning nothing at all; he never defined it and used it later for hats, walls, and geese. Note also the plot: this nonsense poem has a complete courtship, purchase, and wedding in thirty-three lines.',
        hard: [
          { w: 'tarried', say: 'TA-reed', def: 'delayed or waited around' },
          { w: 'shilling', say: 'SHIL-ing', def: 'an old British coin' },
          { w: 'mince', say: 'MINSS', def: 'finely chopped meat or fruit' },
          { w: 'quince', say: 'KWINSS', def: 'a hard yellow pear-like fruit' },
          { w: 'runcible', say: 'RUN-sih-buhl', def: 'a nonsense word Lear made up' }
        ]
      },
{
        t: 'Jabberwocky',
        th: 'forest', a: 'Lewis Carroll (1832–1898)', src: 'Through the Looking-Glass', y: '1871', kind: 'poem',
        lines: [
          '’Twas brillig, and the slithy toves',
          'Did gyre and gimble in the wabe:',
          'All mimsy were the borogoves,',
          'And the mome raths outgrabe.',
          '',
          '“Beware the Jabberwock, my son!',
          'The jaws that bite, the claws that catch!',
          'Beware the Jubjub bird, and shun',
          'The frumious Bandersnatch!”',
          '',
          'He took his vorpal sword in hand;',
          'Long time the manxome foe he sought—',
          'So rested he by the Tumtum tree,',
          'And stood awhile in thought.',
          '',
          'And, as in uffish thought he stood,',
          'The Jabberwock, with eyes of flame,',
          'Came whiffling through the tulgey wood,',
          'And burbled as it came!',
          '',
          'One, two! One, two! And through and through',
          'The vorpal blade went snicker-snack!',
          'He left it dead, and with its head',
          'He went galumphing back.',
          '',
          '“And hast thou slain the Jabberwock?',
          'Come to my arms, my beamish boy!',
          'O frabjous day! Callooh! Callay!”',
          'He chortled in his joy.',
          '',
          '’Twas brillig, and the slithy toves',
          'Did gyre and gimble in the wabe:',
          'All mimsy were the borogoves,',
          'And the mome raths outgrabe.'
        ],
        note: 'Listen for how the nonsense words sit in perfectly ordinary English grammar — the ballad quatrains keep a steady 8-6-8-6 beat and the syntax tells you exactly which invented word is a noun, a verb, an adjective, so the story stays legible even when the vocabulary does not. Two of Carroll’s coinages, chortle and galumph, worked so well they left the poem and entered real dictionaries. The frame stanza returns unchanged at the end, so the whole slaying is bracketed like a story told and closed.',
        hard: [
          { w: 'frumious', say: 'FROO-mee-us', def: 'Carroll’s blend of fuming and furious' },
          { w: 'vorpal', say: 'VOR-pul', def: 'deadly sharp; a coined word for a keen blade' },
          { w: 'uffish', say: 'UFF-ish', def: 'gruff and huffy in mood, by Carroll’s account' },
          { w: 'galumphing', say: 'guh-LUM-fing', def: 'moving in a clumsy triumphant gallop' },
          { w: 'chortled', say: 'CHOR-tuld', def: 'laughed with a gleeful snorting chuckle' }
        ]
      },
      {
        t: 'Because I could not stop for Death',
        th: 'road', a: 'Emily Dickinson (1830–1886)', src: 'Poems', y: '1890', kind: 'poem',
        lines: [
          'Because I could not stop for Death —',
          'He kindly stopped for me —',
          'The Carriage held but just Ourselves —',
          'And Immortality.',
          '',
          'We slowly drove — He knew no haste',
          'And I had put away',
          'My labor and my leisure too,',
          'For His Civility —',
          '',
          'We passed the School, where Children strove',
          'At Recess — in the Ring —',
          'We passed the Fields of Gazing Grain —',
          'We passed the Setting Sun —',
          '',
          'Or rather — He passed Us —',
          'The Dews drew quivering and Chill —',
          'For only Gossamer, my Gown —',
          'My Tippet — only Tulle —',
          '',
          'We paused before a House that seemed',
          'A Swelling of the Ground —',
          'The Roof was scarcely visible —',
          'The Cornice — in the Ground —',
          '',
          'Since then — ’tis Centuries — and yet',
          'Feels shorter than the Day',
          'I first surmised the Horses’ Heads',
          'Were toward Eternity —'
        ],
        note: 'Listen for the courtship manners applied to a funeral: Death is a punctual gentleman caller and the speaker is merely too busy to keep the appointment herself. The third stanza runs a whole life past the window in one anaphora — School, Grain, Setting Sun — and then the fourth stanza reverses it in a single half-line correction, “Or rather — He passed Us —,” the hinge on which the ride stops being a ride and becomes being left behind. The last stanza collapses centuries into something shorter than one day, and the sentence never lands on a period, only a dash.',
        hard: [
          { w: 'gossamer', say: 'GOSS-uh-mer', def: 'a filmy cobweb-light fabric' },
          { w: 'tippet', say: 'TIP-it', def: 'a short shoulder cape or scarf' },
          { w: 'tulle', say: 'TOOL', def: 'a fine stiff netting used for veils' },
          { w: 'cornice', say: 'KOR-nis', def: 'the molded ledge crowning a building' },
          { w: 'surmised', say: 'sur-MIZED', def: 'guessed from slight evidence' }
        ]
      },
      {
        t: 'I’m Nobody! Who are you?',
        th: 'stage', a: 'Emily Dickinson (1830–1886)', src: 'Poems', y: '1891', kind: 'poem',
        lines: [
          'I’m Nobody! Who are you?',
          'Are you — Nobody — too?',
          'Then there’s a pair of us!',
          'Don’t tell! they’d advertise — you know!',
          '',
          'How dreary — to be — Somebody!',
          'How public — like a Frog —',
          'To tell one’s name — the livelong June —',
          'To an admiring Bog!'
        ],
        note: 'Listen for the conspiracy: the poem opens by addressing you directly, drops its voice to a whisper at “Don’t tell!,” and makes the reader the second nobody in the pair. The turn comes with the frog simile, which converts fame into mere croaking — and note that a bog only admires because it has no choice but to sit there and hear. The dashes work as breath-catches, isolating “to be” and “Somebody” so the word arrives with a little sneer.',
        hard: [
          { w: 'dreary', say: 'DREER-ee', def: 'dull and dismally cheerless' },
          { w: 'advertise', say: 'AD-ver-tize', def: 'to announce publicly, to spread the news' },
          { w: 'livelong', say: 'LIV-lawng', def: 'whole and tediously entire, as of a day' },
          { w: 'bog', say: 'BAWG', def: 'wet spongy ground; a marsh' }
        ]
      },
      {
        t: 'Success is counted sweetest',
        th: 'war', a: 'Emily Dickinson (1830–1886)', src: 'A Masque of Poets', y: '1878', kind: 'poem',
        lines: [
          'Success is counted sweetest',
          'By those who ne’er succeed.',
          'To comprehend a nectar',
          'Requires sorest need.',
          '',
          'Not one of all the purple Host',
          'Who took the Flag today',
          'Can tell the definition',
          'So clear of victory',
          '',
          'As he defeated — dying —',
          'On whose forbidden ear',
          'The distant strains of triumph',
          'Burst agonized and clear!'
        ],
        note: 'Listen for how the poem argues rather than describes: the first stanza states a paradox as if it were arithmetic, the second builds a long suspended comparison — not one of the victors can define victory — and the third finally delivers the “As” clause that has been waiting since line five. The sound follows the sense: the winners get flat abstractions (definition, victory) while the dying man gets the only sensory detail in the poem, distant strains bursting on an ear that is forbidden them. Note that the poem never names a war; the purple Host and the Flag are enough.',
        hard: [
          { w: 'nectar', say: 'NEK-ter', def: 'a sweet fluid; the drink of the gods' },
          { w: 'sorest', say: 'SOR-est', def: 'most severe or painfully urgent' },
          { w: 'host', say: 'HOHST', def: 'a large assembled army' },
          { w: 'strains', say: 'STRAYNZ', def: 'passages of music carried on the air' },
          { w: 'agonized', say: 'AG-uh-nized', def: 'wrung with anguish' }
        ]
      },
      {
        t: 'A Bird, came down the Walk',
        th: 'bird', a: 'Emily Dickinson (1830–1886)', src: 'Poems', y: '1891', kind: 'poem',
        lines: [
          'A Bird, came down the Walk —',
          'He did not know I saw —',
          'He bit an Angle Worm in halves',
          'And ate the fellow, raw,',
          '',
          'And then, he drank a Dew',
          'From a convenient Grass —',
          'And then hopped sidewise to the Wall',
          'To let a Beetle pass —',
          '',
          'He glanced with rapid eyes,',
          'That hurried all abroad —',
          'They looked like frightened Beads, I thought,',
          'He stirred his Velvet Head. —',
          '',
          'Like one in danger, Cautious,',
          'I offered him a Crumb,',
          'And he unrolled his feathers,',
          'And rowed him softer Home —',
          '',
          'Than Oars divide the Ocean,',
          'Too silver for a seam,',
          'Or Butterflies, off Banks of Noon,',
          'Leap, plashless as they swim.'
        ],
        note: 'Listen for the poem changing register mid-flight. The first three stanzas are clipped, jerky reportage in short hymn-meter lines — bit, ate, drank, hopped, glanced — the syntax as twitchy as the bird. Then the offered crumb breaks the spell and the last two stanzas run over the stanza break in one long unbroken sentence, the meter smoothing out into oars, ocean, butterflies, until the final word plashless takes even the sound away. The comparison escapes the poem: the bird flies off and the language is still swimming.',
        hard: [
          { w: 'convenient', say: 'kun-VEEN-yunt', def: 'near at hand and handy for the purpose' },
          { w: 'sidewise', say: 'SIDE-wize', def: 'toward or along one side' },
          { w: 'abroad', say: 'uh-BRAWD', def: 'widely about, in all directions' },
          { w: 'plashless', say: 'PLASH-less', def: 'without any splash or sound of water' }
        ]
      }
    ]
  },

  /* =============== V. THE LONG QUOTE IN PROSE =============== */
  prose: {
    title: 'The long quote',
    blurb: 'Not every sentence worth learning is in a poem. These are the paragraphs — the openings and the addresses — that people carry around whole, and every one of them is built like a piece of music.',
    pieces: [
      {
        t: 'The Gettysburg Address',
        th: 'war', a: 'Abraham Lincoln (1809–1865)', src: 'Soldiers’ National Cemetery, Pennsylvania', y: '19 November 1863', kind: 'prose',
        lines: [
          'Four score and seven years ago our fathers brought forth on this',
          'continent, a new nation, conceived in Liberty, and dedicated to the',
          'proposition that all men are created equal.',
          '',
          'Now we are engaged in a great civil war, testing whether that nation,',
          'or any nation so conceived and so dedicated, can long endure. We are',
          'met on a great battle-field of that war. We have come to dedicate a',
          'portion of that field, as a final resting place for those who here',
          'gave their lives that that nation might live. It is altogether',
          'fitting and proper that we should do this.',
          '',
          'But, in a larger sense, we can not dedicate—we can not consecrate—we',
          'can not hallow—this ground. The brave men, living and dead, who',
          'struggled here, have consecrated it, far above our poor power to add',
          'or detract. The world will little note, nor long remember what we say',
          'here, but it can never forget what they did here.',
          '',
          'It is for us the living, rather, to be dedicated here to the',
          'unfinished work which they who fought here have thus far so nobly',
          'advanced. It is rather for us to be here dedicated to the great task',
          'remaining before us—that from these honored dead we take increased',
          'devotion to that cause for which they gave the last full measure of',
          'devotion—that we here highly resolve that these dead shall not have',
          'died in vain—that this nation, under God, shall have a new birth of',
          'freedom—and that government of the people, by the people, for the',
          'people, shall not perish from the earth.'
        ],
        note: 'Two hundred and seventy-two words, delivered in about two minutes, after a two-hour speech nobody remembers. Count the triples: dedicate / consecrate / hallow, and of / by / for. The one prediction in it — "the world will little note, nor long remember what we say here" — is the only thing in the speech that turned out to be wrong.',
        hard: [
          { w: 'consecrate', say: 'KON-sih-krayt', def: 'to make or declare sacred' },
          { w: 'hallow', say: 'HAL-oh', def: 'to honour as holy' },
          { w: 'proposition', say: 'prop-uh-ZISH-uhn', def: 'a statement put forward for consideration' },
          { w: 'detract', say: 'dih-TRAKT', def: 'to take away from the value of something' },
          { w: 'perish', say: 'PAIR-ish', def: 'to die or be destroyed' }
        ]
      },
      {
        t: 'It was the best of times',
        th: 'city', a: 'Charles Dickens (1812–1870)', src: 'A Tale of Two Cities, opening', y: '1859', kind: 'prose',
        lines: [
          'It was the best of times, it was the worst of times, it was the age of',
          'wisdom, it was the age of foolishness, it was the epoch of belief, it',
          'was the epoch of incredulity, it was the season of Light, it was the',
          'season of Darkness, it was the spring of hope, it was the winter of',
          'despair, we had everything before us, we had nothing before us, we',
          'were all going direct to Heaven, we were all going direct the other',
          'way—in short, the period was so far like the present period, that',
          'some of its noisiest authorities insisted on its being received, for',
          'good or for evil, in the superlative degree of comparison only.'
        ],
        note: 'One sentence, ten opposed pairs, and every pair is joined by a comma where the grammar wants a full stop — which is exactly what makes it feel breathless. Most people can quote the first eleven words and have never met the sting in the last line.',
        hard: [
          { w: 'epoch', say: 'EP-uhk', def: 'a distinct period in history' },
          { w: 'incredulity', say: 'in-krih-DOO-lih-tee', def: 'unwillingness to believe' },
          { w: 'superlative', say: 'soo-PUR-luh-tiv', def: 'of the highest degree; the form of an adjective meaning "most"' }
        ]
      },
      {
        t: 'It is a truth universally acknowledged',
        th: 'city', a: 'Jane Austen (1775–1817)', src: 'Pride and Prejudice, opening', y: '1813', kind: 'prose',
        lines: [
          'It is a truth universally acknowledged, that a single man in',
          'possession of a good fortune, must be in want of a wife.',
          '',
          'However little known the feelings or views of such a man may be on',
          'his first entering a neighbourhood, this truth is so well fixed in',
          'the minds of the surrounding families, that he is considered as the',
          'rightful property of some one or other of their daughters.'
        ],
        note: 'The most famous opening in English is a lie, and the second paragraph tells you so. Nothing is universally acknowledged; what Austen means is that the neighbours have decided. Irony is saying the opposite with a straight face, and this is the model.',
        hard: [
          { w: 'universally', say: 'yoo-nih-VER-suh-lee', def: 'by everyone; in every case' },
          { w: 'acknowledged', say: 'ak-NOL-ijd', def: 'accepted or admitted to be true' },
          { w: 'neighbourhood', say: 'NAY-ber-hood', def: 'a district and the people who live in it' }
        ]
      },
      {
        t: 'Call me Ishmael',
        th: 'sea', a: 'Herman Melville (1819–1891)', src: 'Moby-Dick, opening', y: '1851', kind: 'prose',
        lines: [
          'Call me Ishmael. Some years ago—never mind how long precisely—having',
          'little or no money in my purse, and nothing particular to interest me',
          'on shore, I thought I would sail about a little and see the watery',
          'part of the world. It is a way I have of driving off the spleen and',
          'regulating the circulation. Whenever I find myself growing grim about',
          'the mouth; whenever it is a damp, drizzly November in my soul; whenever',
          'I find myself involuntarily pausing before coffin warehouses, and',
          'bringing up the rear of every funeral I meet; then, I account it high',
          'time to get to sea as soon as I can.'
        ],
        note: 'Three words, and one of them is doing all the work: "Call me" is not "my name is". You are being told what to use, not what is true. Then a single sentence runs for eighty words on the word "whenever" and never once says the word depression.',
        hard: [
          { w: 'precisely', say: 'prih-SYSE-lee', def: 'exactly; with accuracy' },
          { w: 'spleen', say: 'SPLEEN', def: 'bad temper or low spirits (an old sense of the organ’s name)' },
          { w: 'involuntarily', say: 'in-VOL-uhn-tair-uh-lee', def: 'without meaning to; not by choice' },
          { w: 'drizzly', say: 'DRIZ-lee', def: 'raining lightly and steadily' }
        ]
      },
      {
        t: 'I went to the woods',
        th: 'forest', a: 'Henry David Thoreau (1817–1862)', src: 'Walden', y: '1854', kind: 'prose',
        lines: [
          'I went to the woods because I wished to live deliberately, to front',
          'only the essential facts of life, and see if I could not learn what it',
          'had to teach, and not, when I came to die, discover that I had not',
          'lived. I did not wish to live what was not life, living is so dear;',
          'nor did I wish to practise resignation, unless it was quite necessary.',
          'I wanted to live deep and suck out all the marrow of life, to live so',
          'sturdily and Spartan-like as to put to rout all that was not life.'
        ],
        note: '"Deliberately" is the key word and it is not a synonym for slowly — it means on purpose, by choice. "Spartan-like" is an eponym: the Spartans of Laconia, whose plainness gave English both spartan and laconic.',
        hard: [
          { w: 'deliberately', say: 'dih-LIB-er-uht-lee', def: 'on purpose; with careful thought' },
          { w: 'resignation', say: 'rez-ig-NAY-shuhn', def: 'the acceptance of something unpleasant as unavoidable' },
          { w: 'marrow', say: 'MAIR-oh', def: 'the soft substance inside bones; the essential part' },
          { w: 'sturdily', say: 'STUR-dih-lee', def: 'strongly and solidly' }
        ]
      },
      {
        t: 'What to the Slave is the Fourth of July?',
        th: 'city', a: 'Frederick Douglass (1818–1895)', src: 'Rochester, New York', y: '5 July 1852', kind: 'prose',
        lines: [
          'What, to the American slave, is your Fourth of July? I answer: a day that reveals to him, more than all other days in the year, the gross injustice and cruelty to which he is the constant victim. To him, your celebration is a sham; your boasted liberty, an unholy license; your national greatness, swelling vanity; your sounds of rejoicing are empty and heartless; your denunciations of tyrants, brass fronted impudence; your shouts of liberty and equality, hollow mockery; your prayers and hymns, your sermons and thanksgivings, with all your religious parade and solemnity, are, to him, mere bombast, fraud, deception, impiety, and hypocrisy — a thin veil to cover up crimes which would disgrace a nation of savages.',
          'There is not a nation on the earth guilty of practices more shocking and bloody than are the people of these United States at this very hour.'
        ],
        note: 'Douglass was invited to give a Fourth of July address and instead built one long sentence out of the day’s own words — liberty, equality, celebration — and turned each one over to show its other side. He was formerly enslaved himself; every word here had cost him something to learn to write.',
        hard: [
          { w: 'denunciations', say: 'dih-nun-see-AY-shuhnz', def: 'public condemnations of something as wrong' },
          { w: 'impudence', say: 'IM-pyoo-duhnss', def: 'bold disrespect; insolence' },
          { w: 'hypocrisy', say: 'hih-POK-rih-see', def: 'claiming standards one does not actually follow' },
          { w: 'bombast', say: 'BOM-bast', def: 'pompous, inflated language' }
        ]
      },
{
        t: 'Give me liberty, or give me death',
        th: 'war', a: 'Patrick Henry (1736–1799)', src: 'St. John’s Church, Richmond, Virginia', y: '23 March 1775', kind: 'prose',
        lines: [
          'They tell us, sir, that we are weak; unable to cope with so formidable an adversary. But when shall we be stronger? Will it be the next week, or the next year? Will it be when we are totally disarmed, and when a British guard shall be stationed in every house? Three millions of people, armed in the holy cause of liberty, and in such a country as that which we possess, are invincible by any force which our enemy can send against us.',
          'Gentlemen may cry, Peace, Peace — but there is no peace. The war is actually begun! The next gale that sweeps from the north will bring to our ears the clash of resounding arms! Our brethren are already in the field! Why stand we here idle? What is it that gentlemen wish? What would they have? Is life so dear, or peace so sweet, as to be purchased at the price of chains and slavery? Forbid it, Almighty God! I know not what course others may take; but as for me, give me liberty or give me death!'
        ],
        note: 'Henry argues almost entirely in questions — seven of them here — and each one leaves his listeners less room to stand in. The second paragraph switches tactics: short exclamations pile up like drumbeats, then the sentences suddenly stretch out again for the gale sweeping from the north. The famous last line is the only clause in the passage with nothing hedged onto the end of it, which is exactly why it stops the speech dead.',
        hard: [
          { w: 'formidable', say: 'FOR-mid-uh-bul', def: 'frighteningly powerful' },
          { w: 'adversary', say: 'AD-ver-sair-ee', def: 'an opponent or enemy' },
          { w: 'invincible', say: 'in-VIN-suh-bul', def: 'impossible to defeat' },
          { w: 'brethren', say: 'BRETH-run', def: 'brothers; fellow members of a group' },
          { w: 'resounding', say: 'rih-ZOWN-ding', def: 'ringing loudly; echoing' }
        ]
      },
      {
        t: 'And ain’t I a woman?',
        th: 'fire', a: 'Sojourner Truth (c. 1797–1883)', src: 'Women’s Rights Convention, Akron, Ohio — as recorded by Frances Gage', y: '29 May 1851', kind: 'prose',
        lines: [
          'That man over there says that women need to be helped into carriages, and lifted over ditches, and to have the best place everywhere. Nobody ever helps me into carriages, or over mud-puddles, or gives me any best place! And ain’t I a woman? Look at me! Look at my arm! I have ploughed and planted, and gathered into barns, and no man could head me! And ain’t I a woman? I could work as much and eat as much as a man — when I could get it — and bear the lash as well! And ain’t I a woman? I have borne thirteen children, and seen them most all sold off to slavery, and when I cried out with my mother’s grief, none but Jesus heard me! And ain’t I a woman?'
        ],
        note: 'The whole speech is one question asked four times, and it gets heavier each time because of what she stacks in front of it: first a carriage door, then a ploughed field, then thirteen children sold away. Truth never argues the point — she simply presents evidence and lets the refrain do the arguing. Notice too that the sentences before each refrain get longer and longer, so the four-word question keeps landing in more and more silence.',
        hard: [
          { w: 'carriages', say: 'KAIR-ih-jiz', def: 'wheeled vehicles pulled by horses' },
          { w: 'ploughed', say: 'PLOWD', def: 'turned over soil for planting' },
          { w: 'slavery', say: 'SLAY-vuh-ree', def: 'the practice of owning people as property' },
          { w: 'grief', say: 'GREEF', def: 'deep sorrow, especially over a loss' }
        ]
      },
      {
        t: 'What is the use of a book, without pictures or conversations?',
        th: 'flower', a: 'Lewis Carroll (1832–1898)', src: 'Alice’s Adventures in Wonderland, Chapter I', y: '1865', kind: 'prose',
        lines: [
          'Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it, “and what is the use of a book,” thought Alice, “without pictures or conversations?”',
          'So she was considering in her own mind (as well as she could, for the hot day made her feel very sleepy and stupid) whether the pleasure of making a daisy-chain would be worth the trouble of getting up and picking the daisies, when suddenly a White Rabbit with pink eyes ran close by her.'
        ],
        note: 'Carroll opens with boredom on purpose, and he writes it into the shape of the sentences: both paragraphs sag along through clause after clause with nothing happening. The second one even wanders off into a bracket in the middle of itself, exactly the way a drowsy mind wanders. All of that delay exists so the final clause can cut straight across it — the Rabbit arrives in ten quick words after a hundred slow ones, and the book finally has a picture in it.',
        hard: [
          { w: 'conversations', say: 'kon-ver-SAY-shunz', def: 'talks between people' },
          { w: 'considering', say: 'kun-SID-er-ing', def: 'thinking something over carefully' },
          { w: 'pleasure', say: 'PLEZH-er', def: 'a feeling of enjoyment' },
          { w: 'suddenly', say: 'SUD-un-lee', def: 'quickly and without warning' }
        ]
      },
    ]
  }
};
