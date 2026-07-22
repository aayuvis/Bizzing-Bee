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
  ,chSnake: { title:'Word Snake: Trail of Letters', world:'meadow',
    intro:[
      ['narrator','With the Hive gates held, Bizzy slipped back to the meadow to check on the flowers — and found the moths had a cruel new trick.','cs-n1'],
      ['bumble','Bizzy, look! The letters are all still here… but they’re scattered across the grass, every word shaken apart like beads off a broken string!','cs-bu1'],
      ['bizzy','Then we gather them the way you cross a stream — one stone at a time, in the right order. Follow my tail, Bumble. I’ll swallow each word letter by letter until my trail spells it whole.','cs-b1']],
    win:[
      ['bizzy','Every word back in its right order — and look how LONG our little swarm grew! The meadow can spell itself again.','cs-b2'],
      ['bumble','A snake made of letters and bees. Only you, Bizzy. Only you.','cs-bu2']],
    lose:[['bizzy','Tangled up in my own trail — ha! Happens to the best of us. Shake it off, line the letters up, and off we go again!','cs-b3']] }
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

  /* ================= ACT II · The Show Must Go On ================= */
  ,chRhythm: { title:'Rhythm of the Footlights', world:'stage',
    intro:[
      ['melody','The marquee is lit again — but listen. The orchestra pit... the notes are coming up in the wrong ORDER. The whole overture is scrambled!','cry-m1'],
      ['maestro','Sixty years I have conducted this pit. A show is just spelling you can dance to, kid — every note lands on its own beat, or the whole song falls apart.','cry-ma1'],
      ['bizzy','Then hand me the baton, Maestro. I’ll catch every letter right on the downbeat — D, F, J, K, and don’t you dare rush me.','cry-b1']],
    win:[
      ['maestro','On beat. On key. On SPELLING. In sixty years I have seen exactly one performance like that — and I’m looking at her.','cry-ma2'],
      ['melody','The overture’s back! Every word right where the music wants it. Encore! ENCORE!','cry-m2']],
    lose:[['maestro','You rushed the tempo, kid. Even the best do. Deep breath — and a-one, a-two...','cry-ma3']] },
  chCarnival: { title:'The Carnival of Lost Letters', world:'carnival',
    intro:[
      ['narrator','Behind the theatre, the carnival was still turning — but the prize booths had gone quiet. Every teddy bear’s name tag, every popcorn sign: blank.','cca-n1'],
      ['melody','The Smudge shook the ferris wheel and all the letters spilled out of the signs! They’re raining down over the midway!','cca-m1'],
      ['bizzy','Then grab me that prize basket — the big one. If the carnival’s letters are falling, I’m catching every single one in order. Step right up!','cca-b1']],
    win:[
      ['melody','She caught the whole midway! The signs are re-lighting — POPCORN, PRIZES, CAROUSEL — it all spells again!','cca-m2'],
      ['narrator','And the carnival turned bright once more, its every bulb a letter, its every letter safely home.','cca-n2']],
    lose:[['melody','The letters bounce right out if they’re not in order! Eyes up, basket ready — again!','cca-m3']] },
  chWings: { title:'Echoes in the Wings', world:'stage',
    intro:[
      ['narrator','Deep backstage, past the ropes and pulleys, the Unspelling had pooled like spilled grey paint. Old posters. Old programs. Sixty years of showbills — fading.','cw-n1'],
      ['maestro','My whole career is on these walls, kid. Every show I ever ran. I can’t... I can’t read a single title anymore.','cw-ma1'],
      ['bizzy','Then we’ll spell them back, Maestro. One title at a time — and the colour will follow. It always follows.','cw-b1']],
    win:[
      ['maestro','...There it is. Opening night, 1962. I’d forgotten the NAME of the show that started it all. You gave me back my whole life in letters, kid.','cw-ma2'],
      ['melody','Look at the wings — gold and crimson again! The whole backstage remembers itself!','cw-m2']],
    lose:[['maestro','The grey is stubborn back here. So are we. Once more, from the top of the bill.','cw-ma3']] },
  chConductor: { title:'BOSS: The Phantom Conductor', world:'stage',
    intro:[
      ['narrator','On opening night, the house lights died. In the conductor’s spotlight stood a figure of grey moths in a long tailcoat — swinging a baton of smoke.','cpc-n1'],
      ['smudge','Every ssshow needsss a conductor, little bee. Tonight the orchestra playsss... sssilence.','cpc-s1'],
      ['melody','It’s stealing the words right out of the songs — the whole audience is forgetting the show!','cpc-m1'],
      ['bizzy','Not this stage. Not this show. Shields up, everyone — the only thing going dark tonight is THAT costume. Places!','cpc-b1']],
    win:[
      ['smudge','The Massster will hear of thisss... he isss already lissstening...','cpc-s2'],
      ['maestro','It dropped the baton! The pit’s playing, the marquee’s blazing — THAT, kid, is what we call bringing down the house.','cpc-ma1'],
      ['narrator','And as the applause shook the rafters, the Stage was safe. But far above the spotlights, one grey moth slipped away — carrying a single stolen word toward the stars.','cpc-n2']],
    lose:[['melody','The song’s not over till WE say it’s over! Rebuild the shield — the show must go on!','cpc-m2']] },

  /* ================= ACT III · The Scrambled Sky ================= */
  chConnect: { title:'Draw the Constellations', world:'cosmos',
    intro:[
      ['astro','Mission log, day two: re-spelling the constellations worked — but the star-lines between them are still down. The sky’s all dots and no pictures.','ccn-a1'],
      ['zib','On my planet we draw the sky fresh every night. You just need to know which star comes next. And which ones are... how do you say... imposters.','ccn-z1'],
      ['bizzy','Letter by letter, star by star. Say the word, Astro — I’ll draw it across the whole sky.','ccn-b1']],
    win:[
      ['comet','The Great Bee Constellation is BACK ON THE MAP! Ha! Navigators everywhere just cheered and they don’t even know why!','ccn-c1'],
      ['zib','You connect stars like a native. On my planet, that is the highest compliment. On this one too, probably.','ccn-z2']],
    lose:[['astro','Careful — some of those stars are decoys the Unspelling hung up there. Listen to the word, then connect. Again!','ccn-a2']] },
  chComet: { title:'Comet Chase', world:'cosmos',
    intro:[
      ['comet','Okay okay okay — I lost my TAIL. A comet without a tail is just a sad space rock. It came apart somewhere over the nebula — in PIECES!','cco-c1'],
      ['astro','Tracking the pieces now: they’re drifting through the gap-fields. Somebody has to fly the gaps and gather them up.','cco-a1'],
      ['bizzy','A bee CAN fly in space — if a friend believes hard enough and the words hold. Hang on, Comet. I’m bringing your sparkle home.','cco-b1']],
    win:[
      ['comet','MY TAIL! IT’S BACK! And it’s got MORE glitter than before! Bizzy, you’re officially my favourite non-comet in the universe!','cco-c2'],
      ['astro','Trajectory restored. Next stop on the star-map... wait. The map shows something big coiled around the last constellation. Something hungry.','cco-a2']],
    lose:[['comet','My pieces! Careful with the — okay it’s fine, it’s FINE, comets bounce. Let’s loop back and try again!','cco-c3']] },
  chNebula: { title:'The Nebula Riddle', world:'cosmos',
    intro:[
      ['zib','This nebula is a word-cloud. Literally. One enormous word, thirteen letters long, holding a hundred little words inside it like stars inside a galaxy.','cnb-z1'],
      ['astro','CONSTELLATION. If we can pull enough small words out of it, the nebula re-ignites and lights the whole sector.','cnb-a1'],
      ['bizzy','A word made of words made of stars. This is the most beautiful homework I have ever been assigned. Let’s dig in.','cnb-b1']],
    win:[
      ['zib','The nebula is BLAZING. Every little word you found is a newborn star. You just... populated a galaxy. Casually.','cnb-z2'],
      ['astro','Sector lit. And Bizzy — the light reached the far edge. We can finally see what’s been eating the stars out there. You should look. Now.','cnb-a2']],
    lose:[['zib','The nebula dims... but it is patient. Stars take their time being born. Look deeper — the little words are in there.','cnb-z3']] },
  chSerpent: { title:'BOSS: The Star Serpent', world:'cosmos',
    intro:[
      ['narrator','It uncoiled from between the constellations — a serpent of un-named stars, swallowing letters wherever the sky still spelled.','csp-n1'],
      ['astro','It’s eating the alphabet out of the SKY. If it finishes, no star will ever have a name again.','csp-a1'],
      ['bizzy','Then we don’t outfight it — we out-SPELL it. If it wants to be made of letters so badly, I’ll ride it myself and put every letter back in order. Tail on, everyone!','csp-b1']],
    win:[
      ['comet','She RODE the star snake! She rode it and it SPELLED THINGS! I’m never getting over this! EVER!','csp-c1'],
      ['astro','The serpent’s calm now — it was just words with nowhere to go. The whole sky’s spelled true, crew. Cosmos secure.','csp-a2'],
      ['narrator','And the serpent of stars curled itself into a new constellation — one that, from that night on, every sailor called The Speller.','csp-n2']],
    lose:[['astro','It’s shedding scrambled stars everywhere — don’t chase your own tail! Steady. Order. Again!','csp-a3']] },

  /* ================= ACT IV · Into the Wilds ================= */
  chPond: { title:'The Pond of Patience', world:'pond',
    intro:[
      ['capy','Welcome to the pond. The dew here holds words. Every morning they rise off the water... and lately, they fall back down scattered.','cpd-ca1'],
      ['zoomies','I TRIED to catch them but I catch EVERYTHING AT ONCE and that is apparently NOT how spelling works!','cpd-zo1'],
      ['bizzy','It’s not how fast you catch, Zoomies — it’s catching the RIGHT drop at the right time. Watch. Patience is just spelling in slow motion.','cpd-b1']],
    win:[
      ['capy','...Every drop, in order, without one splash wasted. The pond remembers its words now. Stay for tea sometime. We have excellent reeds.','cpd-ca2'],
      ['zoomies','I SAT STILL FOR THREE WHOLE MINUTES AND IT WORKED! Capy, did you SEE me being patient?! DID YOU SEE IT?!','cpd-zo2']],
    lose:[['capy','The pond forgives a splash. The pond forgives everything. Breathe with the water... and again.','cpd-ca3']] },
  chLotus: { title:'The Lotus Riddle', world:'lotus',
    intro:[
      ['sensei','Before you leave the wilds, one last lesson. This lotus blooms once a season — and this season, it bloomed grey.','clt-se1'],
      ['ninja','Inside its name hide many smaller names. Sensei says: find them, and each one becomes a petal of colour.','clt-ni1'],
      ['bizzy','DRAGONFLIES... there’s a whole pond of words sleeping in there. Alright, lotus — let’s wake you up petal by petal.','clt-b1']],
    win:[
      ['sensei','The lotus blooms in colour once more. You did not force it open — you invited it, word by word. That is mastery, little speller.','clt-se2'],
      ['ninja','...He’s crying. He does that when students graduate. Don’t look. It embarrasses him.','clt-ni2']],
    lose:[['sensei','The lotus closed again? Then it was not yet convinced. Small words first. Convince it. Again.','clt-se3']] },

  /* ================= ACT V · The Arcade’s Heart ================= */
  chCoin: { title:'Insert Coin: The Maze Cabinet', world:'arcade',
    intro:[
      ['pixel','Welcome BACK to the Arcade! Uh — ignore the flickering. And the buzzing. And the cabinet in the corner that’s been eating everyone’s tokens.','cac-p1'],
      ['joystick','That’s the old Maze Cabinet. Glitch rigged it before he... before what happened. The nectar dots inside are real words — and the moths in there are FAST.','cac-j1'],
      ['bizzy','A maze full of words with a high score on the line? Pixel, my friend... insert coin.','cac-b1']],
    win:[
      ['pixel','NEW HIGH SCORE! Three letters: B-E-E! The cabinet’s glowing gold again — you literally debugged it by SPELLING!','cac-p2'],
      ['joystick','One cabinet down. But the deeper rooms are worse, Bizzy. Glitch knows you’re here now.','cac-j2']],
    lose:[['pixel','GAME OVER — but this machine takes friendship instead of quarters! Continue? Continue!','cac-p3']] },
  chCircuit: { title:'Circuit Sprint', world:'arcade',
    intro:[
      ['joystick','The service tunnels between cabinets — Glitch turned them into his private racetrack. Winner takes the access codes to the Firewall.','ccr-j1'],
      ['glitch','Race YOU? Ha! My track, my rules, my oil slicks. But sure, little bee — losers do love trying.','ccr-g1'],
      ['bizzy','Funny thing about your rules, Glitch: they’re all spelled. And spelling is MY racetrack. Grid up.','ccr-b1']],
    win:[
      ['glitch','...Nobody beats me on my own track. Nobody. Who ARE you people?!','ccr-g2'],
      ['joystick','Access codes: OURS. The Firewall’s next, crew — and Glitch just learned your name, Bizzy. He won’t forget it.','ccr-j2']],
    lose:[['joystick','He greased the last corner — of COURSE he did. Rev up, spell early, and take the rematch!','ccr-j3']] },
  chFirewall: { title:'The Firewall', world:'arcade',
    intro:[
      ['pixel','This is it — the Firewall. The Arcade’s heart is behind it. Glitch flooded the approach with corrupted sprites: they descend, they crash, they DELETE.','cfw-p1'],
      ['joystick','Only one thing zaps a corrupted word: the same word, spelled TRUE. Your stinger’s a laser now, kid. Aim with your letters.','cfw-j1'],
      ['bizzy','Words coming down, words going up. Feels fair. Lock the shield, warm the cannon — let’s go full arcade.','cfw-b1']],
    win:[
      ['pixel','FIREWALL HOLDING! Every sprite un-corrupted! You type like you’ve got eight arms and I am SO here for it!','cfw-p2'],
      ['joystick','The heart chamber’s open. Whatever Glitch is guarding in there... we end this tonight.','cfw-j2']],
    lose:[['pixel','Shield down but not OUT — reroute, respell, re-EVERYTHING! One more wave!','cfw-p3']] },
  chStatic: { title:'Static Storm', world:'arcade',
    intro:[
      ['narrator','Past the Firewall, the Arcade’s heart-room was drowning in static — every screen a blizzard of grey, every word dissolving into noise.','cst-n1'],
      ['joystick','The static’s not weather, Bizzy. It’s HIM — Glitch, pouring the Unspelling straight into the mainframe. The Arcade is forgetting itself.','cst-j1'],
      ['bizzy','Then we remind it. Screen by screen, word by word — colour back into every pixel. Cover me. I’m going in loud.','cst-b1']],
    win:[
      ['pixel','The screens! Look at the screens — every game remembers its name! ATTRACT MODE, BABY! The whole floor is SINGING!','cst-p1'],
      ['narrator','And in the last un-greyed screen, a face of static watched the colour return — and for just one frame, it looked like it missed being on the other side.','cst-n2']],
    lose:[['joystick','The static bites back — shake it off! Every word you land is a pixel saved. Go again!','cst-j2']] },

  /* ================= ACT VI · Homecoming ================= */
  chFlyway: { title:'The Long Flyway Home', world:'flyway',
    intro:[
      ['narrator','It was over. Almost. The crew turned for home along the great flyway — the sky-road every bee knows by heart — and found the waymarker clouds had lost their names too.','cfl-n1'],
      ['bumble','Bizzy... after everything we just did, I could NOT tell you which way is home. The flyway’s blank. All of it.','cfl-bu1'],
      ['bizzy','Then we’ll spell our way home the same way we spelled our way out. One waymarker at a time, crew. Last flight — make it a good one.','cfl-b1']],
    win:[
      ['bumble','There it is. THERE IT IS! The Meadow, the Hive — I can see the whole valley from here, and every bit of it has its name back!','cfl-bu2'],
      ['narrator','And the flyway lit up behind them like a sentence finally finished — every cloud a word, every word pointing home.','cfl-n2']],
    lose:[['bumble','Wrong turn at that grey cloud! It’s okay — home isn’t going anywhere. Again, together!','cfl-bu3']] },
  chComb: { title:'Rebuilding the Comb', world:'homecoming',
    intro:[
      ['queen','You return with an army of friends and a valley of rescued words. But look — the great comb itself still bears the scars. Whole cells, blank.','ccb-q1'],
      ['bizzy','Then here’s my last riddle of the war, Your Majesty. One word — CELEBRATION — and every little word inside it becomes a cell of new wax. We rebuild by spelling.','ccb-b1'],
      ['queen','...She turns even the rebuilding into a game. Very well, child. Show the Hive how it’s done.','ccb-q2']],
    win:[
      ['queen','The comb is whole. More than whole — it is INSCRIBED. Every cell a word, every word a memory of this day. The Hive will read this wall for a hundred years.','ccb-q3'],
      ['bumble','And they’re ALL party words! Look — TEA! TREAT! ELATION! Best. Wall. Ever.','ccb-bu1']],
    lose:[['queen','Almost, little architect. The comb wants more words. It is greedy for them — like someone else I have come to admire. Again.','ccb-q4']] },
  chRespell: { title:'The Great Respelling', world:'homecoming',
    intro:[
      ['narrator','On the last evening, the valley gathered — bees and stage folk and star folk, dojo and lab and pond and arcade — for the Great Respelling.','crs-n1'],
      ['vex','(a whisper on the wind) Enjoy your little festival, bee. Ink fades. Ledgers reopen. And I have SO many pages left.','crs-v1'],
      ['bizzy','I heard that, Vex. Hear THIS: every word we spell tonight is one you can never cross out again. Crew — for everything grey that’s left — SPELL WITH ME!','crs-b1']],
    win:[
      ['narrator','Colour rolled across the valley like sunrise. And when the last word settled, the crew stood together in a world that remembered every one of its names.','crs-n2'],
      ['sting','The ledger’s closed, kid. Not burned — closed. He’ll try again someday. And when he does... he’ll find every one of us still here. Still spelling.','crs-st1'],
      ['bizzy','Let him come. We’ve got the strongest magic there is — and now, so do you. Spell your world bright, friend. See you in the next adventure.','crs-b2']],
    lose:[['bizzy','The grey pushes back hard tonight — it knows it’s the last dance. Everyone, together now — AGAIN!','crs-b3']] },
  chNectar: { title:'Nectar Catch', world:'homecoming',
    intro:[
      ['bumble','Psst. Bizzy. The war’s won, the comb’s rebuilt, the party’s started... so WHY are you still hovering like something’s falling?','cnc-bu1'],
      ['bizzy','Because something IS falling, Bumble — nectar! The flowers are so happy they’re overflowing! Grab a comb — last one to fill theirs does the dishes!','cnc-b1']],
    win:[
      ['bumble','Full comb! FULL COMB! Okay you win, I’ll do the dishes — this ONE time — champion.','cnc-bu2'],
      ['narrator','And so the story rests — a meadow in colour, a hive in song, and one small bee who proved that a thing you can spell is a thing you can always, always bring home.','cnc-n1']],
    lose:[['bumble','Sticky wings! Shake off, sweet tooth — the flowers aren’t done celebrating yet. One more round!','cnc-bu3']] }

};
