/* Bizzing Bee — SAGA SCRIPT · "Bizzy and the Great Unspelling"
   Act I complete; Acts II–VI ship with their stages.
   Line format: [speakerId, "line", "audioKey"] — audioKey maps to voice/d/<key>.mp3.
   Speakers map to the saga cast (see CLAUDE-DESIGN-BRIEF-SAGA.md §8 casting). */
window.SB_SAGA_SCRIPT = {
  ch1: { title:'Escape from the Meadow of Challenges', world:'meadow',
    intro:[
      ['narrator','The Meadow of Challenges woke up wrong that morning. Every flower wore a name-tag — and every name-tag had gone blank, wiped clean like a chalkboard in the night.','c1-n1'],
      ['bizzy','Rose? Daisy? Buttercup? Come on, you know your own names! Why are your tags empty?','c1-b1'],
      ['smudge','Namesss... sweet namesss... we eat them one letter at a time, little bee. Soon there will be nothing left to call anything.','c1-s1'],
      ['narrator','A shadow of grey moths poured over the petals, and wherever they touched, the color drained away to dust.','c1-n1b'],
      ['bizzy','Not today, moths. I have known these flowers my whole life. If they can’t remember their names — then I’ll spell them back myself, one petal at a time!','c1-b2']],
    win:[
      ['bizzy','Look! Where I spell the name, the color rushes back — pink into the rose, gold into the buttercup! Words... words are the cure!','c1-b3'],
      ['narrator','And that is how a small bee found the oldest magic there is: a thing you can spell is a thing the dark can never fully take. She turned toward the Hive, and did not look back.','c1-n2']],
    lose:[['bizzy','Too many moths, too fast! Okay. Breathe, Bizzy. One word at a time. Ready — again!','c1-b4']] },
  ch2: { title:'The Long Sky', world:'sky',
    intro:[
      ['narrator','The meadow was lost behind her. Ahead lay the Long Sky — and in it, a cloud of grey moths gathered itself into an enormous, grinning face.','c2-n1'],
      ['bumble','HELP! HELP! My wings — they forgot the word for FLAP! I’m going to fall!','c2-bu1'],
      ['bizzy','Grab on! I’ve got you — F, L, A, P — there! Now beat them like you mean it!','c2-b1'],
      ['bumble','You... you SPELLED my wings back?! They work! Who ARE you?','c2-bu2'],
      ['bizzy','I’m Bizzy. Land on those honey pots with me — we’ll refuel, and we’ll outfly this thing together.','c2-b2']],
    win:[
      ['bumble','Ten pots, all cleared! And look behind us — the Smudge is shrinking! Bizzy, whatever this is you do... I’m with you. All the way to the end.','c2-bu3'],
      ['narrator','And so the crew began with two: one bee who could spell the world back together, and one who would never, ever let go.','c2-n2']],
    lose:[['bumble','Down but not out! One more run — the honey pots are still glowing!','c2-bu4']] },
  ch3: { title:'The Elders’ Test: Bee Grand Prix', world:'hive',
    intro:[
      ['queen','A child arrives at my gates claiming the meadow fell to a word-eater. The Hive is old, and careful. We do not march on a child’s say-so.','c3-q1'],
      ['waggle','No offense, kid — but if you want the Hive’s wings behind you, you outfly its three fastest fliers. Them’s the rules, always been.','c3-w1'],
      ['drone','Three laps. No stingers, no tricks. First bee across the honeycomb line takes it. Try to keep up, meadow-kid.','c3-d1'],
      ['bizzy','Then watch closely, champions. Because I don’t fly on wings alone — I fly on words.','c3-b1']],
    win:[
      ['waggle','She BOOSTED past me spelling THOROUGH — in mid-air! I’ve never even spelled thorough standing still on the GROUND!','c3-w2'],
      ['drone','I don’t follow children. But I follow champions anywhere. Point the way, champion — the Hive’s wings are yours.','c3-d2']],
    lose:[['waggle','Close one! Rematch — and this time bank your boosts early, before the final straight!','c3-w3']] },
  ch4: { title:'The Queen’s Riddle', world:'hive',
    intro:[
      ['queen','Fast wings are common, little one. Now show me a deep mind. Here is my riddle, old as the Hive itself: one long word holds a hundred smaller ones inside it. Find them. Prove it.','c4-q1'],
      ['bizzy','THUNDERSTORM... alright. There’s STORM. There’s THUNDER. There’s HUNT, and RUST, and... oh, there are SO many hiding in here. Watch me work, Your Majesty.','c4-b1']],
    win:[
      ['queen','Twenty words, all drawn from one. You see what most are too hurried to look for. The Hive is yours, Bizzy of the Meadow — and so is my warning: the hornet you now chase was once one of us.','c4-q2'],
      ['bizzy','...Wait. He was a BEE? The thing eating the world was one of YOURS?','c4-b2']],
    lose:[['queen','Eighteen. So very close. Look again, child — the small words hide inside the big one like bees asleep in a hive.','c4-q3']] },
  ch5: { title:'Whack-the-Moths', world:'hive',
    intro:[
      ['bumble','Bizzy! BIZZY! The nursery — the Smudge’s moths broke into the NURSERY!','c5-bu1'],
      ['narrator','In the warm gold heart of the Hive, rows of tiny cradles held the newest bees — and grey moths were slipping toward their very first words.','c5-n0'],
      ['bizzy','They’re after the babies’ first words — the ones you never forget. Grab a soft mallet — and bop them in SPELLING ORDER, or they just crawl right back!','c5-b1']],
    win:[
      ['bumble','Last moth — BOPPED! Every cradle safe, every first word tucked back in. You did it, Bizzy.','c5-bu2'],
      ['narrator','But high in the dark above the nursery, the scattered moths drew together once more into a face. And this time, the face was smiling.','c5-n1']],
    lose:[['bizzy','They’re quick! Keep your eyes on the word — whack the letters in order, and don’t let one slip past!','c5-b2']] },
  ch6: { title:'BOSS: The Smudge', world:'hive',
    intro:[
      ['smudge','LITTLE BEE. Give usss the wordsss and we may let you keep your own name. The Massster is hungry, and you are ssso very small.','c6-s1'],
      ['bizzy','Small? I’m exactly the size of every word I know — and I know a LOT of them. SHIELDS UP! Spell with me, everyone!','c6-b1']],
    mid:[['smudge','He knowsss your name, little bee. Far away, he is already learning to sssay it... backwardsss.','c6-s2']],
    win:[
      ['sting','Hold your fire! ...The name’s Sting. Wasp Corps — his, until about a minute ago. I watched you fight for words that weren’t even yours to save. That’s the first side worth defecting to.','c6-st1'],
      ['bizzy','Then welcome to the crew, Sting. First rule, and it’s the only one that matters: nobody fights alone.','c6-b2'],
      ['narrator','One world saved. Fourteen more slowly greying. And far, far away, a hornet in gold pinstripes opened a great ledger, dipped his pen, and calmly crossed out the word MEADOW.','c6-n1']],
    lose:[['bizzy','The shield broke... but shields can always be rebuilt. Letter by letter, together. Again!','c6-b3']] }
  ,ch7: { title:'The Show Must Go On', world:'stage',
    intro:[
      ['narrator','Stage World. One hour to curtain — and the marquee letters were going out one by one.','c7-n1'],
      ['melody','My sheet music! The notes are fine but the WORDS are fading — I can\u2019t remember my own opening line!','c7-m1'],
      ['maestro','Sixty years of showbusiness. Fires. Floods. A juggling accident. But never... blank pages.','c7-ma1'],
      ['bizzy','Then tonight\u2019s show has a new opening act. Light the stage tiles, Maestro — I\u2019ll spell your words back from memory.','c7-b1']],
    win:[
      ['melody','You remembered my whole song better than I did! The marquee — look — it\u2019s BLAZING again!','c7-m2'],
      ['maestro','Kid, in this business we follow the star. And tonight, that\u2019s you. The Stage marches with the Hive!','c7-ma2']],
    lose:[['maestro','A stumble on opening night? Happens to legends. From the top!','c7-ma3']] },
  ch8: { title:'The Scrambled Constellations', world:'cosmos',
    intro:[
      ['narrator','Above Stage World, the night sky had gone... wrong. The constellations spelled nonsense.','c8-n1'],
      ['astro','Mission log: the stars are all THERE — but somebody shuffled them. The Great Bear now spells B-R-G-E-A-T-A-E.','c8-a1'],
      ['zib','On my planet we have a word for this. Actually we HAD a word for it. It got scrambled too.','c8-z1'],
      ['bizzy','Then let\u2019s put the sky back in order. Star by star, letter by letter.','c8-b1']],
    win:[
      ['comet','Twelve constellations re-spelled! Navigation is BACK, baby!','c8-c1'],
      ['astro','The Cosmos crew flies with you, Bizzy. And... we saw something out there. A shadow with a ledger, crossing out stars. He\u2019s heading for the Arcade.','c8-a2']],
    lose:[['zib','The sky is patient. It waited a billion years — it can wait one more try.','c8-z2']] },
  ch9: { title:'The Thousand Cuts', world:'dojo',
    intro:[
      ['sensei','So. The bee who spells worlds back together. Show me your focus, little one.','c9-se1'],
      ['ninja','Letters will fly. Most are wrong. Some are traps. Strike ONLY what the word needs.','c9-ni1'],
      ['bizzy','A true speller strikes only the right letter. I\u2019m ready, Sensei.','c9-b1']],
    win:[
      ['sensei','Clean cuts. Calm mind. The Dojo stands with the Hive — and Bizzy... when the dark night comes, remember: you fight the Unspelling. Not the unspelled.','c9-se2'],
      ['ninja','...He only says that to students he believes in.','c9-ni2']],
    lose:[['sensei','A slip is a lesson wearing a disguise. Breathe. Again.','c9-se3']] },
  ch10: { title:'The Falling Formula', world:'lab',
    intro:[
      ['beaker','EMERGENCY! The Great Fizz is going FLAT! Every formula needs words and the words are raining down in PIECES!','c10-be1'],
      ['brainiac','Hypothesis: catch the falling letters, assemble true words, restore the reaction. Confidence: 94.2 percent.','c10-br1'],
      ['bizzy','And the other 5.8 percent?','c10-b1'],
      ['brainiac','We get very, very sticky.','c10-br2']],
    win:[
      ['beaker','THE FIZZ! IT FIZZES! You beautiful spelling genius!','c10-be2'],
      ['brainiac','Recalculating confidence in this crew: one hundred percent. The Lab is yours.','c10-br3']],
    lose:[['beaker','Sticky! SO sticky! Okay okay — new batch, new try!','c10-be3']] },
  ch11: { title:'The Hungry Garden', world:'critter',
    intro:[
      ['zoomies','BIZZY BIZZY BIZZY the pond words got scattered like seeds and the garden snake is TOO POLITE to eat them in the wrong order!','c11-zo1'],
      ['capy','...She means: guide the snake. Letters, in order. No pressure.','c11-ca1'],
      ['bizzy','A snake that spells. This is officially the best crew ever assembled.','c11-b1']],
    win:[
      ['zoomies','THE GARDEN GREW BACK! FLOWERS! EVERYWHERE! I\u2019M SO HAPPY I COULD ZOOM!','c11-zo2'],
      ['capy','The Critters are in. Slowly. But in.','c11-ca2']],
    lose:[['capy','The snake forgives you. The snake forgives everyone. Again?','c11-ca3']] },
  ch12: { title:'BOSS: Glitch\u2019s Betrayal', world:'arcade',
    intro:[
      ['pixel','Welcome to the Arcade! Cabinets a little dim lately but— wait. Why is the boss music playing?','c12-p1'],
      ['glitch','Sorry, Pixel. The hornet made an offer. Infinite lives. INFINITE. You\u2019d have taken it too.','c12-g1'],
      ['bizzy','Glitch — he\u2019s not giving you lives. He\u2019s taking everyone else\u2019s!','c12-b1'],
      ['glitch','...Then I guess I\u2019m the final boss now. INSERT COIN, little bee.','c12-g2']],
    mid:[['glitch','Why. Won\u2019t. You. MISS!','c12-g3']],
    win:[
      ['glitch','This isn\u2019t over. The Master Token is his now — and the Engine is nearly fed. See you in the endgame, heroes.','c12-g4'],
      ['joystick','He took the Arcade\u2019s heart... Pixel, we\u2019re going with them. All the way to the end.','c12-j1'],
      ['vex','(from everywhere and nowhere) Did you feel that, little bee? That was a friend choosing me. There are always more doors than guards.','c12-v1'],
      ['narrator','And for the first time, the crew understood: Vex wasn\u2019t just eating words. He was building an army.','c12-n1']],
    lose:[['pixel','He\u2019s glitching the hitboxes! Reset and re-type — we\u2019ve got infinite continues where it counts: heart!','c12-p2']] }

};
