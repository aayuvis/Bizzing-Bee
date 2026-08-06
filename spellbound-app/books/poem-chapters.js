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
        a: 'William Shakespeare (1564–1616)', src: 'Hamlet, Act III, Scene 1', y: 'c. 1600', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'The Merchant of Venice, Act III, Scene 1', y: 'c. 1597', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'The Merchant of Venice, Act IV, Scene 1', y: 'c. 1597', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'Macbeth, Act V, Scene 5', y: 'c. 1606', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'As You Like It, Act II, Scene 7', y: 'c. 1599', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'The Tempest, Act IV, Scene 1', y: 'c. 1611', kind: 'speech',
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
        a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
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
        a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
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
        a: 'William Shakespeare (1564–1616)', src: 'Sonnets', y: '1609', kind: 'sonnet',
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
        t: 'Ozymandias',
        a: 'Percy Bysshe Shelley (1792–1822)', src: 'The Examiner', y: '1818', kind: 'sonnet',
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
        a: 'John Donne (1572–1631)', src: 'Holy Sonnets', y: '1633', kind: 'sonnet',
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
        a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'sonnet',
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
          { w: 'wreathed', say: 'REEṭHD', def: 'twisted or coiled into a ring' }
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
        t: 'The old pond', a: 'Matsuo Bashō (1644–1694)', src: 'Haru no Hi', y: '1686', kind: 'haiku',
        lines: ['furuike ya', 'kawazu tobikomu', 'mizu no oto', '', 'The old pond —', 'a frog jumps in:', 'the sound of water.'],
        note: 'The most famous poem in Japanese. Nothing happens except a sound, and the whole art is in the silence you are made to notice before it.',
        hard: [{ w: 'tranquil', say: 'TRANG-kwil', def: 'free from disturbance; calm' }]
      },
      {
        t: 'On a bare branch', a: 'Matsuo Bashō (1644–1694)', src: 'Azuma Nikki', y: '1680', kind: 'haiku',
        lines: ['kare eda ni', 'karasu no tomarikeri', 'aki no kure', '', 'On a bare branch', 'a crow has settled —', 'autumn dusk.'],
        note: 'Three things and no verb of feeling. The poem trusts the crow, the branch and the failing light to do all of it.',
        hard: [{ w: 'desolate', say: 'DESS-uh-luht', def: 'bleak and empty; deserted' }]
      },
      {
        t: 'The summer grasses', a: 'Matsuo Bashō (1644–1694)', src: 'Oku no Hosomichi', y: '1689', kind: 'haiku',
        lines: ['natsukusa ya', 'tsuwamono domo ga', 'yume no ato', '', 'Summer grasses —', 'all that remains', 'of warriors’ dreams.'],
        note: 'Written at a battlefield where an army was destroyed five hundred years earlier. Grass, and the word "remains", and he never mentions a single body.',
        hard: [{ w: 'vestige', say: 'VESS-tij', def: 'a trace of something that no longer exists' }]
      },
      {
        t: 'A world of dew', a: 'Kobayashi Issa (1763–1828)', src: 'Ora ga Haru', y: '1819', kind: 'haiku',
        lines: ['tsuyu no yo wa', 'tsuyu no yo nagara', 'sarinagara', '', 'This world of dew', 'is a world of dew —', 'and yet, and yet.'],
        note: 'Issa wrote it after his daughter died. The Buddhist teaching says the world is passing, like dew; he agrees with the teaching and refuses it in the same breath. "Sarinagara" is the sound of a man who knows better and cannot help it.',
        hard: [{ w: 'transient', say: 'TRAN-zee-uhnt', def: 'lasting only a short time' }]
      },
      {
        t: 'The snail', a: 'Kobayashi Issa (1763–1828)', src: 'Collected haiku', y: 'c. 1810', kind: 'haiku',
        lines: ['katatsumuri', 'soro soro nobore', 'fuji no yama', '', 'O snail,', 'climb Mount Fuji —', 'but slowly, slowly.'],
        note: 'The kindest poem about ambition ever written, and the only advice most people need.',
        hard: [{ w: 'ascend', say: 'uh-SEND', def: 'to go up or climb' }]
      },
      {
        t: 'The lightning flash', a: 'Yosa Buson (1716–1784)', src: 'Collected haiku', y: 'c. 1770', kind: 'haiku',
        lines: ['inazuma ya', 'nami moteyueru', 'akitsushima', '', 'Lightning —', 'and the waves are wreathed', 'around the islands.'],
        note: 'Buson painted as well as wrote, and it shows: the flash is a light source, and the poem is composed the way a picture is.',
        hard: [{ w: 'archipelago', say: 'ar-kih-PEL-uh-goh', def: 'a group or chain of islands' }]
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
        a: 'Robert Frost (1874–1963)', src: 'Mountain Interval', y: '1916', kind: 'poem',
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
        a: 'Robert Frost (1874–1963)', src: 'New Hampshire', y: '1923', kind: 'poem',
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
        a: 'William Ernest Henley (1849–1903)', src: 'Book of Verses', y: '1888', kind: 'poem',
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
        a: 'Rudyard Kipling (1865–1936)', src: 'Rewards and Fairies', y: '1910', kind: 'poem',
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
        a: 'William Blake (1757–1827)', src: 'Songs of Experience', y: '1794', kind: 'poem',
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
        a: 'Emily Dickinson (1830–1886)', src: 'Poems', y: 'c. 1861', kind: 'poem',
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
        a: 'William Wordsworth (1770–1850)', src: 'Poems, in Two Volumes', y: '1807', kind: 'poem',
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
        a: 'Langston Hughes (1901–1967)', src: 'The Weary Blues era', y: '1922', kind: 'poem',
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
        a: 'W. B. Yeats (1865–1939)', src: 'The Rose', y: '1893', kind: 'poem',
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
        a: 'Christina Rossetti (1830–1894)', src: 'Goblin Market and Other Poems', y: '1862', kind: 'sonnet',
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
        a: 'Walt Whitman (1819–1892)', src: 'Sequel to Drum-Taps', y: '1865', kind: 'poem',
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
        a: 'Abraham Lincoln (1809–1865)', src: 'Soldiers’ National Cemetery, Pennsylvania', y: '19 November 1863', kind: 'prose',
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
        a: 'Charles Dickens (1812–1870)', src: 'A Tale of Two Cities, opening', y: '1859', kind: 'prose',
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
        a: 'Jane Austen (1775–1817)', src: 'Pride and Prejudice, opening', y: '1813', kind: 'prose',
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
        a: 'Herman Melville (1819–1891)', src: 'Moby-Dick, opening', y: '1851', kind: 'prose',
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
        a: 'Henry David Thoreau (1817–1862)', src: 'Walden', y: '1854', kind: 'prose',
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
      }
    ]
  }
};
